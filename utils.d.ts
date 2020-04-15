declare class Utils {
    warn: (msg: string) => void;
    isString(str: string): boolean;
    fillStart(arr: any[], chr: any, length: number): any[];
    isFalsy(data: any): boolean;
    castFunction(data: any): (value: any, key?: any) => any;
    merge(value: any, include: any, key: any): any;
    parse(value: any, key: string): (method: any, def: any) => any;
    ignore(object: any[] | Object, items: string[]): any[] | object;
    take(data: Iterable<string>, argument: number | (number | object)[]): any[] | string;
    async(object: {
        [key: string]: any;
    }, middleware: (item: any, key: string, done: (item: any, index?: string | number) => void, skip: () => void) => void, result?: {
        [key: string]: any;
    }): Promise<any>;
}
declare const _default: Utils;
export default _default;
