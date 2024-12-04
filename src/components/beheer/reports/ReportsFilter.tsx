import React, { useState, useEffect } from "react";
import BikeparkSelect from './BikeparkSelect';
import { getSingleYearRange, getSingleMonthRange, getSingleWeekRange, getSingleQuarterRange, getMaanden, getWeekNumber, getQuarter } from "./ReportsDateFunctions";

export type ReportType = "transacties_voltooid" | "inkomsten" | "abonnementen" | "abonnementen_lopend" | "bezetting" | "stallingsduur" | "volmeldingen" | "gelijktijdig_vol" | "downloads"
export type ReportDatatype = "bezettingsdata" | "ruwedata"
export type ReportCategories = "none" | "per_stalling" | "per_weekday" | "per_section" | "per_type_klant"

export type ReportGrouping = "per_hour" | "per_day" | "per_weekday" | "per_week" | "per_month" | "per_quarter" | "per_year" | "per_bucket"
export type ReportRangeUnit = "range_all" | "range_year" | "range_month" | "range_quarter" | "range_week"
// export type ReportUnit = "reportUnit_day" | "reportUnit_weekDay" | "reportUnit_week" | "range_month" | "reportUnit_quarter" | "reportUnit_year" // | "reportUnit_onequarter" | "reportUnit_oneyear"

export type ReportBikepark = { id: string; stallingsID: string; title: string; gemeenteID: string; hasData: boolean };

export interface ReportParams {
  reportType: ReportType;
  reportGrouping: ReportGrouping;
  reportCategories: ReportCategories;
  reportRangeUnit: ReportRangeUnit;
  reportRangeValue: number | "lastPeriod";
  //    reportUnit: ReportUnit;
  bikeparkIDs: string[];
  startDT: Date | undefined;
  endDT: Date | undefined;
  fillups: boolean;
  source?: string;
}
interface ReportsFilterComponentProps {
  showAbonnementenRapporten: boolean;
  firstDate: Date;
  lastDate: Date;
  bikeparks: ReportBikepark[];
  onSubmit: (params: ReportParams) => void;
  showDetails?: boolean;
  showGoButton?: boolean;
}

const getAvailableReports = (showAbonnementenRapporten: boolean) => {
  const availableReports = [];
  availableReports.push({ id: "transacties_voltooid", title: "Aantal afgeronde transacties" });
  // availableReports.push({ id: "inkomsten", title: "Inkomsten (€)" });
  // if(showAbonnementenRapporten) {
  //     availableReports.push({ id: "abonnementen", title: "Abonnementswijzigingen" });
  //     availableReports.push({ id: "abonnementen_lopend", title: "Lopende abonnementen" });
  // }
  availableReports.push({ id: "bezetting", title: "Procentuele bezetting" });
  availableReports.push({ id: "stallingsduur", title: "Stallingsduur" });
  // availableReports.push({ id: "volmeldingen", title: "Drukke en rustige momenten" });
  // availableReports.push({ id: "gelijktijdig_vol", title: "Gelijktijdig vol" });
  // availableReports.push({ id: "downloads", title: "Download data" });

  return availableReports;
}


