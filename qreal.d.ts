export interface Query {
    $take: (object | number)[] | number;
    $ignore: string[];
    $keyName: string | Function;
    $include(value: any, key: number | string): object;
    $value: string | Function;
    $attrs?: string;
}
declare function qreal(data: Array<any>, structure: Query | {
    [key: string]: Query;
}): Promise<any[]>;
declare namespace qreal {
    var middlewares: {};
    var pass: (key: string | number, data: any, parentObject: any, query: any) => Promise<any>;
    var use: (key: string, middleware: (data: any, object: {
        [key: string]: any;
    }, done: (item: any, index?: string | undefined) => void, query: Query) => void) => void;
}
export default qreal;
