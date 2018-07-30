var express = require('express');
var path = require('path');
var elasticsearch = require('elasticsearch');

//SET THESE PARAMETERS ACCORDING TO USAGE AND ENVIRONMENT
var elastic_search_host = 'localhost:9200';


// ROUTES
var indexRouter = require('./routes/index');
var contactRouter = require('./routes/contact');
var app = express();


// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// STATIC FOLDER STATIC
app.use(express.static(path.join(__dirname, 'public')));


// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ESTABLISHING ROUTES
app.use('/', indexRouter);
app.use('/contact', contactRouter);
app.use('/contact/:name', contactRouter);

//ESTABLISH ELASTICSEARCH CONNECTION
global.client = new elasticsearch.Client({
    host: elastic_search_host,
    // log: 'trace'
});

client.ping({
    requestTimeout: 30000,
}, function(error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});

module.exports = app;
