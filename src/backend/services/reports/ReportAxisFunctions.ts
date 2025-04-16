import moment from "moment";
import { ReportGrouping } from "~/components/beheer/reports/ReportsFilter";
// import { debugLog } from "~/backend/services/reports/ReportFunctions";

export type XAxisLabelMap = Record<string, string>;

export const getXAxisTitle = (reportGrouping: ReportGrouping) => {
  switch (reportGrouping) {
    case 'per_hour': return 'Uur';
    case 'per_week': return 'Week';
    case 'per_weekday': return 'Dag van de week';
    case 'per_day': return 'Dag';
    case 'per_month': return 'Maand';
    case 'per_quarter': return 'Kwartaal';
    case 'per_year': return 'Jaar';
    case 'per_bucket': return 'Stallingsduur';
    default: return 'onbekend';
  }
}

export const getLabelMapForXAxis = (reportGrouping: ReportGrouping, startDate: Date, endDate: Date): XAxisLabelMap => {
  switch (reportGrouping) {
    case 'per_hour': {
      const labelMap: XAxisLabelMap = {};
      Array.from({ length: 24 }, (_, i) => (labelMap[i.toString()] = i.toString() + ":00"));
      console.log(labelMap);
      return labelMap;
    }
    case 'per_weekday': {
      const labelMap: XAxisLabelMap = {};
      labelMap['0'] = 'ma';
      labelMap['1'] = 'di';
      labelMap['2'] = 'wo';
      labelMap['3'] = 'do';
      labelMap['4'] = 'vr';
      labelMap['5'] = 'za';
      labelMap['6'] = 'zo';
      return labelMap;
    }
    case 'per_day': {
      const labelMap: XAxisLabelMap = {};
      for (let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
        labelMap[date.format('YYYY-DDD')] = date.format('MMM-D');
      }
      return labelMap;
    }
    case 'per_month': {
      const labelMap: XAxisLabelMap = {};
      const startKey = moment(startDate).startOf('month');
      const endKey = moment(endDate).endOf('month');
      for (let date = moment(startKey); date.isBefore(endKey); date.add(1, 'month')) {
        if (moment(startDate).year() === moment(endDate).year()) {
          // use locale month name
          labelMap[date.format('YYYY-M')] = date.format('MMM');
        } else {
          labelMap[date.format('YYYY-M')] = date.format('MMM-YYYY');
        }
      }
      return labelMap;
    }
    case 'per_week': {
      const labelMap: XAxisLabelMap = {};
      const startKey = moment(startDate).isoWeek(moment(startDate).isoWeek()).startOf('isoWeek');
      const endKey = moment(endDate).isoWeek(moment(endDate).isoWeek()).endOf('isoWeek');
      for (let date = moment(startKey); date.isBefore(endKey); date.add(1, 'week')) {
        labelMap[date.format('YYYY-W')] = date.format('YYYY-WW');
      }
      return labelMap;
    }
    case 'per_quarter': {
      const labelMap: XAxisLabelMap = {};
      const startKey = moment(startDate).startOf('quarter');
      const endKey = moment(endDate).endOf('quarter');
      for (let date = moment(startKey); date.isBefore(endKey); date.add(1, 'quarter')) {
        labelMap[date.format('YYYY-Q')] = date.format('YYYY-Q');
      }
      return labelMap;
    }
    case 'per_year': {
      const labelMap: XAxisLabelMap = {};
      const startKey = moment(startDate).startOf('year');
      const endKey = moment(endDate).endOf('year');
      for (let date = moment(startKey); date.isBefore(endKey); date.add(1, 'year')) {
        labelMap[date.format('YYYY')] = date.format('YYYY');
      }
      return labelMap;
    }
    case 'per_bucket': {
      const labelMap: XAxisLabelMap = {};
      //   const buckets = [
      //     "<30m",
      //     "30-60m",
      //     "1-2h",
      //     "2-4h",
      //     "4-8h",
      //     "8-24h",
      //     "1-2d",
      //     "2-7d",
      //     "7-14d",
      //     ">14d"
      //   ];
      labelMap['0'] = '<30m';
      labelMap['1'] = '30-60m';
      labelMap['2'] = '1-2h';
      labelMap['3'] = '2-4h';
      labelMap['4'] = '4-8h';
      labelMap['5'] = '8-24h';
      labelMap['6'] = '1-2d';
      labelMap['7'] = '2-7d';
      labelMap['8'] = '7-14d';
      labelMap['9'] = '>14d';
      return labelMap;
    }
    default:
      return {} as XAxisLabelMap;
  }
}

// export const testReportUnitLabels = () => {
//   debugLog("TEST REPORT UNIT LABELS", true);
//   const testCase = (grouping: ReportGrouping, rangeStart: Date, rangeEnd: Date) => {
//     debugLog(`TEST CASE ${grouping} ${rangeStart} ${rangeEnd}`);
//     debugLog(`${JSON.stringify(getLabelMapForXAxis(grouping, rangeStart, rangeEnd))}`);
//   }
//   const rangestart = moment('2024-01-01 00:00Z+1').toDate();
//   const rangeend = moment('2024-01-31 23:59Z+1').toDate();  

//   testCase('per_hour', rangestart, rangeend);
//   testCase('per_weekday', rangestart, rangeend);
//   testCase('per_day', rangestart, rangeend);
//   testCase('per_month', rangestart, rangeend);
//   testCase('per_quarter', rangestart, rangeend);
//   testCase('per_year', rangestart, rangeend);
// }

export const getCategoriesForXAxis = (labels: XAxisLabelMap): string[] => {
  return Object.keys(labels);
}

export const getXAxisFormatter = (labels: XAxisLabelMap) => (): ((value: string) => string) => {
  return (value: string) => labels[value] || value;
}
