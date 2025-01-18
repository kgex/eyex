function fetchAssignments() {
  var accessToken = PropertiesService.getUserProperties().getProperty('access_token');
  if (accessToken) {
    var org = 'YOUR_ORG'; // Replace with your GitHub organization
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

    assignments.forEach(function(assignment) {
      Logger.log('Assignment: ' + assignment.title + ', ID: ' + assignment.id);
    });

    // Write to Google Sheets
    writeToGoogleSheets(assignments);

  } else {
    Logger.log('No access token found. Run the getDeviceCode and pollForToken functions first.');
  }
}

function writeToGoogleSheets(assignments) {
  var spreadsheetId = '1e6BGHawE1LQz6fPYoUBN9ZnU_CSgqrFk3Hh-bQveyxw'; // Replace with your Google Sheets ID
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


