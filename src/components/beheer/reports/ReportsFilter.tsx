import React, { useState, useEffect } from "react";

export type ReportType = "transacties_voltooid" | "inkomsten" | "abonnementen" | "abonnementen_lopend" | "bezetting" | "stallingsduur" | "volmeldingen" | "gelijktijdig_vol" | "downloads"
export type ReportDatatype = "bezettingsdata" | "ruwedata"
export type ReportUnit = "reportUnit_day" | "reportUnit_weekDay" | "reportUnit_week" | "reportUnit_month" | "reportUnit_quarter" | "reportUnit_year" | "reportUnit_onequarter" | "reportUnit_oneyear"

const getWeekNumber = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((diff / oneDay + start.getDay() + 1) / 7);
};

const getQuarter = (date: Date): number => {
  return Math.floor(date.getMonth() / 3) + 1;
};

const getMaanden = (dateFirstTransactions: Date, year: number): Array<string> => {
  // return an array of 12 months if year !== year(dateFirstTransactions)
  // return an array of fewer months if year === year(dateFirstTransactions) where all months before dateFirstTransactions are omitted are left out
  console.log("***************************************");
  console.log("year", year);
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    return date.toLocaleDateString('nl-NL', { month: 'long' });
  }).filter((_, i) => {
    const date = new Date(year, i, 1);
    return year > dateFirstTransactions.getFullYear() || date.getMonth() >= dateFirstTransactions.getMonth();
  });
};

export type ReportBikepark = { id: string; title: string; gemeenteID: string; hasData: boolean };

export interface ReportParams {
    reportType: ReportType;
    reportUnit: ReportUnit;
    bikeparkIDs: string[];
}
interface ReportsFilterComponentProps {
    showAbonnementenRapporten: boolean;
    dateFirstTransactions: Date;
    bikeparks: ReportBikepark[];
    onSubmit: (params: ReportParams) => void;
  }
  
