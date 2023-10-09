import { Address, BigDecimal } from "@graphprotocol/graph-ts";

import { SCALE_DECIMALS } from "../constants/decimals";
import { DAY_PER_YEAR, BLOCKS_PER_DAY } from "../constants/configs";
import { exponentToBigDecimal, pow } from "../helper/common.helper";

import { BLendingToken } from "../../generated/PrimaryLendingPlatformV3/BLendingToken";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

export function getLenderAPYPerLendingToken(
    primaryLendingPlatformV3: PrimaryLendingPlatformV3,
    lendingTokenAddress: Address
): BigDecimal {
    const bLendingTokenAddress = primaryLendingPlatformV3
        .lendingTokenInfo(lendingTokenAddress)
        .getBLendingToken();
    const bLendingToken = BLendingToken.bind(bLendingTokenAddress);
    const supplyRatePerBlock = bLendingToken
        .supplyRatePerBlock()
        .toBigDecimal()
        .div(exponentToBigDecimal(SCALE_DECIMALS));
    const supplyRatePerDay = supplyRatePerBlock.times(BigDecimal.fromString(BLOCKS_PER_DAY.toString()));
    const lenderAPY = pow(supplyRatePerDay.plus(BigDecimal.fromString("1")), DAY_PER_YEAR)
        .minus(BigDecimal.fromString("1"))
        .times(BigDecimal.fromString("100"));

    return lenderAPY;
}

export function getBorrowingAPYPerLendingToken(
    primaryLendingPlatformV3: PrimaryLendingPlatformV3,
    lendingTokenAddress: Address
): BigDecimal {
    const bLendingTokenAddress = primaryLendingPlatformV3
        .lendingTokenInfo(lendingTokenAddress)
        .getBLendingToken();
    const bLendingToken = BLendingToken.bind(bLendingTokenAddress);
    const borrowRatePerBlock = bLendingToken
        .borrowRatePerBlock()
        .toBigDecimal()
        .div(exponentToBigDecimal(SCALE_DECIMALS));
    const borrowRatePerDay = borrowRatePerBlock.times(BigDecimal.fromString(BLOCKS_PER_DAY.toString()));
    const borrowingAPY = pow(borrowRatePerDay.plus(BigDecimal.fromString("1")), DAY_PER_YEAR)
        .minus(BigDecimal.fromString("1"))
        .times(BigDecimal.fromString("100"));

    return borrowingAPY;
}
