import { useTheme } from '@catoms/Theme';
import Button from '@common/atoms/Button';
import Icon from '@common/atoms/Icon';
import { classNameFind } from '@common/utils';
import React, { FunctionComponent, useEffect } from 'react';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { Cell, Column, ColumnInstance, HeaderGroup, Row, usePagination, useTable } from 'react-table';
import s from './Table.module.scss';

// Create a default prop getter
const defaultPropGetter = () => ({});

const amountsPerPage = [10, 50, 100];
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
    emptyMessage?: React.ReactNode | String;
    pagination?: boolean;
    compact?: Boolean;
    getHeaderProps?: (s?: HeaderGroup<D>) => object;
    getColumnProps?: (s?: HeaderGroup<D> | ColumnInstance<D>) => object;
    getRowProps?: (s?: Row<D>) => object;
    getCellProps?: (s?: Cell<D>) => object;
    filters?: any;
    fetchData?: Function;
}

const Table: FunctionComponent<TableProps<{}> & React.HTMLAttributes<HTMLDivElement>> = ({
    getHeaderProps,
    getColumnProps,
    getRowProps,
    getCellProps,
    className,
    options,
    emptyMessage,
    compact,
    filters,
    fetchData,
    pagination,
    children,
    ..._props
}) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, compact ? `small` : '', theme, className);

    const _getHeaderProps = getHeaderProps || defaultPropGetter,
        _getColumnProps = getColumnProps || defaultPropGetter,
        _getRowProps = getRowProps || defaultPropGetter,
        _getCellProps = getCellProps || defaultPropGetter;

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,

        page,
        canPreviousPage,
        canNextPage,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        // Get the state from the instance
        state: { pageIndex, pageSize },
    } = useTable({ ...options }, usePagination) as any;

    useEffect(() => {
        fetchData && fetchData({ pageIndex, pageSize });
    }, [pageIndex]);

    useEffect(() => {
        if (pageCount > 0)
            if (pageIndex === 0) {
                fetchData && fetchData({ pageIndex: 0, pageSize });
            } else {
                gotoPage && gotoPage(0);
            }
    }, [filters, pageSize]);

    // Render the UI for your table
    return (
        <>
            <div className={classNameFind(s, `responsive`, theme)}>
                <table {...getTableProps({ className: className, style: _props.style })}>
                    <thead>
                        {headerGroups.map((headerGroup: any) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column: any) => (
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
                        {page.map((row: any, i: Number) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map((cell: any) => {
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
                        {page.length < 1 && (
                            <tr>
                                <td colSpan={6}>{emptyMessage}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {pagination && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                        <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => gotoPage(0)}
                            disabled={!(pageIndex !== 0)}
                        >
                            <Icon icon={FaAngleDoubleLeft} />
                        </Button>
                        <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                        >
                            <Icon icon={FaAngleLeft} />
                        </Button>
                        <div style={{ lineHeight: '2em', margin: 'auto 0.5em' }}>
                            Page{' '}
                            <em>
                                {pageCount > 0 ? pageIndex + 1 : 0} of {pageCount}
                            </em>
                        </div>
                        <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                        >
                            <Icon icon={FaAngleRight} />
                        </Button>
                        <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => gotoPage(pageCount - 1)}
                            disabled={!(pageIndex !== pageCount - 1 && pageCount > 0)}
                        >
                            <Icon icon={FaAngleDoubleRight} />
                        </Button>
                    </div>
                    <div style={{ float: 'right' }}>
                        <select
                            style={{ height: '2em', marginRight: '1em' }}
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                            }}
                        >
                            {amountsPerPage.map((pageSize: any) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                        items per page
                    </div>
                </div>
            )}
        </>
    );
};

export default Table;
