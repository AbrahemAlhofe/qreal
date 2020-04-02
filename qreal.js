"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// if we are in node js enviroment require lodash
var lodash_1 = __importDefault(require("lodash"));
var utils_1 = __importDefault(require("./utils"));
function qreal(data, structure) {
    // cast data if it does not array
    if (typeof data !== 'string')
        data = lodash_1.default.castArray(data);
    if (data.length === 0) {
        return new Promise(function (res) { return res([]); });
    }
    // assign value of methods in structure to default methods
    var methods = lodash_1.default.assign({
        $take: data.length,
        $ignore: [],
        $include: function () { return ({}); },
        $keyName: '@',
        $value: '@'
    }, structure);
    // resize data before restructure it
    if (structure.$take) {
        data = utils_1.default.take(data, methods.$take);
    }
    // get queries ( query that doesn't name of it start with '$' ) from methods
    var queries = lodash_1.default.omitBy(methods, function (_, keyName) { return keyName[0] === "$"; });
    // restructure data
    return utils_1.default.async(data, function (value, key, push) {
        var parse = utils_1.default.parse(value, key);
        var payload = lodash_1.default.clone(value);
        // if $value is function select items what returned and set [ value ] value $value
        if (typeof methods.$value === 'function') {
            for (var item in methods.$value(value, key)) {
                queries[item] = '';
            }
            payload = methods.$value(value, key);
        }
        if (structure.$keyName) {
            // set $keyName method by default value and key name of object
            key = parse(methods.$keyName, lodash_1.default.trimStart(methods.$keyName, '@') || key);
        }
        // Include
        // ================================================
        if (structure.$include) {
            // include some methods with $include method
            payload = utils_1.default.merge(payload, methods.$include, key);
            // add key names of data included to queries
            for (var item in methods.$include(value, key)) {
                queries[item] = '';
            }
        }
        // Igore
        // ================================================
        if (structure.$ignore) {
            // ignore some methods with $ignore method
            payload = utils_1.default.ignore(payload, methods.$ignore);
        }
        // return value of item if [ queries ] is empty and $ignore method is not empty
        if (lodash_1.default.keys(queries).length == 0) {
            for (var item in payload) {
                queries[item] = '';
            }
        }
        if (!lodash_1.default.isObject(payload)) {
            push(payload, key);
            return;
        }
        // get data by queries
        utils_1.default.async(queries, function (query, key, done) {
            var keyName = key.split(':').map(function (k) { return k.trim(); });
            key = keyName[0];
            var context = payload[key];
            var alias = utils_1.default.parse(context, key)(keyName[keyName.length - 1], keyName[keyName.length - 1]);
            // get value of data from object
            var hadMiddlewares = (lodash_1.default.has(qreal.middlewares, key) && !utils_1.default.isFalsy(context)) ? lodash_1.default.get(qreal.middlewares, key) : false;
            function restructure(data) {
                if (!lodash_1.default.isObject(query) || lodash_1.default.isArray(query)) {
                    if (utils_1.default.isString(query)) {
                        var parse_1 = utils_1.default.parse(context, key);
                        data = parse_1(query, data);
                    }
                    done(data, alias);
                    return;
                }
                /*
                  restructure query object,
                  and wrap it to make qreal not make deep restructure again
                */
                if (hadMiddlewares) {
                    qreal(data, query).then(function (subObject) {
                        subObject = (lodash_1.default.isArray(data)) ? lodash_1.default.toArray(subObject) : subObject[0];
                        alias = utils_1.default.parse(data, key)(keyName[keyName.length - 1], keyName[keyName.length - 1]);
                        // parse data then put it in value
                        done(subObject, alias);
                    });
                }
                else {
                    // if data is not array of objects put it into array to not make deep restructure
                    if (lodash_1.default.isArray(data) && !lodash_1.default.isObject(data[0])) {
                        if (query.$value) {
                            utils_1.default.warn("use shorthand of $value method in " + key + " query");
                        }
                        data = [data];
                    }
                    qreal(data, query).then(function (subObject) {
                        // if data is string join and wrap it into array to resume process
                        if (lodash_1.default.isString(data)) {
                            subObject = [subObject.join('')];
                        }
                        if (!lodash_1.default.isArray(context) && !lodash_1.default.isObject(context[0])) {
                            subObject = subObject[0];
                        }
                        if (lodash_1.default.isArray(context) && !lodash_1.default.isObject(context[0])) {
                            var array = lodash_1.default.toArray(subObject[0]);
                            if (array.length !== 0) {
                                subObject = array;
                            }
                        }
                        // parse data then put it in value
                        done(subObject, alias);
                    });
                }
            }
            // if query key had an middlewares run it
            if (hadMiddlewares) {
                // query had sub middleware and don't had middlewares
                if (!hadMiddlewares.middlewares) {
                    qreal.middlewares = __assign({}, lodash_1.default.omit(hadMiddlewares, 'middlewares'));
                    restructure(context);
                    return;
                }
                var pass = qreal.pass(key, context, __assign(__assign({}, value), methods.$include(value, key)), query);
                pass.then(function (context) {
                    var _a;
                    if (lodash_1.default.keys(hadMiddlewares).length !== 1 && !!hadMiddlewares) {
                        qreal.middlewares = __assign(__assign({}, lodash_1.default.omit(hadMiddlewares, 'middlewares')), (_a = {}, _a[key] = { middlewares: hadMiddlewares.middlewares }, _a));
                    }
                    restructure(context[0]);
                });
            }
            else {
                restructure(utils_1.default.castFunction(context)(query));
            }
        }, utils_1.default.isString(key) ? {} : []).then(function (value) {
            var parse = utils_1.default.parse(value, key);
            // set $value method by default value and key name of object
            value = parse(methods.$value, (typeof methods.$value !== 'function' && lodash_1.default.trimStart(methods.$value, '@') !== '') ? methods.$value : value);
            // push restructured item to result
            push(value, key);
        });
    }, structure.$keyName ? {} : []);
}
// middlewares of data
qreal.middlewares = {};
// pass data to all middlewares of data as a waterflow
qreal.pass = function (key, data, parentObject, query) {
    return utils_1.default.async(lodash_1.default.get(qreal.middlewares, key).middlewares, function (middleware, _index, done) {
        utils_1.default.async(lodash_1.default.castArray(data), function (item, index, done) {
            middleware(item, parentObject, function (value) {
                done(value);
            }, query);
        }).then(function (value) {
            if (!lodash_1.default.isArray(data)) {
                value = value[0];
            }
            // change data to pass it to the next middleware
            data = value;
            done(value);
        });
    }).then(function () { return [data]; });
};
// add a middleware to data
qreal.use = function (key, middleware) {
    // if data had an space in middlwares push new middleware to it
    if (lodash_1.default.has(qreal.middlewares, key + ".middlewares")) {
        lodash_1.default.get(qreal.middlewares, key).middlewares.push(middleware);
    }
    else {
        // create space in middleware for data
        lodash_1.default.set(qreal.middlewares, key + ".middlewares", [middleware]);
    }
};
exports.default = qreal;
module.exports = qreal;
