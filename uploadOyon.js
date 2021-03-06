require('dotenv').config({path: __dirname + '/.env'})

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const Papa = require('papaparse')
const moment = require('moment')

Papa.parsePromise = function(file) {
  return new Promise(function(complete, error) {
    Papa.parse(file, {complete, error});
  });
};

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = `${process.env.LOCATION}/token.json`;
const spreadsheetId = '12tjbO1aM7cEltaQmkYl1T8UGD38W_vpC643nGtg44nc'

const files = [{
  name: 'instance',
  tab: 'ITC'
}]

async function run() {
  const csv_qualifications = fs.readFileSync(`${process.env.LOCATION}/csv/qualification.csv`, 'utf8')
  let result = await Papa.parsePromise(csv_qualifications)
  const qualifications = result.data
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
          // Must aggregate empty columns for retrocompatibility
          results.data[0].splice(0, 0, 'client balance')
          results.data[0].splice(3, 0, 'url')
          results.data[0].splice(13, 0, 'last email in')
          results.data[0].splice(14, 0, 'last email out')
          results.data[0].splice(21, 0, 'tennis trigger')
          for (let i = 1; i < results.data.length; i++) {
              results.data[i].splice(0, 0, '')
              results.data[i].splice(3, 0, '')
              results.data[i].splice(13, 0, '')
              results.data[i].splice(14, 0, '')
              results.data[i].splice(21, 0, '')
          }
          //filter
          results.data = results.data.filter(d => {
            let isCurrentDate = false
            if (d[24] !== 'updated at')
              isCurrentDate = moment(d[24]).isSame(moment(), "day");
            if (d[24] == 'updated at' || isCurrentDate)
              return true
            return false
          })
          //parse data
          results.data = results.data.map( d => {
            if (d[1] == 'created at')
              return d
            d[18] = (()=> {
              let found = qualifications.find( u => {
                return u[3] == d[18]
              })
              return found ? found[2] : d[18]
            })()
            return d
          })
          authorize(JSON.parse(content), results.data, file.tab, appendData);
        },
        error: function (results) {
          console.log('error')
        }
      })
    }
  });
}
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

async function appendData(auth, data, tab) {
  var sheets = google.sheets('v4');
  await sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: spreadsheetId,
    requestBody: {
      requests: [
        {
          updateCells: {
            range: {
              sheetId: 0
            },
            fields: "*"
          }
        }
      ]
    }
  })
	sheets.spreadsheets.values.update({
	  auth: auth,
	  spreadsheetId: spreadsheetId,
	  range: tab, //Change Sheet1 if your worksheet's name is something else
	  valueInputOption: "USER_ENTERED",
	  resource: {
		  values: data
	  }
	}, (err, response) => {
	  if (err) {
      console.log('uploadOyon: The API returned an error: ' + err);
      return;
	  } else {
		  console.log("uploadOyon: Appended " + tab);
	  }
	});
}

run()