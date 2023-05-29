const express = require('express'),
	morgan = require('morgan'),
	fs = require('fs'),
	path = require('path'),
	bodyParser = require('body-parser'),
	uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/test', {
    family:4
})
    .then(() => {
        console.log('FINE');
    })
    .catch(() => {
        console.log("BAD");
    })

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log URL request data to log.txt text file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send('This is the default route endpoint');
});

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
  Users.findOneAndUpdate({ Username: req.params.Username }, 
    {
    $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      },
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
app.post('/users/:Username/movies/:movie_id', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $addToSet:
        { 
          FavoriteMovies: req.params.movie_id
        }
    },
    {new: true},
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser)
      }
    });
});

//DELETE delete move from list of favorites
app.delete('/users/:Username/:movieTitle', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { favoriteMovies: req.params.movieTitle }
    },
    {new: true}
    )
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(404).send('Error: user not found')
    } else {
      res.status(updatedUser);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:' + err);
  });
});

//DELETE
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if(!user) {
      res.status(404).send('Error: ' + req.params.Username + ' was not found')
    } else {
      res.status(200).send(req.params.Username + ' was deleted')
    };
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get all users
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
    res.status(200).json(users)
  })
  .catch((err) => {
    res.status(500).send('Error:' + err)
  });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
  .then((user) => {
    if(!user) {
      return res.status(404).send('Error: ' + req.params.Username + ' was not found')
    } else {
    res.status(200).json(user)
    }
  })
  .catch((err) => {
    res.status(500).send('Error:' + err)
  });
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
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        return res.status(404).send('Error: ' + req.params.Title + ' was not found');
      } else {
      res.status(200).json(movie);
      }
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
    .then((movie) => {
      if (!movie) {
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
    .then((movie) => {
      if (!movie) {
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


