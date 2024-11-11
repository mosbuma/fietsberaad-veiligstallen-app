import React, { useState, useEffect } from "react";
import ReportsFilterComponent, { ReportParams } from "./ReportsFilter";
import { ReportData } from "~/backend/services/reports-service";
import { ReportBikepark } from "./ReportsFilter";
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

  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/transactionsPerPeriod`);
        // reportParams.reportUnit <- I.e. reportUnit_weekDay

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error(error);
        setErrorState("Unable to fetch report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportParams, counter]);

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
              curve: 'straight'
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
              // size: 1
            },
            xaxis: reportData.options.xaxis,
            yaxis: reportData.options.yaxis,
            legend: {
              position: 'right',
              horizontalAlign: 'center',
              // floating: true,
              offsetY: 25,
              // offsetX: -5
            }
          }}
          series={reportData.series }
        />
      )
    } catch (error) {
      console.error(error);
      return <div>Error loading chart</div>;
    }
  }

  const renderTable = (reportData: ReportData) => {
    try {
      return (
        <>
          <h2 className="text-xl font-bold">{reportData.title}</h2>
          <table className="border-2 border-gray-300 rounded-md">
            <thead>
              <tr>
                <th className="text-left">Series Name</th>
                {reportData.options.xaxis.categories.map((category) => (
                  <th key={category} className="text-left">{category}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.series.map((seriesItem, index) => (
                <tr key={index}>
                  <td>{seriesItem.name}</td>
                  {seriesItem.data.map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
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

  return (
    <div className="noPrint" id="ReportComponent">
      <div className="flex flex-col space-y-4">
        {/* new row, full width */}
        <ReportsFilterComponent
          showAbonnementenRapporten={showAbonnementenRapporten}
          firstDate={firstDate}
          lastDate={lastDate}
          bikeparks={bikeparks}
          onSubmit={onSubmit}
        />

        {/* new row, full width */}
        <div className="flex flex-col space-y-2">
          {errorState && <div style={{ color: "red", fontWeight: "bold" }}>{errorState}</div>}
          {warningState && <div style={{ color: "orange", fontWeight: "bold" }}>{warningState}</div>}
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: "auto" }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {reportData ? (
              <>
                {renderChart(reportData)}
                {renderTable(reportData)} 
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
