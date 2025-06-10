import { prisma } from "~/server/db";
import { UserContactRoleParams, UserContactRoleStatus } from "~/backend/services/database-service";
import { convertRoleToNewRole } from "~/utils/securitycontext";
import { generateID } from "~/utils/server/database-tools";

export const getUserContactRoleTableStatus = async (params: UserContactRoleParams) => {
  const sqldetecttable = `SELECT COUNT(*) As count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name= 'user_contact_role'`;

  let tableExists = false;
  let status: UserContactRoleStatus | false = {
    status: 'missing',
    size: undefined,
  };

  console.log("**** GET USER CONTACT ROLE TABLE STATUS", params);

  try {
    // status.indexstatus = await getParentIndicesStatus(cacheInfo);

    const result = await prisma.$queryRawUnsafe<{ count: number }[]>(sqldetecttable);
    tableExists = result && result.length > 0 && result[0] ? result[0].count > 0 : false;
    if (tableExists) {
      status.status = 'available';

      const sqlGetStatistics = `SELECT COUNT(*) As count FROM user_contact_role`;
      const resultStatistics = await prisma.$queryRawUnsafe<{ count: number, firstUpdate: Date, lastupdate: Date }[]>(sqlGetStatistics);
      if (resultStatistics && resultStatistics.length > 0 && resultStatistics[0] !== undefined) {
        status.size = parseInt(resultStatistics[0].count.toString());
      }
    }
    return status;
  } catch (error) {
    console.error(">>> userContactTable ERROR Unable to get user-contacts table status", error);
    return false;
  }
}

export const updateUserContactRoleTable = async (params: UserContactRoleParams): Promise<UserContactRoleStatus | false> => {
  // console.log("UPDATE BEZETTING CACHE");
  
  if (false === await clearUserContactRoleTable(params)) {
    console.error(">>> updateUserContactRoleTable ERROR Unable to clear user-contacts table");
    return false;
  }

  // iterate over all security_users
  const allUsers = await prisma.security_users.findMany({
    select: {
      UserID: true,
      DisplayName: true,
      GroupID: true,
      SiteID: true,
      RoleID: true,
      ParentID: true,
      security_users_sites: true,
    }
  });

  for(const user of allUsers) {
    let mainContactId: string | undefined = undefined;
    switch(user.GroupID) {
      case 'intern': {
          mainContactId = "1";
          break;
      }
      case 'extern': {
          const relatedSites = user.security_users_sites;
          mainContactId = relatedSites[0]?.SiteID || undefined;
          break;
      }
      case 'exploitant': 
      case 'beheerder': {
          mainContactId = user?.SiteID || undefined;
          if(!mainContactId) {
            if(user.ParentID) {
              const parentUser = await prisma.security_users.findUnique({
                where: {
                  UserID: user.ParentID,
                },
              });
              mainContactId = parentUser?.SiteID || undefined;
            } else {
              console.error(`**** updateUserContactRoleTable ERROR No main contact ID and no parent ID for user ${user.DisplayName} /${user.GroupID}`);
            }

          }
          break;
      }
      case 'dataprovider':
        continue; // for now not implemented
      default:
        console.error("**** updateUserContactRoleTable ERROR Unknown groupID", user.GroupID);
        continue;
    }

    if(mainContactId) {
      const newRoleID = convertRoleToNewRole(user.RoleID, true);

      const result = await prisma.user_contact_role.create({
        data: {
          ID: generateID(),
          UserID: user.UserID,
          ContactID: mainContactId,
          NewRoleID: newRoleID.valueOf(),
        } 
      });
      console.log("**** result", result);
      
      console.log("**** create record for user", user.UserID, "with role", newRoleID.valueOf());
    } else {
      console.error(`**** updateUserContactRoleTable ERROR No main contact ID found for user ${user.UserID} /${user.GroupID}`);
    }
  }
  
  // get organizations that this user is linked to

  return getUserContactRoleTableStatus(params);
}

export const clearUserContactRoleTable = async (params: UserContactRoleParams) => {
  // console.log(params);
  const sql = `DELETE FROM user_contact_role;`;
  await prisma.$executeRawUnsafe(sql);

  return getUserContactRoleTableStatus(params);
}

export const createUserContactRoleTable = async (params: UserContactRoleParams) => {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS user_contact_role (
    ID VARCHAR(35) NOT NULL,
    UserID VARCHAR(36) NOT NULL,
    ContactID VARCHAR(36) NOT NULL,
    NewRoleID VARCHAR(16) DEFAULT 'none',
    PRIMARY KEY (ID),
    UNIQUE KEY UserIDContactID (UserID, ContactID ),
    CHECK(NewRoleID IN ('rootadmin', 'admin', 'editor', 'viewer', 'none'))
  );`;

  const result = await prisma.$queryRawUnsafe(sqlCreateTable);
  if (!result) {
    console.error("Unable to create user_contact_role table", result);
    return false;
  }

  return getUserContactRoleTableStatus(params);
}

export const dropUserContactRoleTable = async (params: UserContactRoleParams ) => {
  const sql = "DROP TABLE IF EXISTS user_contact_role";

  const result = await prisma.$queryRawUnsafe(sql);
  if (!result) {
    console.error("Unable to drop user_contact_role table", result);
    return false;
  }

  return getUserContactRoleTableStatus(params);
}