export interface Query {
    $take: (object | number)[] | number;
    $ignore: string[];
    $keyName: string | Function;
    $include(value: any, key: number | string): object;
    $value: string | Function;
    $attrs?: string;
}
declare class Qreal {
    middlewares: {};
    constructor();
    pass(key: string | number, data: any, parentObject: any, query: any): Promise<any>;
    use(key: string, middleware: (data: any, object: {
        [key: string]: any;
    }, done: (item: any, index?: string) => void, query: Query) => void): void;
    run(data: Array<any>, structure: Query | {
        [key: string]: Query;
    }): Promise<any>;
}
export default Qreal;
