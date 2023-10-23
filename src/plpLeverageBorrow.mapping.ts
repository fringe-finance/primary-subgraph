import { Address, BigDecimal, BigInt, ByteArray, Bytes, crypto, dataSource } from "@graphprotocol/graph-ts";

import {
    ClosePosition,
    LeveragedBorrow,
    PrimaryLendingPlatformLeverage
} from "../generated/PrimaryLendingPlatformLeverage/PrimaryLendingPlatformLeverage";
import {
    LeveragePositionData,
    LeveragedBorrowLog,
    LongAssetCountState,
    PositionByLendingToken,
    PositionByProjectToken,
    PositionByUser,
    ShortAssetCountState
} from "../generated/schema";
import { PrimaryLendingPlatformV3 } from "../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";
import { ERC20 } from "../generated/PrimaryLendingPlatformV3/ERC20";

import { LEVERAGE_BORROW } from "./constants/eventsType";
import { USD_DECIMALS } from "./constants/decimals";

import { exponentToBigDecimal } from "./helper/common.helper";

import { handleBorrowedState } from "./common/borrowState.handler";
import { handleMultiHistories } from "./common/multiHistories.handler";
import { handleAPYHistories } from "./common/apyHistory.handler";
import { deleteLeveragePosition } from "./common/leveragePosition.handler";

import { getUsdOraclePrice } from "./utils/priceOracle.util";

export function handleLeveragedBorrow(event: LeveragedBorrow): void {
    handleLeveragedBorrowLog(event);
    handleOpenLeverageBorrowPosition(event);
    handleBorrowedState<LeveragedBorrow>(event);
    handleMultiHistories<LeveragedBorrow>(event);
    handleAPYHistories<LeveragedBorrow>(event);
}

export function handleClosePosition(event: ClosePosition): void {
    const shortAssetCountId = event.params.borrower.toHex() + "-" + event.params.lendingToken.toHex();
    const shortAssetCountState = ShortAssetCountState.load(shortAssetCountId);
    if (!shortAssetCountState) return;

    const leveragePosition = LeveragePositionData.load(event.params.positionId.toHex());
    if (!leveragePosition) return;

    if (event.params.lendingTokenAmount.toBigDecimal().ge(shortAssetCountState.closeShortAmount)) {
        deleteLeveragePosition(
            event.params.positionId.toHex(),
            leveragePosition.longAsset,
            event.params.lendingToken
        );
    } else {
        leveragePosition.shortCount = shortAssetCountState.closeShortAmount.minus(
            event.params.lendingTokenAmount.toBigDecimal()
        );
        leveragePosition.save();

        shortAssetCountState.currentShortAssetCount = shortAssetCountState.currentShortAssetCount.plus(
            shortAssetCountState.closeShortAmount.minus(event.params.lendingTokenAmount.toBigDecimal())
        );
        shortAssetCountState.maxTotalShortAssetCount = shortAssetCountState.currentShortAssetCount;
        shortAssetCountState.closeShortAmount = BigDecimal.fromString("0");
        shortAssetCountState.save();
    }
}

function handleOpenLeverageBorrowPosition(event: LeveragedBorrow): void {
    const projectTokenAddress = event.params.projectToken;
    const lendingTokenAddress = event.params.lendingToken;
    const borrower = event.params.user;

    const transactionHash = event.transaction.hash.toHex().padEnd(66, '0');
    const logIndex = event.logIndex.toHex().padEnd(66, '0');
    const id = crypto.keccak256(ByteArray.fromHexString(transactionHash.concat(logIndex))).toHexString();

    const leveragePosition = new LeveragePositionData(id);

    leveragePosition.borrowerAddress = borrower.toHex();
    leveragePosition.longAsset = event.params.projectToken;
    leveragePosition.shortAsset = event.params.lendingToken;
    leveragePosition.longCount = event.params.amountReceive.toBigDecimal();
    leveragePosition.shortCount = event.params.lendingAmount.toBigDecimal();
    leveragePosition.leverageType = event.params.leverageType;
    leveragePosition.projectTokenRefId = borrower.toHex() + "-" + projectTokenAddress.toHex();
    leveragePosition.lendingTokenRefId = borrower.toHex() + "-" + lendingTokenAddress.toHex();
    leveragePosition.save();

    updateLongAssetCountState(event, borrower, projectTokenAddress);
    updateShortAssetCountState(event, borrower, lendingTokenAddress);
    initUserOpenPositionIfNotExist(borrower, projectTokenAddress, lendingTokenAddress);
}

