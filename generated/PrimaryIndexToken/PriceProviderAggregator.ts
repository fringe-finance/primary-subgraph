// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class ChangeActive extends ethereum.Event {
  get params(): ChangeActive__Params {
    return new ChangeActive__Params(this);
  }
}

export class ChangeActive__Params {
  _event: ChangeActive;

  constructor(event: ChangeActive) {
    this._event = event;
  }

  get who(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get priceProvider(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get token(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get active(): boolean {
    return this._event.parameters[3].value.toBoolean();
  }
}

export class GrandModeratorRole extends ethereum.Event {
  get params(): GrandModeratorRole__Params {
    return new GrandModeratorRole__Params(this);
  }
}

export class GrandModeratorRole__Params {
  _event: GrandModeratorRole;

  constructor(event: GrandModeratorRole) {
    this._event = event;
  }

  get who(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newModerator(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class RevokeModeratorRole extends ethereum.Event {
  get params(): RevokeModeratorRole__Params {
    return new RevokeModeratorRole__Params(this);
  }
}

export class RevokeModeratorRole__Params {
  _event: RevokeModeratorRole;

  constructor(event: RevokeModeratorRole) {
    this._event = event;
  }

  get who(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get moderator(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class RoleAdminChanged extends ethereum.Event {
  get params(): RoleAdminChanged__Params {
    return new RoleAdminChanged__Params(this);
  }
}

export class RoleAdminChanged__Params {
  _event: RoleAdminChanged;

  constructor(event: RoleAdminChanged) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get previousAdminRole(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get newAdminRole(): Bytes {
    return this._event.parameters[2].value.toBytes();
  }
}

export class RoleGranted extends ethereum.Event {
  get params(): RoleGranted__Params {
    return new RoleGranted__Params(this);
  }
}

export class RoleGranted__Params {
  _event: RoleGranted;

  constructor(event: RoleGranted) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get account(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class RoleRevoked extends ethereum.Event {
  get params(): RoleRevoked__Params {
    return new RoleRevoked__Params(this);
  }
}

export class RoleRevoked__Params {
  _event: RoleRevoked;

  constructor(event: RoleRevoked) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get account(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class SetTokenAndPriceProvider extends ethereum.Event {
  get params(): SetTokenAndPriceProvider__Params {
    return new SetTokenAndPriceProvider__Params(this);
  }
}

export class SetTokenAndPriceProvider__Params {
  _event: SetTokenAndPriceProvider;

  constructor(event: SetTokenAndPriceProvider) {
    this._event = event;
  }

  get who(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get token(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get priceProvider(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class PriceProviderAggregator__getPriceResult {
  value0: BigInt;
  value1: i32;

  constructor(value0: BigInt, value1: i32) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set(
      "value1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value1))
    );
    return map;
  }

  getPriceMantissa(): BigInt {
    return this.value0;
  }

  getPriceDecimals(): i32 {
    return this.value1;
  }
}

export class PriceProviderAggregator__getPriceSignedResult {
  value0: BigInt;
  value1: i32;

  constructor(value0: BigInt, value1: i32) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set(
      "value1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value1))
    );
    return map;
  }

  getPriceMantissa_(): BigInt {
    return this.value0;
  }

  getPriceDecimals(): i32 {
    return this.value1;
  }
}

export class PriceProviderAggregator__tokenPriceProviderResult {
  value0: Address;
  value1: boolean;

  constructor(value0: Address, value1: boolean) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromBoolean(this.value1));
    return map;
  }

  getPriceProvider(): Address {
    return this.value0;
  }

  getHasSignedFunction(): boolean {
    return this.value1;
  }
}

export class PriceProviderAggregator extends ethereum.SmartContract {
  static bind(address: Address): PriceProviderAggregator {
    return new PriceProviderAggregator("PriceProviderAggregator", address);
  }

  DEFAULT_ADMIN_ROLE(): Bytes {
    let result = super.call(
      "DEFAULT_ADMIN_ROLE",
      "DEFAULT_ADMIN_ROLE():(bytes32)",
      []
    );

    return result[0].toBytes();
  }

  try_DEFAULT_ADMIN_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "DEFAULT_ADMIN_ROLE",
      "DEFAULT_ADMIN_ROLE():(bytes32)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  MODERATOR_ROLE(): Bytes {
    let result = super.call("MODERATOR_ROLE", "MODERATOR_ROLE():(bytes32)", []);

    return result[0].toBytes();
  }

  try_MODERATOR_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "MODERATOR_ROLE",
      "MODERATOR_ROLE():(bytes32)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  getEvaluation(token: Address, tokenAmount: BigInt): BigInt {
    let result = super.call(
      "getEvaluation",
      "getEvaluation(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(tokenAmount)
      ]
    );

    return result[0].toBigInt();
  }

  try_getEvaluation(
    token: Address,
    tokenAmount: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getEvaluation",
      "getEvaluation(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(tokenAmount)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getEvaluationSigned(
    token: Address,
    tokenAmount: BigInt,
    priceMantissa: BigInt,
    validTo: BigInt,
    signature: Bytes
  ): BigInt {
    let result = super.call(
      "getEvaluationSigned",
      "getEvaluationSigned(address,uint256,uint256,uint256,bytes):(uint256)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(tokenAmount),
        ethereum.Value.fromUnsignedBigInt(priceMantissa),
        ethereum.Value.fromUnsignedBigInt(validTo),
        ethereum.Value.fromBytes(signature)
      ]
    );

    return result[0].toBigInt();
  }

  try_getEvaluationSigned(
    token: Address,
    tokenAmount: BigInt,
    priceMantissa: BigInt,
    validTo: BigInt,
    signature: Bytes
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getEvaluationSigned",
      "getEvaluationSigned(address,uint256,uint256,uint256,bytes):(uint256)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(tokenAmount),
        ethereum.Value.fromUnsignedBigInt(priceMantissa),
        ethereum.Value.fromUnsignedBigInt(validTo),
        ethereum.Value.fromBytes(signature)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getPrice(token: Address): PriceProviderAggregator__getPriceResult {
    let result = super.call("getPrice", "getPrice(address):(uint256,uint8)", [
      ethereum.Value.fromAddress(token)
    ]);

    return new PriceProviderAggregator__getPriceResult(
      result[0].toBigInt(),
      result[1].toI32()
    );
  }

  try_getPrice(
    token: Address
  ): ethereum.CallResult<PriceProviderAggregator__getPriceResult> {
    let result = super.tryCall(
      "getPrice",
      "getPrice(address):(uint256,uint8)",
      [ethereum.Value.fromAddress(token)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new PriceProviderAggregator__getPriceResult(
        value[0].toBigInt(),
        value[1].toI32()
      )
    );
  }

  getPriceSigned(
    token: Address,
    priceMantissa: BigInt,
    validTo: BigInt,
    signature: Bytes
  ): PriceProviderAggregator__getPriceSignedResult {
    let result = super.call(
      "getPriceSigned",
      "getPriceSigned(address,uint256,uint256,bytes):(uint256,uint8)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(priceMantissa),
        ethereum.Value.fromUnsignedBigInt(validTo),
        ethereum.Value.fromBytes(signature)
      ]
    );

    return new PriceProviderAggregator__getPriceSignedResult(
      result[0].toBigInt(),
      result[1].toI32()
    );
  }

  try_getPriceSigned(
    token: Address,
    priceMantissa: BigInt,
    validTo: BigInt,
    signature: Bytes
  ): ethereum.CallResult<PriceProviderAggregator__getPriceSignedResult> {
    let result = super.tryCall(
      "getPriceSigned",
      "getPriceSigned(address,uint256,uint256,bytes):(uint256,uint8)",
      [
        ethereum.Value.fromAddress(token),
        ethereum.Value.fromUnsignedBigInt(priceMantissa),
        ethereum.Value.fromUnsignedBigInt(validTo),
        ethereum.Value.fromBytes(signature)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new PriceProviderAggregator__getPriceSignedResult(
        value[0].toBigInt(),
        value[1].toI32()
      )
    );
  }

  getRoleAdmin(role: Bytes): Bytes {
    let result = super.call("getRoleAdmin", "getRoleAdmin(bytes32):(bytes32)", [
      ethereum.Value.fromFixedBytes(role)
    ]);

    return result[0].toBytes();
  }

  try_getRoleAdmin(role: Bytes): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "getRoleAdmin",
      "getRoleAdmin(bytes32):(bytes32)",
      [ethereum.Value.fromFixedBytes(role)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  hasRole(role: Bytes, account: Address): boolean {
    let result = super.call("hasRole", "hasRole(bytes32,address):(bool)", [
      ethereum.Value.fromFixedBytes(role),
      ethereum.Value.fromAddress(account)
    ]);

    return result[0].toBoolean();
  }

  try_hasRole(role: Bytes, account: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("hasRole", "hasRole(bytes32,address):(bool)", [
      ethereum.Value.fromFixedBytes(role),
      ethereum.Value.fromAddress(account)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  supportsInterface(interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  tokenPriceProvider(
    param0: Address
  ): PriceProviderAggregator__tokenPriceProviderResult {
    let result = super.call(
      "tokenPriceProvider",
      "tokenPriceProvider(address):(address,bool)",
      [ethereum.Value.fromAddress(param0)]
    );

    return new PriceProviderAggregator__tokenPriceProviderResult(
      result[0].toAddress(),
      result[1].toBoolean()
    );
  }

  try_tokenPriceProvider(
    param0: Address
  ): ethereum.CallResult<PriceProviderAggregator__tokenPriceProviderResult> {
    let result = super.tryCall(
      "tokenPriceProvider",
      "tokenPriceProvider(address):(address,bool)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new PriceProviderAggregator__tokenPriceProviderResult(
        value[0].toAddress(),
        value[1].toBoolean()
      )
    );
  }

  usdDecimals(): i32 {
    let result = super.call("usdDecimals", "usdDecimals():(uint8)", []);

    return result[0].toI32();
  }

  try_usdDecimals(): ethereum.CallResult<i32> {
    let result = super.tryCall("usdDecimals", "usdDecimals():(uint8)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }
}

export class ChangeActiveCall extends ethereum.Call {
  get inputs(): ChangeActiveCall__Inputs {
    return new ChangeActiveCall__Inputs(this);
  }

  get outputs(): ChangeActiveCall__Outputs {
    return new ChangeActiveCall__Outputs(this);
  }
}

export class ChangeActiveCall__Inputs {
  _call: ChangeActiveCall;

  constructor(call: ChangeActiveCall) {
    this._call = call;
  }

  get priceProvider(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get token(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get active(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }
}

export class ChangeActiveCall__Outputs {
  _call: ChangeActiveCall;

  constructor(call: ChangeActiveCall) {
    this._call = call;
  }
}

export class GrandModeratorCall extends ethereum.Call {
  get inputs(): GrandModeratorCall__Inputs {
    return new GrandModeratorCall__Inputs(this);
  }

  get outputs(): GrandModeratorCall__Outputs {
    return new GrandModeratorCall__Outputs(this);
  }
}

export class GrandModeratorCall__Inputs {
  _call: GrandModeratorCall;

  constructor(call: GrandModeratorCall) {
    this._call = call;
  }

  get newModerator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class GrandModeratorCall__Outputs {
  _call: GrandModeratorCall;

  constructor(call: GrandModeratorCall) {
    this._call = call;
  }
}

export class GrantRoleCall extends ethereum.Call {
  get inputs(): GrantRoleCall__Inputs {
    return new GrantRoleCall__Inputs(this);
  }

  get outputs(): GrantRoleCall__Outputs {
    return new GrantRoleCall__Outputs(this);
  }
}

export class GrantRoleCall__Inputs {
  _call: GrantRoleCall;

  constructor(call: GrantRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class GrantRoleCall__Outputs {
  _call: GrantRoleCall;

  constructor(call: GrantRoleCall) {
    this._call = call;
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class RenounceRoleCall extends ethereum.Call {
  get inputs(): RenounceRoleCall__Inputs {
    return new RenounceRoleCall__Inputs(this);
  }

  get outputs(): RenounceRoleCall__Outputs {
    return new RenounceRoleCall__Outputs(this);
  }
}

export class RenounceRoleCall__Inputs {
  _call: RenounceRoleCall;

  constructor(call: RenounceRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RenounceRoleCall__Outputs {
  _call: RenounceRoleCall;

  constructor(call: RenounceRoleCall) {
    this._call = call;
  }
}

export class RevokeModeratorCall extends ethereum.Call {
  get inputs(): RevokeModeratorCall__Inputs {
    return new RevokeModeratorCall__Inputs(this);
  }

  get outputs(): RevokeModeratorCall__Outputs {
    return new RevokeModeratorCall__Outputs(this);
  }
}

export class RevokeModeratorCall__Inputs {
  _call: RevokeModeratorCall;

  constructor(call: RevokeModeratorCall) {
    this._call = call;
  }

  get moderator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RevokeModeratorCall__Outputs {
  _call: RevokeModeratorCall;

  constructor(call: RevokeModeratorCall) {
    this._call = call;
  }
}

export class RevokeRoleCall extends ethereum.Call {
  get inputs(): RevokeRoleCall__Inputs {
    return new RevokeRoleCall__Inputs(this);
  }

  get outputs(): RevokeRoleCall__Outputs {
    return new RevokeRoleCall__Outputs(this);
  }
}

export class RevokeRoleCall__Inputs {
  _call: RevokeRoleCall;

  constructor(call: RevokeRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RevokeRoleCall__Outputs {
  _call: RevokeRoleCall;

  constructor(call: RevokeRoleCall) {
    this._call = call;
  }
}

export class SetTokenAndPriceProviderCall extends ethereum.Call {
  get inputs(): SetTokenAndPriceProviderCall__Inputs {
    return new SetTokenAndPriceProviderCall__Inputs(this);
  }

  get outputs(): SetTokenAndPriceProviderCall__Outputs {
    return new SetTokenAndPriceProviderCall__Outputs(this);
  }
}

export class SetTokenAndPriceProviderCall__Inputs {
  _call: SetTokenAndPriceProviderCall;

  constructor(call: SetTokenAndPriceProviderCall) {
    this._call = call;
  }

  get token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get priceProvider(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get hasFunctionWithSign(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }
}

export class SetTokenAndPriceProviderCall__Outputs {
  _call: SetTokenAndPriceProviderCall;

  constructor(call: SetTokenAndPriceProviderCall) {
    this._call = call;
  }
}
