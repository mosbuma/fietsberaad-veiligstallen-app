import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import { prisma } from "~/server/db";
import { VSUserRoleValuesNew } from "~/types/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is rootadmin for contact ID "1"
    const userContactRole = await prisma.user_contact_role.findFirst({
        where: {
            UserID: session.user.id,
            ContactID: "1",
            NewRoleID: VSUserRoleValuesNew.RootAdmin
        }
    });

    if (!userContactRole) {
        return res.status(403).json({ error: 'Only rootadmin users can perform database actions' });
    }

    const { actionType } = req.query;
    if (!actionType || Array.isArray(actionType)) {
        return res.status(400).json({ error: 'Invalid action type' });
    }

    try {
        switch (actionType) {
            case 'create':
                await prisma.user_contact_role.create({
                    data: {
                        ID: req.body.id,
                        UserID: req.body.userId,
                        ContactID: req.body.contactId,
                        NewRoleID: req.body.newRoleId
                    }
                });
                break;

            case 'update':
                await prisma.user_contact_role.update({
                    where: { ID: req.body.id },
                    data: {
                        UserID: req.body.userId,
                        ContactID: req.body.contactId,
                        NewRoleID: req.body.newRoleId
                    }
                });
                break;

            case 'delete':
                await prisma.user_contact_role.delete({
                    where: { ID: req.body.id }
                });
                break;

            case 'clear':
                await prisma.user_contact_role.deleteMany({});
                break;

            default:
                return res.status(400).json({ error: 'Invalid action type' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error performing database action:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 