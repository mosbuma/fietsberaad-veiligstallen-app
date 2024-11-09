import { IReportService } from "~/backend/handlers/report-service-interface";
import getTransactionsByPeriod, {GetTransactionsByPeriodParams, PeriodType, SelectType, OutputType} from "~/backend/services/reports/transactionsByPeriod";

export type ReportData = {
    title: string;
    columns: string[];
    data: any[][];
}

const ReportService: IReportService<ReportData | false> = {
//   getStallingduurData: async () => {
//     const data: ReportData = {
//         title: "Stallingduur",
//         columns: ["columnA", "columnB"],
//         data: [["dataA1", 1], ["dataA2", 2]]
//     }

//     return data;
//   },
  getTransactionsPerPeriodData: async () => {
    try {
        const data: ReportData = {
            title: "Transacties per periode",
            columns: ["columnA", "columnB"],
            data: [["dataA1", 1], ["dataA2", 2]]
        }

        const params: GetTransactionsByPeriodParams = {
            zipID: "12345",
            startDate: new Date(2018, 0, 1),
            endDate: new Date(2018, 11, 31),
            periodType: PeriodType.YEAR,
            selectType: SelectType.STALLING,
            outputType: OutputType.TRANSACTIONS,
        }

        const data2 = await getTransactionsByPeriod(params);
        console.log("", data2);

        return data;
    } catch (error) {
        console.error(error);
        return false;
    }
  }
};

export default ReportService;
