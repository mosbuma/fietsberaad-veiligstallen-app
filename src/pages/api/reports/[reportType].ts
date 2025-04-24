import type { NextApiRequest, NextApiResponse } from "next";
import ReportService from "~/backend/services/reports-service";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let data = undefined;

    // one of 

    switch (req.query.reportType) {
      case "transacties_voltooid":
      case "inkomsten": {
        let reportParams = req.body.reportParams;

        if (undefined === reportParams) {
          res.status(405).end() // Method Not Allowed
        }

        data = await ReportService.getTransactionsPerPeriodData(reportParams);
        if (false !== data) {
          res.json(data);
        } else {
          res.status(500).end();
        }
        break;
      }
      case "bezetting": {
        let reportParams = req.body.reportParams;

        if (undefined === reportParams) {
          res.status(405).end() // Method Not Allowed
        }

        data = await ReportService.getBezettingsdata(reportParams);
        res.json(data);
        break;
      }
      case "stallingsduur": {
        let reportParams = req.body.reportParams;

        if (undefined === reportParams) {
          res.status(405).end() // Method Not Allowed
        }
        data = await ReportService.getStallingsduurData(reportParams);
        res.json(data);
        break;
      }
      case "abonnementen":
      case "abonnementen_lopend":
      case "volmeldingen":
      case "gelijktijdig_vol":
      case "downloads":
      default: {
        res.status(405).end() // Method Not Allowed
      }
    }
  } else {
    res.status(405).end() // Method Not Allowed
  }
}
