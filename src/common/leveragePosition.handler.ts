import { Address, BigDecimal, BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
    LeveragePositionData,
    LongAssetCountState,
    PositionByLendingToken,
    PositionByProjectToken,
    PositionByUser,
    ShortAssetCountState
} from "../../generated/schema";
import {
    PrimaryLendingPlatformV3,
    RepayBorrow
} from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";
import { getUsdOraclePrice } from "../utils/priceOracle.util";
import { AssetType } from "../constants/assetsType";

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
            const newLongCount = leveragePosition.longCount
                .times(remainingDepositedCount.toBigDecimal())
                .div(totalLongAssetCountOfProjectToken);

            leveragePosition.exposureAmount = getUsdOraclePrice(
                primaryLendingPlatformV3,
                projectToken,
                BigInt.fromString(newLongCount.truncate(0).toString()),
                AssetType.COLLATERAL
            );

            leveragePosition.longCount = leveragePosition.longCount
                .times(remainingDepositedCount.toBigDecimal())
                .div(totalLongAssetCountOfProjectToken);

            leveragePosition.save();

            if (remainingDepositedCount.equals(BigInt.fromString("0"))) {
                deleteLeveragePosition(leveragePosition.id, projectToken, leveragePosition.shortAsset);
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
        if (currentLongAssetCountOfProjectToken.equals(BigDecimal.fromString("0"))) {
            leveragePosition.longCount = BigDecimal.fromString("0");
            leveragePosition.exposureAmount = BigDecimal.fromString("0");
        } else {
            const newLongCount = leveragePosition.longCount
                .times(remainingDepositedCount)
                .div(currentLongAssetCountOfProjectToken);

            leveragePosition.exposureAmount = getUsdOraclePrice(
                primaryLendingPlatformV3,
                projectToken,
                BigInt.fromString(newLongCount.truncate(0).toString()),
                AssetType.COLLATERAL
            );

            leveragePosition.longCount = leveragePosition.longCount
                .times(remainingDepositedCount)
                .div(currentLongAssetCountOfProjectToken);
        }

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

    const totalShortAssetCountOfLendingToken = shortAssetCountState.currentTotalShortAssetCount;
    if (totalBorrowCount.toBigDecimal().lt(totalShortAssetCountOfLendingToken)) {
        shortAssetCountState.currentTotalShortAssetCount = totalBorrowCount.toBigDecimal();
        shortAssetCountState.save();

        const positionByLendingTokenId = account.toHex() + "-" + lendingToken.toHex();
        const positionsByLendingToken = PositionByLendingToken.load(positionByLendingTokenId);
        if (!positionsByLendingToken) return;

        const leveragePositions = positionsByLendingToken.positions.load();
        for (let i = 0; i < leveragePositions.length; i++) {
            const leveragePosition = leveragePositions[i];
            leveragePosition.shortCount = leveragePosition.shortCount
                .times(totalBorrowCount.toBigDecimal())
                .div(totalShortAssetCountOfLendingToken);
            leveragePosition.save();

            log.info("lending token: {}", [lendingToken.toString()]);
            if (totalBorrowCount.equals(BigInt.fromString("0"))) {
                deleteLeveragePosition(leveragePosition.id, leveragePosition.longAsset, lendingToken);
            }
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

    const currentShortAssetCountOfLendingToken = shortAssetCountState.currentTotalShortAssetCount;
    const maxShortAssetCountOfLendingToken = shortAssetCountState.maxTotalShortAssetCount;

    if (currentShortAssetCountOfLendingToken.equals(maxShortAssetCountOfLendingToken)) return;

    if (totalBorrowCount.gt(maxShortAssetCountOfLendingToken))
        totalBorrowCount = maxShortAssetCountOfLendingToken;

    shortAssetCountState.currentTotalShortAssetCount = totalBorrowCount;
    shortAssetCountState.save();

    const positionByLendingTokenId = account.toHex() + "-" + lendingToken.toHex();
    const positionsByLendingToken = PositionByLendingToken.load(positionByLendingTokenId);
    if (!positionsByLendingToken) return;

    const leveragePositions = positionsByLendingToken.positions.load();
    for (let i = 0; i < leveragePositions.length; i++) {
        const leveragePosition = leveragePositions[i];
        if (currentShortAssetCountOfLendingToken.equals(BigDecimal.fromString("0"))) {
            leveragePosition.shortCount = BigDecimal.fromString("0");
        } else {
            leveragePosition.shortCount = leveragePosition.shortCount
                .times(totalBorrowCount)
                .div(currentShortAssetCountOfLendingToken);
        }
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

    log.info("Delete leverage position: {}", [leveragePositionId]);
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

            shortAssetCountState.currentTotalShortAssetCount = shortAssetCountState.currentTotalShortAssetCount.minus(
                leveragePosition.shortCount
            );
            shortAssetCountState.maxTotalShortAssetCount = shortAssetCountState.currentTotalShortAssetCount;
            shortAssetCountState.save();
        }
        log.info("Delete leverage position: {}", [leveragePositionId]);
        store.remove("LeveragePositionData", leveragePositionId);
    }
}
