// if we are in node js enviroment require lodash
const $async = require('asynkron')
const _ = require('lodash')

// Utilities
// =====================================
_.$warn = (msg) => { console.log( new Error(`Qreal [WARN] : ${msg}`) ) }

_.$isString = ( str ) => _.isString(str) && str !== ''

_.$fillStart = (arr, chr=' ', length) => {
  // make array fill with < chr >
  const placeholder = _.fill( Array( length - arr.length ) , chr)
  // merge array and placeholder to make length of it what user pass
  return [ ...placeholder, ...arr ]
}

_.$isFalsy = (data) => {
  if ( !!data ) return false
  if ( !_.isNumber( data ) ) return true
  return false
}

const $fillEnd = (arr, chr=' ', length) => _.reverse( _.$fillStart(arr, chr, length) )

const $castFunction = (data) => typeof data == 'function' ? data:() => data

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
  if ( _.$isString( $method ) ) {
    if ( $method[0] !== '@' ) { $method = null } else {
      $method = _.get(value, _.trimStart($method, '@'), null)
    }
    if ( _.$isFalsy( $method ) ) { $method = def }
  } else {
    $method = def
  }

  return $method
})

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
  let [from, to] = _.$fillStart(take, 0, 2)

  // if [ form ] attribute object get index of it if not keep it
  from = ( _.findIndex(data, from) !== -1 ) ? _.findIndex(data, from) : from

  // convert [ to ] attribute to index syntax to make it work with slice
  to = from + to + take.length - 1

  let slice = _.slice(data, from, to)

  return slice
}

function qreal ( data, structure ) {
  // cast data if it does not array
  if ( typeof data !== 'string' ) data = _.castArray(data)

  if ( data.length === 0 ) {
    return new Promise( res => res([]) )
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
  if ( structure.$take ) {
    data = $take( data, methods.$take )
  }

  // get queries ( query that doesn't name of it start with '$' ) from methods
  var queries = _.omitBy( methods, (_, key ) => key[0] === "$" )

  // restructure data
  return $async(data, ( value, key, push ) => {
    let parse = $parse( value, key )
    var payload = _.clone(value)
    // if $value is function select items what returned and set [ value ] value $value
    if ( typeof methods.$value === 'function' ) {
      for ( let item in methods.$value(value, key) ) { queries[item] = '' }
      payload = methods.$value(value, key)
    }

    if ( structure.$keyName ) {
      // set $keyName method by default value and key name of object
      methods.$keyName = parse(structure.$keyName, _.trimStart(structure.$keyName, '@') || key )
    } else {
      methods.$keyName = key
    }

    // Include
    // ================================================

    if ( structure.$include ) {
      // include some methods with $include method
      payload = $merge( payload, methods.$include, key )
      // add key names of data included to queries
      for ( let item in methods.$include(value, key) ) { queries[item] = '' }
    }

    // Igore
    // ================================================
    if ( structure.$ignore ) {
      // ignore some methods with $ignore method
      payload = $ignore( payload, methods.$ignore )
    }

    // return value of item if [ queries ] is empty and $ignore method is not empty
    if ( _.keys(queries).length == 0 ) {
      for ( let item in payload ) { queries[item] = '' }
    }

    if ( !_.isObject( payload ) ) { push( payload, methods.$keyName ); return }

    // get data by queries
    $async( queries, ( query, key, done ) => {
      let keyName = key.split(':').map(k => k.trim())
      key = keyName[0]
      let context = payload[ key ]
      let alias = $parse( context, key )(keyName[ keyName.length - 1 ], keyName[ keyName.length - 1 ])
      // get value of data from object
      let hadMiddlewares = ( qreal.middlewares[key] && !_.$isFalsy(context) ) ? qreal.middlewares[key] : false

      function restructure( data ) {
        if ( !_.isObject( query ) || _.isArray( query ) ) {
          if ( _.$isString(query) ) {
            let parse = $parse( context, key )
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
          qreal(data, query).then(( subObject ) => {
            subObject = ( _.isArray( data ) ) ? _.toArray( subObject ) : subObject[0]
            alias = $parse( data, key )(keyName[ keyName.length - 1 ], keyName[ keyName.length - 1 ])

            // parse data then put it in value
            done( subObject, alias )
          })
        } else {
          // if data is not array of objects put it into array to not make deep restructure
          if ( _.isArray( data ) && !_.isObject( data[0] ) ) {
             if ( query.$value ) { $warn(`use shorthand of $value method in ${key} query`) }
             data = [ data ]
           }

          qreal(data, query).then(( subObject ) => {
            // if data is string join and wrap it into array to resume process
            if ( _.isString( data ) ) {
              subObject = [ subObject.join('') ]
            }

            if ( !_.isArray( context ) && !_.isObject( context[0] ) ) { subObject = subObject[0] }

            if ( _.isArray( context ) && !_.isObject( context[0] ) ) {
              let array = _.toArray( subObject[0] )
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
          qreal.middlewares = { ..._.omit(hadMiddlewares, 'middlewares'), pass : qreal.middlewares.pass }
          restructure( context )
          return
        }

        const pass = qreal.middlewares.pass(key, context, { ...value, ...methods.$include(value, methods.$keyName) }, query)

        pass.then(( context ) => {
          if ( _.keys( hadMiddlewares ).length !== 1 && !!hadMiddlewares ) {
            qreal.middlewares = {
              ..._.omit(hadMiddlewares, 'middlewares'),
              pass : qreal.middlewares.pass,
              // pass parent middleware to submiddlewares
              [key] : { middlewares : hadMiddlewares.middlewares }
            }
          }
          restructure( context[0] )
        })

      } else {
        restructure( $castFunction(context)( query ) )
      }

    }, ( methods.$keyName !== '@' ) ? {}:[] ).then(( value ) => {
      let parse = $parse( value, methods.$keyName )

      // set $value method by default value and key name of object
      value = parse(methods.$value, ( typeof methods.$value !== 'function' && _.trimStart(methods.$value, '@') !== '' ) ? methods.$value : value)

      // push restructured item to result
      push( value, methods.$keyName )

    })
  }, ( methods.$keyName !== '@' ) ? {}:[] )

}

// middlewares of data
qreal.middlewares = {}

// add a middleware to data
qreal.use = function ( key, middleware ) {
  // pass data to all middlewares of data as a waterflow

  qreal.middlewares.pass = function (key, data, parentObject, query) {
    return $async( qreal.middlewares[key].middlewares , ( middleware, index, done ) => {

      $async( _.castArray( data ), ( item, index, done ) => {
        middleware( item, parentObject, function ( value ) {
          done( value )
        }, query)
      }).then((value) => {
        if ( !_.isArray( data ) ) { value = value[0] }
        data = value
        done( value )
      })

    }).then(result => [ data ])
  };

  // if data had an space in middlwares push new middleware to it
  if ( typeof qreal.middlewares[key] !== "undefined" ) {
    if  ( qreal.middlewares[key].middlewares ) {
      qreal.middlewares[key].middlewares.push(middleware)
      return
    }
  }
  // create space in middleware for data
  _.set(qreal.middlewares, `${key}.middlewares`, [ middleware ] )
}

global.qreal = qreal

module.exports = qreal
