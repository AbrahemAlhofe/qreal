"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('lodash');
var Utils = /** @class */ (function () {
    function Utils() {
        this.warn = function (msg) { throw new Error("Qreal [WARN] : " + msg); };
    }
    Utils.prototype.isString = function (str) { return _.isString(str) && str !== ''; };
    Utils.prototype.fillStart = function (arr, chr, length) {
        if (chr === void 0) { chr = ' '; }
        // make array fill with < chr >
        var placeholder = _.fill(Array(length - arr.length), chr);
        // merge array and placeholder to make length of it what user pass
        return __spreadArrays(placeholder, arr);
    };
    Utils.prototype.isFalsy = function (data) {
        if (!!data)
            return false;
        if (!_.isNumber(data))
            return true;
        return false;
    };
    Utils.prototype.castFunction = function (data) { return typeof data == 'function' ? data : function () { return data; }; };
    Utils.prototype.merge = function (value, include, key) {
        include = this.castFunction(include)(value || {}, key || 0);
        // WARN : if include returned undefined data
        if (!include) {
            this.warn("$include return \"" + include + "\"");
        }
        if (_.isString(value)) {
            if (_.isArray(include)) {
                include = include.join('');
            }
            if (_.isEmpty(include)) {
                include = '';
            }
            value = value + _.toString(include);
        }
        if (_.isObject(value)) {
            value = _.merge(value, include);
        }
        return value;
    };
    Utils.prototype.parse = function (value, key) {
        var _this = this;
        return function (method, def) {
            method = _this.castFunction(method)(value, key);
            // if value of method is string , use method as a query to get value
            method = (method[0] !== '@') ? def : _.get(value, _.trimStart(method, '@'), def);
            return method;
        };
    };
    Utils.prototype.ignore = function (object, items) {
        // if [ object ] is array remove all items by value of it
        if (_.isArray(object)) {
            return _.pullAll(object, items);
        }
        // if [ object ] is object remove all items by keyNames of items
        if (_.isObject(object)) {
            return _.omit(object, items);
        }
        return object;
    };
    Utils.prototype.take = function (data, argument) {
        // take only first two itmes in take argument
        var take = _.take(_.castArray(argument), 2);
        // placeholding [ take ]
        var _a = this.fillStart(take, 0, 2), from = _a[0], to = _a[1];
        // if [ form ] attribute object get index of it if not keep it
        from = (_.findIndex(data, from) !== -1) ? _.findIndex(data, from) : from;
        // convert [ to ] attribute to index syntax to make it work with slice
        to = from + to + take.length - 1;
        var slice = _.slice(data, from, to);
        return slice;
    };
    Utils.prototype.async = function (
    // any data has key and value
    object, middleware, 
    // pass any data has key and value
    result) {
        var _this = this;
        if (result === void 0) { result = []; }
        // return promise if we need to make it await
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_1, _a, _b, _i, index, state_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _loop_1 = function (index) {
                            var item, _a, context, _b, keyName;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        item = object[index];
                                        return [4 /*yield*/, new Promise(function (next) { return middleware(item, index, function (item, index) {
                                                // pass item and index what passed to done function to resolve promise
                                                next([item, index]);
                                            }); })
                                            // if context and keyName equal false break for loop
                                        ];
                                    case 1:
                                        _a = _c.sent(), context = _a[0], _b = _a[1], keyName = _b === void 0 ? index : _b;
                                        // if context and keyName equal false break for loop
                                        if (!context && !keyName) {
                                            return [2 /*return*/, "break"];
                                        }
                                        // push context to result
                                        result[keyName] = context;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _a = [];
                        for (_b in object)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        index = _a[_i];
                        return [5 /*yield**/, _loop_1(index)];
                    case 2:
                        state_1 = _c.sent();
                        if (state_1 === "break")
                            return [3 /*break*/, 4];
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // call callBack function
                        resolve(result);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return Utils;
}());
exports.default = new Utils();
