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
    DepositedHistory,
    LendingToken,
    PITTokenHistory,
    ProjectToken,
    TotalState
} from "../generated/schema";
import { DEPOSIT, BORROWED, REPAY, LIQUIDATION, WITHDRAW } from "./constants/eventsType";
import {
    APY,
    COLLATERAL_VS_LOAN_RATIO,
    LENDER_APY,
    TOTAL_AMOUNT_COLLATERAL_DEPOSITED,
    TOTAL_OUTSTANDING,
    TOTAL_PIT,
    TOTAL_SUPPLY,
    TOTAL_DEPOSITED
} from "./constants/chartsType";
import { exponentToBigDecimal } from "./helpers";
import { Address, BigDecimal, store } from "@graphprotocol/graph-ts";

function getUsdOraclePrice(primaryIndexToken: PrimaryIndexToken, tokenAddr: Address): BigDecimal {
    const priceOracle = PriceProviderAggregator.bind(primaryIndexToken.priceOracle());

    const usdOraclePrice = priceOracle.getPrice(tokenAddr).getPriceMantissa();

    return BigDecimal.fromString(usdOraclePrice.toString());
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
    const totalStateUpdated = handleBorrowInTotalState(event);
    handleBorrowInCollateralDepositedHistory(event, totalStateUpdated);
    handleBorrowInPITTokenHistory(event, totalStateUpdated);
}

export function handleDeposit(event: Deposit): void {
    handleDepositInBorrowLog(event);
    const totalStateUpdated = handleDepositInTotalState(event);
    handleDepositInTotalDepositedHistory(event, totalStateUpdated);
    handleDepositInTotalPITTokenHistory(event, totalStateUpdated);
}

export function handleRepayBorrow(event: RepayBorrow): void {
    handleRepayBorrowInBorrowLog(event);
    const totalStateUpdated = handleRepayBorrowInTotalState(event);
    handleRepayBorrowInCollateralDepositedHistory(event, totalStateUpdated);
    handleRepayBorrowInPITTokenHistory(event, totalStateUpdated);
}

export function handleWithdraw(event: Withdraw): void {
    handleWithdrawInBorrowLog(event);
    const totalStateUpdated = handleWithdrawInTotalState(event);
    handleWithdrawInTotalDepositedHistory(event, totalStateUpdated);
    handleWithdrawInTotalPITTokenHistory(event, totalStateUpdated);
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
function handleBorrowInCollateralDepositedHistory(event: Borrow, totalStateUpdated: TotalState): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = CollateralDepositedHistory.load(id);
    if (entity == null) {
        entity = new CollateralDepositedHistory(id);
    }

    entity.amount = totalStateUpdated.amount;
    entity.lendingTokenAddress = event.params.borrowToken;
    entity.date = event.block.timestamp;

    entity.save();
}

function handleRepayBorrowInCollateralDepositedHistory(event: RepayBorrow, totalStateUpdated: TotalState ): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = CollateralDepositedHistory.load(id);
    if (entity == null) {
        entity = new CollateralDepositedHistory(id);
    }

    entity.amount = totalStateUpdated.amount;
    entity.lendingTokenAddress = event.params.borrowToken;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle DepositedHistory ************************************/
function handleWithdrawInTotalDepositedHistory(event: Withdraw, totalStateUpdated: TotalState): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = DepositedHistory.load(id);
    if (entity == null) {
        entity = new DepositedHistory(id);
    }

    entity.amount = totalStateUpdated.amount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

function handleDepositInTotalDepositedHistory(event: Deposit, totalStateUpdated: TotalState): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = DepositedHistory.load(id);
    if (entity == null) {
        entity = new DepositedHistory(id);
    }

    entity.amount = totalStateUpdated.amount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle TotalState ************************************/
function handleBorrowInTotalState(event: Borrow): TotalState {
    const id = TOTAL_AMOUNT_COLLATERAL_DEPOSITED;

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, event.params.borrowToken);
    const lvr = primaryIndexToken.projectTokenInfo(event.params.prjAddress).getLoanToValueRatio();

    const borrowToken = ERC20.bind(event.params.borrowToken);
    const collateralAmount = event.params.borrowAmount.toBigDecimal()
        .div(exponentToBigDecimal(borrowToken.decimals()))
        .times(usdOraclePrice)
        .times(BigDecimal.fromString(lvr.denominator.toString()))
        .div(BigDecimal.fromString(lvr.numerator.toString()));

    let entity = TotalState.load(id);
    if (entity == null) {
        entity = new TotalState(id);
        entity.amount = collateralAmount;
    } else {
        entity.amount = entity.amount.plus(collateralAmount);
    }
    entity.updatedAt = event.block.timestamp;

    entity.save();

    return entity;
}

