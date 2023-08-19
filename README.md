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

## Exporting postgresql table as MySQL compatible statements

    pg_dump -h localhost -U deelfietsdashboard -d deelfietsdashboard -t zones --port 5431 --format=c --inserts > zones.sql
