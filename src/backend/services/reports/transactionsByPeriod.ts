import { prisma } from "~/server/db";
import { ReportData, ReportSeriesData } from "~/backend/services/reports-service";
import { ReportParams, ReportType, ReportUnit } from "~/components/beheer/reports/ReportsFilter";
import moment from 'moment';


interface GetTransactionsByPeriodSQLResult {
  sql: string;
  // queryParams: string[];
}

const getTransactionsByPeriodSQL = (params: ReportParams, useCache: boolean = true): GetTransactionsByPeriodSQLResult | false => {
  const {
    reportType,
    reportUnit,
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

    // Adjust start and end dates using moment
    const adjustedStartDate = moment(startDate).add(timeIntervalInMinutes, 'minutes');
    const adjustedEndDate = moment(endDate).add(timeIntervalInMinutes, 'minutes');

    const getFunctionForPeriod = (reportUnit: ReportUnit, useCache: boolean = true) => {
        if(false===useCache) {
            if(reportUnit === "reportUnit_year") return `YEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
            if(reportUnit === "reportUnit_quarter") return `QUARTER(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
            if(reportUnit === "reportUnit_month") return `MONTH(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
            if(reportUnit === "reportUnit_week") return `WEEKOFYEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
            if(reportUnit === "reportUnit_weekDay") return `WEEKDAY(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
            if(reportUnit === "reportUnit_day") return `DAYOFYEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) + 1`;
        } else {
            if(reportUnit === "reportUnit_year") return `YEAR(checkoutdate)`;
            if(reportUnit === "reportUnit_quarter") return `QUARTER(checkoutdate)`;
            if(reportUnit === "reportUnit_month") return `MONTH(checkoutdate)`;
            if(reportUnit === "reportUnit_week") return `WEEKOFYEAR(checkoutdate)`;
            if(reportUnit === "reportUnit_weekDay") return `WEEKDAY(checkoutdate)`;
            if(reportUnit === "reportUnit_day") return `DAYOFYEAR(checkoutdate) + 1`;
        }
    }

    const statementItems = [];
    statementItems.push(`SELECT`);
    statementItems.push(`  locationID AS stallingID,`);
    statementItems.push(`  Title AS name,`);
    statementItems.push(`  ${getFunctionForPeriod(reportUnit)} AS TIMEGROUP,`);
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
    adjustedStartDate.format('YYYY-MM-DD HH:mm:ss'),
    adjustedEndDate.format('YYYY-MM-DD HH:mm:ss')
  ];

  const interpolateSQL = (sql: string, params: string[]): string => {
    let interpolatedSQL = sql;
    interpolatedSQL = interpolatedSQL.replace('?', `${queryParams[0]}`);
    interpolatedSQL = interpolatedSQL.replace('?', `"${queryParams[1]}"`);
    interpolatedSQL = interpolatedSQL.replace('?', `"${queryParams[2]}"`);

    return interpolatedSQL;
  }

  const sqlfilledin = interpolateSQL(sql, queryParams);
  return { sql: sqlfilledin }; // , queryParams TODO: make queryParams work: 
}

interface Transaction {
  name: string;
  TIMEGROUP: string;
  totalTransactions: number;
}

const getTransactionsByPeriodSeries = async (transactions: Transaction[], params: ReportParams): Promise<ReportSeriesData[]> => {
  let series: ReportSeriesData[] = [];

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

//   const stallingNames = await prisma.fietsenstallingen.findMany({
//     where: {
//       StallingsID: { in: Object.keys(groupedByStalling) }
//     },
//     select: {
//       StallingsID: true,
//       Title: true
//     }
//   });

//   console.log("STALLING NAMES", stallingNames);

  // Convert to series format
  series = Object.values(groupedByStalling).map((stalling: any) => ({
    name: stalling.name,
    data: Object.values(stalling.data)
  }));

  return series;
}

const getReportTitle = (reportType: ReportType) => {
  if(reportType === "transacties_voltooid") return "Transacties per periode";
  if(reportType === "inkomsten") return "Inkomsten per periode";
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

const getCategoriesForXAxis = (reportUnit: ReportUnit) => {
    switch(reportUnit) {
    case 'reportUnit_weekDay':
        return ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
    case 'reportUnit_day':
        return ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
    case 'reportUnit_month':
        return ['jan', 'feb', 'maa', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    case 'reportUnit_quarter':
        return ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'];
    case 'reportUnit_year':
        return ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
    case 'reportUnit_week':
    default:
      return [];
  }
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

        return {
            title: getReportTitle(params.reportType),
            options: {
            xaxis: {
                categories: getCategoriesForXAxis(params.reportUnit),
                title: {
                    text: getXAxisTitle(params.reportUnit),
                    align: 'left'
                },
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

