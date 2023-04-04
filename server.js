const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5173;

// Setup empty JS object to act as endpoint for all routes
const projectData = {foo: 42};

// Require Express to run server and routes

// Start up an instance of app


/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance

// Initialize the main project folder
app.use(express.static('website'));


// Setup Server
app.get('/api', (_, res) => res.send(projectData));
app.listen(PORT, () => {
    console.log("Yo");
});