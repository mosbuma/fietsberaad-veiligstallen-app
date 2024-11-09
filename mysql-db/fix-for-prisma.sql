USE veiligstallen;

ALTER TABLE abonnementsvorm_fietsenstalling ADD UNIQUE KEY `prismaID` (`SubscriptiontypeID`,`BikeparkID`);
ALTER TABLE abonnementsvorm_fietstype ADD UNIQUE KEY `prismaID` (`SubscriptiontypeID`,`BikeTypeID`);

DROP TABLE tariefregels_copy1
DROP TABLE tariefregels_copy2
DROP TABLE tariefregels_copy3
DROP TABLE tariefregels_copy4
DROP TABLE tariefregels_copy5
DROP TABLE tariefregels_tmp

-- ALTER TABLE batch_job_execution_params ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE faq ADD PRIMARY KEY(ID);
-- ALTER TABLE modules_contacts ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE plaats_fietstype ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE wachtlijst_fietstype ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE zones ADD PRIMARY KEY(zone_id);
-- ALTER TABLE zones ADD UNIQUE KEY `prismaID` (`zone_id`);

ALTER TABLE bikeparklog MODIFY PlaceID BIGINT;
ALTER TABLE financialtransactions MODIFY placeID BIGINT;
ALTER TABLE fmsservicelog MODIFY placeID BIGINT;
ALTER TABLE fietsenstalling_plek MODIFY sectie_id BIGINT;
ALTER TABLE abonnementen MODIFY sectionID BIGINT;
ALTER TABLE abonnementen MODIFY plekID BIGINT;
ALTER TABLE transacties MODIFY PlaceID BIGINT;


