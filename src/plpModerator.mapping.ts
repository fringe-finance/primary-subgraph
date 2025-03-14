import { BigDecimal, dataSource, store } from "@graphprotocol/graph-ts";

import { USD_DECIMALS } from "./constants/decimals";
import { exponentToBigDecimal } from "./helper/common.helper";
import { handleAddNewUnderlyingTokens, decreaseUnderlyingToken } from "./erc20.mapping";

import { LendingToken, ProjectToken } from "../generated/schema";
import {
    AddPrjToken,
    AddLendingToken,
    LoanToValueRatioSet,
    RemoveProjectToken,
    RemoveLendingToken,
    SetPausedProjectToken,
    SetPausedLendingToken,
    SetBorrowLimitPerLendingAsset,
    SetDepositLimitPerProjectAsset,
    PrimaryLendingPlatformModerator
} from "../generated/PrimaryLendingPlatformModerator/PrimaryLendingPlatformModerator";
import { ERC20 } from "../generated/PrimaryLendingPlatformV3/ERC20";
import { SpecialERC20 } from "../generated/PrimaryLendingPlatformModerator/SpecialERC20";
import { PrimaryLendingPlatformV3 } from "../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

export function handleAddPrjToken(event: AddPrjToken): void {
    const id = event.params.tokenPrj.toHex();
    let isAddNew = false;
    let entity = ProjectToken.load(id);
    if (entity == null) {
        entity = new ProjectToken(id);
        isAddNew = true;
    }
    const token = ERC20.bind(event.params.tokenPrj);
    entity.address = event.params.tokenPrj;
    const name = token.try_name();
    if (name.reverted) {
        const token = SpecialERC20.bind(event.params.tokenPrj);
        entity.name = token.name().toString();
        entity.symbol = token.symbol().toString();
        entity.decimals = token.decimals().toI32();
    } else {
        entity.name = name.value;
        entity.symbol = token.symbol();
        entity.decimals = token.decimals();
    }
    entity.updatedAt = event.block.timestamp;
    entity.underlyingTokens = handleAddNewUnderlyingTokens(event.params.tokenPrj, isAddNew);
    entity.save();
}

export function handleRemoveProjectToken(event: RemoveProjectToken): void {
    const id = event.params.tokenPrj.toHex();
    const entity = ProjectToken.load(id);

    if (entity == null) return;

    decreaseUnderlyingToken<ProjectToken>(entity);
    store.remove("ProjectToken", id);
}

export function handleAddLendingToken(event: AddLendingToken): void {
    const id = event.params.lendingToken.toHex();

    const primaryLendingPlatformModerator = PrimaryLendingPlatformModerator.bind(dataSource.address());
    const primaryLendingPlatformV3 = PrimaryLendingPlatformV3.bind(
        primaryLendingPlatformModerator.primaryLendingPlatform()
    );

    let isAddNew = false;
    let entity = LendingToken.load(id);
    if (entity == null) {
        entity = new LendingToken(id);
        isAddNew = true;
    }
    const token = ERC20.bind(event.params.lendingToken);
    entity.address = event.params.lendingToken;
    const name = token.try_name();
    if (name.reverted) {
        const token = SpecialERC20.bind(event.params.lendingToken);
        entity.name = token.name().toString();
        entity.symbol = token.symbol().toString();
        entity.decimals = token.decimals().toI32();
    } else {
        entity.name = name.value;
        entity.symbol = token.symbol();
        entity.decimals = token.decimals();
    }
    entity.fTokenAddress = primaryLendingPlatformV3.lendingTokenInfo(event.params.lendingToken).getBLendingToken();
    entity.updatedAt = event.block.timestamp;
    entity.underlyingTokens = handleAddNewUnderlyingTokens(event.params.lendingToken, isAddNew);
    entity.save();
}

export function handleRemoveLendingToken(event: RemoveLendingToken): void {
    const id = event.params.lendingToken.toHex();
    const entity = LendingToken.load(id);

    if (entity == null) return;

    decreaseUnderlyingToken<LendingToken>(entity);
    store.remove("LendingToken", id);
}

export function handleSetPausedProjectToken(event: SetPausedProjectToken): void {
    const id = event.params.projectToken.toHex();
    const entity = ProjectToken.load(id);

    if (entity == null) return;

    entity.isDepositPaused = event.params.isDepositPaused;
    entity.isWithdrawPaused = event.params.isWithdrawPaused;
    entity.updatedAt = event.block.timestamp;
    entity.save();
}

export function handleSetPausedLendingToken(event: SetPausedLendingToken): void {
    const id = event.params.lendingToken.toHex();
    const entity = LendingToken.load(id);

    if (entity == null) return;

    entity.isPaused = event.params.isPaused;
    entity.updatedAt = event.block.timestamp;
    entity.save();
}

export function handleSetDepositLimitPerProjectAsset(event: SetDepositLimitPerProjectAsset): void {
    const id = event.params.projectToken.toHex();
    const entity = ProjectToken.load(id);

    if (entity == null) return;

    const depositLimit = BigDecimal.fromString(event.params.depositLimit.toString()).div(
        exponentToBigDecimal(USD_DECIMALS)
    );
    const depositedAmount = entity.depositedAmount;
    if (depositedAmount !== null) {
        entity.currentDepositingLevel = depositLimit.notEqual(BigDecimal.fromString("0"))
            ? depositedAmount.div(depositLimit).times(BigDecimal.fromString("100"))
            : BigDecimal.fromString("0");
    }
    entity.depositingLevelAmount = depositLimit;
    entity.updatedAt = event.block.timestamp;
    entity.save();
}

export function handleSetBorrowLimitPerLendingAsset(event: SetBorrowLimitPerLendingAsset): void {
    const id = event.params.lendingToken.toHex();
    const entity = LendingToken.load(id);

    if (entity == null) return;

    entity.borrowingLevelAmount = BigDecimal.fromString(event.params.borrowLimit.toString()).div(
        exponentToBigDecimal(USD_DECIMALS)
    );
    entity.updatedAt = event.block.timestamp;
    entity.save();
}

export function handleLoanToValueRatioSet(event: LoanToValueRatioSet): void {
    const id = event.params.tokenPrj.toHex();
    const entity = ProjectToken.load(id);

    if (entity == null) return;

    const lvrNumerator = BigDecimal.fromString(event.params.lvrNumerator.toString());
    const lvrDenominator = BigDecimal.fromString(event.params.lvrDenominator.toString());

    if (lvrDenominator.equals(BigDecimal.fromString("0"))) return;

    entity.lvr = lvrNumerator.div(lvrDenominator).times(BigDecimal.fromString("100"));
    entity.updatedAt = event.block.timestamp;
    entity.save();
}
