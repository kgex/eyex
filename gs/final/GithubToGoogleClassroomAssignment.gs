var clientId = 'Ov23ctXYpPEvu3ffmlsU';
var clientSecret = '658f75c98fdd8146dfe09864cc61e9d3bdb82eda';
var accessToken = '';
var courseId = '660191923617'; // Replace with your Google Classroom course ID
var spreadsheetId = '1e6BGHawE1LQz6fPYoUBN9ZnU_CSgqrFk3Hh-bQveyxw'; // Replace with your Google Sheets ID

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
      accessToken = data.access_token;
      authorized = true;
    }
  }
}

function fetchAssignments() {
  if (!accessToken) {
    accessToken = PropertiesService.getUserProperties().getProperty('access_token');
  }

  if (accessToken) {
    var classroomId = '222183'; // Replace with your GitHub Classroom ID
    var url = 'https://api.github.com/classrooms/' + classroomId + '/assignments';
    
    var response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    var assignments = JSON.parse(response.getContentText());
    Logger.log(assignments);

    // Write to Google Sheets
    writeToGoogleSheets(assignments);

    // Create Google Classroom assignments
    createGoogleClassroomAssignments(assignments);
  } else {
    Logger.log('No access token found. Run the getDeviceCode and pollForToken functions first.');
  }
}

function writeToGoogleSheets(assignments) {
  var sheetName = 'GithubAssignments'; // Replace with the name of the sheet you want to write to

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    // If the sheet doesn't exist, create it
    sheet = spreadsheet.insertSheet(sheetName);
  } else {
    // Clear existing content if the sheet already exists
    sheet.clear();
  }

  // Write headers
  sheet.appendRow([
    'ID', 'Public Repo', 'Title', 'Type', 'Invite Link', 'Invitations Enabled', 'Slug', 'Students Are Repo Admins',
    'Feedback Pull Requests Enabled', 'Max Teams', 'Max Members', 'Editor', 'Accepted', 'Submissions',
    'Passing', 'Language', 'Deadline', 'Classroom ID', 'Classroom Name', 'Classroom Archived', 'Classroom URL'
  ]);

  // Write assignments
  assignments.forEach(function(assignment) {
    sheet.appendRow([
      assignment.id,
      assignment.public_repo,
      assignment.title,
      assignment.type,
      assignment.invite_link,
      assignment.invitations_enabled,
      assignment.slug,
      assignment.students_are_repo_admins,
      assignment.feedback_pull_requests_enabled,
      assignment.max_teams,
      assignment.max_members,
      assignment.editor,
      assignment.accepted,
      assignment.submissions,
      assignment.passing,
      assignment.language,
      assignment.deadline,
      assignment.classroom.id,
      assignment.classroom.name,
      assignment.classroom.archived,
      assignment.classroom.url
    ]);
  });
}

function createGoogleClassroomAssignments(assignments) {
  
  // Fetch all assignments from Google Classroom
  var existingAssignments = fetchGoogleClassroomAssignments(courseId);
  
  // Create a set of GitHub assignment IDs that are already created in Google Classroom
  var existingGitHubAssignments = new Set();
  existingAssignments.forEach(function(assignment) {
    var match = assignment.title.match(/^GitHub: (\d+):/);
    if (match) {
      existingGitHubAssignments.add(match[1]);
    }
  });

  assignments.forEach(function(assignment) {
    // Check if the assignment ID already exists in Google Classroom
    if (!existingGitHubAssignments.has(String(assignment.id))) {
      var dueDate = assignment.deadline ? new Date(assignment.deadline) : null;

      var coursework = {
        title: `GitHub: ${assignment.id}: ${assignment.title}`,
        description: `GitHub Classroom Assignment: ${assignment.title}`,
        materials: [
          {
            link: {
              url: assignment.invite_link,
              title: 'GitHub Repo Link'
            }
          }
        ],
        state: 'PUBLISHED',
        dueDate: dueDate ? {
          year: dueDate.getFullYear(),
          month: dueDate.getMonth() + 1,
          day: dueDate.getDate()
        } : null,
        dueTime: dueDate ? {
        hours: 23,
        minutes: 59
      } : null,
        maxPoints: 100,
        workType: 'ASSIGNMENT'
      };

      createCoursework(courseId, coursework);
    }
  });
}