function handleRepayBorrowInTotalState(event: RepayBorrow): TotalState {
    const id = TOTAL_AMOUNT_COLLATERAL_DEPOSITED;

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, event.params.borrowToken);
    const lvr = primaryIndexToken.projectTokenInfo(event.params.prjAddress).getLoanToValueRatio();

    const borrowToken = ERC20.bind(event.params.borrowToken);
    const collateralAmount = event.params.borrowAmount.toBigDecimal()
        .div(exponentToBigDecimal(borrowToken.decimals()))
        .times(usdOraclePrice)
        .times(BigDecimal.fromString(lvr.denominator.toString()))
        .div(BigDecimal.fromString(lvr.numerator.toString()));

    let entity = TotalState.load(id);
    if (entity == null) {
        entity = new TotalState(id);
        entity.amount = BigDecimal.fromString("0");
    } else {
        entity.amount = entity.amount.minus(collateralAmount);
    }
    entity.updatedAt = event.block.timestamp;

    entity.save();

    return entity;
}

function handleDepositInTotalState(event: Deposit): TotalState {
    const id = TOTAL_DEPOSITED;

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, event.params.tokenPrj);

    const prjToken = ERC20.bind(event.params.tokenPrj);
    const usdAmount = event.params.prjDepositAmount.toBigDecimal()
        .div(exponentToBigDecimal(prjToken.decimals()))
        .times(usdOraclePrice);

    let entity = TotalState.load(id);
    if (entity == null) {
        entity = new TotalState(id);
        entity.amount = usdAmount;
    } else {
        entity.amount = entity.amount.plus(usdAmount);
    }
    entity.updatedAt = event.block.timestamp;

    entity.save();

    return entity;
}

function handleWithdrawInTotalState(event: Withdraw): TotalState {
    const id = TOTAL_DEPOSITED;

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, event.params.tokenPrj);

    const prjToken = ERC20.bind(event.params.tokenPrj);
    const usdAmount = event.params.prjWithdrawAmount.toBigDecimal()
        .div(exponentToBigDecimal(prjToken.decimals()))
        .times(usdOraclePrice);
    let entity = TotalState.load(id);
    if (entity == null) {
        entity = new TotalState(id);
        entity.amount = BigDecimal.fromString("0");
    } else {
        entity.amount = entity.amount.minus(usdAmount);
    }
    entity.updatedAt = event.block.timestamp;

    entity.save();

    return entity;
}

/************************************ Handle PITTokenHistory ************************************/
function handleDepositInTotalPITTokenHistory(event : Deposit, totalStateUpdated: TotalState): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const lvr = primaryIndexToken.projectTokenInfo(event.params.tokenPrj).getLoanToValueRatio();
    const totalUSDAmount = totalStateUpdated.amount
        .times(BigDecimal.fromString(lvr.numerator.toString()))
        .div(BigDecimal.fromString(lvr.denominator.toString()));

    entity.amount = totalUSDAmount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

function handleWithdrawInTotalPITTokenHistory(event : Withdraw, totalStateUpdated: TotalState): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const lvr = primaryIndexToken.projectTokenInfo(event.params.tokenPrj).getLoanToValueRatio();
    const totalUSDAmount = totalStateUpdated.amount
        .times(BigDecimal.fromString(lvr.numerator.toString()))
        .div(BigDecimal.fromString(lvr.denominator.toString()));

    entity.amount = totalUSDAmount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

function handleBorrowInPITTokenHistory(event: Borrow, totalStateUpdated: TotalState): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const lvr = primaryIndexToken.projectTokenInfo(event.params.prjAddress).getLoanToValueRatio();

    entity.amount = totalStateUpdated.amount
        .times(BigDecimal.fromString(lvr.numerator.toString()))
        .div(BigDecimal.fromString(lvr.denominator.toString()));
    entity.lendingTokenAddress = event.params.borrowToken;
    entity.date = event.block.timestamp;

    entity.save();
}

function handleRepayBorrowInPITTokenHistory(event: RepayBorrow, totalStateUpdated: TotalState): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    const lvr = primaryIndexToken.projectTokenInfo(event.params.prjAddress).getLoanToValueRatio();

    entity.amount = totalStateUpdated.amount
        .times(BigDecimal.fromString(lvr.numerator.toString()))
        .div(BigDecimal.fromString(lvr.denominator.toString()));
    entity.lendingTokenAddress = event.params.borrowToken;
    entity.date = event.block.timestamp;

    entity.save();
}
