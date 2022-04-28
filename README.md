# Strava2kilometrikisa-2
A fork from [the original Strava2Kilometrikisa app](https://github.com/jaamo/strava2kilometrikisa). Goal is to modernize the code and port the project to Typescript.

An application to fill the gap between [Strava](https://strava.com/) and [Kilometrikisa](https://www.kilometrikisa.fi/).

## Development

1. Run `$ docker-compose up -d` to spin up local Mongodb instance
2. Grab yourself some [Strava API credentials](https://developers.strava.com)
3. Copy and configure `.env.example` to `.env` and fill in the missing values
3. `$ source .env`
4. `$ nvm use`
5. `$ npm install`
6. `$ npm run dev`

## Deployment
The app should be easy to deploy to modern cloud environments. Basically all you need is to run the
main app process and syncing process. Following examples are for deploying to Heroku.

### Local
After setup run `npm run deploy` to run tests and then deploy `master` branch to the Heroku.

### Github Actions
Trigger `Deploy to Heroku` flow from the Github Actions manually.

## Database

This app uses a MongoDB database.

## How to contribute

We would love your input! Check out how to contribute [here](./.github/CONTRIBUTING.md).
