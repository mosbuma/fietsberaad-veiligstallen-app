import { ReportParams } from "~/components/beheer/reports/ReportsFilter";
import {
  getFunctionForPeriod,
  interpolateSQL
} from "~/backend/services/reports/ReportFunctions";

import moment from 'moment';

export const getSQL = (params: ReportParams, useCache: boolean = true): string | false => {
  const {
    reportType,
    reportGrouping,
    reportCategories,
    bikeparkIDs,
    startDT: startDate,
    endDT: endDate
  } = params;

  if (["bezetting"].includes(reportType) === false) {
    throw new Error("Invalid report type");
    return false;
  }

  const dayBeginsAt = new Date(0, 0, 0);

  // Calculate time interval in minutes
  const timeIntervalInMinutes = dayBeginsAt.getHours() * 60 + dayBeginsAt.getMinutes();

  let adjustedStartDate = moment(startDate);
  let adjustedEndDate = moment(endDate);
  adjustedStartDate = adjustedStartDate.add(timeIntervalInMinutes, 'minutes');
  adjustedEndDate = adjustedEndDate.add(timeIntervalInMinutes, 'minutes');

  const statementItems = [];
  statementItems.push(`SELECT`);
  switch (reportCategories) {
    case "per_stalling":
      statementItems.push(`  b.bikeparkID AS CATEGORY,`);
      break;
    case "per_weekday":
      statementItems.push(`  ${getFunctionForPeriod("per_weekday", timeIntervalInMinutes, 'b.timestamp', useCache)} AS CATEGORY,`);
      break;
    case "per_section":
      statementItems.push(`  b.sectionID AS CATEGORY,`);
      break;
    // case "per_type_klant":
    //   statementItems.push(`  b.clienttypeID AS CATEGORY,`);
    //   break;
    case "none":
    default:
      statementItems.push(`  "0" AS CATEGORY,`);
  }
  statementItems.push(`  ${getFunctionForPeriod(reportGrouping, timeIntervalInMinutes, 'b.timestamp', useCache)} AS TIMEGROUP,`);
  // statementItems.push(`  c.zipID AS authorityId,`);
  // statementItems.push(`  f.Title AS name,`);
  if (false === useCache) {
    if (reportType === "bezetting") {
      // statementItems.push(`SUM(b.checkins) AS totalCheckins,`);
      // statementItems.push(`SUM(b.checkouts) AS totalCheckouts,`);
      // statementItems.push(`SUM(b.capacity) as capacity,`);
      // statementItems.push(`SUM(b.occupation) as occupation,`);
      statementItems.push(`SUM(b.occupation) as value`);
    }
  } else {
    if (reportType === "bezetting") {
      // statementItems.push(`SUM(b.totalCheckins) AS totalCheckins,`);
      // statementItems.push(`SUM(b.totalCheckouts) AS totalCheckouts,`);
      // statementItems.push(`SUM(b.totalCapacity) as capacity,`);
      // statementItems.push(`SUM(b.totalOccupation) as occupation`);
      statementItems.push(`ROUND(SUM(b.totalOccupation)/SUM(b.totalCapacity)*100, 0) as value`);
    }
  }

  statementItems.push(`FROM ${false === useCache ? 'bezettingsdata b' : 'bezettingsdata_day_hour_cache b'}`)
  // statementItems.push(`LEFT JOIN fietsenstallingen f ON f.stallingsId = b.bikeparkID`)
  // statementItems.push(`INNER JOIN contacts c ON c.ID = f.siteID`)
  statementItems.push(`WHERE`)
  if (bikeparkIDs.length > 0) {
    statementItems.push(`b.bikeparkID IN ( ? )`)
  }
  statementItems.push(`AND b.timestamp BETWEEN ? AND ?`)
  if (params.fillups) {
    statementItems.push(`AND b.fillup = 0`)
  }
  if (params.source) {
    statementItems.push(`AND b.source = '${params.source}'`)
  }
  statementItems.push(`AND b.interval = 15`)

  statementItems.push(`GROUP BY`);
  statementItems.push(`  CATEGORY, TIMEGROUP;`); // f.Title, 


  // ORDER BY ${reportUnit === 'reportUnit_stalling' ? 'locationid' : ''}
  // ${selectType === 'SECTIE' ? ', sectionid' : ''}
  // ${selectType === 'BIKETYPE' ? ', biketypeid' : ''}
  // ${selectType === 'CLIENTTYPE' ? ', clienttypeid' : ''}

  const sql = statementItems.join('\n')

  // Prepare parameters for the query
  const queryParams = [
    bikeparkIDs.map(bp => `'${bp}'`).join(','),
    false === useCache ? adjustedStartDate.format('YYYY-MM-DD HH:mm:ss') : moment(startDate).format('YYYY-MM-DD 00:00:00'),
    false === useCache ? adjustedEndDate.format('YYYY-MM-DD HH:mm:ss') : moment(endDate).format('YYYY-MM-DD 23:59:59')
  ];
  if (params.fillups) {
    queryParams.push(params.fillups ? '0' : '1');
  }
  if (params.source) {
    queryParams.push(params.source);
  }

  const sqlfilledin = interpolateSQL(sql, queryParams);
  return sqlfilledin; // , queryParams TODO: make queryParams work: 
}
