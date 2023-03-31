# installing

make sure that docker is installed and working
next setup the database:

- npm run setup-db
  this creates a docker container with mysql loaded with the veiligstallen test database
  next, the prisma ORM model is recreated

make sure that you have filled in a mapbox key in the .env.local file
