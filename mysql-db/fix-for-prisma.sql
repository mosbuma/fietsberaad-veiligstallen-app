USE veiligstallen;
-- ALTER TABLE abonnementsvorm_fietsenstalling ADD UNIQUE KEY `prismaID` (`SubscriptiontypeID`,`BikeparkID`);
-- ALTER TABLE abonnementsvorm_fietstype ADD UNIQUE KEY `prismaID` (`SubscriptiontypeID`,`BikeTypeID`);
-- ALTER TABLE batch_job_execution_params ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE faq ADD PRIMARY KEY(ID);
-- ALTER TABLE modules_contacts ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE plaats_fietstype ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE wachtlijst_fietstype ADD prismaID MEDIUMINT NOT NULL AUTO_INCREMENT KEY;
-- ALTER TABLE zones ADD PRIMARY KEY(zone_id);
-- ALTER TABLE zones ADD UNIQUE KEY `prismaID` (`zone_id`);

-- # Create Standard view for veiligstallen-app
-- CREATE OR REPLACE VIEW viewFietsenstallingen (SiteID, Title, Description, Image, Location, Postcode, Coordinaten, IsStationsstalling, isPopup, StallingType, StallingTypeName) AS SELECT SiteID, Title, Description, Image, Location, Postcode, Coordinaten, IsStationsstalling, isPopup, Type, name FROM fietsenstallingen FS LEFT OUTER JOIN fietsenstallingtypen FST ON (FS.Type=FST.ID);
