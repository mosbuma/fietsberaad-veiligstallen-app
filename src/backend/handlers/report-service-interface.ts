export interface IReportService<T> {
    // getStallingduurData: () => Promise<T>;
    getTransactionsPerPeriodData: () => Promise<T>;
}