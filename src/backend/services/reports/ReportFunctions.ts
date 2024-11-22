import { ReportGrouping, ReportType } from "~/components/beheer/reports/ReportsFilter";
import moment from "moment";
import fs from "fs";

export const getFunctionForPeriod = (reportGrouping: ReportGrouping, timeIntervalInMinutes: number, fieldname: string, useCache: boolean = true) => {
    if(false===useCache) {
        if(reportGrouping === "per_year") return `YEAR(DATE_ADD(${fieldname}, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
        if(reportGrouping === "per_quarter") return `CONCAT(YEAR(${fieldname}), '-', QUARTER(DATE_ADD(${fieldname}, INTERVAL -${timeIntervalInMinutes} MINUTE)))`;
        if(reportGrouping === "per_month") return `CONCAT(YEAR(${fieldname}), '-', MONTH(DATE_ADD(${fieldname}, INTERVAL -${timeIntervalInMinutes} MINUTE)))`;
        if(reportGrouping === "per_week") return `CONCAT(YEAR(${fieldname}), '-', WEEKOFYEAR(DATE_ADD(${fieldname}, INTERVAL -${timeIntervalInMinutes} MINUTE)))`;
        if(reportGrouping === "per_weekday") return `WEEKDAY(DATE_ADD(${fieldname}, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
        if(reportGrouping === "per_day") return `CONCAT(YEAR(${fieldname}), '-', DAYOFYEAR(DATE_ADD(${fieldname}, INTERVAL -${timeIntervalInMinutes} MINUTE)) + 1)`;
    } else {
        if(reportGrouping === "per_year") return `YEAR(${fieldname})`;
        if(reportGrouping === "per_quarter") return `CONCAT(YEAR(${fieldname}), '-', QUARTER(${fieldname}))`;
        if(reportGrouping === "per_month") return `CONCAT(YEAR(${fieldname}), '-', MONTH(${fieldname}))`;
        if(reportGrouping === "per_week") return `CONCAT(YEAR(${fieldname}), '-', WEEKOFYEAR(${fieldname}))`;
        if(reportGrouping === "per_weekday") return `WEEKDAY(${fieldname})`;
        if(reportGrouping === "per_day") return `CONCAT(YEAR(${fieldname}), '-', DAYOFYEAR(${fieldname}) + 1)`;
    }
}

export const getReportTitle = (reportType: ReportType) => {
    if(reportType === "transacties_voltooid") return "Transacties per periode";
    if(reportType === "inkomsten") return "Inkomsten per periode";
    if(reportType === "bezetting") return "Bezetting per periode";
    return "";
  }
    
export const debugLog = (message: string, truncate: boolean = false) => {
    const line = `${new Date().toISOString()} ${message}`;
    console.log(message);
    if(truncate) {
      fs.writeFileSync('debug.log', line + '\n');
    } else {
      fs.appendFileSync('debug.log', line + '\n');
    }
  }
  
// export const interpolateSQL = (sql: string, params: string[]): string => {
//     let interpolatedSQL = sql;
//     params.forEach((param, index) => {
//       interpolatedSQL = interpolatedSQL.replace('?', param);
//     });

//     return interpolatedSQL;
// }

export const interpolateSQL = (sql: string, params: string[]): string => {
    let interpolatedSQL = sql;
    if(params.length > 0) {
      interpolatedSQL = interpolatedSQL.replace('?', `${params[0]}`);
    }
    if(params.length > 1) {
      interpolatedSQL = interpolatedSQL.replace('?', `"${params[1]}"`);
    }
    if(params.length > 2) {
      interpolatedSQL = interpolatedSQL.replace('?', `"${params[2]}"`);
    }
    if(params.length > 3) {
      interpolatedSQL = interpolatedSQL.replace('?', `${params[3]}`);
    }
    if(params.length > 4) {
        interpolatedSQL = interpolatedSQL.replace('?', `${params[4]}`);
    }
    return interpolatedSQL;
  }
