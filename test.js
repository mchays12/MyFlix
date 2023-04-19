const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let students = [
  {
    id: 1,
    name: 'Jessica Drake',
    classes: {
      biology: 95,
      algebra: 9
    }
  },
  {
    id: 2,
    name: 'Ben Cohen',
    classes: {
      biology: 95,
      algebra: 92,
    }
  },
  {
    id: 3,
    name: 'Lisa Downing',
    classes: {
      biology: 95,
      algebra: 92,
    }
  }
];

// gets list of all the students
app.get('/students', (req, res) => {
  res.json(students);
});

//gets data about a single student
app.get('/students/:name', (req, res) => {
  res.json(students.find((student) => {
    return student.name === req.params.name
  }));
});

//adds new student to the list of students
app.post('/students', (req, res) => {
  let newStudent = req.body;

  if(!newStudent.name) {
    const message = 'Missing name in request body';
    res.status(400).send(message);
  } else {
    newStudent.id = uuid.v4();
    student.push(newStudent);
    res.status(201).send(newStudent);
  }
});

//deletes student from list by id
app.delete('/students/:id', (req, res) => {
  let student = students.find((student) => {
    return student.id === req.params.id
  });
  if (student) {
    students = student.filter((obj) => {
      return obj.id !== req.params.id
    });
    res.status(201).send('Student' + req.params.id + ' was removed');
  }
});

// updates the "grade" of a student by student name/class name
app.put('/students/:name/:class/:grade', (req, res) => {
  let student = student.find((student) => {
    return student.name === req.params.name
  });
  if (student) {
    student.class[req.params.class] = parseInt(req.params.grade);
    res.status(201).send('Student' + req.params.name + ' was assigned a grade of' + req.params.grade + ' in ' + req.params.class);
  } else {
    res.status(404).send('Student with name' + req.params.name ' was not found');
  }
});

// get the GPA of a student
app.get('/student/:name/:gpa', (req, res) => {
  let student = students.find((student) => {
    return student.name === req.params.name
  });
  if (student) {
    let classesGrades = Object.values(student.classes); // Object.values() filters out object's keys and keeps the values that are returned as a new array
    let sumOfGrades = 0;
    classesGrades.forEach(grade => {
      sumOfGrades = sumOfGrades + grade;
    });

    let gpa = sumOfGrades / classesGrades.length;
    console.log(sumOfGrades);
    console.log(classesGrades);
    console.log(gpa);
    res.status(201).send('' + gpa);
  } else {
    res.status(404).send('Student with name' + req.params.name + 'was not found.');
  }
});

app.listen(8080, () => {
  console.log('your server is listening on port 8080.');
});

