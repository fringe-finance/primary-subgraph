import { Address, BigDecimal, BigInt, Bytes, store } from "@graphprotocol/graph-ts";

import {
    LeveragePositionData,
    LongAssetCountState,
    PositionByLendingToken,
    PositionByProjectToken,
    PositionByUser,
    ShortAssetCountState
} from "../../generated/schema";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

export function isNeedToUpdatePositionData(
    account: Address,
    projectToken: Address,
    lendingToken: Address
): boolean {
    const userOpenPositionId = account.toHex();
    const userOpenPosition = PositionByUser.load(userOpenPositionId);
    if (!userOpenPosition) return false;

    const leveragePositions = userOpenPosition.positions.load();
    for (let i = 0; i < leveragePositions.length; i++) {
        const leveragePosition = leveragePositions[i];
        if (
            (leveragePosition.longAsset.equals(projectToken) ||
                leveragePosition.shortAsset.equals(lendingToken)) &&
            leveragePosition.longCount.gt(BigDecimal.fromString("0")) &&
            leveragePosition.shortCount.gt(BigDecimal.fromString("0") as BigDecimal)
        ) {
            return true;
        }
    }
    return false;
}

export function reduceDepositedLongAsset(
    account: Address,
    projectToken: Address,
    isWithdraw: boolean,
    primaryLendingPlatformV3Address: Address
): void {
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformV3Address);
    const remainingDepositedCount = primaryLendingPlatformV3.depositedAmount(account, projectToken);

    if (remainingDepositedCount.equals(BigInt.fromString("0")) && !isWithdraw) return;

    const longAssetCountId = account.toHex() + "-" + projectToken.toHex();
    const longAssetCountState = LongAssetCountState.load(longAssetCountId);
    if (!longAssetCountState) return;

    const totalLongAssetCountOfProjectToken = longAssetCountState.currentTotalLongAssetCount;
    if (remainingDepositedCount.toBigDecimal().lt(totalLongAssetCountOfProjectToken)) {
        longAssetCountState.currentTotalLongAssetCount = remainingDepositedCount.toBigDecimal();
        longAssetCountState.save();

        const positionByProjectTokenId = account.toHex() + "-" + projectToken.toHex();
        const positionsByProjectToken = PositionByProjectToken.load(positionByProjectTokenId);
        if (!positionsByProjectToken) return;

        const leveragePositions = positionsByProjectToken.positions.load();
        for (let i = 0; i < leveragePositions.length; i++) {
            const leveragePosition = leveragePositions[i];
            if (remainingDepositedCount.equals(BigInt.fromString("0")))
                deleteLeveragePosition(leveragePosition.id, projectToken, leveragePosition.shortAsset);
            else {
                leveragePosition.longCount = leveragePosition.longCount
                    .times(remainingDepositedCount.toBigDecimal())
                    .div(totalLongAssetCountOfProjectToken);

                leveragePosition.save();
            }
        }
    }
}

export function addDepositedLongAsset(
    account: Address,
    projectToken: Address,
    primaryLendingPlatformV3Address: Address
): void {
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformV3Address);
    let remainingDepositedCount = primaryLendingPlatformV3
        .depositedAmount(account, projectToken)
        .toBigDecimal();

    const longAssetCountId = account.toHex() + "-" + projectToken.toHex();
    const longAssetCountState = LongAssetCountState.load(longAssetCountId);
    if (!longAssetCountState) return;

    const currentLongAssetCountOfProjectToken = longAssetCountState.currentTotalLongAssetCount;
    const maxLongAssetCountOfProjectToken = longAssetCountState.maxTotalLongAssetCount;
    if (remainingDepositedCount.gt(maxLongAssetCountOfProjectToken))
        remainingDepositedCount = maxLongAssetCountOfProjectToken;

    longAssetCountState.currentTotalLongAssetCount = remainingDepositedCount;
    longAssetCountState.save();

    const positionByProjectTokenId = account.toHex() + "-" + projectToken.toHex();
    const positionByProjectToken = PositionByProjectToken.load(positionByProjectTokenId);
    if (!positionByProjectToken) return;

    const leveragePositions = positionByProjectToken.positions.load();
    for (let i = 0; i < leveragePositions.length; i++) {
        const leveragePosition = leveragePositions[i];
        leveragePosition.longCount = leveragePosition.longCount
            .times(remainingDepositedCount)
            .div(currentLongAssetCountOfProjectToken);

        leveragePosition.save();
    }
}
export function reduceShortAsset(
    account: Address,
    lendingToken: Address,
    primaryLendingPlatformV3Address: Address
): void {
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformV3Address);
    const borrowPosition = primaryLendingPlatformV3.borrowPosition(account, lendingToken);
    const totalBorrowCount = borrowPosition.getLoanBody().plus(borrowPosition.getAccrual());

    const shortAssetCountId = account.toHex() + "-" + lendingToken.toHex();
    const shortAssetCountState = ShortAssetCountState.load(shortAssetCountId);
    if (!shortAssetCountState) return;

    const totalShortAssetCountOfLendingToken = shortAssetCountState.currentShortAssetCount;
    if (totalBorrowCount.toBigDecimal().lt(totalShortAssetCountOfLendingToken)) {
        shortAssetCountState.currentShortAssetCount = totalBorrowCount.toBigDecimal();
        shortAssetCountState.save();

        const positionByLendingTokenId = account.toHex() + "-" + lendingToken.toHex();
        const positionsByProjectToken = PositionByLendingToken.load(positionByLendingTokenId);
        if (!positionsByProjectToken) return;

        const leveragePositions = positionsByProjectToken.positions.load();
        for (let i = 0; i < leveragePositions.length; i++) {
            const leveragePosition = leveragePositions[i];
            leveragePosition.shortCount = leveragePosition.shortCount
                .times(totalBorrowCount.toBigDecimal())
                .div(totalShortAssetCountOfLendingToken);
            leveragePosition.save();

            if (totalBorrowCount.equals(BigInt.fromString("0")))
                deleteLeveragePosition(leveragePosition.id, leveragePosition.longAsset, lendingToken);
        }
    }
}

