import { prisma } from "~/server/db";
import { CacheParams, CacheStatus } from "~/backend/services/database-service";
import moment from "moment";
import { debugLog } from "~/backend/services/reports/ReportFunctions";

export const getStallingsduurCacheStatus = async (params: CacheParams) => {
    const sqldetecttable = `SELECT COUNT(*) As count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name= 'stallingsduur_cache'`

    let tableExists = false;
    let status: CacheStatus | false = { 
        status: 'missing', 
        size: undefined, 
        firstUpdate: undefined, 
        lastUpdate: undefined, 
        originalSize: undefined, 
        originalFirstUpdate: undefined, 
        originalLastUpdate: undefined 
    };
    try {
        const result = await prisma.$queryRawUnsafe<{ count: number }[]>(sqldetecttable); //  as 
        tableExists = result && result.length>0 && result[0] ? result[0].count > 0: false;
        if(tableExists) {
            status.status = 'available';

            const sqlGetStatistics = `SELECT COUNT(*) As count, MIN(checkoutdate) AS firstUpdate, MAX(checkoutdate) AS lastupdate FROM stallingsduur_cache WHERE NOT ISNULL(checkoutdate)`;
            const resultStatistics = await prisma.$queryRawUnsafe<{ count: number, firstUpdate: Date, lastupdate: Date }[]>(sqlGetStatistics);
            if(resultStatistics && resultStatistics.length>0 && resultStatistics[0]!==undefined) {
                status.size = parseInt(resultStatistics[0].count.toString());    
                status.firstUpdate = resultStatistics[0].firstUpdate;
                status.lastUpdate = resultStatistics[0].lastupdate;
            };

            const sqlGetOriginalStatistics = `SELECT COUNT(*) As count, MIN(checkoutdate) AS firstUpdate, MAX(checkoutdate) AS lastUpdate FROM transacties_archief WHERE NOT ISNULL(checkoutdate)`;
            const resultOriginalStatistics = await prisma.$queryRawUnsafe<{ count: number, firstUpdate: Date, lastUpdate: Date }[]>(sqlGetOriginalStatistics);
            if (resultOriginalStatistics && resultOriginalStatistics.length > 0 && resultOriginalStatistics[0] !== undefined) {
                status.originalSize = parseInt(resultOriginalStatistics[0].count.toString());
                status.originalFirstUpdate = resultOriginalStatistics[0].firstUpdate;
                status.originalLastUpdate = resultOriginalStatistics[0].lastUpdate;
            }

        } 
        return status;
    } catch (error) {
        console.error(">>> getStallingsduurCacheStatus ERROR Unable to get transaction cache status", error);
        return false;
    }
}

