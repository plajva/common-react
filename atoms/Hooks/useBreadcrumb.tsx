import { isUUID } from "@common/utils";
import { useLocation } from "react-router-dom";

export const useBreadcumb = () => {
	const loc = useLocation();
	const loc_base = loc.pathname
		// Remove first part
		.replace(/.*(portal\/)/, (v, portal) => '')
		// Make dashes and _ spaces
		.replace(/[-_]/g, ' ')
		// Remove empties
		.split('/')
		.map(v=>{let l = v.trim(); if(isUUID(l))l='ID';return l;})
		.filter(v=>!!v)
		.join('/')
		// Capitalize first letter of words
		.replace(/\b[a-z0-9-_]+/gi, (v) => v[0].toUpperCase() + v.slice(1));
	const locCrumb = loc_base
		// Replace / with - :)
		.replace(/\//g, ' - ');
	const locName = loc_base
		// Added positive lookahead so it won't eat last value
		.replace(/.*\/(?=\w+)(?!ID$)/g, '')
		.replace(/\//g, ' ');
	return {locName,locCrumb};
}

export default useBreadcumb;