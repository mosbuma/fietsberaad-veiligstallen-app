export interface ReportContent {
    title: string;
    data: {
        columns: string[];
        records: Record<string, any>[];
        hidden?: string[];
        actions?: {
            name: string;
            icon: React.ReactNode | undefined;
            action: (data: Record<string, any>) => void;
        }[];
    };
}

export const noReport: ReportContent = {
    title: "No report",
    data: { columns: [], records: [], actions: [], hidden: [] }
}