const ReportsFilterComponent: React.FC<ReportsFilterComponentProps> = ({
  showAbonnementenRapporten,
  firstDate,
  lastDate,
  bikeparks,
  onSubmit,
  showDetails = true,
  showGoButton = false,
}) => {
  const [reportType, setReportType] = useState<ReportType>("transacties_voltooid");
  const [reportGrouping, setReportGrouping] = useState<ReportGrouping>("per_year");
  const [reportCategories, setReportCategories] = useState<ReportCategories>("per_stalling");
  const [reportRangeUnit, setReportRangeUnit] = useState<ReportRangeUnit>("range_year");
  //const [reportUnit, setReportUnit] = useState<ReportUnit>("reportUnit_year");
  const [selectedBikeparkIDs, setSelectedBikeparkIDs] = useState<string[]>([]);
  const [datatype, setDatatype] = useState<ReportDatatype | undefined>(undefined);
  const [week, setWeek] = useState<number | "lastPeriod">("lastPeriod");
  const [month, setMonth] = useState<number | "lastPeriod">("lastPeriod");
  const [quarter, setQuarter] = useState<number | "lastPeriod">("lastPeriod");
  const [year, setYear] = useState<number | "lastPeriod">("lastPeriod"); // new Date().getFullYear()
  const [fillups, setFillups] = useState(false);
  const [grouped, setGrouped] = useState("0");
  const [percBusy, setPercBusy] = useState("");
  const [percQuiet, setPercQuiet] = useState("");
  const [errorState, setErrorState] = useState<string | undefined>(undefined);
  const [warningState, setWarningState] = useState<string | undefined>(undefined);

  const availableReports = getAvailableReports(showAbonnementenRapporten);

 //  const [timerange, setTimerange] = useState<{ startDT: Date, endDT: Date } | undefined>(undefined);

  useEffect(() => {
    if (!showGoButton) {
      handleSubmit();
    }
  }, [
    reportType,
    reportGrouping,
    reportCategories,
    reportRangeUnit,
    selectedBikeparkIDs,
    year,
    quarter,
    month,
    week,
    fillups,
    grouped
  ]);

  useEffect(() => {
    if (["bezetting"].includes(reportType)) {
      setReportGrouping("per_week");
    } else if (["stallingsduur", "gelijktijdig_vol"].includes(reportType)) {
      setReportGrouping("per_quarter");
    } else {
      setReportGrouping("per_month");
    }
  }, [reportType]);

  // useEffect(() => {
  //   setTimerange(getStartEndDT());
  // }, [reportRangeUnit, year, month, week, quarter]);

  useEffect(() => {
    checkInput();
  }, [reportRangeUnit, reportType, selectedBikeparkIDs, year, month, datatype]); 

  useEffect(() => {
    // Filter out any selected bikeparks that are no longer in the bikeparks array
    // setSelectedBikeparkIDs((prevSelected) =>
    //   prevSelected.filter((id) => bikeparks.some((park) => park.stallingsID === id))
    // );
    setSelectedBikeparkIDs(bikeparks.map((bikepark) => bikepark.stallingsID));
  }, [bikeparks]);  

  const checkInput = () => {

    if (reportType === "downloads" && datatype === "bezettingsdata") {
      const endPeriod = new Date(year === "lastPeriod" ? new Date().getFullYear() : year, month === "lastPeriod" ? new Date().getMonth() : month, 1);
      if (endPeriod > new Date()) {
        setWarningState("Zeer recente bezettingsdata op basis van in- en uitchecks is onbetrouwbaar omdat deze nog niet gecorrigeerd zijn middels controlescans");
      }
    }

    return true;
  }

  const getStartEndDT = () => {
    switch (reportRangeUnit) {
      case "range_all": {
        const startDT = firstDate;
        startDT.setHours(0, 0, 0, 0);
        const endDT = lastDate;
        endDT.setHours(23, 59, 59, 999);

        return { startDT, endDT };
      }
      case "range_year": {
        return getSingleYearRange(year);
      }
      // case "reportUnit_oneyear": 
      case "range_month": {
        return getSingleMonthRange(year, month);
      }
      case "range_week": {
        return getSingleWeekRange(year, week);
      }
      case "range_quarter": {
        return getSingleQuarterRange(year, quarter);
      }
      case "range_week": {
        return getSingleWeekRange(year, week);
      }
      default: {
        console.warn("Unhandled reportUnit", reportRangeUnit);
        return { startDT: new Date(), endDT: new Date() };
      };
    }
  }

  const handleSubmit = () => {
    if (!checkInput()) return;

    let reportRangeValue: number | "lastPeriod";
    switch (reportRangeUnit) {
      case "range_week":
        reportRangeValue = week;
        break;
      case "range_month":
        reportRangeValue = month;
        break;
      case "range_quarter":
        reportRangeValue = quarter;
        break;
      case "range_year":
        reportRangeValue = year;
        break;
      default:
        reportRangeValue = "lastPeriod";
    }

    const bikeparkIDs = reportCategories !== "per_stalling" ? selectedBikeparkIDs : bikeparks.map((bikepark) => bikepark.stallingsID)
    
    const { startDT, endDT } = getStartEndDT();

    // console.log("SUBMIT", { reportType, reportCategories, reportGrouping, reportRangeUnit, reportRangeValue, bikeparkIDs, startDT: startDT, endDT, fillups: fillups });

    onSubmit({ reportType, reportCategories, reportGrouping, reportRangeUnit, reportRangeValue, bikeparkIDs, startDT, endDT, fillups: fillups });
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
          > {availableReports.map((report) => (
            <option key={report.id} value={report.id}>{report.title}</option>
          ))}
          </select>
        </div>
      </div>
    )
  }

  const renderWeekSelect = (showLastPeriod: boolean = true) => {
    console.log("render week", week);
    return (
      <>
        <select
          value={week}
          onChange={(e) => {
            const value = e.target.value === "lastPeriod" ? "lastPeriod" : parseInt(e.target.value);
            console.log("setWeek", value);
            setWeek(value)
          }
          }
          name="week"
          id="week"
          className="p-2 border-2 border-gray-300 rounded-md"
          required>
          {showLastPeriod && <option value="lastPeriod">Afgelopen week</option>}
          {[...Array(53).keys()].map((_week) => {
            const weekNumber = _week + 1;
            const isValidWeek =
              !(year === firstDate.getFullYear() && weekNumber < getWeekNumber(firstDate)) &&
              !(year === lastDate.getFullYear() && weekNumber > getWeekNumber(lastDate));
            return (
              isValidWeek && (
                <option key={weekNumber} value={weekNumber}>
                  Week {weekNumber}
                </option>
              )
            );
          })}
        </select>
        {week !== "lastPeriod" && renderYearSelect(false)}
      </>
    )
  }

  const renderMonthSelect = (showLastPeriod: boolean = true) => {
    return (
      <>
        <select value={month} onChange={(e) => setMonth(e.target.value === "lastPeriod" ? "lastPeriod" : parseInt(e.target.value))} className="p-2 border-2 border-gray-300 rounded-md" required>
          {showLastPeriod && <option value="lastPeriod">Afgelopen maand</option>}
          {getMaanden().map((maand, index) => (
            <option key={index} value={index}>
              {maand}
            </option>
          ))}
        </select>
        {month !== "lastPeriod" && renderYearSelect(false)}
      </>
    )
  }

  const renderQuarterSelect = (showLastPeriod: boolean = true) => {
    return (
      <>
        <select
          value={quarter}
          onChange={(e) => setQuarter(e.target.value as number | "lastPeriod")}
          name="quarter"
          id="quarter"
          className="p-2 border-2 border-gray-300 rounded-md"
          required
        >
          {showLastPeriod && <option value="lastPeriod">Afgelopen kwartaal</option>}
          {[1, 2, 3, 4].map((kwartaal) => {
            const isValidQuarter =
              !(year === firstDate.getFullYear() && kwartaal < getQuarter(firstDate)) &&
              !(year === lastDate.getFullYear() && kwartaal > getQuarter(lastDate));
            return (
              isValidQuarter && (
                <option key={kwartaal} value={kwartaal}>
                  Kwartaal {kwartaal}
                </option>
              )
            );
          })}
        </select>
        {quarter !== "lastPeriod" && renderYearSelect(false)}
      </>
    )
  }

  const renderYearSelect = (showLastPeriod: boolean = true) => {
    return (
      <select
        value={year}
        onChange={(e) => {
          const value = e.target.value === "lastPeriod" ? "lastPeriod" : parseInt(e.target.value);
          setYear(value)
        }
        }
        name="year"
        id="year"
        className="p-2 border-2 border-gray-300 rounded-md"
        required
      >
        {showLastPeriod && <option value="lastPeriod">Afgelopen jaar</option>}
        {Array.from({ length: lastDate.getFullYear() - firstDate.getFullYear() + 1 }, (_, i) => {
          const jaar = firstDate.getFullYear() + i;
          return <option key={jaar} value={jaar}>{jaar}</option>;
        })}
      </select>
    )
  }

  const renderUnitSelect = () => {
    if (undefined === reportType) return null;

    if (showDetails === false) return null;

    const showCategorySection = ["bezetting"].includes(reportType);
    const showCategoryPerTypeKlant = ["stallingsduur"].includes(reportType);
    const showGroupByHour = ["bezetting"].includes(reportType) === true;
    const showGroupByBucket = ["stallingsduur"].includes(reportType);

    const showRangeWeek = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType)
    const showRangeAll = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "downloads", "abonnementen", "abonnementen_lopend"].includes(reportType)
    const showRangeMaand = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "downloads", "abonnementen", "abonnementen_lopend"].includes(reportType)
    const showRangeKwartaal = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "stallingsduur"].includes(reportType)
    const showRangeJaar = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "downloads", "stallingsduur"].includes(reportType)

    const showLastPeriod = true; // TODO: range calculations are not yet implemented correctly for lastPeriod

    return (
      <div className="flex flex-col columns-1">
        {reportType === "downloads" && (
          <div className="row">
            <div className="title">Soort data</div>
            <select
              name="datatype"
              value={datatype}
              className="p-2 border-2 border-gray-300 rounded-md"
              onChange={(e) => setDatatype(e.target.value as ReportDatatype)}
            >
              <option value="bezettingsdata">Bezettingsdata</option>
              {false && <option value="ruwedata">Ruwe data</option>}
            </select>
          </div>
        )}

        <div className="font-bold">Categorieen</div>
        <select
          value={reportCategories}
          onChange={(e) => setReportCategories(e.target.value as ReportCategories)}
          name="reportCategories"
          id="reportCategories"
          className="p-2 border-2 border-gray-300 rounded-md"
          required
        >
          <option value="none">Geen</option>
          <option value="per_stalling">Per stalling</option>
          <option value="per_weekday">Per dag van de week</option>
          {showCategorySection && <option value="per_section">Per sectie</option>}
          {showCategoryPerTypeKlant &&  <option value="per_type_klant">Per type klant</option> }
        </select>
        <div className="font-bold">Groepering</div>
        <select
          value={reportGrouping}
          onChange={(e) => setReportGrouping(e.target.value as ReportGrouping)}
          name="reportGrouping"
          id="reportGrouping"
          className="p-2 border-2 border-gray-300 rounded-md"
          required
        >
          <option value="per_year">Jaar</option>
          <option value="per_month">Maand</option>
          <option value="per_quarter">Kwartaal</option>
          <option value="per_week">Week</option>
          <option value="per_day">Dag</option>
          <option value="per_weekday">Dag van de week</option>
          {showGroupByHour && <option value="per_hour">Uur van de dag</option>}
          {showGroupByBucket && <option value="per_bucket">Stallingsduur</option>}
        </select>
        <div className="font-bold">Tijdsperiode</div>
        <select
          value={reportRangeUnit}
          onChange={(e) => setReportRangeUnit(e.target.value as ReportRangeUnit)}
          name="reportRangeUnit"
          id="reportRangeUnit"
          className="p-2 border-2 border-gray-300 rounded-md"
          required
        >
          {showRangeWeek && (
            <option value="range_week">Week</option>
          )}
          {showRangeMaand && (
            <option value="range_month">Maand</option>
          )}
          {showRangeKwartaal && (
            <option value="range_quarter">Kwartaal</option>
          )}
          {showRangeJaar && (
            <option value="range_year">Jaar</option>
          )}
          {showRangeAll && (
            <option value="range_all">Alles</option>
          )}
          {/* {showGelijktijdigVol && (
                <>
                  <option value="reportUnit_onequarter">Kwartaal</option>
                  <option value="reportUnit_oneyear">Jaar</option>
                </>
              )} */}
        </select>

        {reportRangeUnit === "range_week" && renderWeekSelect(showLastPeriod)}
        {reportRangeUnit === "range_month" && renderMonthSelect(showLastPeriod)}
        {reportRangeUnit === "range_quarter" && renderQuarterSelect(showLastPeriod)}
        {reportRangeUnit === "range_year" && renderYearSelect(showLastPeriod)}
      </div>
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

  // const renderFilterStatus = (): React.ReactNode => {
  //   let startDT: Date | undefined = undefined;
  //   let endDT: Date | undefined = undefined;

  //   if (undefined !== timerange) {
  //     const range = timerange;
  //     startDT = range.startDT;
  //     endDT = range.endDT;
  //   }

  //   return (
  //     <div className="flex flex-col space-y-2">
  //       <table className="border-2 border-gray-300 rounded-md">
  //         <thead>
  //           <tr>
  //             <th className="text-left">Variabele</th>
  //             <th className="text-left">Waarde</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           <tr>
  //             <td>Rapportage</td>
  //             <td>{reportType}</td>
  //           </tr>
  //           <tr>
  //             <td>Tijdsperiode</td>
  //             <td>{reportRangeUnit}</td>
  //           </tr>
  //           <tr>
  //             <td>Aantal Stallingen</td>
  //             <td>{bikeparks.length}</td>
  //           </tr>
  //           <tr>
  //             <td>Start datum/tijd</td>
  //             <td>{startDT !== undefined ? startDT.toLocaleString() : "-"}</td>
  //           </tr>
  //           <tr>
  //             <td>eind datum/tijd</td>
  //             <td>{endDT !== undefined ? endDT.toLocaleString() : "-"}</td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </div>
  //   )
  // }

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
            Rustig als minder dan <input value={percQuiet} onChange={(e) => setPercQuiet(e.target.value)} type="text" className="integer numeric form-control inline w-11" maxLength={2} name="percQuiet" />% vol
          </div>
        </div>
      </>
    )
  }

  const showBikeparkSelect = reportCategories !== "per_stalling";
  console.log("showBikeparkSelect", selectedBikeparkIDs);  
  return (
    <div className="noPrint" id="ReportComponent">
      <div className="flex flex-col space-y-4">
        <div className="w-full mt-2">
          {renderReportTypeSelect()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            {renderUnitSelect()}
          </div>

          {showBikeparkSelect && bikeparks.length > 1 && (
            <div className="w-96">
              <BikeparkSelect
                bikeparks={bikeparks}
                selectedBikeparkIDs={selectedBikeparkIDs}
                setSelectedBikeparkIDs={setSelectedBikeparkIDs}
              />
            </div>
          )}          

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
        </div>
        {showGoButton && <div
          className={`${errorState === undefined ? 'bg-blue-500' : 'bg-gray-300'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded max-w-20 max-h-10 inline-block text-center cursor-pointer ${errorState === undefined ? "" : "cursor-not-allowed"}`}
          role="button"
          onClick={errorState === undefined ? handleSubmit : undefined}
        >
          Go!
        </div>
        }

        {/* new row, full width */}
        <div className="flex flex-col space-y-2">
          {errorState && <div style={{ color: "red", fontWeight: "bold" }}>{errorState}</div>}
          {warningState && <div style={{ color: "orange", fontWeight: "bold" }}>{warningState}</div>}
        </div>

        {/* {renderFilterStatus()} */}

      </div>
    </div>
  );
};

export default ReportsFilterComponent;