import React, { FunctionComponent, useContext } from 'react';
import s from './Table.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import { TableOptions, HeaderGroup, useTable, Row, Cell, ColumnInstance, Column } from 'react-table';

// Create a default prop getter
const defaultPropGetter = () => ({});

/**
 * A quick column maker
 * @param cols A string for colums in the form of 'accessor/Header, Header, Cell; ...'
 * @example columnsQuick('rxcui;name;strength;route;')
 */
export const columnsQuick = (cols: string) => {
    const transform = (s: string): Column<{}> | { [index: string]: any } => {
        const a = s.split(',');
        let col = {
            accessor: a[0],
            Header: a[1] || a[0],
        };
        if (a[2]) col['Cell'] = a[2];
        return col;
    };
    // return React.useMemo(() => {
    const j = cols
        .split(';')
        .filter((s) => s)
        .map(transform);
    return j;
    // }, [cols])
};

export interface TableProps<D extends {}> {
    options: any;
    getHeaderProps?: (s?: HeaderGroup<D>) => object;
    getColumnProps?: (s?: HeaderGroup<D> | ColumnInstance<D>) => object;
    getRowProps?: (s?: Row<D>) => object;
    getCellProps?: (s?: Cell<D>) => object;
}

const Table: FunctionComponent<TableProps<{}> & React.HTMLAttributes<HTMLDivElement>> = ({
    getHeaderProps,
    getColumnProps,
    getRowProps,
    getCellProps,
    className,
    options,
    children,
    ..._props
}) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, theme, className);

    const _getHeaderProps = getHeaderProps || defaultPropGetter,
        _getColumnProps = getColumnProps || defaultPropGetter,
        _getRowProps = getRowProps || defaultPropGetter,
        _getCellProps = getCellProps || defaultPropGetter;

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(options);

    // Render the UI for your table
    return (
        <table {...getTableProps({ className: className, style: _props.style })}>
            <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th
                                {...column.getHeaderProps([
                                    {
                                        className: column['className'],
                                        style: column['style'],
                                    },
                                    _getColumnProps(column),
                                    _getHeaderProps(column),
                                ])}
                            >
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                                return (
                                    <td
                                        {...cell.getCellProps([
                                            {
                                                className: cell['className'],
                                                style: cell['style'],
                                            },
                                            _getColumnProps(cell.column),
                                            _getCellProps(cell),
                                        ])}
                                    >
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

export default Table;
