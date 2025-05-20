import { Prisma } from "~/generated/prisma-client";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { fietstypenSelect, VSFietstype } from "~/types/fietstypen";  

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  // As the response is always the same, we can just return the response directly
  res.json(
    [{"ID":3,"Name":"Afwijkende maten","naamenkelvoud":"Afwijkende maat"},{"ID":7,"Name":"Bakfietsen","naamenkelvoud":"Bakfiets"},{"ID":11,"Name":"Brede fietsen","naamenkelvoud":"Brede fiets"},{"ID":2,"Name":"Bromfietsen","naamenkelvoud":"Bromfiets"},{"ID":4,"Name":"Elektrische fietsen","naamenkelvoud":"Elektrische fiets"},{"ID":1,"Name":"Fietsen","naamenkelvoud":"Fiets"},{"ID":10,"Name":"Kinderfietsen","naamenkelvoud":"Kinderfiets"},{"ID":8,"Name":"Ligfietsen / tandems","naamenkelvoud":"Ligfiets / tandem"},{"ID":6,"Name":"Mindervalidenfietsen","naamenkelvoud":"Mindervalidenfiets"},{"ID":5,"Name":"Motorfietsen","naamenkelvoud":"Motorfiets"},{"ID":9,"Name":"Racefietsen","naamenkelvoud":"Racefiets"},{"ID":12,"Name":"Takels","naamenkelvoud":"Takel"}]
  );

  // const query: Prisma.fietstypenFindManyArgs = {
  //   select: fietstypenSelect,
  //   orderBy: [
  //     {
  //       Name: 'asc',
  //     },
  //   ],
  // }

  // const result = await prisma.fietstypen.findMany(query);
  // res.json(result as VSFietstype[])
}
