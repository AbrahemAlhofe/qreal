var _ = require('lodash');
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


const $fillEnd = (arr, chr=' ', length) => _.reverse( $fillStart(arr, chr, length) )

const $castFunction = (data) => _.isFunction(data) ? data:() => data

const $merge = (value, include, key) => {
  include = $castFunction(include)(value, key)

  if ( _.isString( value ) ) {

    if ( _.isArray(include) ) { include = include.join('') }
    if ( _.isEmpty(include) ) { include = '' }

    value = value + _.toString( include )

  } else {
    value = _.merge( value, include )
  }

  return value
}

const $parse = _.curry( (value, key, method, def) => {
  let $method = $castFunction( method )(value, key)

  // if value of method is string , use method as a query to get value
  if ( $isString( $method ) ) {
    $method = _.get(value, _.trimStart($method, '@'), null)
    if ( !$method ) { $method = def }
  } else {
    $method = def
  }

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


function qreal(data, structre) {
  // cast data if it does not array
  data = _.castArray(data)

  // assign value of methods in structre to default methods
  const methods = _.assign({
    $take : data.length,
    $ignore : [],
    $include : () => ({}),
    $keyName : '@',
    $value : '@'
  }, structre)

  // resize data before restructure it
  data = $take( data, methods.$take )

  // get queries ( query that doesn't name of it start with '$' ) from methods
  var queries = _.omitBy( methods, (_, key ) => key[0] === "$" )

  // restructure data
  return _.reduce( data, (result, value, key) => {

    let parse = $parse( value, key )

    // if $value function select items what returned and set [ value ] value $value
    if ( _.isFunction(structre.$value) ) {
      for ( let item in structre.$value(value, key) ) { queries[item] = '' }
      value = structre.$value(value, key)
    }

    // set $keyName and $value methods by default value and key name of object
    methods.$value = parse(structre.$value, value)
    methods.$keyName = parse(structre.$keyName, key)

    // Include
    // ================================================

    // include some methods with $include method
    let include = $merge( methods.$value, methods.$include, key )
    methods.$value = include

    // add key names of data included to queries
    for ( let item in methods.$include(value, key) ) { queries[item] = '' }

    // WARN : if include returned undefined data
    if ( !include ) { $warn('$include return undefined') }


    // Igore
    // ================================================

    // ignore some methods with $ignore method
    methods.$value = $ignore( methods.$value, methods.$ignore )

    // return value of item if [ queries ] is empty and $ignore method is not empty
    if ( !_.isEmpty( methods.$ignore ) && _.keys(queries).length == 0 ) {
      for ( let item in methods.$value ) { queries[item] = '' }
    }

    // get data by queries
    if ( _.isObject( methods.$value ) ) {
      methods.$value = _.mapValues( queries, ( query, key ) => {
        // get value of data from object
        let context = methods.$value[ key ]

        // WARN : if query is worng
        if ( _.isUndefined(context) ) { $warn(`[ ${key} ] item is undefined`) }

        // deep restructure data
        if ( _.isObject(query) ) {
          /*
          restructure query object,
          and wrap it to make qreal not make deep restructure again
          */
          let subObject = qreal( [ context ], query )[0]
          context = ( _.isArray( context ) ) ? _.toArray( subObject ) : subObject
        }

        // parse data then put it in value
        return context
      })
    }


    // push restructured item to result
    result[ methods.$keyName ] = methods.$value

    return result
  }, ( methods.$keyName !== '@' ) ? {}:[] )
}
module.exports = qreal
