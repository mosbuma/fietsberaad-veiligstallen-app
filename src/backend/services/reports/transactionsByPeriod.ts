import { prisma } from "~/server/db";
import { ReportData } from "~/backend/services/reports-service";
import moment from 'moment';

export enum SelectType {
  STALLING = "STALLING",
  SECTIE = "SECTIE",
  BIKETYPE = "BIKETYPE",
  CLIENTTYPE = "CLIENTTYPE"
}

export enum PeriodType {
  YEAR = "YEAR",
  QUARTER = "QUARTER",
  MONTH = "MONTH",
  WEEK = "WEEK",
  WEEKDAY = "WEEKDAY",
  DAY = "DAY"
}

export enum OutputType {
  TRANSACTIONS = "transacties_voltooid",
  INKOMSTEN = "inkomsten"
}

export interface GetTransactionsByPeriodParams {
  zipID: string;
  bikeParkId?: string;
  sectionID?: string;
  startDate: Date;
  endDate: Date;
  dayBeginsAt?: Date;
  periodType: PeriodType;
  selectType: SelectType;
  clientType?: string;
  outputType: OutputType;
}

interface GetTransactionsByPeriodSQLResult {
  sql: string;
  queryParams: string[];
}

function getTransactionsByPeriodSQL(params: GetTransactionsByPeriodParams): GetTransactionsByPeriodSQLResult {
  const {
    zipID,
    bikeParkId = '',
    sectionID = '',
    startDate,
    endDate,
    dayBeginsAt = new Date(0, 0, 0),
    periodType = "YEAR",
    selectType = "STALLING",
    clientType,
    outputType = "transacties_voltooid"
  } = params;

  // Calculate time interval in minutes
  const timeIntervalInMinutes = dayBeginsAt.getHours() * 60 + dayBeginsAt.getMinutes();

  // Adjust start and end dates using moment
  const adjustedStartDate = moment(startDate).add(timeIntervalInMinutes, 'minutes');
  const adjustedEndDate = moment(endDate).add(timeIntervalInMinutes, 'minutes');

  // Base SQL query
  let sql = `
        SELECT
            ${selectType === 'STALLING' ? 'locationid AS FietsenstallingID' : ''}
            ${selectType === 'SECTIE' ? ', sectionid AS SectieID' : ''}
            ${selectType === 'BIKETYPE' ? ', BikeTypeID' : ''}
            ${selectType === 'CLIENTTYPE' ? ', clienttypeid AS Clienttype' : ''}
            , MIN(checkoutdate) AS Date_checkout
            ${periodType === 'YEAR' ? `, YEAR(DATE_ADD(MIN(checkoutdate), INTERVAL -${timeIntervalInMinutes} MINUTE)) AS ${getAggregatorKeyForPeriod(periodType)}` : ''}
            ${periodType === 'QUARTER' ? `, QUARTER(DATE_ADD(MIN(checkoutdate), INTERVAL -${timeIntervalInMinutes} MINUTE)) AS ${getAggregatorKeyForPeriod(periodType)}` : ''}
            ${periodType === 'MONTH' ? `, MONTH(DATE_ADD(MIN(checkoutdate), INTERVAL -${timeIntervalInMinutes} MINUTE)) AS  ${getAggregatorKeyForPeriod(periodType)}` : ''}
            ${periodType === 'WEEK' ? `, WEEKOFYEAR(DATE_ADD(MIN(checkoutdate), INTERVAL -${timeIntervalInMinutes} MINUTE)) AS  ${getAggregatorKeyForPeriod(periodType)}` : ''}
            ${periodType === 'WEEKDAY' ? `, DAYOFYEAR(DATE_ADD(MIN(checkoutdate), INTERVAL -${timeIntervalInMinutes} MINUTE)) AS  ${getAggregatorKeyForPeriod(periodType)}` : ''}
            ${periodType === 'DAY' ? `, WEEKDAY(DATE_ADD(MIN(checkoutdate), INTERVAL -${timeIntervalInMinutes} MINUTE)) + 1 AS  ${getAggregatorKeyForPeriod(periodType)}` : ''}
            ${outputType === 'transacties_voltooid' ? `, COUNT(*) AS totalTransactions` : ''}
            ${outputType === 'inkomsten' ? `, SUM(price) AS totalTransactions` : ''}
        FROM transacties_archief
        WHERE citycode = 7300 -- Breda
        -- ${bikeParkId ? `AND locationid IN (?)` : `AND sectionid LIKE ?`}
        -- ${selectType === 'BIKETYPE' || selectType === 'CLIENTTYPE' ? `AND sectionid = ?` : ''}
        AND checkoutdate BETWEEN ? AND ?
        GROUP BY ${selectType === 'STALLING' ? 'locationid' : ''}
        ${selectType === 'SECTIE' ? ', sectionid' : ''}
        ${selectType === 'BIKETYPE' ? ', biketypeid' : ''}
        ${selectType === 'CLIENTTYPE' ? ', clienttypeid' : ''}
        ${periodType === 'YEAR' ? ', YEAR(checkoutdate)' : ''}
        ${periodType === 'QUARTER' ? ', checkoutQuarter' : ''}
        ${periodType === 'MONTH' ? ', checkoutMonth' : ''}
        ${periodType === 'WEEK' ? ', checkoutWeekOfYear' : ''}
        ${periodType === 'WEEKDAY' ? ', checkoutDayOfYear' : ''}
        ${periodType === 'DAY' ? ', checkoutDayOfWeek' : ''}
        ORDER BY ${selectType === 'STALLING' ? 'locationid' : ''}
        ${selectType === 'SECTIE' ? ', sectionid' : ''}
        ${selectType === 'BIKETYPE' ? ', biketypeid' : ''}
        ${selectType === 'CLIENTTYPE' ? ', clienttypeid' : ''}
    `;

  // Prepare parameters for the query
  const queryParams = [
    // zipID,
    // bikeParkId || `${zipID || ''}%`,
    // sectionID,
    adjustedStartDate.format('YYYY-MM-DD HH:mm:ss'),
    adjustedEndDate.format('YYYY-MM-DD HH:mm:ss')
  ];

  return { sql, queryParams };
}

