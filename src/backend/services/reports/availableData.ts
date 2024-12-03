import { ReportParams } from "~/components/beheer/reports/ReportsFilter";
import { 
  getFunctionForPeriod, 
  interpolateSQL } from "~/backend/services/reports/ReportFunctions";

import moment from 'moment';

export type availableDataResult = {
    locationID: string;
    yearmonth: string;
    total: number;
  }

export const getSQL = (params: ReportParams, useCache: boolean = true): string | false => {
  const {
    reportType,
    // reportGrouping,
    // reportCategories,
    bikeparkIDs,
    startDT: startDate,
    endDT: endDate
  } = params;

    const dayBeginsAt = new Date(0, 0, 0);

    // Calculate time interval in minutes
    const timeIntervalInMinutes = dayBeginsAt.getHours() * 60 + dayBeginsAt.getMinutes();

    let adjustedStartDate = moment(startDate);
    let adjustedEndDate = moment(endDate);
    adjustedStartDate = adjustedStartDate.add(timeIntervalInMinutes, 'minutes');
    adjustedEndDate = adjustedEndDate.add(timeIntervalInMinutes, 'minutes');

    switch(reportType) {
        // one of "transacties_voltooid" | "inkomsten" | "abonnementen" | "abonnementen_lopend" | "bezetting" | "stallingsduur" | "volmeldingen" | "gelijktijdig_vol" | "downloads"
        case "inkomsten":
        case "transacties_voltooid":{
                const sql = 
                `SELECT ` +
                `locationID,` + 
                `${getFunctionForPeriod("per_month", timeIntervalInMinutes, 'checkoutdate', useCache)} AS yearmonth,` +
                `COUNT(*) AS total ` +
                `FROM ${false===useCache ? 'transacties_archief' : 'transacties_archief_day_cache'} ` +
                `WHERE locationID IN (${bikeparkIDs.map(id => `'${id}'`).join(',')}) ` +
                `GROUP BY locationID, yearmonth ` + 
                `ORDER BY locationID, yearmonth `
            return sql;
        }
        case "bezetting": {
          const sql = 
          `SELECT ` +
          `bikeparkID as locationID,` + 
          `${getFunctionForPeriod("per_month", timeIntervalInMinutes, 'timestamp', useCache)} AS yearmonth,` +
          `COUNT(*) AS total ` +
          `FROM ${false===useCache ? 'bezettingsdata b' : 'bezettingsdata_day_hour_cache'} ` +
          `WHERE bikeparkID IN (${bikeparkIDs.map(id => `'${id}'`).join(',')}) ` +
          `GROUP BY bikeparkID, yearmonth ` + 
          `ORDER BY bikeparkID, yearmonth `
          return sql;
        }
        case "abonnementen":
        case "abonnementen_lopend":
        case "stallingsduur":
        case "volmeldingen":
        case "gelijktijdig_vol":
        case "downloads":
        default: {
            return false;
        }
    }
}
