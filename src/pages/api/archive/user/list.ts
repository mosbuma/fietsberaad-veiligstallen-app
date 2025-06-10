import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/server/db';
import { getServerSession } from 'next-auth';
import { authOptions } from "~/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all archived users
    const archivedUsers = await prisma.user_status.findMany({
      where: { Archived: true },
      select: { UserID: true }
    });

    return res.status(200).json({ archivedUserIds: archivedUsers.map(user => user.UserID) });
  } catch (error) {
    console.error('Error fetching archived users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 