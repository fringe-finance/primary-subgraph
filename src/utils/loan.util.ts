import { Address, bigDecimal, BigDecimal } from "@graphprotocol/graph-ts";

import { BorrowedState, User } from "../../generated/schema";
import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

import { IEvent } from "../interface/event.interface";
import { getUsdOraclePrice } from "./priceOracle.util";
import { AssetType } from "../constants/assetsType";

export function getTotalOutstandingPerLendingTokenInUSD<T extends IEvent>(
    event: T,
    primaryLendingPlatformV3: PrimaryLendingPlatformV3,
    lendingTokenAddress: Address
): BigDecimal {
    const id = lendingTokenAddress.toHex();

    const borrowedStateEntity = BorrowedState.load(id);
    if (!borrowedStateEntity) return BigDecimal.fromString("0");

    const borrowers = borrowedStateEntity.userAddresses;
    if (!borrowers) return BigDecimal.fromString("0");

    let totalOutstandingInUSD = bigDecimal.fromString("0");
    for (let i = 0; i < borrowers.length; i++) {
        const borrowerEntity = User.load(borrowers[i]);
        if (borrowerEntity) {
            const borrower = Address.fromBytes(borrowerEntity.address);
            const estimatedOutstanding = primaryLendingPlatformV3.getEstimatedOutstanding(
                borrower,
                lendingTokenAddress
            );
            const outstandingAmount = estimatedOutstanding
                .getLoanBody()
                .plus(estimatedOutstanding.getAccrual());
            const outstandingAmountInUSD = getUsdOraclePrice(
                primaryLendingPlatformV3,
                lendingTokenAddress,
                outstandingAmount,
                AssetType.CAPITAL
            );
            const depositedAmount = primaryLendingPlatformV3.depositedAmount(borrower, lendingTokenAddress);
            const borrowedAmount = estimatedOutstanding.getLoanBody();

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
    return totalOutstandingInUSD;
}

export function updateBorrower<T extends IEvent>(
    event: T,
    borrower: Address,
    lendingTokenAddress: Address,
    depositedAmount: BigDecimal,
    borrowedAmount: BigDecimal,
    outstandingAmount: BigDecimal
): void {
    const id = borrower.toHex() + "-" + lendingTokenAddress.toHex();
    const entity = User.load(id);
    if (!entity) return;

    entity.updatedAt = event.block.timestamp;
    entity.borrowedAmount = borrowedAmount;
    entity.outstandingAmount = outstandingAmount;
    entity.depositedAmount = depositedAmount;
    entity.save();
}
