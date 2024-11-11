import type { NextApiRequest, NextApiResponse } from "next";
import ReportService from "~/backend/services/reports-service";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    let data = undefined;

    if (undefined === req.query.reportType || true === Array.isArray(req.query.reportType)) {
      res.status(405).end() // Method Not Allowed
    }

    switch (req.query.reportType) {
      case "transactionsPerPeriod":
        data = await ReportService.getTransactionsPerPeriodData(req.query);
        console.log("sending report data", data);
        res.json(data);
        break;
      default: {
        res.status(405).end() // Method Not Allowed
      }
    }
  } else {
    res.status(405).end() // Method Not Allowed
  }
}
