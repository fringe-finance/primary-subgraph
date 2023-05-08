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

export class AddLendingToken extends ethereum.Event {
  get params(): AddLendingToken__Params {
    return new AddLendingToken__Params(this);
  }
}

export class AddLendingToken__Params {
  _event: AddLendingToken;

  constructor(event: AddLendingToken) {
    this._event = event;
  }

  get lendingToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get name(): string {
    return this._event.parameters[1].value.toString();
  }

  get symbol(): string {
    return this._event.parameters[2].value.toString();
  }
}

export class AddPrjToken extends ethereum.Event {
  get params(): AddPrjToken__Params {
    return new AddPrjToken__Params(this);
  }
}

export class AddPrjToken__Params {
  _event: AddPrjToken;

  constructor(event: AddPrjToken) {
    this._event = event;
  }

  get tokenPrj(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get name(): string {
    return this._event.parameters[1].value.toString();
  }

  get symbol(): string {
    return this._event.parameters[2].value.toString();
  }
}

export class AddRelatedContracts extends ethereum.Event {
  get params(): AddRelatedContracts__Params {
    return new AddRelatedContracts__Params(this);
  }
}

export class AddRelatedContracts__Params {
  _event: AddRelatedContracts;

  constructor(event: AddRelatedContracts) {
    this._event = event;
  }

