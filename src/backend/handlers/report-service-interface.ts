export interface IReportService<T> {
  // getStallingduurData: () => Promise<T>;
  getTransactionsPerPeriodData: (queryParams: any) => Promise<T>;
}