export const updateStallingsduurCache = async (params: CacheParams) => {
    if(false=== await clearStallingsduurCache(params)) {
        console.error(">>> updateStallingsduurCache ERROR Unable to clear transaction cache");
        return false;
    }

    const dayBeginsAt = new Date(0, 0, 0);
    const timeIntervalInMinutes = dayBeginsAt.getHours() * 60 + dayBeginsAt.getMinutes();

    // TODO: check if timeinterval offset works correctly, link to offset settings in database
    // current db model links to contacts.DayBeginsAt field

    const conditions = [];
    if (!params.allDates) {
        conditions.push(`checkoutdate >= DATE_ADD('${moment(params.startDate).format('YYYY-MM-DD 00:00:00')}', INTERVAL -${timeIntervalInMinutes} MINUTE)`);
    }
    if (!params.allBikeparks) {
        conditions.push(`locationID IN (${params.selectedBikeparkIDs.map(bp=>`'${bp}'`).join(',')})`);
    }

    // conditions.push(`NOT ISNULL(checkoutdate)`);
    conditions.push(`checkintype = 'user'`);
    conditions.push(`checkouttype = 'user'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const calculateBucketItems = []
    calculateBucketItems.push(`  CASE`);
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 14 * 24 * 60 THEN 10`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 14 * 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 7 * 24 * 60 THEN 9`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 7 * 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 2 * 24 * 60 THEN 8`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 2 * 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 1 * 24 * 60 THEN 7`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 8 * 60 THEN 6`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 8 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 4 * 60 THEN 5`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 4 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 2 * 60 THEN 4`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 2 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 1 * 60 THEN 3`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 30 THEN 2`);[]
    calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 30 THEN 1`);[]
    calculateBucketItems.push(`    ELSE 'Unknown' END`);
    const sqlCalculateBucket = calculateBucketItems.join('\n');
  

    const statementItems = [];
    statementItems.push(`INSERT INTO stallingsduur_cache (locationID, checkoutdate, sectionID, clienttypeID, bucket, count_transacties)`);
    statementItems.push(`SELECT `);
    statementItems.push(`  locationID,`);
    statementItems.push(`  DATE(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) AS date,`);
    statementItems.push(`  sectionID,`);
    statementItems.push(`  clienttypeID,`);
    statementItems.push(`  ${sqlCalculateBucket} as bucket,`);
    statementItems.push(`  COUNT(*) AS count_transacties`);
    statementItems.push(`FROM transacties_archief`);
    statementItems.push(`  ${whereClause}`);
    statementItems.push(`GROUP BY locationID, date, sectionID, clienttypeid, bucket;`);
    const sql = statementItems.join('\n');  

    debugLog("************** updateStallingsduurCache sql:")
    debugLog(sql);
    
    /* const result = */ await prisma.$executeRawUnsafe(sql);
    return getStallingsduurCacheStatus(params);
}

export const clearStallingsduurCache = async (params: CacheParams) => {
    if(!params.allDates && !params.startDate) {
        console.error(">>> clearStallingsduurCache ERROR No start date provided");
        return false;
    }
    if (!params.allBikeparks && (!params.selectedBikeparkIDs || params.selectedBikeparkIDs.length===0)) {
        console.error(">>> clearStallingsduurCache ERROR No bikeparks selected");
        return false;
    }

    const conditions = [];
    if (!params.allDates) {
      conditions.push(`checkoutdate >= '${moment(params.startDate).format('YYYY-MM-DD 00:00:00')}'`);
    }
    if (!params.allBikeparks) {
      conditions.push(`locationID IN (${params.selectedBikeparkIDs.map(bp=>`'${bp}'`).join(',')})`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `DELETE FROM stallingsduur_cache ${whereClause};`;
    await prisma.$executeRawUnsafe(sql);

    return getStallingsduurCacheStatus(params);
}

export const createStallingsduurCacheTable = async (params: CacheParams) => {
    const sqlCreateTable = `CREATE TABLE IF NOT EXISTS stallingsduur_cache (
        ID int NOT NULL AUTO_INCREMENT,
        locationID VARCHAR(255) NOT NULL,
        checkoutdate DATETIME NULL,
        sectionID VARCHAR(255) NOT NULL,
        clienttypeid INT NOT NULL,
        bucket INT NOT NULL,
        count_transacties INT NOT NULL,
        PRIMARY KEY (ID)
    );`;

    // const sqlCreateIndex = `CREATE INDEX idx_location_date IF NOT EXISTS ON stallingsduur_cache (locationID, checkoutdate);`

    const result1 = await prisma.$queryRawUnsafe(sqlCreateTable);
    if(!result1) {
        console.error("Unable to create transactions_cache table",result1);
        return false;
    }

    // const result2 = await prisma.$queryRawUnsafe(sqlCreateIndex);
    // if(!result2) {
    //     console.error("Unable to create location/date index on transactions_cache table",result2);
    //     return false;
    // }

    return getStallingsduurCacheStatus(params);
}

export const dropStallingsduurCacheTable = async (params: CacheParams) => {
    const sql = "DROP TABLE IF EXISTS stallingsduur_cache";

    const result = await prisma.$queryRawUnsafe(sql);
    if(!result) {
        console.error("Unable to drop transactions_cache table",result);
        return false;
    }

    return getStallingsduurCacheStatus(params);
}