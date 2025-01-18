const programId = "7NjAOWY1R8eYwDlmNWfHzA"; //  Program ID for current semester
var courseId = '660191923617'; // Replace with your Google Classroom course ID - For current semester

function getOAuthToken() {
  const appKey = '6GnrBII8eTTnMRDNGBDe3jlmrXBI5ATXUxHRhj9KhIr0nBwg';
  const appSecret = 'rPfBMbD49jpVvD1OJDbNG5rsAxh9J4AcHvhBaWDUmdDwNrGpzkY7SgL2QGMrONYl';

  // Encode the key and secret
  const authString = `${appKey}:${appSecret}`;
  const base64AuthString = Utilities.base64Encode(authString);

  const url = "https://api.coursera.com/oauth2/client_credentials/token";
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": `Basic ${base64AuthString}`
  };

  const data = {
    "grant_type": "client_credentials"
  };

  const options = {
    method: 'post',
    headers: headers,
    payload: data,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);

  // Check the response status code
  const statusCode = response.getResponseCode();
 
  if (statusCode === 200) {
    console.log("Token received successfully");
    const json = JSON.parse(response.getContentText());
    //console.log(json.access_token);
    return json.access_token;
  } else {
    console.log("Failed to get token");
    console.log(`Status code: ${statusCode}`);
    console.log(response.getContentText());
  }
}

// Fetch Coursera Assignments
function fetchCourseraPrograms() {
  const accessToken = getOAuthToken();   
 
  const url = `https://api.coursera.com/ent/api/businesses.v1/C894LttMQcGS3Kv6nSRPVQ/programs/${programId}/curriculumCollections`;

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
  const assignments = JSON.parse(response.getContentText()); 
  console.log(response.getContentText());
  createGoogleClassroomAssignments(assignments);  
}

// Fetch GoogleClassroom Assignments
function fetchGoogleClassroomAssignments() {
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

  //console.log(assignments);
  return assignments;
  
}


function createGoogleClassroomAssignments(assignments) {
  
  // Fetch all assignments from Google Classroom
  var existingAssignments = fetchGoogleClassroomAssignments(courseId);  
    
  // Create a set of Coursera assignment IDs that are already created in Google Classroom
  var existingCourseraAssignments = new Set();
  existingAssignments.forEach(function(assignment) {
    var match = assignment.title.match(/^Coursera: ([A-Za-z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?~\-]+):/);
    console.log(match)
    if (match) {
      //console.log("Matched",  assignment.title)
      existingCourseraAssignments.add(match[1]);   // appending coursera id to the array  
    }       
  });

  // // Log the values in existingCourseraAssignments
  //    console.log("Existing Coursera Assignments:");
  //    existingCourseraAssignments.forEach(function(id) {
  //    console.log(id);
  // });


    assignments.elements[0].contents.forEach(function(assignment) {
    // Check if the assignment ID already exists in Google Classroom

    if (assignment.contentType == 'Specialization'){
      console.log(assignment.extraMetadata.definition.courseIds)
      assignment.extraMetadata.definition.courseIds.forEach(function(individualCourse, index){
        var assignmentObject = {
          'name': assignment.name + " - Course " + (index + 1),
          'id': individualCourse.contentId,
          'deadline': assignment.deadline
        }
        passCourse(assignmentObject, existingCourseraAssignments)
      });
    } else if (assignment.contentType == 'Course'){
      console.log(assignment.id)
      passCourse(assignment, existingCourseraAssignments)
    }
  });
}

function passCourse(assignment, existingCourseraAssignments){
    if (!existingCourseraAssignments.has(String(assignment.id))) {
      //console.log(assignment.id)
      var dueDate = assignment.deadline ? new Date(assignment.deadline) : null;

      var coursework = {
        title: `Coursera: ${assignment.id}: ${assignment.name}`,
        description: `Coursera Classroom Assignment: ${assignment.name}`, 
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
      writeToSheet(assignment.name,assignment.id)  
    }
}


function createCoursework(courseId, coursework) {
  Classroom.Courses.CourseWork.create(coursework, courseId);
}

function writeToSheet(name, id) {  
   const spreadsheetId = '1-V5A_IdGUyjj7JOO9nBaUtZ8a1c3W4F2VvMqwUttIPs';
   const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
   const sheet = spreadsheet.getSheetByName("CourseraMapping");

  try {
        if (id.length > 0) {
          sheet.appendRow([name, id]);
        }      
     }
  catch (error) {
    console.error("Error writing to sheet:", error.message);
  }
}


