const bodyParser = require('body-parser');
const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');
  uuid = require('uuid');

const app = express(); //create a write stream (in append mode)  
const mongoose = require('mongoose');
const Models = require('./models.js');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.text'), {flags: 'a'}) // a "log.text" file is created in the root directory

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/movies', {
  useNewUrlParser: true, useUnifiedTopology: true
});

app.use(morgan('combined', {stream: accessLogStream})); //sets up logger

app.use(bodyParser.json());

//Add a user
/* we'll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Bithday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) => { 
          res.status(201).json(user) 
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
        })
      }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Update a user's info, by username
/* we'll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
  $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the update document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//CREATE add movie to list of favorites
app.post('/users/:id/:movieTitle', (req, res) => {
  Users.findOneAndUpdate( )
  
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array` );
  } else {
    res.status(400).send('no movie added to array');
  }
});

//DELETE delete move from list of favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
  const {id, movieTitle} = req.params;

  let user = users.find(user => user.id == id);
  
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no movie removed from array');
  }
});

//DELETE
app.delete('/users/:id', (req, res) => {
  const {id} = req.params;

  let user = users.find(user => user.id == id);
  
  if (user) {
    users = users.filter(user => user.id !== id);
    res.status(200).send(`user ${id} has been deleted`)
  } else {
    res.status(400).send('no user has been removed');
  }
});

// Get all movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err)
    });
});

// get movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        return res.status(404).send('Error: ' + req.params.Title + ' was not found');
      }
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get a movie by genre name
app.get('/movies/genre/:Genre', (req, res) => {
  Movies.find({ 'Genre.Name': req.params.Genre })
    .then((movies) => {
      if (movies.length == 0) {
        return res.status(404).send('Error: No movies found with the ' + req.params.Genre + ' genre were found');
      } else {
          res.status(200).json(movies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get movies by director name
app.get('/movies/directors/:Director', (req, res) => {
  Movies.find({ 'Director.Name': req.params.Director })
    .then((movies) => {
      if (movies.length == 0) {
        return res.status(404).send('Error: No movies found with the director ' + req.params.Director + ' were found'); 
      } else {
        res.status(200).json(movies);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// get information about a director by name
app.get('/movies/director_information/:Director', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Director })
    .then((movies) => {
      if (movies.length == 0) {
        return res.status(404).send('Error: ' + req.params.Director + ' was not found'); 
      } else {
        res.status(200).json(movie.Director);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// get information about a genre by name
app.get('/movies/genre_information/:Genre', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Genre })
    .then((movies) => {
      if (movies.length == 0) {
        return res.status(404).send('Error: ' + req.params.Genre + ' was not found'); 
      } else {
        res.status(200).json(movie.Genre);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
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


