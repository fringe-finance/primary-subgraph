import { BorrowLog } from "../generated/schema";
import {
    Borrow,
    Deposit,
    Redeem,
    RedeemUnderlying,
    RepayBorrow,
    Supply,
    Withdraw
} from "../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";
import { ERC20 } from "../generated/PrimaryLendingPlatformV3/ERC20";

import { DEPOSIT, BORROW, REPAY, WITHDRAW } from "./constants/eventsType";

import { exponentToBigDecimal } from "./helper/common.helper";
import { handleMultiHistories } from "./common/multiHistories.handler";
import { handleAPYHistories } from "./common/apyHistory.handler";
import { handleBorrowedState } from "./common/borrowState.handler";

import { IEvent } from "./interface/event.interface";

/**
 * Contract event handler
 */
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

/**
 * Internal handler
 */
export function handleBorrowLog<T extends IEvent>(event: T): void {
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
        entity.type = event instanceof Deposit ? DEPOSIT : WITHDRAW;
        entity.date = event.block.timestamp;
        entity.userAddress = event.params.who;
    } else {
        const borrowToken = ERC20.bind(event.params.borrowToken);

        entity.amount = event.params.borrowAmount
            .toBigDecimal()
            .div(exponentToBigDecimal(borrowToken.decimals()));
        entity.asset = borrowToken.symbol();
        entity.type = event instanceof Borrow ? BORROW : REPAY;
        entity.date = event.block.timestamp;
        entity.userAddress = event.params.who;
    }
    entity.save();
}
