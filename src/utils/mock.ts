// Mock implementations of User and Council interfaces
import { security_users } from '@prisma/client';
import { User } from "next-auth";

export type newModule = 'articles' | 'faq' | 'contacts' | 'producten' | 'reports' | 'logboek' | 'users' | 'permits' | 'barcodereeksen' | 'apis' | 'abonnementen';

export type newUserRole = 'intern_admin' | 'extern_admin' | 'extern_redacteur' | 'exploitantbeheerder' | 'dataanalist' | 'beheerder' | 'user' | 'exploitant' | 'admin' | 'intern_editor' | 'root';

export type newUserRight = 'gemeente' | 'website' | 'locaties' | 'fietskluizen' | 'buurtstallingen' | 'abonnementen' | 'documenten' | 'fietsenwin' | 'diashow' | 'accounts' | 'rapportages' | 'externalApis' | 'permits' | 'sleutelhangerreeksen' | 'registranten' | 'users';

export const userHasRole = (user: User|undefined, role: newUserRole) => true;
export const userHasRight = (user: User | undefined, right: newUserRight) => true; /* TODO: remove - for testing, all users have all rights */
export const userHasModule = (user: User | undefined, module: string) => true;
