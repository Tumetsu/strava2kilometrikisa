# Strava2kilometrikisa-2
A fork from [the original Strava2Kilometrikisa app](https://github.com/jaamo/strava2kilometrikisa). Goal is to modernize the code and port the project to Typescript.

An application to fill the gap between [Strava](https://strava.com/) and [Kilometrikisa](https://www.kilometrikisa.fi/).

## Development

1. Run `$ docker-compose up -d` to spin up local Mongodb instance
2. Grab yourself some [Strava API credentials](https://developers.strava.com)
3. Copy and configure `app/.env.example` to `app/.env`
3.`$ source .env`
4. `$ nvm use`
5. `$ npm install`
6. `$ npm run dev`

## Production setup
1. Create a project to GCP
2. Setup service account
3. Enable Secret Manager
4. Add secrets corresponding the secrets found in `environment.ts` and set correct resource ids to each secret.
5. Run `gcloud init` and create new configuration for this project to deploy the app to the target environment.
6. run `gcloud app deploy`

[More information about secret management](https://medium.com/@shashkiranr/typescript-gcp-secret-manager-firebase-app-engine-multiple-environment-better-credential-45198f3e53e)

## Deployment 

### Local
After setup run `npm run deploy` to build and deploy the application

### Github Actions
Trigger deployment from the Github Actions manually. Requires a proper service account key to be set to the 
Github environment.

## Database

This app uses a MongoDB database.

## How to contribute

We would love your input! Check out how to contribute [here](./.github/CONTRIBUTING.md).
