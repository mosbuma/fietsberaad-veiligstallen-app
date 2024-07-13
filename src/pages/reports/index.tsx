import React, { useRef, useState, useEffect } from "react";
import { NextPage } from "next/types";
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import type { fietsenstallingen } from "@prisma/client";
import moment from "moment";
import { formatOpeningTimes, formatOpeningToday, createVeilistallenOrgLink } from "~/utils/parkings-openclose";

import { getParkingsFromDatabase } from "~/utils/prisma";

import ReportTable, { type ReportContent } from "~/utils/report-table";
import { ParkingDetailsType } from "~/types";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
        const session = await getServerSession(context.req, context.res, authOptions)
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

const noReport: ReportContent = {
    title: "No report",
    data: { columns: [], records: [], actions: [], hidden: [] }
}

const createOpeningTimesReport = (fietsenstallingen: fietsenstallingen[], timestamp: moment.Moment, showData: boolean): ReportContent => {
    const alwaysvisibleColumns = [
        "Title",
        "Plaats",
        "Type",
        "isNs",
        "txt_ma",
        "txt_di",
        "txt_wo",
        "txt_do",
        "txt_vr",
        "txt_za",
        "txt_zo",
        "txt_today"
    ];

    const allColumns = [
        ...alwaysvisibleColumns,
        "ID",
        "Open_ma",
        "Dicht_ma",
        "Open_di",
        "Dicht_di",
        "Open_wo",
        "Dicht_wo",
        "Open_do",
        "Dicht_do",
        "Open_vr",
        "Dicht_vr",
        "Open_za",
        "Dicht_za",
        "Open_zo",
        "Dicht_zo",
        "Openingstijden",
        "EditorCreated"
    ];

    const hiddenColumns = showData ? [] : allColumns.filter(col => !alwaysvisibleColumns.includes(col));

    const report: ReportContent = {
        title: 'Opening/Closing times',
        data: {
            columns: allColumns,
            records: [],
            hidden: hiddenColumns,
            actions: [
                {
                    name: "Original",
                    action: async (data) => {
                        const stalling = fietsenstallingen.find((fs) => fs.ID === data.ID) as any as ParkingDetailsType;
                        const url = await createVeilistallenOrgLink(stalling);
                        window.open(url, '_blank');
                    },
                    icon: (<svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 4.5C7 4.5 3.75 7.5 2 12C3.75 16.5 7 19.5 12 19.5C17 19.5 20.25 16.5 22 12C20.25 7.5 17 4.5 12 4.5ZM12 17.5C9.5 17.5 7.5 15.5 7.5 13C7.5 10.5 9.5 8.5 12 8.5C14.5 8.5 16.5 10.5 16.5 13C16.5 15.5 14.5 17.5 12 17.5ZM12 11C11.17 11 10.5 11.67 10.5 12.5C10.5 13.33 11.17 14 12 14C12.83 14 13.5 13.33 13.5 12.5C13.5 11.67 12.83 11 12 11Z"
                            fill="black"
                        />
                    </svg>)
                },
                {
                    name: "Edit",
                    action: async (data) => {
                        const stalling = fietsenstallingen.find((fs) => fs.ID === data.ID) as any as ParkingDetailsType;
                        const url = `/?stallingid=${stalling.ID}`;
                        window.open(url, '_blank');
                    },
                    icon: (<svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M14.06 2.94a1.5 1.5 0 0 1 2.12 0l1.88 1.88a1.5 1.5 0 0 1 0 2.12L7.5 17.5H4v-3.5L14.06 2.94ZM4 19.5h16v2H4v-2Z"
                            fill="black"
                        />
                    </svg>)
                },
            ]
        },
    };

    const formatUtcTime = (dbtime: Date | null) => {
        if (null === dbtime) {
            return "null"
        } else {
            return moment.utc(dbtime).format('HH:mm');
        }
    }

    fietsenstallingen.forEach((fietsenstalling: fietsenstallingen) => {
        const parkingdata = fietsenstalling as any as ParkingDetailsType;
        const isNS = parkingdata.EditorCreated === "NS-connector"
        const wkday = timestamp.day();

        report.data.records.push({
            "ID": parkingdata.ID,
            "Title": parkingdata.Title,
            "Plaats": parkingdata.Plaats,
            "Type": parkingdata.Type,
            "isNs": isNS ? "NS" : "",
            "txt_ma": formatOpeningTimes(parkingdata, "ma", "Maandag", wkday === 1, isNS),
            "txt_di": formatOpeningTimes(parkingdata, "di", "Dinsdag", wkday === 2, isNS),
            "txt_wo": formatOpeningTimes(parkingdata, "wo", "Woensdag", wkday === 3, isNS),
            "txt_do": formatOpeningTimes(parkingdata, "do", "Donderdag", wkday === 4, isNS),
            "txt_vr": formatOpeningTimes(parkingdata, "vr", "Vrijdag", wkday === 5, isNS),
            "txt_za": formatOpeningTimes(parkingdata, "za", "Zaterdag", wkday === 6, isNS),
            "txt_zo": formatOpeningTimes(parkingdata, "zo", "Zondag", wkday === 0, isNS),
            "txt_today": formatOpeningToday(parkingdata, timestamp).message,
            "Open_ma": formatUtcTime(parkingdata.Open_ma),
            "Dicht_ma": formatUtcTime(parkingdata.Dicht_ma),
            "Open_di": formatUtcTime(parkingdata.Open_di),
            "Dicht_di": formatUtcTime(parkingdata.Dicht_di),
            "Open_wo": formatUtcTime(parkingdata.Open_wo),
            "Dicht_wo": formatUtcTime(parkingdata.Dicht_wo),
            "Open_do": formatUtcTime(parkingdata.Open_do),
            "Dicht_do": formatUtcTime(parkingdata.Dicht_do),
            "Open_vr": formatUtcTime(parkingdata.Open_vr),
            "Dicht_vr": formatUtcTime(parkingdata.Dicht_vr),
            "Open_za": formatUtcTime(parkingdata.Open_za),
            "Dicht_za": formatUtcTime(parkingdata.Dicht_za),
            "Open_zo": formatUtcTime(parkingdata.Open_zo),
            "Dicht_zo": formatUtcTime(parkingdata.Dicht_zo),
            "Openingstijden": parkingdata.Openingstijden,
            "EditorCreated": parkingdata.EditorCreated,
        });
    });

    return report;
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
        selectedReport: '',
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

    const abortController = useRef<AbortController | null>(null);

    useEffect(() => {
        setSelectedReport('openclose');
    }, [fietsenstallingen]);

    useEffect(() => {
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

                setLoading(true);
                if (abortController.current) {
                    abortController.current.abort();
                }
                abortController.current = new AbortController();
                const signal = abortController.current.signal;

                setTimeout(() => {
                    if (signal.aborted) return;

                    const filtered = fietsenstallingen.filter((parkingdata: fietsenstallingen) => {
                        return (filterType === '' || parkingdata.Type === filterType) &&
                            (isNs === 'all' || (isNs === 'true' && parkingdata.EditorCreated === "NS-connector") || (isNs === 'false' && parkingdata.EditorCreated !== "NS-connector"));
                    });

                    setReportContent(createOpeningTimesReport(filtered, moment(filterDateTime), showData));
                    setLoading(false);
                }, 500);
                break;
            default:
                break;
        }
    }, [selectedReport, filterType, isNs, filterDateTime, showData]);


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
