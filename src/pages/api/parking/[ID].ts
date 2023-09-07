import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if (req.method === 'GET') {
    let parking = undefined;
    if(req.query.stallingid) {
      const query = {
        where: { ID: req.query.stallingId },
      }
  
      parking = await prisma.fietsenstallingen.findFirst(query);
      res.json(parking)
    } else {
      res.status(405).end() // Method Not Allowed
    }
  } else {
    res.status(405).end() // Method Not Allowed
  }  
}
