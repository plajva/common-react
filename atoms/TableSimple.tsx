import { useTheme } from '@common/atoms/Theme';
import { cnf } from '@common/utils';
import React from 'react';
import { Cell, Column, PluginHook, Row, TableOptions, useExpanded, UseExpandedHooks, useTable } from 'react-table';
import v from 'voca';
import s from './TableSimple.module.scss';

/**
 * A quick column maker
 * @param cols A string for colums in the form of 'accessor/Header, Header, Cell; ...'
 * @example columnsQuick('rxcui;name;strength;route;')
 */
export const columnsQuick = <D extends object = {}>(...cols: (string | Column<D>)[]) => {
	const transform = (s: string) => {
		const a = s.split(',');
		let col: Column<D> = {
			accessor: a[0] as any,
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
	}, [] as Column<D>[]);

	return j;
	// }, [cols])
};

export interface TableSimpleProps<D extends object = {}> {
	// children?: ReactNode | undefined;
	options: TableOptions<D> & { [k: string]: any };
	tableProps?: any;
	tableBodyProps?: any;
	rowProps?: (v: Row) => any;
	cellProps?: (v: Cell) => any;
	plugins?: Array<PluginHook<D>>;
}

export const TableSimple = <D extends object = {}>({
	options,
	tableBodyProps,
	tableProps,
	rowProps,
	cellProps,
	className,
	plugins,
	...props
}: TableSimpleProps<D> & React.HTMLAttributes<HTMLTableElement>) => {
	// Use the state and functions returned from useTable to build your UI
	const { getTableProps, getTableBodyProps, state, headerGroups, rows, prepareRow } = useTable<D>(
		options,
		...(plugins ?? [])
	);

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
								return <td {...{ ...cell.getCellProps(), ...callProps(cellProps, cell) }}>{cell.render('Cell')}</td>;
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default TableSimple;
