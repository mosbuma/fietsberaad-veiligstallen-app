import React, { useState, useEffect } from "react";
import BikeparkSelect from './BikeparkSelect';

export type ReportType = "transacties_voltooid" | "inkomsten" | "abonnementen" | "abonnementen_lopend" | "bezetting" | "stallingsduur" | "volmeldingen" | "gelijktijdig_vol" | "downloads"
export type ReportDatatype = "bezettingsdata" | "ruwedata"
export type ReportCategories = "none" | "per_stalling" | "per_weekday" | "per_section" | "per_type_klant"

export type ReportGrouping = "per_hour" | "per_day" | "per_weekday" | "per_week" | "per_month" | "per_quarter" | "per_year"
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

const getWeekNumber = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((diff / oneDay + start.getDay() + 1) / 7);
};

const firstDayOfWeek = (year: number, weeknumber: number): Date => {
  const janFirst = new Date(year, 0, 1);
  const daysOffset = (weeknumber - 1) * 7;
  const firstDay = new Date(janFirst.setDate(janFirst.getDate() + daysOffset));
  const dayOfWeek = firstDay.getDay();
  const diff = firstDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(firstDay.setDate(diff));
}

const lastDayOfWeek = (year: number, weeknumber: number): Date => {
  const firstDay = firstDayOfWeek(year, weeknumber);
  return new Date(firstDay.setDate(firstDay.getDate() + 6));
}

const getQuarter = (date: Date): number => {
  return Math.floor(date.getMonth() / 3) + 1;
};

const getMaanden = (): Array<string> => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return date.toLocaleDateString('nl-NL', { month: 'long' });
  });
};

const getSingleYearRange = (year: number | "lastPeriod") => {
  let filteryear: number, filtermonth: number;
  console.log("getSingleYearRange", year);
  if (year === "lastPeriod") {
    const now = new Date();
    filteryear = now.getFullYear()
    filtermonth = now.getMonth() + 1

    console.log("lastPeriod", filteryear, filtermonth);
  } else {
    filteryear = year
    filtermonth = 12
  }
  const startDT = new Date(filteryear - (filtermonth === 12 ? 0 : 1), (filtermonth === 12 ? 1 : filtermonth + 1) - 1, 1);
  startDT.setHours(0, 0, 0, 0);
  const endDT = new Date(filteryear, filtermonth, 0);
  endDT.setHours(23, 59, 59, 999);

  startDT.setHours(0, 0, 0, 0);
  endDT.setHours(23, 59, 59, 999);

  return { startDT, endDT };
}

const getSingleMonthRange = (year: number | "lastPeriod", month: number | "lastPeriod") => {
  let startDT, endDT;
  if (month === "lastPeriod" || year === "lastPeriod") {
    const now = new Date();
    startDT = new Date(now.getFullYear(), now.getMonth(), 1);
    endDT = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    console.log("month", year, month);
    startDT = new Date(year, month, 1);
    endDT = new Date(year, month + 1, 0);
  }
  startDT.setHours(0, 0, 0, 0);
  endDT.setHours(23, 59, 59, 999);

  return { startDT, endDT };
}

const getSingleQuarterRange = (year: number | "lastPeriod", quarter: number | "lastPeriod") => {
  let startDT, endDT, currentYear, currentQuarter;

  if (year === "lastPeriod" || quarter === "lastPeriod") {
    const now = new Date();
    currentQuarter = getQuarter(now);
    console.log("currentQuarter", currentQuarter); // 1 .. 4
    currentYear = now.getFullYear();
  } else {
    currentQuarter = quarter;
    currentYear = year;
  }

  startDT = new Date(currentYear, (currentQuarter - 1) * 3, 1);
  endDT = new Date(currentYear, (currentQuarter * 3), 0);
  startDT.setHours(0, 0, 0, 0);
  endDT.setHours(23, 59, 59, 999);

  return { startDT, endDT };
}

