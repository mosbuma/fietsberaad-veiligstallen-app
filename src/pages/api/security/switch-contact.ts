import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "~/server/db";
import { createSecurityProfile } from "~/utils/securitycontext";
import { VSUserWithRoles, securityUserSelect } from "~/types/users";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { contactId } = req.body;
    if (!contactId) {
        return res.status(400).json({ error: 'Contact ID is required' });
    }

    try {
        // Get current user data
        const user = await prisma.security_users.findFirst({
            where: { UserID: session.user.id },
            select: securityUserSelect
        }) as VSUserWithRoles;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check access rights
        const hasAccess = session.user.securityProfile.managingContactIDs.includes(contactId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this contact' });
        }

        // Create new security profile with updated active contact
        const securityProfile = await createSecurityProfile(user, contactId);

        // Create updated user object
        const updatedUser = {
            ...session.user,
            activeContactId: contactId,
            securityProfile
        };

        // The session will be automatically updated on the server side
        // when the client calls the update() function from useSession

        console.log(">>> updatedUser activeContactId", updatedUser.activeContactId);

        return res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error('Error switching contact:', error);
        return res.status(500).json({ error: 'Failed to switch contact' });
    }
} 