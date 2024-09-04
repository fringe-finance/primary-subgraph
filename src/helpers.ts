// For each division by 10, add one to exponent to truncate one significant figure
import { BigDecimal } from "@graphprotocol/graph-ts";
import { PriceProviderAggregatorV2 } from "../generated/PrimaryLendingPlatformV2/PriceProviderAggregatorV2";
import { PrimaryLendingPlatformV2 } from "../generated/PrimaryLendingPlatformV2/PrimaryLendingPlatformV2";
import { USD_DECIMALS } from "./constants/decimals";

export function exponentToBigDecimal(decimals: i32): BigDecimal {
    let bd = BigDecimal.fromString("1");
    for (let i = 0; i < decimals; i++) {
        bd = bd.times(BigDecimal.fromString("10"));
    }
    return bd;
}

export function pow(base: BigDecimal, exponent: number): BigDecimal {
    let result = BigDecimal.fromString("1");
    for (let i = 0; i < exponent; i++) {
        result = result.times(base);
    }
    return result;
}

export function getUSD_decimals(
    primaryLendingPlatformV2: PrimaryLendingPlatformV2,
): BigDecimal {
    const priceOracle = PriceProviderAggregatorV2.bind(primaryLendingPlatformV2.priceOracle());
    const usdDecimals = priceOracle.try_usdDecimals();
    if (usdDecimals.reverted) {
        return exponentToBigDecimal(USD_DECIMALS);
    } else {
        return exponentToBigDecimal(usdDecimals.value);
    }
}
