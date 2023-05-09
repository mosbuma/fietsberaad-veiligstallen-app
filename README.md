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
