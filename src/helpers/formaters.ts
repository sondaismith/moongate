/**
 * Takes an array of strings and returns a new string with all the items
 * joined separated with commas, with the format "A, B and C".
 */
export function ArrToString(arr:string[]):string{
    if(arr.length == 0) return '';
    if (arr.length === 1) return arr[0];
    const firsts = arr.slice(0, arr.length - 1);
    const last = arr[arr.length - 1];
    return firsts.join(', ') + ' and ' + last;
}