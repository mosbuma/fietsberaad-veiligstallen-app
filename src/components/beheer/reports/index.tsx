import React, { useState, useEffect } from "react";
import ReportsFilterComponent, { ReportParams, ReportBikepark } from "./ReportsFilter";
import { ReportData } from "~/backend/services/reports/ReportFunctions";
import { AvailableDataDetailedResult } from "~/backend/services/reports/availableData";

import LineChart from './LineChart';

interface ReportComponentProps {
  showAbonnementenRapporten: boolean;
  firstDate: Date;
  lastDate: Date;
  bikeparks: ReportBikepark[];
  error?: string;
  warning?: string;
}

const ReportComponent: React.FC<ReportComponentProps> = ({
  showAbonnementenRapporten,
  firstDate,
  lastDate,
  bikeparks,
  error,
  warning,
}) => {
  const [errorState, setErrorState] = useState(error);
  const [warningState, setWarningState] = useState(warning);

  const [reportParams, setReportParams] = useState<ReportParams | undefined>(undefined);
  const [reportData, setReportData] = useState<ReportData | undefined>(undefined);

  const [bikeparksWithData, setBikeparksWithData] = useState<ReportBikepark[]>([]);
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      if (undefined === reportParams) {
        return;
      }

      setLoading(true);
      try {
        let apiEndpoint: string = `/api/reports/${reportParams.reportType}`;
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportParams
          }),
        });
        // reportParams.reportUnit <- I.e. reportUnit_weekDay

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setReportData(data);
        setErrorState("");
      } catch (error) {
        console.error(error);
        setErrorState("Unable to fetch report data");
        setReportData(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportParams, counter]);

  useEffect(() => {
    const fetchBikeparksWithData = async () => {
      if (undefined === reportParams) {
        return;
      }

      // setLoading(true);

      try {
        const apiEndpoint = "/api/database/availableDataPerBikepark";
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportType: reportParams.reportType,
            bikeparkIDs: bikeparks.map(bp => bp.stallingsID),
            startDT: firstDate,
            endDT: lastDate
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json() as AvailableDataDetailedResult[] | false;
        if (data) {
          setBikeparksWithData(bikeparks.filter(bp => data.map(d => d.locationID).includes(bp.stallingsID)));
        } else {
          setErrorState("Unable to fetch list of bikeparks with data");
        }
      } catch (error) {
        console.error(error);
        setErrorState("Unable to fetch list of bikeparks with data");
      } finally {
        // setLoading(false);
      }
    };

    fetchBikeparksWithData();
  }, [reportParams?.reportType, bikeparks, firstDate, lastDate]);


  const renderReportParams = (params: ReportParams) => {
    const formatValue = (value: any) => {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value instanceof Date ? value.toLocaleString() : value;
    };

    return (
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Parameter</th>
            <th className="border border-gray-300 px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(params).map(([key, value]) => (
            <tr key={key}>
              <td className="border border-gray-300 px-4 py-2">{key}</td>
              <td className="border border-gray-300 px-4 py-2">{formatValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const renderChart = (reportData: ReportData) => {
    try {
      return (
        <LineChart
          type="line"
          options={{
            chart: {
              id: `line-chart-${Math.random()}`,//https://github.com/apexcharts/react-apexcharts/issues/349#issuecomment-966461811
              zoom: {
                enabled: true
              },
              toolbar: {
                show: true
              },
              animations: {
                enabled: false
              }
            },
            responsive: [{
              breakpoint: undefined,
              options: {},
            }],
            // colors: ['#77B6EA', '#545454'],
            dataLabels: {
              enabled: false,
            },
            stroke: {
              curve: 'straight',
              width: 3,
              // width: reportData.series.some(s => s.data.length === 1) ? 0 : 2, // Disable line for single data point
            },
            title: {
              text: reportData.title || '',
              align: 'left'
            },
            grid: {
              borderColor: '#e7e7e7',
              row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
              },
            },
            markers: {
              // size: reportData.series.some(s => s.data.length === 1) ? 5 : undefined,
            },
            xaxis: reportData.options?.xaxis || {
              type: 'category',
              categories: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
              title: {
                text: 'Weekdag',
                align: 'left'
              }
            },
            yaxis: reportData.options?.yaxis || {
              title: {
                text: 'Aantal afgeronde transacties'
              },
              // min: 5,
              // max: 40
            },
            legend: {
              position: 'right',
              horizontalAlign: 'center',
              floating: false,
              offsetY: 25,
              // offsetX: -5
            },
            tooltip: {
              enabled: true,
              shared: true,
            }
          }}
          series={reportData.series}
        />
      )
    } catch (error) {
      console.error(error);
      return <div>Error loading chart</div>;
    }
  }

  const renderTable = (reportData: ReportData) => {
    try {
      if (!reportData.options?.xaxis?.categories) {
        throw new Error("No categories found in xaxis");
      }

      return (
        <div className="w-full">
          {/* <h2 className="text-xl font-bold text-center mb-2">{reportData.title}</h2> */}
          <div className="overflow-x-auto flex flex-col justify-center">
            <table className="border-2 border-gray-300 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 bg-white text-left border-2 border-gray-300 px-4 py-2 whitespace-nowrap">

                  </th>
                  {reportData.options.xaxis.categories!.map((category) => (
                    <th key={category} className="text-left border-2 border-gray-300 px-4 py-2 whitespace-nowrap">
                      {category}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.series.map((serie, serieIndex) => (
                  <tr key={serieIndex} className="bg-gray-100 even:bg-gray-100">
                    <td className="sticky left-0 bg-white border-r-2 border-gray-300 px-4 py-2 whitespace-nowrap">
                      {serie.name}
                    </td>
                    {reportData.options.xaxis.categories!.map((label) => (
                      <td key={label} className="border-r-2 border-gray-300 px-4 py-2 whitespace-nowrap text-right">
                        {serie.data.find(d => d.x === label)?.y}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } catch (error) {
      console.error(error);
      return <div>Error loading table</div>;
    }
  }

  const onSubmit = (params: ReportParams) => {
    setReportParams(params);
    setCounter(counter + 1);
  }

  const showReportParams = false; // used for debugging / testing

  return (
    <div className="noPrint w-full" id="ReportComponent">
      <div className="flex flex-col space-y-4 p-4">
        <ReportsFilterComponent
          showAbonnementenRapporten={showAbonnementenRapporten}
          firstDate={firstDate}
          lastDate={lastDate}
          bikeparks={bikeparksWithData}
          onSubmit={onSubmit}
        />

        <div className="flex flex-col space-y-2">
          {errorState && <div style={{ color: "red", fontWeight: "bold" }}>{errorState}</div>}
          {warningState && <div style={{ color: "orange", fontWeight: "bold" }}>{warningState}</div>}
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: "auto" }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 overflow-x-auto">
            {reportData ? (
              <>
                {renderChart(reportData)}
                {renderTable(reportData)}
                {showReportParams && reportParams && renderReportParams(reportParams)}
              </>
            ) : (
              <div>No data available yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportComponent;
