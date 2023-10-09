import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

import { BLendingToken } from "../../generated/PrimaryLendingPlatformV3/BLendingToken";
import { PriceProviderAggregator } from "../../generated/PrimaryLendingPlatformV3/PriceProviderAggregator";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

import { USD_DECIMALS, SCALE_DECIMALS } from "../constants/decimals";
import { exponentToBigDecimal } from "../helper/common.helper";

export function getUsdOraclePrice(
    primaryLendingPlatformV3: PrimaryLendingPlatformV3,
    tokenAddr: Address,
    amount: BigInt
): BigDecimal {
    const priceOracle = PriceProviderAggregator.bind(primaryLendingPlatformV3.priceOracle());
    const usdOraclePrice = priceOracle.try_getEvaluation(tokenAddr, amount);
    if (usdOraclePrice.reverted) {
        log.info("tokenAddr: {}, amount: {}", [tokenAddr.toHexString(), amount.toString()]);
        return BigDecimal.fromString("0");
    }

    return usdOraclePrice.value.toBigDecimal().div(exponentToBigDecimal(USD_DECIMALS));
}

export function getLenderAggregateCapitalDepositedPerLendingToken(
    primaryLendingPlatformV3: PrimaryLendingPlatformV3,
    lendingTokenAddress: Address
): BigDecimal {
    const bLendingTokenAddress = primaryLendingPlatformV3
        .lendingTokenInfo(lendingTokenAddress)
        .getBLendingToken();
    const bLendingToken = BLendingToken.bind(bLendingTokenAddress);
    const totalSupply = bLendingToken.totalSupply();
    const exchangeRateStored = bLendingToken.exchangeRateStored();
    const totalSupplyLendingToken = totalSupply.times(exchangeRateStored);

    const usdOraclePrice = getUsdOraclePrice(
        primaryLendingPlatformV3,
        lendingTokenAddress,
        totalSupplyLendingToken
    ).div(exponentToBigDecimal(SCALE_DECIMALS));

    return usdOraclePrice;
}
