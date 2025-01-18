function createAssignment() {
  createCoursework()
}
function createCoursework() {
  const courseId = '660191923617';  // Replace with your course ID

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);  // Set due date 7 days from now

  const coursework = {
    title: 'New Test Assignment',
    description: 'Githug Classroom Assignment on Odd or Even.',
    materials: [
      {
        link: {
          url: 'https://classroom.github.com/a/kqm5Nxey',
          title: 'GitHub Repo Link'
        }
      }
    ],
    state: 'PUBLISHED',
    dueDate: {
      year: dueDate.getFullYear(),
      month: dueDate.getMonth() + 1,
      day: dueDate.getDate()
    },
    dueTime: {
      hours: 23,
      minutes: 59
    },
    maxPoints: 100,
    workType: 'ASSIGNMENT'
  };

  const createdCoursework = Classroom.Courses.CourseWork.create(coursework, courseId);
  Logger.log('Created coursework with ID: ' + createdCoursework.id);
  return createdCoursework.id;
}

