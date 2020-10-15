
import * as dateFns from 'date-fns';
import { TableColumn } from '../../models/general-models';

export const NUMBER_FORMAT: any = (v: any, r?: any, c?: any) => v.toLocaleString();
export const CURRENCY_FORMAT: any = (v: any, r?: any, c?: any) => 'PKR ' + v.toFixed(1);
export const DECIMAL_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : v.toFixed(2);
export const DECIMAL_FORMAT1: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : v.toFixed(1);
export const BOOLEAN_FORMAT: any = (v: any, r?: any, c?: any) => (v == null || v <= 0) ? 'No' : 'Yes';
export const PERCENT_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (v + '%');
export const DATE_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'dd-MMM-yyyy'));
export const DATE_ABBR_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'dd - MM - yyyy'));
export const DATETIME_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'dd-MMM-yyy hh:mm a'));
export const DATETIME_24HR_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'dd-MMM-yyyy hh:mm:ss'));
export const TIME_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'hh:mm:ss a'));
export const TIME_FORMAT_12: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'hh:mm a'));
export const TIME_FORMAT_24: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'HH:mm'));
export const DURATION_FORMAT: any = (v: any, r?: any) => v == null ? '' : formatDuration(v);
export const DATE_DIFF: any = (v: any, r?: any) => v == null ? '' : calculateDiff(v);
export const DATE_MONTH_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'MMM'));
export const DATE_YEAR_FORMAT: any = (v: any, r?: any, c?: any) => (v == null) ? 'N/A' : (dateFns.format(v*1000, 'yyyy'));

export const LOCATION_FORMAT: any = (v: any, r?: any, c?: any) => (v == null || v === '') ?
        '<img title="No Location" src="/assets/images/marker-inactive.png" class="col-small-image">' : '<img alt="image" title="Click to view" src="/assets/images/marker-inactive.png" class="col-small-image">';
export const IMAGE_FORMAT: any = (v: any, r?: any, c?: any) => (v == null || v === '') ?
        '<img title="No Image" src="/assets/images/no_image.png" class="col-small-image">' : '<img alt="image" title="Click to view" src="' + v + '" class="col-small-image">';

export const PERSON_IMAGE_FORMAT: any = (v: any, r?: any, c?: any) => (v == null || v === '') ?
    '<img title="No Image" src="/assets/images/avatar.jpg" class="col-small-image">' : '<img alt="image" title="Click to view" src="' + v + '" class="col-small-image">';

function formatDuration(val) {
    // tslint:disable-next-line:variable-name
    const sec_num = parseInt(val, 10); // don't forget the second param

    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);

    // tslint:disable-next-line:one-variable-per-declaration
    let h, m, s;
    if (hours   < 10) { h = '0' + hours;   } else {h = hours;   }
    if (minutes < 10) { m = '0' + minutes; } else {m = minutes; }
    if (seconds < 10) { s = '0' + seconds; } else {s = seconds; }

    return h + ':' + m + ':' + s;
}
function calculateDiff(val){
   const weeks = dateFns.differenceInWeeks(val*1000, dateFns.startOfDay(new Date()))
   const months = dateFns.differenceInMonths(val*1000, dateFns.startOfDay(new Date()))
   const days = dateFns.differenceInDays(val*1000, dateFns.startOfDay(new Date()))
   if (months > 0) return ('in ' + months + ' Months');
   if (weeks > 0) return ('in ' + weeks + ' Weeks');
   if (days > 0) return ('in ' + days + ' Days');

}

function combine_vals(v: any, r?: any, c?: TableColumn)
{
    let str = v;

    // tslint:disable-next-line:prefer-for-of
    for (let i=0; i<c.combine.length; i++)
    {
        str += ' ' + r[c.combine[i]];
    }

    return str;
}

function make_number(v: any, r?: any, c?: any)
{
    const d = new Date(r.date_added * 1000);

    let str = dateFns.format(d, 'YY')
    const n = '00000000' + v;

    str = c.prefix + str + n.substr(n.length - 6);

    return str;
}

export const COMBINE_FORMAT: any = (v: any, r?: any, c?: any) => combine_vals(v, r, c);
export const SERIAL_FORMAT: any = (v: any, r?: any, c?: any) => make_number(v, r, c);

export const FORMATS = {
    image: IMAGE_FORMAT,
    person_image: PERSON_IMAGE_FORMAT,
    date: DATE_FORMAT,
    date_abbr: DATE_ABBR_FORMAT,
    date_diff: DATE_DIFF,
    datetime: DATETIME_FORMAT,
    datetime_24hr: DATETIME_24HR_FORMAT,
    time: TIME_FORMAT,
    time_12: TIME_FORMAT_12,
    time_24: TIME_FORMAT_24,
    bool: BOOLEAN_FORMAT,
    location: LOCATION_FORMAT,
    number: NUMBER_FORMAT,
    currency: CURRENCY_FORMAT,
    decimal: DECIMAL_FORMAT,
    decimal1: DECIMAL_FORMAT1,
    duration: DURATION_FORMAT,
    percent: PERCENT_FORMAT,
    combine: COMBINE_FORMAT,
    serial: SERIAL_FORMAT,
    month: DATE_MONTH_FORMAT,
    year: DATE_YEAR_FORMAT,
};
