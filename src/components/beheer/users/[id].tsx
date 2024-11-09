import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const user = await prisma.securityUser.findUnique({
      where: { id: String(id) },
      include: { organizations: true },
    });
    res.json(user);
  } else if (req.method === 'PUT') {
    const { email, displayName } = req.body;
    const user = await prisma.securityUser.update({
      where: { id: String(id) },
      data: { email, displayName },
    });
    res.json(user);
  } else if (req.method === 'DELETE') {
    await prisma.securityUser.delete({
      where: { id: String(id) },
    });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}