const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();
//create a write stream (in append mode)  

// a "log.text" file is created in the root directory
const accessLogStream = fs.createWriteStream(path.join(_MyFlix, 'log.text'), {flags: 'a'})

//sets up logger
app.use(morgan('common'));

let topTenMovies = [
  {
    title: 'Hereditary'
  },
  {
    title: 'Midsommar'
  },
  {
    title: 'John Wick'
  },
  {
    title: 'John Wick 2'
  },
  {
    title: 'John Wick 3'
  },
  {
    title: 'John Wick 4'
  },
  {
    title: 'Jaws'
  },
  {
    title: 'Star Wars: a New Hope'
  },
  {
    title: 'Star Wars: Empire Strikes Back'
  },
  {
    title: 'Star Wars: Return of the Jedi'
  }
];

//GET Requests
app.get('/', (req, res) => {
  res.send('Welcome to my app');
});

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

//automatically routes all requests for static files to the "public" folder
app.use(express.static('Public'));

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something is broke");
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});


