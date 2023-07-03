# VeiligStallen frontend app

This is the code repository of the VeiligStallen frontend app. The codebase uses NextJS and is written in JavaScript (React).

## First time setup

Run: `npm install`

Make sure that Docker is installed and working

Make sure that you have filled in the database config in the .env file. In example:

    DATABASE_URL="mysql://root:safepark99@localhost:3306/veiligstallen"
    PASSWD=safepark99

Make sure that you have filled in a Mapbox key in the .env.local file

Next, setup the database:

```bash
npm run setup-db
```

This above command creates a Docker container with MySQL loaded with the VeiligStallen test database

Next, the prisma ORM model is recreated

## Running the app

Make sure the database is running:

    npm run start-db

For development purposes:

    npm run dev

## Deploying the app

The app is deployed to a test server at the moment: https://veiligstallen.addbrainz.com/

Deploy a new version using these commands:

    ssh parkman@veiligstallen.addbrainz.com
    cd fietsberaad-veiligstallen-app
    ./scripts/remote/update-veiligstallen.sh

Deployment is configured like this:

- Op de testserver wordt een pull van de repository gedaan, daarna een npm build
- De app wordt gedraaid met de pm2 taakmanager
- Op de achtergrond draait altijd een Docker container voor de database
