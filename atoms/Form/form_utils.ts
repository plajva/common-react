import accounting from 'accounting';
import { round } from 'lodash';
import { toUpperCaseFirst } from '../../utils';
import { _FieldProps } from './Field';
import { UseFormFieldOptions } from './Form';

/**
 * A string replacer, use {0}, {1} etc.. for replacement
 * A special argument {}? can be used in case any of the values iside the brackets hasn't been replaced yet, it'll remove the expression
 * @example string_format('{0} is{ {1}}? a monkey', 'Joe') => 'Joe is a mokey'
 * string_format('{0} is{ {1}}? a monkey', 'Joe', 'not') => 'Joe is not a mokey'
 * @param s the string to format
 * @param args the arguments to be filled
 * @returns
 */
export const string_format = function (s: string, ...args) {
	return (
		s
			// Replacing {0} and {1} with their values in args array.
			.replace(/{(\d+)}/g, function (match, number) {
				return typeof args[number] != 'undefined' ? args[number] : match;
			})
			// Removing non-matched values
			.replace(/{(.*{\d+}.*)}\?/g, '') // removing '{ {1}}?' in  'Joe is{ {1}}? a monkey' -> 'Joe is a monkey'
			// Removing matched values
			.replace(/{(.*)}\?/g, (match, val) => val) // removing '{}?' in 'Joe is{ not}? a monkey' -> 'Joe is not a monkey'
	);
};

export const regex_dict = {
	name: /.*[^ ]+.*/g,
	phone: /^\+?(\d{0,3})?[-. (]*(\d{3})[()-. ]*(\d{3})[()-. ]*(\d{4})$/,
	ssn: /^[-. ]*(\d{3})[-. ]*(\d{2})[-. ]*(\d{4})[-. ]*$/,
	card_number:
		/^(?:[ -]*(?<visa>4\d{12}\d{3}?)|(?<mastercard>5[1-5]\d{14})|(?<discover>6(?:011|5\d{2})\d{12})|(?<amex>3[47]\d{13})|(?<diners>3(?:0[0-5]|[68]\d)\d{11})|(?<jcb>(?:2131|1800|35\d{3})\d{11})[ -]*)$/,
	card_expiration: /^[^\d]*(0?\d|1[0-2])[/\- ]+(\d{4}|\d{2})[^\d]*$/,
	card_cvv: /^[^\d]*(\d{3,4})[^\d]*$/,
};

// const sd = (s, f: (s) => string, sdef?) => (s || typeof sdef != 'undefined' ? f(s || sdef) : '');
export const regexFormat = (regex: RegExp, input: string, format: string) => {
	const g = regex.exec(input);
	if (g) {
		g.shift();
		return string_format(format, ...g);
	}
	return input;
};
export const field_utils =
	// : {[key: string]: (UseFormFieldOptions & _FieldProps) | ((...l) => UseFormFieldOptions & _FieldProps);}
	{
		phone: {
			toFormBlur: (e, v?: string) => {
				return v && (regexFormat(regex_dict.phone, v, '{+{0} }?({1})-{2}-{3}') || v);

				// const g = regex_dict.phoneRegex.exec(v);
				// if (g) {
				// 	console.log(g);
				// 	let i = 1;
				// 	const nv = `${sd(g[i++], (s) => `+${s} `)}${sd(g[i++], (s) => `(${s})-`)}${sd(g[i++], (s) => `${s}-`)}${sd(
				// 		g[i++],
				// 		(s) => `${s}`
				// 	)}`;
				// 	console.log(nv);
				// 	return nv;
				// }
			},
		},
		ssn: {
			toFormBlur: (e, v?: string) => {
				return v && regexFormat(regex_dict.ssn, v, '{0}-{1}-{2}');
			},
		},
		card_number: {
			toForm: (e, v) => (typeof v === 'string' ? v.replace(/[^\d]+/g, '') : v),
			labelBottom: (v) => {
				if (typeof v === 'string') {
					const match = regex_dict.card_number.exec(v);
					if (match?.groups) {
						// console.log(JSON.stringify(match.groups));
						const validGroup = Object.entries(match.groups).find(([k, v]) => typeof v !== 'undefined');
						if (validGroup) {
							return toUpperCaseFirst(validGroup[0]);
						}
					}
				}
			},
		},
		card_expiration: {
			toFormBlur: (e, v?: string) => {
				return v && regexFormat(regex_dict.card_expiration, v, '{0}/{1}');
			},
		},
		card_cvv: {
			toFormBlur: (e, v?: string) => {
				return v && regexFormat(regex_dict.card_cvv, v, '{0}');
			},
		},
		money: {
			// toForm: (e,v) => String(v),
			toFormBlur: (e, v) => (typeof v === 'string' ? (v.length ? accounting.unformat(v) : undefined) : v),
			fromForm: (v) => (typeof v === 'number' ? accounting.formatMoney(v) : v),
		},
		moneyFunc: (precision?: number) => ({
			toFormBlur: (e, v) => (typeof v === 'string' ? (v.length ? accounting.unformat(v) : undefined) : v),
			fromForm: (v) => (typeof v === 'number' ? accounting.formatMoney(v, undefined, precision) : v),
		}),
		// money_format: () => ({
		//     toForm: (e, v) => (typeof v === 'string' ? (v.length?accounting.unformat(v):undefined) : v),
		//     fromForm: (v) => (typeof v === 'number' ? (accounting.formatMoney(v, undefined,0)) : v),
		// }),
		integer: {
			toForm: (e, v) => (typeof v === 'string' ? Number(v.replace(/[^\d]+/g, '')) : v),
			fromForm: (v) => (typeof v === 'number' ? `${v}` : v),
		},
		numberFunc: (precision?: number) => ({
			toFormBlur: (e, v) => (typeof v === 'string' ? round(Number(v.replace(/[^\d.]+/g, '')), precision) : v),
			fromForm: (v) => (typeof v === 'number' ? `${v}` : v),
		}),
	};
