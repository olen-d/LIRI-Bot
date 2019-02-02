require("dotenv").config();
const Spotify = require("node-spotify-api");

const keys = require("./keys")

const spotify = new Spotify(keys.spotify);
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

const BITkey = process.env.BANDS_IN_TOWN_KEY;
const OMDBkey = process.env.OMDB_KEY;

let p = process.argv.slice(2);

const parse = {
    userInput(p) {
        let ui = "";
        p.forEach((e) =>{
            ui += " " + e;
        });
        ui = ui.trim();
        return ui;
    }
}

const cd = () => {
    return new Promise(resolve => {
        if (p[0] === "do-what-it-says") {
            fs.readFile("../../random.txt", "utf8", (er,d) => {

                // If the code experiences any errors it will log the error to the console.
                if (er) {
                    return console.log("Is this thing on?\n" + er);
                } else {
                    p.length = 0; // Empty the input array
                    p = d.split(",");
                    q = p.pop();
                    q = q.slice(1,-1); // Get rid of the quotes on the second argument, some of the APIs don't like them. Could probably do this with a regex as well.
                    p.push(q);
                    resolve(p);
                }
            });
        } else {
            resolve(p);
        }
    });
}

const liri = async() => {
    await cd(); // Check to see if "do-what-it-says" was entered as a command
    switch (p[0]) {
        case "concert-this":
            p.shift();
            if (p.length === 0) { p.push("Nickleback")} // Default to Nickleback if the user doesn't bother entering an artist/band 
            let a = parse.userInput(p);
            axios.get(`https://rest.bandsintown.com/artists/${encodeURIComponent(a)}/events?app_id=${BITkey}`)
                .then((r) => {
                    let bData = [];
                    if (r.data.length > 0) {
                        bData.push(a.trim() + " is playing at:")
                        r.data.forEach((e) => {
                            let o = "";
                            let v = e["venue"];
                            if (v["name"] != "") {
                                o += v["name"];
                            }
                            if (v["city"] != "") {
                                o += " in " + v["city"];
                            } 
                            if (v["region"] != "") {
                                o += ", " + v["region"];
                            }
                            if (v["country"] != "") {
                                o += ", " + v["country"];
                            }
                            o += " on " + moment(e["datetime"]).format('L');    
                            bData.push(o);
                        });
                        bData.forEach((s) => {
                            console.log(s);
                            logger(s);
                        })
                    } else {
                        console.log(`No shows were found for ${a}.`);
                        logger(`No shows were found for ${a}.`);
                    }
                })
                .catch((er) => {
                    console.log("Good job, you broke it. Try turning your computer off and then back on again.");
                    // The errors can get pretty verbose, so they're commented out for now.
                    // console.log(er);
                });
            break;
        case "spotify-this-song":
        p.shift();
        if (p.length === 0) { p.push("The Sign")} // Default to The Sign if the user doesn't bother entering song
        let s = parse.userInput(p);
        spotify
                .search({type: "track", query: s, limit: 1})
                .then((r) => {
                    let sData = [];
                    if (r.tracks.items.length > 0) {
                        r.tracks.items.forEach((e) => {
                            // Artist(s)
                            let a = "";
                            e.artists.forEach((f) => {
                                a += f.name + ", ";
                            });
                            (e.artists.length > 1) ? sData.push("Artists: " + a.slice(0,-2)) : sData.push("Artist: " + a.slice(0,-2));
                            // Song Name
                            sData.push("Song Name: " + e.name);
                            // Preview Link
                            sData.push((e.preview_url === null) ? "Preview not available. " : "Preview: " + e.preview_url);
                            // Album
                            sData.push("Album: " + e.album.name);
                            sData.forEach((s) => {
                                console.log(s);
                                logger(s);
                            })
                        });
                    } else {
                        console.log(`No results were found for ${s}`);
                        logger(`No results were found for ${s}`);
                    }
                })
                .catch((er) => {
                    console.log("It's the End of the World as we Know It (and I Feel Fine)");
                    // console.log(er); 
                });
            break;
        case "movie-this":
        p.shift();
            if (p.length === 0) { p.push("Mr. Nobody")} // Default to Mr. Nobody if the user doesn't feel like entering a movie 
            let m = parse.userInput(p);
            axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(m)}&plot=short&apikey=${OMDBkey}`)
                .then((r) => {
                    let mData = [];

                    // Title
                    mData.push("Title: " + r.data.Title);
                    // Year
                    mData.push("Year: " + r.data.Year);
                    // IMDB Rating
                    mData.push(r.data.Ratings[0].Source + " Rating: " + r.data.Ratings[0].Value);
                    // Rotten Tomatoes Rating
                    mData.push(r.data.Ratings[1].Source + " Rating: " + r.data.Ratings[1].Value);
                    // Country
                    let countries = r.data.Country.split(",");
                    mData.push(((countries.length > 1) ? "Countries: " : "Country: ") + r.data.Country);
                    // Language
                    let languages = r.data.Language.split(",");
                    mData.push(((languages.length > 1) ? "Languages: " : "Language: ") + r.data.Language);
                    // Plot
                    mData.push("Plot: " + r.data.Plot);
                    // Actors
                    mData.push("Actors: " + r.data.Actors);
                    mData.forEach((m) => {
                        console.log(m);
                        logger(m);
                    })
                })
                .catch((er) => {
                    console.log("Epic fail. Have you tried turning it off and then back on again?");
                    // console.log(er); 
                });
            break;
        case "do-what-it-says":
            break;

        // Basic help function - if the user enters a bogus command or nothing at all, LIRI responds with some usage options. 
        // Typing "help" as a command also brings this up.
        default:
        case "help":
            console.log("usage: node liri.js\t[concert-this <band/artist>] [spotify-this-song <song>]\n\t\t\t[movie-this <movie title>] [do-what-it-says]")
            break;
    }
}

const logger = (c) => {
    fs.appendFile("../../logs/log.txt", c + "\r\n", (er) => {

        // If an error was experienced we will log it.
        if (er) {
          console.log(er);
        }
      });
}

liri();