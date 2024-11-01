// Mock implementations of User and Council interfaces
import { User, Council, Exploitant } from '../components/beheer/LeftMenu';

export const mockUser: User = {
    displayName: 'John Doe',
    role: 'admin',
    realRole: 'admin',
    hasRight: (right: string) => {
      // Implement your logic to check user rights
      const rights = ['permits', 'users', 'report'];
      return rights.includes(right);
    },
    getRole: () => 'admin',
    getRealRole: () => 'admin',
  };
  
  export const mockCouncil: Council = {
    hasModule: (moduleName: string) => {
      // Implement your logic to check council modules
      const modules = ['fietskluizen', 'buurtstallingen', 'abonnementen'];
      return modules.includes(moduleName) || true;
    },
    hasSubscriptionType: () => true,
    getID: () => '1',
    getCompanyName: () => 'Example Council',
  };
  
  export const mockExploitant: Exploitant = {
    getCompanyName: () => 'Example Exploitant',
  };
  
  