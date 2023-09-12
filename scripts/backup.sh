#!/bin/bash

DB_HOST=vst-eu-prd-msql02.mysql.database.azure.com
DB_USER=veiligstallen_web
DB_NAME=veiligstallen
TABLES_WITH_DATA="articles fietsenstallingen services faq security_users fietsenstallingtypen contacts abonnementsvormen abonnementsvorm_fietsenstalling contacts_faq fietsenstalling_sectie security_users_sites fietstypen security_roles sectie_fietstype fietsenstallingen_services abonnementsvorm_fietstype"
#TABLES_NO_DATA="accounts"
DUMP_FILE="./mysql-db/export-db.sql"

echo "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;" > "$DUMP_FILE"
echo "USE \`$DB_NAME\`;" >> "$DUMP_FILE"

echo "backup part #1 - export tables with data"
# --skip-extended-insert 
mysqldump -h "$DB_HOST" -u "$DB_USER" -p --no-tablespaces "$DB_NAME" $TABLES_WITH_DATA >> "$DUMP_FILE"


# echo "backup part #2 - export table structures without data"
# mysqldump -h "$DB_HOST" -u "$DB_USER" -p --no-tablespaces --no-data "$DB_NAME" $TABLES_NO_DATA >> "$DUMP_FILE"

echo "add test accounts"
# test user password is bicyclerace2023!!
echo "INSERT INTO accounts(ID,Email,EncryptedPassword,account_type) VALUES ('TESTUSER-0000-0000-0000000000000001','test-user@veiligstallen.nl','$2a$04$MEulVPUqm1m4kNlxsJ/EJeMApMgmaRfgOMmIlSJaEZt30aH3TJK/.','USER');" >> "$DUMP_FILE"
echo "INSERT INTO security_users(UserID,RoleID,GroupID,UserName,EncryptedPassword,DisplayName,Status) VALUES('TESTUSER-0000-0000-0000000000000002',9,'intern','admin-user@veiligstallen.nl','$2a$04$MEulVPUqm1m4kNlxsJ/EJeMApMgmaRfgOMmIlSJaEZt30aH3TJK/.','Test Admin #1', 1);" >> "$DUMP_FILE"
echo "INSERT INTO security_users(UserID,RoleID,GroupID,UserName,EncryptedPassword,DisplayName,Status) VALUES('TESTUSER-0000-0000-0000000000000003',9,'intern','admin-user2@veiligstallen.nl','$2a$04$MEulVPUqm1m4kNlxsJ/EJeMApMgmaRfgOMmIlSJaEZt30aH3TJK/.','Test Admin #2',1);" >> "$DUMP_FILE"

echo "Export to $DUMP_FILE complete"
