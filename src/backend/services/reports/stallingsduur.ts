import { ReportParams } from "~/components/beheer/reports/ReportsFilter";
import { 
  getFunctionForPeriod, 
  debugLog, 
  interpolateSQL } from "~/backend/services/reports/ReportFunctions"; 
import moment from "moment";

// export const getSQL2 = (params: ReportParams): string| false => {
//   const {
//     reportType,
//     // reportGrouping,
//     // reportCategories,
//     // reportRangeUnit,
//     // reportRangeValue,
//     bikeparkIDs,
//     startDT: startDate,
//     endDT: endDate,
//     // fillups,
//     // source
//   } = params;


//   console.log("************** REPORTTYPE:", reportType);
//   if(["stallingsduur"].includes(reportType)===false) {
//     throw new Error("Invalid report type");
//     return false;
//   }

//   const dayBeginsAt = new Date(0, 0, 0);

//   // Calculate time interval in minutes
//   const timeIntervalInMinutes = dayBeginsAt.getHours() * 60 + dayBeginsAt.getMinutes();

//   let adjustedStartDate = moment(startDate);
//   let adjustedEndDate = moment(endDate);
//   adjustedStartDate = adjustedStartDate.add(timeIntervalInMinutes, 'minutes');
//   adjustedEndDate = adjustedEndDate.add(timeIntervalInMinutes, 'minutes');

//   const buckets = [
//     "<30m",
//     "30-60m",
//     "1-2h",
//     "2-4h",
//     "4-8h",
//     "8-24h",
//     "1-2d",
//     "2-7d",
//     "7-14d",
//     ">14d"
//   ];

//   const calculateBucketItems = []
//   calculateBucketItems.push(`  CASE`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 14 * 24 * 60 THEN 10`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 14 * 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 7 * 24 * 60 THEN 9`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 7 * 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 2 * 24 * 60 THEN 8`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 2 * 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 1 * 24 * 60 THEN 7`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 24 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 8 * 60 THEN 6`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 8 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 4 * 60 THEN 5`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 4 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 2 * 60 THEN 4`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 2 * 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 1 * 60 THEN 3`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 60 AND TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) > 30 THEN 2`);
//   calculateBucketItems.push(`    WHEN TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) <= 30 THEN 1`);
//   calculateBucketItems.push(`    ELSE 'Unknown' END`);
//   const sqlCalculateBucket = calculateBucketItems.join('\n');

//   const statementItems = [];
//   statementItems.push(`SELECT`);
//   statementItems.push(`  clienttypeid,`);
//   statementItems.push(`  COUNT(*) as n,`);
//   statementItems.push(`  ${sqlCalculateBucket} as bucket`);
//   statementItems.push(`  FROM transacties_archief`);
//   statementItems.push(`  WHERE`);
//     //   if (zipID && zipID.length > 0) {
//     //     statementItems.push(`    citycode = ?`);
//     //   } else {
//   statementItems.push(`    locationid IN ( ? )`);
//     //   }
//   statementItems.push(`    AND checkoutdate BETWEEN ( ? ) AND ( ? )`);
//   statementItems.push(`    AND checkintype = 'user'`);
//   statementItems.push(`    AND checkouttype = 'user'`);
//     //   if (exploitantID && exploitantID.length > 0) {
//     //     statementItems.push(`    AND exploitantid = ?`);
//     //   }
//   statementItems.push(`GROUP BY`);
//   statementItems.push(`  bucket,`);
//   statementItems.push(`  clienttypeid;`);
// //   statementItems.push(`ORDER BY`);
// //   statementItems.push(`bucket,`);
// //   statementItems.push(`clienttypeid`);
  
//   const sql = statementItems.join('\n');

//   // Prepare parameters for the query
//   const useCache = false;
//   const queryParams = [
//     bikeparkIDs.map(bp=>`'${bp}'`).join(','),
//     false===useCache ? adjustedStartDate.format('YYYY-MM-DD HH:mm:ss') : moment(startDate).format('YYYY-MM-DD 00:00:00'),
//     false===useCache ? adjustedEndDate.format('YYYY-MM-DD HH:mm:ss') : moment(endDate).format('YYYY-MM-DD 23:59:59')
//   ];
//     //   if(params.fillups) {
//     //     queryParams.push(params.fillups ? '0' : '1');
//     //   }
//     //   if(params.source) {
//     //     queryParams.push(params.source);
//     //   }


//     const sqlFilledIn = interpolateSQL(sql, queryParams);
//     console.log(sqlFilledIn);
//     return sqlFilledIn; 
// } 

export const getSQL = (params: ReportParams, useCache: boolean = true): string | false => {
  const {
    reportType,
    reportGrouping,
    reportCategories,
    bikeparkIDs,
    startDT: startDate,
    endDT: endDate,
  } = params;
  console.log("************** REPORTTYPE:", reportType);

    if(["stallingsduur"].includes(reportType)===false) {
        throw new Error("Invalid report type");
        return false;
    }

    if(false===useCache) {
      throw new Error("Only cached data is supported for this report");
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
    switch( reportCategories) {
    }
    statementItems.push(`SELECT`);
    switch(reportCategories) {
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
    statementItems.push(`SUM(count_transacties) AS value`);

    statementItems.push(`FROM stallingsduur_cache`)
    statementItems.push(`LEFT JOIN fietsenstallingen ON stallingsId = locationid`)
    // statementItems.push(`  LEFT JOIN contacts ON contacts.ID = fietsenstallingen.SiteID`)
    statementItems.push(`WHERE locationID IN ( ? )`)
    // statementItems.push(`-- ${bikeParkId ? `AND locationid IN (?)` : `AND sectionid LIKE ?`}`)
    // statementItems.push(`-- ${selectType === 'BIKETYPE' || selectType === 'CLIENTTYPE' ? `AND sectionid = ?` : ''}`)
    statementItems.push(`AND checkoutdate BETWEEN ? AND ?`)
    statementItems.push(`GROUP BY`);
    statementItems.push(`  CATEGORY,TIMEGROUP;`); //  name,

    // ORDER BY ${reportUnit === 'reportUnit_stalling' ? 'locationid' : ''}
    // ${selectType === 'SECTIE' ? ', sectionid' : ''}
    // ${selectType === 'BIKETYPE' ? ', biketypeid' : ''}
    // ${selectType === 'CLIENTTYPE' ? ', clienttypeid' : ''}

  const sql = statementItems.join('\n')

  // Prepare parameters for the query
  const queryParams = [
    bikeparkIDs.map(bp=>`'${bp}'`).join(','),
    moment(startDate).format('YYYY-MM-DD 00:00:00'),
    moment(endDate).format('YYYY-MM-DD 23:59:59')
  ];

  const sqlfilledin = interpolateSQL(sql, queryParams);
  debugLog(sqlfilledin);
  return sqlfilledin; // , queryParams TODO: make queryParams work: 
}