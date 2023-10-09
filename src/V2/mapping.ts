import {
    LeveragedBorrow,
    PrimaryLendingPlatformLeverage
} from "../../generated/PrimaryLendingPlatformLeverage/PrimaryLendingPlatformLeverage";
import { UniswapV2Pair } from "../../generated/PrimaryLendingPlatformModerator/UniswapV2Pair";
import {
    LenderAPYHistory,
    BorrowingAPYHistory,
    LenderAggregateCapitalDepositedHistory,
    BorrowedState,
    Borrower,
    ERC20Token,
    LeveragedBorrowLog
} from "../../generated/schema";
import { BLendingToken } from "../../generated/PrimaryLendingPlatformV2/BLendingToken";
import { PriceProviderAggregator } from "../../generated/PrimaryLendingPlatformV2/PriceProviderAggregator";
import {
    Borrow,
    Deposit,
    PrimaryLendingPlatformV2,
    Redeem,
    RedeemUnderlying,
    RepayBorrow,
    RoleAdminChanged,
    RoleGranted,
    RoleRevoked,
    Supply,
    Withdraw
} from "../../generated/PrimaryLendingPlatformV2/PrimaryLendingPlatformV2";
import {
    AddPrjToken,
    AddLendingToken,
    LoanToValueRatioSet,
    RemoveProjectToken,
    RemoveLendingToken,
    SetPausedProjectToken,
    SetPausedLendingToken,
    SetBorrowLimitPerCollateralAsset,
    SetBorrowLimitPerLendingAsset
} from "../../generated/PrimaryLendingPlatformModerator/PrimaryLendingPlatformModerator";

import { ERC20 } from "../../generated/PrimaryLendingPlatformV2/ERC20";
import {
    BorrowLog,
    CollateralDepositedHistory,
    LendingToken,
    PITTokenHistory,
    ProjectToken,
    OutstandingHistory,
    CollateralVSLoanRatioHistory,
    TotalState
} from "../../generated/schema";
import { BORROWING_APY, LENDER_APY, TOTAL_AMOUNT_COLLATERAL_DEPOSITED } from "../constants/chartsType";
import { DEPOSIT, BORROW, REPAY, WITHDRAW, LEVERAGE_BORROW } from "../constants/eventsType";
import { USD_DECIMALS, SCALE_DECIMALS } from "../constants/decimals";
import { DAY_PER_YEAR, BLOCKS_PER_DAY } from "../constants/configs";
import { exponentToBigDecimal, pow } from "../helper/common.helper";
import { Address, BigDecimal, BigInt, store, dataSource, log } from "@graphprotocol/graph-ts";

export function handleAddPrjToken(event: AddPrjToken): void {
    const id = event.params.tokenPrj.toHex();
    let isAddNew = false;
    let entity = ProjectToken.load(id);
    if (entity == null) {
        entity = new ProjectToken(id);
        isAddNew = true;
    }
    const token = ERC20.bind(event.params.tokenPrj);
    entity.address = event.params.tokenPrj;
    entity.name = token.name();
    entity.symbol = token.symbol();
    entity.updatedAt = event.block.timestamp;
    entity.underlyingTokens = handleAddNewUnderlyingTokens(event.params.tokenPrj, isAddNew);
    entity.save();
}

export function handleAddLendingToken(event: AddLendingToken): void {
    const id = event.params.lendingToken.toHex();
    let isAddNew = false;
    let entity = LendingToken.load(id);
    if (entity == null) {
        entity = new LendingToken(id);
        isAddNew = true;
    }
    const token = ERC20.bind(event.params.lendingToken);
    entity.address = event.params.lendingToken;
    entity.name = token.name();
    entity.symbol = token.symbol();
    entity.updatedAt = event.block.timestamp;
    entity.underlyingTokens = handleAddNewUnderlyingTokens(event.params.lendingToken, isAddNew);
    entity.save();
}

export function handleRemoveProjectToken(event: RemoveProjectToken): void {
    const id = event.params.tokenPrj.toHex();

    let entity = ProjectToken.load(id);
    if (entity == null) {
        return;
    }
    decreaseUnderlyingToken<ProjectToken>(entity);
    store.remove("ProjectToken", id);
}

export function handleRemoveLendingToken(event: RemoveLendingToken): void {
    const id = event.params.lendingToken.toHex();

    let entity = LendingToken.load(id);
    if (entity == null) {
        return;
    }
    decreaseUnderlyingToken<LendingToken>(entity);
    store.remove("LendingToken", id);
}

