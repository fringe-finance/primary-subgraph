import { Address, BigDecimal } from "@graphprotocol/graph-ts";

import { TotalState } from "../../generated/schema";

import { IEvent } from "../interface/event.interface";

export function updateTotalState<T extends IEvent>(
    event: T,
    stateType: string,
    lendingTokenAddress: Address,
    amount: BigDecimal
): void {
    const id =
        lendingTokenAddress == Address.zero() ? stateType : stateType + "-" + lendingTokenAddress.toHex();

    let entity = TotalState.load(id);
    if (!entity) entity = new TotalState(id);

    entity.type = stateType;
    entity.amount = amount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}
