import React, { useRef, useState, useEffect } from "react";
import { NextPage } from "next/types";
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from "next-auth/next"
import { type Session } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import type { fietsenstallingen, contacts } from "~/generated/prisma-client";
import moment from "moment";

import { getParkingsFromDatabase } from "~/utils/prisma";
import { getMunicipalities } from "~/utils/municipality";

import ReportTable from "~/utils/reports/report-table";
import { noReport, type ReportContent } from "~/utils/reports/types";
import { createOpeningTimesReport } from "~/utils/reports/openingtimes";
import { createFixBadDataReport } from "~/utils/reports/baddata";
import { createStallingtegoedReport } from "~/utils/reports/stallingtegoed";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
        const session = await getServerSession(context.req, context.res, authOptions) as Session
        const fietsenstallingen = await getParkingsFromDatabase([], session);

        return {
            props: {
                fietsenstallingen,
                user: session?.user?.email || false,
            },
        };
    } catch (ex: any) {
        return {
            props: {
                fietsenstallingen: [],
                user: false
            },
        };
    }
}

const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const extractText = (element: React.ReactNode): string => {
    if (typeof element === 'string') {
        return element;
    }
    if (typeof element === 'number') {
        return element.toString();
    }
    if (React.isValidElement(element)) {
        const children = element.props.children;
        if (Array.isArray(children)) {
            return children.map(extractText).join('');
        }
        return extractText(children);
    }
    return '';
};

const convertToCSV = (objArray: any[], columns: string[], hiddenColumns: string[]): string => {
    const visibleColumns = columns.filter(col => !hiddenColumns.includes(col));
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = visibleColumns.join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in visibleColumns) {
            if (line !== '') line += ',';
            line += extractText(array[i][visibleColumns[index] as string]);
        }
        str += line + '\r\n';
    }

    return str;
};

const Report: NextPage = ({ fietsenstallingen }: any) => {
    let filterSettings = {
        selectedReport: 'openclose',
        filterType: '',
        isNs: 'all',
        filterDateTime: moment().format('YYYY-MM-DDTHH:mm'),
        showData: true
    };

    if (typeof window !== 'undefined') {
        const jsonfilterSettings = localStorage.getItem('filterSetings');
        if (null !== jsonfilterSettings) {
            filterSettings = Object.assign(filterSettings, JSON.parse(jsonfilterSettings));
        }
    }

    const [selectedReport, setSelectedReport] = useState<string>(filterSettings.selectedReport);
    const [filterType, setFilterType] = useState<string>(filterSettings.filterType);
    const [filterDateTime, setFilterDateTime] = useState<string>(filterSettings.filterDateTime);
    const [isNs, setIsNs] = useState<string>(filterSettings.isNs);
    const [showData, setShowData] = useState<boolean>(filterSettings.showData);

    const [reportContent, setReportContent] = useState<ReportContent | undefined>(noReport);
    const [loading, setLoading] = useState<boolean>(false);

    const [contacts, setContacts] = useState<any | undefined>(undefined);
    const [municipalities, setMunicipalities] = useState<any | contacts>(undefined);

    const abortControllerRef = useRef<AbortController | null>(null);

    const launchReport = (createReportFunction: (filtered: any) => Promise<ReportContent>) => {
        setLoading(true);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setTimeout(async () => {
            if (signal.aborted) return;

            const filtered = fietsenstallingen.filter((parkingdata: fietsenstallingen) => {
                return (filterType === '' || parkingdata.Type === filterType) &&
                    (isNs === 'all' || (isNs === 'true' && parkingdata.EditorCreated === "NS-connector") || (isNs === 'false' && parkingdata.EditorCreated !== "NS-connector"));
            });

            setReportContent(await createReportFunction(filtered));

            setLoading(false);
        }, 500);
    }

    useEffect(() => {
        const go = async () => {
            const response = await getMunicipalities();
            setContacts(response);
        };

        go();
    }, []);

    useEffect(() => {
        const updateReport = async () => {
            const filterSettings = {
                selectedReport,
                filterType,
                isNs,
                filterDateTime,
                showData
            }
            localStorage.setItem('filterSetings', JSON.stringify(filterSettings));
            switch (selectedReport) {
                case 'openclose':
                    launchReport((filtered: any): Promise<ReportContent> => {
                        return createOpeningTimesReport(filtered, moment(filterDateTime), showData);
                    });
                    break;
                case 'baddata':
                    launchReport((filtered: any): Promise<ReportContent> => {
                        return createFixBadDataReport(filtered, contacts, showData);
                    });
                    break;
                case 'stallingstegoed':
                    launchReport((filtered: any): Promise<ReportContent> => {
                        return createStallingtegoedReport(filtered, contacts, showData);
                    });
                    break;
                default:
                    launchReport((_filtered: any): Promise<ReportContent> => {
                        return Promise.resolve(noReport);
                    });
                    break;
            }
        }

        updateReport();
    }, [selectedReport, filterType, isNs, filterDateTime, showData, contacts]);


    const handleDownloadCSV = () => {
        if (reportContent) {
            const csv = convertToCSV(reportContent.data.records, reportContent.data.columns, reportContent.data.hidden || []);
            downloadCSV(csv, 'report.csv');
        }
    };

    const handleReportSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedReport(event.target.value);
    };

    const handleFilterTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterType(event.target.value);
    };

    const handleIsNsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setIsNs(event.target.value);
    };

    const handleFilterDateTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterDateTime(event.target.value);
    };

    const handleShowDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowData(event.target.checked);
    };

    const availabletypes = fietsenstallingen.reduce((acc: string[], parkingdata: fietsenstallingen) => {
        const type = parkingdata.Type || "unknown";
        if (!acc.includes(type)) {
            acc.push(type);
        }
        return acc;
    }, []);

    return (
        <div className="flex h-screen flex-col border-green-400">
            <div className="flex flex-row mb-4 justify-between items-center">
                <div className="flex space-x-4 w-full">
                    <select
                        value={selectedReport}
                        onChange={handleReportSelection}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="" disabled>Select Report</option>
                        <option value="openclose">Open/Closing times</option>
                        <option value="baddata">Test for Bad Data</option>
                        <option value="stallingstegoed">Stallingstegoed</option>
                        {/* Add more options as needed */}
                    </select>

                    <select
                        value={filterType}
                        onChange={handleFilterTypeChange}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="">All Types</option>
                        {availabletypes.map((type: string) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <select
                        value={isNs}
                        onChange={handleIsNsChange}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="all">NS + Non-NS</option>
                        <option value="true">NS</option>
                        <option value="false">Non-NS</option>
                    </select>

                    <input
                        type="datetime-local"
                        value={filterDateTime}
                        onChange={handleFilterDateTimeChange}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={showData}
                            onChange={handleShowDataChange}
                            className="form-checkbox h-5 w-5 text-green-600"
                        />
                        <span className="text-gray-700">Show Data</span>
                    </label>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Download as CSV
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center">
                    <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            )}
            {!loading && reportContent &&
                <div className="overflow-auto">
                    <ReportTable reportContent={reportContent} />
                </div>}
        </div>
    );
};

export default Report;
