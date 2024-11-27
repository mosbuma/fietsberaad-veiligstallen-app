# VeiligStallen frontend app

This is the code repository of the VeiligStallen frontend app. The codebase uses NextJS and is written in JavaScript (React).

## First time setup

### Install dependencies

Run: `npm install`

Make sure that Docker is installed and working

### Fill in database credentials in the .env file

Make sure that you have filled in the database config in the .env file. In example:

    DATABASE_URL="mysql://root:safepark99@localhost:3308/veiligstallen"
    PORT=3308
    PASSWD=safepark99

Make sure that you have filled in a Mapbox key in the .env.local file

### Setup database

Next, setup the database:

```bash
npm run setup-db
```

This above command creates a Docker container with MySQL loaded with the VeiligStallen test database. The prisma ORM model is recreated automatically.

### Create key for nextauth

In your terminal, run:

    openssl rand -base64 32

Add the key in `.env`, as value for `NEXTAUTH_SECRET`

## Running the app

Make sure the database is running:

    npm run start-db

For development purposes:

    npm run dev

## Deploying the app

The app is deployed to a test server at the moment: https://beta.veiligstallen.nl/

Deploy a new version using these commands:

    ssh parkman@beta.veiligstallen.nl
    ./deploy.sh

Deployment is configured like this:

- Op de testserver wordt een pull van de repository gedaan, daarna een npm build
- De app wordt gedraaid met de pm2 taakmanager
- Op de achtergrond draait altijd een Docker container voor de database

^ DIT IS OUDE INFORMATIE - DEPLOYMENT VINDT AUTOMATISCH PLAATS VIA GITLAB CI/CD PIPELINES (ACTIONS)

## Exporting postgresql table as MySQL compatible statements

    pg_dump -h localhost -U deelfietsdashboard -d deelfietsdashboard -t zones --port 5431 --format=c --inserts > zones.sql

## Using Dashboard Deelmobiliteit API call for getting municipality

Get municipality based on latitude/longitude:

    https://api.dashboarddeelmobiliteit.nl/dashboard-api/public/get_municipality_based_on_latlng?location=52.0,4.5

Error response:

    https://api.dashboarddeelmobiliteit.nl/dashboard-api/public/get_municipality_based_on_latlng?location=52.0,7.5

## Create a docker image for the veiligstallen application

- make sure that your .env file containers the settings that should be used server side (your development settings can be set in .env.local: this overrides the .env settings)
- first make sure that the prisma binaries have been generated (npx prisma generate)
- next create the docker container using the `npm run docker-build` command
- the docker image can be started locally by running `npm run docker-run`

--

Stap van schema-full.prisma is auto generated.
schema.prisma is de uitgeklede versie en moet je handmatig aanpassen bij updates in het schema

NOTE: Na elke `npm run setup-db` moet schema.prisma worden gerevert.

`npx prisma generate` daarna: dat maakt de classes in de app op basis van het schema.

(als ik geen setup-db meer doet, blijft alles hetzelfde)
