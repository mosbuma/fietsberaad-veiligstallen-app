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
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get the user's archive status
    const userStatus = await prisma.user_status.findUnique({
      where: { UserID: userId },
      select: { Archived: true }
    });

    // If no status record exists, the user is not archived
    return res.status(200).json({ archived: userStatus?.Archived || false });
  } catch (error) {
    console.error('Error fetching user archive status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 