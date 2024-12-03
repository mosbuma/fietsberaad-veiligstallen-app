import React, { useState, useEffect } from "react";
import ReportsFilterComponent, { ReportParams, ReportBikepark } from "../reports/ReportsFilter";
import { availableDataResult } from "~/backend/services/reports/availableData";

type MonthData = {
  year: number;
  month: number;
}

type BikeparkData = {
  bikeparkID: string;
  bikeparkTitle: string;
  monthsWithData: MonthData[];
}

interface ReportComponentProps {
  firstDate: Date;
  lastDate: Date;
  bikeparks: ReportBikepark[];
}

const ExportComponent: React.FC<ReportComponentProps> = ({
  firstDate,
  lastDate,
  bikeparks,
}) => {
  const [errorState, setErrorState] = useState("");

  const [reportParams, setReportParams] = useState<ReportParams | undefined>(undefined);
  const [bikeparkData, setBikeparkData] = useState<BikeparkData[]>([]);

  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
      const fetchReportData = async () => {
          if (undefined === reportParams) {
            return;
          }

          const convertToBikeparkData = (data: availableDataResult[]): BikeparkData[] => {
              // change this to map/reduce
              const bikeparkData: BikeparkData[] = [];
              data.forEach(d => {
                  const [yearstr, monthstr]  = d.yearmonth.split("-");
                  if(!yearstr || !monthstr) {
                      console.error("ExportComponent: no year or month: ", d);
                      return;
                  }

                  const year = parseInt(yearstr);
                  const month = parseInt(monthstr);

                  let bikepark = bikeparkData.find(bp => bp.bikeparkID === d.locationID);
                  if(!bikepark) {
                      const info = bikeparks.find(bp => bp.stallingsID === d.locationID);
                      bikepark = {
                          bikeparkID: d.locationID, 
                          bikeparkTitle: info?.title || "unknown",
                          monthsWithData: []
                      }
                      bikeparkData.push(bikepark);
                  }
                  
                  if(bikepark && year && month) {
                      if(!bikepark.monthsWithData.find(md => md.year === year && md.month === month)) { 
                          bikepark.monthsWithData.push({year, month});
                      }
                  }
              });

              return bikeparkData;
          }
    
          setLoading(true);

          try {
            const apiEndpoint = "/api/reports/availableData";
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reportParams
              }),
            });
    
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json() as availableDataResult[] | false;
            if(data) {
              setBikeparkData(convertToBikeparkData(data));
              setErrorState("");
          } else {
              setErrorState("Unable to fetch report data");
            }
          } catch (error) {
            console.error(error);
            setErrorState("Unable to fetch report data");
          } finally {
            setLoading(false);
          }
        };
    
        fetchReportData();
  }, [reportParams, bikeparks, counter]);

  const ExcelIcon = () => (
      <svg 
          className="w-4 h-4 mr-2" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
      >
          <path 
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
          />
          <path 
              d="M14 2V8H20" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
          />
          <path 
              d="M8 13L11 17L16 11" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
          />
      </svg>
  );

  const getMonthName = (month: number): string => {
      return new Date(2000, month - 1, 1).toLocaleString('nl-NL', { month: 'short' });
  };

  const renderMonthButtons = (year: number, availableMonths: number[]) => {
      return (
          <div className="month-buttons flex gap-1 ml-2">
              {availableMonths.map(month => (
                  <button
                      key={`${year}-${month}`}
                      className="month-button px-2 py-1 bg-gray-100 border border-gray-300 rounded 
                               hover:bg-gray-200 transition-colors duration-150 text-xs font-medium text-gray-700 flex items-center"
                      onClick={() => {/* TODO: Handle monthly download */}}
                  >
                      <ExcelIcon />
                      {getMonthName(month)}
                  </button>
              ))}
          </div>
      );
  };

  const renderYearButtons = (years: number[]) => {
      return (
          <div className="year-buttons flex gap-1 flex-wrap">
              {years.map(year => (
                  <button 
                      key={year} 
                      className="year-button px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 
                               transition-colors duration-150 text-xs font-medium text-gray-700 flex items-center"
                      onClick={() => {/* TODO: Handle download */}}
                  >
                      <ExcelIcon />
                      {year}
                  </button>
              ))}
          </div>
      );
  };

  // Get all unique years across all bikeparks
  const getYearsWithData = (): number[] => Array.from(
      new Set(
          bikeparkData.flatMap(bp => bp.monthsWithData.map(md => md.year))
      )
  ).sort((a, b) => a - b); // Sort ascending

  const getYearsWithDataForBikepark = (bp: BikeparkData): number[] => {
      const yearsSet = new Set<number>();
      bp.monthsWithData.forEach(md => yearsSet.add(md.year));
      return Array.from(yearsSet).sort((a, b) => a - b);
  }
  const onSubmit = (params: ReportParams) => {
    setReportParams(params);
    setCounter(counter + 1);
  }

  const allYears = getYearsWithData();

