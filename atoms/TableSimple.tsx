import { useTheme } from '@common/atoms/Theme';
import { cnf } from '@common/utils';
import React from 'react';
import { Cell, Column, Row, TableOptions, useTable } from 'react-table';
import v from 'voca';
import s from './TableSimple.module.scss';

/**
 * A quick column maker
 * @param cols A string for colums in the form of 'accessor/Header, Header, Cell; ...'
 * @example columnsQuick('rxcui;name;strength;route;')
 */
export const columnsQuick = (...cols: (string | Column)[]) => {
    const transform = (s: string) => {
        const a = s.split(',');
        let col: Column = {
            accessor: a[0],
            Header: a[1] || v.capitalize(a[0]),
        };
        if (a[2]) col['Cell'] = a[2];
        return col;
    };
    // return React.useMemo(() => {
    const j = cols.reduce((a, v) => {
        if (typeof v === 'string') {
            a.push(
                ...v
                    .split(';')
                    .filter((s) => s.match(/[^ ]+/)?.length)
                    .map(transform)
            );
        } else {
            a.push(v);
        }
        return a;
    }, [] as Column[]);

    return j;
    // }, [cols])
};

export interface TableSimpleProps {
    // children?: ReactNode | undefined;
    options: TableOptions<{}>;
    tableProps?: any;
    tableBodyProps?: any;
    rowProps?: (v: Row) => any;
    cellProps?: (v: Cell) => any;
}

export const TableSimple = ({
    options,
    tableBodyProps,
    tableProps,
    rowProps,
    cellProps,
    className,
    ...props
}: TableSimpleProps & React.HTMLAttributes<HTMLTableElement>) => {
    // Use the state and functions returned from useTable to build your UI
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(options);

    const theme = useTheme().name;
    className = cnf(s, `comp`, theme, className);

    const callProps = (p, v?) => (typeof p === 'function' ? p(v) : p);
    // Render the UI for your table
    return (
        <table {...{ ...getTableProps(), ...tableProps }} className={className} {...props}>
            <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...{ ...getTableBodyProps(), ...callProps(tableBodyProps) }}>
                {rows.map((row, i) => {
                    prepareRow(row);
                    return (
                        <tr {...{ ...row.getRowProps(), ...callProps(rowProps, row) }}>
                            {row.cells.map((cell) => {
                                return (
                                    <td {...{ ...cell.getCellProps(), ...callProps(cellProps, cell) }}>
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default TableSimple;
