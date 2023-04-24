const bodyParser = require('body-parser');
const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');
  uuid = require('uuid');
 

const app = express();
//create a write stream (in append mode)  

// a "log.text" file is created in the root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.text'), {flags: 'a'})

//sets up logger
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());

let users = [
  { 
    id: 1,
    Name: "john",
    favoriteMovies: []
  }

];

let movies = [ 
  {
    'Title': 'Hereditary',
    'Director': {
      'Name': 'Jim Bob'
    },
    'Genre': {
      'Name': 'horror'
    }
  },
  {
    'Title': 'Midsommar',
    'Director': {
      'Name': 'Jim Bob'
    },
    'Genre': {
      'Name': 'horror'
    }
  },
  {
    'Title': 'John Wick',
    'Director': {
      'Name': 'Bob Jim'
    },
    'Genre': {
      'Name': 'action'
    }
  },
  {
    'Title': 'John Wick 2',
    'Director': {
      'Name': 'Bob Jim'
    },
    'Genre': {
      'Name': 'action'
    }
  },
  {
    'Title': 'John Wick 3',
    'Director': {
      'Name': 'Bob Jim'
    },
    'Genre': {
      'Name': 'action'
    }
  },
  {
    'Title': 'John Wick 4',
    'Director': {
      'Name': 'Bob Jim'
    },
    'Genre': {
      'Name': 'action'
    }
  },
  {
    'Title': 'Jaws',
    'Director': {
      'Name': 'Stephen Spielberg'
    },
    'Genre': {
      'Name': 'fantasy'
    }
  },
  {
    'Title': 'Star Wars: a New Hope',
    'Director': {
      'Name': 'George Lucas'
    },
    'Genre': {
      'Name': 'fantasy'
    }
  },
  {
    'Title': 'Star Wars: Empire Strikes Back',
    'Director': {
      'Name': 'George Lucas'
    },
    'Genre': {
      'Name': 'fantasy'
    }
  },
  {
    'Title': 'Star Wars: Return of the Jedi',
    'Director': {
      'Name': 'George Lucas'
    },
    'Genre': {
      'Name': 'fantasy'
    }
  }
];

//CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;
  
  if (newUser.Name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(200).json(newUser);
  } else {
    res.status(400).send('New user needs name');
  }
});

//UPDATE
app.put('/users/:id', (req, res) => {
  const {id} = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id)
  
  if (user) {
    user.Name = updatedUser.Name;
    res.status(200).json(user)
  } else {
    res.status(400).send('no new user');
  }
});

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const {id, movieTitle} = req.body;

  let user = users.find(user => user.id == id);
  
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array` );
  } else {
    res.status(400).send('no movie added to array');
  }
});

//DELETE
app.delete('/users/id/:movieTitle', (req, res) => {
  const {id, movieTitle} = req.body;

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
  const {id} = req.body;

  let user = users.find(user => user.id == id);
  
  if (user) {
    users = users.filter(user => user.id != id);
    res.json(user);
  } else {
    res.status(400).send('no user has been removed');
  }
});

//READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//READ
app.get('/movies/:title', (req, res) => {
  const {title} = req.params;
  const movie = movies.find(movie => movie.Title === title);
  
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No movie found');
  }
});

//READ
app.get('/movies/genre/:genreName', (req, res) => {
  const {genreName} = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
  
  if (genre) {
    res.status(200).json(genre);
    
  } else {
    res.status(400).send('No genre found');
  }
});

//READ
app.get('/movies/directors/:directorName', (req, res) => {
  const {directorName} = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;
  
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No director found');
  }
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


