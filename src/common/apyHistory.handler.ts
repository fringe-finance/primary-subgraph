import { Address, BigDecimal } from "@graphprotocol/graph-ts";

import {
    LeveragedBorrow,
    PrimaryLendingPlatformLeverage
} from "../../generated/PrimaryLendingPlatformLeverage/PrimaryLendingPlatformLeverage";
import {
    LenderAPYHistory,
    BorrowingAPYHistory,
    LenderAggregateCapitalDepositedHistory
} from "../../generated/schema";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

import { BORROWING_APY, LENDER_APY } from "../constants/chartsType";

import { getLendingTokensList } from "../utils/token.util";
import { getBorrowingAPYPerLendingToken, getLenderAPYPerLendingToken } from "../utils/interestRate.util";
import { getLenderAggregateCapitalDepositedPerLendingToken } from "../utils/priceOracle.util";

import { updateTotalState } from "./updateTotalState.handler";

import { IEvent } from "../interface/event.interface";

export function handleAPYHistories<T extends IEvent>(event: T): void {
    handleLenderAPYHistory<T>(event);
    handleBorrowingAPYHistory<T>(event);
    handleLenderAggregateCapitalDepositedHistory<T>(event);
}

function handleLenderAPYHistory<T extends IEvent>(event: T): void {
    let primaryLendingPlatformAddress = event.address;
    if (event instanceof LeveragedBorrow) {
        primaryLendingPlatformAddress = PrimaryLendingPlatformLeverage.bind(
            event.address
        ).primaryLendingPlatform();
    }

    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);
    const lendingTokens = getLendingTokensList(primaryLendingPlatformV3);
    let totalLenderAPY = BigDecimal.fromString("0");

    for (let i = 0; i < lendingTokens.length; i++) {
        const lenderAPY = getLenderAPYPerLendingToken(primaryLendingPlatformV3, lendingTokens[i]);
        totalLenderAPY = totalLenderAPY.plus(lenderAPY);

        updateLenderAPYHistory<T>(event, lendingTokens[i], lenderAPY);
    }

    updateLenderAPYHistory<T>(
        event,
        Address.zero(),
        totalLenderAPY.div(BigDecimal.fromString(lendingTokens.length.toString()))
    );
}

function handleBorrowingAPYHistory<T extends IEvent>(event: T): void {
    let primaryLendingPlatformAddress = event.address;
    if (event instanceof LeveragedBorrow) {
        primaryLendingPlatformAddress = PrimaryLendingPlatformLeverage.bind(
            event.address
        ).primaryLendingPlatform();
    }

    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);
    const lendingTokens = getLendingTokensList(primaryLendingPlatformV3);
    let totalBorrowingAPY = BigDecimal.fromString("0");

    for (let i = 0; i < lendingTokens.length; i++) {
        const borrowingAPY = getBorrowingAPYPerLendingToken(primaryLendingPlatformV3, lendingTokens[i]);
        totalBorrowingAPY = totalBorrowingAPY.plus(borrowingAPY);

        updateBorrowingAPYHistory<T>(event, lendingTokens[i], borrowingAPY);
    }

    updateBorrowingAPYHistory<T>(
        event,
        Address.zero(),
        totalBorrowingAPY.div(BigDecimal.fromString(lendingTokens.length.toString()))
    );
}

function handleLenderAggregateCapitalDepositedHistory<T extends IEvent>(event: T): void {
    let primaryLendingPlatformAddress = event.address;
    if (event instanceof LeveragedBorrow) {
        primaryLendingPlatformAddress = PrimaryLendingPlatformLeverage.bind(
            event.address
        ).primaryLendingPlatform();
    }

    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);
    const lendingTokens = getLendingTokensList(primaryLendingPlatformV3);
    let totalSupply = BigDecimal.fromString("0");

    for (let i = 0; i < lendingTokens.length; i++) {
        const supplyAmount = getLenderAggregateCapitalDepositedPerLendingToken(
            primaryLendingPlatformV3,
            lendingTokens[i]
        );
        totalSupply = totalSupply.plus(supplyAmount);

        updateLenderAggregateCapitalDepositedHistory<T>(event, lendingTokens[i], supplyAmount);
    }

    updateLenderAggregateCapitalDepositedHistory<T>(event, Address.zero(), totalSupply);
}

function updateLenderAPYHistory<T extends IEvent>(
    event: T,
    lendingTokenAddress: Address,
    lenderAPY: BigDecimal
): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id =
        lendingTokenAddress == Address.zero()
            ? txhash + "-" + logIndex
            : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = LenderAPYHistory.load(id);
    if (!entity) entity = new LenderAPYHistory(id);

    entity.amount = lenderAPY;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();

    lendingTokenAddress == Address.zero()
        ? updateTotalState<T>(event, LENDER_APY, Address.zero(), lenderAPY)
        : updateTotalState<T>(event, LENDER_APY, lendingTokenAddress, lenderAPY);
}

function updateLenderAggregateCapitalDepositedHistory<T extends IEvent>(
    event: T,
    lendingTokenAddress: Address,
    totalSupply: BigDecimal
): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id =
        lendingTokenAddress == Address.zero()
            ? txhash + "-" + logIndex
            : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = LenderAggregateCapitalDepositedHistory.load(id);
    if (!entity) entity = new LenderAggregateCapitalDepositedHistory(id);

    entity.amount = totalSupply;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

function updateBorrowingAPYHistory<T extends IEvent>(
    event: T,
    lendingTokenAddress: Address,
    borrowingAPY: BigDecimal
): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id =
        lendingTokenAddress == Address.zero()
            ? txhash + "-" + logIndex
            : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = BorrowingAPYHistory.load(id);
    if (!entity) entity = new BorrowingAPYHistory(id);

    entity.amount = borrowingAPY;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
    lendingTokenAddress == Address.zero()
        ? updateTotalState<T>(event, BORROWING_APY, Address.zero(), borrowingAPY)
        : updateTotalState<T>(event, BORROWING_APY, lendingTokenAddress, borrowingAPY);
}
