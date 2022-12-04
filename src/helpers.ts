// For each division by 10, add one to exponent to truncate one significant figure
import { BigDecimal, BigInt, Bytes, Address } from '@graphprotocol/graph-ts'

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function pow(base: BigDecimal, exponent: number): BigDecimal {
  let result = BigDecimal.fromString("1");
  for (let i = 0; i < exponent; i++) {
      result = result.times(base);
  }
  return result;
}