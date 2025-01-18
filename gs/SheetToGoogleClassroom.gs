function onNewAssignment(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  
  // Check if the edit is in the Assignments sheet
  if (sheet.getName() === 'GithubAssignments') {
    var row = range.getRow();
    var values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Check if the row is a new entry (assuming ID column is the first column and checking if it's filled)
    if (values[0]) {
      var coursework = {
        title: values[2],  // Title
        description: 'GitHub Classroom Assignment: ' + values[2],
        materials: [
          {
            link: {
              url: values[4],  // Invite Link
              title: 'GitHub Repo Link'
            }
          }
        ],
        state: 'PUBLISHED',
        dueDate: parseDueDate(values[16]),  // Due Date
        dueTime: {
          hours: 23,
          minutes: 59
        },
        maxPoints: 100,
        workType: 'ASSIGNMENT'
      };

      // Replace with your courseId
      var courseId = '660191923617';

      createCoursework(courseId, coursework);
    }
  }
}

function parseDueDate(dueDateString) {
  if (!dueDateString) return null;

  var dueDate = new Date(dueDateString);
  return {
    year: dueDate.getFullYear(),
    month: dueDate.getMonth() + 1,
    day: dueDate.getDate()
  };
}

function createCoursework(courseId, coursework) {
  var service = Classroom.Courses.CourseWork;
  service.create(coursework, courseId);
}
