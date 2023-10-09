import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { BorrowedState, Borrower } from "../../generated/schema";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

import { IEvent } from "../interface/event.interface";
import { exponentToBigDecimal } from "../helper/common.helper";
import { USD_DECIMALS } from "../constants/decimals";

export function getTotalOutstandingPerLendingTokenInUSD<T extends IEvent>(
    event: T,
    primaryLendingPlatformV3: PrimaryLendingPlatformV3,
    lendingTokenAddress: Address
): BigDecimal {
    const id = lendingTokenAddress.toHex();

    const borrowedStateEntity = BorrowedState.load(id);
    if (!borrowedStateEntity) return BigDecimal.fromString("0");

    const borrowers = borrowedStateEntity.borrowerAddresses;
    if (!borrowers) return BigDecimal.fromString("0");

    let totalOutstandingInUSD = BigInt.zero();
    for (let i = 0; i < borrowers.length; i++) {
        const borrowerEntity = Borrower.load(borrowers[i]);
        if (borrowerEntity) {
            const borrower = Address.fromBytes(borrowerEntity.address);
            const positionLoan = primaryLendingPlatformV3.borrowPosition(borrower, lendingTokenAddress);
            const outstandingAmount = primaryLendingPlatformV3.outstanding(borrower, lendingTokenAddress);
            const outstandingAmountInUSD = primaryLendingPlatformV3.outstandingInUSD(
                borrower,
                lendingTokenAddress
            );
            const depositedAmount = primaryLendingPlatformV3.depositedAmount(borrower, lendingTokenAddress);
            const borrowedAmount = positionLoan.getLoanBody();

            updateBorrower(
                event,
                borrower,
                lendingTokenAddress,
                depositedAmount.toBigDecimal(),
                borrowedAmount.toBigDecimal(),
                outstandingAmount.toBigDecimal()
            );

            totalOutstandingInUSD = totalOutstandingInUSD.plus(outstandingAmountInUSD);
        }
    }
    return totalOutstandingInUSD.toBigDecimal().div(exponentToBigDecimal(USD_DECIMALS));
}

function updateBorrower<T extends IEvent>(
    event: T,
    borrower: Address,
    lendingTokenAddress: Address,
    depositedAmount: BigDecimal,
    borrowedAmount: BigDecimal,
    outstandingAmount: BigDecimal
): void {
    const id = borrower.toHex() + "-" + lendingTokenAddress.toHex();
    const entity = Borrower.load(id);
    if (!entity) return;

    entity.updatedAt = event.block.timestamp;
    entity.borrowedAmount = borrowedAmount;
    entity.outstandingAmount = outstandingAmount;
    entity.depositedAmount = depositedAmount;
    entity.save();
}
