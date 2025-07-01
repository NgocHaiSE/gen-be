require('dotenv').config();
require('./alias');

const express = require('express');
const morgan = require('morgan');
const compression= require('compression');
const app = express();
const port = process.env.PORT || 3000;
const clientURL = process.env.CLIENT_URL;

const route = require('./src/routes');
const db = require('./src/config/db');


const cors = require('cors');
const corsOptions ={
    origin: clientURL, 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
// init middleware
app.use(morgan('combined'))
app.use(compression())
app.use(cors(corsOptions));
// Add headers before the routes are defined
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', clientURL);

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

db.connect();

route(app);


app.listen(port, () => {
  console.log(`App is running at ${clientURL}`);
  console.log(clientURL);
})
