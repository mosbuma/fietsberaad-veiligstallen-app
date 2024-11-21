import { getTransactionCacheStatus, updateTransactionCache, clearTransactionCache, createTransactionCacheTable, dropTransactionCacheTable } from "~/backend/services/database/TransactionsCacheActions";
import { getBezettingCacheStatus, updateBezettingCache, clearBezettingCache, createBezettingCacheTable, dropBezettingCacheTable } from "~/backend/services/database/BezettingCacheActions";

export type CacheActions = 'update' | 'clear' | 'createtable' | 'droptable' | 'status';

export interface CacheResult {
  success: boolean;
  message: string;
  status?: CacheStatus | false;
}

export interface CacheParams {
  action: CacheActions;
  allDates: boolean;
  allBikeparks: boolean;
  startDate: Date;
  endDate: Date;
  selectedBikeparkIDs: string[];
}

export interface CacheStatus {
  status: 'missing' | 'available' | 'error';
  size: number | undefined;
  firstUpdate: Date | null | undefined; // null -> no data yet
  lastUpdate: Date | null | undefined; // null -> no data yet
}

const DatabaseService = {
  manageTransactionCache: async (params: CacheParams): Promise<CacheResult> => {
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
  },
  manageBezettingCache: async (params: CacheParams): Promise<CacheResult> => {
    switch (params.action) {
      case 'status':
        const status = await getBezettingCacheStatus(params);
        return { success: status!==undefined, message: "", status };
      case 'update': {
        console.log("UPDATE BEZETTING CACHE");
        const status = await updateBezettingCache(params);
        return { success: status!==undefined, message: "", status };
      }
      case 'clear': {
        const status = await clearBezettingCache(params);
        return { success: status!==undefined, message: "", status };
      }
      case 'createtable': {  
        // TODO: remove when this table has been implemented in the prisma scripts and primary database
        const status = await createBezettingCacheTable(params);
        return { success: status!==undefined, message: "", status };
      }
      case 'droptable': { // TODO: remove when this table has been implemented in the prisma scripts and primary database
        const status = await dropBezettingCacheTable(params);
        return { success: status!==undefined, message: "", status };
      }
      default: {
        return { success: false, message: "Invalid action" };
      }
    }
  },
};

export default DatabaseService;

