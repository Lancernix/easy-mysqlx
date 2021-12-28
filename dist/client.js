"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var mysql2_1 = require("mysql2");
var query_1 = require("./query");
var transaction_1 = require("./transaction");
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(config) {
        var _this = _super.call(this) || this;
        _this.pool = (0, mysql2_1.createPool)(config);
        return _this;
    }
    /**
     * basic query method
     * @param sql (prepared) sql statement
     * @param values values corresponding to placeholders
     * @returns sql execute result
     */
    Client.prototype._query = function (sql, values) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.pool.promise().execute(sql, values)];
                }
                catch (error) {
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * manual begin transaction method
     * @returns Transaction instance
     */
    Client.prototype.beginTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.promise().getConnection()];
                    case 1:
                        conn = _a.sent();
                        // start transaction
                        conn.beginTransaction();
                        return [2 /*return*/, new transaction_1.default(conn)];
                }
            });
        });
    };
    Client.prototype.autoTransaction = function (scope, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, tran, result, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ctx = ctx || {};
                        if (!!ctx._transactionConnection) return [3 /*break*/, 2];
                        _a = ctx;
                        return [4 /*yield*/, this.beginTransaction()];
                    case 1:
                        _a._transactionConnection = _b.sent();
                        _b.label = 2;
                    case 2:
                        tran = ctx._transactionConnection;
                        if (!ctx._transactionScopeCount) {
                            ctx._transactionScopeCount = 1;
                        }
                        else {
                            ctx._transactionScopeCount++;
                        }
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 10]);
                        return [4 /*yield*/, scope(tran)];
                    case 4:
                        result = _b.sent();
                        ctx._transactionScopeCount--;
                        if (!(ctx._transactionScopeCount === 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, tran.commit()];
                    case 5:
                        _b.sent();
                        ctx._transactionConnection = null;
                        _b.label = 6;
                    case 6: return [2 /*return*/, result];
                    case 7:
                        err_1 = _b.sent();
                        if (!ctx._transactionConnection) return [3 /*break*/, 9];
                        return [4 /*yield*/, tran.rollback()];
                    case 8:
                        _b.sent();
                        ctx._transactionConnection = null;
                        _b.label = 9;
                    case 9: throw err_1;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * escape value for preventing sql injection
     * @param params input value
     * @returns escaped string value
     */
    Client.prototype.escape = function (params) {
        return this.pool.escape(params);
    };
    return Client;
}(query_1.default));
exports.default = Client;