export function handleSetPausedProjectToken(event: SetPausedProjectToken): void {
    const id = event.params.projectToken.toHex();
    let entity = ProjectToken.load(id);
    if (entity == null) {
        return;
    }
    entity.isDepositPaused = event.params.isDepositPaused;
    entity.isWithdrawPaused = event.params.isWithdrawPaused;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleSetPausedLendingToken(event: SetPausedLendingToken): void {
    const id = event.params.lendingToken.toHex();
    let entity = LendingToken.load(id);
    if (entity == null) {
        return;
    }
    entity.isPaused = event.params.isPaused;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleSetBorrowLimitPerCollateralAsset(event: SetBorrowLimitPerCollateralAsset): void {
    const id = event.params.projectToken.toHex();
    let entity = ProjectToken.load(id);
    if (entity == null) {
        return;
    }

    const borrowLimit = BigDecimal.fromString(event.params.borrowLimit.toString()).div(
        exponentToBigDecimal(USD_DECIMALS)
    );
    const borrowedAmount = entity.borrowedAmount;
    if (borrowedAmount !== null) {
        entity.currentBorrowingLevel = borrowLimit.notEqual(BigDecimal.fromString("0"))
            ? borrowedAmount.div(borrowLimit).times(BigDecimal.fromString("100"))
            : BigDecimal.fromString("0");
    }
    entity.borrowingLevelAmount = borrowLimit;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleSetBorrowLimitPerLendingAsset(event: SetBorrowLimitPerLendingAsset): void {
    const id = event.params.lendingToken.toHex();
    let entity = LendingToken.load(id);
    if (entity == null) {
        return;
    }

    entity.borrowingLevelAmount = BigDecimal.fromString(event.params.borrowLimit.toString()).div(
        exponentToBigDecimal(USD_DECIMALS)
    );
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleLoanToValueRatioSet(event: LoanToValueRatioSet): void {
    const id = event.params.tokenPrj.toHex();
    let entity = ProjectToken.load(id);
    if (entity == null) {
        return;
    }

    const lvrNumerator = BigDecimal.fromString(event.params.lvrNumerator.toString());
    const lvrDenominator = BigDecimal.fromString(event.params.lvrDenominator.toString());
    if (lvrDenominator.equals(BigDecimal.fromString("0"))) {
        return;
    }
    entity.lvr = lvrNumerator.div(lvrDenominator).times(BigDecimal.fromString("100"));
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleDeposit(event: Deposit): void {
    handleBorrowLog<Deposit>(event);
    handleMultiHistories<Deposit>(event);
    handleAPYHistories<Deposit>(event);
}

export function handleWithdraw(event: Withdraw): void {
    handleBorrowLog<Withdraw>(event);
    handleMultiHistories<Withdraw>(event);
    handleAPYHistories<Withdraw>(event);
}

export function handleBorrow(event: Borrow): void {
    handleBorrowLog<Borrow>(event);
    handleBorrowedState(event);
    handleMultiHistories<Borrow>(event);
    handleAPYHistories<Borrow>(event);
}

export function handleRepayBorrow(event: RepayBorrow): void {
    handleBorrowLog<RepayBorrow>(event);
    handleBorrowedState(event);
    handleMultiHistories<RepayBorrow>(event);
    handleAPYHistories<RepayBorrow>(event);
}

export function handleSupply(event: Supply): void {
    handleAPYHistories<Supply>(event);
}

export function handleRedeem(event: Redeem): void {
    handleAPYHistories<Redeem>(event);
}

export function handleRedeemUnderlying(event: RedeemUnderlying): void {
    handleAPYHistories<RedeemUnderlying>(event);
}

export function handleLeveragedBorrow(event: LeveragedBorrow): void {
    handleLeveragedBorrowLog(event);
    handleBorrowedState<LeveragedBorrow>(event);
    handleMultiHistories<LeveragedBorrow>(event);
    handleAPYHistories<LeveragedBorrow>(event);
}

/************************************ Handle ERC20Token ************************************/
function handleAddNewUnderlyingTokens(tokenAddress: Address, isAddNew: boolean): Array<string> {
    let underlyingTokensList = new Array<string>();
    const lpToken = UniswapV2Pair.bind(tokenAddress);
    const existedLPToken = lpToken.try_token0();

    if (!existedLPToken.reverted) {
        const token0Address = existedLPToken.value;
        const token1Address = lpToken.token1();
        increaseUnderlyingToken(token0Address, isAddNew);
        increaseUnderlyingToken(token1Address, isAddNew);
        underlyingTokensList.push(token0Address.toHex());
        underlyingTokensList.push(token1Address.toHex());
    }
    return underlyingTokensList;
}

function increaseUnderlyingToken(tokenAddress: Address, isAddNew: boolean): void {
    const token0 = ERC20.bind(tokenAddress);
    let entity = ERC20Token.load(tokenAddress.toHex());
    if (entity == null) {
        entity = new ERC20Token(tokenAddress.toHex());
        entity.name = token0.name();
        entity.symbol = token0.symbol();
        entity.address = tokenAddress;
    }
    if (isAddNew) {
        let numberOfLinks = entity.linksNumber;
        entity.linksNumber =
            numberOfLinks !== null
                ? numberOfLinks.plus(BigDecimal.fromString("1"))
                : BigDecimal.fromString("1");
    }
    entity.save();
}

function decreaseUnderlyingToken<T>(entity: T): void {
    const underlyingTokens = entity.underlyingTokens;
    if (underlyingTokens !== null) {
        for (let i = 0; i < underlyingTokens.length; i++) {
            let erc20TokenEntity = ERC20Token.load(underlyingTokens[i]);
            if (erc20TokenEntity != null) {
                const numberOfLinks = erc20TokenEntity.linksNumber;
                if (numberOfLinks !== null) {
                    if (numberOfLinks.gt(BigDecimal.fromString("1"))) {
                        erc20TokenEntity.linksNumber = numberOfLinks.minus(BigDecimal.fromString("1"));
                        erc20TokenEntity.save();
                    } else {
                        store.remove("ERC20Token", underlyingTokens[i]);
                    }
                }
            }
        }
    }
}

/************************************ Handle BorrowLog ************************************/
function handleBorrowLog<T>(event: T): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    if (event instanceof Deposit || event instanceof Withdraw) {
        const prjToken = ERC20.bind(event.params.tokenPrj);

        const prjTokenAmount =
            event instanceof Deposit ? event.params.prjDepositAmount : event.params.prjWithdrawAmount;
        entity.amount = prjTokenAmount.toBigDecimal().div(exponentToBigDecimal(prjToken.decimals()));
        entity.asset = prjToken.symbol();
        entity.prjToken = prjToken.symbol();
        entity.type = event instanceof Deposit ? DEPOSIT : WITHDRAW;
        entity.date = event.block.timestamp;
        entity.userAddress = event.params.who;
        entity.prjTokenAddress = event.params.tokenPrj;
    } else {
        const borrowToken = ERC20.bind(event.params.borrowToken);
        const prjToken = ERC20.bind(event.params.prjAddress);

        entity.amount = event.params.borrowAmount
            .toBigDecimal()
            .div(exponentToBigDecimal(borrowToken.decimals()));
        entity.asset = borrowToken.symbol();
        entity.prjToken = prjToken.symbol();
        entity.type = event instanceof Borrow ? BORROW : REPAY;
        entity.date = event.block.timestamp;
        entity.userAddress = event.params.who;
        entity.prjTokenAddress = event.params.prjAddress;
    }
    entity.save();
}

/************************************ Handle LeveragedBorrowLog ************************************/
function handleLeveragedBorrowLog<T>(event: T): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;
    const primaryLendingPlatformLeverage = PrimaryLendingPlatformLeverage.bind(dataSource.address());
    const primaryLendingPlatformV2 = PrimaryLendingPlatformV2.bind(
        primaryLendingPlatformLeverage.primaryLendingPlatform()
    );

    let entity = LeveragedBorrowLog.load(id);
    if (entity == null) {
        entity = new LeveragedBorrowLog(id);
    }

    const prjToken = ERC20.bind(event.params.projectToken);
    const lendingToken = ERC20.bind(event.params.lendingToken);
    const projectTokenPrice = getUsdOraclePrice(
        primaryLendingPlatformV2,
        event.params.projectToken,
        BigInt.fromString(exponentToBigDecimal(prjToken.decimals()).toString())
    );
    entity.prjTokenPrice = projectTokenPrice;
    entity.lendingTokenPrice = getUsdOraclePrice(
        primaryLendingPlatformV2,
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

/************************************ Handle MultiHistories ************************************/
function handleAPYHistories<T>(event: T): void {
    handleLenderAPYHistory<T>(event);
    handleBorrowingAPYHistory<T>(event);
    handleLenderAggregateCapitalDepositedHistory<T>(event);
}

function handleMultiHistories<T>(event: T): void {
    const totalStateUpdated = handlePositionState<T>(event);
    updateCollateralDepositedHistory<T>(event, Address.zero(), totalStateUpdated[0]);
    updatePITTokenHistory<T>(event, totalStateUpdated[1]);

    const totalOutstandingAmount = handleMultiHistoriesPerLending<T>(event);
    updateOutstandingHistory<T>(event, Address.zero(), totalOutstandingAmount);
    updateCollateralVSLoanRatioHistory<T>(
        event,
        Address.zero(),
        BigDecimal.fromString("0"),
        totalOutstandingAmount
    );
}

function handleMultiHistoriesPerLending<T>(event: T): BigDecimal {
    const primaryLendingPlatformV2 = PrimaryLendingPlatformV2.bind(
        event instanceof LeveragedBorrow
            ? PrimaryLendingPlatformLeverage.bind(event.address).primaryLendingPlatform()
            : event.address
    );
    let totalOutstandingAmount = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryLendingPlatformV2);
    const prjTokensList = getPrjTokensList(primaryLendingPlatformV2);
    for (let i = 0; i < lendingTokensList.length; i++) {
        let outstandingAmount = BigInt.fromString("0");
        let totalCollateralAmount = BigDecimal.fromString("0");
        for (let j = 0; j < prjTokensList.length; j++) {
            const totalBorrow = primaryLendingPlatformV2.totalBorrow(prjTokensList[j], lendingTokensList[i]);
            const outstandingAmountPerPair = getOutstandingPerPair<T>(
                event,
                primaryLendingPlatformV2,
                prjTokensList[j],
                lendingTokensList[i]
            );
            outstandingAmount = outstandingAmount.plus(outstandingAmountPerPair);

            const lvr = primaryLendingPlatformV2.projectTokenInfo(prjTokensList[j]).getLoanToValueRatio();
            const collateralAmount = getUsdOraclePrice(
                primaryLendingPlatformV2,
                lendingTokensList[i],
                totalBorrow
            )
                .times(BigDecimal.fromString(lvr.denominator.toString()))
                .div(BigDecimal.fromString(lvr.numerator.toString()));
            totalCollateralAmount = totalCollateralAmount.plus(collateralAmount);
        }
        const outstandingUSDAmount = getUsdOraclePrice(
            primaryLendingPlatformV2,
            lendingTokensList[i],
            outstandingAmount
        );
        totalOutstandingAmount = totalOutstandingAmount.plus(outstandingUSDAmount);

        updateCollateralDepositedHistory<T>(event, lendingTokensList[i], totalCollateralAmount);
        updateOutstandingHistory<T>(event, lendingTokensList[i], outstandingUSDAmount);
        updateCollateralVSLoanRatioHistory<T>(
            event,
            lendingTokensList[i],
            totalCollateralAmount,
            outstandingUSDAmount
        );
    }
    return totalOutstandingAmount;
}

/************************************ Handle PositionState ************************************/
function handlePositionState<T>(event: T): Array<BigDecimal> {
    const primaryLendingPlatformV2 = PrimaryLendingPlatformV2.bind(
        event instanceof LeveragedBorrow
            ? PrimaryLendingPlatformLeverage.bind(event.address).primaryLendingPlatform()
            : event.address
    );

    let usdAmount = BigDecimal.fromString("0");
    let totalPITAmount = BigDecimal.fromString("0");

    const prjTokensList = getPrjTokensList(primaryLendingPlatformV2);
    const lendingTokensList = getLendingTokensList(primaryLendingPlatformV2);
    for (let i = 0; i < prjTokensList.length; i++) {
        const totalDepositedPerToken = primaryLendingPlatformV2.totalDepositedProjectToken(prjTokensList[i]);
        const usdOraclePrice = getUsdOraclePrice(
            primaryLendingPlatformV2,
            prjTokensList[i],
            totalDepositedPerToken
        );
        usdAmount = usdAmount.plus(usdOraclePrice);

        const lvr = primaryLendingPlatformV2.projectTokenInfo(prjTokensList[i]).getLoanToValueRatio();
        const pitAmount = usdOraclePrice
            .times(BigDecimal.fromString(lvr.numerator.toString()))
            .div(BigDecimal.fromString(lvr.denominator.toString()));
        totalPITAmount = totalPITAmount.plus(pitAmount);

        let totalBorrowedUSDAmount = BigDecimal.fromString("0");
        let totalOutstandingUSDAmount = BigDecimal.fromString("0");
        for (let j = 0; j < lendingTokensList.length; j++) {
            const borrowedAmount = primaryLendingPlatformV2.totalBorrow(
                prjTokensList[i],
                lendingTokensList[j]
            );
            const borrowedUSDAmount = getUsdOraclePrice(
                primaryLendingPlatformV2,
                lendingTokensList[j],
                borrowedAmount
            );
            totalBorrowedUSDAmount = totalBorrowedUSDAmount.plus(borrowedUSDAmount);

            const outstandingAmount = getOutstandingPerPair<T>(
                event,
                primaryLendingPlatformV2,
                prjTokensList[i],
                lendingTokensList[j]
            );
            const outstandingUSDAmount = getUsdOraclePrice(
                primaryLendingPlatformV2,
                lendingTokensList[j],
                outstandingAmount
            );
            totalOutstandingUSDAmount = totalOutstandingUSDAmount.plus(outstandingUSDAmount);
        }

        const prjToken = ERC20.bind(prjTokensList[i]);
        const depositedAmount = totalDepositedPerToken
            .toBigDecimal()
            .div(exponentToBigDecimal(prjToken.decimals()));
        updatePositionState<T>(
            event,
            prjTokensList[i],
            depositedAmount,
            pitAmount,
            totalBorrowedUSDAmount,
            totalOutstandingUSDAmount
        );
    }
    let totalStateUpdated = new Array<BigDecimal>();
    totalStateUpdated.push(usdAmount);
    totalStateUpdated.push(totalPITAmount);

    return totalStateUpdated;
}

function updatePositionState<T>(
    event: T,
    projectTokenAddress: Address,
    depositedAmount: BigDecimal,
    pitAmount: BigDecimal,
    borrowedAmount: BigDecimal,
    outstandingAmount: BigDecimal
): void {
    const id = projectTokenAddress.toHex();
    let entity = ProjectToken.load(id);
    if (entity == null) {
        return;
    }
    entity.depositedAmount = depositedAmount;
    entity.pitAmount = pitAmount;
    entity.borrowedAmount = borrowedAmount;
    entity.outstandingAmount = outstandingAmount;
    entity.updatedAt = event.block.timestamp;
    const borrowLimit = entity.borrowingLevelAmount;
    if (borrowLimit !== null) {
        entity.currentBorrowingLevel = borrowLimit.notEqual(BigDecimal.fromString("0"))
            ? borrowedAmount.div(borrowLimit).times(BigDecimal.fromString("100"))
            : BigDecimal.fromString("0");
    }
    entity.save();
}

/************************************ Handle BorrowedState ************************************/
function handleBorrowedState<T>(event: T): void {
    let prjTokenAddress = Address.zero();
    let lendingTokenAddress = Address.zero();
    let borrower = Address.zero();
    if (event instanceof LeveragedBorrow) {
        prjTokenAddress = event.params.projectToken;
        lendingTokenAddress = event.params.lendingToken;
        borrower = event.params.user;
    } else {
        prjTokenAddress = event.params.prjAddress;
        lendingTokenAddress = event.params.borrowToken;
        borrower = event.params.who;
    }
    const id = prjTokenAddress.toHex() + "-" + lendingTokenAddress.toHex();
    let entity = BorrowedState.load(id);
    if (entity == null) {
        entity = new BorrowedState(id);
    }

    let borrowerList = entity.borrowerAddresses;
    const borrowerId = borrower.toHex() + "-" + id;
    const primaryLendingPlatformV2 = PrimaryLendingPlatformV2.bind(
        event instanceof LeveragedBorrow
            ? PrimaryLendingPlatformLeverage.bind(event.address).primaryLendingPlatform()
            : event.address
    );
    if (
        primaryLendingPlatformV2
            .totalOutstanding(borrower, prjTokenAddress, lendingTokenAddress)
            .gt(BigInt.fromString("0"))
    ) {
        if (borrowerList == null) {
            borrowerList = new Array<string>();
        }
        if (!borrowerList.includes(borrowerId)) {
            const borrowerEntity = Borrower.load(borrowerId);
            if (borrowerEntity == null) {
                const borrowerEntity = new Borrower(borrowerId);
                borrowerEntity.address = borrower;
                borrowerEntity.prjTokenAddress = prjTokenAddress;
                borrowerEntity.lendingTokenAddress = lendingTokenAddress;
                borrowerEntity.updatedAt = event.block.timestamp;
                borrowerEntity.save();
            }
            borrowerList.push(borrowerId);
        } else {
            return;
        }
    } else {
        if (borrowerList == null) {
            return;
        }
        if (borrowerList.includes(borrowerId)) {
            borrowerList.splice(borrowerList.indexOf(borrowerId), 1);
            store.remove("Borrower", borrowerId);
        } else {
            return;
        }
    }

    if (borrowerList.length == 0) {
        store.remove("BorrowedState", id);
        return;
    }

    entity.borrowerAddresses = borrowerList;
    entity.prjTokenAddress = prjTokenAddress;
    entity.lendingTokenAddress = lendingTokenAddress;
    entity.updatedAt = event.block.timestamp;
    entity.save();
}

/************************************ Handle Borrower ************************************/
function updateBorrower<T>(
    event: T,
    borrower: Address,
    projectTokenAddress: Address,
    lendingTokenAddress: Address,
    depositedAmount: BigDecimal,
    borrowedAmount: BigDecimal,
    outstandingAmount: BigDecimal
): void {
    const id = borrower.toHex() + "-" + projectTokenAddress.toHex() + "-" + lendingTokenAddress.toHex();

    let entity = Borrower.load(id);
    if (entity == null) {
        return;
    }

    entity.depositedAmount = depositedAmount;
    entity.borrowedAmount = borrowedAmount;
    entity.outstandingAmount = outstandingAmount;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

/************************************ Handle CollateralDepositedHistory ************************************/
function updateCollateralDepositedHistory<T>(
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
    if (entity == null) {
        entity = new CollateralDepositedHistory(id);
    }

    entity.amount = collateralAmount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
    if (lendingTokenAddress == Address.zero()) {
        updateTotalState<T>(event, TOTAL_AMOUNT_COLLATERAL_DEPOSITED, Address.zero(), collateralAmount);
    }
}

/************************************ Handle PITTokenHistory ************************************/
function updatePITTokenHistory<T>(event: T, pitAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    entity.amount = pitAmount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle OutstandingHistory ************************************/
function updateOutstandingHistory<T>(
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
    if (entity == null) {
        entity = new OutstandingHistory(id);
    }

    entity.amount = outstandingAmount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle CollateralVSLoanRatioHistory ************************************/
function updateCollateralVSLoanRatioHistory<T>(
    event: T,
    lendingTokenAddress: Address,
    collateralAmount: BigDecimal,
    outstandingAmount: BigDecimal
): void {
    if (outstandingAmount.le(BigDecimal.fromString("0"))) {
        return;
    }
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id =
        lendingTokenAddress == Address.zero()
            ? txhash + "-" + logIndex
            : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let specifiedCollateralAmount = collateralAmount;
    if (lendingTokenAddress == Address.zero()) {
        let totalStateEntity = TotalState.load(TOTAL_AMOUNT_COLLATERAL_DEPOSITED);
        if (totalStateEntity == null) {
            totalStateEntity = new TotalState(TOTAL_AMOUNT_COLLATERAL_DEPOSITED);
            log.info("totalStateEntity is created", []);
        }
        specifiedCollateralAmount = totalStateEntity.amount;
    }

    let entity = CollateralVSLoanRatioHistory.load(id);
    if (entity == null) {
        entity = new CollateralVSLoanRatioHistory(id);
    }

    entity.amount = specifiedCollateralAmount.div(outstandingAmount);
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle TotalState ************************************/
function updateTotalState<T>(
    event: T,
    stateType: string,
    lendingTokenAddress: Address,
    amount: BigDecimal
): void {
    const id =
        lendingTokenAddress == Address.zero() ? stateType : stateType + "-" + lendingTokenAddress.toHex();

    let entity = TotalState.load(id);
    if (entity == null) {
        entity = new TotalState(id);
    }
    entity.type = stateType;
    entity.amount = amount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.updatedAt = event.block.timestamp;
    entity.save();
}

/************************************ Handle LenderAPYHistory ************************************/
function handleLenderAPYHistory<T>(event: T): void {
    const primaryLendingPlatformV2 = PrimaryLendingPlatformV2.bind(
        event instanceof LeveragedBorrow
            ? PrimaryLendingPlatformLeverage.bind(event.address).primaryLendingPlatform()
            : event.address
    );
    let totalLenderAPY = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryLendingPlatformV2);
    for (let i = 0; i < lendingTokensList.length; i++) {
        const lenderAPY = getLenderAPYPerLendingToken(primaryLendingPlatformV2, lendingTokensList[i]);
        totalLenderAPY = totalLenderAPY.plus(lenderAPY);

        updateLenderAPYHistory<T>(event, lendingTokensList[i], lenderAPY);
    }

    updateLenderAPYHistory<T>(
        event,
        Address.zero(),
        totalLenderAPY.div(BigDecimal.fromString(lendingTokensList.length.toString()))
    );
}

function updateLenderAPYHistory<T>(event: T, lendingTokenAddress: Address, lenderAPY: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id =
        lendingTokenAddress == Address.zero()
            ? txhash + "-" + logIndex
            : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = LenderAPYHistory.load(id);
    if (entity == null) {
        entity = new LenderAPYHistory(id);
    }

    entity.amount = lenderAPY;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
    if (lendingTokenAddress == Address.zero()) {
        updateTotalState<T>(event, LENDER_APY, Address.zero(), lenderAPY);
    } else {
        updateTotalState<T>(event, LENDER_APY, lendingTokenAddress, lenderAPY);
    }
}

/************************************ Handle BorrowingAPYHistory ************************************/
function handleBorrowingAPYHistory<T>(event: T): void {
    const primaryLendingPlatformV2 = PrimaryLendingPlatformV2.bind(
        event instanceof LeveragedBorrow
            ? PrimaryLendingPlatformLeverage.bind(event.address).primaryLendingPlatform()
            : event.address
    );
    let totalBorrowingAPY = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryLendingPlatformV2);
    for (let i = 0; i < lendingTokensList.length; i++) {
        const borrowingAPY = getBorrowingAPYPerLendingToken(primaryLendingPlatformV2, lendingTokensList[i]);
        totalBorrowingAPY = totalBorrowingAPY.plus(borrowingAPY);

        updateBorrowingAPYHistory<T>(event, lendingTokensList[i], borrowingAPY);
    }

    updateBorrowingAPYHistory<T>(
        event,
        Address.zero(),
        totalBorrowingAPY.div(BigDecimal.fromString(lendingTokensList.length.toString()))
    );
}

function updateBorrowingAPYHistory<T>(
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
    if (entity == null) {
        entity = new BorrowingAPYHistory(id);
    }

    entity.amount = borrowingAPY;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
    if (lendingTokenAddress == Address.zero()) {
        updateTotalState<T>(event, BORROWING_APY, Address.zero(), borrowingAPY);
    } else {
        updateTotalState<T>(event, BORROWING_APY, lendingTokenAddress, borrowingAPY);
    }
}

/************************************ Handle LenderAggregateCapitalDepositedHistory ************************************/
function handleLenderAggregateCapitalDepositedHistory<T>(event: T): void {
    const primaryLendingPlatformV2 = PrimaryLendingPlatformV2.bind(
        event instanceof LeveragedBorrow
            ? PrimaryLendingPlatformLeverage.bind(event.address).primaryLendingPlatform()
            : event.address
    );
    let totalSupply = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryLendingPlatformV2);
    for (let i = 0; i < lendingTokensList.length; i++) {
        const supplyAmount = getLenderAggregateCapitalDepositedPerLendingToken(
            primaryLendingPlatformV2,
            lendingTokensList[i]
        );
        totalSupply = totalSupply.plus(supplyAmount);

        updateLenderAggregateCapitalDepositedHistory<T>(event, lendingTokensList[i], supplyAmount);
    }

    updateLenderAggregateCapitalDepositedHistory<T>(event, Address.zero(), totalSupply);
}

function updateLenderAggregateCapitalDepositedHistory<T>(
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
    if (entity == null) {
        entity = new LenderAggregateCapitalDepositedHistory(id);
    }

    entity.amount = totalSupply;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Internal Functions ************************************/
function getUsdOraclePrice(
    primaryLendingPlatformV2: PrimaryLendingPlatformV2,
    tokenAddr: Address,
    amount: BigInt
): BigDecimal {
    const priceOracle = PriceProviderAggregator.bind(primaryLendingPlatformV2.priceOracle());
    const usdOraclePrice = priceOracle.try_getEvaluation(tokenAddr, amount);
    if (usdOraclePrice.reverted) {
        log.info("tokenAddr: {}, amount: {}", [tokenAddr.toHexString(), amount.toString()]);
        return BigDecimal.fromString("0");
    }

    return usdOraclePrice.value.toBigDecimal().div(exponentToBigDecimal(USD_DECIMALS));
}

function getPrjTokensList(primaryLendingPlatformV2: PrimaryLendingPlatformV2): Array<Address> {
    const prjTokensLength = primaryLendingPlatformV2.projectTokensLength();
    let prjTokensList = new Array<Address>();
    for (let i = 0; i < prjTokensLength.toI32(); i++) {
        const prjTokenAddress = primaryLendingPlatformV2.projectTokens(BigInt.fromI32(i));
        prjTokensList.push(prjTokenAddress);
    }
    return prjTokensList;
}

function getLendingTokensList(primaryLendingPlatformV2: PrimaryLendingPlatformV2): Array<Address> {
    const lendingTokensLength = primaryLendingPlatformV2.lendingTokensLength();
    let lendingTokensList = new Array<Address>();
    for (let i = 0; i < lendingTokensLength.toI32(); i++) {
        const lendingTokenAddress = primaryLendingPlatformV2.lendingTokens(BigInt.fromI32(i));
        lendingTokensList.push(lendingTokenAddress);
    }
    return lendingTokensList;
}

function getLenderAPYPerLendingToken(
    primaryLendingPlatformV2: PrimaryLendingPlatformV2,
    lendingTokenAddress: Address
): BigDecimal {
    const bLendingTokenAddress = primaryLendingPlatformV2
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

function getBorrowingAPYPerLendingToken(
    primaryLendingPlatformV2: PrimaryLendingPlatformV2,
    lendingTokenAddress: Address
): BigDecimal {
    const bLendingTokenAddress = primaryLendingPlatformV2
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

function getLenderAggregateCapitalDepositedPerLendingToken(
    primaryLendingPlatformV2: PrimaryLendingPlatformV2,
    lendingTokenAddress: Address
): BigDecimal {
    const bLendingTokenAddress = primaryLendingPlatformV2
        .lendingTokenInfo(lendingTokenAddress)
        .getBLendingToken();
    const bLendingToken = BLendingToken.bind(bLendingTokenAddress);
    const totalSupply = bLendingToken.totalSupply();
    const exchangeRateStored = bLendingToken.exchangeRateStored();
    const totalSupplyLendingToken = totalSupply.times(exchangeRateStored);

    const usdOraclePrice = getUsdOraclePrice(
        primaryLendingPlatformV2,
        lendingTokenAddress,
        totalSupplyLendingToken
    ).div(exponentToBigDecimal(SCALE_DECIMALS));

    return usdOraclePrice;
}

function getOutstandingPerPair<T>(
    event: T,
    primaryLendingPlatformV2: PrimaryLendingPlatformV2,
    projectTokenAddress: Address,
    lendingTokenAddress: Address
): BigInt {
    let totalOutstanding = BigInt.zero();
    const id = projectTokenAddress.toHex() + "-" + lendingTokenAddress.toHex();
    const borrowedStateEntity = BorrowedState.load(id);
    if (borrowedStateEntity != null) {
        const borrowerList = borrowedStateEntity.borrowerAddresses;
        if (borrowerList !== null) {
            for (let i = 0; i < borrowerList.length; i++) {
                const borrowerEntity = Borrower.load(borrowerList[i]);
                if (borrowerEntity != null) {
                    const borrower = Address.fromBytes(borrowerEntity.address);
                    const positionLoan = primaryLendingPlatformV2.getPosition(
                        borrower,
                        projectTokenAddress,
                        lendingTokenAddress
                    );
                    const outstandingAmount = primaryLendingPlatformV2.totalOutstanding(
                        borrower,
                        projectTokenAddress,
                        lendingTokenAddress
                    );
                    const depositedAmount = positionLoan.getDepositedProjectTokenAmount();
                    const borrowedAmount = positionLoan.getLoanBody();

                    updateBorrower(
                        event,
                        borrower,
                        projectTokenAddress,
                        lendingTokenAddress,
                        depositedAmount.toBigDecimal(),
                        borrowedAmount.toBigDecimal(),
                        outstandingAmount.toBigDecimal()
                    );
                    totalOutstanding = totalOutstanding.plus(outstandingAmount);
                }
            }
        }
    }
    return totalOutstanding;
}
