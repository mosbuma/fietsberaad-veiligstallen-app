import { ReportParams } from "~/components/beheer/reports/ReportsFilter";
import {
  getFunctionForPeriod,
  debugLog,
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
    endDT: endDate,
  } = params;

  if (["transacties_voltooid", "inkomsten"].includes(reportType) === false) {
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
  switch (reportCategories) {
  }
  statementItems.push(`SELECT`);
  switch (reportCategories) {
    case "per_stalling":
      statementItems.push(`  locationID AS CATEGORY,`);
      break;
    case "per_weekday":
      statementItems.push(`  ${getFunctionForPeriod("per_weekday", timeIntervalInMinutes, 'checkoutdate', useCache)} AS CATEGORY,`);
      break;
    // case "per_section":
    //   statementItems.push(`  b.sectionID AS CATEGORY,`);
    //   break;
    // case "per_type_klant":
    //   statementItems.push(`  b.clienttypeID AS CATEGORY,`);
    //   break;
    case "none":
    default:
      statementItems.push(`  "0" AS CATEGORY,`);
  }

  // statementItems.push(`  Title AS name,`);
  statementItems.push(`  ${getFunctionForPeriod(reportGrouping, timeIntervalInMinutes, 'checkoutdate', useCache)} AS TIMEGROUP,`);
  if (false === useCache) {
    if (reportType === "transacties_voltooid") {
      statementItems.push(`COUNT(*) AS value`);
    } else if (reportType === "inkomsten") {
      statementItems.push(`SUM(price) AS value`);
    }
  }
  // Selects from cache table
  else {
    if (reportType === "transacties_voltooid") {
      statementItems.push(`SUM(count_transacties) AS value,`);
      statementItems.push(`MIN(checkoutdate) as checkoutdate`);
    } else if (reportType === "inkomsten") {
      statementItems.push(`SUM(sum_inkomsten) AS value`);
    }
  }

  statementItems.push(`FROM ${false === useCache ? 'transacties_archief' : 'transacties_archief_day_cache'}`)
  statementItems.push(`LEFT JOIN fietsenstallingen ON stallingsId = locationid`)
  // statementItems.push(`  LEFT JOIN contacts ON contacts.ID = fietsenstallingen.SiteID`)
  statementItems.push(`WHERE locationID IN ( ? )`)
  // statementItems.push(`-- ${bikeParkId ? `AND locationid IN (?)` : `AND sectionid LIKE ?`}`)
  // statementItems.push(`-- ${selectType === 'BIKETYPE' || selectType === 'CLIENTTYPE' ? `AND sectionid = ?` : ''}`)
  statementItems.push(`AND checkoutdate BETWEEN ? AND ?`)
  statementItems.push(`GROUP BY`);
  statementItems.push(`  CATEGORY,TIMEGROUP`); //  name,

  statementItems.push(`ORDER BY checkoutdate ASC`);

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

  const sqlfilledin = interpolateSQL(sql, queryParams);
  // debugLog("*********************** TRANSACTIONS");
  // debugLog(sqlfilledin);
  return sqlfilledin; // , queryParams TODO: make queryParams work: 
}