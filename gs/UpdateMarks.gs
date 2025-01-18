var students = [
  { 'name': 'Navaneeth', 'email': 'navaneeth.m@kgkite.ac.in', 'gituser': 'nivu', 'gcuser': '118364386695139441310' },
  { 'name': 'Bhuvaneshwari Kanagaraj', 'email': 'bhuvaneshwari.k@kgkite.ac.in', 'gituser': 'bhuvaneshwarikanagaraj', 'gcuser': '115802916541216531036' },
  { 'name': 'Dhanvanthkumar Umashankar', 'email': 'dhanvanthkumar.k@kgkite.ac.in', 'gituser': 'Dhanvanthkumar', 'gcuser': '110852575163920069136' },
  { 'name': 'Gopi krishna Sivakumar', 'email': 'gopikrishna.k@kgkite.ac.in', 'gituser': 'gopu-005', 'gcuser': '103675431215366690998' }
];

function myFunction() {
  fetchGrades();
}

function fetchGrades() {
  // console.log("callin fetchGrades");
  var accessToken = PropertiesService.getUserProperties().getProperty('access_token');
  console.log("accessToken", accessToken);
  if (accessToken) {
    var assignmentId = '622917'; // Replace with your assignment ID
    var url = 'https://api.github.com/assignments/' + assignmentId + '/grades';
    var response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    var grades = JSON.parse(response.getContentText());
    Logger.log(grades);

    var marksData = {};
    grades.forEach(function(grade) {
      var student = students.find(s => s.gituser === grade.github_username);
      if (student) {
        marksData[student.gcuser] = grade.points_awarded;
      }
    });
    // console.log(marksData)

    updateMarks(marksData);
  } else {
    Logger.log('No access token found. Run the getDeviceCode and pollForToken functions first.');
  }
}

function updateMarks(marksData) {
  // Define your course ID and coursework ID
  const courseId = '660191923617';
  const courseworkId = '697171879543';

  // Update marks for all students
  updateMarksForStudents(courseId, courseworkId, marksData);
}

function updateMarksForStudents(courseId, courseworkId, marksData) {
  // console.log("updateMarksForStudents")
  for (const [studentId, mark] of Object.entries(marksData)) {
    try {
      // Get the student submission ID
      const submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseworkId, {
        userId: studentId
      }).studentSubmissions;

      if (submissions && submissions.length > 0) {
        const submission = submissions[0];
        const submissionId = submission.id;

        // Check if the submission is associated with the developer project
        if (submission.associatedWithDeveloper) {
          const body = {
            assignedGrade: 26
          };

          Classroom.Courses.CourseWork.StudentSubmissions.patch(body, courseId, courseworkId, submissionId, {
            updateMask: 'assignedGrade'
          });

          // Classroom.Courses.CourseWork.StudentSubmissions.return(courseId, courseworkId, submissionId, {});

          Logger.log(`Updated grade for student ${studentId} to ${mark}`);
        } else {
          Logger.log(`Cannot modify submission for student ${studentId} as it is not associated with the developer project.`);
        }
      } else {
        Logger.log(`No submission found for student ${studentId}`);
      }
    } catch (e) {
      Logger.log(`Failed to update grade for student ${studentId}: ${e.message}`);
    }
  }
}
