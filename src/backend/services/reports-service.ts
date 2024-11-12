import { IReportService } from "~/backend/handlers/report-service-interface";
import getTransactionsByPeriod from "~/backend/services/reports/transactionsByPeriod";
import { ReportParams } from "~/components/beheer/reports/ReportsFilter";

export interface ReportData {
  title: string;
  options: {
    [x: string]: { title: { text: string; }; };
    xaxis: {
      categories: string[];
      title: {
        text: string;
        align: string;
      };
    };
    yaxis: {
      title: {
        text: string;
      };
    };
  };
  series: {
    name: string,
    data: any[]
  }[];
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
  getTransactionsPerPeriodData: async (params: ReportParams) => {
    try {
      const data = await getTransactionsByPeriod(params);

      return data;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};

export default ReportService;
