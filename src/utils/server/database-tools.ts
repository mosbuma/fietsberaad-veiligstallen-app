import { prisma } from "~/server/db";
import type { NextApiRequest } from "next";

type ValidationError = {
  error: string;
  status: 401;
};

type ValidationSuccess = {
  sites: string[];
  userId: string;
};

type ApiResponse<T> = {
  success: boolean;
  result?: T;
};

// Helper function to generate ID in the correct format
export function generateID() {
  const chars = '0123456789ABCDEF';
  const parts = [
    Array.from({length: 4}, () => chars[Math.floor(Math.random() * 16)]).join(''),
    Array.from({length: 4}, () => chars[Math.floor(Math.random() * 16)]).join(''),
    Array.from({length: 4}, () => chars[Math.floor(Math.random() * 16)]).join(''),
    Array.from({length: 16}, () => chars[Math.floor(Math.random() * 16)]).join('')
  ];
  return `${parts[0]}${parts[1]}-${parts[2]}-${parts[3]}`;
}

// Helper function to validate user session and get their sites
export async function validateUserSession(session: any): Promise<ValidationError | ValidationSuccess> {
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
    return { error: "Unauthorized", status: 401 };
  }

  if(theuser.RoleID !== 1) {
    return { 
      sites: theuser.security_users_sites.map((site) => site.SiteID),
      userId: session.user.id
    };
  } else {
    const allSites = await prisma.contacts.findMany({
      where: {
        ItemType: "organizations"
      }
    });
    console.log("admin gets all sites", allSites.length);
    return { 
      sites: allSites.map((site) => site.ID),
      userId: session.user.id
    };
  }
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
    };
  }
} 