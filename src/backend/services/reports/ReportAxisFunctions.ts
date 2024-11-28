import moment from "moment";
import { ReportGrouping } from "~/components/beheer/reports/ReportsFilter";
import { debugLog } from "~/backend/services/reports/ReportFunctions";

export type XAxisLabelMap = Record<string, string>;

export const getXAxisTitle = (reportGrouping: ReportGrouping) => {
  switch(reportGrouping) {
    case 'per_hour': return 'Uur';
    case 'per_week': return 'Week';
    case 'per_weekday': return 'Dag van de week';
    case 'per_day': return 'Dag';
    case 'per_month': return 'Maand';
    case 'per_quarter': return 'Kwartaal';
    case 'per_year': return 'Jaar';
    default: return 'onbekend';
  }
}

export const getLabelMapForXAxis = (reportGrouping: ReportGrouping, startDate: Date, endDate: Date): XAxisLabelMap => {
    switch(reportGrouping) {
      case 'per_hour': {
          // generate 24 hours
          // return Array.from({ length: 24 }, (_, i) => ({ key: i.toString(), label: i.toString() }));
          // create object with 24 hours
          const labelMap: XAxisLabelMap = {};
          Array.from({ length: 24 }, (_, i) => (labelMap[i.toString()] = i.toString() + ":00"));
          console.log(labelMap);
          return labelMap;
      }
      case 'per_weekday': {
          // return [{ key: '1', label: 'ma'}, 
          //   { key: '2', label: 'di'}, 
          //   { key: '3', label: 'wo'}, 
          //   { key: '4', label: 'do'}, 
          //   { key: '5', label: 'vr'}, 
          //   { key: '6', label: 'za'}, 
          //   { key: '7', label: 'zo'}];
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
      //   const labels: XAxisLabels[] = [];
      //   for(let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
      //       labels.push({ key: date.format('YYYY-DDD'), label: date.format('DDD') });
      //   }
      //   return labels;
      // }
        const labelMap: XAxisLabelMap = {};
        for(let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
            labelMap[date.format('YYYY-DDD')] = date.format('DDD');
        }
        return labelMap;
      }
      // case 'per_month': {
      //   const labels: XAxisLabels[] = [];
      //   const startKey = moment(startDate).startOf('month');
      //   const endKey = moment(endDate).endOf('month');
      //   for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'month')) {
      //     labels.push({ key: date.format('YYYY-MM'), label: date.format('MMM') });
      //   }
      //   return labels;
      // }
      // case 'per_week': {
      //   const labels: XAxisLabels[] = [];
      //   const startKey = moment(startDate).startOf('week');        
      //   const endKey = moment(endDate).endOf('week');
      //   for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'week')) {
      //       labels.push({ key: date.format('YYYY-WW'), label: date.format('YYYY-WW') });
      //   }
      //   return labels;
      // }
      // case 'per_quarter': {
      //   const labels: XAxisLabels[] = [];
      //   const startKey = moment(startDate).startOf('quarter');
      //   const endKey = moment(endDate).endOf('quarter');
      //   for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'quarter')) {
      //       labels.push({ key: date.format('YYYY-Q'), label: date.format('YYYY-Q') });
      //   }
      //   return labels;
      // }
      // case 'per_year': {
      //   const labels: XAxisLabels[] = [];
      //   const startKey = moment(startDate).startOf('year');
      //   const endKey = moment(endDate).endOf('year');
      //   for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'year')) {
      //       labels.push({ key: date.format('YYYY'), label: date.format('YYYY') });
      //   }
      //   return labels;
      // }
      default:
        return {};
    }
}

// export const testReportUnitLabels = () => {
//   debugLog("TEST REPORT UNIT LABELS", true);
//   const testCase = (grouping: ReportGrouping, rangeStart: Date, rangeEnd: Date) => {
//     debugLog(`TEST CASE ${grouping} ${rangeStart} ${rangeEnd}`);
//     debugLog(`${JSON.stringify(getLabelsForXAxis(grouping, rangeStart, rangeEnd))}`);
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