export function addShortAsset(
    account: Address,
    lendingToken: Address,
    primaryLendingPlatformV3Address: Address
): void {
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformV3Address);
    const borrowPosition = primaryLendingPlatformV3.borrowPosition(account, lendingToken);
    let totalBorrowCount = borrowPosition
        .getLoanBody()
        .plus(borrowPosition.getAccrual())
        .toBigDecimal();

    const shortAssetCountId = account.toHex() + "-" + lendingToken.toHex();
    const shortAssetCountState = ShortAssetCountState.load(shortAssetCountId);
    if (!shortAssetCountState) return;

    const currentShortAssetCountOfLendingToken = shortAssetCountState.currentShortAssetCount;
    const maxShortAssetCountOfLendingToken = shortAssetCountState.maxTotalShortAssetCount;

    if (currentShortAssetCountOfLendingToken.equals(maxShortAssetCountOfLendingToken)) return;

    if (totalBorrowCount.gt(maxShortAssetCountOfLendingToken))
        totalBorrowCount = maxShortAssetCountOfLendingToken;

    shortAssetCountState.currentShortAssetCount = totalBorrowCount;
    shortAssetCountState.save();

    const positionByLendingTokenId = account.toHex() + "-" + lendingToken.toHex();
    const positionsByProjectToken = PositionByLendingToken.load(positionByLendingTokenId);
    if (!positionsByProjectToken) return;

    const leveragePositions = positionsByProjectToken.positions.load();
    for (let i = 0; i < leveragePositions.length; i++) {
        const leveragePosition = leveragePositions[i];
        leveragePosition.shortCount = leveragePosition.shortCount
            .times(totalBorrowCount)
            .div(currentShortAssetCountOfLendingToken);
        leveragePosition.save();
    }
}

export function deleteLeveragePosition(
    leveragePositionId: string,
    projectToken: Bytes,
    lendingToken: Bytes
): void {
    const leveragePosition = LeveragePositionData.load(leveragePositionId);
    if (!leveragePosition) return;

    if (
        leveragePosition.shortAsset.equals(lendingToken) &&
        (leveragePosition.shortCount.equals(BigDecimal.fromString("0")) ||
            leveragePosition.longCount.equals(BigDecimal.fromString("0")))
    ) {
        if (leveragePosition.shortCount.equals(BigDecimal.fromString("0"))) {
            const longAssetCountId = leveragePosition.borrowerAddress + "-" + projectToken.toHex();
            const longAssetCountState = LongAssetCountState.load(longAssetCountId);
            if (!longAssetCountState) return;

            longAssetCountState.currentTotalLongAssetCount = longAssetCountState.currentTotalLongAssetCount.minus(
                leveragePosition.longCount
            );
            longAssetCountState.maxTotalLongAssetCount = longAssetCountState.currentTotalLongAssetCount;
            longAssetCountState.save();
        } else {
            const shortAssetCountId = leveragePosition.borrowerAddress + "-" + lendingToken.toHex();
            const shortAssetCountState = ShortAssetCountState.load(shortAssetCountId);
            if (!shortAssetCountState) return;

            shortAssetCountState.currentShortAssetCount = shortAssetCountState.currentShortAssetCount.minus(
                leveragePosition.shortCount
            );
            shortAssetCountState.maxTotalShortAssetCount = shortAssetCountState.currentShortAssetCount;
            shortAssetCountState.save();
        }
        store.remove("LeveragePositionData", leveragePositionId);
    }
}
