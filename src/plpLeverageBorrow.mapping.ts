import { BigInt, dataSource } from "@graphprotocol/graph-ts";

import {
    ClosePosition,
    LeveragedBorrow,
    PrimaryLendingPlatformLeverage
} from "../generated/PrimaryLendingPlatformLeverage/PrimaryLendingPlatformLeverage";
import { LeveragedBorrowLog } from "../generated/schema";
import { PrimaryLendingPlatformV3 } from "../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";
import { ERC20 } from "../generated/PrimaryLendingPlatformV3/ERC20";

import { LEVERAGE_BORROW } from "./constants/eventsType";
import { USD_DECIMALS } from "./constants/decimals";
import { exponentToBigDecimal } from "./helper/common.helper";

import { handleBorrowedState } from "./common/borrowState.handler";
import { handleMultiHistories } from "./common/multiHistories.handler";
import { handleAPYHistories } from "./common/apyHistory.handler";

import { getUsdOraclePrice } from "./utils/priceOracle.util";

export function handleLeveragedBorrow(event: LeveragedBorrow): void {
    handleLeveragedBorrowLog(event);
    handleBorrowedState<LeveragedBorrow>(event);
    handleMultiHistories<LeveragedBorrow>(event);
    handleAPYHistories<LeveragedBorrow>(event);
}

export function handleClosePosition(event: ClosePosition): void {}

function handleLeveragedBorrowLog(event: LeveragedBorrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;
    const primaryLendingPlatformLeverage = PrimaryLendingPlatformLeverage.bind(dataSource.address());
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(
        primaryLendingPlatformLeverage.primaryLendingPlatform()
    );

    let entity = LeveragedBorrowLog.load(id);
    if (entity == null) {
        entity = new LeveragedBorrowLog(id);
    }

    const prjToken = ERC20.bind(event.params.projectToken);
    const lendingToken = ERC20.bind(event.params.lendingToken);
    const projectTokenPrice = getUsdOraclePrice(
        primaryLendingPlatformV3,
        event.params.projectToken,
        BigInt.fromString(exponentToBigDecimal(prjToken.decimals()).toString())
    );
    entity.prjTokenPrice = projectTokenPrice;
    entity.lendingTokenPrice = getUsdOraclePrice(
        primaryLendingPlatformV3,
        event.params.lendingToken,
        BigInt.fromString(exponentToBigDecimal(lendingToken.decimals()).toString())
    );
    entity.marginCount = event.params.margin.toBigDecimal().div(exponentToBigDecimal(prjToken.decimals()));
    entity.marginAmount = event.params.margin
        .toBigDecimal()
        .times(projectTokenPrice)
        .div(exponentToBigDecimal(prjToken.decimals()));
    entity.exposureAmount = event.params.notionalExposure
        .toBigDecimal()
        .div(exponentToBigDecimal(USD_DECIMALS));
    entity.prjToken = prjToken.symbol();
    entity.lendingToken = lendingToken.symbol();
    entity.type = LEVERAGE_BORROW;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.user;
    entity.prjTokenAddress = event.params.projectToken;
    entity.lendingTokenAddress = event.params.lendingToken;
    entity.exposureLendingCount = event.params.lendingAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(lendingToken.decimals()));
    entity.save();
}
