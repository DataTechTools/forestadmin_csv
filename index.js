const Axios = require('axios')
const fs = require('fs')

//de momento está descargando de all

const collections = [{
	name: 'email',
	url: 'https://inv-mimir.herokuapp.com/forest/email.csv?fields%5Bemail%5D=BCC%2CCC%2CEK%2Cbody%2CcreatedAt%2CdeletedAt%2Cfrom%2Chtml%2Cid%2Cmessage%2Craw%2Csubject%2Cto%2Cuid%2CupdatedAt&fields%5Bmessage%5D=id&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=emails&header=bcc%2Ccc%2Cek%2Cbody%2Ccreated%20at%2Cdeleted%20at%2Cfrom%2Chtml%2Cid%2Cmessage%2Craw%2Csubject%2Cto%2Cuid%2Cupdated%20at'
},{
	name: 'instanceEnhanced',
	url: 'https://inv-mimir.herokuapp.com/forest/instanceEnhanced.csv?fields%5BinstanceEnhanced%5D=clientBalance%2CcreatedAt%2CETA%2CURL%2Cassignee%2Cassistant%2Cclient%2Cdeadline%2CdeletedAt%2Cdescription%2Cestimate%2Chelp%2Cid%2ClastEmailIn%2ClastEmailOut%2Cowner%2Cpriority%2Cprocess%2Cqualification%2Crecurring%2Cstatus%2CtennisTrigger%2Cuid%2CunsnoozeAt%2CupdatedAt&fields%5Bassignee%5D=id&fields%5Bassistant%5D=id&fields%5Bclient%5D=id&fields%5Bowner%5D=id&fields%5Bprocess%5D=name&fields%5Bqualification%5D=id&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=instance%20enhanceds&header=client%20balance%2Ccreated%20at%2Ceta%2Curl%2Cassignee%2Cassistant%2Cclient%2Cdeadline%2Cdeleted%20at%2Cdescription%2Cestimate%2Chelp%2Cid%2Clast%20email%20in%2Clast%20email%20out%2Cowner%2Cpriority%2Cprocess%2Cqualification%2Crecurring%2Cstatus%2Ctennis%20trigger%2Cuid%2Cunsnooze%20at%2Cupdated%20at'
},{
	name: 'messages',
	url: 'https://inv-mimir.herokuapp.com/forest/message.csv?fields%5Bmessage%5D=assistant%2Cclient%2Ccomment%2CcreatedAt%2CdeletedAt%2Cdirection%2Cemail%2Cid%2Cstatus%2Ctype%2Cuid%2CupdatedAt%2Cuser&fields%5Bassistant%5D=id&fields%5Bclient%5D=id&fields%5Bcomment%5D=id&fields%5Bemail%5D=id&fields%5Buser%5D=id&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=messages&header=assistant%2Cclient%2Ccomment%2Ccreated%20at%2Cdeleted%20at%2Cdirection%2Cemail%2Cid%2Cstatus%2Ctype%2Cuid%2Cupdated%20at%2Cuser'
},{
	name: 'messageToInstance',
	url: 'https://inv-mimir.herokuapp.com/forest/_messageToInstance.csv?fields%5B_messageToInstance%5D=createdAt%2CinstanceId%2CmessageId%2Cuid%2CupdatedAt&searchExtended=0&timezone=America%2FLima&sessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU0NjQ4NjAzNSwiZXhwIjoxNTQ3Njk1NjM1fQ.EwxzwZ96PB7rFUy13BrIe9V_MzlsQipKmviG3BdPBgc&filename=message%20to%20instances&header=created%20at%2Cinstance%20id%2Cmessage%20id%2Cuid%2Cupdated%20at'
}]

for (const collection of collections) {
	Axios.get(collection.url, {
		responseType:'stream'
	}).then(res => {
		res.data.pipe(fs.createWriteStream(`csv/${collection.name}.csv`))
	})
}