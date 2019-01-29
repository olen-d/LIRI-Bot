require("dotenv").config();
const Spotify = require("node-spotify-api");

const keys = require("./keys")

const spotify = new Spotify(keys.spotify);