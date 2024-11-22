import moment from "moment";
import { ReportGrouping } from "~/components/beheer/reports/ReportsFilter";
import { debugLog } from "~/backend/services/reports/ReportFunctions";

export interface XAxisLabels { key: string, label: string }

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

export const getLabelsForXAxis = (reportGrouping: ReportGrouping, startDate: Date, endDate: Date): XAxisLabels[] => {
    switch(reportGrouping) {
      case 'per_hour': 
          // generate 24 hours
          return Array.from({ length: 24 }, (_, i) => ({ key: i.toString(), label: i.toString() }));
      case 'per_weekday':
          return [{ key: '1', label: 'ma'}, 
            { key: '2', label: 'di'}, 
            { key: '3', label: 'wo'}, 
            { key: '4', label: 'do'}, 
            { key: '5', label: 'vr'}, 
            { key: '6', label: 'za'}, 
            { key: '7', label: 'zo'}];
      case 'per_day': {
        const labels: XAxisLabels[] = [];
        for(let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
            labels.push({ key: date.format('YYYY-DDD'), label: date.format('DDD') });
        }
        return labels;
      }
      case 'per_month': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('month');
        const endKey = moment(endDate).endOf('month');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'month')) {
          labels.push({ key: date.format('YYYY-MM'), label: date.format('MMM') });
        }
        return labels;
      }
      case 'per_week': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('week');        
        const endKey = moment(endDate).endOf('week');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'week')) {
            labels.push({ key: date.format('YYYY-WW'), label: date.format('YYYY-WW') });
        }
        return labels;
      }
      case 'per_quarter': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('quarter');
        const endKey = moment(endDate).endOf('quarter');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'quarter')) {
            labels.push({ key: date.format('YYYY-Q'), label: date.format('YYYY-Q') });
        }
        return labels;
      }
      case 'per_year': {
        const labels: XAxisLabels[] = [];
        const startKey = moment(startDate).startOf('year');
        const endKey = moment(endDate).endOf('year');
        for(let date = moment(startKey); date.isBefore(endKey); date.add(1, 'year')) {
            labels.push({ key: date.format('YYYY'), label: date.format('YYYY') });
        }
        return labels;
      }
      default:
        return [];
    }
}

export const testReportUnitLabels = () => {
  debugLog("TEST REPORT UNIT LABELS", true);
  const testCase = (grouping: ReportGrouping, rangeStart: Date, rangeEnd: Date) => {
    debugLog(`TEST CASE ${grouping} ${rangeStart} ${rangeEnd}`);
    debugLog(`${JSON.stringify(getLabelsForXAxis(grouping, rangeStart, rangeEnd))}`);
  }
  const rangestart = moment('2024-01-01 00:00Z+1').toDate();
  const rangeend = moment('2024-01-31 23:59Z+1').toDate();  

  testCase('per_hour', rangestart, rangeend);
  testCase('per_weekday', rangestart, rangeend);
  testCase('per_day', rangestart, rangeend);
  testCase('per_month', rangestart, rangeend);
  testCase('per_quarter', rangestart, rangeend);
  testCase('per_year', rangestart, rangeend);
}

export const getCategoriesForXAxis = (labels: XAxisLabels[]): string[] => {
  return labels.map(label => label.key);
}

export const getXAxisFormatter = (labels: XAxisLabels[]) => (): ((value: string) => string) => {
  const labelMap = labels.reduce((acc, label) => {
    acc[label.key] = label.label;
    return acc;
  }, {} as Record<string, string>);

  return (value: string) => labelMap[value] || value;
}
