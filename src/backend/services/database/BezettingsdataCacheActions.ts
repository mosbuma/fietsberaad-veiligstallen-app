import { prisma } from "~/server/db";
import { CacheParams, CacheStatus } from "~/backend/services/database-service";
import moment from "moment";

export const getBezettingCacheStatus = async (params: CacheParams) => {
  const sqldetecttable = `SELECT COUNT(*) As count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name= 'Bezetting_aggregated'`;

  let tableExists = false;
  let status: CacheStatus | false = { status: 'missing', size: undefined, firstUpdate: undefined, lastUpdate: undefined };
  try {
    const result = await prisma.$queryRawUnsafe<{ count: number }[]>(sqldetecttable);
    tableExists = result && result.length > 0 && result[0] ? result[0].count > 0 : false;
    if (tableExists) {
      status.status = 'available';

      const sqlGetStatistics = `SELECT COUNT(*) As count, MIN(timestamp) AS firstUpdate, MAX(timestamp) AS lastupdate FROM Bezetting_aggregated WHERE NOT ISNULL(timestamp)`;
      const resultStatistics = await prisma.$queryRawUnsafe<{ count: number, firstUpdate: Date, lastupdate: Date }[]>(sqlGetStatistics);
      if (resultStatistics && resultStatistics.length > 0 && resultStatistics[0] !== undefined) {
        status.size = parseInt(resultStatistics[0].count.toString());
        status.firstUpdate = resultStatistics[0].firstUpdate;
        status.lastUpdate = resultStatistics[0].lastupdate;
      }
    }
    return status;
  } catch (error) {
    console.error(">>> getBezettingCacheStatus ERROR Unable to get Bezetting cache status", error);
    return false;
  }
}

export const updateBezettingCache = async (params: CacheParams) => {
  if (false === await clearBezettingCache(params)) {
    console.error(">>> updateBezettingCache ERROR Unable to clear Bezetting cache");
    return false;
  }

  const sql = `
      INSERT INTO Bezetting_aggregated (
        timestamp_Year,
        timestamp_Quarter,
        timestamp_Month,
        timestamp_Week,
        timestamp_Day,
        timestamp_Hour,
        timestamp_Weekday,
        bikeparkID,
        sectionID,
        source,
        totalCheckins,
        totalCheckouts,
        totalOccupation,
        totalCapacity,
        perc_occupation,
        fillup,
        open
      )
      SELECT
        YEAR(timestamp) AS timestamp_Year,
        MIN(QUARTER(timestamp)) AS timestamp_Quarter,
        MONTH(timestamp) AS timestamp_Month,
        MIN(WEEK(timestamp)) AS timestamp_Week,
        DAY(timestamp) AS timestamp_Day,
        HOUR(timestamp) AS timestamp_Hour,
        MIN(WEEKDAY(timestamp)) AS timestamp_Weekday,
        bikeparkID,
        sectionID,
        MIN(source),
        SUM(checkins) AS totalCheckins,
        SUM(checkouts) AS totalCheckouts,
        SUM(occupation) AS totalOccupation,
        SUM(capacity) AS totalCapacity,
        SUM(occupation) / SUM(capacity) * 100 AS perc_occupation,
        MIN(fillup),
        MIN(open)
      FROM Bezetting
      WHERE timestamp BETWEEN ${params.startDate} AND ${params.endDate}
      GROUP BY timestamp_Year, timestamp_Month, timestamp_Day, timestamp_Hour, bikeparkID, sectionID, source;
    `;
  await prisma.$executeRawUnsafe(sql);
  return getBezettingCacheStatus(params);
}

export const clearBezettingCache = async (params: CacheParams) => {
  const sql = `DELETE FROM Bezetting_aggregated WHERE timestamp BETWEEN ${params.startDate} AND ${params.endDate};`;
  await prisma.$executeRawUnsafe(sql);

  return getBezettingCacheStatus(params);
}

export const createBezettingCacheTable = async (params: CacheParams) => {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS Bezetting_aggregated (
        timestamp_Year INT,
        timestamp_Quarter INT,
        timestamp_Month INT,
        timestamp_Week INT,
        timestamp_Day INT,
        timestamp_Hour INT,
        timestamp_Weekday INT,
        bikeparkID VARCHAR(255),
        sectionID VARCHAR(255),
        source VARCHAR(255),
        totalCheckins INT,
        totalCheckouts INT,
        totalOccupation INT,
        totalCapacity INT,
        perc_occupation DECIMAL(5, 2),
        fillup BOOLEAN,
        open BOOLEAN,
        PRIMARY KEY (timestamp_Year, timestamp_Month, timestamp_Day, timestamp_Hour, bikeparkID, sectionID, source)
    );`;

  const result = await prisma.$queryRawUnsafe(sqlCreateTable);
  if (!result) {
    console.error("Unable to create Bezetting_aggregated table", result);
    return false;
  }

  return getBezettingCacheStatus(params);
}

export const dropBezettingCacheTable = async (params: CacheParams) => {
  const sql = "DROP TABLE IF EXISTS Bezetting_aggregated";

  const result = await prisma.$queryRawUnsafe(sql);
  if (!result) {
    console.error("Unable to drop Bezetting_aggregated table", result);
    return false;
  }

  return getBezettingCacheStatus(params);
} 