function gitFetchGrade() {
  // getDeviceCode()
  // pollForToken()
  fetchGradesAlone()
}

var clientId = 'Ov23ctXYpPEvu3ffmlsU';
var clientSecret = '658f75c98fdd8146dfe09864cc61e9d3bdb82eda';

function getDeviceCode() {
  var url = 'https://github.com/login/device/code';
  var payload = {
    client_id: clientId,
    scope: 'repo user'
  };
  
  var options = {
    method: 'post',
    payload: payload,
    headers: {
      'Accept': 'application/json'
    }
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());
  
  Logger.log('Please visit ' + data.verification_uri + ' and enter the code: ' + data.user_code);
  Logger.log('Device code: ' + data.device_code);
  
  PropertiesService.getUserProperties().setProperty('device_code', data.device_code);
  PropertiesService.getUserProperties().setProperty('interval', data.interval);
}

function pollForToken() {
  var deviceCode = PropertiesService.getUserProperties().getProperty('device_code');
  var interval = parseInt(PropertiesService.getUserProperties().getProperty('interval')) * 1000;

  console.log(deviceCode);
  
  var url = 'https://github.com/login/oauth/access_token';
  var payload = {
    client_id: clientId,
    client_secret: clientSecret,
    device_code: deviceCode,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
  };
  
  var options = {
    method: 'post',
    payload: payload,
    headers: {
      'Accept': 'application/json'
    }
  };
  
  var authorized = false;
  
  while (!authorized) {
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    
    if (data.error) {
      if (data.error === 'authorization_pending') {
        Logger.log('Authorization pending... waiting ' + interval / 1000 + ' seconds');
        Utilities.sleep(interval);
      } else {
        Logger.log('Error: ' + data.error);
        break;
      }
    } else {
      Logger.log('Access token: ' + data.access_token);
      PropertiesService.getUserProperties().setProperty('access_token', data.access_token);
      authorized = true;
    }
  }
}

function fetchGradesAlone() {
  var accessToken = PropertiesService.getUserProperties().getProperty('access_token');
  console.log(accessToken);
  if (accessToken) {
    var org = 'kgex'; // Replace with your GitHub organization
    var repo = 'helloworld'; // Replace with your repository name
    var assignmentId = '622589'; // Replace with your assignment ID
    // var url = 'https://api.github.com/repos/' + org + '/' + repo + '/assessments/' + assignmentId + '/results';
    var url = 'https://api.github.com/assignments/' + assignmentId + '/grades'
    // var url = 'https://api.github.com/classrooms'
    // var url = 'https://api.github.com/classrooms/222183/assignments'
    var response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    var grades = JSON.parse(response.getContentText());
    Logger.log(grades);

    // Process grades as needed
    grades.forEach(function(grade) {
      Logger.log('Student: ' + grade.github_username + ', Grade: ' + grade.points_awarded);
    });
  } else {
    Logger.log('No access token found. Run the getDeviceCode and pollForToken functions first.');
  }
}


