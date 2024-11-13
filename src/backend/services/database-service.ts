import { getTransactionCacheStatus, updateTransactionCache, clearTransactionCache, createTransactionCacheTable, dropTransactionCacheTable } from "~/backend/services/database/TransactionsCacheActions";

export type TransactionCacheActions = 'update' | 'clear' | 'createtable' | 'droptable' | 'status';

export interface TransactionCacheParams {
  action: TransactionCacheActions;
  allDates: boolean;
  allBikeparks: boolean;
  startDate: Date;
  selectedBikeparkIDs: string[];
 }

 export interface TransactionCacheStatus {
  status: 'missing' | 'available' | 'error';
  size: number | undefined;
  firstUpdate: Date | null | undefined; // null -> no data yet
  lastUpdate: Date | null | undefined; // null -> no data yet
 }

 export interface TransactionCacheResult {
  success: boolean;
  message: string;
  status?: TransactionCacheStatus | false;
 }

 const DatabaseService = {
  manageTransactionCache: async (params: TransactionCacheParams): Promise<TransactionCacheResult> => {
    switch (params.action) {
      case 'status':
        const status = await getTransactionCacheStatus(params);
        return { success: status!==undefined, message: "", status };
      case 'update': {
        const status = await updateTransactionCache(params);
        return { success: status!==undefined, message: "", status };
      }
      case 'clear': {
        const status = await clearTransactionCache(params);
        return { success: status!==undefined, message: "", status };
      }
      case 'createtable': {  
        // TODO: remove when this table has been implemented in the prisma scripts and primary database
        const status = await createTransactionCacheTable(params);
        return { success: status!==undefined, message: "", status };
      }
      case 'droptable': { // TODO: remove when this table has been implemented in the prisma scripts and primary database
        const status = await dropTransactionCacheTable(params);
        return { success: status!==undefined, message: "", status };
      }
      default: {
        return { success: false, message: "Invalid action" };
      }
    }
  }
};

export default DatabaseService;

