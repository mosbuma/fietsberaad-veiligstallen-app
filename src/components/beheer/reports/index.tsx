import React, { useState } from "react";
import LineChart from './LineChart';

interface ReportComponentProps {
  exploitantID?: string;
  siteID: number;
  council: {
    hasModule: (moduleName: string) => boolean;
    hasSubscriptionType: () => boolean;
  };
  report: string;
  subscriptionTypes: Array<{ id: string; name: string }>;
  dateFirstTransactions: Date;
  limitSelectDate: Date;
  jaar: number;
  maanden: Array<string>
  bikeparks: Array<{ StallingsID: string; Title: string; hasData: boolean }>;
  error?: string;
  warning?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const ReportComponent: React.FC<ReportComponentProps> = ({
  exploitantID,
  siteID,
  council,
  report,
  subscriptionTypes,
  dateFirstTransactions,
  limitSelectDate,
  jaar,
  maanden,
  bikeparks,
  error,
  warning,
  onSubmit,
}) => {
  const [reportType, setReportType] = useState(report);
  const [reportUnit, setReportUnit] = useState("");
  const [datatype, setDatatype] = useState("");
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState("");
  const [quarter, setQuarter] = useState("");
  const [year, setYear] = useState(jaar);
  const [selectedBikeparks, setSelectedBikeparks] = useState<string[]>([]);
  const [grouped, setGrouped] = useState("0");
  const [percBusy, setPercBusy] = useState("");
  const [percQuiet, setPercQuiet] = useState("");

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <form className="noPrint" id="ReportComponent" onSubmit={handleFormSubmit}>
      <input type="hidden" name="module" value="someModule" />
      <input type="hidden" name="processMethod" value="generateReport" />
      {exploitantID && (
        <input type="hidden" name="exploitantID" id="exploitantID" value={exploitantID} />
      )}
      {siteID === 0 && (
        <input type="hidden" name="gemeenteID" id="gemeenteID" value="someGemeenteID" />
      )}

      <div className="form-group row">
        <label htmlFor="report" className="col-xs-3 col-sm-2 col-form-label">Rapportage</label>
        <div className="col-sm-10 col-md-6 border-2 border-gray-300 rounded-md">
          <select
            className="form-control"
            name="report"
            id="report"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            required
          >
            <option value="transacties_voltooid">Aantal afgeronde transacties</option>
            <option value="inkomsten">Inkomsten (€)</option>
            {council.hasModule("abonnementen") && council.hasSubscriptionType() && (
              <>
                <option value="abonnementen">Abonnementswijzigingen</option>
                <option value="abonnementen_lopend">Lopende abonnementen</option>
              </>
            )}
            <option value="bezetting">Procentuele bezetting</option>
            <option value="stallingsduur">Stallingsduur</option>
            <option value="volmeldingen">Drukke en rustige momenten</option>
            <option value="gelijktijdig_vol">Gelijktijdig vol</option>
            <option value="downloads">Download data</option>
          </select>
        </div>
      </div>

      {error && <div style={{ color: "red", fontWeight: "bold" }}>{error}</div>}
      {warning && <div style={{ color: "orange", fontWeight: "bold" }}>{warning}</div>}

      {reportType === "downloads" && (
        <div className="row">
          <div className="inputgroup col-sm-6 col-md-3">
            <div className="title">Soort data</div>
            <select
              name="datatype"
              className="form-control"
              value={datatype}
              onChange={(e) => setDatatype(e.target.value)}
            >
              <option value="bezettingsdata">Bezettingsdata</option>
            </select>
          </div>
        </div>
      )}

      <div className="row">
        <div className="inputgroup col-sm-6 col-md-3">
          <div className="title">Tijdsperiode</div>
          <select
            value={reportUnit}
            onChange={(e) => setReportUnit(e.target.value)}
            className="form-control"
            name="reportUnit"
            id="reportUnit"
            required
          >
            {["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType) && (
              <>
                <option value="reportUnit_day">Per dag</option>
                <option value="reportUnit_weekDay">Per weekdag</option>
              </>
            )}
            {["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting"].includes(reportType) && (
              <option value="reportUnit_week">Per week</option>
            )}
            {["downloads", "transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "abonnementen", "abonnementen_lopend"].includes(reportType) && (
              <option value="reportUnit_month">Per maand</option>
            )}
            {["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "stallingsduur"].includes(reportType) && (
              <option value="reportUnit_quarter">Per kwartaal</option>
            )}
            <option value="reportUnit_year">Per jaar</option>
          </select>
        </div>

        {["downloads", "bezetting", "stallingsduur"].includes(reportType) && (
          <div>
            {/* Quarter and Month selections */}
            {reportUnit === "reportUnit_week" && reportType !== "downloads" && (
              <select value={week} onChange={(e) => setWeek(e.target.value)} className="form-control" required>
                {[...Array(53).keys()].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            )}
            {reportUnit === "reportUnit_month" && (
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="form-control" required>
                {maanden.map((maand, index) => (
                  <option key={index} value={index + 1}>
                    {maand}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {bikeparks.length > 1 && (
        <div className="inputgroup col-sm-6 col-md-3">
          <div className="title">Stallingen</div>
          {bikeparks.map((park) => (
            <div key={park.StallingsID}>
              <input
                type="checkbox"
                value={park.StallingsID}
                onChange={() =>
                  setSelectedBikeparks((prev) =>
                    prev.includes(park.StallingsID)
                      ? prev.filter((id) => id !== park.StallingsID)
                      : [...prev, park.StallingsID]
                  )
                }
              />
              {park.Title}
            </div>
          ))}
        </div>
      )}

      {/* Other conditions */}
      {reportType === "abonnementen" && (
        <div>
          <select
            value={grouped}
            onChange={(e) => setGrouped(e.target.value)}
            className="form-control"
            id="grouped"
          >
            <option value="0">Alle abonnementen</option>
            <option value="1">Per abonnement</option>
          </select>
        </div>
      )}

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
            text: 'Aantal afgeronde transacties per dag',
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
          xaxis: {
            categories: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
            title: {
              text: 'Weekdag',
              align: 'left'
            }
          },
          yaxis: {
            title: {
              text: 'Aantal afgeronde transacties'
            },
            // min: 5,
            // max: 40
          },
          legend: {
            position: 'right',
            horizontalAlign: 'center',
            // floating: true,
            offsetY: 25,
            // offsetX: -5
          }
        }}
        series={[
          {
            name: "Concordiastraat",
            data: [40, 17, 348, 1, 5, 129, 12]
          },
          {
            name: "Turfschip",
            data: [43, 20, 327, 1, 1, 134, 11]
          },
          {
            name: "Oude Vest",
            data: [63, 23, 504, 6, 7, 130, 13]
          },
          {
            name: "Nieuwstraat",
            data: [100, 44, 768, 7, 13, 232, 36]
          },
          {
            name: "Haven",
            data: [99, 42, 876, 9, 15, 207, 50]
          },
        ]}
      />

      <div className="col-xs-1">
        <button type="submit" className="buttonBorder">Go!</button>
      </div>
    </form>
  );
};

export default ReportComponent;
