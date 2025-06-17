import { prisma } from "~/server/db";
import { type UserStatusParams, type UserStatusStatus } from "~/backend/services/database-service";

export const getUserStatusTableStatus = async (params: UserStatusParams) => {
  const sqldetecttable = `SELECT COUNT(*) As count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name= 'user_status'`;

  let tableExists = false;
  const status: UserStatusStatus | false = {
    status: 'missing',
    size: undefined,
  };

  try {
    const result = await prisma.$queryRawUnsafe<{ count: number }[]>(sqldetecttable);
    tableExists = result && result.length > 0 && result[0] ? result[0].count > 0 : false;
    if (tableExists) {
      status.status = 'available';

      const sqlGetStatistics = `SELECT COUNT(*) As count FROM user_status`;
      const resultStatistics = await prisma.$queryRawUnsafe<{ count: number }[]>(sqlGetStatistics);
      if (resultStatistics && resultStatistics.length > 0 && resultStatistics[0] !== undefined) {
        status.size = parseInt(resultStatistics[0].count.toString());
      }
    }
    return status;
  } catch (error) {
    console.error(">>> userStatusTable ERROR Unable to get user-status table status", error);
    return false;
  }
}

export const updateUserStatusTable = async (params: UserStatusParams): Promise<UserStatusStatus | false> => {
  // Empty handler as requested
  const status = await getUserStatusTableStatus(params);
  console.log("*** updateUserStatusTable STATUS", status);
  return status;
}

export const clearUserStatusTable = async (params: UserStatusParams) => {
  const sql = `DELETE FROM user_status;`;
  await prisma.$executeRawUnsafe(sql);

  return getUserStatusTableStatus(params);
}

export const createUserStatusTable = async (params: UserStatusParams) => {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS user_status (
    UserID VARCHAR(36) NOT NULL,
    Archived bool DEFAULT false,
    PRIMARY KEY (UserID),
    UNIQUE KEY UserID (UserID)
  );`;

  const result = await prisma.$queryRawUnsafe(sqlCreateTable);
  if (!result) {
    console.error("Unable to create user_status table", result);
    return false;
  }

  return getUserStatusTableStatus(params);
}

export const dropUserStatusTable = async (params: UserStatusParams) => {
  const sql = "DROP TABLE IF EXISTS user_status";

  const result = await prisma.$queryRawUnsafe(sql);
  if (!result) {
    console.error("Unable to drop user_status table", result);
    return false;
  }

  return getUserStatusTableStatus(params);
} 