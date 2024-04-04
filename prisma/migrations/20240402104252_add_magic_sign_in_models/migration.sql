-- CreateTable
CREATE TABLE `abonnementsvorm_fietsenstalling` (
    `SubscriptiontypeID` INTEGER NOT NULL,
    `BikeparkID` VARCHAR(35) NOT NULL,

    UNIQUE INDEX `SubscriptiontypeID`(`SubscriptiontypeID`, `BikeparkID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `abonnementsvormen` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `naam` VARCHAR(255) NULL,
    `omschrijving` LONGTEXT NULL,
    `prijs` DECIMAL(8, 2) NULL,
    `tijdsduur` INTEGER NULL,
    `conditions` TEXT NULL,
    `siteID` VARCHAR(36) NULL,
    `bikeparkTypeID` VARCHAR(15) NULL,
    `isActief` BIT(1) NOT NULL DEFAULT b'1',
    `exploitantSiteID` VARCHAR(36) NULL,
    `idmiddelen` VARCHAR(40) NOT NULL DEFAULT 'sleutelhanger',
    `contractID` VARCHAR(35) NULL,
    `paymentAuthorizationID` VARCHAR(35) NULL,
    `conditionsID` VARCHAR(255) NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `abonnementsvorm_fietstype` (
    `SubscriptiontypeID` INTEGER NOT NULL,
    `BikeTypeID` INTEGER NOT NULL,

    UNIQUE INDEX `prismaID`(`SubscriptiontypeID`, `BikeTypeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `ID` VARCHAR(35) NOT NULL DEFAULT '',
    `Email` VARCHAR(100) NULL,
    `EncryptedPassword` VARCHAR(60) NULL,
    `Sex` VARCHAR(10) NULL,
    `FirstName` VARCHAR(100) NULL,
    `MiddleName` VARCHAR(50) NULL,
    `LastName` VARCHAR(100) NULL,
    `Address` VARCHAR(255) NULL,
    `Address_Nr` VARCHAR(10) NULL,
    `Zip` VARCHAR(10) NULL,
    `City` VARCHAR(100) NULL,
    `Phone` VARCHAR(50) NULL,
    `Mobile` VARCHAR(50) NULL,
    `Nieuwsbrief` VARCHAR(4) NULL,
    `Status` VARCHAR(4) NULL DEFAULT '1',
    `DateRegistration` DATETIME(0) NULL,
    `LastLogin` DATETIME(0) NULL,
    `DateDeleted` DATETIME(0) NULL,
    `saldo` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `account_type` ENUM('SYSTEM', 'USER', 'DELETED') NULL DEFAULT 'USER',
    `dateLastSaldoUpdate` TIMESTAMP(0) NULL,
    `dateLastPrize` DATETIME(0) NULL,
    `nameLastPrize` VARCHAR(255) NULL,

    UNIQUE INDEX `Email_2`(`Email`),
    INDEX `dateLastSaldoUpdate`(`dateLastSaldoUpdate`),
    INDEX `saldo`(`saldo`),
    INDEX `Email`(`Email`),
    INDEX `EncryptedPassword`(`EncryptedPassword`),
    INDEX `LastName`(`LastName`),
    INDEX `account_type`(`account_type`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `ID` VARCHAR(35) NOT NULL DEFAULT '',
    `SiteID` VARCHAR(35) NULL,
    `Language` VARCHAR(25) NULL,
    `ParentID` VARCHAR(35) NULL,
    `Title` VARCHAR(100) NULL,
    `DisplayTitle` VARCHAR(100) NULL,
    `Abstract` TEXT NULL,
    `Article` TEXT NULL,
    `CustomField1_Title` VARCHAR(255) NULL,
    `CustomField1` TEXT NULL,
    `Banner` VARCHAR(255) NULL,
    `Keywords` TEXT NULL,
    `SortOrder` INTEGER NULL,
    `PublishStartDate` DATETIME(0) NULL,
    `PublishEndDate` DATETIME(0) NULL,
    `Status` VARCHAR(4) NULL DEFAULT '1',
    `Navigation` VARCHAR(50) NULL,
    `ShowInNav` VARCHAR(4) NULL,
    `System` VARCHAR(4) NULL DEFAULT '0',
    `EditorCreated` VARCHAR(255) NULL,
    `DateCreated` DATETIME(0) NULL,
    `EditorModified` VARCHAR(255) NULL,
    `DateModified` DATETIME(0) NULL,
    `ModuleID` VARCHAR(50) NOT NULL DEFAULT 'veiligstallen',

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `ID` VARCHAR(35) NOT NULL DEFAULT '',
    `ItemType` VARCHAR(20) NULL,
    `GroupID` VARCHAR(20) NULL,
    `ParentID` VARCHAR(35) NULL,
    `ZipID` VARCHAR(4) NULL,
    `Gemeentecode` INTEGER NULL,
    `Paslezer` VARCHAR(20) NULL,
    `PassRange_validate` VARCHAR(4) NULL,
    `PassRange_start` BIGINT NULL,
    `PassRange_end` BIGINT NULL,
    `LockNGo` VARCHAR(4) NULL,
    `Helpdesk` VARCHAR(255) NULL DEFAULT '',
    `CompanyName` VARCHAR(100) NULL,
    `AlternativeCompanyName` VARCHAR(100) NULL,
    `UrlName` VARCHAR(100) NULL,
    `CompanyLogo` VARCHAR(255) NULL,
    `CompanyLogo2` VARCHAR(255) NULL,
    `Department` VARCHAR(255) NULL,
    `JobTitle` VARCHAR(255) NULL,
    `Sex` VARCHAR(10) NULL,
    `Title` VARCHAR(100) NULL,
    `Initials` VARCHAR(100) NULL,
    `FirstName` VARCHAR(255) NULL,
    `MiddleName` VARCHAR(50) NULL,
    `LastName` VARCHAR(255) NULL,
    `Address1` VARCHAR(255) NULL,
    `Address2` VARCHAR(255) NULL,
    `Zip1` VARCHAR(10) NULL,
    `Zip2` VARCHAR(10) NULL,
    `City1` VARCHAR(255) NULL,
    `City2` VARCHAR(255) NULL,
    `Country1` VARCHAR(50) NULL,
    `Country2` VARCHAR(50) NULL,
    `Phone1` VARCHAR(50) NULL,
    `Phone2` VARCHAR(50) NULL,
    `Mobile1` VARCHAR(50) NULL,
    `Mobile2` VARCHAR(50) NULL,
    `Fax1` VARCHAR(50) NULL,
    `Fax2` VARCHAR(50) NULL,
    `Email1` VARCHAR(255) NULL,
    `Email2` VARCHAR(255) NULL,
    `URL` VARCHAR(255) NULL,
    `Notes` TEXT NULL,
    `Status` VARCHAR(4) NULL DEFAULT '1',
    `Status_website` VARCHAR(4) NULL,
    `DateRegistration` DATETIME(0) NULL,
    `DateConfirmed` DATETIME(0) NULL,
    `DateRejected` DATETIME(0) NULL,
    `Winkansen_inzetten` VARCHAR(4) NULL,
    `SendEmailOnSaldo` DECIMAL(8, 2) NULL,
    `MinSaldoToUseLockers` DECIMAL(8, 2) NULL,
    `MinSaldoToOpenLocker` DECIMAL(8, 2) NULL,
    `Bankrekeningnr` VARCHAR(50) NULL,
    `PlaatsBank` VARCHAR(100) NULL,
    `Tnv` VARCHAR(100) NULL,
    `Coordinaten` VARCHAR(100) NULL,
    `Zoom` INTEGER NOT NULL DEFAULT 12,
    `TextLeftColumn` TEXT NULL,
    `TextRightColumn` TEXT NULL,
    `DayBeginsAt` TIME(0) NOT NULL DEFAULT '00:00:00',
    `ThemeColor1` VARCHAR(6) NOT NULL DEFAULT '1f99d2',
    `ThemeColor2` VARCHAR(6) NOT NULL DEFAULT '96c11f',
    `btwNummer` VARCHAR(50) NULL,
    `kvkNummer` VARCHAR(50) NULL,
    `durationOfLockerTempStatus` INTEGER NOT NULL DEFAULT 20,
    `Password` VARCHAR(52) NULL,

    UNIQUE INDEX `ZipID`(`ZipID`),
    UNIQUE INDEX `UrlName`(`UrlName`),
    INDEX `CompanyName`(`CompanyName`),
    INDEX `ItemType_idx`(`ItemType`),
    UNIQUE INDEX `ItemType`(`ItemType`, `CompanyName`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts_faq` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `SiteID` VARCHAR(36) NOT NULL,
    `FaqID` VARCHAR(36) NOT NULL,
    `Status` BIT(1) NOT NULL DEFAULT b'0',

    INDEX `FK4D3BB92A5CC39A7`(`FaqID`),
    INDEX `FK4D3BB92A668AE523`(`SiteID`),
    UNIQUE INDEX `SiteID`(`SiteID`, `FaqID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `ID` VARCHAR(35) NOT NULL DEFAULT '',
    `ArticleID` VARCHAR(35) NULL,
    `ParentID` VARCHAR(35) NULL,
    `Title` VARCHAR(255) NULL,
    `Description` VARCHAR(255) NULL,
    `Question` TEXT NULL,
    `Answer` TEXT NULL,
    `SortOrder` INTEGER NULL,
    `Status` VARCHAR(4) NULL DEFAULT '1',
    `EditorCreated` VARCHAR(255) NULL,
    `DateCreated` DATETIME(0) NULL,
    `EditorModified` VARCHAR(255) NULL,
    `DateModified` DATETIME(0) NULL,
    `ModuleID` VARCHAR(50) NULL,

    INDEX `FK18B1665AC5B13`(`ModuleID`),
    INDEX `FK18B16F3BE6D59`(`ParentID`),
    INDEX `ArticleID`(`ArticleID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fietsenstalling_sectie` (
    `sectieId` INTEGER NOT NULL AUTO_INCREMENT,
    `externalId` VARCHAR(13) NULL,
    `titel` VARCHAR(255) NOT NULL,
    `omschrijving` TEXT NULL,
    `capaciteit` INTEGER NULL,
    `CapaciteitBromfiets` INTEGER NULL,
    `kleur` VARCHAR(6) NOT NULL DEFAULT '23B0D9',
    `fietsenstallingsId` VARCHAR(35) NULL,
    `isKluis` BIT(1) NOT NULL DEFAULT b'0',
    `reserveringskostenPerDag` DOUBLE NULL,
    `urlwebservice` VARCHAR(255) NULL,
    `Reservable` BIT(1) NOT NULL DEFAULT b'0',
    `NotaVerwijssysteem` TEXT NULL,
    `Bezetting` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `isactief` BIT(1) NOT NULL DEFAULT b'1',
    `qualificatie` VARCHAR(255) NULL DEFAULT 'NONE',

    UNIQUE INDEX `externalId`(`externalId`),
    INDEX `FKA8FBA192D2C0280D`(`fietsenstallingsId`),
    INDEX `fietsenstallingsId`(`fietsenstallingsId`),
    INDEX `isactief`(`isactief`),
    PRIMARY KEY (`sectieId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fietsenstallingen` (
    `ID` VARCHAR(35) NOT NULL DEFAULT '',
    `StallingsID` VARCHAR(8) NULL,
    `SiteID` VARCHAR(35) NULL,
    `Title` VARCHAR(255) NULL,
    `StallingsIDExtern` VARCHAR(100) NULL,
    `Description` TEXT NULL,
    `Image` VARCHAR(255) NULL,
    `Location` VARCHAR(255) NULL,
    `Postcode` VARCHAR(7) NULL,
    `Plaats` VARCHAR(100) NULL,
    `Capacity` INTEGER NULL,
    `Openingstijden` TEXT NULL,
    `Status` VARCHAR(4) NULL DEFAULT '1',
    `EditorCreated` VARCHAR(255) NULL,
    `DateCreated` DATETIME(0) NULL,
    `EditorModified` VARCHAR(255) NULL,
    `DateModified` DATETIME(0) NULL,
    `Ip` VARCHAR(24) NULL,
    `Coordinaten` VARCHAR(255) NULL,
    `geoLocation` point NULL,
    `Type` VARCHAR(15) NULL,
    `Verwijssysteem` BIT(1) NOT NULL DEFAULT b'0',
    `VerwijssysteemOverzichten` BIT(1) NULL,
    `FMS` BIT(1) NOT NULL DEFAULT b'0',
    `Open_ma` TIME(0) NULL,
    `Dicht_ma` TIME(0) NULL,
    `Open_di` TIME(0) NULL,
    `Dicht_di` TIME(0) NULL,
    `Open_wo` TIME(0) NULL,
    `Dicht_wo` TIME(0) NULL,
    `Open_do` TIME(0) NULL,
    `Dicht_do` TIME(0) NULL,
    `Open_vr` TIME(0) NULL,
    `Dicht_vr` TIME(0) NULL,
    `Open_za` TIME(0) NULL,
    `Dicht_za` TIME(0) NULL,
    `Open_zo` TIME(0) NULL,
    `Dicht_zo` TIME(0) NULL,
    `OmschrijvingTarieven` TEXT NULL,
    `IsStationsstalling` BIT(1) NOT NULL DEFAULT b'0',
    `IsPopup` BIT(1) NOT NULL DEFAULT b'0',
    `NotaVerwijssysteem` TEXT NULL,
    `Tariefcode` INTEGER NULL,
    `Toegangscontrole` INTEGER NULL,
    `Beheerder` VARCHAR(100) NULL,
    `BeheerderContact` VARCHAR(255) NULL,
    `Url` TEXT NULL,
    `ExtraServices` TEXT NULL,
    `dia` TEXT NULL,
    `BerekentStallingskosten` BIT(1) NOT NULL DEFAULT b'0',
    `AantalReserveerbareKluizen` INTEGER NOT NULL DEFAULT 0,
    `MaxStallingsduur` INTEGER NOT NULL DEFAULT 0,
    `HeeftExterneBezettingsdata` BIT(1) NOT NULL DEFAULT b'0',
    `ExploitantID` VARCHAR(35) NULL,
    `hasUniSectionPrices` BIT(1) NOT NULL DEFAULT b'1',
    `hasUniBikeTypePrices` BIT(1) NOT NULL DEFAULT b'0',
    `shadowBikeparkID` VARCHAR(35) NULL,
    `BronBezettingsdata` VARCHAR(20) NULL DEFAULT 'FMS',
    `reservationCostPerDay` DECIMAL(8, 2) NULL,
    `wachtlijst_Id` BIGINT NULL,
    `freeHoursReservation` DECIMAL(8, 2) NULL,
    `thirdPartyReservationsUrl` VARCHAR(255) NULL,

    UNIQUE INDEX `idxstallingsid`(`StallingsID`),
    INDEX `idxSiteidstid`(`StallingsID`, `SiteID`),
    INDEX `sidxsiteid`(`SiteID`),
    INDEX `ExploitantID`(`ExploitantID`),
    INDEX `FKF4836A55668AE523`(`SiteID`),
    INDEX `shadowBikeparkID`(`shadowBikeparkID`),
    INDEX `wachtlijst_Id`(`wachtlijst_Id`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fietsenstallingen_services` (
    `ServiceID` VARCHAR(50) NOT NULL,
    `FietsenstallingID` VARCHAR(35) NOT NULL,

    INDEX `FK4BB0A7082B597E32`(`FietsenstallingID`),
    INDEX `FK4BB0A708CDE95925`(`ServiceID`),
    PRIMARY KEY (`ServiceID`, `FietsenstallingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fietsenstallingtypen` (
    `id` VARCHAR(15) NOT NULL,
    `name` VARCHAR(255) NULL,
    `sequence` SMALLINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fietstypen` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NULL,
    `naamenkelvoud` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sectie_fietstype` (
    `SectionBiketypeID` INTEGER NOT NULL AUTO_INCREMENT,
    `Capaciteit` INTEGER NULL,
    `Toegestaan` BIT(1) NULL,
    `sectieID` INTEGER NULL,
    `StallingsID` VARCHAR(35) NULL,
    `BikeTypeID` INTEGER NULL,

    INDEX `sectieID`(`sectieID`),
    INDEX `BikeTypeID`(`BikeTypeID`),
    INDEX `StallingsID`(`StallingsID`),
    UNIQUE INDEX `sectieID_2`(`sectieID`, `StallingsID`, `BikeTypeID`),
    PRIMARY KEY (`SectionBiketypeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_roles` (
    `RoleID` INTEGER NOT NULL AUTO_INCREMENT,
    `GroupID` ENUM('intern', 'extern', 'exploitant', 'beheerder') NULL DEFAULT 'extern',
    `Role` VARCHAR(50) NULL,
    `Description` VARCHAR(150) NULL,
    `Active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`RoleID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_users` (
    `UserID` VARCHAR(35) NOT NULL DEFAULT '',
    `Locale` VARCHAR(55) NULL DEFAULT 'Dutch (Standard)',
    `RoleID` INTEGER NULL,
    `GroupID` VARCHAR(20) NULL,
    `SiteID` VARCHAR(35) NULL,
    `ParentID` VARCHAR(35) NULL,
    `UserName` VARCHAR(100) NULL,
    `EncryptedPassword` VARCHAR(60) NULL,
    `EncryptedPassword2` VARCHAR(255) NULL,
    `DisplayName` VARCHAR(255) NULL,
    `LastLogin` DATETIME(0) NULL,
    `SendMailToMailAddress` VARCHAR(4) NULL,
    `Theme` VARCHAR(50) NULL,
    `Status` VARCHAR(4) NULL,

    INDEX `RoleID`(`RoleID`),
    INDEX `UserName`(`UserName`),
    UNIQUE INDEX `unique_userID_siteID`(`UserID`, `SiteID`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_users_sites` (
    `ID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `UserID` VARCHAR(35) NOT NULL DEFAULT '',
    `SiteID` VARCHAR(35) NOT NULL,
    `IsContact` BIT(1) NOT NULL DEFAULT b'0',

    UNIQUE INDEX `UserID`(`UserID`, `SiteID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `ID` VARCHAR(50) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `abonnementsvorm_fietsenstalling` ADD CONSTRAINT `abonnementsvorm_fietsenstalling_SubscriptiontypeID_fkey` FOREIGN KEY (`SubscriptiontypeID`) REFERENCES `abonnementsvormen`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abonnementsvorm_fietsenstalling` ADD CONSTRAINT `abonnementsvorm_fietsenstalling_BikeparkID_fkey` FOREIGN KEY (`BikeparkID`) REFERENCES `fietsenstallingen`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abonnementsvorm_fietstype` ADD CONSTRAINT `FK_avft_av` FOREIGN KEY (`BikeTypeID`) REFERENCES `abonnementsvormen`(`ID`) ON DELETE NO ACTION ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `abonnementsvorm_fietstype` ADD CONSTRAINT `FK_avft_ft` FOREIGN KEY (`SubscriptiontypeID`) REFERENCES `fietstypen`(`ID`) ON DELETE NO ACTION ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fietsenstalling_sectie` ADD CONSTRAINT `fietsenstalling_sectie_fietsenstallingsId_fkey` FOREIGN KEY (`fietsenstallingsId`) REFERENCES `fietsenstallingen`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fietsenstallingen` ADD CONSTRAINT `fietsenstallingen_Type_fkey` FOREIGN KEY (`Type`) REFERENCES `fietsenstallingtypen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fietsenstallingen` ADD CONSTRAINT `FKCC75C0BE66279D19` FOREIGN KEY (`ExploitantID`) REFERENCES `contacts`(`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fietsenstallingen_services` ADD CONSTRAINT `FK_fietsenstallingen_service_fietsenstalling` FOREIGN KEY (`FietsenstallingID`) REFERENCES `fietsenstallingen`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fietsenstallingen_services` ADD CONSTRAINT `FK_fietsenstallingen_service_service` FOREIGN KEY (`ServiceID`) REFERENCES `services`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sectie_fietstype` ADD CONSTRAINT `FK_sectie_fietstype_sectie` FOREIGN KEY (`sectieID`) REFERENCES `fietsenstalling_sectie`(`sectieId`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sectie_fietstype` ADD CONSTRAINT `FK_sectie_fietstype_fietstype` FOREIGN KEY (`BikeTypeID`) REFERENCES `fietstypen`(`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `security_users` ADD CONSTRAINT `security_users_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `security_roles`(`RoleID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `security_users_sites` ADD CONSTRAINT `security_users_sites_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `security_users`(`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
