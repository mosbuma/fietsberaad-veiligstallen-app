import moment from "moment";
import { ReportState } from "./ReportsFilter";

export const getWeekNumber = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.ceil((diff / oneDay + start.getDay() + 1) / 7);
  };
  
  export const firstDayOfWeek = (year: number, weeknumber: number): Date => {
    const janFirst = new Date(year, 0, 1);
    const daysOffset = (weeknumber - 1) * 7;
    const firstDay = new Date(janFirst.setDate(janFirst.getDate() + daysOffset));
    const dayOfWeek = firstDay.getDay();
    const diff = firstDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(firstDay.setDate(diff));
  }
  
  export const lastDayOfWeek = (year: number, weeknumber: number): Date => {
    const firstDay = firstDayOfWeek(year, weeknumber);
    return new Date(firstDay.setDate(firstDay.getDate() + 6));
  }
  
  export const getQuarter = (date: Date): number => {
    return Math.floor(date.getMonth() / 3) + 1;
  };
  
  export const getMaanden = (): Array<string> => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2024, i, 1);
      return date.toLocaleDateString('nl-NL', { month: 'long' });
    });
  };
  
  export const getSingleYearRange = (year: number | "lastPeriod") => {
    let filteryear: number, filtermonth: number;
    if (year === "lastPeriod") {
      const now = new Date();
      filteryear = now.getFullYear()
      filtermonth = now.getMonth() + 1
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
  
  export const getSingleMonthRange = (year: number | "lastPeriod", month: number | "lastPeriod") => {
    let startDT, endDT;
    if (month === "lastPeriod" || year === "lastPeriod") {
      const now = new Date();
      startDT = new Date(now.getFullYear(), now.getMonth(), 1);
      endDT = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      startDT = new Date(year, month, 1);
      endDT = new Date(year, month + 1, 0);
    }
    startDT.setHours(0, 0, 0, 0);
    endDT.setHours(23, 59, 59, 999);
  
    return { startDT, endDT };
  }
  
  export const getSingleQuarterRange = (year: number | "lastPeriod", quarter: number | "lastPeriod") => {
    let startDT, endDT, currentYear, currentQuarter;
  
    if (year === "lastPeriod" || quarter === "lastPeriod") {
      const now = new Date();
      currentQuarter = getQuarter(now);
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
  
  export const getSingleWeekRange = (year: number | "lastPeriod", week: number | "lastPeriod") => {
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
  
// export const calculateStartWeek = (endweek: number, year: number): number => {
//     const weeksInYear = getWeeksInYear(year);
//     return endweek - 12 < 1 ? weeksInYear + endweek - 12 : endweek - 12;
// };

// export const getWeeksInYear = (year: number): number => {
//     const lastDayOfYear = new Date(year, 11, 31);
//     const weekNumber = getWeekNumber(lastDayOfYear);
//     return weekNumber === 1 ? 52 : weekNumber; // If the last day is in week 1, the year has 52 weeks
// };

export const getAdjustedStartEndDates = (startDT: Date | undefined, endDT: Date | undefined, dayBeginsAt = new Date(0, 0, 0)): { timeIntervalInMinutes: number, adjustedStartDate: moment.Moment | undefined, adjustedEndDate: moment.Moment | undefined } => {
  // TODO: check if timeinterval offset works correctly, link dayBeginsAt to offset settings in database
  // current db model links to contacts.DayBeginsAt field

  const timeIntervalInMinutes = dayBeginsAt.getHours() * 60 + dayBeginsAt.getMinutes();

  let adjustedStartDate = undefined!==startDT ? moment(startDT).add(timeIntervalInMinutes, 'minutes') : undefined;
  let adjustedEndDate = undefined!==endDT ? moment(endDT).add(timeIntervalInMinutes, 'minutes') : undefined;

  return { timeIntervalInMinutes, adjustedStartDate, adjustedEndDate };
}

export const getStartEndDT = (state: ReportState, firstDate: Date, lastDate: Date) => {
  switch (state.reportRangeUnit) {
    case "range_all": {
      const startDT = firstDate;
      startDT.setHours(0, 0, 0, 0);
      const endDT = lastDate;
      endDT.setHours(23, 59, 59, 999);

      return { startDT, endDT };
    }
    case "range_year": {
      return getSingleYearRange(state.reportRangeYear);
    }
    case "range_month": {
      return getSingleMonthRange(state.reportRangeYear, state.reportRangeValue);
    }
    case "range_quarter": {
      return getSingleQuarterRange(state.reportRangeYear, state.reportRangeValue);
    }
    case "range_week": {
      return getSingleWeekRange(state.reportRangeYear, state.reportRangeValue);
    }
    default: {
      console.warn("Unhandled reportUnit", state.reportRangeUnit);
      return { startDT: new Date(), endDT: new Date() };
    };
  }
}
