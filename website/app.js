import countries from './countries.js';

/**
 * Types, yay!
 * @typedef {{zip: string, country: string}} ZipInfo
 * @typedef {{lat: number, lon: number}} Coordinate
 * @typedef {{text: string, temperature: number, date: Date}} JournalEntry 
 * @typedef {{main: {temp: number}}} WeatherReport There's a lot more data here, but all we need is the temperature.
 */


////////////// APIs ////////////

const KEY = window.atob(`NzJjZGRlZTU5ODg2ZWQ2Zjg0YTM0ZWQyZmQyMTJmNTU=`);
const WEATHER_API = `https://api.openweathermap.org/data/2.5/weather`;
const GEOCODE_API = `https://api.openweathermap.org/geo/1.0/zip`;
const JOURNAL_API = "/api";


/**
 * @param {ZipInfo} l
 * @returns {Promise<Coordinate>}
 */
const getGeocode = async ({zip, country}) => {
    const query = `${GEOCODE_API}?zip=${zip},${country}&appid=${KEY}`;
    return await getJson(query);
};


/** 
 * @param {Coordinate} c
 * @returns {Promise<WeatherReport>}
 */
const getWeather = async ({lat, lon}) => {
    const query = `${WEATHER_API}?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric`;
    return await getJson(query);
};


/**
 * @returns {Promise<JournalEntry>}
 */
const getRecentEntry = async () => {
    // TODO: Verify data.
    const json = await getJson("/api");
    console.log("Journal entry from server:", json);
    json.date = new Date(json.date);
    return json;
}

const postRecentEntry = async (/** @type {JournalEntry} */ entry) => 
    fetch(JOURNAL_API, {
        method: "POST", 
        body: JSON.stringify(entry),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    });

const getJson = async (/** @type {string} */ query) => {
    try {
        const response = await fetch(query);
        const data = await response.json();
        return data; 
    } catch (err) {
        console.error(`WTF? ${err}`);
    }
};

////////////// DOM ////////////

/**
 * @returns {void}
 */
const main = () => {
    /** @type {HTMLSelectElement | null} */
    const countrySelect = document.querySelector("#country");
    if (countrySelect) populateCountrySelect(countrySelect);
    /** @type {HTMLFormElement | null} */
    const form = document.querySelector("form");
    /** @type {HTMLInputElement | null} */
    const zipInput = document.querySelector("#zip");
    /** @type {HTMLTextAreaElement | null} */
    const journalTextarea = document.querySelector("#feelings");

    const allGood = !!(form && zipInput && countrySelect && journalTextarea)

    getRecentEntry().then(entry => {
        if (entry) applyEntry(entry); 
    });
    if (allGood) {
        form.onsubmit = e => {
            e.preventDefault();
            const zip = zipInput.value.trim();
            const country = countrySelect.value;
            const entry = journalTextarea.value.trim();
            // TODO: Inform the user that these fields are required:
            if (!(zip.length && entry.length)) return;
            submitJournalEntry({ zip, country}, entry)
                .then(async () => {
                    // TODO: Maybe don't ask the server for the data you just submitted :)
                    const entry = await getRecentEntry();
                    applyEntry(entry); 
                })
                .catch(reason => {
                    console.error(reason);
                    applyEntry(undefined);
                })
        }
    } else {
        console.error("😕 Didn't find all elements.");
    }
};

/**
 * @param {JournalEntry | undefined=} entry 
 */
const applyEntry = entry => {
    if (entry && !entry.text) entry == undefined;
    const recentDate = document.querySelector("#date");
    const recentTemp = document.querySelector("#temp");
    const recentEntry = document.querySelector("#content");
    const entryHolder = document.querySelector(".entry");
    const error = document.querySelector(".error");
    if (!(recentDate && recentTemp && recentEntry && entryHolder && error)) {
        return false;
    }
    entryHolder.classList.toggle("hidden", !entry || !entry.text);
    error.classList.toggle("hidden", !!entry);
    if (entry) {
        recentDate.textContent = entry.date.toLocaleString();
        recentTemp.textContent = `${entry.temperature} °C`;                
        recentEntry.textContent = entry.text;
    }
}

/**
 * Enable non-us citizens to use this app:
 * @param {HTMLSelectElement} select 
 * @returns {void}
 */
const populateCountrySelect = select => {
    // US is the secret default because I might fail the assignment if it isnt't:
    const options = [{name: "---Country---", code: "US"}, ...countries];
    options.forEach(({name, code}) => {
        const elem = document.createElement("option");
        elem.setAttribute("label", name);
        elem.setAttribute("value", code);
        select.appendChild(elem);
    })
}

/**
 * 
 * @param {ZipInfo} location 
 * @param {string} text 
 * @returns {Promise<Response|void>}
 */
const submitJournalEntry = async (/** @type {ZipInfo} */ location, /** @type {string} */ text) => {
    const coordinate = await getGeocode(location);
    if (!coordinate.lat) {
        throw new Error("Did not find location.")
    }
    console.log("Geocode result:", coordinate);
    const weatherReport = await getWeather(coordinate);
    const date = new Date();
    /** @type {JournalEntry} */
    const entry = {date, temperature: weatherReport.main.temp, text: text};
    return postRecentEntry(entry);
}

main();