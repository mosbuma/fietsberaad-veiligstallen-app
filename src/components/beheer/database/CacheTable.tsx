import React, { useState, useEffect } from 'react';
import BikeparkSelect from '../reports/BikeparkSelect'; // Adjust the import path if necessary
import { ReportBikepark } from '../reports/ReportsFilter'; // Adjust the import path if necessary
import { CacheParams, CacheStatus, CacheActions, CacheResult } from "~/backend/services/database-service";
import moment from 'moment';

interface CacheTableComponentProps {
  title: string;
  cacheEndpoint: string;
  firstDate: Date;
  lastDate: Date;
  bikeparks: ReportBikepark[] | undefined;
}

const CacheTableComponent: React.FC<CacheTableComponentProps> = ({ title, cacheEndpoint,firstDate, lastDate, bikeparks }) => {
  const [allDates, setAllDates] = useState<boolean>(true);
  const [allBikeparks, setAllBikeparks] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<Date>(() => {
    return moment().subtract(7, 'days').toDate();
   });
  const [selectedBikeparkIDs, setSelectedBikeparkIDs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | undefined>(undefined);
  const [warningState, setWarningState] = useState<string | undefined>(undefined);

  const [cacheStatus, setCacheStatus] = useState<CacheStatus | undefined>(undefined);
  const [updateCounter, setUpdateCounter] = useState<number>(0);

  useEffect(() => {
    const fetchCacheStatus = async () => {
      const databaseParams: CacheParams = {
        action: 'status',
        allDates,
        allBikeparks,
        startDate,
        endDate: lastDate,
        selectedBikeparkIDs
      };

      setLoading(true);
      try {
        const response = await fetch(cacheEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              databaseParams
            })
          })

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const json = await response.json();
          setCacheStatus(json.status);
          setErrorState("");
      } catch (error) {
        console.error(error);
          setErrorState("Cache action failed");
        } finally {
          setLoading(false);
      }
    };

    fetchCacheStatus();
  }, [updateCounter]);

  const handleProcessCache = (action: CacheActions) => {
    const processCache = async () => {
      const databaseParams: CacheParams = {
        action,
        allDates,
        allBikeparks,
        startDate,
        endDate: lastDate,
        selectedBikeparkIDs
      };

      setLoading(true);
      try {
        const response = await fetch(`${cacheEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              databaseParams
            })
          })

          if (!response.ok) {
            throw new Error(`Error: ${response}`);
          }
          
          let result = await response.json() as CacheResult;
          if(result.success && result.status) {
            setCacheStatus(result.status);
            setErrorState("");
          } else {
            setErrorState("Cache action failed");
            setUpdateCounter(updateCounter+1);
          }
      } catch (error) {
        console.error(error);
        setErrorState("Cache action failed");
        setUpdateCounter(updateCounter+1);
      } finally {
        setLoading(false);
      }
    };

    processCache();
  };

  const renderFilter = () => {
    return (
      <>
        <div className="flex flex-col items-left mb-4 p-2 border-2 border-gray-400 rounded-md w-1/3">
          {!allDates && (
            <>
              <label className="mr-2">Vanaf</label>
              <input
                type="date"
              value={moment(startDate).format('YYYY-MM-DD')}
              onChange={(e) => setStartDate(moment(e.target.value).toDate())}
              className="ml-4 p-2 border-2 border-gray-400 rounded-md mb-2"
            />
            </>
          )}
          <label className="mr-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={allDates}
              onChange={() => setAllDates(!allDates)}
            />
            Alle datums
          </label>
        </div>

        <div className="w-1/3 p-2 border-2 border-gray-400 rounded-md">
          {!allBikeparks && bikeparks && (
            <div className="ml-2">
              <BikeparkSelect
                bikeparks={bikeparks}
                selectedBikeparkIDs={selectedBikeparkIDs}
                setSelectedBikeparkIDs={setSelectedBikeparkIDs}
                />
            </div>
          )}
        <label className="mr-2">
            <input
              type="checkbox"
              className="mr-2  mb-2"
              checked={allBikeparks}
              onChange={() => setAllBikeparks(!allBikeparks)}
            />
            Alle stallingen
          </label>
        </div>
      </>
    )
  }

  const renderActions = () => {
    if(cacheStatus?.status==='available') {
    return (
      <div className="flex flex-row mt-4 space-x-2">
        <button
          onClick={() => handleProcessCache('update')}
          className={`p-2 rounded-md bg-blue-500 hover:bg-blue-700 text-white w-64`}
        >
          Cache Tabel Vullen{!allBikeparks && selectedBikeparkIDs.length > 0 ? ` met ${selectedBikeparkIDs.length} stallingen` : ''}
        </button> 
        <button
          onClick={() => handleProcessCache('clear')}
          className={`p-2 rounded-md bg-blue-500 hover:bg-blue-700 text-white w-64`}
        >
          Cache Tabel Leegmaken
        </button> 
        <button
          onClick={() => handleProcessCache('droptable')}
          className={`p-2 rounded-md bg-blue-500 hover:bg-blue-700 text-white w-64`}
        >
          Verwijder Cache Tabel
        </button>
      </div>
    )} else {
      return (
      <div className="flex flex-row mt-4 space-x-2">
        <button
        onClick={() => handleProcessCache('createtable')}
        className={`p-2 rounded-md bg-blue-500 hover:bg-blue-700 text-white w-64`}
      >
          Genereer Cache Tabel
        </button> 
      </div>
      );
    }
  }

  const firstUpdate = cacheStatus?.firstUpdate && cacheStatus.firstUpdate!==null ? moment(cacheStatus.firstUpdate).toDate() : null;
  const lastUpdate = cacheStatus?.lastUpdate && cacheStatus.lastUpdate!==null ? moment(cacheStatus.lastUpdate).toDate() : null;

  return (
    <div className="bg-gray-200 border-2  border-gray-400 p-2 pl-4 rounded mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-4">
            {cacheStatus?.status==='available' ? (
                <table className="table-auto">
                <tbody>
                    <tr>
                    <td className="font-semibold">Aantal records:</td>
                    <td className="pl-2">{cacheStatus.size}</td>
                    </tr>
                    <tr>
                    <td className="font-semibold">Eerste update:</td>
                    <td className="pl-2">{firstUpdate ? firstUpdate.toLocaleDateString() : 'nog geen data'}</td>
                    </tr>
                    <tr>
                    <td className="font-semibold">Laatste update:</td>
                    <td className="pl-2">{lastUpdate ? lastUpdate.toLocaleDateString() : 'nog geen data'}</td> 
                    </tr>
                </tbody>
                </table>
            ) : (
                <div>Cache niet aanwezig</div>
            )}
            </div>
            <div className="mt-4">
            {/* Display error and warning messages */}
            {errorState && <div style={{ color: "red", fontWeight: "bold" }}>{errorState}</div>}
            {warningState && <div style={{ color: "orange", fontWeight: "bold" }}>{warningState}</div>}
            {loading && (
                <div className="spinner" style={{ margin: "auto" }}>
                <div className="loader"></div>
                </div>
            )}
            { !loading && cacheStatus?.status==='available' && renderFilter() }
            { !loading && renderActions() }
        </div>
    </div>
  );
};

export default CacheTableComponent;
