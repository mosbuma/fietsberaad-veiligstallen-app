import type { fietsenstallingen, contacts } from "@prisma/client";
import { ReportContent } from "./types";
import { ParkingDetailsType } from "~/types";
import { createVeiligstallenOrgLink } from "~/utils/parkings";

export const createFixBadDataReport = async (fietsenstallingen: fietsenstallingen[], contacts: contacts[], showData: boolean = true): Promise<ReportContent> => {
    // Alles op een rij:
    // 1. fietsenstallingen.stallingsID: not null & unique
    // 2. fietsenstallingen.siteID: not null & foreign key naar contacts.id (is al geimplementeerd)
    // 3. fietsenstallingen.exploitantID: foreign key naar contacts.id (is al geimplementeerd)

    const alwaysvisibleColumns = [
        "Title",
        "Plaats",
        "Type",
        "OK",
        "CheckStallingsID",
        "CheckSiteID",
        "CheckExploitantID",

    ];

    const allColumns = [
        ...alwaysvisibleColumns,
        "ID",
        "StallingsID",
        "SiteID",
        "ExploitantID",
    ];

    const hiddenColumns = showData ? [] : allColumns.filter(col => !alwaysvisibleColumns.includes(col));

    const report: ReportContent = {
        title: 'Test for bad data',
        data: {
            columns: allColumns,
            records: [],
            hidden: hiddenColumns,
            actions: [
                {
                    name: "Original",
                    action: async (data) => {
                        const stalling = fietsenstallingen.find((fs) => fs.ID === data.ID) as any as ParkingDetailsType;
                        const url = await createVeiligstallenOrgLink(stalling);
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

    // make StallingID count map
    const countMap = new Map<string, number>();

    // Count occurrences of each StallingsID
    for (const stalling of fietsenstallingen) {
        if (stalling.StallingsID !== null) {
            const count = countMap.get(stalling.StallingsID) || 0;
            countMap.set(stalling.StallingsID, count + 1);
        }
    }

    fietsenstallingen.forEach((fietsenstalling: fietsenstallingen) => {
        const parkingdata = fietsenstalling as any as ParkingDetailsType;

        let checkStallingsID = null; // ok
        if (fietsenstalling.StallingsID === null) {
            checkStallingsID = <span className="font-bold bg-red-400 text-white p-2">NULL</span>
        } else {
            const count = countMap.get(fietsenstalling.StallingsID) || 0;
            if (count > 1) {
                checkStallingsID = <span className="font-bold bg-red-400 text-white p-2">DUPLICATE</span>
            }
        };

        let checkSiteID = null; // ok
        if (fietsenstalling.SiteID === null) {
            checkSiteID = <span className="font-bold bg-red-400 text-white p-2">NULL</span>
        } else {
            const thecontact = contacts.find((contact) => contact.ID === fietsenstalling.SiteID);
            if (!thecontact) {
                checkSiteID = <span className="font-bold bg-red-400 text-white p-2">NOT FOUND</span>
            }
        }


        let checkExploitantID = null; // ok
        if (fietsenstalling.ExploitantID !== null) {
            const thecontact = contacts.find((contact) => contact.ID === fietsenstalling.ExploitantID);
            if (!thecontact) {
                checkExploitantID = <span className="font-bold bg-red-400 text-white p-2">NOT FOUND</span>
            }
        }

        let fullCheck = (checkStallingsID === null && checkSiteID === null && checkExploitantID === null);

        report.data.records.push({
            "ID": parkingdata.ID,
            "Title": parkingdata.Title,
            "Plaats": parkingdata.Plaats,
            "Type": parkingdata.Type,
            "StallingsID": parkingdata.StallingsID,
            "SiteID": parkingdata.SiteID,
            "OK": fullCheck === false ? <span className="font-bold bg-red-400 text-white p-2">ERROR</span> : null,
            "ExploitantID": parkingdata.ExploitantID,
            "CheckStallingsID": checkStallingsID,
            "CheckSiteID": checkSiteID,
            "CheckExploitantID": checkExploitantID,

        });
    });

    return report;
}
