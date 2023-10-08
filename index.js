const express = require('express');
const morgan = require('morgan');
// const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const models = require('./models.js');

const app = express();

const Movies = models.Movie;
const Users = models.User;

mongoose.connect('mongodb://localhost:27017/myflix', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
*/

// for logging in terminal
app.use(morgan('common'));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

// Endpoints //

// start endpoint
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

// get a list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err);
    });
});
// get information on 1 movie

app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
        res.json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
// get information by name of genre
app.get('/movies/genres/:genreName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
        res.json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
// get information regarding specific director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
        res.json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// create user using information provided


app.post('/users', (req, res) => {
	Users.findOne({ Username: req.body.Username })
		.then((user) => {
			if (user) {
				return res.status(400).send(req.body.Username + ' already exists');
			} else {
				Users.create({
					Username: req.body.Username,
					Password: req.body.Password,
					Email: req.body.Email,
					Birthday: req.body.Birthday,
				})
					.then((user) => {
						res.status(201).json(user);
					})
					.catch((error) => {
						console.error(error);
						res.status(500).send('Error: ' + error);
					});
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// get all users

app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err)
            res.status(500).send('Error: ' + err);
        });
});

// Get a User by UserName

app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// updated user information with new data provided

app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Verifies account
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    // Update Account
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        })
});

// add a movie to users favorite movie list

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// delete a movie from users favorite movie list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
// deletes users accounts

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// for getting files in public file
app.use(express.static('public'));


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

// port
app.listen(8080, () => {
    console.log('Your app is listening on Port 8080.');
});