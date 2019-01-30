require("dotenv").config();
const Spotify = require("node-spotify-api");

const keys = require("./keys")

const spotify = new Spotify(keys.spotify);
const axios = require("axios");
const moment = require("moment");

let p = process.argv.slice(2);

switch (p[0]) {
    case "concert-this":
        let a = "";
        p.shift();
        if (p.length === 0) { p.push("Nickleback")} // Default to Nickleback if the user doesn't bother entering an artist/band 
        p.forEach((e) =>{
            a += " " + e;
        });
        axios.get(`https://rest.bandsintown.com/artists/${encodeURIComponent(a.trim())}/events?app_id=codingbootcamp`)
            .then((r) => {
                if (r.data.length > 0) {
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
                    console.log("No shows were found for " + a.trim() + ".");
                }
            })
            .catch((e) => {
                console.log("Good job, you broke it. Try turning your computer off and then back on again.");
                // The errors can get pretty verbose, so they're commented out for now.
                // console.log(e);
            });
        break;
}