import { PriceProviderAggregator } from "./../generated/PrimaryIndexToken/PriceProviderAggregator";
import {
    AddPrjToken,
    AddLendingToken,
    Borrow,
    Deposit,
    Liquidate,
    LiquidationIncentiveSet,
    LiquidationThresholdFactorSet,
    LoanToValueRatioSet,
    PrimaryIndexToken,
    Redeem,
    RedeemUnderlying,
    RemoveProjectToken,
    RemoveLendingToken,
    RepayBorrow,
    RoleAdminChanged,
    RoleGranted,
    RoleRevoked,
    Supply,
    Withdraw
} from "../generated/PrimaryIndexToken/PrimaryIndexToken";
import { ERC20 } from "../generated/PrimaryIndexToken/ERC20";
import {
    BorrowLog,
    CollateralDepositedHistory,
    LendingToken,
    PITTokenHistory,
    ProjectToken,
    OutstandingHistory
} from "../generated/schema";
import { DEPOSIT, BORROWED, REPAY, WITHDRAW } from "./constants/eventsType";
import { USD_DECIMALS } from "./constants/decimals";
import { exponentToBigDecimal } from "./helpers";
import { Address, BigDecimal, BigInt, store, dataSource, log } from "@graphprotocol/graph-ts";

function getUsdOraclePrice(primaryIndexToken: PrimaryIndexToken, tokenAddr: Address, amount: BigInt): BigDecimal {
    const priceOracle = PriceProviderAggregator.bind(primaryIndexToken.priceOracle());
    const usdOraclePrice = priceOracle.try_getEvaluation(tokenAddr, amount);
    if (usdOraclePrice.reverted) {
        log.info("tokenAddr: {}, amount: {}", [tokenAddr.toHexString(), amount.toString()]);
        return BigDecimal.fromString("0");
    }
    return usdOraclePrice.value.toBigDecimal().div(exponentToBigDecimal(USD_DECIMALS));
}

export function handleAddPrjToken(event: AddPrjToken): void {
    const id = event.params.tokenPrj.toHex();

    let entity = ProjectToken.load(id);
    if (entity == null) {
        entity = new ProjectToken(id);
    }

    entity.address = event.params.tokenPrj;
    entity.name = event.params.name;
    entity.symbol = event.params.symbol;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleRemoveProjectToken(event: RemoveProjectToken): void {
    const id = event.params.tokenPrj.toHex();

    let entity = ProjectToken.load(id);
    if (entity != null) {
        store.remove("ProjectToken", id);
    }
}

export function handleAddLendingToken(event: AddLendingToken): void {
    const id = event.params.lendingToken.toHex();

    let entity = LendingToken.load(id);
    if (entity == null) {
        entity = new LendingToken(id);
    }

    entity.address = event.params.lendingToken;
    entity.name = event.params.name;
    entity.symbol = event.params.symbol;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleRemoveLendingToken(event: RemoveLendingToken): void {
    const id = event.params.lendingToken.toHex();

    let entity = LendingToken.load(id);
    if (entity != null) {
        store.remove("LendingToken", id);
    }
}

export function handleBorrow(event: Borrow): void {
    handleBorrowInBorrowLog(event);
    const totalOutstanding = handleBorrowRepayInPositionState<Borrow>(event);
    handleOutstandingHistoryAllLending<Borrow>(event, totalOutstanding);
}

export function handleDeposit(event: Deposit): void {
    handleDepositInBorrowLog(event);
    const totalStateUpdated = handleDepositWithdrawInPositionState();
    handleCollateralDepositedHistoryAllLending<Deposit>(event, totalStateUpdated[0]);
    handlePITTokenHistoryAllLending<Deposit>(event, totalStateUpdated[1]);
}

export function handleRepayBorrow(event: RepayBorrow): void {
    handleRepayBorrowInBorrowLog(event);
    const totalOutstanding = handleBorrowRepayInPositionState<RepayBorrow>(event);
    handleOutstandingHistoryAllLending<RepayBorrow>(event, totalOutstanding);
}

export function handleWithdraw(event: Withdraw): void {
    handleWithdrawInBorrowLog(event);
    const totalStateUpdated = handleDepositWithdrawInPositionState();
    handleCollateralDepositedHistoryAllLending<Withdraw>(event, totalStateUpdated[0]);
    handlePITTokenHistoryAllLending<Withdraw>(event, totalStateUpdated[1]);
}

export function handleLiquidate(event: Liquidate): void {}

export function handleLiquidationIncentiveSet(event: LiquidationIncentiveSet): void {}

export function handleLiquidationThresholdFactorSet(event: LiquidationThresholdFactorSet): void {}

export function handleLoanToValueRatioSet(event: LoanToValueRatioSet): void {}

export function handleRedeem(event: Redeem): void {}

export function handleRedeemUnderlying(event: RedeemUnderlying): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleSupply(event: Supply): void {}

/************************************ Handle BorrowLog ************************************/
function handleDepositInBorrowLog(event: Deposit): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const prjToken = ERC20.bind(event.params.tokenPrj);

    entity.amount = event.params.prjDepositAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(prjToken.decimals()));
    entity.asset = prjToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = DEPOSIT;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.tokenPrj;

    entity.save();
}

