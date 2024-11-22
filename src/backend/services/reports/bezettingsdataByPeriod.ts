import { prisma } from "~/server/db";
import { ReportData, ReportSeriesData } from "~/backend/services/reports-service";
import { ReportParams, ReportType, ReportGrouping } from "~/components/beheer/reports/ReportsFilter";
import { getFunctionForPeriod, getReportTitle, debugLog, interpolateSQL } from "~/backend/services/reports/ReportFunctions";
import { getLabelsForXAxis, getCategoriesForXAxis, getXAxisFormatter, getXAxisTitle } from "~/backend/services/reports/ReportAxisFunctions";

import moment from 'moment';
import fs from 'fs';

interface getBezettingsdataSQLResult {
  sql: string;
  // queryParams: string[];
}

const getBezettingsdataSQL = (params: ReportParams, useCache: boolean = true): getBezettingsdataSQLResult | false => {
  const {
    reportType,
    reportGrouping,
    bikeparkIDs,
    startDT: startDate,
    endDT: endDate
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
  
    const statementItems = [];
    statementItems.push(`SELECT`);
    statementItems.push(`  b.bikeparkID AS stallingID,`);
    statementItems.push(`  c.zipID AS authorityId,`);
    statementItems.push(`  f.Title AS name,`);
    statementItems.push(`  ${getFunctionForPeriod(reportGrouping, timeIntervalInMinutes, 'b.timestamp', useCache)} AS TIMEGROUP,`);
    if(false===useCache) {
        if(reportType === "bezetting") {
            statementItems.push(`SUM(b.checkins) AS totalCheckins,`);
            statementItems.push(`SUM(b.checkouts) AS totalCheckouts,`);
            statementItems.push(`SUM(b.capacity) as capacity,`);
            statementItems.push(`SUM(b.occupation) as occupation,`);
        }
    } else {
        if(reportType === "bezetting") {
          statementItems.push(`SUM(b.totalCheckins) AS totalCheckins,`);
          statementItems.push(`SUM(b.totalCheckouts) AS totalCheckouts,`);
          statementItems.push(`SUM(b.totalCapacity) as capacity,`);
          statementItems.push(`SUM(b.totalOccupation) as occupation`);
      }
    }

    statementItems.push(`FROM ${false===useCache ? 'bezettingsdata b' : 'bezettingsdata_day_hour_cache b'}`)
    statementItems.push(`LEFT JOIN fietsenstallingen f ON f.stallingsId = b.bikeparkID`)
    statementItems.push(`INNER JOIN contacts c ON c.ID = f.siteID`)
    statementItems.push(`WHERE`)
    if(bikeparkIDs.length>0) {
      statementItems.push(`b.bikeparkID IN ( ? )`)
    }
    statementItems.push(`AND b.timestamp BETWEEN ? AND ?`)
    if(params.fillups) {
      statementItems.push(`AND b.fillup = 0`)
    }
    if(params.source) {
      statementItems.push(`AND b.source = '${params.source}'`)
    }
    statementItems.push(`AND b.interval = 15`)

    statementItems.push(`GROUP BY`);
    statementItems.push(`  b.bikeparkID, f.Title, TIMEGROUP;`);


    // ORDER BY ${reportUnit === 'reportUnit_stalling' ? 'locationid' : ''}
    // ${selectType === 'SECTIE' ? ', sectionid' : ''}
    // ${selectType === 'BIKETYPE' ? ', biketypeid' : ''}
    // ${selectType === 'CLIENTTYPE' ? ', clienttypeid' : ''}

  const sql = statementItems.join('\n')

  // Prepare parameters for the query
  const queryParams = [
    bikeparkIDs.map(bp=>`'${bp}'`).join(','),
    `\`${false===useCache ? adjustedStartDate.format('YYYY-MM-DD HH:mm:ss') : moment(startDate).format('YYYY-MM-DD 00:00:00')}\``,
    `\`${false===useCache ? adjustedEndDate.format('YYYY-MM-DD HH:mm:ss') : moment(endDate).format('YYYY-MM-DD 23:59:59')}\``,
  ];
  if(params.fillups) {
    queryParams.push(params.fillups ? '0' : '1');
  }
  if(params.source) {
    queryParams.push(params.source);
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

const getQBezettingsdataSeries = async (transactions: Transaction[], params: ReportParams): Promise<ReportSeriesData[]> => {
  let series: ReportSeriesData[] = [];

  // debugLog(`GROUPED BY STALLING - TRANSACTIONS`);
  // transactions.map(t=>debugLog(JSON.stringify(t)));

  // Group transactions by FietsenstallingID
  console.log("TRANSACTIONS", transactions);
  
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

  console.log("SERIES", series);

  return series;
}

const getQBezettingsdata = async (params: ReportParams): Promise<ReportData|false> => {
    try {
        const result = getBezettingsdataSQL(params); // , queryParams
        if(!result) {
            console.error("No result from getBezettingsdataSQL");
            return false;
        }
        const { sql } = result;
  
        const transactions = await prisma.$queryRawUnsafe<Transaction[]>(sql);

        let series = await getQBezettingsdataSeries(transactions, params);
        let xaxisLabels = getLabelsForXAxis(params.reportGrouping, params.startDT || new Date(), params.endDT || new Date());
        debugLog("XAXISLABELS", true);

        return {
            title: getReportTitle(params.reportType),
            options: {
            xaxis: {
                categories: getCategoriesForXAxis(xaxisLabels),
                title: {
                    text: getXAxisTitle(params.reportGrouping),
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

