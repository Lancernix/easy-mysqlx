/**
 * operator handlers
 */
import { isPlainObject } from 'lodash';
import {
  BasicType,
  OpFuncRet,
  Operator,
  SingleOptionValue,
  SingleOperator,
  MultiOptionValue,
  MultiOperator,
  OrOptionValue,
} from './types';
import { AND, OR, PLACEHOLDER } from './constant';

// eq|gt|lt|ge|le|ne|like
const commonOpFunc = (op: SingleOperator, val: SingleOptionValue): OpFuncRet => {
  checkPlainObject(op, val);
  let optionStr = '';
  const values: BasicType[] = [];
  const keyArr = Object.keys(val);
  if (keyArr.length) {
    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];
      optionStr +=
        i === keyArr.length - 1
          ? `\`${key}\` ${Operator[op]} ${PLACEHOLDER}`
          : `\`${key}\` ${Operator[op]} ${PLACEHOLDER} ${AND} `;
      values.push(val[key]);
    }
  }
  return [optionStr, values];
};

// bw
const bwOpFunc = (op: MultiOperator, val: MultiOptionValue): OpFuncRet => {
  checkPlainObject(op, val);
  let optionStr = '';
  const values: BasicType[] = [];
  const keyArr = Object.keys(val);
  if (keyArr.length) {
    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];
      checkTwoElementArray(key, val[key]);
      optionStr +=
        i === keyArr.length - 1
          ? `\`${key}\` ${Operator[op]} ${PLACEHOLDER} ${AND} ${PLACEHOLDER}`
          : `\`${key}\` ${Operator[op]} ${PLACEHOLDER} ${AND} ${PLACEHOLDER} ${AND} `;
      values.push(...val[key]);
    }
  }
  return [optionStr, values];
};

// in|ni
const inAndNiOpFunc = (op: MultiOperator, val: MultiOptionValue): OpFuncRet => {
  // placeholder compose
  const composePlaceholder = (params: BasicType[]): string => Array(params.length).fill(PLACEHOLDER).join(', ');

  checkPlainObject(op, val);
  let optionStr = '';
  const values: BasicType[] = [];
  const keyArr = Object.keys(val);
  if (keyArr.length) {
    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];
      checkEmptyArray(key, val[key]);
      optionStr +=
        i === keyArr.length - 1
          ? `\`${key}\` ${Operator[op]} (${composePlaceholder(val[key])})`
          : `\`${key}\` ${Operator[op]} (${composePlaceholder(val[key])}) ${AND} `;
      values.push(...val[key]);
    }
  }
  return [optionStr, values];
};

// or
const orOpFunc = (val: Partial<OrOptionValue>[]): OpFuncRet => {
  checkMoreElementArray('or', val);
  let optionStr = '(';
  const values: BasicType[] = [];
  for (let i = 0; i < val.length; i++) {
    const keyArr = Object.keys(val[i]);
    for (let j = 0; j < keyArr.length; j++) {
      const key = keyArr[j];
      let _str: string;
      let _values: BasicType[];
      let sValue: SingleOptionValue;
      let mValue: MultiOptionValue;
      switch (key) {
        case SingleOperator.eq:
        case SingleOperator.ge:
        case SingleOperator.gt:
        case SingleOperator.le:
        case SingleOperator.lt:
        case SingleOperator.ne:
        case SingleOperator.like:
          sValue = (val[i] as Record<SingleOperator, SingleOptionValue>)[key];
          [_str, _values] = commonOpFunc(key, sValue);
          optionStr += _str;
          values.push(..._values);
          break;
        case MultiOperator.bw:
          mValue = (val[i] as Record<MultiOperator, MultiOptionValue>)[key];
          [_str, _values] = bwOpFunc(key, mValue);
          optionStr += _str;
          values.push(..._values);
          break;
        case MultiOperator.in:
        case MultiOperator.ni:
          mValue = (val[i] as Record<MultiOperator, MultiOptionValue>)[key];
          [_str, _values] = bwOpFunc(key, mValue);
          optionStr += _str;
          values.push(..._values);
          break;
        default:
          throw new Error(`${key} is not a valid operator in or option!`);
      }
      j !== keyArr.length - 1 && (optionStr += ` ${AND} `);
    }
    optionStr += i === val.length - 1 ? ')' : ` ${OR} `;
  }
  return [optionStr, values];
};

/**
 * error check
 */
const checkPlainObject = (key: string, value: unknown): void => {
  if (!isPlainObject(value)) {
    throw new Error(`${key}'s value should be a plain object!`);
  }
};

export const checkEmptyPlainObject = (key: string, value: unknown) => {
  if (!isPlainObject(value) || !Object.keys(value as Record<string, unknown>).length) {
    throw new Error(`${key}'s value should be a non-empty plain object!`);
  }
};

export const checkEmptyArray = (key: string, value: unknown): void => {
  if (!Array.isArray(value) || !value.length) {
    throw new Error(`${key}'s value should be a non-empty array!`);
  }
};

const checkTwoElementArray = (key: string, value: unknown): void => {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error(`${key}'s value should be an array with 2 elements!`);
  }
};

const checkMoreElementArray = (key: string, value: unknown): void => {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`${key}'s value should be an array with 2 elements or more!`);
  }
};

export { commonOpFunc, bwOpFunc, inAndNiOpFunc, orOpFunc };