function handleLeveragedBorrowLog(event: LeveragedBorrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;
    const primaryLendingPlatformLeverage = PrimaryLendingPlatformLeverage.bind(dataSource.address());
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(
        primaryLendingPlatformLeverage.primaryLendingPlatform()
    );

    let entity = LeveragedBorrowLog.load(id);
    if (!entity) entity = new LeveragedBorrowLog(id);

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

function updateLongAssetCountState(
    event: LeveragedBorrow,
    userAddress: Address,
    projectToken: Address
): void {
    const id = userAddress.toHex() + "-" + projectToken.toHex();
    let entity = LongAssetCountState.load(id);
    if (!entity) {
        entity = new LongAssetCountState(id);
        entity.currentTotalLongAssetCount = event.params.amountReceive.toBigDecimal();
        entity.maxTotalLongAssetCount = event.params.amountReceive.toBigDecimal();
    } else {
        entity.currentTotalLongAssetCount = entity.currentTotalLongAssetCount.plus(
            event.params.amountReceive.toBigDecimal()
        );
        entity.maxTotalLongAssetCount = entity.currentTotalLongAssetCount;
    }
    entity.save();
}

function updateShortAssetCountState(
    event: LeveragedBorrow,
    userAddress: Address,
    lendingToken: Address
): void {
    const id = userAddress.toHex() + "-" + lendingToken.toHex();
    let entity = ShortAssetCountState.load(id);
    if (!entity) {
        entity = new ShortAssetCountState(id);
        entity.currentShortAssetCount = event.params.lendingAmount.toBigDecimal();
        entity.maxTotalShortAssetCount = event.params.lendingAmount.toBigDecimal();
    } else {
        entity.currentShortAssetCount = entity.currentShortAssetCount.plus(
            event.params.lendingAmount.toBigDecimal()
        );
        entity.maxTotalShortAssetCount = entity.currentShortAssetCount;
    }
    entity.closeShortAmount = BigDecimal.fromString("0");
    entity.save();
}

function initUserOpenPositionIfNotExist(
    userAddress: Address,
    projectTokenAddress: Address,
    lendingTokenAddress: Address
): void {
    initPositionByUsernIfNotExist(userAddress);
    initPositionByProjectTokenIfNotExist(userAddress, projectTokenAddress);
    initPositionByLendingTokenIfNotExist(userAddress, lendingTokenAddress);
}

function initPositionByUsernIfNotExist(userAddress: Address): void {
    const id = userAddress.toHex();
    let entity = PositionByUser.load(id);
    if (entity) return;

    entity = new PositionByUser(id);
    entity.save();
}

function initPositionByProjectTokenIfNotExist(userAddress: Address, projectTokenAddress: Address): void {
    const id = userAddress.toHex() + "-" + projectTokenAddress.toHex();
    let entity = PositionByProjectToken.load(id);
    if (entity) return;

    entity = new PositionByProjectToken(id);
    entity.save();
}

function initPositionByLendingTokenIfNotExist(userAddress: Address, lendingTokenAddress: Address): void {
    const id = userAddress.toHex() + "-" + lendingTokenAddress.toHex();
    let entity = PositionByLendingToken.load(id);
    if (entity) return;

    entity = new PositionByLendingToken(id);
    entity.save();
}
