const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

/*mongoose.connect('mongodb://localhost:27017/test', {
    family:4
})
    .then(() => {
        console.log('FINE');
    })
    .catch(() => {
        console.log("BAD");
    })*/

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }, {
  family: 4
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



const cors = require('cors');
const allowedOrigins = ['https://myflixappmatthew.herokuapp.com/ ', 'http://localhost:1234', 'http://localhost:4200', 'https://mchays12.github.io/', 'https://mchays12.github.io/login', 'https://mchays12.github.io/signup']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    };
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = `The CORS policy for this application doesn't allow access from origin` + origin;
      return callback(new Error(message), false)
    };
    return callback(null, true)
  }
}))

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');


// Log URL request data to log.txt text file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });
app.use(morgan('combined', passport.authenticate('jwt', { session: false }), { stream: accessLogStream }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('This is the default route endpoint');
});

// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// get movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/genre/:Genre', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/directors/:Director', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/director_information/:Director', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/genre_information/:Genre', passport.authenticate('jwt', { session: false }), (req, res) => {
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

//CREATE add movie to list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $addToSet:
      {
        FavoriteMovies: req.params.MovieID
      },
    },
    { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(500).send('Error: User was not found');
      } else {
        res.json(updatedUser)
      }
    })
    .catch((err) => {
      console.error(error);
      res.status(500).send('Error: ' + err);
    });
});

//DELETE delete movie from list of favorites


app.delete("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { Username, MovieID } = req.params;
  Users.findOneAndUpdate(
    { Username },
    { $pull: { FavoriteMovies: MovieID } },
    { new: true }
  )
    .then((updatedUser) => res.status(200).json(updatedUser))
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
}
);

//Add a user
/* we'll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Bithday: Date
}*/
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed[check('Username', 'Username is required').isLength({min: 5}),
  [check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) => {
              res.status(201).json(user)
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send('Error: 1 ' + err);
            })
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: 2 ' + err);
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed[check('Username', 'Username is required').isLength({min: 5}),
  [check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
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
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

//DELETE
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
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
      if (!user) {
        return res.status(404).send('Error: ' + req.params.Username + ' was not found')
      } else {
        res.status(200).json(user)
      }
    })
    .catch((err) => {
      res.status(500).send('Error:' + err)
    });
});

//automatically routes all requests for static files to the "public" folder
app.use(express.static('Public'));

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something is broke");
});

const port = process.env.PORT || 1234;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
