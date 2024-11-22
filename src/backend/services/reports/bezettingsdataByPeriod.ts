import { prisma } from "~/server/db";
import { ReportData, ReportSeriesData } from "~/backend/services/reports-service";
import { ReportParams, ReportType, ReportUnit } from "~/components/beheer/reports/ReportsFilter";
import moment from 'moment';
import fs from 'fs';

interface getBezettingsdataSQLResult {
  sql: string;
  // queryParams: string[];
}

const getBezettingsdataSQL = (params: ReportParams, useCache: boolean = true): getBezettingsdataSQLResult | false => {
  const {
    reportType,
    reportUnit,
    bikeparkIDs,
    startDT: startDate,
    endDT: endDate,
  } = params;

    if(["bezetting"].includes(reportType)===false) {
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

    const getFunctionForPeriod = (reportUnit: ReportUnit, useCache: boolean = true) => {
        if(false===useCache) {
            if(reportUnit === "reportUnit_year") return `YEAR(DATE_ADD(timestamp, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
            if(reportUnit === "reportUnit_quarter") return `CONCAT(YEAR(timestamp), '-', QUARTER(DATE_ADD(timestamp, INTERVAL -${timeIntervalInMinutes} MINUTE)))`;
            if(reportUnit === "reportUnit_month") return `CONCAT(YEAR(timestamp), '-', MONTH(DATE_ADD(timestamp, INTERVAL -${timeIntervalInMinutes} MINUTE)))`;
            if(reportUnit === "reportUnit_week") return `CONCAT(YEAR(timestamp), '-', WEEKOFYEAR(DATE_ADD(timestamp, INTERVAL -${timeIntervalInMinutes} MINUTE)))`;
            if(reportUnit === "reportUnit_weekDay") return `WEEKDAY(DATE_ADD(timestamp, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
            if(reportUnit === "reportUnit_day") return `CONCAT(YEAR(timestamp), '-', DAYOFYEAR(DATE_ADD(timestamp, INTERVAL -${timeIntervalInMinutes} MINUTE)) + 1)`;
        } else {
            if(reportUnit === "reportUnit_year") return `YEAR(timestamp)`;
            if(reportUnit === "reportUnit_quarter") return `CONCAT(YEAR(timestamp), '-', QUARTER(timestamp))`;
            if(reportUnit === "reportUnit_month") return `CONCAT(YEAR(timestamp), '-', MONTH(timestamp))`;
            if(reportUnit === "reportUnit_week") return `CONCAT(YEAR(timestamp), '-', WEEKOFYEAR(timestamp))`;
            if(reportUnit === "reportUnit_weekDay") return `WEEKDAY(timestamp)`;
            if(reportUnit === "reportUnit_day") return `CONCAT(YEAR(timestamp), '-', DAYOFYEAR(timestamp) + 1)`;
        }
    }

    // const queryexample = const query = `
    // SELECT
    //   timestamp,
    //   c.zipID as authorityId,
    //   bikeparkID,
    //   ${groupBySection ? "SectionID," : ""}
    //   interval,
    //   source,
    //   fillup,
    //   open,
    //   SUM(checkins) AS totalCheckins,
    //   SUM(checkouts) AS totalCheckouts,
    //   SUM(b.capacity) as capacity,
    //   SUM(occupation) as occupation,
    // FROM bezettingsdata b
    // INNER JOIN fietsenstallingen f ON f.StallingsID = b.bikeparkID
    // INNER JOIN contacts c ON c.ID = f.siteID
    // WHERE 0 = 0
    // ${!fillups ? "AND `fillup` = 0" : ""}
    // ${locationid ? `AND \`bikeparkID\` IN (${locationid.split(',').map(id => `'${id}'`).join(',')})` : ""}
    // ${source ? `AND \`source\` = '${source}'` : ""}
    // AND \`interval\` = 15
    // AND \`timestamp\` > '${startDate.toISOString()}'
    // AND \`timestamp\` <= '${endDate.toISOString()}'
    // GROUP BY source, timestamp_Year, timestamp_Month, timestamp_Day, timestamp_Hour, timestamp_Minute, bikeparkID
    // ${groupBySection ? ", SectionID" : ""}
    // ORDER BY ${orderBy} ${orderDirection}`;

  
    const statementItems = [];
    statementItems.push(`SELECT`);
    statementItems.push(`  bikeparkID AS stallingID,`);
    statementItems.push(`  Title AS name,`);
    statementItems.push(`  ${getFunctionForPeriod(reportUnit)} AS TIMEGROUP,`);
    if(false===useCache) {
        if(reportType === "bezetting") {
            statementItems.push(`SUM(occupation) AS totalOccupation`);
        }
    } else {
        if(reportType === "bezetting") {
            statementItems.push(`SUM(totalOccupation) AS totalOccupation`);
        }
    }

    statementItems.push(`FROM ${false===useCache ? 'bezettingsdata' : 'bezettingsdata_day_hour_cache'}`)
    statementItems.push(`LEFT JOIN fietsenstallingen ON stallingsId = bikeparkID`)
    // statementItems.push(`  LEFT JOIN contacts ON contacts.ID = fietsenstallingen.SiteID`)
    statementItems.push(`WHERE bikeparkID IN ( ? )`)
    // statementItems.push(`-- ${bikeParkId ? `AND locationid IN (?)` : `AND sectionid LIKE ?`}`)
    // statementItems.push(`-- ${selectType === 'BIKETYPE' || selectType === 'CLIENTTYPE' ? `AND sectionid = ?` : ''}`)
    statementItems.push(`AND timestamp BETWEEN ? AND ?`)
    statementItems.push(`GROUP BY`);
    statementItems.push(`  bikeparkID, name,TIMEGROUP;`);


    // ORDER BY ${reportUnit === 'reportUnit_stalling' ? 'locationid' : ''}
    // ${selectType === 'SECTIE' ? ', sectionid' : ''}
    // ${selectType === 'BIKETYPE' ? ', biketypeid' : ''}
    // ${selectType === 'CLIENTTYPE' ? ', clienttypeid' : ''}

  const sql = statementItems.join('\n')

  // Prepare parameters for the query
  const queryParams = [
    bikeparkIDs.map(bp=>`'${bp}'`).join(','),
    false===useCache ? adjustedStartDate.format('YYYY-MM-DD HH:mm:ss') : moment(startDate).format('YYYY-MM-DD 00:00:00'),
    false===useCache ? adjustedEndDate.format('YYYY-MM-DD HH:mm:ss') : moment(endDate).format('YYYY-MM-DD 23:59:59')
  ];

  const interpolateSQL = (sql: string, params: string[]): string => {
    let interpolatedSQL = sql;
    interpolatedSQL = interpolatedSQL.replace('?', `${queryParams[0]}`);
    interpolatedSQL = interpolatedSQL.replace('?', `"${queryParams[1]}"`);
    interpolatedSQL = interpolatedSQL.replace('?', `"${queryParams[2]}"`);

    return interpolatedSQL;
  }

  const sqlfilledin = interpolateSQL(sql, queryParams);
  debugLog(sqlfilledin);
  return { sql: sqlfilledin }; // , queryParams TODO: make queryParams work: 
}

interface Transaction {
  name: string;
  TIMEGROUP: string;
  totalTransactions: number;
}

const debugLog = (message: string, truncate: boolean = false) => {
  const line = `${new Date().toISOString()} ${message}`;
  console.log(message);
  if(truncate) {
    fs.writeFileSync('debug.log', line + '\n');
  } else {
    fs.appendFileSync('debug.log', line + '\n');
  }
}

const getQBezettingsdataSeries = async (transactions: Transaction[], params: ReportParams): Promise<ReportSeriesData[]> => {
  let series: ReportSeriesData[] = [];

  // debugLog(`GROUPED BY STALLING - TRANSACTIONS`);
  // transactions.map(t=>debugLog(JSON.stringify(t)));

  // Group transactions by FietsenstallingID
  const groupedByStalling = transactions.reduce((acc:any, tx:any) => {
    if (!acc[tx.name]) {
      acc[tx.name] = {
        name: tx.name,
        data: {}
      };
    }
    acc[tx.name].data[tx.TIMEGROUP] = Number(tx.totalTransactions);
    return acc;
  }, {});

  // debugLog(`GROUPED BY STALLING - GROUPED`);
  // Object.values(groupedByStalling).map(t=>debugLog(JSON.stringify(t)));

  // Convert to series format
  series = Object.values(groupedByStalling).map((stalling: any) => ({
    name: stalling.name,
    data: Object.values(stalling.data)
  }));

  return series;
}

const getReportTitle = (reportType: ReportType) => {
  if(reportType === "bezetting") return "Bezetting per periode";
  return "";
}

const getXAxisTitle = (reportUnit: ReportUnit) => {
  switch(reportUnit) {
    case 'reportUnit_weekDay': return 'Dag van de week';
    case 'reportUnit_day': return 'Dag';
    case 'reportUnit_month': return 'Maand';
    case 'reportUnit_quarter': return 'Kwartaal';
    case 'reportUnit_year': return 'Jaar';
    default: return 'onbekend';
  }
}

interface XAxisLabels { key: string, label: string }

const getLabelsForXAxis = (reportUnit: ReportUnit, startDate: Date, endDate: Date): XAxisLabels[] => {
    switch(reportUnit) {
      case 'reportUnit_weekDay':
          return [{ key: '1', label: 'ma'}, 
            { key: '2', label: 'di'}, 
            { key: '3', label: 'wo'}, 
            { key: '4', label: 'do'}, 
            { key: '5', label: 'vr'}, 
            { key: '6', label: 'za'}, 
            { key: '7', label: 'zo'}];
      case 'reportUnit_day': {
        const labels: XAxisLabels[] = [];
        for(let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
            labels.push({ key: date.format('YYYY-DDD'), label: date.format('DDD') });
        }
        return labels;
      }
      case 'reportUnit_month': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('month');
        const endKey = moment(endDate).endOf('month');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'month')) {
            labels.push({ key: date.format('YYYY-MM'), label: date.format('MMM') });
        }
        return labels;
      }
      case 'reportUnit_quarter': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('quarter');
        const endKey = moment(endDate).endOf('quarter');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'quarter')) {
            labels.push({ key: date.format('YYYY-Q'), label: date.format('YYYY-Q') });
        }
        return labels;
      }
      case 'reportUnit_year': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('year');
        const endKey = moment(endDate).endOf('year');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'year')) {
            labels.push({ key: date.format('YYYY'), label: date.format('YYYY') });
        }
        return labels;
      }
      case 'reportUnit_week': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('week');        
        const endKey = moment(endDate).endOf('week');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'week')) {
            labels.push({ key: date.format('YYYY-WW'), label: date.format('YYYY-WW') });
        }
        return labels;
      }
      default:
        return [];
    }
}

