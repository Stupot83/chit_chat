const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mustacheExpress = require('mustache-express');
const expressHandlebars = require('express-handlebars');
const port = process.env.PORT || 9000;
const app = express();

app.use(morgan('dev'));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'));

app.engine('html', expressHandlebars());

app.set('view engine', 'handlebars');

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;
mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

app.listen(port, function () {
  console.log('Server listening on http://localhost:' + port);
});