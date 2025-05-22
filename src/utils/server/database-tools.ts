import { Prisma } from "~/generated/prisma-client";
import { prisma } from "~/server/db";
import type { NextApiRequest } from "next";
import { type VSUserWithRoles, securityUserSelect } from "~/types/users";
import { createSecurityProfile } from "~/utils/server/securitycontext";

type ValidationError = {
  error: string;
  status: 401;
};

type ValidationSuccess = {
  sites: string[];
  userId: string;
  activeContactId: string;
};

type ApiResponse<T> = {
  success: boolean;
  result?: T;
  error?: string;
};

// Helper function to generate ID in the correct format
export function generateID() {
  const chars = '0123456789ABCDEF';
  const parts = [
    Array.from({length: 8}, () => chars[Math.floor(Math.random() * 16)]).join(''),
    Array.from({length: 4}, () => chars[Math.floor(Math.random() * 16)]).join(''),
    Array.from({length: 4}, () => chars[Math.floor(Math.random() * 16)]).join(''),
    Array.from({length: 16}, () => chars[Math.floor(Math.random() * 16)]).join('')
  ];
  return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
}

// Helper function to validate user session and get their sites
export async function validateUserSession(session: any, itemType: string = "organizations"): Promise<ValidationError | ValidationSuccess> {
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  const theuser = await prisma.security_users.findUnique({
    where: {
      UserID: session.user.id
    },
    select: {
      security_users_sites: {
        select: {
          SiteID: true
        }
      },
      RoleID: true
    }
  });

  if (!theuser) {
    console.error("Unauthorized - no user found");
    return { error: "Unauthorized", status: 401 };
  }

  const data: ValidationSuccess = {
    userId: session.user.id,
    activeContactId: session.user.activeContactId,
    sites: []
  }

  if(theuser.RoleID !== 1) {
    data.sites = theuser.security_users_sites.map((site) => site.SiteID);
  } else {
    let whereFilter: Prisma.contactsWhereInput = {  ItemType: itemType };
    if(itemType === "any") {
      whereFilter = {
        OR: [
          { ItemType: "organizations" },
          { ItemType: "exploitant" },
          { ItemType: "admin" }
        ]
      }
    }
    // organizations or admin
    const allSites = await prisma.contacts.findMany({
      // where: whereFilter,
      select: {
        ID: true
      }
    });

    data.sites = allSites.map((site) => site.ID);
  }

  return data;
}

// Helper function to get base URL from request
export function getBaseUrl(req: NextApiRequest): string {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return `${protocol}://${host}`;
}

// Helper function to make API calls
export async function makeApiCall<T>(
  req: NextApiRequest,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const baseUrl = getBaseUrl(req);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `${response.status} - ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      result: data
    };
  } catch (error) {
    return {
      success: false,
      error: JSON.stringify(error)
    };
  }
}

// Helper function to update security profile
export async function updateSecurityProfile(session: any, userId: string): Promise<{ session: any; error?: string }> {
  try {
    const updatedUser = await prisma.security_users.findFirst({
      where: { UserID: userId },
      select: securityUserSelect
    }) as VSUserWithRoles;

    if (!updatedUser) {
      console.error("Fout bij het ophalen van bijgewerkte gebruikersgegevens");
      return { session, error: "Fout bij het bijwerken van beveiligingsprofiel" };
    }

    // Create new security profile with updated data
    const securityProfile = await createSecurityProfile(updatedUser, session.user.activeContactId);

    // Update session with new security profile
    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        securityProfile
      }
    };

    return { session: updatedSession };
  } catch (error) {
    console.error("Error updating security profile:", error);
    return { session, error: "Fout bij het bijwerken van beveiligingsprofiel" };
  }
} 