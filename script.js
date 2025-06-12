const CLIENT_ID = '496131599054-k4td976vo0i5kumt3kugep8ao5b7jco9.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

function log(msg) {
  console.log(msg);
  document.getElementById('result').innerText = msg;
}

function initAuth() {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    }).then(() => {
      document.getElementById('loginBtn').addEventListener('click', () => {
        gapi.auth2.getAuthInstance().signIn()
          .then(user => {
            const profile = user.getBasicProfile();
            log("Success! Logged in as: " + profile.getEmail());
          })
          .catch(err => {
            console.error('Auth error:', err);
            log("Authentication failed.");
          });
      });
    }).catch(err => {
      console.error('Init error:', err);
      log("Failed to initialize client.");
    });
  });
}

document.addEventListener('DOMContentLoaded', initAuth);
