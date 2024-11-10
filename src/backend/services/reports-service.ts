import { IReportService } from "~/backend/handlers/report-service-interface";
import getTransactionsByPeriod, { GetTransactionsByPeriodParams, PeriodType, SelectType, OutputType } from "~/backend/services/reports/transactionsByPeriod";

export type ReportData = {
  title: string;
  options: any;
  series: any[];
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
      const dummyData = {
        title: "Transacties per periode",
        columns: ["columnA", "columnB"],
        data: [["dataA1", 1], ["dataA2", 2]]
      }

      const params: GetTransactionsByPeriodParams = {
        zipID: "12345",
        startDate: new Date(2016, 5, 1),
        endDate: new Date(2016, 5, 30),
        periodType: PeriodType.YEAR,
        selectType: SelectType.STALLING,
        outputType: OutputType.TRANSACTIONS,
      }

      const data = await getTransactionsByPeriod(params);
      console.log("", data);

      return data;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};

export default ReportService;
