'use strict'

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient(6379, 'redis'); // (port, host)

client.on('connect', function () {
    console.log('Connected to Redis...');
});

client.on("error", function (err) {
    console.log("Error connecting to redis " + err);
});

// Set Port
const port = process.env.PORT || 8080;

// Init app
const app = express();

// View Engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', function (req, res) {
    res.render('searchusers');
});

// Search processing
app.post('/user/search', function (req, res) {
    let id = req.body.id;

    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User Page
app.get('/user/add', function (req, res) {
    res.render('adduser');
});

// Process Add User Page
app.post('/user/add', function (req, res) {
    let id = req.body.id;

    client.hmset(id, [
        'first_name', req.body.first_name,
        'last_name', req.body.last_name,
        'email', req.body.email,
        'phone', req.body.phone
    ], function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

// Delete User
app.delete('/user/delete/:id', function (req, res) {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});
