import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

import { BLendingToken } from "../../generated/PrimaryLendingPlatformV3/BLendingToken";
import { PriceProviderAggregator } from "../../generated/PrimaryLendingPlatformV3/PriceProviderAggregator";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

import { USD_DECIMALS, SCALE_DECIMALS } from "../constants/decimals";
import { AssetType } from "../constants/assetsType";
import { exponentToBigDecimal } from "../helper/common.helper";

export function getUsdOraclePrice(
    primaryLendingPlatformV3: PrimaryLendingPlatformV3,
    tokenAddr: Address,
    amount: BigInt,
    tokenType: AssetType
): BigDecimal {
    const priceOracle = PriceProviderAggregator.bind(primaryLendingPlatformV3.priceOracle());
    const usdOraclePrice = priceOracle.try_getEvaluation(tokenAddr, amount);
    if (usdOraclePrice.reverted) {
        let mostUsdOraclePrice = priceOracle.try_getMostEvaluation(tokenAddr, amount);
        if (mostUsdOraclePrice.reverted) {
            log.error("getUsdOraclePrice: Failed to get most evaluation for token: {}", [
                tokenAddr.toHexString()
            ]);
            return BigDecimal.fromString("0");
        } else {
            if (tokenType === AssetType.COLLATERAL) {
                return mostUsdOraclePrice.value
                    .getCollateralEvaluation()
                    .toBigDecimal()
                    .div(exponentToBigDecimal(USD_DECIMALS));
            } else {
                return mostUsdOraclePrice.value
                    .getCapitalEvaluation()
                    .toBigDecimal()
                    .div(exponentToBigDecimal(USD_DECIMALS));
            }
        }
    } else {
        if (tokenType === AssetType.COLLATERAL) {
            return usdOraclePrice.value
                .getCollateralEvaluation()
                .toBigDecimal()
                .div(exponentToBigDecimal(USD_DECIMALS));
        } else {
            return usdOraclePrice.value
                .getCapitalEvaluation()
                .toBigDecimal()
                .div(exponentToBigDecimal(USD_DECIMALS));
        }
    }
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
        totalSupplyLendingToken,
        AssetType.CAPITAL
    ).div(exponentToBigDecimal(SCALE_DECIMALS));

    return usdOraclePrice;
}
