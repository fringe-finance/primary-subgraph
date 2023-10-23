import { Address, BigDecimal, Entity } from "@graphprotocol/graph-ts";

import {
    LeveragedBorrow,
    PrimaryLendingPlatformLeverage
} from "../../generated/PrimaryLendingPlatformLeverage/PrimaryLendingPlatformLeverage";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";
import {
    CollateralDepositedHistory,
    PITTokenHistory,
    OutstandingHistory,
    ProjectToken
} from "../../generated/schema";

import { TOTAL_AMOUNT_COLLATERAL_DEPOSITED } from "../constants/chartsType";

import { getLendingTokensList, getPrjTokensList } from "../utils/token.util";
import { getTotalOutstandingPerLendingTokenInUSD } from "../utils/loan.util";
import { getUsdOraclePrice } from "../utils/priceOracle.util";

import { updateTotalState } from "./updateTotalState.handler";
import { IEvent } from "../interface/event.interface";
import { ERC20 } from "../../generated/PrimaryLendingPlatformV3/ERC20";
import { exponentToBigDecimal } from "../helper/common.helper";

export function handleMultiHistories<T extends IEvent>(event: T): void {
    const totalStateUpdated = getUpdatedState<T>(event);
    updateCollateralDepositedHistory<T>(event, Address.zero(), totalStateUpdated[0]);
    updatePITTokenHistory<T>(event, totalStateUpdated[1]);

    const totalOutstandingAmountInUSD = handleMultiHistoriesPerLending<T>(event);
    updateOutstandingHistory<T>(event, Address.zero(), totalOutstandingAmountInUSD);
}

function handleMultiHistoriesPerLending<T extends IEvent>(event: T): BigDecimal {
    let primaryLendingPlatformAddress = event.address;
    if (event instanceof LeveragedBorrow) {
        primaryLendingPlatformAddress = PrimaryLendingPlatformLeverage.bind(
            event.address
        ).primaryLendingPlatform();
    }

    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);
    const lendingTokens = getLendingTokensList(primaryLendingPlatformV3);

    let totalOutstandingAmountInUSD = BigDecimal.fromString("0");
    for (let i = 0; i < lendingTokens.length; i++) {
        const outstandingAmountInUSD = getTotalOutstandingPerLendingTokenInUSD(
            event,
            primaryLendingPlatformV3,
            lendingTokens[i]
        );

        totalOutstandingAmountInUSD = totalOutstandingAmountInUSD.plus(outstandingAmountInUSD);
        updateOutstandingHistory(event, lendingTokens[i], outstandingAmountInUSD);
    }
    return totalOutstandingAmountInUSD;
}

function getUpdatedState<T extends IEvent>(event: T): Array<BigDecimal> {
    let primaryLendingPlatformAddress = event.address;
    if (event instanceof LeveragedBorrow) {
        primaryLendingPlatformAddress = PrimaryLendingPlatformLeverage.bind(
            event.address
        ).primaryLendingPlatform();
    }
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);
    const projectTokens = getPrjTokensList(primaryLendingPlatformV3);

    let usdAmount = BigDecimal.fromString("0");
    let totalPITAmount = BigDecimal.fromString("0");

    for (let i = 0; i < projectTokens.length; i++) {
        const totalDepositedPerToken = primaryLendingPlatformV3.totalDepositedPerProjectToken(
            projectTokens[i]
        );
        const usdOraclePrice = getUsdOraclePrice(
            primaryLendingPlatformV3,
            projectTokens[i],
            totalDepositedPerToken
        );
        usdAmount = usdAmount.plus(usdOraclePrice);

        const lvr = primaryLendingPlatformV3.projectTokenInfo(projectTokens[i]).getLoanToValueRatio();
        const pitAmount = usdOraclePrice
            .times(BigDecimal.fromString(lvr.numerator.toString()))
            .div(BigDecimal.fromString(lvr.denominator.toString()));
        totalPITAmount = totalPITAmount.plus(pitAmount);

        const projectToken = ERC20.bind(projectTokens[i]);
        const depositedAmount = totalDepositedPerToken
            .toBigDecimal()
            .div(exponentToBigDecimal(projectToken.decimals()));

        updateProjectTokenState(event, projectTokens[i], depositedAmount, pitAmount);
    }
    return [usdAmount, totalPITAmount];
}

function updateProjectTokenState<T extends IEvent>(
    event: T,
    projectTokenAddress: Address,
    depositedAmount: BigDecimal,
    pitAmount: BigDecimal
): void {
    const projectTokenId = projectTokenAddress.toHex();
    const projectToken = ProjectToken.load(projectTokenId);
    if (!projectToken) return;

    projectToken.depositedAmount = depositedAmount;
    projectToken.pitAmount = pitAmount;
    projectToken.updatedAt = event.block.timestamp;

    const depositLimitAmount = projectToken.depositingLevelAmount;
    if (depositLimitAmount)
        projectToken.currentDepositingLevel = depositLimitAmount.notEqual(BigDecimal.fromString("0"))
            ? depositedAmount.div(depositLimitAmount).times(BigDecimal.fromString("100"))
            : BigDecimal.fromString("0");

    projectToken.save();
}

function updateCollateralDepositedHistory<T extends IEvent>(
    event: T,
    lendingTokenAddress: Address,
    collateralAmount: BigDecimal
): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id =
        lendingTokenAddress == Address.zero()
            ? txhash + "-" + logIndex
            : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = CollateralDepositedHistory.load(id);
    if (!entity) entity = new CollateralDepositedHistory(id);

    entity.amount = collateralAmount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
    if (lendingTokenAddress == Address.zero()) {
        updateTotalState<T>(event, TOTAL_AMOUNT_COLLATERAL_DEPOSITED, Address.zero(), collateralAmount);
    }
}

function updatePITTokenHistory<T extends IEvent>(event: T, pitAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (!entity) entity = new PITTokenHistory(id);

    entity.amount = pitAmount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

function updateOutstandingHistory<T extends IEvent>(
    event: T,
    lendingTokenAddress: Address,
    outstandingAmount: BigDecimal
): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id =
        lendingTokenAddress == Address.zero()
            ? txhash + "-" + logIndex
            : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = OutstandingHistory.load(id);
    if (!entity) entity = new OutstandingHistory(id);

    entity.amount = outstandingAmount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}
