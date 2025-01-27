import { prisma } from "~/server/db";
import type { security_users } from "@prisma/client";
import type { ICrudService } from "~/backend/handlers/crud-service-interface";
import { securityUserSelect, type VSUserWithRoles } from "~/types/";
import crypto from 'crypto';

function generateCustomId(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16)}`;
}

// inspired by https://medium.com/@brandonlostboy/build-it-better-next-js-crud-api-b45d2e923896
const UsersService: ICrudService<VSUserWithRoles> = {
  getAll: async () => {
    return await prisma.security_users.findMany({
      select: securityUserSelect
    });
  },
  getOne: async (id: string) => {
    const item = await prisma.security_users.findFirst({
      where: { UserID: id },
      select: securityUserSelect
    });

    return item;
  },
  create: async (data: VSUserWithRoles): Promise<VSUserWithRoles> => {
    try {
      console.log("### create data", data);
      const userID = generateCustomId();

      switch(data.RoleID) {
        case 1: // root
        case 2: // intern_admin
        case 3: // intern_editor
        case 9: // data_analyst (intern)
          data.GroupID = "intern";
          break;
        case 4: // extern_admin
        case 5: // extern_editor
        case 10: // data_analyst (extern)
          data.GroupID = "extern";
          break;
        case 6: // exploitant
        case 8: // data_analyst (exploitant)
          data.GroupID = "exploitant";
          break;
        case 7: //beheerder
          data.GroupID = "beheerder";
          break;
        default:
          console.error("### create error - invalid RoleID");
          throw new Error("Create failed");
          break;
      }

      const { security_roles, security_users_sites, ...userData } = data;
      const createresult = await prisma.security_users.create({ 
        data: { ...userData, UserID: userID },
        select: securityUserSelect
      });
      console.log("### createresult", createresult);

      // coldfusion -> new user role 6, dan ook een exploitant aanmaken
      //   <cfif request.siteID is 0 and form.RoleID is 6>
      //   <!---maak een exploitant in tabel contacts --->
      //   <!--- TODO: fix dit: create contact met hibernate werkt niet. er zit iets geks in de tabel --->
      //   <cfset newSiteID = CreateUUID()>
      //   <cfquery name="insert" datasource="#application.config.DSN#">
      //     INSERT INTO contacts (ID) VALUES ('#newSiteID#')
      //   </cfquery>
      //   <cfset exploitant = application.service.getExploitant(newSiteID)>
      //   <cfset user = application.service.getUser(form.itemID)>
      //   <cfset user.setCompany(exploitant)>
      //   <cfset application.service.saveUser(user)>

      //   <cfset exploitant.setItemType("exploitant")>
      //   <cfset exploitant.setHelpdesk(form.userName)>
      //   <cfset exploitant.setCompanyName(form.displayName)>
      //   <cfset exploitant.setUrlName(LCase(Replace(form.displayName, " ", "-", "ALL")))>

      //   <!--- voeg de koppelingen met de gemeenten bij --->
      //   <cfloop list="#form.siteID#" index="i">
      //     <cfset council = application.service.getCouncil(i)>
      //     <cfset exploitant.addContact(council)>
      //   </cfloop>

      //   <cfset application.service.saveExploitant(exploitant)>

      // </cfif>







      return createresult;
    } catch (error) {
      console.error("### create error", error);
      throw new Error("Create failed");
    }
  },
  update: async (_id: string, _data: VSUserWithRoles): Promise<VSUserWithRoles> => {
    try {
      const { security_roles, security_users_sites, ...userData } = _data;
      const result = await prisma.security_users.update({
        where: { UserID: _id },
        data: userData,
        select: securityUserSelect
      });

      // coldfusion -> update user role 6, dan ook de exploitant in contacts updaten
    //   <cfif request.siteID is 0 and form.RoleID is 6>
    //   <!--- update de exploitant in tabel contacts --->
    //   <cfset user = application.service.getUser(form.itemID)>
    //   <cfset exploitant = user.getCompany()>
    //   <cfset application.service.saveUser(user)>
    //   <cfset exploitant.setItemType("exploitant")>
    //   <cfset exploitant.setHelpdesk(form.userName)>
    //   <cfset exploitant.setCompanyName(form.displayName)>
    //   <cfset exploitant.setUrlName(LCase(Replace(form.displayName, " ", "-", "ALL")))>

    //   <!--- werk de koppelingen met de gemeenten bij --->
    //   <cfloop list="#form.siteID#" index="i">
    //     <cfset council = application.service.getCouncil(i)>
    //     <cfif Not exploitant.hasCouncil(council)>
    //       <cfset exploitant.addCouncil(council)>
    //     </cfif>
    //   </cfloop>

    //   <!--- remove councils that are not attached --->
    //   <cfif exploitant.hasCouncilLinkObject()>
    //     <cfloop array="#exploitant.getCouncilLinkObjects()#" index="councilLinkObject">
    //       <cfif Not ListFind(form.siteID, councilLinkObject.getCouncil().getID())>
    //         <cfset exploitant.removeCouncilLinkObject(councilLinkObject)>
    //       </cfif>
    //     </cfloop>
    //   </cfif>
    //   <cfset application.service.saveExploitant(exploitant)>
    // </cfif>




      return result;
    } catch (error) {
      console.error("### update error", error);
      throw new Error("Update failed");
    }
  },
  delete: async (_id: string): Promise<VSUserWithRoles> => {
    try {
      return await prisma.security_users.delete({ 
        where: { UserID: _id },
        select: securityUserSelect 
      });
    } catch (error) {
      console.error("### delete error", error);
      throw new Error("Function not implemented.");
    }
  },
};

export default UsersService;
