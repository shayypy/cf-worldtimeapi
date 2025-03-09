# WorldTimeAPI Clone

A reliable, self-hosted alternative to [WorldTimeAPI](http://worldtimeapi.org) that provides accurate timezone information via a simple REST API.

## Why Use This?

The public [WorldTimeAPI](http://worldtimeapi.org) service is frequently unreliable or down. This project allows you to:
- Host your own timezone API with the same familiar interface
- Ensure 100% uptime for your applications that depend on timezone data
- Avoid rate limits or service disruptions

## Features

- **Drop-in replacement** for [WorldTimeAPI](http://worldtimeapi.org) with compatible endpoints
- Get current time data for any timezone
- Retrieve daylight savings information
- Easily deployable on any Node.js hosting platform

## API Endpoints

### Get time for a specific timezone
```
GET /api/timezone/:area/:location
```

Example: `/api/timezone/America/New_York`

### Get time for root area timezone
```
GET /api/timezone/:area
```

Example: `/api/timezone/UTC`

### List all available timezones
```
GET /api/timezone
```

## Response Format

```json
{
  "abbreviation": "EDT",
  "client_ip": "192.168.1.1",
  "datetime": "2025-03-09T14:30:45-04:00",
  "day_of_week": 0,
  "day_of_year": 68,
  "dst": true,
  "dst_from": null,
  "dst_offset": 3600,
  "dst_until": null,
  "raw_offset": -18000,
  "timezone": "America/New_York",
  "unixtime": 1741027845,
  "utc_datetime": "2025-03-09T18:30:45Z",
  "utc_offset": "-04:00",
  "week_number": 10
}
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/owenrgu/worldtimeapi.git
cd worldtimeapi
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## Hosting

This application can be deployed to any Node.js hosting platform: DigitalOcean, Vercel, AWS, Railway, or your own VPS.

> DigitalOcean is offering $200 of free credit using my referral link [here](https://m.do.co/c/28c7e001c3e8). If you're looking to play around with web hosting, this is a great opportunity for you! DigitalOcean's [App Platform](https://docs.digitalocean.com/products/app-platform/) is a no-code solution to hosting this repository. You can even link the repository to automatically deploy any changes to this repository to your own app in real time!

## Contributing

If you would like to contribute to this repository, please open a Pull Request.

## Credits

This project was inspired by [WorldTimeAPI](http://worldtimeapi.org/) and aims to provide a reliable self-hosted alternative.