const ReportsFilterComponent: React.FC<ReportsFilterComponentProps> = ({
    showAbonnementenRapporten,
    dateFirstTransactions,
    bikeparks,
    onSubmit,
  }) => {
    const [reportType, setReportType] = useState<ReportType>("transacties_voltooid");
    const [reportUnit, setReportUnit] = useState<ReportUnit>("reportUnit_month");
    const [datatype, setDatatype] = useState<ReportDatatype|undefined>(undefined);
    const [week, setWeek] = useState("");
    const [weekDay, setWeekDay] = useState("");
    const [month, setMonth] = useState("");
    const [quarter, setQuarter] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedBikeparkIDs, setSelectedBikeparkIDs] = useState<string[]>([]);
    const [grouped, setGrouped] = useState("0");
    const [percBusy, setPercBusy] = useState("");
    const [percQuiet, setPercQuiet] = useState("");
    const [errorState, setErrorState] = useState<string|undefined>(undefined);
    const [warningState, setWarningState] = useState<string|undefined>(undefined);

    const today = new Date();
    const limitSelectDate = new Date(today.getDate() - 1); // Reset to current date
    
    useEffect(() => {
      // Determine start and end weeks
      if (year === dateFirstTransactions.getFullYear() && year === limitSelectDate.getFullYear()) {
        setWeek(`${getWeekNumber(dateFirstTransactions)}-${getWeekNumber(limitSelectDate) - 1}`);
      } else if (year === limitSelectDate.getFullYear()) {
        setWeek(`1-${getWeekNumber(limitSelectDate) - 1}`);
      } else if (year === dateFirstTransactions.getFullYear()) {
        setWeek(`${getWeekNumber(dateFirstTransactions)}-52`);
      } else {
        setWeek(`1-52`);
      }

      // Determine start and end quarters
      if (year === dateFirstTransactions.getFullYear() && year === limitSelectDate.getFullYear()) {
        setQuarter(`${getQuarter(dateFirstTransactions)}-${getQuarter(limitSelectDate)}`);
      } else if (year === limitSelectDate.getFullYear()) {
        setQuarter(`1-${getQuarter(limitSelectDate)}`);
      } else if (year === dateFirstTransactions.getFullYear()) {
        setQuarter(`${getQuarter(dateFirstTransactions)}-4`);
      } else {
        setQuarter(`1-4`);
      }
    }, [year, dateFirstTransactions, limitSelectDate]);

    useEffect(() => {
        checkInput();
    }, [reportType, reportUnit, selectedBikeparkIDs, year, month, datatype]);

    useEffect(() => {
      // Filter out any selected bikeparks that are no longer in the bikeparks array
      setSelectedBikeparkIDs((prevSelected) =>
        prevSelected.filter((id) => bikeparks.some((park) => park.id === id))
      );
    }, [bikeparks]);

    const checkInput = () => {
        if (selectedBikeparkIDs.length === 0) {
            setErrorState("Selecteer minimaal 1 locatie");
            return false;
        } else {
            setErrorState(undefined);
        }

        if (reportType === "downloads" && datatype === "bezettingsdata") {
            const endPeriod = new Date(year, parseInt(month), 1);
            if (endPeriod > new Date()) {
            setWarningState("Zeer recente bezettingsdata op basis van in- en uitchecks is onbetrouwbaar omdat deze nog niet gecorrigeerd zijn middels controlescans");
            }
        }
        
        return true;
    }
  
    const handleSubmit = () => {
        console.log("**** handleSubmit"); 
        console.log(" * reportType", reportType);
        console.log(" * reportUnit", reportUnit);
        console.log(" * selectedBikeparkIDs", selectedBikeparkIDs);

        if(!checkInput()) return;

        onSubmit({reportType, reportUnit, bikeparkIDs: selectedBikeparkIDs});
    };

    const renderReportTypeSelect = () => {
      return (
        <div className="form-group row flex flex-row">
          <label htmlFor="report" className="col-xs-3 col-sm-2 col-form-label font-bold mr-5">Rapportage</label>
          <div className="col-sm-10 col-md-6 border-2 border-gray-300 rounded-md">
            <select
              className="form-control"
              name="report"
              id="report"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              required
            >
              <option value="">Selecteer rapportage</option>
              <option value="transacties_voltooid">Aantal afgeronde transacties</option>
              <option value="inkomsten">Inkomsten (€)</option>
              {showAbonnementenRapporten && (
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
      )
    }

    const renderUnitSelect = () => {
      if (undefined === reportType) return null;

      const showPerDagWeekdag = ["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType)
      const showPerWeek = ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting"].includes(reportType)
      const showPerMaand = ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "downloads", "abonnementen", "abonnementen_lopend"].includes(reportType)
      const showPerKwartaal = ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "stallingsduur"].includes(reportType)
      const showPerJaar = ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "downloads", "stallingsduur"].includes(reportType)
      const showGelijktijdigVol = ["gelijktijdig_vol"].includes(reportType)

      const selectShowAll = false; // for debugging
      const selectDag = selectShowAll || ["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType||"") && reportUnit === "reportUnit_day"
      const selectWeekdag = selectShowAll || ["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType||"") && reportUnit === "reportUnit_weekDay"
      const selectKwartaalBeperkt = selectShowAll || ['transacties_voltooid', 'inkomsten', 'volmeldingen', 'gelijktijdig_vol'].includes(reportType||"") && reportUnit === "reportUnit_onequarter"
      const selectWeek = selectShowAll || ["downloads", "bezetting", "stallingsduur"].includes(reportType||"") && reportUnit === "reportUnit_week" && reportType !== "downloads"
      const selectMaand = selectShowAll || ["downloads", "bezetting", "stallingsduur"].includes(reportType||"") && reportUnit === "reportUnit_month" 
      const selectKwartaal = selectShowAll || ["downloads", "bezetting", "stallingsduur"].includes(reportType||"") &&  reportUnit === "reportUnit_quarter"

      return (
          <div className="flex flex-col columns-1">
            { reportType === "downloads" && (
              <div className="row">
                  <div className="title">Soort data</div>
                  <select
                    name="datatype"
                    value={datatype}
                    className="p-2 border-2 border-gray-300 rounded-md"
                    onChange={(e) => setDatatype(e.target.value as ReportDatatype)}
                  >
                    <option value="bezettingsdata">Bezettingsdata</option>
                    { false && <option value="ruwedata">Ruwe data</option> }
                  </select>
              </div>
            )}

            <div className="font-bold">Tijdsperiode</div>
            <select
              value={reportUnit}
              onChange={(e) => setReportUnit(e.target.value as ReportUnit)}
              name="reportUnit"
              id="reportUnit"
              className="p-2 border-2 border-gray-300 rounded-md"
              required
            >
              {showPerDagWeekdag && (
                <>
                  <option value="reportUnit_day">Per dag</option>
                  <option value="reportUnit_weekDay">Per weekdag</option>
                </>
              )}
              {showPerWeek && (
                <option value="reportUnit_week">Per week</option>
              )}
              {showPerMaand && (
                <option value="reportUnit_month">Per maand</option>
              )}
              {showPerKwartaal && (
                <option value="reportUnit_quarter">Per kwartaal</option>
              )}
              {showPerJaar && (
                <option value="reportUnit_year">Per jaar</option>
              )}
              {showGelijktijdigVol && (
                <>
                  <option value="reportUnit_onequarter">Kwartaal</option>
                  <option value="reportUnit_oneyear">Jaar</option>
                </>
              )}
            </select>

              {selectWeek && (
                <select 
                  value={week} 
                  onChange={(e) => setWeek(e.target.value)} 
                  className="p-2 border-2 border-gray-300 rounded-md"
                  required>
                  {[...Array(53).keys()].map((w) => (
                    <option key={w} value={w}>
                      Week {w}
                    </option>
                  ))}
                </select>
              )}
              {selectMaand && (
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border-2 border-gray-300 rounded-md" required>
                  {getMaanden(dateFirstTransactions, year).map((maand, index) => (
                    <option key={index} value={index + 1}>
                      {maand}
                    </option>
                  ))}
                </select>
              )}
              {selectKwartaal && (
                <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="p-2 border-2 border-gray-300 rounded-md" required>
                  {[1, 2, 3, 4].map((q) => (
                    <option key={q} value={q}>
                      Kwartaal {q}
                    </option>
                  ))}
                </select>
              )}
              { selectDag && (
                <select
                  value={week}
                onChange={(e) => setWeek(e.target.value)}
                name="week"
                id="week"
                className="p-2 border-2 border-gray-300 rounded-md"
                required
              >
                {year === limitSelectDate.getFullYear() && (
                  <option value="lastPeriod">Afgelopen week</option>
                )}
                {[...Array(53).keys()].map((_week) => {
                  const weekNumber = _week + 1;
                  const isValidWeek =
                    !(year === dateFirstTransactions.getFullYear() && weekNumber < getWeekNumber(dateFirstTransactions)) &&
                    !(year === limitSelectDate.getFullYear() && weekNumber > getWeekNumber(limitSelectDate));
                  return (
                    isValidWeek && (
                      <option key={weekNumber} value={weekNumber}>
                        Week {weekNumber}
                      </option>
                    )
                  );
                })}
              </select> )}
          {selectWeekdag && (
            <select
              value={weekDay}
              onChange={(e) => setWeekDay(e.target.value)}
              name="weekDay"
              id="weekDay"
              className="p-2 border-2 border-gray-300 rounded-md"
              required
            >
              <option value="1">Maandag</option>
              <option value="2">Dinsdag</option>
              <option value="3">Woensdag</option>
              <option value="4">Donderdag</option>
              <option value="5">Vrijdag</option>
              <option value="6">Zaterdag</option>
              <option value="7">Zondag</option>
            </select>
          )}
          {selectKwartaalBeperkt && (
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                name="quarter"
                id="quarter"
                className="p-2 border-2 border-gray-300 rounded-md"
                required
              >
                {year === limitSelectDate.getFullYear() && (
                  <option value="lastPeriod">Afgelopen 12 weken</option>
                )}
                {[1, 2, 3, 4].map((kwartaal) => {
                  const isValidQuarter =
                    !(year === dateFirstTransactions.getFullYear() && kwartaal < getQuarter(dateFirstTransactions)) &&
                    !(year === limitSelectDate.getFullYear() && kwartaal > getQuarter(limitSelectDate));
                  return (
                    isValidQuarter && (
                      <option key={kwartaal} value={kwartaal}>
                        Kwartaal {kwartaal}
                      </option>
                    )
                  );
                })}
              </select>
          )}
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            name="year"
            id="year"
            className="p-2 border-2 border-gray-300 rounded-md"
            required
          >
            {reportUnit === 'reportUnit_month' && year === limitSelectDate.getFullYear() && (
              <option value="lastPeriod">Afgelopen 12 maanden</option>
            )}
            {reportUnit === 'reportUnit_quarter' && year === limitSelectDate.getFullYear() && (
              <option value="lastPeriod">Afgelopen 4 kwartalen</option>
            )}
            {Array.from({ length: limitSelectDate.getFullYear() - dateFirstTransactions.getFullYear() + 1 }, (_, i) => {
              const jaar = dateFirstTransactions.getFullYear() + i;
              return <option key={jaar} value={jaar}>{jaar}</option>;
            })}
          </select>
        </div>
      );
    };

    const renderBikeparkSelect = (): React.ReactNode => {
      const isScrollable = bikeparks.length > 10;

      const toggleSelectAll = () => {
        const newSelection = bikeparks.map(park => park.id).filter(id => !selectedBikeparkIDs.includes(id));
        setSelectedBikeparkIDs(newSelection.length ? newSelection : []);
      };

      return (
        <>
          <div id='all-bikeparks' className="title" style={{ userSelect: 'none' }}>
            Stallingen
            <span
              onClick={toggleSelectAll}
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', userSelect: 'none' }}
              title="Toggle Select All"
            >
              ✔️
            </span>
          </div>
          <div
            style={{
              maxHeight: isScrollable ? '200px' : 'auto', // Adjust height as needed
              overflowY: isScrollable ? 'scroll' : 'visible',
              overflowX: 'hidden', // Prevent horizontal scrolling
            }}
          >
            {bikeparks.map((park) => (
              <div key={park.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBikeparkIDs.includes(park.id)}
                    value={park.id}
                    onChange={() =>
                      setSelectedBikeparkIDs((prev) =>
                        prev.includes(park.id)
                          ? prev.filter((id) => id !== park.id)
                          : [...prev, park.id]
                      )
                    }
                  />
                  {park.title}
                </label>
              </div>
            ))}
          </div>
        </>
      );
    };

    const renderAbonnementenSelect = (): React.ReactNode => {
        return (
          <div>
            <select
              value={grouped}
              onChange={(e) => setGrouped(e.target.value)}
              className="p-2 border-2 border-gray-300 rounded-md"
              id="grouped"
            >
              <option value="0">Alle abonnementen</option>
              <option value="1">Per abonnement</option>
            </select>
          </div>)
    }

    const renderVolmeldingenSelect = (): React.ReactNode => {
       return (
        <>
        <div className="inputgroup col-sm-5 col-md-2" id="inputgroup_absrel">
          <div className="title">Y-as</div>
          <input type="radio" name="absrel" value="absolute" checked={grouped === "absolute"} onChange={() => setGrouped("absolute")} /> Absoluut<br />
          <input type="radio" name="absrel" value="relative" checked={grouped === "relative"} onChange={() => setGrouped("relative")} /> Procentueel<br />
        </div>
        <div className="inputgroup col-sm-6 col-md-3" id="inputgroup_drukte" style={{ width: "250px" }}>
        <div id="druk">
          Druk als meer dan <input value={percBusy} onChange={(e) => setPercBusy(e.target.value)} type="text" className="integer numeric form-control inline w-11" maxLength={2} name="percBusy" />% vol
        </div>
        <div id="rustig">
          Rustig als minder dan <input value={percQuiet} onChange={(e) => setPercQuiet(e.target.value)} type="text" className="integer numeric form-control inline w-11" maxLength={2} name="percQuiet"/>% vol
        </div>
      </div>
      </>
    )
  }

    return (
      <div className="noPrint" id="ReportComponent">
        <div className="flex flex-col space-y-4">
          {/* new row, full width */}
          <div className="w-full mt-2">
            {renderReportTypeSelect()}
          </div>

          {/* new row, full width, max 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* column 1 */}
            <div>
              {renderUnitSelect()}
            </div>

            {/* column 2 */}
            {bikeparks.length > 1 && (
              <div>
                {renderBikeparkSelect()}
              </div>
            )}

            {/* column 3 */}
            {reportType === "abonnementen" && (
              <div>
                {renderAbonnementenSelect()}
              </div>
            )}

            {reportType === "volmeldingen" && (
              <div>
                {renderVolmeldingenSelect()}
              </div>
            )}
          <div 
            className={`${errorState===undefined ? 'bg-blue-500': 'bg-gray-300'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded max-w-20 max-h-10 inline-block text-center cursor-pointer ${errorState===undefined ? "": "cursor-not-allowed"}`}
            role="button" 
            onClick={errorState===undefined ? handleSubmit : undefined}
          >
            Go!
          </div>
          </div>


          {/* new row, full width */}
          <div className="flex flex-col space-y-2">
            {errorState && <div style={{ color: "red", fontWeight: "bold" }}>{errorState}</div>}
            {warningState && <div style={{ color: "orange", fontWeight: "bold" }}>{warningState}</div>}
          </div>

          <div className="flex flex-col space-y-2">
            <table className="border-2 border-gray-300 rounded-md">
              <thead>
                <tr>
                  <th className="text-left">Variabele</th>
                  <th className="text-left">Waarde</th>
                </tr>
              </thead>
              <tbody>   
                <tr>
                  <td>Rapportage</td>
                  <td>{reportType}</td>
                </tr>
                <tr>
                  <td>Tijdsperiode</td>
                  <td>{reportUnit}</td>
                </tr>
                <tr>
                  <td>Stallingen</td>
                  <td>{selectedBikeparkIDs.join(", ")}</td>
                </tr>
              </tbody>
            </table>  
          </div>
        </div>
      </div>
    );
  };
  
  export default ReportsFilterComponent;