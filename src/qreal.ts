// if we are in node js enviroment require lodash
import _ from "lodash";

import utils from './utils'

export interface Query {
  $take : (object | number)[] | number;

  $ignore : string[];

  $keyName : string | Function;

  $include (value: any, key: number | string): object;

  $value : string  | Function;

  $attrs? : string // this query for qlink
}

function qreal ( data: Array<any>, structure: Query | { [key: string]: Query }): Promise< any[] > {
  // cast data if it does not array
  if ( typeof data !== 'string' ) data = _.castArray(data)

  if ( data.length === 0 ) {
    return new Promise( res => res([]) )
  }

  // assign value of methods in structure to default methods
  const methods: Query = _.assign({
    $take : data.length,
    $ignore : [],
    $include : () => ({}),
    $keyName : '@',
    $value : '@'
  }, structure)

  // resize data before restructure it
  if ( structure.$take ) {
    data = utils.take( data, methods.$take ) as Array<any>
  }

  // get queries ( query that doesn't name of it start with '$' ) from methods
  const queries = _.omitBy( methods, (_: any, keyName: string) => keyName[0] === "$" )

  // restructure data
  return utils.async(data, ( value, key, push ) => {
    const parse = utils.parse(value, key)
    let payload = _.clone(value)

    // if $value is function select items what returned and set [ value ] value $value
    if ( typeof methods.$value === 'function' ) {
      for ( const item in methods.$value(value, key) ) { queries[item] = '' }
      payload = methods.$value(value, key)
    }

    if ( structure.$keyName ) {
      // set $keyName method by default value and key name of object
      key = parse(methods.$keyName, _.trimStart(methods.$keyName as string, '@') || key )
    }

    // Include
    // ================================================

    if ( structure.$include ) {
      // include some methods with $include method
      payload = utils.merge( payload, methods.$include, key )
      // add key names of data included to queries
      for ( const item in methods.$include(value, key) ) { queries[item] = '' }
    }

    // Igore
    // ================================================
    if ( structure.$ignore ) {
      // ignore some methods with $ignore method
      payload = utils.ignore( payload, methods.$ignore )
    }

    // return value of item if [ queries ] is empty and $ignore method is not empty
    if ( _.keys(queries).length == 0 ) {
      for ( const item in payload ) { queries[item] = '' }
    }

    if ( !_.isObject( payload ) ) { push( payload, key ); return }

    // get data by queries
    utils.async( queries, ( query: Query | string, key, done ) => {
      const keyName = (key as string).split(':').map(k => k.trim())
      key = keyName[0]
      const context = payload[ key ]
      let alias = utils.parse( context, key )(keyName[keyName.length - 1], keyName[keyName.length - 1])
      // get value of data from object
      const hadMiddlewares = ( _.has(qreal.middlewares, key) && !utils.isFalsy(context) ) ? _.get(qreal.middlewares, key) : false

      function restructure( data: any ) {
        if ( !_.isObject( query ) || _.isArray( query ) ) {
          if ( utils.isString(query as string) ) {
            const parse = utils.parse( context, key )
            data = parse(query, data)
          }
          done( data, alias );
          return
        }

        /*
          restructure query object,
          and wrap it to make qreal not make deep restructure again
        */

        if ( hadMiddlewares ) {

          qreal(data, query as Query).then(( subObject: any[] ) => {
            subObject = ( _.isArray( data ) ) ? _.toArray( subObject ) : subObject[0]
            alias = utils.parse( data, key )(keyName[ keyName.length - 1 ], keyName[ keyName.length - 1 ])

            // parse data then put it in value
            done( subObject, alias )
          })

        } else {
          // if data is not array of objects put it into array to not make deep restructure
          if ( _.isArray( data ) && !_.isObject( data[0] ) ) {
             if ( (query as Query).$value ) { utils.warn(`use shorthand of $value method in ${key} query`) }
             data = [ data ]
           }

          qreal(data, query as Query).then(( subObject: any[] ) => {
            // if data is string join and wrap it into array to resume process
            if ( _.isString( data ) ) {
              subObject = [ subObject.join('') ]
            }

            if ( !_.isArray( context ) && !_.isObject( context[0] ) ) { subObject = subObject[0] }

            if ( _.isArray( context ) && !_.isObject( context[0] ) ) {
              const array = _.toArray( subObject[0] )
              if ( array.length !== 0 ) {
                subObject = array
              }
            }

            // parse data then put it in value
            done( subObject, alias )
          })

        }

      }

      // if query key had an middlewares run it
      if ( hadMiddlewares ) {

        // query had sub middleware and don't had middlewares
        if ( !hadMiddlewares.middlewares ) {
          qreal.middlewares = { ..._.omit(hadMiddlewares, 'middlewares') }
          restructure( context )
          return
        }

        const pass = qreal.pass(key, context, { ...value, ...methods.$include(value, key) }, query)

        pass.then(( context: any[] ) => {

          if ( _.keys( hadMiddlewares ).length !== 1 && !!hadMiddlewares ) {
            qreal.middlewares = {
              ..._.omit(hadMiddlewares, 'middlewares'),
              // pass parent middleware to submiddlewares
              [key] : { middlewares : hadMiddlewares.middlewares }
            }
          }

          restructure( context[0] )
        })

      } else {
        restructure( utils.castFunction(context)( query ) )
      }

    }, utils.isString(key as string ) ? {} : [] ).then(( value: any ) => {
      const parse = utils.parse( value, key )

      // set $value method by default value and key name of object
      value = parse(methods.$value, ( typeof methods.$value !== 'function' && _.trimStart(methods.$value, '@') !== '' ) ? methods.$value : value)

      // push restructured item to result
      push( value, key )

    })

  }, structure.$keyName ? {}:[] )

}

// middlewares of data
qreal.middlewares = {}

// pass data to all middlewares of data as a waterflow
qreal.pass = (key: string | number, data: any, parentObject: any, query: any): Promise<any> => {
  return utils.async( _.get(qreal.middlewares, key).middlewares , ( middleware, _index, done ) => {

    utils.async( _.castArray( data ), ( item, index, done) => {
      middleware( item, parentObject, function ( value: any ) {
        done( value )
      }, query)
    }).then((value : any) => {
      if ( !_.isArray( data ) ) { value = value[0] }
      // change data to pass it to the next middleware
      data = value
      done( value )
    })

  }).then(() => [ data ])
}

// add a middleware to data
qreal.use = function ( 
  key : string,
  middleware : (data: any, object: { [key: string]: any }, done: (item: any, index?: string) => void, query: Query) => void ) {

  // if data had an space in middlwares push new middleware to it
  if ( _.has(qreal.middlewares, `${key}.middlewares`) ) {
    _.get(qreal.middlewares, key).middlewares.push(middleware)
  } else {
    // create space in middleware for data
    _.set(qreal.middlewares, `${key}.middlewares`, [ middleware ] )
  }

}

export default qreal

module.exports = qreal;