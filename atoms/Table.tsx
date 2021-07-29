import React, { FunctionComponent, useEffect, useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { Cell, Column, ColumnInstance, HeaderGroup, Row, usePagination, useTable } from 'react-table';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { classNameFind } from '../utils';
import s from './Table.module.scss';
import { useTheme } from './Theme';

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
        } as any;
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

export interface OnChangePaginationProps {
    pageSize: number;
    pageNumber: number;
}

// Pagination Props
export interface PaginationProps {
    pageCount: number;
    recordCount: number;
    onChange?: (changes: OnChangePaginationProps) => void;
}

export interface TableProps<D extends {}> {
    options: any;
    emptyMessage?: React.ReactNode | String;
    pagination?: PaginationProps;
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
    const [init, setInit] = useState(false);

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
        !init && setInit(true);
    }, [pageIndex]);

    useEffect(() => {
        if (init)
            if (pageIndex === 0) {
                fetchData && fetchData({ pageIndex: 0, pageSize });
            } else {
                gotoPage && gotoPage(0);
            }
        if (pagination?.onChange) {
            pagination.onChange({ pageNumber: pageIndex + 1, pageSize });
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
                                {headerGroup.headers.map((column: any) => {
                                    let cls = column['className'] ?? '';
                                    if (!!column.sticky)
                                        cls += ' ' + classNameFind(s, 'sticky', `sticky-${column.sticky}`, theme);
                                    return (
                                        <th
                                            {...column.getHeaderProps([
                                                {
                                                    className: cls,
                                                    style: column['style'],
                                                },
                                                _getColumnProps(column),
                                                _getHeaderProps(column),
                                            ])}
                                        >
                                            {column.render('Header')}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.map((row: any, i: Number) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map((cell: any) => {
                                        let cls = cell['className'] ?? '';
                                        if (!!cell.column.sticky) {
                                            cls +=
                                                ' ' + classNameFind(s, 'sticky', `sticky-${cell.column.sticky}`, theme);
                                        }

                                        return (
                                            <td
                                                {...cell.getCellProps([
                                                    {
                                                        className: cls,
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
                                <td colSpan={100}>{emptyMessage}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {pagination && (
                <div className='margin-top-2' style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                        {/* <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => gotoPage(0)}
                            disabled={!(pageIndex !== 0)}
                        >
                            <Icon icon={FaAngleDoubleLeft} />
                        </Button> */}
                        <div style={{ lineHeight: '2em', margin: 'auto 0.5em' }}>
                            <em>
                                {page.length === 0 ? 0 : pageIndex * pageSize + 1}
                                {' - '}
                                {page.length + pageIndex * pageSize}
                                {' of '}
                                {pagination.recordCount}
                            </em>
                        </div>
                        <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                        >
                            <Icon icon={FaAngleLeft} />
                        </Button>
                        <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                        >
                            <Icon icon={FaAngleRight} />
                        </Button>
                        {/* <Button
                            className='outline'
                            button_type='icon'
                            onClick={() => gotoPage(pagination.pageCount - 1)}
                            disabled={!(pageIndex !== pagination.pageCount - 1 && pagination.pageCount > 0)}
                        >
                            <Icon icon={FaAngleDoubleRight} />
                        </Button> */}
                    </div>
                    <div style={{ float: 'right' }}>
                        <select
                            className={classNameFind(s, 'per-page', theme)}
                            style={{ height: '2em', marginRight: '1em', width: 'auto' }}
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
