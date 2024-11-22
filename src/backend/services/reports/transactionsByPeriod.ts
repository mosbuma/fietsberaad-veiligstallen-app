import { prisma } from "~/server/db";
import { ReportData, ReportSeriesData } from "~/backend/services/reports-service";
import { ReportParams, ReportType, ReportGrouping } from "~/components/beheer/reports/ReportsFilter";
import { getFunctionForPeriod, getReportTitle, debugLog, interpolateSQL } from "~/backend/services/reports/ReportFunctions";
import { getLabelsForXAxis, getCategoriesForXAxis, getXAxisFormatter, getXAxisTitle } from "~/backend/services/reports/ReportAxisFunctions";

import moment from 'moment';
import fs from 'fs';

interface GetTransactionsByPeriodSQLResult {
  sql: string;
  // queryParams: string[];
}

const getTransactionsByPeriodSQL = (params: ReportParams, useCache: boolean = true): GetTransactionsByPeriodSQLResult | false => {
  const {
    reportType,
    reportGrouping,
    bikeparkIDs,
    startDT: startDate,
    endDT: endDate,
  } = params;

    if(["transacties_voltooid","inkomsten"].includes(reportType)===false) {
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
    statementItems.push(`  locationID AS stallingID,`);
    statementItems.push(`  Title AS name,`);
    statementItems.push(`  ${getFunctionForPeriod(reportGrouping, timeIntervalInMinutes, 'checkoutdate', useCache)} AS TIMEGROUP,`);
    if(false===useCache) {
        if(reportType === "transacties_voltooid") {
            statementItems.push(`COUNT(*) AS totalTransactions`);
        } else if(reportType === "inkomsten") {
            statementItems.push(`SUM(price) AS totalTransactions`);
        }
    } else {
        if(reportType === "transacties_voltooid") {
            statementItems.push(`SUM(count_transacties) AS totalTransactions`);
        } else if(reportType === "inkomsten") {
            statementItems.push(`SUM(sum_inkomsten) AS totalTransactions`);
        }
    }

    statementItems.push(`FROM ${false===useCache ? 'transacties_archief' : 'transacties_archief_day_cache'}`)
    statementItems.push(`LEFT JOIN fietsenstallingen ON stallingsId = locationid`)
    // statementItems.push(`  LEFT JOIN contacts ON contacts.ID = fietsenstallingen.SiteID`)
    statementItems.push(`WHERE locationID IN ( ? )`)
    // statementItems.push(`-- ${bikeParkId ? `AND locationid IN (?)` : `AND sectionid LIKE ?`}`)
    // statementItems.push(`-- ${selectType === 'BIKETYPE' || selectType === 'CLIENTTYPE' ? `AND sectionid = ?` : ''}`)
    statementItems.push(`AND checkoutdate BETWEEN ? AND ?`)
    statementItems.push(`GROUP BY`);
    statementItems.push(`  locationID, name,TIMEGROUP;`);


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

  const sqlfilledin = interpolateSQL(sql, queryParams);
  debugLog(sqlfilledin);
  return { sql: sqlfilledin }; // , queryParams TODO: make queryParams work: 
}

interface Transaction {
  name: string;
  TIMEGROUP: string;
  totalTransactions: number;
}

const getTransactionsByPeriodSeries = async (transactions: Transaction[], params: ReportParams): Promise<ReportSeriesData[]> => {
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

const getTransactionsByPeriod = async (params: ReportParams): Promise<ReportData|false> => {
    try {
        const result = getTransactionsByPeriodSQL(params); // , queryParams
        if(!result) {
            console.error("No result from getTransactionsByPeriodSQL");
            return false;
        }
        const { sql } = result;
  
        const transactions = await prisma.$queryRawUnsafe<Transaction[]>(sql);

        let series = await getTransactionsByPeriodSeries(transactions, params);
        let xaxisLabels = getLabelsForXAxis(params.reportGrouping, params.startDT || new Date(), params.endDT || new Date());
        debugLog("XAXISLABELS", true);
        debugLog(JSON.stringify(xaxisLabels));


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

export default getTransactionsByPeriod;

