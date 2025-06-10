import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import { getManagedContacts } from "~/utils/server/securitycontext";
import { prisma } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.query;
    if (!userId || Array.isArray(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const user = await prisma.security_users.findUnique({
            where: { UserID: userId },
            include: {
                security_users_sites: true,
                security_roles: true,
                user_contact_roles: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const managedContacts = await getManagedContacts(user);
        return res.status(200).json({ managedContacts });
    } catch (error) {
        console.error('Error fetching managed contacts:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 