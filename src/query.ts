/**
 * basic query class, implements the CURD methods
 */
import { escape as _escape } from 'promise-mysql';
import { OkPacket } from 'mysql';
import { getColAndVals, getColumns, getLimit, getOrder, getSet, getWhere } from './clause';
import { COUNT, DELETE, FROM, INSERT, INTO, SELECT, SET, UPDATE, VALUES } from './constant';
import Literal from './literal';
import {
  CountAndDelParams,
  InsertParams,
  SelectParams,
  GetParams,
  UpdateParams,
  BasicType,
  RowDataPacket,
} from './types';

export default class Query {
  /**
   * basic query method, subclass must override this method!
   * @param _sql (prepared) sql statement
   * @param _values values corresponding to placeholders
   * @returns sql execute result
   */
  protected async _query(_sql: string, _values?: BasicType[]): Promise<OkPacket | RowDataPacket[]> {
    throw new Error('subclass must override this method!');
  }

  /**
   * query method
   * @param sql (prepared) sql statement
   * @param values values corresponding to placeholders
   * @returns sql execute result
   */
  async query(sql: string, values: BasicType[] = []) {
    const reslut = await this._query(sql, values);
    return reslut;
  }

  /**
   * select method
   * @param params a object including table、column、where、order、limit and offset attributes
   * @returns row data array
   */
  async select(params: SelectParams): Promise<RowDataPacket[]> {
    const { table, column, where, order, limit, offset = 0 } = params;
    // column
    const columnStr = getColumns(column);
    // order
    const orderStr = getOrder(order);
    // limit
    const limitStr = getLimit(offset, limit);
    // where & optionValues
    const { str: whereStr, arr: optionValues } = getWhere(where);
    // prepared statement
    const sql = `${SELECT} ${columnStr} ${FROM} \`${table}\`${whereStr}${orderStr}${limitStr};`;
    const reslut = await this._query(sql, optionValues);
    return reslut as RowDataPacket[];
  }

  /**
   * select count method
   * @param params a object including table and where attributes
   * @returns row count
   */
  async count(params: CountAndDelParams): Promise<number> {
    const { table, where } = params;
    // where
    const whereStr = getWhere(where).str;
    // optionValues
    const optionValues = getWhere(where).arr;
    // prepared statement
    const sql = `${SELECT} ${COUNT} ${FROM} \`${table}\`${whereStr};`;
    const result = await this._query(sql, optionValues);
    return (result as RowDataPacket[])[0][`${COUNT}`];
  }

  /**
   * insert method
   * @param params a object including table and value attributes
   * @returns sql execute result
   */
  async insert(params: InsertParams): Promise<OkPacket> {
    const { table, value } = params;
    const { columnStr, valStr, valArr } = getColAndVals(value);
    const sql = `${INSERT} ${INTO} \`${table}\` ${columnStr} ${VALUES} ${valStr};`;
    const result = await this._query(sql, valArr);
    return result as OkPacket;
  }

  /**
   * update method
   * @param params a object including table、value and where attributes
   * @returns sql execute result
   */
  async update(params: UpdateParams): Promise<OkPacket> {
    const { table, value, where } = params;
    const { setStr, setVal } = getSet(value);
    const { str: whereStr, arr: optionValues } = getWhere(where);
    const sql = `${UPDATE} \`${table}\` ${SET} ${setStr}${whereStr};`;
    const valArr = [...setVal, ...optionValues];
    const result = await this._query(sql, valArr);
    return result as OkPacket;
  }

  /**
   * delete method
   * @param params a object including table and where attributes
   * @returns sql execute result
   */
  async delete(params: CountAndDelParams): Promise<OkPacket> {
    const { table, where } = params;
    const { str: whereStr, arr: optionValues } = getWhere(where);
    const sql = `${DELETE} ${FROM} \`${table}\`${whereStr};`;
    const result = await this._query(sql, optionValues);
    return result as OkPacket;
  }

  /**
   * get method
   * @param params a object including table、column、where and order attributes
   * @returns row data object
   */
  async get(params: GetParams): Promise<RowDataPacket> {
    const { table, column, where, order } = params;
    const limit = 1,
      offset = 0;
    // column
    const columnStr = getColumns(column);
    // order
    const orderStr = getOrder(order);
    // limit
    const limitStr = getLimit(offset, limit);
    // where & optionValues
    const { str: whereStr, arr: optionValues } = getWhere(where);
    // prepared statement
    const sql = `${SELECT} ${columnStr} ${FROM} \`${table}\`${whereStr}${orderStr}${limitStr};`;
    const result = await this._query(sql, optionValues);
    return (result as RowDataPacket[])[0];
  }

  /**
   * escape method
   * @param params any value
   * @returns string
   */
  escape(params: unknown) {
    return _escape(params);
  }

  /**
   * format literal method
   * @param params build-in function string
   * @returns Literal instance
   */
  literal(params: string): Literal {
    return new Literal(params);
  }
}
