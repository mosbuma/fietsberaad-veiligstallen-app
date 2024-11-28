import { getSQL as getTransactionsByPeriodSQL } from "~/backend/services/reports/transactionsByPeriod";
import { getSQL as getBezettingsdataSQL} from "~/backend/services/reports/bezettingsdataByPeriod";
import { ReportParams } from "~/components/beheer/reports/ReportsFilter";
import { getData } from "~/backend/services/reports/ReportFunctions";

export interface ReportSeriesData {
    name: string;
    data: number[];
  }
  
export interface ReportData {
  title: string;
  options: {
    xaxis: {
        categories?: string[];
        title?: {
          text?: string;
          align?: string;
        };
        labels?: {
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
      const sql = getTransactionsByPeriodSQL(params);
      if(!sql) {
        console.error("No result from getTransactionsByPeriodSQL");
        return false;
      }
      
      const data = await getData(sql, params);

      return data;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  getBezettingsdata: async (params: ReportParams) => {
    try {
      const sql = getBezettingsdataSQL(params); // , queryParams
      if(!sql) {
          console.error("No result from getBezettingsdataSQL");
          return false;
      }

      const data = await getData(sql, params);

      return data;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};

export default ReportService;
