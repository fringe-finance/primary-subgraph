import {
    AddPrjToken,
    Borrow,
    Deposit,
    Liquidate,
    LiquidationIncentiveSet,
    LiquidationThresholdFactorSet,
    LoanToValueRatioSet,
    PrimaryToken as ERC20,
    Redeem,
    RedeemUnderlying,
    RepayBorrow,
    RoleAdminChanged,
    RoleGranted,
    RoleRevoked,
    Supply,
    Withdraw
} from "../generated/PrimaryToken/PrimaryToken";
import { ProjectToken } from "../generated/schema";

export function handleAddPrjToken(event: AddPrjToken): void {
    // Generate ID from tx hash & log index
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "_" + logIndex;

    // Access PrimaryToken contract from bind mapping with token address
    const token = ERC20.bind(event.params.tokenPrj);

    // Create new entity based from ID
    // Will return existing entity if this ID is found
    const entity = new ProjectToken(id);

    // Entity fields can be set based on event parameters
    entity.address = event.params.tokenPrj;
    entity.name = token.name();
    entity.symbol = token.symbol();
    entity.timestamp = event.block.timestamp;

    // Entities can be written to the store with `.save()`
    entity.save();

    // The following functions can then be called on this contract to access
    // state variables and other data:
    //
    // - contract.DEFAULT_ADMIN_ROLE(...)
    // - contract.MODERATOR_ROLE(...)
    // - contract.borrowLimit(...)
    // - contract.borrowPosition(...)
    // - contract.decimals(...)
    // - contract.depositPosition(...)
    // - contract.getPosition(...)
    // - contract.getProjectTokenEvaluation(...)
    // - contract.getRoleAdmin(...)
    // - contract.hasRole(...)
    // - contract.healthFactor(...)
    // - contract.lendingTokenInfo(...)
    // - contract.lendingTokens(...)
    // - contract.lendingTokensLength(...)
    // - contract.liquidationThreshold(...)
    // - contract.name(...)
    // - contract.pit(...)
    // - contract.pitRemaining(...)
    // - contract.priceOracle(...)
    // - contract.projectTokenInfo(...)
    // - contract.projectTokens(...)
    // - contract.projectTokensLength(...)
    // - contract.repay(...)
    // - contract.supportsInterface(...)
    // - contract.symbol(...)
    // - contract.totalBorrow(...)
    // - contract.totalDepositedProjectToken(...)
    // - contract.totalOutstanding(...)
}

export function handleBorrow(event: Borrow): void {}

export function handleDeposit(event: Deposit): void {}

export function handleLiquidate(event: Liquidate): void {}

export function handleLiquidationIncentiveSet(event: LiquidationIncentiveSet): void {}

export function handleLiquidationThresholdFactorSet(event: LiquidationThresholdFactorSet): void {}

export function handleLoanToValueRatioSet(event: LoanToValueRatioSet): void {}

export function handleRedeem(event: Redeem): void {}

export function handleRedeemUnderlying(event: RedeemUnderlying): void {}

export function handleRepayBorrow(event: RepayBorrow): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleSupply(event: Supply): void {}

export function handleWithdraw(event: Withdraw): void {}
