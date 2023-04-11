#!/bin/bash
#source https://earthly.dev/blog/docker-mysql/

CWD=$(pwd)
source "../.env"

if [ ! -$PASSWD ]; then
    echo "Set the password for mysql server in the .env file"
    exit 0
fi

read -p "Warning: Running this scripts will delete the existing database. Continue? (yes/no) " yn
case $yn in 
    yes ) ;;
    no ) echo exiting...;
        exit;;
    * ) echo invalid response;
        exit 1;;
esac

echo "remove existing database and docker container"
docker stop veiligstallen-mysql
docker rm veiligstallen-mysql

echo enter your password to delete the database files
sudo rm -rf $CWD/persist-db
mkdir -p $CWD/persist-db

echo $PASSWD > "$CWD/secrets/mysql-root-password"

echo "create veiligstallen mysql database"
docker run --name veiligstallen-mysql -d \
    -p $PORT:3306 \
    -e MYSQL_ROOT_PASSWORD_FILE=run/secrets/mysql-root-password \
    -v $CWD/persist-db:/var/lib/mysql \
    -v $CWD/secrets:/run/secrets \
    mysql:5.7
# --restart unless-stopped \

echo "pausing to give mysql server time to start"
sleep 10

echo "importing veiligstallen test database"
docker exec -i veiligstallen-mysql mysql -h127.0.0.1 -P3306 -uroot --password=$PASSWD < $PWD/initial_db.min.sql 

echo "applying patch for prisma introspection"
docker exec -i veiligstallen-mysql mysql -h127.0.0.1 -P3306 -uroot --password=$PASSWD < $PWD/fix-for-prisma.sql 
