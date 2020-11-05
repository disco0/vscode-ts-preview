const toString = ({}).toString;

export function isObject(obj: unknown): obj is Object
{
    return toString.call(obj) === "[object Object]"
}
export function isFunction<T extends (...args: any[]) => any>(obj: unknown): obj is T
{
    return toString.call(obj) === "[object Function]"
}
export function isString(obj: unknown): obj is string 
{
    return toString.call(obj) === "[object String]"
}
export function isNumber(obj: unknown): obj is number 
{
    return toString.call(obj) === "[object Number]"
}
export function isDate(obj: unknown): obj is Date 
{
    return toString.call(obj) === "[object Date]"
}
export function isRegExp(obj: unknown): obj is RegExp 
{
    return toString.call(obj) === "[object RegExp]"
}

export const is =
{
    Function: isFunction,
    Object:   isObject,
    String:   isString,
    Number:   isNumber,
    Date:     isDate,
    RegExp:   isRegExp
}

export default is;
