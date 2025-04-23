import type { VSUserWithRoles } from "~/types/users";

export const getRelatedUsersForGemeente = (allUsers: VSUserWithRoles[], gemeenteID: string | null) => {
    if(gemeenteID===null) {
        return [];
    }

    return allUsers.filter((user) => { 
        return (
            user.security_users_sites.some((site) => {
                const isLinkedUser = site.SiteID === gemeenteID
                const isSysteemGebruiker = user.GroupID === "intern" && site.SiteID === "0"    
                return ( isLinkedUser || isSysteemGebruiker )
            })
        )
    })
}

export const groupUsersByGroupID = (users: VSUserWithRoles[]) => {
    const initialAcc: Record<string, VSUserWithRoles[]> = {};
    return users.reduce((acc, user) => {
        const key = user.GroupID || "unknown";
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key]!.push(user);
        return acc;
    }, initialAcc);
}
