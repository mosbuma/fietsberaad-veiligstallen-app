import { modules } from "~/generated/prisma-client";

export type VSModule = Pick<modules, "ID" | "Name">;

export enum VSModuleValues {
    Abonnementen = "abonnementen",
    Buurtstallingen = "buurtstallingen",
    Fietskluizen = "fietskluizen",
    Fms = "fms",
    Veiligstallen = "veiligstallen"
}
  
