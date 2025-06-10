import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
  options?: {
    hideHeaders?: boolean;
  };
}

export function Table<T>({ columns, data, className = '', onRowClick, options = {} }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full bg-white ${className}`}>
        {!options.hideHeaders && <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={`py-2 px-4 text-left ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>}
        <tbody>
          {data.map((item, rowIndex) => (
            <tr 
              key={rowIndex}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`border px-4 py-2 ${column.className || ''}`}
                >
                  {typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : String(item[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 