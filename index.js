const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), //import built in node modules fs and path
  path =require('path');


const app = express();
//create a write stream (in append mode)
// a "log.text" file is created in the root directory
const accessLogStream = fs.createWriteStream(path.join(+dirname, 'log.text'), {flags: 'a'})

//sets up logger
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.send('welcome to my app!');
});

app.get('/documentation', (req, res) => {
  res.send('this is my documentation page');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});


