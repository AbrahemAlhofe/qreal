(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  var _ = require('lodash');

  function qreal(_objs, q) {
    var objs = (_.isArray(_objs)) ? _objs:[_objs];
    var options = _.assignIn({
      $length : Infinity,
      $ignore : [],
      $include : () => {},
      $return : 0,
      // $keyName
      // $value
      $normalFeild : false
    }, q);
    var res = _.reduce(objs, (result, obj, key) => {
      var value = (!_.isEmpty(options.$ignore)) ? {...obj} : {};

      var filterData = _data => {
        var repo = (typeof obj !== 'object') ? objs:obj;
        var data = _data;
        if ( typeof _data == 'function' ) { data = _data(repo, key); }
        return _.get( repo, _.trimStart(data, '@'), data )
      };

      options.$keyName = filterData(q.$keyName || key);

      var filter = _.filter(Object.keys(q), name => name[0] !== "$");
      for (let queryName of filter) {
        var item = obj[queryName];
        var query = q[queryName];
        if (!item) continue
        if ( Array.isArray(query) ) {

          _.reduce(query, (result, rule) => {
            if ( rule(item) ) result[queryName] = item;
            return result
          }, value);

        } else if (typeof query == "function") {
          value[queryName] = query(item);
        } else if (typeof query == "object") {
          var items = qreal(item, { $keyName : queryName, ...query });
          for ( let key in items ) {
            value[key] = items[key];
          }
        } else {
          value[queryName] = item;
        }
      }

      options.$value = filterData(q.$value || value);

      if ( !_.isEmpty( options.$include(obj) ) ) {
        options.$value = _.merge(options.$include(obj), options.$value);
      }

      if (key > options.$length - 1) return result

      let val = options.$value;

      if ( typeof options.$value == 'object' ) { val = _.omit(options.$value, options.$ignore); }
      if (!_.isEmpty(val) || typeof val !== 'object') result[options.$keyName] = val;

      return result
    }, (options.$normalFeild) ? {}:[] );
    return (options.$return) ? res[options.$return - 1]:res
  }

  module.exports = qreal;

})));
