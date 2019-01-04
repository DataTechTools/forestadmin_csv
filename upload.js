require('dotenv').load();

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const Papa = require('papaparse')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = `${process.env.LOCATION}/token.json`;

const files = [{
  name: 'email',
  tab: 'Email'
},{
  name: 'instanceEnhanced',
  tab: 'Enhanceted ITC'
},{
  name: 'messages',
  tab: 'Messages'
},{
  name: 'messageToInstance',
  tab: 'Messages to ITC'
}]

// Load client secrets from a local file.
fs.readFile(`${process.env.LOCATION}/credentials.json`, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  for (const file of files) {
    let csv_contents = fs.readFileSync(`${process.env.LOCATION}/csv/${file.name}.csv`, 'utf8');
    Papa.parse(csv_contents, {
      header: false,
      complete: function (results) {
        if (results.data.length == 2)
          if (results.data[1].length == 1)
            return

        for (let i = 0; i < results.data.length; i++) {
          for (let j = 0; j < results.data[i].length; j++) {
            if (results.data[i][j].length > 50000)
              results.data[i][j] = results.data[i][j].substring(0, 49999)
          }
        }
        authorize(JSON.parse(content), results.data, file.tab, appendData);
      },
      error: function (results) {
        console.log('error')
      }
    })
  }
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, data, tab, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, data, tab);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function appendData(auth, data, tab) {
	var sheets = google.sheets('v4');
	sheets.spreadsheets.values.update({
	  auth: auth,
	  spreadsheetId: '1lpWk34g13kaMxwd2TWxVWFUv8VIdVBZ1EZ0OWoHLf5E',
	  range: tab, //Change Sheet1 if your worksheet's name is something else
	  valueInputOption: "USER_ENTERED",
	  resource: {
		  values: data
	  }
	}, (err, response) => {
	  if (err) {
      console.log('The API returned an error: ' + err);
      return;
	  } else {
		  console.log("Appended " + tab);
	  }
	});
}