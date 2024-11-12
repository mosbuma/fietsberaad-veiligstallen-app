import React, { useState, useEffect } from "react";

export type ReportType = "transacties_voltooid" | "inkomsten" | "abonnementen" | "abonnementen_lopend" | "bezetting" | "stallingsduur" | "volmeldingen" | "gelijktijdig_vol" | "downloads"
export type ReportDatatype = "bezettingsdata" | "ruwedata"
export type ReportUnit = "reportUnit_day" | "reportUnit_weekDay" | "reportUnit_week" | "reportUnit_month" | "reportUnit_quarter" | "reportUnit_year" // | "reportUnit_onequarter" | "reportUnit_oneyear"

export type ReportBikepark = { id: string; stallingsID: string; title: string; gemeenteID: string; hasData: boolean };

export interface ReportParams {
    reportType: ReportType;
    reportUnit: ReportUnit;
    bikeparkIDs: string[];
    startDT: Date | undefined;
    endDT: Date | undefined;
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

const getSingleYearRange = (year: number|"lastPeriod") => {
    let filteryear: number, filtermonth: number;
    if(year === "lastPeriod") {
        const now = new Date();
        filteryear = now.getFullYear()
        filtermonth = now.getMonth()
        // use this code to exclude current month
        // if(filtermonth === 0) { 
        //     filteryear -= 1
        //     filtermonth = 11
        // } else {
        //     filtermonth -= 1
        // }
    } else {
        filteryear = year
        filtermonth = 12
    } 
    const startDT = new Date(filteryear - (filtermonth === 12 ? 0 : 1), (filtermonth === 12 ? 1: filtermonth + 1)-1, 1);
    startDT.setHours(0,0,0,0);
    const endDT = new Date(filteryear, filtermonth, 0);
    endDT.setHours(23, 59, 59, 999);

    startDT.setHours(0,0,0,0);
    endDT.setHours(23, 59, 59, 999);

    return { startDT, endDT};
}

const getAvailableReports = (showAbonnementenRapporten: boolean) => {
    const availableReports = [
        { id: "transacties_voltooid", title: "Aantal afgeronde transacties" },
        { id: "inkomsten", title: "Inkomsten (€)" },
    ];
    // if(showAbonnementenRapporten) {
    //     availableReports.push({ id: "abonnementen", title: "Abonnementswijzigingen" });
    //     availableReports.push({ id: "abonnementen_lopend", title: "Lopende abonnementen" });
    // }
    // availableReports.push({ id: "bezetting", title: "Procentuele bezetting" });
    // availableReports.push({ id: "stallingsduur", title: "Stallingsduur" });
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
  }) => {
    const [reportType, setReportType] = useState<ReportType>("transacties_voltooid");
    const [reportUnit, setReportUnit] = useState<ReportUnit>("reportUnit_year");
    const [datatype, setDatatype] = useState<ReportDatatype|undefined>(undefined);
    const [week, setWeek] = useState<number|"lastPeriod">("lastPeriod");
    const [weekDay, setWeekDay] = useState("");
    const [month, setMonth] = useState("");
    const [quarter, setQuarter] = useState("");
    const [year, setYear] = useState<number|"lastPeriod">("lastPeriod"); // new Date().getFullYear()
    const [selectedBikeparkIDs, setSelectedBikeparkIDs] = useState<string[]>([]);
    const [grouped, setGrouped] = useState("0");
    const [percBusy, setPercBusy] = useState("");
    const [percQuiet, setPercQuiet] = useState("");
    const [errorState, setErrorState] = useState<string|undefined>(undefined);
    const [warningState, setWarningState] = useState<string|undefined>(undefined);

    const availableReports = getAvailableReports(showAbonnementenRapporten);

    const [timerange, setTimerange] = useState<{startDT: Date, endDT: Date}|undefined>(undefined);

    useEffect(() => {
     if(["bezetting"].includes(reportType)) {
        setReportUnit("reportUnit_week");
      } else if(["stallingsduur", "gelijktijdig_vol"].includes(reportType)) {
        setReportUnit("reportUnit_quarter");
      } else {
        setReportUnit("reportUnit_month");
      }
    }, [reportType]);

    useEffect(() => {
      // check for valid date selection when reportUnit or reportType changes
      checkInput();
    }, [reportUnit, reportType]);

    useEffect(() => {
        setTimerange(getStartEndDT());
    }, [reportUnit, year, month, week, quarter]);


    useEffect(() => {
        checkInput();
    }, [reportType, reportUnit, selectedBikeparkIDs, year, month, datatype]);

    useEffect(() => {
      // Filter out any selected bikeparks that are no longer in the bikeparks array
      setSelectedBikeparkIDs((prevSelected) =>
        prevSelected.filter((id) => bikeparks.some((park) => park.stallingsID === id))
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
            const endPeriod = new Date(year === "lastPeriod" ? new Date().getFullYear() : year, parseInt(month), 1);
            if (endPeriod > new Date()) {
                setWarningState("Zeer recente bezettingsdata op basis van in- en uitchecks is onbetrouwbaar omdat deze nog niet gecorrigeerd zijn middels controlescans");
            }
        }
        
        return true;
    }

    const getStartEndDT = () => {
        switch(reportUnit) {
            case "reportUnit_year": {
                const startDT = firstDate;
                startDT.setHours(0,0,0,0);
                const endDT = lastDate;
                endDT.setHours(23, 59, 59, 999);

                return { startDT, endDT};
            }
            // case "reportUnit_oneyear": 
            case "reportUnit_month": 
            case "reportUnit_weekDay":
            case "reportUnit_week":
                return getSingleYearRange(year);
            case "reportUnit_quarter": {
                let filteryear: number, filterquarter: number;
                if(year === "lastPeriod") {
                    // set startDT and endDT to last 4 quarters (including current quarter)
                    const now = new Date();
                    filteryear = now.getFullYear()
                    filterquarter = getQuarter(now)
                    // use this code to exclude current quarter
                    // if(filterquarter === 1) { 
                    //     filteryear -= 1
                    //     filterquarter = 4
                    // } else {
                    //     filterquarter -= 1
                    // }
                } else {
                    filteryear = year
                    filterquarter = 4
                } 

                const startDT = new Date(filteryear - (filterquarter === 4 ? 0 : 1), (filterquarter === 4 ? 0: filterquarter) *3 , 1);
                startDT.setHours(0,0,0,0);
                const endDT = new Date(filteryear, filterquarter * 3, 0);
                endDT.setHours(23, 59, 59, 999);
        
                return { startDT, endDT};
            }
            // case "reportUnit_onequarter": {
            //     console.log("ONEQUARTER '%s'", quarter);
            //     if(quarter === "lastPeriod") {
            //         // set startDT and endDT to last 12 weeks
            //         const now = new Date();
            //         const filteryear = now.getFullYear();
            //         const endweek = getWeekNumber(now);
            //         const startweek = calculateStartWeek(endweek, filteryear);

            //         const startDT = firstDayOfWeek(filteryear, startweek);
            //         startDT.setHours(0,0,0,0);
            //         const endDT = lastDayOfWeek(filteryear, endweek);
            //         endDT.setHours(23, 59, 59, 999);

            //         console.log("ONEQUARTER lastPeriod", filteryear, startweek, endweek, startDT, endDT);
            
            //         return { startDT, endDT};
            //     } else {
            //         const filterquarter = parseInt(quarter)

            //         const filteryear = typeof year === "number" ? year : new Date().getFullYear();
            //         const startDT = new Date(filteryear, (filterquarter-1) *3 , 1);
            //         startDT.setHours(0,0,0,0);
            //         const endDT = new Date(filteryear, filterquarter * 3, 0);
            //         endDT.setHours(23, 59, 59, 999);
            
            //         return { startDT, endDT};
            //     } 
            // }
            case "reportUnit_day": {
                let filteryear: number, filterweek: number;
                if(week === "lastPeriod") {
                    filteryear = new Date().getFullYear()
                    filterweek = getWeekNumber(new Date())
                } else {
                    filteryear = typeof year === "number" ? year : new Date().getFullYear();
                    filterweek = week;
                }
                
                const startDT = firstDayOfWeek(filteryear, filterweek);
                startDT.setHours(0,0,0,0);
                const endDT = lastDayOfWeek(filteryear, filterweek);
                endDT.setHours(23, 59, 59, 999);

                return { startDT, endDT};
            }
            default: {
                console.warn("Unhandled reportUnit", reportUnit);
                return { startDT: new Date(), endDT: new Date()};
            };
        }
    }
  
    const handleSubmit = () => {
        if(!checkInput()) return;

        onSubmit({reportType, reportUnit, bikeparkIDs: selectedBikeparkIDs, startDT: timerange?.startDT, endDT: timerange?.endDT});
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
            > { availableReports.map((report) => (
              <option key={report.id} value={report.id}>{report.title}</option>
            ))}
            </select>
          </div>
        </div>
      )
    }

    const renderUnitSelect = () => {
      if (undefined === reportType) return null;

      const showPerDagWeekdag = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType)
      const showPerWeek = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting"].includes(reportType)
      const showPerMaand = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "downloads", "abonnementen", "abonnementen_lopend"].includes(reportType)
      const showPerKwartaal = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "stallingsduur"].includes(reportType)
      const showPerJaar = true; //  ["transacties_voltooid", "inkomsten", "volmeldingen", "bezetting", "downloads", "stallingsduur"].includes(reportType)
      // const showGelijktijdigVol = ["gelijktijdig_vol"].includes(reportType)
      const showJaarAfgelopen12Maanden = reportUnit === 'reportUnit_month'  || reportUnit === "reportUnit_week" ||reportUnit === "reportUnit_weekDay"
      const showJaarAfgelopen4Kwartalen = reportUnit === 'reportUnit_quarter' // && year === lastDate.getFullYear()

      const selectShowAll = false; // for debugging
      const selectDag = reportUnit === "reportUnit_day"; //  && (selectShowAll || ["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType||""))
      // const selectWeekdag = reportUnit === "reportUnit_weekDay" && (selectShowAll || ["transacties_voltooid", "inkomsten", "volmeldingen"].includes(reportType||""))
      const selectWeekdag = false; // In new design, weekDay is not used
      const selectKwartaalBeperkt = false; // reportUnit === "reportUnit_onequarter" && (selectShowAll || ['transacties_voltooid', 'inkomsten', 'volmeldingen', 'gelijktijdig_vol'].includes(reportType||""))
      const selectWeek = false; reportUnit === "reportUnit_week"; //  && (selectShowAll || ["downloads", "bezetting", "stallingsduur"].includes(reportType||"")) && reportType !== "downloads"
      const selectMaand = false; reportUnit === "reportUnit_month"; // && (selectShowAll || ["downloads", "bezetting", "stallingsduur"].includes(reportType||""))
      const selectKwartaal = false; // reportUnit === "reportUnit_quarter"; //  && (selectShowAll || ["downloads", "bezetting", "stallingsduur"].includes(reportType||""))
      const hideYear = false; // reportType === "gelijktijdig_vol" && reportUnit === "reportUnit_onequarter" && quarter === "lastPeriod"
      const selectYear = reportUnit !== "reportUnit_year" && !hideYear

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
              {/* {showGelijktijdigVol && (
                <>
                  <option value="reportUnit_onequarter">Kwartaal</option>
                  <option value="reportUnit_oneyear">Jaar</option>
                </>
              )} */}
            </select>

              {selectWeek && (
                <select 
                  value={week} 
                  onChange={(e) => setWeek(e.target.value as number | "lastPeriod")} 
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
                  {getMaanden().map((maand, index) => (
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
                onChange={(e) => setWeek(parseInt(e.target.value))}
                name="week"
                id="week"
                className="p-2 border-2 border-gray-300 rounded-md"
                required
              >
                {year === lastDate.getFullYear() && (
                  <option value="lastPeriod">Afgelopen week</option>
                )}
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
                <option value="lastPeriod">Afgelopen 12 weken</option>
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
          )}
          { selectYear && <select
            value={year}
            onChange={(e) => setYear(e.target.value === "lastPeriod" ? "lastPeriod" : parseInt(e.target.value))}
            name="year"
            id="year"
            className="p-2 border-2 border-gray-300 rounded-md"
            required
          >
            {showJaarAfgelopen12Maanden && (
              <option value="lastPeriod">Afgelopen 12 maanden</option>
            )}
            {showJaarAfgelopen4Kwartalen && (
              <option value="lastPeriod">Afgelopen 4 kwartalen</option>
            )}
            {Array.from({ length: lastDate.getFullYear() - firstDate.getFullYear() + 1 }, (_, i) => {
              const jaar = firstDate.getFullYear() + i;
              return <option key={jaar} value={jaar}>{jaar}</option>;
            })}
          </select>}
        </div>
      );
    };

    const renderBikeparkSelect = (): React.ReactNode => {
      const isScrollable = bikeparks.length > 10;

      const toggleSelectAll = () => {
        const newSelection = bikeparks.map(park => park.stallingsID).filter(id => !selectedBikeparkIDs.includes(id));
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
              <div key={park.stallingsID}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBikeparkIDs.includes(park.stallingsID)}
                    value={park.stallingsID}
                    onChange={() =>
                      setSelectedBikeparkIDs((prev) =>
                        prev.includes(park.stallingsID)
                          ? prev.filter((id) => id !== park.stallingsID)
                          : [...prev, park.stallingsID]
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

    const renderFilterStatus = (): React.ReactNode => {
        let startDT: Date|undefined = undefined;
        let endDT: Date|undefined = undefined;

        if(undefined !== timerange) {
            const range = timerange;
            startDT = range.startDT;
            endDT = range.endDT;
        } 

        return (
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
                  <td>Aantal Stallingen</td>
                  <td>{selectedBikeparkIDs.length}</td>
                </tr>
                <tr>
                  <td>Start datum/tijd</td>
                  <td>{startDT!==undefined ? startDT.toLocaleString() : "-"}</td>
                </tr>
                <tr>
                  <td>eind datum/tijd</td>
                  <td>{endDT!==undefined ? endDT.toLocaleString() : "-"}</td>
                </tr>
              </tbody>
            </table>  
          </div>
        )
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

          { renderFilterStatus() }

        </div>
      </div>
    );
  };
  
  export default ReportsFilterComponent;