require('dotenv').config({path: __dirname + '/.env'})

const Axios = require('axios')
const fs = require('fs')
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU1ODM2MzA2NywiZXhwIjoxNTU5NTcyNjY3fQ.Z4ib3RCIOmd3cEh3iAC_j719MJr5RNxuc0OGnQYi-cA'
//de momento está descargando de all

const collections = [{
	name: 'email',
	url: `https://inv-mimir.herokuapp.com/forest/email.csv?fields%5Bemail%5D=BCC%2CCC%2CEK%2CcreatedAt%2CdeletedAt%2Cfrom%2Chtml%2Cid%2Cmessage%2Csubject%2Cto%2Cuid%2CupdatedAt&fields%5Bmessage%5D=id&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=emails&header=bcc%2Ccc%2Cek%2Ccreated%20at%2Cdeleted%20at%2Cfrom%2Chtml%2Cid%2Cmessage%2Csubject%2Cto%2Cuid%2Cupdated%20at`
},{
	name: 'assistant',
	url: `https://inv-mimir.herokuapp.com/forest/assistant.csv?fields%5Bassistant%5D=EK%2CcreatedAt%2CdeletedAt%2Cid%2Cprofile%2Cuid%2CupdatedAt&fields%5Bprofile%5D=name&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=assistants&header=ek%2Ccreated%20at%2Cdeleted%20at%2Cid%2Cprofile%2Cuid%2Cupdated%20at`
},{
	name: 'client',
	url: `https://inv-mimir.herokuapp.com/forest/client.csv?fields%5Bclient%5D=assistant%2CcreatedAt%2CdeletedAt%2Cid%2CisPaid%2CisSigned%2Cprofile%2CstripeCustomerId%2Cuid%2CupdatedAt%2CreferralCode&fields%5Bassistant%5D=id&fields%5Bprofile%5D=name&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=clients&header=assistant%2Ccreated%20at%2Cdeleted%20at%2Cid%2Cis%20paid%2Cis%20signed%2Cprofile%2Cstripe%20customer%20id%2Cuid%2Cupdated%20at%2Creferral%20code`
},{
	name: 'qualification',
	url: `https://inv-mimir.herokuapp.com/forest/qualification.csv?fields%5Bqualification%5D=createdAt%2CdeletedAt%2Cdomain%2Cid%2Cuid%2CupdatedAt&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=qualifications&header=created%20at%2Cdeleted%20at%2Cdomain%2Cid%2Cuid%2Cupdated%20at`
},{
	name: 'user',
	url: `https://inv-mimir.herokuapp.com/forest/user.csv?fields%5Buser%5D=createdAt%2CdeletedAt%2Cid%2Cprofile%2Cuid%2CupdatedAt&fields%5Bprofile%5D=name&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=users&header=created%20at%2Cdeleted%20at%2Cid%2Cprofile%2Cuid%2Cupdated%20at`
},{
	name: 'messages',
	url: `https://inv-mimir.herokuapp.com/forest/message.csv?fields%5Bmessage%5D=assistant%2Cclient%2Ccomment%2CcreatedAt%2CdeletedAt%2Cdirection%2Cemail%2Cid%2Cstatus%2Ctype%2Cuid%2CupdatedAt%2Cuser&fields%5Bassistant%5D=id&fields%5Bclient%5D=id&fields%5Bcomment%5D=id&fields%5Bemail%5D=id&fields%5Buser%5D=id&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=messages&header=assistant%2Cclient%2Ccomment%2Ccreated%20at%2Cdeleted%20at%2Cdirection%2Cemail%2Cid%2Cstatus%2Ctype%2Cuid%2Cupdated%20at%2Cuser`
},{
	name: 'messageToInstance',
	url: `https://inv-mimir.herokuapp.com/forest/_messageToInstance.csv?fields%5B_messageToInstance%5D=createdAt%2CinstanceId%2CmessageId%2Cuid%2CupdatedAt&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=message%20to%20instances&header=created%20at%2Cinstance%20id%2Cmessage%20id%2Cuid%2Cupdated%20at`
}]

for (const collection of collections) {
	Axios.get(collection.url, {
		responseType:'stream'
	}).then(res => {
		res.data.pipe(fs.createWriteStream(`${process.env.LOCATION}/csv/${collection.name}.csv`))
	})
}