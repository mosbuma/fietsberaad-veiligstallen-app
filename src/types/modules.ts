import { modules } from "@prisma/client";

export type VSModule = Pick<modules, "ID" | "Name">;

export enum VSModuleValues {
    Abonnementen = "abonnementen",
    Buurtstallingen = "buurtstallingen",
    Fietskluizen = "fietskluizen",
    Fms = "fms",
    Veiligstallen = "veiligstallen"
}
  