const testReportUnitLabels = () => {
  debugLog("TEST REPORT UNIT LABELS", true);
  const testCase = (unit: ReportUnit, rangeStart: Date, rangeEnd: Date) => {
    debugLog(`TEST CASE ${unit} ${rangeStart} ${rangeEnd}`);
    debugLog(`${JSON.stringify(getLabelsForXAxis(unit, rangeStart, rangeEnd))}`);
  }
  const rangestart = moment('2024-01-01 00:00Z+1').toDate();
  const rangeend = moment('2024-01-31 23:59Z+1').toDate();  

  testCase('reportUnit_weekDay', rangestart, rangeend);
  testCase('reportUnit_day', rangestart, rangeend);
  testCase('reportUnit_week', rangestart, rangeend);
  testCase('reportUnit_month', rangestart, rangeend);
  testCase('reportUnit_quarter', rangestart, rangeend);
  testCase('reportUnit_year', rangestart, rangeend);
}

// const getCategoriesForXAxis = (reportUnit: ReportUnit) => {
//   const labels = getLabelsForXAxis(reportUnit, moment().startOf('month').toDate(), moment().endOf('month').toDate());
//     switch(reportUnit) {
//     case 'reportUnit_weekDay':
//         return ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
//     case 'reportUnit_day':
//         return ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
//     case 'reportUnit_month':
//         return ['jan', 'feb', 'maa', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
//     case 'reportUnit_quarter':
//         return ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'];
//     case 'reportUnit_year':
//         return ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
//     case 'reportUnit_week':
//     default:
//       return [];
//   }
// }



