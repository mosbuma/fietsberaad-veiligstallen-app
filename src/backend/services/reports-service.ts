import getTransactionsByPeriod from "~/backend/services/reports/transactionsByPeriod";
import getBezettingsdataByPeriod from "~/backend/services/reports/bezettingsdataByPeriod";
import { ReportParams } from "~/components/beheer/reports/ReportsFilter";

export interface ReportSeriesData {
    name: string;
    data: number[];
  }
  
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
        labels: {
          formatter: (value: string) => string;
        };
    };
    yaxis: {
      title: {
        text: string;
      };
    };
  };
  series: ReportSeriesData[];
}

const ReportService = {
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
  },
  getBezettingsdataPerPeriodData: async (params: ReportParams) => {
    try {
      const data = await getBezettingsdataByPeriod(params);

      return data;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};

export default ReportService;
