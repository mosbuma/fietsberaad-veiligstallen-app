import React, { useMemo } from 'react';
import { type ReportContent } from './types';
import { useTable, type Column } from 'react-table';

const ReportTable: React.FC<{ reportContent: ReportContent }> = ({ reportContent }) => {
    const data = useMemo(() => reportContent.data.records, [reportContent]);

    const columns = useMemo(() => {
        const actionColumn: Column<Record<string, any>> = {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    {reportContent.data.actions?.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => action.action(row.original)}
                            className="flex items-center justify-center px-2 py-1 border border-gray-300 rounded"
                        >
                            {action.icon ? action.icon : action.name}
                        </button>
                    ))}
                </div>
            ),
        };

        const hiddenColumns = reportContent.data.hidden || [];

        const dataColumns = reportContent.data.columns
            .filter((col) => !hiddenColumns.includes(col))
            .map((col) => ({
                Header: col,
                accessor: col,
            }));

        return [actionColumn, ...dataColumns];
    }, [reportContent]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4" > {reportContent.title}</h1 >
            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th
                                    {...column.getHeaderProps()}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                    {rows.map((row) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => (
                                    <td
                                        {...cell.getCellProps()}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div >
    );
};

export default ReportTable;
