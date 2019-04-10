require('dotenv').config({path: __dirname + '/.env'})

const Axios = require('axios')
const fs = require('fs')
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU1NDkyNDg4NywiZXhwIjoxNTU2MTM0NDg3fQ.TUemIziI7XoukmXmYX0wel6WYRa1NLu49sRp2nsgvWo'

//de momento está descargando de all

const collections = [{
	name: 'instanceEnhanced',
	url: `https://inv-mimir.herokuapp.com/forest/instanceEnhanced.csv?fields%5BinstanceEnhanced%5D=clientBalance%2CcreatedAt%2CETA%2CURL%2Cassignee%2Cassistant%2Cclient%2Cdeadline%2CdeletedAt%2Cdescription%2Cestimate%2Chelp%2Cid%2ClastEmailIn%2ClastEmailOut%2Cowner%2Cpriority%2Cprocess%2Cqualification%2Crecurring%2Cstatus%2CtennisTrigger%2Cuid%2CunsnoozeAt%2CupdatedAt&fields%5Bassignee%5D=id&fields%5Bassistant%5D=id&fields%5Bclient%5D=id&fields%5Bowner%5D=id&fields%5Bprocess%5D=name&fields%5Bqualification%5D=id&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=instance%20enhanceds&header=client%20balance%2Ccreated%20at%2Ceta%2Curl%2Cassignee%2Cassistant%2Cclient%2Cdeadline%2Cdeleted%20at%2Cdescription%2Cestimate%2Chelp%2Cid%2Clast%20email%20in%2Clast%20email%20out%2Cowner%2Cpriority%2Cprocess%2Cqualification%2Crecurring%2Cstatus%2Ctennis%20trigger%2Cuid%2Cunsnooze%20at%2Cupdated%20at`
}]

for (const collection of collections) {
	Axios.get(collection.url, {
		responseType:'stream'
	}).then(res => {
		res.data.pipe(fs.createWriteStream(`${process.env.LOCATION}/csv/${collection.name}.csv`))
	}).catch(err => {
		console.log(err.errors)
	})
}