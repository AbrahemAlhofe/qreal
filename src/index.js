/* eslint-disable */
const _ = require('lodash');

// Utilities
// =====================================
const $warn = (msg) => { console.log( new Error(`Qreal [WARN] : ${msg}`) ) }

const $isString = ( str ) => _.isString(str) && str !== ''

const $fillStart = (arr, chr=' ', length) => {
  // make array fill with < chr >
  const placeholder = _.fill( Array( length - arr.length ) , chr)
  // merge array and placeholder to make length of it what user pass
  return [ ...placeholder, ...arr ]
}

const $isFalsy = (data) => {
  if ( !!data ) return false
  if ( !_.isNumber( data ) ) return true
  return false
}

const $fillEnd = (arr, chr=' ', length) => _.reverse( $fillStart(arr, chr, length) )

const $castFunction = (data) => _.isFunction(data) ? data:() => data

const $merge = (value, include, key) => {
  include = $castFunction(include)(value || {}, key || 0)

  // WARN : if include returned undefined data
  if ( !include ) { $warn(`$include return "${ include }"`) }

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

const $parse = _.curry( (value, key, method, def) => {
  let $method = $castFunction( method )(value, key)

  // if value of method is string , use method as a query to get value
  if ( $isString( $method ) ) {
    $method = _.get(value, _.trimStart($method, '@'), null)
    if ( $isFalsy( $method ) ) { $method = def }
  } else {
    $method = def
  }

  // console.log( value, $method )

  return $method
} )

const $ignore = ( object, items ) => {
  // if [ object ] is array remove all items by value of it
  if ( _.isArray(object) ) { return _.pullAll(object, items) }
  // if [ object ] is object remove all items by keyNames of items
  if ( _.isObject(object)  ) { return _.omit(object, items) }
  return object
}

const $take = ( data, argument ) => {
  // take only first two itmes in take argument
  let take = _.take( _.castArray(argument), 2)

  // placeholding [ take ]
  let [from, to] = $fillStart(take, 0, 2)

  // if [ form ] attribute object get index of it if not keep it
  from = ( _.findIndex(data, from) !== -1 ) ? _.findIndex(data, from) : from

  // convert [ to ] attribute to index syntax to make it work with slice
  to = from + to + take.length - 1

  return _.slice(data, from, to)
}

const $async = ( object, middleware, callBack, result = [] ) => {
  // index of ping pong loop
  var index = 0

  // get keys of object
  let keys = Object.keys( object )

  // ping : get data from middleware function and add it to result
  function ping() {
    // get key in index n
    let key = keys[index]
    // get items by key
    let item = object[ key ]

    // pass item and key of it and done function to middleware
    middleware( item, key, (data, keyName) => {
      // increment index to get next key
      index += 1
      // add data to result with keyName was passed or key
      result[ keyName || key ] = data
      // call check function
      pong()
    })

  }

  // pong : check if done call callBack function else re-call ping
  function pong() {
    if ( index > keys.length - 1 ) { callBack( result ) } else { ping() }
  }

  // start loop function
  ping()

  // return result if data is sync
  return result
}

function qreal ( data, structure, callBack = () => {}) {
  // cast data if it does not array
  data = ( !_.isString(data) ) ? _.castArray(data) : data

  if ( data.length === 0 ) {
    callBack([])
    return []
  }

  // assign value of methods in structure to default methods
  const methods = _.assign({
    $take : data.length,
    $ignore : [],
    $include : () => ({}),
    $keyName : '@',
    $value : '@'
  }, structure)

  // resize data before restructure it
  data = $take( data, methods.$take )

  // get queries ( query that doesn't name of it start with '$' ) from methods
  var queries = _.omitBy( methods, (_, key ) => key[0] === "$" )


  // restructure data
  return $async(data, ( value, key, cb ) => {
    let parse = $parse( value, key )

    // if $value is function select items what returned and set [ value ] value $value
    if ( _.isFunction(structure.$value) ) {
      for ( let item in structure.$value(value, key) ) { queries[item] = '' }
      value = structure.$value(value, key)
    }

    // set $keyName and $value methods by default value and key name of object
    methods.$value = parse(structure.$value, value)
    methods.$keyName = parse(structure.$keyName, key)

    // Include
    // ================================================

    // include some methods with $include method
    let include = $merge( methods.$value, methods.$include, key )
    methods.$value = include

    // add key names of data included to queries
    for ( let item in methods.$include(value, key) ) { queries[item] = '' }

    // Igore
    // ================================================

    // ignore some methods with $ignore method
    methods.$value = $ignore( methods.$value, methods.$ignore )

    // return value of item if [ queries ] is empty and $ignore method is not empty
    if ( !_.isEmpty( methods.$ignore ) && _.keys(queries).length == 0 ) {
      for ( let item in methods.$value ) { queries[item] = '' }
    }

    if ( !_.isObject( methods.$value ) ) { cb( methods.$value, methods.$keyName ); return }

    // get data by queries
    $async( queries, ( query, key, done ) => {
      // get value of data from object
      let context = $castFunction(methods.$value[ key ])( query )
      let hadMiddlewares = qreal.middlewares[key]

      function restructure( data ) {

        if ( !_.isObject( query ) || _.isArray( query ) ) {
          if ( query !== '' ) {
            let parse = $parse( context, key )
            data = parse(query, context)
          }
          done( data );
          return
        }

        /*
          restructure query object,
          and wrap it to make qreal not make deep restructure again
        */

        if ( hadMiddlewares ) {
          qreal(data, query, ( subObject ) => {
            subObject = ( _.isArray( data ) ) ? _.toArray( subObject ) : subObject[0]
            // parse data then put it in value
            done( subObject )
          })
        } else {
          // if data is array but it into array to not make deep restructure
          if ( _.isArray( data ) ) { data = [ data ] }

          qreal(data, query, ( subObject ) => {
            // if data is string join and wrap it into array to resume process
            if ( _.isString( data ) ) { subObject = [ subObject.join('') ] }

            // get first item form subObject because qreal return array and we need the result
            subObject = subObject[0]

            if ( _.isArray( context ) ) {
              let array = _.toArray( subObject )
              if ( array.length !== 0 ) {
                subObject = array
              }
            }

            // parse data then put it in value
            done( subObject )
          })
        }

      }

      // if query key had an middlewares run it
      if ( hadMiddlewares ) {
        if ( !_.isArray( hadMiddlewares ) ) {
          qreal.middlewares = hadMiddlewares
          restructure( context )
        } else {
          hadMiddlewares.pass(key, context, methods.$value, ( context ) => {
            restructure( context[0] )
          })
        }
      } else {
        restructure( context )
      }

    }, ( value ) => {
      // push restructured item to result
      cb( value, methods.$keyName )
    }, ( methods.$keyName !== '@' ) ? {}:[] )
  }, callBack, ( methods.$keyName !== '@' ) ? {}:[] )

}

// middlewares of data
qreal.middlewares = {}

// add a middleware to data
qreal.use = function ( key, middleware ) {
  // pass data to all middlewares of data as a waterflow

  Array.prototype.pass = function (key, data, parentObject, callBack) {
    $async( qreal.middlewares[key] , ( middleware, index, done ) => {

      $async( _.castArray( data ), ( item, index, done ) => {
        middleware( item, parentObject, function ( value ) {
          done( value )
        })
      }, (value) => {
        if ( !_.isArray( data ) ) { value = value[0] }
        done( value )
      })

    }, callBack)
  };

  // if data had an space in middlwares push new middleware to it
  if ( qreal.middlewares[key] ) {
    qreal.middlewares[key].push(middleware)
  } else {
    // create space in middleware for data
    _.set(qreal.middlewares, key, [ middleware ])
  }
}

module.exports = qreal
