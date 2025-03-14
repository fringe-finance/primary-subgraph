import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import {
    LeveragedBorrow,
    PrimaryLendingPlatformLeverage
} from "../../generated/PrimaryLendingPlatformLeverage/PrimaryLendingPlatformLeverage";
import { BorrowedState, User, UserState } from "../../generated/schema";
import {
    PrimaryLendingPlatformV3,
    Deposit,
    Withdraw
} from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";
import { updateBorrower } from "../utils/loan.util";

import { IEvent } from "../interface/event.interface";

export function handleUserState<T extends IEvent>(event: T): void {
    let userAddress = Address.zero();
    let tokenAddress = Address.zero();
    let primaryLendingPlatformAddress = event.address;
    let isLeverage = false;

    if (event instanceof LeveragedBorrow) {
        userAddress = event.params.user;
        tokenAddress = event.params.projectToken;
        primaryLendingPlatformAddress = PrimaryLendingPlatformLeverage.bind(
            event.address
        ).primaryLendingPlatform();
        isLeverage = true;
    } else if (event instanceof Deposit) {
        tokenAddress = event.params.tokenPrj;
        userAddress = event.params.beneficiary;
    } else if (event instanceof Withdraw) {
        tokenAddress = event.params.tokenPrj;
        userAddress = event.params.who;
    } else {
        tokenAddress = event.params.borrowToken;
        userAddress = event.params.who;
    }

    const id = userAddress.toHex();

    let userStateEntity = UserState.load(id);
    if (!userStateEntity) userStateEntity = new UserState(id);

    let tokenAddresses = userStateEntity.tokenAddresses;
    const userId = id + "-" + tokenAddress.toHex();
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);

    const depositedAmount = primaryLendingPlatformV3.depositedAmount(userAddress, tokenAddress);
    const estimatedOutstanding = primaryLendingPlatformV3.getEstimatedOutstanding(userAddress, tokenAddress);
    const outstandingAmount = estimatedOutstanding.getLoanBody().plus(estimatedOutstanding.getAccrual());

    if (outstandingAmount.gt(BigInt.fromString("0")) || depositedAmount.gt(BigInt.fromString("0"))) {
        if (!tokenAddresses) tokenAddresses = new Array<string>();

        const borrowedAmount = estimatedOutstanding.getLoanBody();

        if (!tokenAddresses.includes(userId) || isLeverage) {
            let userEntity = User.load(userId);
            if (!userEntity) userEntity = new User(userId);
            userEntity.address = userAddress;
            userEntity.tokenAddress = tokenAddress;
            userEntity.updatedAt = event.block.timestamp;
            userEntity.depositedAmount = depositedAmount.toBigDecimal();
            userEntity.outstandingAmount = outstandingAmount.toBigDecimal();
            userEntity.borrowedAmount = borrowedAmount.toBigDecimal();
            userEntity.save();

            tokenAddresses.push(userId);
        } else return;
    } else {
        if (!tokenAddresses) return;

        if (tokenAddresses.includes(userId)) {
            tokenAddresses.splice(tokenAddresses.indexOf(userId), 1);
            store.remove("User", userId);
        } else return;
    }

    if (tokenAddresses.length == 0) {
        store.remove("UserState", id);
        return;
    }

    userStateEntity.userAddress = userAddress;
    userStateEntity.tokenAddresses = tokenAddresses;
    userStateEntity.updatedAt = event.block.timestamp;
    userStateEntity.save();
}

export function handleBorrowedState<T extends IEvent>(event: T): void {
    let lendingTokenAddress = Address.zero();
    let borrower = Address.zero();
    let primaryLendingPlatformAddress = event.address;

    if (event instanceof LeveragedBorrow) {
        lendingTokenAddress = event.params.lendingToken;
        borrower = event.params.user;
        primaryLendingPlatformAddress = PrimaryLendingPlatformLeverage.bind(
            event.address
        ).primaryLendingPlatform();
    } else if (event instanceof Deposit) {
        lendingTokenAddress = event.params.tokenPrj;
        borrower = event.params.beneficiary;
    } else if (event instanceof Withdraw) {
        lendingTokenAddress = event.params.tokenPrj;
        borrower = event.params.who;
    } else {
        lendingTokenAddress = event.params.borrowToken;
        borrower = event.params.who;
    }

    const id = lendingTokenAddress.toHex();
    let entity = BorrowedState.load(id);
    if (!entity) entity = new BorrowedState(id);

    let users = entity.userAddresses;
    const borrowerId = borrower.toHex() + "-" + id;
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);

    const estimatedOutstanding = primaryLendingPlatformV3.getEstimatedOutstanding(
        borrower,
        lendingTokenAddress
    );
    const outstandingAmount = estimatedOutstanding.getLoanBody().plus(estimatedOutstanding.getAccrual());
    const depositedAmount = primaryLendingPlatformV3.depositedAmount(borrower, lendingTokenAddress);
    if (outstandingAmount.gt(BigInt.fromString("0")) || depositedAmount.gt(BigInt.fromString("0"))) {
        if (!users) users = new Array<string>();

        if (!users.includes(borrowerId)) {
            let userEntity = User.load(borrowerId);
            if (!userEntity) userEntity = new User(borrowerId);

            userEntity.address = borrower;
            userEntity.tokenAddress = lendingTokenAddress;
            userEntity.updatedAt = event.block.timestamp;
            userEntity.save();

            users.push(borrowerId);
        } else {
            let userEntity = User.load(borrowerId);
            if (!userEntity) return;

            userEntity.updatedAt = event.block.timestamp;
            userEntity.save();
        }
    } else {
        if (!users) return;

        if (users.includes(borrowerId)) {
            users.splice(users.indexOf(borrowerId), 1);
            store.remove("User", borrowerId);
        } else return;
    }

    if (users.length == 0) {
        store.remove("BorrowedState", id);
        return;
    }

    let hasOutstanding = false;
    for (let i = 0; i < users.length; i++) {
        const borrowEntity = User.load(users[i]);
        if (borrowEntity) {
            const estimatedOutstanding = primaryLendingPlatformV3.getEstimatedOutstanding(
                Address.fromBytes(borrowEntity.address),
                lendingTokenAddress
            );
            const outstandingAmount = estimatedOutstanding
                .getLoanBody()
                .plus(estimatedOutstanding.getAccrual());

            if (outstandingAmount.gt(BigInt.fromString("0"))) {
                hasOutstanding = true;
                break;
            }
        }
    }
    if (!hasOutstanding) {
        const borrowedAmount = estimatedOutstanding.getLoanBody();
        updateBorrower(
            event,
            borrower,
            lendingTokenAddress,
            depositedAmount.toBigDecimal(),
            borrowedAmount.toBigDecimal(),
            outstandingAmount.toBigDecimal()
        );
        store.remove("BorrowedState", id);
        return;
    }

    entity.userAddresses = users;
    entity.lendingTokenAddress = lendingTokenAddress;
    entity.updatedAt = event.block.timestamp;
    entity.save();
}