const getSingleWeekRange = (year: number | "lastPeriod", week: number | "lastPeriod") => {
  let startDT, endDT;
  const theWeek = week === "lastPeriod" ? getWeekNumber(new Date()) : week;

  if (year === "lastPeriod" || week === "lastPeriod") {
    const now = new Date();
    startDT = firstDayOfWeek(now.getFullYear(), theWeek);
    endDT = lastDayOfWeek(now.getFullYear(), theWeek);
  } else {
    startDT = firstDayOfWeek(year, theWeek);
    endDT = lastDayOfWeek(year, theWeek);
  }

  startDT.setHours(0, 0, 0, 0);
  endDT.setHours(23, 59, 59, 999);

  return { startDT, endDT };
}

const getAvailableReports = (showAbonnementenRapporten: boolean) => {
  const availableReports = [
    { id: "transacties_voltooid", title: "Aantal afgeronde transacties" },
  ];
    // { id: "inkomsten", title: "Inkomsten (€)" },
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
interface ReportsFilterComponentProps {
  showAbonnementenRapporten: boolean;
  firstDate: Date;
  lastDate: Date;
  bikeparks: ReportBikepark[];
  onSubmit: (params: ReportParams) => void;
  showDetails?: boolean;
  showGoButton?: boolean;
}

// const calculateStartWeek = (endweek: number, year: number): number => {
//     const weeksInYear = getWeeksInYear(year);
//     return endweek - 12 < 1 ? weeksInYear + endweek - 12 : endweek - 12;
// };

// const getWeeksInYear = (year: number): number => {
//     const lastDayOfYear = new Date(year, 11, 31);
//     const weekNumber = getWeekNumber(lastDayOfYear);
//     return weekNumber === 1 ? 52 : weekNumber; // If the last day is in week 1, the year has 52 weeks
// };

const ReportsFilterComponent: React.FC<ReportsFilterComponentProps> = ({
  showAbonnementenRapporten,
  firstDate,
  lastDate,
  bikeparks,
  onSubmit,
  showDetails = true,
  showGoButton = true,
}) => {
  const [reportType, setReportType] = useState<ReportType>("transacties_voltooid");
  const [reportGrouping, setReportGrouping] = useState<ReportGrouping>("per_year");
  const [reportCategories, setReportCategories] = useState<ReportCategories>("per_stalling");
  const [reportRangeUnit, setReportRangeUnit] = useState<ReportRangeUnit>("range_year");
  //const [reportUnit, setReportUnit] = useState<ReportUnit>("reportUnit_year");
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

  const [timerange, setTimerange] = useState<{ startDT: Date, endDT: Date } | undefined>(undefined);

  useEffect(() => {
    if(!showGoButton) {
      handleSubmit();
    }
  }, [reportType, reportGrouping, reportCategories, reportRangeUnit, fillups, grouped]);

  useEffect(() => {
    if (["bezetting"].includes(reportType)) {
      setReportGrouping("per_week");
    } else if (["stallingsduur", "gelijktijdig_vol"].includes(reportType)) {
      setReportGrouping("per_quarter");
    } else {
      setReportGrouping("per_month");
    }
  }, [reportType]);

  useEffect(() => {
    setTimerange(getStartEndDT());
  }, [reportRangeUnit, year, month, week, quarter]);

  useEffect(() => {
    checkInput();
  }, [reportRangeUnit, reportType, year, month, datatype]); // selectedBikeparkIDs, 


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

    onSubmit({ reportType, reportCategories, reportGrouping, reportRangeUnit, reportRangeValue, bikeparkIDs: bikeparks.map((bikepark) => bikepark.stallingsID), startDT: timerange?.startDT, endDT: timerange?.endDT, fillups: fillups });
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

    if(showDetails === false) return null;

    const showCategorySection = ["bezetting"].includes(reportType);
    const showGroupByHour = ["bezetting"].includes(reportType) === true;

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
            { showCategorySection && <option value="per_section">Per sectie</option>}
            {/* <option value="per_type_klant">Per type klant</option> */}
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
          { showGroupByHour && <option value="per_hour">Uur van de dag</option> }
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
        </div>
        { showGoButton && <div
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