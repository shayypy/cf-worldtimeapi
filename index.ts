// Original: Owen Meade, March 2025

// Modified by shay (shayypy) - converted to TS & Hono for CF workers

import { Hono } from "hono";
import moment from "moment-timezone";

const app = new Hono();

interface TimezoneResponse {
  abbreviation: string;
  client_ip: string | null;
  datetime: string;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  dst_from: string | null;
  dst_offset: number;
  dst_until: string | null;
  raw_offset: number;
  timezone: string;
  unixtime: number;
  utc_datetime: string;
  utc_offset: string;
  week_number: number;
}

// get time by timezone in a given location (e.g. "/America/New_York")
app.get("/api/timezone/:area/:location", (c) => {
  try {
    // check if timezone is valid
    const timezone = `${c.req.param("area")}/${c.req.param("location")}`;
    if (!moment.tz.zone(timezone)) {
      return c.json({ error: "Timezone not found" }, 404);
    }

    // get current time in requested timezone
    const now = moment.tz(timezone);
    const utcOffset = now.format("Z");
    const dst = now.isDST();

    // format response similar to worldtimeapi.org
    const response = {
      abbreviation: now.format("z"),
      client_ip: c.req.header("CF-Connecting-IP") ?? null,
      datetime: now.format(),
      day_of_week: now.day(),
      day_of_year: now.dayOfYear(),
      dst,
      dst_from: null,
      dst_offset: dst ? 3600 : 0,
      dst_until: null,
      raw_offset: Number.parseInt(utcOffset.replace(":", "")) * 36,
      timezone,
      unixtime: Math.floor(now.valueOf() / 1000),
      utc_datetime: moment.utc().format(),
      utc_offset: utcOffset,
      week_number: now.week(),
    } satisfies TimezoneResponse;

    return c.json(response);
  } catch (error) {
    console.error("Error processing timezone request:", error);
    return c.json({ error: "Failed to process timezone request" }, 500);
  }
});

// simplified route for area timezones if known (e.g. "UTC")
app.get("/api/timezone/:area", (c) => {
  try {
    // check if timezone is valid
    const timezone = c.req.param("area");
    if (!moment.tz.zone(timezone)) {
      return c.json({ error: "Timezone not found" }, 404);
    }

    // same logic as above, just with different parameter structure
    const now = moment.tz(timezone);
    const utcOffset = now.format("Z");
    const dst = now.isDST();

    const response = {
      abbreviation: now.format("z"),
      client_ip: c.req.header("CF-Connecting-IP") ?? null,
      datetime: now.format(),
      day_of_week: now.day(),
      day_of_year: now.dayOfYear(),
      dst,
      dst_from: null,
      dst_offset: dst ? 3600 : 0,
      dst_until: null,
      raw_offset: Number.parseInt(utcOffset.replace(":", "")) * 36,
      timezone,
      unixtime: Math.floor(now.valueOf() / 1000),
      utc_datetime: moment.utc().format(),
      utc_offset: utcOffset,
      week_number: now.week(),
    } satisfies TimezoneResponse;

    return c.json(response);
  } catch (error) {
    console.error("Error processing timezone request:", error);
    return c.json({ error: "Failed to process timezone request" }, 500);
  }
});

// get a list of all the supported timezones
app.get("/api/timezone", (c) => c.json(moment.tz.names()));

export default app;
