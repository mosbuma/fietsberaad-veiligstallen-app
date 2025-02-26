import { VSUserRoleValuesNew, VSSecurityTopic, VSCRUDRight, VSUserRoleValues } from "~/types";

export const getNewRoleLabel = (roleId: VSUserRoleValuesNew): string => {
    switch(roleId) {
        case VSUserRoleValuesNew.RootAdmin:
            return "Root Admin";
        case VSUserRoleValuesNew.None:
            return "None";
        case VSUserRoleValuesNew.Admin:
            return "Admin";
        case VSUserRoleValuesNew.Editor:
            return "Editor";
        case VSUserRoleValuesNew.DataAnalyst:
            return "Data Analyst";
        default:
            return "Unknown";
    }
}

export const getOldRoleLabel = (roleId: VSUserRoleValues): string => {
    switch(roleId) {
        case VSUserRoleValues.Root:
            return "Root";
        case VSUserRoleValues.InternAdmin:
            return "Intern Admin";
        case VSUserRoleValues.InternEditor:
            return "Intern Editor";
        case VSUserRoleValues.ExternAdmin:
            return "Extern Admin";
        case VSUserRoleValues.ExternEditor:
            return "Extern Editor";
        case VSUserRoleValues.Exploitant:
            return "Exploitant";
        case VSUserRoleValues.Beheerder:
            return "Beheerder";
        case VSUserRoleValues.ExploitantDataAnalyst:
            return "Exploitant Data Analyst";
        case VSUserRoleValues.InternDataAnalyst:
            return "Intern Data Analyst";
        case VSUserRoleValues.ExternDataAnalyst:
            return "Extern Data Analyst";
    }
}

export const initAllTopics = (value: VSCRUDRight) => {
    const allTopics = Object.values(VSSecurityTopic) as VSSecurityTopic[];
    return allTopics.reduce<Record<VSSecurityTopic, VSCRUDRight>>((acc, topic) => {
        acc[topic] = { ...value };
        return acc;
    }, {} as Record<VSSecurityTopic, VSCRUDRight>);
}

export const changeTopics = (
    currentTopics: Record<VSSecurityTopic, VSCRUDRight>,
    changeTopics: VSSecurityTopic[],
    newValue: VSCRUDRight
): Record<VSSecurityTopic, VSCRUDRight> => {
    return changeTopics.reduce<Record<VSSecurityTopic, VSCRUDRight>>((acc, topic) => {
        acc[topic] = { ...newValue };
        return acc;
    }, currentTopics);
}


