const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = 5173;
const API_ROUTE = '/api'

/**
 * @typedef {{text: string, temperature: number, date: string}} ProjectData temperature in celsius
 * @type {ProjectData | {}}
 */
let projectData = {};

/**
 * @param {string} str 
 * @returns {boolean}
 */
const isValidDateString = str => (new Date(str)).toString() !== "Invalid Date";

// We're not savages
const verifyData = (/** @type {ProjectData} */ data) => 
    data
    && data.text && typeof data.text === `string`
    && data.temperature && isFinite(data.temperature)
    && data.date && isValidDateString(data.date)
    || false;


// Start up an instance of app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('website'));

// Routing
app.get(API_ROUTE, (_, res) => {
    console.log("Asking for project data:", projectData);
    res.send(projectData)
});
app.post(API_ROUTE, (req, res) => {
    console.log(req.body);
    const ok = verifyData(req.body);
    if (ok) {
        projectData = req.body;
        console.log("Set projectData=", projectData, "to body=", req.body);
    } else {
        console.log("Malformed data:", req.body);
    }
    res.sendStatus(ok? 200:400).end();
});

// Off you go then...
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}, api available on ${API_ROUTE}.`);
});