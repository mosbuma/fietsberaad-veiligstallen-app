import { prisma } from "~/server/db";
import { VSUserRoleValuesNew, type VSUserWithRolesNew } from "~/types/users";
import { createSecurityProfile } from "~/utils/server/securitycontext";

export const getSecurityUserNew = async (id: string, activeContactID: string): Promise<VSUserWithRolesNew|false> => {
  const data = await prisma.security_users.findFirst({
    where: {
      UserID: id,
    },
    select: {
      UserID: true,
      UserName: true,
      DisplayName: true,
      Status: true,
      LastLogin: true,
      user_contact_roles: {
        where: {
          ContactID: activeContactID,
        },
        select: {
          NewRoleID: true,
        }
      }
    }
  })

  if(!data) {
    console.error("Security user not found:", id);
    return false;
  }

  let roleId = VSUserRoleValuesNew.None;
  if(data.user_contact_roles.length === 0) {
    console.warn("Security user has no contact roles:", id);
    roleId = VSUserRoleValuesNew.None;
  } else if(data.user_contact_roles.length !== 1 || !data.user_contact_roles[0]?.NewRoleID) {
    console.error("Security user has multiple contact roles:", id);
    return false;
  } else {
    roleId = data.user_contact_roles[0].NewRoleID as VSUserRoleValuesNew;
  }

  return {
    ...data,
    securityProfile: createSecurityProfile(roleId),
  } as unknown as VSUserWithRolesNew;
}
