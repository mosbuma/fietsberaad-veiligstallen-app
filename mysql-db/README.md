# notes for database import / introspection in prisma

## create script (create-db.sh)

- removes the existing database and docker container
- creates a new docker container running mysql
- imports the veiligstallen test database into the server
- patches the database for use with prisma introspection

## patch script (fix-for-prisma.sql)

some tables are missing primary keys: patch script fixes this:

- abonnementsvorm_fietsenstalling -> create key from table columns
- abonnementsvorm_fietstype -> create key from table columns
- batch_job_execution_params -> add extra prismaID column
- faq -> set existing key to primary
- modules_contacts -> add extra prismaID column
- plaats_fietstype -> add extra prismaID column
- wachtlijst_fietstype -> add extra prismaID column

TODO:
These fields are not supported by the Prisma Client, because Prisma currently does not support their types.

- Model "ds_parking_locations", field: "geoShape", original data type: "geometry"
- Model "ds_sections", field: "geoShape", original data type: "geometry"
- Model "ds_survey_areas", field: "geoShape", original data type: "geometry"
- Model "fietsenstallingen", field: "geoLocation", original data type: "point"

## update prisma client when test database schema changes

change to nextjs project root
npx prisma db pull --force
npx prisma generate
