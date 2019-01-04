require('dotenv').load();

const Axios = require('axios')
const fs = require('fs')

//de momento está descargando de all

const collections = [{
	name: 'assistant',
	url: 'https://inv-mimir.herokuapp.com/forest/assistant.csv?fields%5Bassistant%5D=EK%2CcreatedAt%2CdeletedAt%2Cid%2Cprofile%2Cuid%2CupdatedAt&fields%5Bprofile%5D=name&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=assistants&header=ek%2Ccreated%20at%2Cdeleted%20at%2Cid%2Cprofile%2Cuid%2Cupdated%20at'
},{
	name: 'client',
	url: 'https://inv-mimir.herokuapp.com/forest/client.csv?fields%5Bclient%5D=assistant%2CcreatedAt%2CdeletedAt%2Cid%2CisPaid%2CisSigned%2Cprofile%2CstripeCustomerId%2Cuid%2CupdatedAt%2CreferralCode&fields%5Bassistant%5D=id&fields%5Bprofile%5D=name&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=clients&header=assistant%2Ccreated%20at%2Cdeleted%20at%2Cid%2Cis%20paid%2Cis%20signed%2Cprofile%2Cstripe%20customer%20id%2Cuid%2Cupdated%20at%2Creferral%20code'
},{
	name: 'qualification',
	url: 'https://inv-mimir.herokuapp.com/forest/qualification.csv?fields%5Bqualification%5D=createdAt%2CdeletedAt%2Cdomain%2Cid%2Cuid%2CupdatedAt&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=qualifications&header=created%20at%2Cdeleted%20at%2Cdomain%2Cid%2Cuid%2Cupdated%20at'
},{
	name: 'user',
	url: 'https://inv-mimir.herokuapp.com/forest/user.csv?fields%5Buser%5D=createdAt%2CdeletedAt%2Cid%2Cprofile%2Cuid%2CupdatedAt&fields%5Bprofile%5D=name&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=users&header=created%20at%2Cdeleted%20at%2Cid%2Cprofile%2Cuid%2Cupdated%20at'
}]

for (const collection of collections) {
	Axios.get(collection.url, {
		responseType:'stream'
	}).then(res => {
		res.data.pipe(fs.createWriteStream(`${process.env.OLDPWD}/csv/${collection.name}.csv`))
	})
}