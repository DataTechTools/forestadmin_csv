require('dotenv').config({ path: __dirname + '/../.env'})
const fs = require('fs')
const moment = require('moment')
const {google} = require('googleapis')
const pg = require('knex')({
	client: 'pg',
	connection: process.env.PG_CONNECTION_STRING,
	searchPath: 'public'
})

const TOKEN_PATH = `${process.env.LOCATION}/token.json`;
const credentials = fs.readFileSync(`${process.env.LOCATION}/credentials.json`)
function authorize(credentials, spreadsheetId, data, tab, callback) {
	const {client_secret, client_id, redirect_uris} = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
	const token = fs.readFileSync(TOKEN_PATH)
	oAuth2Client.setCredentials(JSON.parse(token));
	callback(oAuth2Client, spreadsheetId, data, tab);
}

async function appendData(auth, spreadsheetId, data, tab) {
	var sheets = google.sheets({
		version: 'v4',
		auth: auth
	});
	try {
		await sheets.spreadsheets.values.update({
			spreadsheetId: spreadsheetId,
			range: tab, //Change Sheet1 if your worksheet's name is something else
			valueInputOption: 'RAW',
			resource: {
				values: data
			}
		})
		console.log('uploadJesus: Updated ' + tab)
	} catch (error) {
		console.log('error' + tab)
		console.log(error.response.data)
	}
}

async function run() {
	try {
		let emails = await pg('emails')
			.select('emails.messageId as message')
			.select('mti.instanceId as instance')
			.select(pg.raw(`regexp_replace(subject, 'Re: |Fwd: |FW: ', '','gi') as subject`))
			.select(pg.raw(`case when "from" ilike '%@invisibvalues.updatele.email%' then 'Internal' else 'External' end as "client type logic"`))
			.select(pg.raw(`case when "from" not ilike '%@invisible.email%' then 'External' else case when "from" similar to '%(zach|francis|erinn|thomas|shane|steven|skyler|rodrigo|marshall|leo|lucia|keenahn|jamie|jay|gabriel|adam|aimee|bilal|corey|egor|x|bob|mark|peter|john|kamron|sam|dilip|gunar|seb|horia|zein.saeed|jeroen.jagt)%' then 'External' else 'Internal' end end as "client type"`))
			.select('emails.createdAt')
			.select(pg.raw(`case when subject similar to '%(Invitation: |Meeting: |Call: |Typeform: |ODB |Issue log |Issue Log Report |Accepted: |Declined: |<>|Security alert| here''s your PIN|Assigned to You: |Delivery Status Notification (Failure) |Signature process for )%' then 'REMOVE' else '' end  as exclusion`))
			.join('_messageToInstance as mti', 'mti.messageId', 'emails.messageId')
			.orderBy('mti.createdAt')
		for (let email of emails) {
			email.createdAt = moment.utc(email.createdAt).format('YYYY-MM-DD HH:mm:ss')
		}
		let emailsArray = []
		emailsArray.push(['message', 'instance', 'subject', 'client type logic', 'client type', 'createdAt', 'exclusion'])

		for (const email of emails) {
			let emailArray = []
			emailArray.push(email.message)
			emailArray.push(email.instance)
			emailArray.push(email.subject)
			emailArray.push(email['client type logic'])
			emailArray.push(email['client type'])
			emailArray.push(email.createdAt)
			emailArray.push(email.exclusion)
			emailsArray.push(emailArray)
		}
		let spreadsheetId = '1VPfoMnZ-XPdlwxImJfxFVhPD7iQCM8Jn98treTocWQE'
		authorize(JSON.parse(credentials), spreadsheetId, emailsArray, 'emails2', appendData)

		let instances = await pg('instances_enhanced as ins')
			.select('ins.id as instance')
			.select('p1.name as client')
			.select('p2.name as assistant')
			.select('p3.name as assignee')
			.select('p4.name as owner')
			.select('q.domain as qualification')
			.select('status')
			.select('deadline')
			.select('help')
			.select(pg.raw(`'' as billing`))
			.select(pg.raw(`'' as "client type"`))
			.leftJoin('clients as c1', 'c1.id', 'clientId')
			.leftJoin('profiles as p1', 'p1.id', 'c1.profileId')
			.leftJoin('assistants as a1', 'a1.id', 'ins.assistantId')
			.leftJoin('profiles as p2', 'p2.id', 'a1.profileId')
			.leftJoin('users as u1', 'u1.id', 'ins.assigneeId')
			.leftJoin('profiles as p3', 'p3.id', 'u1.profileId')
			.leftJoin('users as u2', 'u2.id', 'ins.ownerId')
			.leftJoin('profiles as p4', 'p4.id', 'u2.profileId')
			.leftJoin('qualifications as q', 'q.id', 'ins.qualificationId')
			.whereNull('ins.deletedAt')
			.orderBy('ins.id')

		let i = 2
		for (let instance of instances) {
			instance.deadline = instance.deadline ? moment.utc(instance.deadline).format('YYYY-MM-DD HH:mm:ss') : null
			instance.billing = `=iferror(if(isnumber(A${i})=true,vlookup(B${i},'client type for billing'!A:B,2,false),""),"External")`
			instance['client type'] = `=if(isnumber(A${i})=true,if(J${i}="External",J${i},"Internal"),"")`
			i++
		}
		let instancesArray = []
		instancesArray.push(['instance', 'client', 'assistant', 'assignee', 'owner', 'qualification', 'status', 'deadline', 'help', 'billing', 'client type'])

		for (const instance of instances) {
			let instanceArray = []
			instanceArray.push(instance.instance)
			instanceArray.push(instance.client)
			instanceArray.push(instance.assistant)
			instanceArray.push(instance.assignee)
			instanceArray.push(instance.owner)
			instanceArray.push(instance.qualification)
			instanceArray.push(instance.status)
			instanceArray.push(instance.deadline)
			instanceArray.push(instance.help)
			instanceArray.push(instance.billing)
			instanceArray.push(instance['client type'])
			instancesArray.push(instanceArray)
		}
		spreadsheetId = '1-0pvFomk3-SmTurw4dW53XtDEwczsK3OTfe3AgLvP_g'
		authorize(JSON.parse(credentials), spreadsheetId, instancesArray, 'instances2', appendData)

		let timeEntries = await pg('timeEntries as te')
			.select('te.createdAt')
			.select('instanceId as instance')
			.select('type')
			.select('p.name as user')
			.join('users as u', 'u.id', 'te.userId')
			.join('profiles as p', 'p.id', 'u.profileId')
			.whereNull('te.deletedAt')
			.orderBy(['instanceId', 'userId', 'createdAt'])

		for (let time of timeEntries) {
			time.createdAt = moment.utc(time.createdAt).format('YYYY-MM-DD HH:mm:ss')
		}
		let timesArray = []
		timesArray.push(['createdAt', 'instance', 'type', 'user'])

		for (const time of timeEntries) {
			let timeArray = []
			timeArray.push(time.createdAt)
			timeArray.push(time.instance)
			timeArray.push(time.type)
			timeArray.push(time.user)
			timesArray.push(timeArray)
		}
		spreadsheetId = '1LJojenfBt0k4rAZS4-mfT4saa04TLguQF-2pr7lBHys'
		authorize(JSON.parse(credentials), spreadsheetId, timesArray, 'timeEntry2', appendData)
	} catch (error) {
		 console.log('err general')
	}
	pg.destroy()
}

run()