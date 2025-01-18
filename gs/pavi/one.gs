var courseId = '660191923617'; // Replace with your Google Classroom course ID - For current semester

const spreadsheetId = "1-V5A_IdGUyjj7JOO9nBaUtZ8a1c3W4F2VvMqwUttIPs";

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

function fetchAndFilterCourseraAssignments(courseId) {
  var assignments = fetchGoogleClassroomAssignments(courseId);
  return assignments.filter(function(assignment) {
    return assignment.title.startsWith('Coursera:');
  });
}

function extractCourseraCourseId(title) {
  const courseraPrefix = "Coursera:";
  
  if (title.startsWith(courseraPrefix)) {
    const parts = title.split(':');
    
    // Check if the parts array has at least three elements
    if (parts.length >= 3) {
      const courseId = parts[1].trim();
      return courseId;
    }
  }
  
  return null;
}

function fetchStudentMappings(spreadsheetId, sheetName) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var mappings = {};
  
  // Assuming the first row is the header
  data.slice(1).forEach(function(row) {
    var gituser = row[1];
    var gcuser = row[3];
    mappings[gituser] = gcuser;
  });
  
  return mappings;
}
function updateGradesFromCourseraToGoogleClassroom() {
  var sheetName = 'StudentMappings'; // Replace with the name of the sheet that has the student mappings

  // Fetch assignments from Google Classroom with the "GitHub" prefix
  var courseraAssignments = fetchAndFilterCourseraAssignments(courseId);

  console.log(courseraAssignments)

  // Fetch student mappings from the spreadsheet
  var studentMappings = fetchStudentMappings(spreadsheetId, sheetName);
  console.log(studentMappings)

  // Loop through each Coursera assignment and update grades
  courseraAssignments.forEach(function(assignment) {
    var courseraCourseraId = extractCourseraCourseId(assignment.title);
    console.log("courseraCourseraId", courseraCourseraId);
    if (courseraCourseraId) {
      var courseraGrades = fetchCourseraCoursesGrades(courseraCourseraId);

      // Map coursera usernames to Google Classroom student IDs and update grades
      courseraGrades.forEach(function(grade) {
        var gcuser = studentMappings[grade.externalId]; // email id
        console.log(gcuser)
        if (gcuser) {
          updateGoogleClassroomGrade(courseId, assignment.id, gcuser, grade.overallCourseGrade);
        }
      });
    }
  });
}

function fetchCourseraCoursesGrades(courseraCourseraId) {
    const accessToken = getOAuthToken();
    //console.log(accessToken);

  const orgId = 'C894LttMQcGS3Kv6nSRPVQ';
  const url = `https://api.coursera.com/ent/api/businesses.v1/${orgId}/courseGradebookReports?q=search&programId=${programId}&courseId=${courseraCourseraId}&start=0`;

  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/x-www-form-urlencoded"
  };

  const options = {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());   
  console.log(data.elements);
  return data.elements;
}

function updateGoogleClassroomGrade(courseId, courseworkId, studentId, grade) {
  var submission = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseworkId, {
    userId: studentId
  }).studentSubmissions[0];
  console.log(submission)
  
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






