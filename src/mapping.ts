import {
    AddPrjToken,
    AddLendingToken,
    Borrow,
    Deposit,
    Liquidate,
    LiquidationIncentiveSet,
    LiquidationThresholdFactorSet,
    LoanToValueRatioSet,
    PrimaryToken,
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
} from "../generated/PrimaryToken/PrimaryToken";
import { ERC20 } from "../generated/PrimaryToken/ERC20";
import { BorrowLog, LendingToken, ProjectToken } from "../generated/schema";
import { DEPOSIT, BORROWED, REPAY, LIQUIDATION, WITHDRAW } from "./constants/eventsType";
import { exponentToBigDecimal } from './helpers'

export function handleAddPrjToken(event: AddPrjToken): void {
    const id = event.params.tokenPrj.toHex();

    let entity = ProjectToken.load(id);
    if (entity == null) {
        entity = new ProjectToken(id)
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
        entity.remove(id);
    }
}

export function handleAddLendingToken(event: AddLendingToken): void {
    const id = event.params.lendingToken.toHex();

    let entity = LendingToken.load(id);
    if (entity == null) {
        entity = new LendingToken(id)
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
        entity.remove(id);
    }
}

export function handleBorrow(event: Borrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id)
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

export function handleDeposit(event: Deposit): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id)
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

export function handleRepayBorrow(event: RepayBorrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id)
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

export function handleWithdraw(event: Withdraw): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id)
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