function fetchGoogleClassroomAssignments(courseId) {
  var pageToken;
  var assignments = [];
  do {
    var response = Classroom.Courses.CourseWork.list(courseId, {
      pageToken: pageToken
    });
    var courseWorks = response.courseWork;
    if (courseWorks && courseWorks.length > 0) {
      assignments = assignments.concat(courseWorks);
    }
    pageToken = response.nextPageToken;
  } while (pageToken);
  return assignments;
}

function createCoursework(courseId, coursework) {
  Classroom.Courses.CourseWork.create(coursework, courseId);
}

function updateGradesFromGithubToGoogleClassroom() {
  var sheetName = 'StudentMappings'; // Replace with the name of the sheet that has the student mappings

  // Fetch assignments from Google Classroom with the "GitHub" prefix
  var githubAssignments = fetchAndFilterGitHubAssignments(courseId);

  // Fetch student mappings from the spreadsheet
  var studentMappings = fetchStudentMappings(spreadsheetId, sheetName);

  // Loop through each GitHub assignment and update grades
  githubAssignments.forEach(function(assignment) {
    var githubAssignmentId = extractGithubAssignmentId(assignment.title);
    if (githubAssignmentId) {
      var githubGrades = fetchGithubGrades(githubAssignmentId);

      // Map GitHub usernames to Google Classroom student IDs and update grades
      githubGrades.forEach(function(grade) {
        var gcuser = studentMappings[grade.github_username];
        if (gcuser) {
          updateGoogleClassroomGrade(courseId, assignment.id, gcuser, grade.points_awarded);
        }
      });
    }
  });
}

function fetchAndFilterGitHubAssignments(courseId) {
  var assignments = fetchGoogleClassroomAssignments(courseId);
  return assignments.filter(function(assignment) {
    return assignment.title.startsWith('GitHub:');
  });
}

function extractGithubAssignmentId(title) {
  var match = title.match(/^GitHub: (\d+):/);
  return match ? match[1] : null;
}

function fetchGithubGrades(githubAssignmentId) {
  var accessToken = PropertiesService.getUserProperties().getProperty('access_token');
  var url = 'https://api.github.com/assignments/' + githubAssignmentId + '/grades';
  
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  return JSON.parse(response.getContentText());
}

function fetchStudentMappings(spreadsheetId, sheetName) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var mappings = {};
  
  // Assuming the first row is the header
  data.slice(1).forEach(function(row) {
    var gituser = row[2];
    var gcuser = row[3];
    mappings[gituser] = gcuser;
  });
  
  return mappings;
}

function fetchGoogleClassroomAssignments(courseId) {
  var pageToken;
  var assignments = [];
  do {
    var response = Classroom.Courses.CourseWork.list(courseId, {
      pageToken: pageToken
    });
    var courseWorks = response.courseWork;
    if (courseWorks && courseWorks.length > 0) {
      assignments = assignments.concat(courseWorks);
    }
    pageToken = response.nextPageToken;
  } while (pageToken);
  return assignments;
}

function updateGoogleClassroomGrade(courseId, courseworkId, studentId, grade) {
  var submission = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseworkId, {
    userId: studentId
  }).studentSubmissions[0];
  
  if (submission) {
    var submissionId = submission.id;
    var body = {
      assignedGrade: grade
    };

    Classroom.Courses.CourseWork.StudentSubmissions.patch(body, courseId, courseworkId, submissionId, {
      updateMask: 'assignedGrade'
    });

    // Classroom.Courses.CourseWork.StudentSubmissions.return(courseId, courseworkId, submissionId, {});
    Logger.log(`Updated grade for student ${studentId} to ${grade}`);
  } else {
    Logger.log(`No submission found for student ${studentId}`);
  }
}