const getAggregatorKeyForPeriod = (periodType: string) => {
  if (periodType === 'YEAR')
    return 'checkoutYear';
  else if (periodType === 'QUARTER')
    return 'checkoutQuarter';
  else if (periodType === 'MONTH')
    return 'checkoutMonth';
  else if (periodType === 'WEEK')
    return 'checkoutWeekOfYear';
  else if (periodType === 'WEEKDAY')
    return 'WEEKDAY';
  else if (periodType === 'DAY')
    return 'checkoutDayOfWeek';
  return 'periodType'
}

/*
  Function that returns an array like:

  [
    {
      name: "Concordiastraat",
      data: [40, 17, 348, 1, 5, 129, 12]
    }
  ]
*/
const getTransactionsByPeriodSeries = (transactions: any, params: GetTransactionsByPeriodParams): any => {
  let series: any = [];

  // Group transactions by FietsenstallingID
  const groupedByStalling = transactions.reduce((acc: any, tx: any) => {
    if (!acc[tx.FietsenstallingID]) {
      acc[tx.FietsenstallingID] = {
        name: tx.FietsenstallingID,
        data: {}
      };
    }
    acc[tx.FietsenstallingID].data[tx[getAggregatorKeyForPeriod(params.periodType)]] = Number(tx.totalTransactions);
    return acc;
  }, {});

  // Convert to series format
  series = Object.values(groupedByStalling).map((stalling: any) => ({
    name: stalling.name,
    data: Object.values(stalling.data)
  }));

  return series;
}

const getTransactionsByPeriod = async (params: GetTransactionsByPeriodParams): Promise<ReportData> => {
  const { sql, queryParams } = getTransactionsByPeriodSQL(params);

  // console.log(sql, queryParams);
  console.log(sql, queryParams);
  const transactions = await prisma.$queryRawUnsafe(sql, ...queryParams);

  console.log(queryParams, transactions);

  // Get series for 'year'
  let series = getTransactionsByPeriodSeries(transactions, params);

  return {
    title: "Transacties per periode",
    options: {
      xaxis: {
        categories: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
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
};

export default getTransactionsByPeriod;

