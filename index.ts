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

const getDstBounds = (
  zone: moment.MomentZone,
  now: moment.Moment,
): Pick<TimezoneResponse, "dst_from" | "dst_until"> => {
  const data: Pick<TimezoneResponse, "dst_from" | "dst_until"> = {
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
};

const getResponseForTimezone = (
  zone: moment.MomentZone,
  clientIp: string | null,
): TimezoneResponse => {
  // get current time in requested timezone
  const now = moment.tz(zone.name);
  const utcOffset = now.format("Z");
  const dst = now.isDST();

  // format response similar to worldtimeapi.org
  return {
    utc_offset: utcOffset,
    timezone: zone.name, // correct capitalization
    day_of_week: now.day(),
    day_of_year: now.dayOfYear(),
    datetime: now.format(),
    utc_datetime: moment.utc().format(),
    unixtime: Math.floor(now.valueOf() / 1000),
    raw_offset: now.utcOffset() * 36,
    week_number: now.week(),
    dst,
    abbreviation: now.zoneAbbr(),
    dst_offset: dst ? 3600 : 0,
    ...getDstBounds(zone, now),
    client_ip: clientIp,
  };
};

// get time by timezone in a given location (e.g. "/America/New_York")
app.get("/api/timezone/:area/:location", (c) => {
  try {
    // check if timezone is valid
    const timezone = `${c.req.param("area")}/${c.req.param("location")}`;
    const zone = moment.tz.zone(timezone);
    if (!zone) {
      return c.json({ error: "Timezone not found" }, 404);
    }
    return c.json(
      getResponseForTimezone(zone, c.req.header("CF-Connecting-IP") ?? null),
    );
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
    const zone = moment.tz.zone(timezone);
    if (!zone) {
      return c.json({ error: "Timezone not found" }, 404);
    }
    return c.json(
      getResponseForTimezone(zone, c.req.header("CF-Connecting-IP") ?? null),
    );
  } catch (error) {
    console.error("Error processing timezone request:", error);
    return c.json({ error: "Failed to process timezone request" }, 500);
  }
});

// get a list of all the supported timezones
app.get("/api/timezone", (c) => c.json(moment.tz.names()));

export default app;
