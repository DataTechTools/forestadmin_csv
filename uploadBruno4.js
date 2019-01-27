require('dotenv').config({path: __dirname + '/.env'})

//libraries
const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')
const Papa = require('papaparse')
const moment = require('moment')

//Config
moment.updateLocale(moment.locale(), { invalidDate: "" })
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
const spreadsheetId = '1iFeAC8idTB3NvAMBEys2sy_98zwX3f0KTuotS2IQrno';
const csv_users = fs.readFileSync(`${process.env.LOCATION}/csv/user.csv`, 'utf8')
const csv_assistants = fs.readFileSync(`${process.env.LOCATION}/csv/assistant.csv`, 'utf8')
const csv_qualifications = fs.readFileSync(`${process.env.LOCATION}/csv/qualification.csv`, 'utf8')

const delete_columns = ['client balance', 'deleted at', 'description', 'estimate', 'help', 'recurring', 'tennis trigger', 'uid', 'unsnooze at']

async function run() {

  let result = await Papa.parsePromise(csv_users)
  const users = result.data

  result = await Papa.parsePromise(csv_assistants)
  const assistants = result.data

  result = await Papa.parsePromise(csv_qualifications)
  const qualifications = result.data

  const files = [{
    name: 'instanceEnhanced',
    tab: 'Enhanceted ITC'
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
          if (file.name == 'instanceEnhanced') {
            //filters
            results.data = results.data.filter(d => {
              if (d[18] == 'qualification' || d[18] == 31 || d[18] >= 1 && d[18] <=20)
                return true
              return false
            })
            results.data = results.data.filter(d => {
              if (d[20] == 'status' || d[20] != 'Completed' && d[20] != 'New')
                return true
              return false
            })
            //parse data
            results.data = results.data.map( d => {
              if (d[1] == 'created at')
                return d
              d[1] = moment(d[1]).format('M/D/YYYY')
              d[2] = moment(d[2]).format('M/D/YYYY')
              d[4] = (()=> {
                let found = users.find( u => {
                  return u[2] == d[4]
                })
                return found ? found[3] : d[4]
              })()
              d[5] = (()=> {
                let found = assistants.find( u => {
                  return u[3] == d[5]
                })
                return found ? found[4] : d[5]
              })()
              d[7] = moment(d[7]).format('M/D/YYYY')
              d[13] = moment(d[13]).format('M/D/YYYY')
              d[14] = moment(d[14]).format('M/D/YYYY')
              d[15] = (()=> {
                let found = users.find( u => {
                  return u[2] == d[15]
                })
                return found ? found[3] : d[15]
              })()
              d[18] = (()=> {
                let found = qualifications.find( u => {
                  return u[3] == d[18]
                })
                return found ? found[2] : d[18]
              })()
              d[24] = moment(d[24]).format('M/D/YYYY')
              return d
            })
            //remove columns
            let found = -1
            do {
              found = results.data[0].findIndex( d => {
                  return delete_columns.includes(d)
              })
              if (found != -1)
                for (let index = 0; index < results.data.length; index++) {
                  results.data[index].splice(found, 1);
              }
            } while (found != -1);
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
      spreadsheetId: spreadsheetId,
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
}
run()