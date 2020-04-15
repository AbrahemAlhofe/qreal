import { Dictionary } from "lodash"

const _ = require('lodash')

interface Iiterable {
    [index: string]: any
}

class Utils {
    warn = (msg: string): void => { console.log( new Error(`Qreal [WARN] : ${msg}`) ) }

    isString (str: string):boolean { return _.isString(str) && str !== '' }

    fillStart (arr: any[], chr: any =' ', length: number): any[] {
        // make array fill with < chr >
        const placeholder = _.fill( Array( length - arr.length ) , chr)
        // merge array and placeholder to make length of it what user pass
        return [ ...placeholder, ...arr ]
    }

    isFalsy (data: any): boolean {
        if ( !!data ) return false
        if ( !_.isNumber( data ) ) return true
        return false
    }

    castFunction (data: any): (value: any, key?: any) => any { return typeof data == 'function' ? data:() => data }

    merge (value: any, include: any, key: any) {
        include = this.castFunction(include)(value || {}, key || 0)

        // WARN : if include returned undefined data
        if ( !include ) { this.warn(`$include return "${ include }"`) }

        if ( _.isString( value ) ) {

            if ( _.isArray(include) ) { include = include.join('') }
            if ( _.isEmpty(include) ) { include = '' }

            value = value + _.toString( include )

        }

        if ( _.isObject( value ) ) {
            value = _.merge( value, include )
        }

        return value
    }

    parse (value: any, key: string ) {
        return (method: any, def: any) => {
            method = this.castFunction( method )(value, key)

            // if value of method is string , use method as a query to get value
            method = ( method[0] !== '@' ) ? def : _.get(value, _.trimStart(method, '@'), def)

            return method
        }
    }

    ignore ( object: any[] | Object, items: string[] ): any[] | object {
        // if [ object ] is array remove all items by value of it
        if ( _.isArray(object) ) { return _.pullAll(object, items) }
        // if [ object ] is object remove all items by keyNames of items
        if ( _.isObject(object)  ) { return _.omit(object, items) }
        return object
    }

    take ( data: Iterable<string>, argument: number | (number | object)[] ):any[] | string {
        // take only first two itmes in take argument
        const take = _.take( _.castArray(argument), 2)

        // placeholding [ take ]
        let [from, to] = this.fillStart(take, 0, 2)

        // if [ form ] attribute object get index of it if not keep it
        from = ( _.findIndex(data, from) !== -1 ) ? _.findIndex(data, from) : from

        // convert [ to ] attribute to index syntax to make it work with slice
        to = from + to + take.length - 1

        const slice = _.slice(data, from, to)

        return slice
    }

    async (
        // any data has key and value
        object: { [key: string]: any },
        middleware: ( item : any, key : string, done : (item: any, index? : string | number) => void, skip : () => void ) => void,
        // pass any data has key and value
        result: { [key: string]: any } = []): Promise<any> {
        // return promise if we need to make it await
        return new Promise(async (resolve) => {
          for (let index = 0; index < Object.keys(object).length; index += 1) {
            // get item from object with index
            let key = Object.keys(object)[index]
            let item = object[key]

            const done = ( next: Function ) => function (item: any, index?: string | number): void {
                // pass item and index what passed to done function to resolve promise
                next([ item, index as string ])
            }

            const skip = ( next: Function ) => function () {
                next([true, true, true])
            }

            // await middleware and pass item and index and done function
            const [context, keyName = key, isSkiped = false] = await new Promise(next => middleware(item, key, done(next), skip(next)))
      
            // if context and keyName equal false break for loop
            if ( isSkiped ) continue
            if ( !context && !keyName ) { break }
      
            // push context to result
            result[keyName] = context
          }
      
          // call callBack function
          resolve( result )
        })
    }

}

export default new Utils()