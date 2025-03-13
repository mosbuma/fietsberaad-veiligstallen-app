import type { VSUserWithRoles } from "~/types/users";

export const getRelatedUsersForGemeente = (allUsers: VSUserWithRoles[], gemeenteID: string | null) => {
    if(gemeenteID===null) {
        return [];
    }

    return allUsers.filter((user) => { 
        return (
            user.security_users_sites.some((site) => (site.SiteID === gemeenteID || (user.GroupID === "intern" && site.SiteID === "0")))
        )
    })
}

export const groupUsersByGroupID = (users: VSUserWithRoles[]) => {
    return users.reduce((acc, user) => {
        const key = user.GroupID || "unknown";
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(user);
        return acc;
    }, {} as Record<string, VSUserWithRoles[]>);
}