const getCategoriesForXAxis = (labels: XAxisLabels[]): string[] => {
  return labels.map(label => label.key);
}

const getXAxisFormatter = (labels: XAxisLabels[]) => (): ((value: string) => string) => {
  const labelMap = labels.reduce((acc, label) => {
    acc[label.key] = label.label;
    return acc;
  }, {} as Record<string, string>);

  return (value: string) => labelMap[value] || value;
}

const getQBezettingsdata = async (params: ReportParams): Promise<ReportData|false> => {
    try {
      console.log("TEST REPORT UNIT LABELS");
      testReportUnitLabels();

        const result = getBezettingsdataSQL(params); // , queryParams
        if(!result) {
            console.error("No result from getBezettingsdataSQL");
            return false;
        }
        const { sql } = result;
  
        const transactions = await prisma.$queryRawUnsafe<Transaction[]>(sql);

        let series = await getQBezettingsdataSeries(transactions, params);
        let xaxisLabels = getLabelsForXAxis(params.reportUnit, params.startDT || new Date(), params.endDT || new Date());
        debugLog("XAXISLABELS", true);

        debugLog(JSON.stringify(xaxisLabels));


        return {
            title: getReportTitle(params.reportType),
            options: {
            xaxis: {
                categories: getCategoriesForXAxis(xaxisLabels),
                title: {
                    text: getXAxisTitle(params.reportUnit),
                    align: 'left'
                },
                labels: {
                  formatter: getXAxisFormatter(xaxisLabels)()
                }
            },
            yaxis: {
                title: {
                text: getReportTitle(params.reportType)
                }
            }
            },
            series: series
        };
    } catch (error) {
        console.error(error);
        return false;
    }
};

export default getQBezettingsdata;

