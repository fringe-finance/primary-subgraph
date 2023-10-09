import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import {
    LeveragedBorrow,
    PrimaryLendingPlatformLeverage
} from "../../generated/PrimaryLendingPlatformLeverage/PrimaryLendingPlatformLeverage";
import { BorrowedState, Borrower } from "../../generated/schema";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

import { IEvent } from "../interface/event.interface";

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
    } else {
        lendingTokenAddress = event.params.borrowToken;
        borrower = event.params.who;
    }

    const id = lendingTokenAddress.toHex();
    let entity = BorrowedState.load(id);
    if (!entity) entity = new BorrowedState(id);

    let borrowers = entity.borrowerAddresses;
    const borrowerId = borrower.toHex() + "-" + id;
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(primaryLendingPlatformAddress);

    if (primaryLendingPlatformV3.outstanding(borrower, lendingTokenAddress).gt(BigInt.fromString("0"))) {
        if (!borrowers) borrowers = new Array<string>();

        if (!borrowers.includes(borrowerId)) {
            let borrowerEntity = Borrower.load(borrowerId);
            if (!borrowerEntity) borrowerEntity = new Borrower(borrowerId);

            borrowerEntity.address = borrower;
            borrowerEntity.lendingTokenAddress = lendingTokenAddress;
            borrowerEntity.updatedAt = event.block.timestamp;
            borrowerEntity.save();

            borrowers.push(borrowerId);
        } else return;
    } else {
        if (!borrowers) return;

        if (borrowers.includes(borrowerId)) {
            borrowers.splice(borrowers.indexOf(borrowerId), 1);
            store.remove("Borrower", borrowerId);
        } else return;
    }

    if (borrowers.length == 0) {
        store.remove("BorrowedState", id);
        return;
    }

    entity.borrowerAddresses = borrowers;
    entity.lendingTokenAddress = lendingTokenAddress;
    entity.updatedAt = event.block.timestamp;
    entity.save();
}