return (
    <div className="noPrint w-full" id="ExportComponent">
      <div className="flex flex-col space-y-4 p-4">
        <ReportsFilterComponent
          showAbonnementenRapporten={false}
          firstDate={firstDate}
          lastDate={lastDate}
          bikeparks={bikeparks}
          onSubmit={onSubmit}
          showDetails={false}
          showGoButton={false}
        />

        <div className="flex flex-col space-y-2">
          {errorState && <div style={{ color: "red", fontWeight: "bold" }}>{errorState}</div>}
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: "auto" }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 overflow-x-auto">
        <div className="reports-standard-downloads p-1 max-w-7xl">
            <section className="completed-transactions mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Aantal Afgeronde Transacties
                </h2>
                <div className="section-content bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                    <ul className="bikepark-list">
                        {/* All parkings combined entry */}
                        {allYears.length > 0 && (
                            <li className="bikepark-item">
                                <div className="bikepark-name text-base font-medium text-gray-800 mb-1">
                                    Alle stallingen
                                </div>
                                {renderYearButtons(allYears)}
                            </li>
                        )}
                        
                        {/* Individual parking entries */}
                        {bikeparkData
                            .filter(bp => bp.monthsWithData.length > 0)
                            .map(bp => {
                                const bikepark = bikeparks.find(park => park.id === bp.bikeparkID);
                                return (
                                    <li key={bp.bikeparkID} className="bikepark-item border-t border-gray-200 pt-3">
                                        <div className="bikepark-name text-base font-medium text-gray-800 mb-1">
                                        {bp.bikeparkTitle}
                                        </div>
                                        {renderYearButtons(getYearsWithDataForBikepark(bp))}
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </section>

            <section className="raw-transactions">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Alle Transacties (ruwe data)
                </h2>
                <div className="section-content bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                    <ul className="bikepark-list space-y-3">
                        {bikeparkData
                            .filter(bp => bp.monthsWithData.length > 0)
                            .map(bp => {
                                const yearGroups = bp.monthsWithData.reduce((acc, { year, month }) => {
                                    if (!acc[year]) acc[year] = [];
                                    if(!acc[year].find(m => m === month)) {
                                        acc[year].push(month);
                                    }
                                    return acc;
                                }, {} as Record<number, number[]>);

                                return (
                                    <li key={bp.bikeparkID} className="bikepark-item">
                                        <div className="bikepark-name text-base font-medium text-gray-800 mb-2">
                                            {bp.bikeparkTitle}
                                        </div>
                                        <ul className="year-list space-y-2">
                                            {Object.entries(yearGroups)
                                                .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
                                                .map(([year, months]) => (
                                                    <li key={year} className="year-item flex items-center">
                                                        <div
                                                            className="year-button px-2 py-1 bg-white 
                                                                      hover:bg-gray-50 transition-colors duration-150 
                                                                     text-sm text-gray-700 font-bold flex items-center"
                                                            onClick={() => {/* TODO: Handle year download */}}
                                                        >
                                                            {year}
                                                        </div>
                                                        {renderMonthButtons(Number(year), months.sort((a, b) => a - b))}
                                                    </li>
                                                ))}
                                        </ul>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </section>
        </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportComponent;