function handleBorrowInBorrowLog(event: Borrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const borrowToken = ERC20.bind(event.params.borrowToken);
    const prjToken = ERC20.bind(event.params.prjAddress);

    entity.amount = event.params.borrowAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(borrowToken.decimals()));
    entity.asset = borrowToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = BORROWED;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.prjAddress;

    entity.save();
}

function handleRepayBorrowInBorrowLog(event: RepayBorrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const borrowToken = ERC20.bind(event.params.borrowToken);
    const prjToken = ERC20.bind(event.params.prjAddress);

    entity.amount = event.params.borrowAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(borrowToken.decimals()));
    entity.asset = borrowToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = REPAY;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.prjAddress;

    entity.save();
}

function handleWithdrawInBorrowLog(event: Withdraw): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const prjToken = ERC20.bind(event.params.tokenPrj);

    entity.amount = event.params.prjWithdrawAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(prjToken.decimals()));
    entity.asset = prjToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = WITHDRAW;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.tokenPrj;

    entity.save();
}

/************************************ Handle CollateralDepositedHistory ************************************/
function handleCollateralDepositedHistoryPerLending<T>(event: T, totalCollateralAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = CollateralDepositedHistory.load(id);
    if (entity == null) {
        entity = new CollateralDepositedHistory(id);
    }

    entity.amount = totalCollateralAmount;
    entity.lendingTokenAddress = event.params.borrowToken;
    entity.date = event.block.timestamp;

    entity.save();
}

function handleCollateralDepositedHistoryAllLending<T>(event: T, totalUSDAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = CollateralDepositedHistory.load(id);
    if (entity == null) {
        entity = new CollateralDepositedHistory(id);
    }

    entity.amount = totalUSDAmount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle PositionState ************************************/
function handleBorrowRepayInPositionState<T>(event: T): BigDecimal {
    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    let totalOutstanding = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryIndexToken);
    const prjTokensList = getPrjTokensList(primaryIndexToken);
    for (let i = 0; i < lendingTokensList.length; i++) {
        let totalCollateralDepositedPerToken = BigInt.fromString("0");
        let totalCollateralAmount = BigDecimal.fromString("0");
        for (let j = 0; j < prjTokensList.length; j++) {
            const totalCollateralDepositedPerPair = primaryIndexToken.totalBorrow(prjTokensList[j], lendingTokensList[i]);
            totalCollateralDepositedPerToken = totalCollateralDepositedPerToken.plus(totalCollateralDepositedPerPair);

            const lvr = primaryIndexToken.projectTokenInfo(prjTokensList[j]).getLoanToValueRatio();
            const collateralAmount = getUsdOraclePrice(primaryIndexToken, lendingTokensList[i], totalCollateralDepositedPerPair)
                .times(BigDecimal.fromString(lvr.denominator.toString()))
                .div(BigDecimal.fromString(lvr.numerator.toString()));
            totalCollateralAmount = totalCollateralAmount.plus(collateralAmount);
        }
        const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, lendingTokensList[i], totalCollateralDepositedPerToken);
        totalOutstanding = totalOutstanding.plus(usdOraclePrice);

        handleCollateralDepositedHistoryPerLending<T>(event, totalCollateralAmount);
        handleOutstandingHistoryPerLending<T>(event, usdOraclePrice);
    }
    return totalOutstanding;
}

