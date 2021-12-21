/**
 * operator handlers
 */
import {
  OpFuncRet,
  Operator,
  SingleOptionValue,
  SingleOperator,
  MultiOptionValue,
  MultiOperator,
  OrOptionValue,
} from './typing';
import { AND, OR, PLACEHOLDER } from './constant';
import { checkEmptyArray, checkMoreElementArray, checkPlainObject, checkTwoElementArray } from './util';

// eq|gt|lt|ge|le|ne|like
const commonOpFunc = (op: SingleOperator, val: SingleOptionValue): OpFuncRet => {
  checkPlainObject(op, val);
  let optionStr: string = '';
  const values: (string | number | Date)[] = [];
  const keyArr = Object.keys(val);
  if (keyArr.length) {
    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];
      optionStr +=
        i === keyArr.length - 1
          ? `${key} ${Operator[op]} ${PLACEHOLDER}`
          : `${key} ${Operator[op]} ${PLACEHOLDER} ${AND} `;
      values.push(val[key]);
    }
  }
  return [optionStr, values];
};

// bw
const bwOpFunc = (op: MultiOperator, val: MultiOptionValue): OpFuncRet => {
  checkPlainObject(op, val);
  let optionStr: string = '';
  const values: (string | number | Date)[] = [];
  const keyArr = Object.keys(val);
  if (keyArr.length) {
    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];
      checkTwoElementArray(key, val[key]);
      optionStr +=
        i === keyArr.length - 1
          ? `${key} ${Operator[op]} ${PLACEHOLDER} ${AND} ${PLACEHOLDER}`
          : `${key} ${Operator[op]} ${PLACEHOLDER} ${AND} ${PLACEHOLDER} ${AND} `;
      values.push(...val[key]);
    }
  }
  return [optionStr, values];
};

// in|ni
const inAndNiOpFunc = (op: MultiOperator, val: MultiOptionValue): OpFuncRet => {
  // 占位符组装
  const composePlaceholder = (params: string[] | number[] | Date[]): string =>
    Array(params.length).fill(PLACEHOLDER).join(', ');
  // const composePlaceholder = (params: string[] | number[] | Date[]): string => {
  //   let res: string = '';
  //   for (let i = 0; i < params.length; i++) {
  //     res += `${PLACEHOLDER}, `;
  //   }
  //   return res.replace(/,\s$/, '');
  // };

  checkPlainObject(op, val);
  let optionStr: string = '';
  const values: (string | number | Date)[] = [];
  const keyArr = Object.keys(val);
  if (keyArr.length) {
    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];
      checkEmptyArray(key, val[key]);
      optionStr +=
        i === keyArr.length - 1
          ? `${key} ${Operator[op]} (${composePlaceholder(val[key])})`
          : `${key} ${Operator[op]} (${composePlaceholder(val[key])}) ${AND} `;
      values.push(...val[key]);
    }
  }
  return [optionStr, values];
};

// or
const orOpFunc = (val: Partial<OrOptionValue>[]): OpFuncRet => {
  checkMoreElementArray('or', val);
  let optionStr: string = '(';
  const values: (string | number | Date)[] = [];
  for (let i = 0; i < val.length; i++) {
    const keyArr = Object.keys(val[i]);
    for (let j = 0; j < keyArr.length; j++) {
      const key = keyArr[j];
      switch (key) {
        case SingleOperator.eq:
        case SingleOperator.ge:
        case SingleOperator.gt:
        case SingleOperator.le:
        case SingleOperator.lt:
        case SingleOperator.ne:
        case SingleOperator.like:
          const valueCommon = (val[i] as Record<SingleOperator, SingleOptionValue>)[key];
          const [_str1, _values1] = commonOpFunc(key, valueCommon);
          optionStr += _str1;
          values.push(..._values1);
          break;
        case MultiOperator.bw:
          const valueBw = (val[i] as Record<MultiOperator, MultiOptionValue>)[key];
          const [_str2, _values2] = bwOpFunc(key, valueBw);
          optionStr += _str2;
          values.push(..._values2);
          break;
        case MultiOperator.in:
        case MultiOperator.ni:
          const valueI = (val[i] as Record<MultiOperator, MultiOptionValue>)[key];
          const [_str3, _values3] = bwOpFunc(key, valueI);
          optionStr += _str3;
          values.push(..._values3);
          break;
        default:
          throw new Error(`${key} is not a valid operator in or option!`);
      }
      j !== keyArr.length - 1 && (optionStr += ` ${AND} `);
    }
    optionStr += i === val.length - 1 ? ')' : ` ${OR} `;
  }
  // console.log(optionStr);
  // console.log(values);
  return [optionStr, values];
};

export { commonOpFunc, bwOpFunc, inAndNiOpFunc, orOpFunc };
