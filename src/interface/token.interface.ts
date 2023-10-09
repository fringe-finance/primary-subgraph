import { Bytes } from "@graphprotocol/graph-ts";

export interface IToken {
  name: string
  symbol: string
  address: Bytes
  underlyingTokens: any;
}