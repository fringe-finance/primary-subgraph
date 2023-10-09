import { Address, BigInt } from "@graphprotocol/graph-ts";

export interface IEvent {
    address: Address;
    transaction: any;
    logIndex: BigInt;
    params: any;
    block: any;
}
