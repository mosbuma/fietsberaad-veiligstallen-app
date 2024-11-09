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
            , checkoutdate AS Date_checkout
            ${periodType === 'YEAR' ? ', YEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) AS checkoutYear' : ''}
            ${periodType === 'QUARTER' ? ', QUARTER(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) AS checkoutQuarter' : ''}
            ${periodType === 'MONTH' ? ', MONTH(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) AS checkoutMonth' : ''}
            ${periodType === 'WEEK' ? ', WEEKOFYEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) AS checkoutWeekOfYear' : ''}
            ${periodType === 'WEEKDAY' ? ', DAYOFYEAR(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) AS checkoutDayOfYear' : ''}
            ${periodType === 'DAY' ? ', WEEKDAY(DATE_ADD(checkoutdate, INTERVAL -${timeIntervalInMinutes} MINUTE)) + 1 AS checkoutDayOfWeek' : ''}
            ${outputType === 'transacties_voltooid' ? ', COUNT(*) AS totalTransactions' : ''}
            ${outputType === 'inkomsten' ? ', SUM(price) AS totalTransactions' : ''}
        FROM transacties_archief
        WHERE citycode = ?
        ${bikeParkId ? `AND locationid IN (?)` : `AND sectionid LIKE ?`}
        ${selectType === 'BIKETYPE' || selectType === 'CLIENTTYPE' ? `AND sectionid = ?` : ''}
        AND checkoutdate BETWEEN ? AND ?
        GROUP BY ${selectType === 'STALLING' ? 'locationid' : ''}
        ${selectType === 'SECTIE' ? ', sectionid' : ''}
        ${selectType === 'BIKETYPE' ? ', biketypeid' : ''}
        ${selectType === 'CLIENTTYPE' ? ', clienttypeid' : ''}
        ${periodType === 'YEAR' ? ', checkoutYear' : ''}
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
        zipID,
        bikeParkId || `${zipID}%`,
        sectionID,
        adjustedStartDate.format('YYYY-MM-DD HH:mm:ss'),
        adjustedEndDate.format('YYYY-MM-DD HH:mm:ss')
    ];

    return { sql, queryParams };
}

const getTransactionsByPeriod = async (params: GetTransactionsByPeriodParams): Promise<ReportData> => {
    const { sql, queryParams } = getTransactionsByPeriodSQL(params);


    console.log(sql, queryParams);
    // const transactions = await prisma.$queryRawUnsafe(sql, ...queryParams);

    // console.log(transactions);

    return {
        title: "Transacties per periode",
        columns: ["columnA", "columnB"],
        data: [["dataA1", 1], ["dataA2", 2]]
    };
};

const dummyExampleCalls = async () => {
    // this function containts example parameters sets for all valid combinations of parameters
    const exampleparameters = [
        {
            zipID: "12345",
            startDate: new Date(),
            endDate: new Date(),
            periodType: PeriodType.WEEK,
            selectType: SelectType.STALLING,
            outputType: OutputType.TRANSACTIONS
        },
        {
            zipID: "12345",
            startDate: new Date(),
            endDate: new Date(),
            periodType: PeriodType.WEEK,
            selectType: SelectType.STALLING,
            outputType: OutputType.INKOMSTEN,
        },
    ]

    for (const params of exampleparameters) {
        await getTransactionsByPeriod(params);
    }
}

export default getTransactionsByPeriod;

