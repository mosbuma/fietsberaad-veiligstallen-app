import React, { useState, useEffect } from 'react';
import BikeparkSelect from '../reports/BikeparkSelect'; // Adjust the import path if necessary
import { ReportBikepark } from '../reports/ReportsFilter'; // Adjust the import path if necessary
import { CacheParams, CacheStatus, CacheActions, CacheResult } from "~/backend/services/database-service";
import CacheTableComponent from './CacheTable';
import moment from 'moment';

interface DatabaseComponentProps {
  firstDate: Date;
  lastDate: Date;
  bikeparks: ReportBikepark[] | undefined;
}

const DatabaseComponent: React.FC<DatabaseComponentProps> = ({ firstDate, lastDate, bikeparks }) => {

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Database</h1>
      <CacheTableComponent
        title="Transactie cache tabel"
        cacheEndpoint="/api/database/transactionscache"
        firstDate={firstDate}
        lastDate={lastDate}
        bikeparks={bikeparks}
      />
      <CacheTableComponent
        title="Bezettingen cache tabel"
        cacheEndpoint="/api/database/bezettingencache"
        firstDate={firstDate}
        lastDate={lastDate}
        bikeparks={bikeparks}
      />
      <CacheTableComponent
        title="Stallingsduur cache tabel"
        cacheEndpoint="/api/database/stallingsduurcache"
        firstDate={firstDate}
        lastDate={lastDate}
        bikeparks={bikeparks}
      />
    </div>
  );
};

export default DatabaseComponent;
