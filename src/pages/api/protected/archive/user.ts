import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import { prisma } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId, archived } = req.body;

    if (!userId || typeof archived !== 'boolean') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        await prisma.user_status.upsert({
            where: { UserID: userId },
            update: { Archived: archived },
            create: {
                UserID: userId,
                Archived: archived
            }
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating archive status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 