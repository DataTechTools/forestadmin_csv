require('dotenv').config({path: __dirname + '/.env'})

const Axios = require('axios')
const fs = require('fs')
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MDM4IiwidHlwZSI6InVzZXJzIiwiZGF0YSI6eyJlbWFpbCI6InNlcmdpby5iYW5kZXJlc0BpbnZpc2libGUuZW1haWwiLCJmaXJzdF9uYW1lIjoiU2VyZ2lvICIsImxhc3RfbmFtZSI6IkJhbmRlcmVzIiwidGVhbXMiOlsiQWdlbnRzIl19LCJyZWxhdGlvbnNoaXBzIjp7InJlbmRlcmluZ3MiOnsiZGF0YSI6W3sidHlwZSI6InJlbmRlcmluZ3MiLCJpZCI6IjM0OTkwIn1dfX0sImlhdCI6MTU1MzA3OTk1MSwiZXhwIjoxNTU0Mjg5NTUxfQ.NPu-Ms30I_4bonBbceD0jVr6Y5Kq4cIoVGyX6pPxJEM'

//de momento está descargando de all

const collections = [{
	name: 'instance',
	url: `https://inv-mimir.herokuapp.com/forest/instance.csv?fields%5Binstance%5D=createdAt%2CETA%2Cassignee%2Cassistant%2Cclient%2Cdeadline%2CdeletedAt%2Cdescription%2Cestimate%2Chelp%2Cid%2Cowner%2Cpriority%2Cprocess%2Cqualification%2Crecurring%2Cstatus%2Cuid%2CunsnoozeAt%2CupdatedAt&fields%5Bassistant%5D=id&fields%5Bclient%5D=id&fields%5Bassignee%5D=id&fields%5Bowner%5D=id&fields%5Bprocess%5D=id&fields%5Bqualification%5D=id&searchExtended=0&timezone=America%2FLima&sessionToken=${token}&filename=instances&header=created%20at%2Ceta%2Cassignee%2Cassistant%2Cclient%2Cdeadline%2Cdeleted%20at%2Cdescription%2Cestimate%2Chelp%2Cid%2Cowner%2Cpriority%2Cprocess%2Cqualification%2Crecurring%2Cstatus%2Cuid%2Cunsnooze%20at%2Cupdated%20at`
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