  get newRelatedContract(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class GrandModerator extends ethereum.Event {
  get params(): GrandModerator__Params {
    return new GrandModerator__Params(this);
  }
}

export class GrandModerator__Params {
  _event: GrandModerator;

  constructor(event: GrandModerator) {
    this._event = event;
  }

  get newModerator(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class LiquidationIncentiveSet extends ethereum.Event {
  get params(): LiquidationIncentiveSet__Params {
    return new LiquidationIncentiveSet__Params(this);
  }
}

export class LiquidationIncentiveSet__Params {
  _event: LiquidationIncentiveSet;

  constructor(event: LiquidationIncentiveSet) {
    this._event = event;
  }

  get tokenPrj(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get ltfNumerator(): i32 {
    return this._event.parameters[1].value.toI32();
  }

  get ltfDenominator(): i32 {
    return this._event.parameters[2].value.toI32();
  }
}

export class LiquidationThresholdFactorSet extends ethereum.Event {
  get params(): LiquidationThresholdFactorSet__Params {
    return new LiquidationThresholdFactorSet__Params(this);
  }
}

export class LiquidationThresholdFactorSet__Params {
  _event: LiquidationThresholdFactorSet;

  constructor(event: LiquidationThresholdFactorSet) {
    this._event = event;
  }

  get tokenPrj(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get ltfNumerator(): i32 {
    return this._event.parameters[1].value.toI32();
  }

  get ltfDenominator(): i32 {
    return this._event.parameters[2].value.toI32();
  }
}

export class LoanToValueRatioSet extends ethereum.Event {
  get params(): LoanToValueRatioSet__Params {
    return new LoanToValueRatioSet__Params(this);
  }
}

export class LoanToValueRatioSet__Params {
  _event: LoanToValueRatioSet;

  constructor(event: LoanToValueRatioSet) {
    this._event = event;
  }

  get tokenPrj(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get lvrNumerator(): i32 {
    return this._event.parameters[1].value.toI32();
  }

  get lvrDenominator(): i32 {
    return this._event.parameters[2].value.toI32();
  }
}

export class RemoveLendingToken extends ethereum.Event {
  get params(): RemoveLendingToken__Params {
    return new RemoveLendingToken__Params(this);
  }
}

export class RemoveLendingToken__Params {
  _event: RemoveLendingToken;

  constructor(event: RemoveLendingToken) {
    this._event = event;
  }

  get lendingToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class RemoveProjectToken extends ethereum.Event {
  get params(): RemoveProjectToken__Params {
    return new RemoveProjectToken__Params(this);
  }
}

export class RemoveProjectToken__Params {
  _event: RemoveProjectToken;

  constructor(event: RemoveProjectToken) {
    this._event = event;
  }

  get tokenPrj(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class RemoveRelatedContracts extends ethereum.Event {
  get params(): RemoveRelatedContracts__Params {
    return new RemoveRelatedContracts__Params(this);
  }
}

export class RemoveRelatedContracts__Params {
  _event: RemoveRelatedContracts;

  constructor(event: RemoveRelatedContracts) {
    this._event = event;
  }

  get relatedContract(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class RevokeModerator extends ethereum.Event {
  get params(): RevokeModerator__Params {
    return new RevokeModerator__Params(this);
  }
}

export class RevokeModerator__Params {
  _event: RevokeModerator;

  constructor(event: RevokeModerator) {
    this._event = event;
  }

  get moderator(): Address {
    return this._event.parameters[0].value.toAddress();
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

export class SetBorrowLimitPerCollateral extends ethereum.Event {
  get params(): SetBorrowLimitPerCollateral__Params {
    return new SetBorrowLimitPerCollateral__Params(this);
  }
}

export class SetBorrowLimitPerCollateral__Params {
  _event: SetBorrowLimitPerCollateral;

  constructor(event: SetBorrowLimitPerCollateral) {
    this._event = event;
  }

  get projectToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _borrowLimit(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class SetBorrowLimitPerLendingAsset extends ethereum.Event {
  get params(): SetBorrowLimitPerLendingAsset__Params {
    return new SetBorrowLimitPerLendingAsset__Params(this);
  }
}

export class SetBorrowLimitPerLendingAsset__Params {
  _event: SetBorrowLimitPerLendingAsset;

  constructor(event: SetBorrowLimitPerLendingAsset) {
    this._event = event;
  }

  get lendingToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _borrowLimit(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class SetPausedLendingToken extends ethereum.Event {
  get params(): SetPausedLendingToken__Params {
    return new SetPausedLendingToken__Params(this);
  }
}

export class SetPausedLendingToken__Params {
  _event: SetPausedLendingToken;

  constructor(event: SetPausedLendingToken) {
    this._event = event;
  }

  get _lendingToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _isPaused(): boolean {
    return this._event.parameters[1].value.toBoolean();
  }
}

export class SetPausedProjectToken extends ethereum.Event {
  get params(): SetPausedProjectToken__Params {
    return new SetPausedProjectToken__Params(this);
  }
}

export class SetPausedProjectToken__Params {
  _event: SetPausedProjectToken;

  constructor(event: SetPausedProjectToken) {
    this._event = event;
  }

  get _projectToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _isDepositPaused(): boolean {
    return this._event.parameters[1].value.toBoolean();
  }

  get _isWithdrawPaused(): boolean {
    return this._event.parameters[2].value.toBoolean();
  }
}

export class SetPriceOracle extends ethereum.Event {
  get params(): SetPriceOracle__Params {
    return new SetPriceOracle__Params(this);
  }
}

export class SetPriceOracle__Params {
  _event: SetPriceOracle;

  constructor(event: SetPriceOracle) {
    this._event = event;
  }

  get newOracle(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class SetPrimaryIndexTokenLeverage extends ethereum.Event {
  get params(): SetPrimaryIndexTokenLeverage__Params {
    return new SetPrimaryIndexTokenLeverage__Params(this);
  }
}

export class SetPrimaryIndexTokenLeverage__Params {
  _event: SetPrimaryIndexTokenLeverage;

  constructor(event: SetPrimaryIndexTokenLeverage) {
    this._event = event;
  }

  get newPrimaryIndexTokenLeverage(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class SetTotalBorrowPerLendingToken extends ethereum.Event {
  get params(): SetTotalBorrowPerLendingToken__Params {
    return new SetTotalBorrowPerLendingToken__Params(this);
  }
}

export class SetTotalBorrowPerLendingToken__Params {
  _event: SetTotalBorrowPerLendingToken;

  constructor(event: SetTotalBorrowPerLendingToken) {
    this._event = event;
  }

  get lendingToken(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get totalAmount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class SetUSDCToken extends ethereum.Event {
  get params(): SetUSDCToken__Params {
    return new SetUSDCToken__Params(this);
  }
}

export class SetUSDCToken__Params {
  _event: SetUSDCToken;

  constructor(event: SetUSDCToken) {
    this._event = event;
  }

  get usdc(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class PrimaryIndexTokenModerator extends ethereum.SmartContract {
  static bind(address: Address): PrimaryIndexTokenModerator {
    return new PrimaryIndexTokenModerator(
      "PrimaryIndexTokenModerator",
      address
    );
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

  primaryIndexToken(): Address {
    let result = super.call(
      "primaryIndexToken",
      "primaryIndexToken():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_primaryIndexToken(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "primaryIndexToken",
      "primaryIndexToken():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
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
}

export class AddLendingTokenCall extends ethereum.Call {
  get inputs(): AddLendingTokenCall__Inputs {
    return new AddLendingTokenCall__Inputs(this);
  }

  get outputs(): AddLendingTokenCall__Outputs {
    return new AddLendingTokenCall__Outputs(this);
  }
}

export class AddLendingTokenCall__Inputs {
  _call: AddLendingTokenCall;

  constructor(call: AddLendingTokenCall) {
    this._call = call;
  }

  get _lendingToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _bLendingToken(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _isPaused(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }
}

export class AddLendingTokenCall__Outputs {
  _call: AddLendingTokenCall;

  constructor(call: AddLendingTokenCall) {
    this._call = call;
  }
}

export class AddProjectTokenCall extends ethereum.Call {
  get inputs(): AddProjectTokenCall__Inputs {
    return new AddProjectTokenCall__Inputs(this);
  }

  get outputs(): AddProjectTokenCall__Outputs {
    return new AddProjectTokenCall__Outputs(this);
  }
}

export class AddProjectTokenCall__Inputs {
  _call: AddProjectTokenCall;

  constructor(call: AddProjectTokenCall) {
    this._call = call;
  }

  get _projectToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _loanToValueRatioNumerator(): i32 {
    return this._call.inputValues[1].value.toI32();
  }

  get _loanToValueRatioDenominator(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get _liquidationThresholdFactorNumerator(): i32 {
    return this._call.inputValues[3].value.toI32();
  }

  get _liquidationThresholdFactorDenominator(): i32 {
    return this._call.inputValues[4].value.toI32();
  }

  get _liquidationIncentiveNumerator(): i32 {
    return this._call.inputValues[5].value.toI32();
  }

  get _liquidationIncentiveDenominator(): i32 {
    return this._call.inputValues[6].value.toI32();
  }
}

export class AddProjectTokenCall__Outputs {
  _call: AddProjectTokenCall;

  constructor(call: AddProjectTokenCall) {
    this._call = call;
  }
}

export class AddRelatedContractsCall extends ethereum.Call {
  get inputs(): AddRelatedContractsCall__Inputs {
    return new AddRelatedContractsCall__Inputs(this);
  }

  get outputs(): AddRelatedContractsCall__Outputs {
    return new AddRelatedContractsCall__Outputs(this);
  }
}

export class AddRelatedContractsCall__Inputs {
  _call: AddRelatedContractsCall;

  constructor(call: AddRelatedContractsCall) {
    this._call = call;
  }

  get newRelatedContract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class AddRelatedContractsCall__Outputs {
  _call: AddRelatedContractsCall;

  constructor(call: AddRelatedContractsCall) {
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

  get pit(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class RemoveLendingTokenCall extends ethereum.Call {
  get inputs(): RemoveLendingTokenCall__Inputs {
    return new RemoveLendingTokenCall__Inputs(this);
  }

  get outputs(): RemoveLendingTokenCall__Outputs {
    return new RemoveLendingTokenCall__Outputs(this);
  }
}

export class RemoveLendingTokenCall__Inputs {
  _call: RemoveLendingTokenCall;

  constructor(call: RemoveLendingTokenCall) {
    this._call = call;
  }

  get _lendingTokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class RemoveLendingTokenCall__Outputs {
  _call: RemoveLendingTokenCall;

  constructor(call: RemoveLendingTokenCall) {
    this._call = call;
  }
}

export class RemoveProjectTokenCall extends ethereum.Call {
  get inputs(): RemoveProjectTokenCall__Inputs {
    return new RemoveProjectTokenCall__Inputs(this);
  }

  get outputs(): RemoveProjectTokenCall__Outputs {
    return new RemoveProjectTokenCall__Outputs(this);
  }
}

export class RemoveProjectTokenCall__Inputs {
  _call: RemoveProjectTokenCall;

  constructor(call: RemoveProjectTokenCall) {
    this._call = call;
  }

  get _projectTokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class RemoveProjectTokenCall__Outputs {
  _call: RemoveProjectTokenCall;

  constructor(call: RemoveProjectTokenCall) {
    this._call = call;
  }
}

export class RemoveRelatedContractsCall extends ethereum.Call {
  get inputs(): RemoveRelatedContractsCall__Inputs {
    return new RemoveRelatedContractsCall__Inputs(this);
  }

  get outputs(): RemoveRelatedContractsCall__Outputs {
    return new RemoveRelatedContractsCall__Outputs(this);
  }
}

export class RemoveRelatedContractsCall__Inputs {
  _call: RemoveRelatedContractsCall;

  constructor(call: RemoveRelatedContractsCall) {
    this._call = call;
  }

  get relatedContract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RemoveRelatedContractsCall__Outputs {
  _call: RemoveRelatedContractsCall;

  constructor(call: RemoveRelatedContractsCall) {
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

export class SetBorrowLimitPerCollateralCall extends ethereum.Call {
  get inputs(): SetBorrowLimitPerCollateralCall__Inputs {
    return new SetBorrowLimitPerCollateralCall__Inputs(this);
  }

  get outputs(): SetBorrowLimitPerCollateralCall__Outputs {
    return new SetBorrowLimitPerCollateralCall__Outputs(this);
  }
}

export class SetBorrowLimitPerCollateralCall__Inputs {
  _call: SetBorrowLimitPerCollateralCall;

  constructor(call: SetBorrowLimitPerCollateralCall) {
    this._call = call;
  }

  get projectToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _borrowLimit(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetBorrowLimitPerCollateralCall__Outputs {
  _call: SetBorrowLimitPerCollateralCall;

  constructor(call: SetBorrowLimitPerCollateralCall) {
    this._call = call;
  }
}

export class SetBorrowLimitPerLendingAssetCall extends ethereum.Call {
  get inputs(): SetBorrowLimitPerLendingAssetCall__Inputs {
    return new SetBorrowLimitPerLendingAssetCall__Inputs(this);
  }

  get outputs(): SetBorrowLimitPerLendingAssetCall__Outputs {
    return new SetBorrowLimitPerLendingAssetCall__Outputs(this);
  }
}

export class SetBorrowLimitPerLendingAssetCall__Inputs {
  _call: SetBorrowLimitPerLendingAssetCall;

  constructor(call: SetBorrowLimitPerLendingAssetCall) {
    this._call = call;
  }

  get lendingToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _borrowLimit(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetBorrowLimitPerLendingAssetCall__Outputs {
  _call: SetBorrowLimitPerLendingAssetCall;

  constructor(call: SetBorrowLimitPerLendingAssetCall) {
    this._call = call;
  }
}

export class SetLendingTokenInfoCall extends ethereum.Call {
  get inputs(): SetLendingTokenInfoCall__Inputs {
    return new SetLendingTokenInfoCall__Inputs(this);
  }

  get outputs(): SetLendingTokenInfoCall__Outputs {
    return new SetLendingTokenInfoCall__Outputs(this);
  }
}

export class SetLendingTokenInfoCall__Inputs {
  _call: SetLendingTokenInfoCall;

  constructor(call: SetLendingTokenInfoCall) {
    this._call = call;
  }

  get _lendingToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _bLendingToken(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _isPaused(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }
}

export class SetLendingTokenInfoCall__Outputs {
  _call: SetLendingTokenInfoCall;

  constructor(call: SetLendingTokenInfoCall) {
    this._call = call;
  }
}

export class SetPausedLendingTokenCall extends ethereum.Call {
  get inputs(): SetPausedLendingTokenCall__Inputs {
    return new SetPausedLendingTokenCall__Inputs(this);
  }

  get outputs(): SetPausedLendingTokenCall__Outputs {
    return new SetPausedLendingTokenCall__Outputs(this);
  }
}

export class SetPausedLendingTokenCall__Inputs {
  _call: SetPausedLendingTokenCall;

  constructor(call: SetPausedLendingTokenCall) {
    this._call = call;
  }

  get _lendingToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _isPaused(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }
}

export class SetPausedLendingTokenCall__Outputs {
  _call: SetPausedLendingTokenCall;

  constructor(call: SetPausedLendingTokenCall) {
    this._call = call;
  }
}

export class SetPausedProjectTokenCall extends ethereum.Call {
  get inputs(): SetPausedProjectTokenCall__Inputs {
    return new SetPausedProjectTokenCall__Inputs(this);
  }

  get outputs(): SetPausedProjectTokenCall__Outputs {
    return new SetPausedProjectTokenCall__Outputs(this);
  }
}

export class SetPausedProjectTokenCall__Inputs {
  _call: SetPausedProjectTokenCall;

  constructor(call: SetPausedProjectTokenCall) {
    this._call = call;
  }

  get _projectToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _isDepositPaused(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }

  get _isWithdrawPaused(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }
}

export class SetPausedProjectTokenCall__Outputs {
  _call: SetPausedProjectTokenCall;

  constructor(call: SetPausedProjectTokenCall) {
    this._call = call;
  }
}

export class SetPriceOracleCall extends ethereum.Call {
  get inputs(): SetPriceOracleCall__Inputs {
    return new SetPriceOracleCall__Inputs(this);
  }

  get outputs(): SetPriceOracleCall__Outputs {
    return new SetPriceOracleCall__Outputs(this);
  }
}

export class SetPriceOracleCall__Inputs {
  _call: SetPriceOracleCall;

  constructor(call: SetPriceOracleCall) {
    this._call = call;
  }

  get newOracle(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetPriceOracleCall__Outputs {
  _call: SetPriceOracleCall;

  constructor(call: SetPriceOracleCall) {
    this._call = call;
  }
}

export class SetPrimaryIndexTokenLeverageCall extends ethereum.Call {
  get inputs(): SetPrimaryIndexTokenLeverageCall__Inputs {
    return new SetPrimaryIndexTokenLeverageCall__Inputs(this);
  }

  get outputs(): SetPrimaryIndexTokenLeverageCall__Outputs {
    return new SetPrimaryIndexTokenLeverageCall__Outputs(this);
  }
}

export class SetPrimaryIndexTokenLeverageCall__Inputs {
  _call: SetPrimaryIndexTokenLeverageCall;

  constructor(call: SetPrimaryIndexTokenLeverageCall) {
    this._call = call;
  }

  get newPrimaryIndexTokenLeverage(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetPrimaryIndexTokenLeverageCall__Outputs {
  _call: SetPrimaryIndexTokenLeverageCall;

  constructor(call: SetPrimaryIndexTokenLeverageCall) {
    this._call = call;
  }
}

export class SetProjectTokenInfoCall extends ethereum.Call {
  get inputs(): SetProjectTokenInfoCall__Inputs {
    return new SetProjectTokenInfoCall__Inputs(this);
  }

  get outputs(): SetProjectTokenInfoCall__Outputs {
    return new SetProjectTokenInfoCall__Outputs(this);
  }
}

export class SetProjectTokenInfoCall__Inputs {
  _call: SetProjectTokenInfoCall;

  constructor(call: SetProjectTokenInfoCall) {
    this._call = call;
  }

  get _projectToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _loanToValueRatioNumerator(): i32 {
    return this._call.inputValues[1].value.toI32();
  }

  get _loanToValueRatioDenominator(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get _liquidationThresholdFactorNumerator(): i32 {
    return this._call.inputValues[3].value.toI32();
  }

  get _liquidationThresholdFactorDenominator(): i32 {
    return this._call.inputValues[4].value.toI32();
  }

  get _liquidationIncentiveNumerator(): i32 {
    return this._call.inputValues[5].value.toI32();
  }

  get _liquidationIncentiveDenominator(): i32 {
    return this._call.inputValues[6].value.toI32();
  }
}

export class SetProjectTokenInfoCall__Outputs {
  _call: SetProjectTokenInfoCall;

  constructor(call: SetProjectTokenInfoCall) {
    this._call = call;
  }
}

export class SetTotalBorrowPerLendingTokenCall extends ethereum.Call {
  get inputs(): SetTotalBorrowPerLendingTokenCall__Inputs {
    return new SetTotalBorrowPerLendingTokenCall__Inputs(this);
  }

  get outputs(): SetTotalBorrowPerLendingTokenCall__Outputs {
    return new SetTotalBorrowPerLendingTokenCall__Outputs(this);
  }
}

export class SetTotalBorrowPerLendingTokenCall__Inputs {
  _call: SetTotalBorrowPerLendingTokenCall;

  constructor(call: SetTotalBorrowPerLendingTokenCall) {
    this._call = call;
  }

  get lendingToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetTotalBorrowPerLendingTokenCall__Outputs {
  _call: SetTotalBorrowPerLendingTokenCall;

  constructor(call: SetTotalBorrowPerLendingTokenCall) {
    this._call = call;
  }
}

export class SetUSDCTokenCall extends ethereum.Call {
  get inputs(): SetUSDCTokenCall__Inputs {
    return new SetUSDCTokenCall__Inputs(this);
  }

  get outputs(): SetUSDCTokenCall__Outputs {
    return new SetUSDCTokenCall__Outputs(this);
  }
}

export class SetUSDCTokenCall__Inputs {
  _call: SetUSDCTokenCall;

  constructor(call: SetUSDCTokenCall) {
    this._call = call;
  }

  get usdc(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetUSDCTokenCall__Outputs {
  _call: SetUSDCTokenCall;

  constructor(call: SetUSDCTokenCall) {
    this._call = call;
  }
}

export class TransferAdminshipCall extends ethereum.Call {
  get inputs(): TransferAdminshipCall__Inputs {
    return new TransferAdminshipCall__Inputs(this);
  }

  get outputs(): TransferAdminshipCall__Outputs {
    return new TransferAdminshipCall__Outputs(this);
  }
}

export class TransferAdminshipCall__Inputs {
  _call: TransferAdminshipCall;

  constructor(call: TransferAdminshipCall) {
    this._call = call;
  }

  get newAdmin(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferAdminshipCall__Outputs {
  _call: TransferAdminshipCall;

  constructor(call: TransferAdminshipCall) {
    this._call = call;
  }
}

export class TransferAdminshipForPITCall extends ethereum.Call {
  get inputs(): TransferAdminshipForPITCall__Inputs {
    return new TransferAdminshipForPITCall__Inputs(this);
  }

  get outputs(): TransferAdminshipForPITCall__Outputs {
    return new TransferAdminshipForPITCall__Outputs(this);
  }
}

export class TransferAdminshipForPITCall__Inputs {
  _call: TransferAdminshipForPITCall;

  constructor(call: TransferAdminshipForPITCall) {
    this._call = call;
  }

  get currentAdmin(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get newAdmin(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class TransferAdminshipForPITCall__Outputs {
  _call: TransferAdminshipForPITCall;

  constructor(call: TransferAdminshipForPITCall) {
    this._call = call;
  }
}
