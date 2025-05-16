// Owen Meade, March 2025
// Libraries
const express = require("express");
const moment = require("moment-timezone");

// Constants
const app = express();
const PORT = 1337;

const getDstBounds = (zone, now) => {
    const data = {
        dst_from: null,
        dst_until: null,
    };
    if (!now.isDST()) return data;

    const unix = now.valueOf();
    let protoFrom = zone.untils[0] ?? 0;
    let protoUntil = zone.untils[zone.untils.length - 1] ?? 0;
    for (const until of zone.untils) {
        if (until < unix && until > protoFrom) {
            protoFrom = until;
        }
        if (until > unix && until < protoUntil) {
            protoUntil = until;
        }
    }

    // return 0-offset timestamp strings
    data.dst_from = moment(protoFrom).utc().format();
    data.dst_until = moment(protoUntil).utc().format();
    return data;
}

// Routes
// get time by timezone in a given location (e.g. "/America/New_York")
app.get("/api/timezone/:area/:location", (req, res) => {
    try {
        // check if timezone is valid
        const timezone = `${req.params.area}/${req.params.location}`;
        const zone = moment.tz.zone(timezone);
        if (!zone) {
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
            dst_offset: dst ? 3600 : 0,
            ...getDstBounds(zone, now),
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
app.get("/api/timezone/:area", (req, res) => {
    try {
        // check if timezone is valid
        const timezone = req.params.area;
        const zone = moment.tz.zone(timezone);
        if (!zone) {
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
            dst_offset: dst ? 3600 : 0,
            ...getDstBounds(zone, now),
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
app.get("/api/timezone", (req, res) => {
    return res.status(200).json(moment.tz.names());
});

// Listen on port 
app.listen(PORT, (req, res) => console.log(`Running on ${PORT}!`));
