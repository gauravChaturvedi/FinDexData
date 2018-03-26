const express = require('express');
const app = express();
var path = require('path');
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
var formidable = require('formidable');
var fs = require('fs');
var convertExcel = require('excel-as-json').processFile;
require('dotenv').config();

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

app.use(cors());

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  aud: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

const checkScopes = jwtAuthz(['read:messages']);

console.log('blah');

app.get('/api/public', function(req, res) {
  res.json({
    message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
  });
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/private', checkJwt, function(req, res) {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated to see this.'
  });
});

app.post('/fileupload', function(req, res) {

  console.log('Posting file now');
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log(files.filetoupload.name);
    var oldpath = files.filetoupload.path;
    console.log(process.cwd());
    console.log(files.filetoupload.name);
    var newpath = process.cwd() + '/' + files.filetoupload.name;

    fs.readFile(oldpath, function (err, data) {
          if (err) throw err;
          console.log('File read!');

          // Write the file
          fs.writeFile(newpath, data, function (err) {
              if (err) throw err;
              res.json({
                message: 'Awesome.. file uploaded!'
              });
              console.log('File written!');
          });

          // Delete the file
          fs.unlink(oldpath, function (err) {
              if (err) throw err;
              console.log('File deleted!');
          });
      });

  });

});


app.get('/getData', checkJwt, function(req, res) {

  var options = {
    sheet:'3',
    isColOriented: false,
    omitEmtpyFields: true
  }
  convertExcel('Citi FinDex Project Master Sheet_Final.xlsx', 'row.json', options, (err, data) => {
    if(err) {
      console.log( "JSON conversion failure: #{err}");
      return err;
    } else {
      console.log('success');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
      return res.end();
    }
  })

});

app.get('/getPercentileData', checkJwt, function(req, res) {

  var options = {
    sheet:'5',
    isColOriented: false,
    omitEmtpyFields: true
  }
  convertExcel('Citi FinDex Project Master Sheet_Final.xlsx', 'row.json', options, (err, data) => {
    if(err) {
      console.log( "JSON conversion failure: #{err}");
      return err;
    } else {
      console.log('success');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
      // return res.end();
    }
  })

});

app.get('/getPercentileData', checkJwt, function(req, res) {

  var options = {
    sheet:'5',
    isColOriented: false,
    omitEmtpyFields: true
  }
  convertExcel('Citi FinDex Project Master Sheet_Final.xlsx', 'row.json', options, (err, data) => {
    if(err) {
      console.log( "JSON conversion failure: #{err}");
      return err;
    } else {
      console.log('success');
      res.write(JSON.stringify(data));
      // return res.end();
    }
  })
});


app.use(function(err, req, res, next){
  console.error(err.stack);
  return res.status(err.status).json({ message: err.message });
});

app.listen(process.env.PORT || 8080);
console.log('Listening on http://localhost:8080');
