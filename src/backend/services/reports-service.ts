import { getSQL as getTransactionsByPeriodSQL } from "~/backend/services/reports/transactionsByPeriod";
import { getSQL as getBezettingsdataSQL} from "~/backend/services/reports/bezettingsdataByPeriod";
import { ReportParams } from "~/components/beheer/reports/ReportsFilter";
import { getData } from "~/backend/services/reports/ReportFunctions";
import { availableDataResult, getSQL as getAvailableDataSQL } from "~/backend/services/reports/availableData";
import { prisma } from "~/server/db";

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
  },

  getAvailableData: async (params: ReportParams) => {
    try {
      const sql = getAvailableDataSQL(params);
      if(!sql) {
      console.error("No result from getAvailableDataSQL");
      return false;
    }

      const data = await prisma.$queryRawUnsafe<availableDataResult[]>(sql);
      return data.map(d => ({
        locationID: d.locationID,
        yearmonth: d.yearmonth,
        count: d.total.toString()
      }));
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};

export default ReportService;
