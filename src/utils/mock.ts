// Mock implementations of User and Council interfaces
import { security_users } from '@prisma/client';
import { User } from "next-auth";

export type newModule = 'articles' | 'faq' | 'contacts' | 'producten' | 'reports' | 'logboek' | 'users' | 'permits' | 'barcodereeksen' | 'apis' | 'abonnementen';

export type newUserRole = 'intern_admin' | 'extern_admin' | 'extern_redacteur' | 'exploitantbeheerder' | 'dataanalist' | 'beheerder' | 'user' | 'exploitant' | 'admin' | 'intern_editor' | 'root';

export type newUserRight = 'gemeente' | 'website' | 'locaties' | 'fietskluizen' | 'buurtstallingen' | 'abonnementen' | 'documenten' | 'fietsenwin' | 'diashow' | 'accounts' | 'rapportages' | 'externalApis' | 'permits' | 'sleutelhangerreeksen' | 'registranten' | 'users';

export const userHasRole = (user: User, role: newUserRole) => true;
export const userHasRight = (user: User, right: newUserRight) => true; /* TODO: remove - for testing, all users have all rights */
export const userHasModule = (user: User, module: string) => true;

// export class MockUser implements User {
//     data: security_users | undefined;

//     constructor(data?: security_users) {
//       this.data = data;
//     }

//     getDisplayName = () => (this.data===undefined || this.data.DisplayName===null ? 'John Doe': this.data.DisplayName);
//     hasRight = (right: string) => {
//       // Implement your logic to check user rights
//       const rights = ['permits', 'users', 'report'];
//       return rights.includes(right);
//     };
//     getRole = () => 'admin' as newUserRole;
//     getGemeenteIDs = () => ["E198D753-B00C-0F41-9A8C0F275D822E6D","E1991A95-08EF-F11D-FF946CE1AA0578FB", "863AA4F7-E6A7-236D-BFAAD9D80A54ADE6"];
//     getRoles = () => ['admin'] as newUserRole[];
//     getActief = () => (this.data===undefined ? true : this.data.Status==='1');
//   };

//   export const mockUser = new MockUser();
  
//   export const mockCouncil: Council = {
//     hasModule: (moduleName: string) => {
//       // Implement your logic to check council modules
//       const modules = ['fietskluizen', 'buurtstallingen', 'abonnementen'];
//       return modules.includes(moduleName) || true;
//     },
//     hasSubscriptionType: () => true,
//     getID: () => '1',
//     getCompanyName: () => 'Example Council',
//   };
  
//   export const mockExploitant: Exploitant = {
//     getCompanyName: () => 'Example Exploitant',
//   };
  
  