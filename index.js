const express = require('express');
const morgan = require('morgan');

const app = express();

// for logging in terminal
app.use(morgan('common'));

// get request
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

let topMovies = [
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan'
    },
    {
        title: 'Pulp Fiction',
        director: 'Quentin Tarantino'
    },
    {
        title: 'Fight Club',
        director: 'David Fincher'
    },
    {
        title: 'Interstellar',
        director: 'Christopher Nolan'
    },
    {
        title: 'Back to the Future',
        director: 'Robert Zemeckis'
    },
    {
        title: 'Scarface',
        director: 'Brian De Palma'
    },
    {
        title: 'Up',
        director: 'Pete Docter'
    },
    {
        title: 'Kill Bill: Vol. 1',
        director: 'Quentin Tarantino'
    },
    {
        title: 'Star Wars: Episode VI - Return of the Jedi',
        director: 'Richard Marquand'
    },
    {
        title: 'Django Unchained',
        director: 'Quentin Tarantino'
    },
];

app.get('/movies', (req, res) => {
    res.json(topMovies);
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