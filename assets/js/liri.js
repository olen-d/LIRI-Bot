require("dotenv").config();
const Spotify = require("node-spotify-api");

const keys = require("./keys")

const spotify = new Spotify(keys.spotify);
const axios = require("axios");
const moment = require("moment");

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

switch (p[0]) {
    case "concert-this":
        p.shift();
        if (p.length === 0) { p.push("Nickleback")} // Default to Nickleback if the user doesn't bother entering an artist/band 
        let a = parse.userInput(p);
        axios.get(`https://rest.bandsintown.com/artists/${encodeURIComponent(a)}/events?app_id=codingbootcamp`)
            .then((r) => {
                if (r.data.length > 0) {
                    console.log(a.trim() + " is playing at:")
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
                        console.log(o);
                    });
                } else {
                    console.log("No shows were found for " + a + ".");
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
                //console.log(r.tracks.items).preview_url;
                r.tracks.items.forEach((e) => {
                    // Artist(s)
                    let a = "";
                    e.artists.forEach((f) => {
                        a += f.name + ", ";
                    });
                    (e.artists.length > 1) ? console.log("Artists: " + a.slice(0,-2)) : console.log("Artist: " + a.slice(0,-2));
                    // Song Name
                    console.log("Song Name: " + e.name);
                    // Preview Link
                    console.log((e.preview_url === null) ? "Preview not available. " : "Preview: " + e.preview_url);
                    // Album
                    console.log("Album: " + e.album.name);
                });
            })
            .catch((er) => {
                console.log("It's the End of the World as we Know It (and I Feel Fine)");
                // console.log(er); 
            });
        break;

    default:
    case "help":
        console.log("usage: node liri.js\t[concert-this <band/artist>] [spotify-this-song <song>]")
}