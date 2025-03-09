// Owen Meade, March 2025
// Libraries
const express = require("express");
const moment = require("moment-timezone");

// Constants
const app = express();
const PORT = 1337;

// Routes
// get time by timezone in a given location (e.g. "/America/New_York")
app.get("/:area/:location", (req, res) => {
    try {
        // check if timezone is valid
        const timezone = `${req.params.area}/${req.params.location}`;
        if (!moment.tz.zone(timezone)) {
            return res.status(404).json({ error: "Timezone not found" });
        }
        
        // get current time in requested timezone
        const now = moment.tz(timezone);
        const utcOffset = now.format("Z");
        const dst = now.isDST();
        
        // format response similar to worldtimeapi.org
        const response = {
            abbreviation: now.format("z"),
            client_ip: req.ip,
            datetime: now.format(),
            day_of_week: now.day(),
            day_of_year: now.dayOfYear(),
            dst,
            dst_from: null,
            dst_offset: dst ? 3600 : 0,
            dst_until: null,
            raw_offset: parseInt(utcOffset.replace(":", "")) * 36,
            timezone,
            unixtime: Math.floor(now.valueOf() / 1000),
            utc_datetime: moment.utc().format(),
            utc_offset: utcOffset,
            week_number: now.week()
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error processing timezone request:", error);
        res.status(500).json({ error: "Failed to process timezone request" });
    }
});

// simplified route for area timezones if known (e.g. "UTC")
app.get("/:area", (req, res) => {
    try {
        // check if timezone is valid
        const timezone = req.params.area;
        if (!moment.tz.zone(timezone)) {
            return res.status(404).json({ error: "Timezone not found" });
        }
        
        // same logic as above, just with different parameter structure
        const now = moment.tz(timezone);
        const utcOffset = now.format("Z");
        const dst = now.isDST();
        
        const response = {
            abbreviation: now.format("z"),
            client_ip: req.ip,
            datetime: now.format(),
            day_of_week: now.day(),
            day_of_year: now.dayOfYear(),
            dst,
            dst_from: null,
            dst_offset: dst ? 3600 : 0,
            dst_until: null,
            raw_offset: parseInt(utcOffset.replace(":", "")) * 36,
            timezone,
            unixtime: Math.floor(now.valueOf() / 1000),
            utc_datetime: moment.utc().format(),
            utc_offset: utcOffset,
            week_number: now.week()
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error processing timezone request:", error);
        return res.status(500).json({ error: "Failed to process timezone request" });
    }
});

// get a list of all the supported timezones
app.get("/", (req, res) => {
    return res.status(200).json(moment.tz.names());
});

// Listen on port 
app.listen(PORT, (req, res) => console.log(`Running on ${PORT}!`));
