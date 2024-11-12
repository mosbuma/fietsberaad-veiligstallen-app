import { prisma } from "~/server/db";
import { ReportData } from "~/backend/services/reports-service";
import { ReportParams, ReportType, ReportUnit } from "~/components/beheer/reports/ReportsFilter";
import moment from 'moment';


interface GetTransactionsByPeriodSQLResult {
  sql: string;
  // queryParams: string[];
}

function getTransactionsByPeriodSQL(params: ReportParams): GetTransactionsByPeriodSQLResult | false {
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

    const getFunctionForPeriod = (reportUnit: ReportUnit) => {
      if(reportUnit === "reportUnit_year") return `YEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
      if(reportUnit === "reportUnit_quarter") return `QUARTER(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
      if(reportUnit === "reportUnit_month") return `MONTH(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
      if(reportUnit === "reportUnit_week") return `WEEKOFYEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
      if(reportUnit === "reportUnit_weekDay") return `WEEKDAY(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE))`;
      if(reportUnit === "reportUnit_day") return `DAYOFYEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) + 1`;
    }
    

    const statementItems = [];
    statementItems.push(`SELECT`);
    statementItems.push(`  locationID AS stallingID,`);
    statementItems.push(`  Title AS name,`);
    statementItems.push(`  ${getFunctionForPeriod(reportUnit)} AS TIMEGROUP,`);
    if(reportType === "transacties_voltooid") { 
        statementItems.push(`COUNT(*) AS totalTransactions`);
    } else if(reportType === "inkomsten") {
        statementItems.push(`SUM(price) AS totalTransactions`);
    }

    statementItems.push(`FROM transacties_archief`)
    statementItems.push(`LEFT JOIN fietsenstallingen ON stallingsId = locationid`)
    // statementItems.push(`  LEFT JOIN contacts ON contacts.ID = fietsenstallingen.SiteID`)
    statementItems.push(`WHERE locationID IN ( ? )`)
    // statementItems.push(`-- ${bikeParkId ? `AND locationid IN (?)` : `AND sectionid LIKE ?`}`)
    // statementItems.push(`-- ${selectType === 'BIKETYPE' || selectType === 'CLIENTTYPE' ? `AND sectionid = ?` : ''}`)
    statementItems.push(`AND checkoutdate BETWEEN ? AND ?`)
    statementItems.push(`GROUP BY`);
    statementItems.push(`  locationID, Name,TIMEGROUP;`);


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

  // debug function to interpolate the SQL query
  const interpolateSQL = (sql: string, params: string[]): string => {
    let interpolatedSQL = sql;
    interpolatedSQL = interpolatedSQL.replace('?', `${queryParams[0]}`);
    interpolatedSQL = interpolatedSQL.replace('?', `"${queryParams[1]}"`);
    interpolatedSQL = interpolatedSQL.replace('?', `"${queryParams[2]}"`);

    return interpolatedSQL;
  }

//   console.log(interpolateSQL(sql, queryParams));
//   console.log(queryParams);
  const sqlfilledin = interpolateSQL(sql, queryParams);
  return { sql: sqlfilledin }; // , queryParams TODO: make queryParams work: 
}

interface Transaction {
  name: string;
  TIMEGROUP: string;
  totalTransactions: number;
}

interface SeriesData {
  name: string;
  data: number[];
}

const getTransactionsByPeriodSeries = async (transactions: Transaction[], params: ReportParams): Promise<SeriesData[]> => {
  let series: SeriesData[] = [];

  // Group transactions by FietsenstallingID
  const groupedByStalling = transactions.reduce((acc: any, tx: any) => {
    if (!acc[tx.name]) {
      acc[tx.name] = {
        name: tx.name,
        data: {}
      };
    }
    acc[tx.name].data[tx.timegroup] = Number(tx.totalTransactions);
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
  
        // Cast the result to Transaction[]
        const transactions = await prisma.$queryRawUnsafe<Transaction[]>(sql);

        // Get series for 'year'
        let series = await getTransactionsByPeriodSeries(transactions, params);

        return {
            title: "Transacties per periode",
            options: {
            xaxis: {
                categories: getCategoriesForXAxis(params.reportUnit),
                title: {
                text: 'Weekdag',
                align: 'left'
                }
            },
            yaxis: {
                title: {
                text: 'Aantal afgeronde transacties'
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