function handleDepositWithdrawInPositionState(): Array<BigDecimal> {
    const primaryIndexToken = PrimaryIndexToken.bind(dataSource.address());

    let usdAmount = BigDecimal.fromString("0");
    let totalPITAmount = BigDecimal.fromString("0");

    const prjTokensList = getPrjTokensList(primaryIndexToken);
    for (let i = 0; i < prjTokensList.length; i++) {
        log.info("prjToken[{}]: {}", [i.toString(), prjTokensList[i].toHexString()]);
        const totalDepositedPerToken = primaryIndexToken.totalDepositedProjectToken(prjTokensList[i]);
        const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, prjTokensList[i], totalDepositedPerToken);
        usdAmount = usdAmount.plus(usdOraclePrice);

        const lvr = primaryIndexToken.projectTokenInfo(prjTokensList[i]).getLoanToValueRatio();
        const pitAmount = usdOraclePrice
            .times(BigDecimal.fromString(lvr.numerator.toString()))
            .div(BigDecimal.fromString(lvr.denominator.toString()));
        totalPITAmount = totalPITAmount.plus(pitAmount);
    }
    let totalStateUpdated = new Array<BigDecimal>();
    totalStateUpdated.push(usdAmount);
    totalStateUpdated.push(totalPITAmount);

    return totalStateUpdated;
}

/************************************ Handle PITTokenHistory ************************************/
function handlePITTokenHistoryAllLending<T>(event : T, totalPITAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    entity.amount = totalPITAmount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

function handlePITTokenHistoryPerLending<T>(event: T, totalStateUpdated: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const lvr = primaryIndexToken.projectTokenInfo(event.params.prjAddress).getLoanToValueRatio();

    entity.amount = totalStateUpdated
        .times(BigDecimal.fromString(lvr.numerator.toString()))
        .div(BigDecimal.fromString(lvr.denominator.toString()));
    entity.lendingTokenAddress = event.params.borrowToken;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle OutstandingHistory ************************************/
function handleOutstandingHistoryAllLending<T>(event : T, totalOutstanding: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = OutstandingHistory.load(id);
    if (entity == null) {
        entity = new OutstandingHistory(id);
    }

    entity.amount = totalOutstanding;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

function handleOutstandingHistoryPerLending<T>(event : T, totalOutstanding: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const lendingTokenAddress = event.params.borrowToken;
    const id = txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = OutstandingHistory.load(id);
    if (entity == null) {
        entity = new OutstandingHistory(id);
    }

    entity.amount = totalOutstanding;
    entity.lendingTokenAddress = lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

function getPrjTokensList(primaryIndexToken: PrimaryIndexToken): Array<Address> {
    const prjTokensLength = primaryIndexToken.projectTokensLength();
    let prjTokensList = new Array<Address>();
    for (let i = 0; i < prjTokensLength.toI32(); i++) {
        const prjTokenAddress = primaryIndexToken.projectTokens(BigInt.fromI32(i));
        prjTokensList.push(prjTokenAddress);
    }
    return prjTokensList;
}

function getLendingTokensList(primaryIndexToken: PrimaryIndexToken): Array<Address> {
    const lendingTokensLength = primaryIndexToken.lendingTokensLength();
    let lendingTokensList = new Array<Address>();
    for (let i = 0; i < lendingTokensLength.toI32(); i++) {
        const lendingTokenAddress = primaryIndexToken.lendingTokens(BigInt.fromI32(i));
        lendingTokensList.push(lendingTokenAddress);
    }
    return lendingTokensList;
}