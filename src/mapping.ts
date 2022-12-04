import { LenderAPYHistory, BorrowingAPYHistory, LenderAggregateCapitalDepositedHistory } from './../generated/schema';
import { BLendingToken } from './../generated/PrimaryIndexToken/BLendingToken';
import { PriceProviderAggregator } from "./../generated/PrimaryIndexToken/PriceProviderAggregator";
import {
    AddPrjToken,
    AddLendingToken,
    Borrow,
    Deposit,
    Liquidate,
    LiquidationIncentiveSet,
    LiquidationThresholdFactorSet,
    LoanToValueRatioSet,
    PrimaryIndexToken,
    Redeem,
    RedeemUnderlying,
    RemoveProjectToken,
    RemoveLendingToken,
    RepayBorrow,
    RoleAdminChanged,
    RoleGranted,
    RoleRevoked,
    Supply,
    Withdraw
} from "../generated/PrimaryIndexToken/PrimaryIndexToken";
import { ERC20 } from "../generated/PrimaryIndexToken/ERC20";
import {
    BorrowLog,
    CollateralDepositedHistory,
    LendingToken,
    PITTokenHistory,
    ProjectToken,
    OutstandingHistory,
    CollateralVSLoanRatioHistory,
    TotalState
} from "../generated/schema";
import { TOTAL_AMOUNT_COLLATERAL_DEPOSITED } from "./constants/chartsType";
import { DEPOSIT, BORROWED, REPAY, WITHDRAW } from "./constants/eventsType";
import { USD_DECIMALS, SCALE_DECIMALS } from "./constants/decimals";
import { DAY_PER_YEAR, BLOCKS_PER_DAY } from "./constants/configs";
import { exponentToBigDecimal, pow } from "./helpers";
import { Address, BigDecimal, BigInt, store, dataSource, log } from "@graphprotocol/graph-ts";

export function handleAddPrjToken(event: AddPrjToken): void {
    const id = event.params.tokenPrj.toHex();

    let entity = ProjectToken.load(id);
    if (entity == null) {
        entity = new ProjectToken(id);
    }

    entity.address = event.params.tokenPrj;
    entity.name = event.params.name;
    entity.symbol = event.params.symbol;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleRemoveProjectToken(event: RemoveProjectToken): void {
    const id = event.params.tokenPrj.toHex();

    let entity = ProjectToken.load(id);
    if (entity != null) {
        store.remove("ProjectToken", id);
    }
}

export function handleAddLendingToken(event: AddLendingToken): void {
    const id = event.params.lendingToken.toHex();

    let entity = LendingToken.load(id);
    if (entity == null) {
        entity = new LendingToken(id);
    }

    entity.address = event.params.lendingToken;
    entity.name = event.params.name;
    entity.symbol = event.params.symbol;
    entity.updatedAt = event.block.timestamp;

    entity.save();
}

export function handleRemoveLendingToken(event: RemoveLendingToken): void {
    const id = event.params.lendingToken.toHex();

    let entity = LendingToken.load(id);
    if (entity != null) {
        store.remove("LendingToken", id);
    }
}

export function handleBorrow(event: Borrow): void {
    handleBorrowInBorrowLog(event);
    const totalOutstandingAmount = handleBorrowRepayInPositionState<Borrow>(event);
    updateOutstandingHistory<Borrow>(event, Address.zero(), totalOutstandingAmount);
    updateCollateralVSLoanRatioHistory<Borrow>(event, Address.zero(), BigDecimal.fromString("0"), totalOutstandingAmount);
    handleLenderAPYHistory<Borrow>(event);
    handleBorrowingAPYHistory<Borrow>(event);
}

export function handleDeposit(event: Deposit): void {
    handleDepositInBorrowLog(event);
    const totalStateUpdated = handleDepositWithdrawInPositionState();
    updateCollateralDepositedHistory<Deposit>(event, Address.zero(), totalStateUpdated[0]);
    updatePITTokenHistory<Deposit>(event, totalStateUpdated[1]);
}

export function handleRepayBorrow(event: RepayBorrow): void {
    handleRepayBorrowInBorrowLog(event);
    const totalOutstandingAmount = handleBorrowRepayInPositionState<RepayBorrow>(event);
    updateOutstandingHistory<RepayBorrow>(event, Address.zero(), totalOutstandingAmount);
    updateCollateralVSLoanRatioHistory<RepayBorrow>(event, Address.zero(), BigDecimal.fromString("0"), totalOutstandingAmount);
    handleLenderAPYHistory<RepayBorrow>(event);
    handleBorrowingAPYHistory<RepayBorrow>(event);
}

export function handleWithdraw(event: Withdraw): void {
    handleWithdrawInBorrowLog(event);
    const totalStateUpdated = handleDepositWithdrawInPositionState();
    updateCollateralDepositedHistory<Withdraw>(event, Address.zero(), totalStateUpdated[0]);
    updatePITTokenHistory<Withdraw>(event, totalStateUpdated[1]);
}

export function handleLiquidate(event: Liquidate): void {
    handleLenderAPYHistory<Liquidate>(event);
    handleBorrowingAPYHistory<Liquidate>(event);
}

export function handleSupply(event: Supply): void {
    handleLenderAPYHistory<Supply>(event);
    handleBorrowingAPYHistory<Supply>(event);
    handleLenderAggregateCapitalDepositedHistory<Supply>(event);
}

export function handleRedeem(event: Redeem): void {
    handleLenderAPYHistory<Redeem>(event);
    handleBorrowingAPYHistory<Redeem>(event);
    handleLenderAggregateCapitalDepositedHistory<Redeem>(event);
}

export function handleRedeemUnderlying(event: RedeemUnderlying): void {
    handleLenderAPYHistory<RedeemUnderlying>(event);
    handleBorrowingAPYHistory<RedeemUnderlying>(event);
    handleLenderAggregateCapitalDepositedHistory<RedeemUnderlying>(event);
}

export function handleLiquidationIncentiveSet(event: LiquidationIncentiveSet): void {}

export function handleLiquidationThresholdFactorSet(event: LiquidationThresholdFactorSet): void {}

export function handleLoanToValueRatioSet(event: LoanToValueRatioSet): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

/************************************ Handle BorrowLog ************************************/
function handleDepositInBorrowLog(event: Deposit): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const prjToken = ERC20.bind(event.params.tokenPrj);

    entity.amount = event.params.prjDepositAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(prjToken.decimals()));
    entity.asset = prjToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = DEPOSIT;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.tokenPrj;

    entity.save();
}

function handleBorrowInBorrowLog(event: Borrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const borrowToken = ERC20.bind(event.params.borrowToken);
    const prjToken = ERC20.bind(event.params.prjAddress);

    entity.amount = event.params.borrowAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(borrowToken.decimals()));
    entity.asset = borrowToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = BORROWED;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.prjAddress;

    entity.save();
}

function handleRepayBorrowInBorrowLog(event: RepayBorrow): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const borrowToken = ERC20.bind(event.params.borrowToken);
    const prjToken = ERC20.bind(event.params.prjAddress);

    entity.amount = event.params.borrowAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(borrowToken.decimals()));
    entity.asset = borrowToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = REPAY;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.prjAddress;

    entity.save();
}

function handleWithdrawInBorrowLog(event: Withdraw): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = BorrowLog.load(id);
    if (entity == null) {
        entity = new BorrowLog(id);
    }

    const prjToken = ERC20.bind(event.params.tokenPrj);

    entity.amount = event.params.prjWithdrawAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(prjToken.decimals()));
    entity.asset = prjToken.symbol();
    entity.prjToken = prjToken.symbol();
    entity.type = WITHDRAW;
    entity.date = event.block.timestamp;
    entity.userAddress = event.params.who;
    entity.prjTokenAddress = event.params.tokenPrj;

    entity.save();
}

/************************************ Handle PositionState ************************************/
function handleBorrowRepayInPositionState<T>(event: T): BigDecimal {
    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    let totalOutstandingAmount = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryIndexToken);
    const prjTokensList = getPrjTokensList(primaryIndexToken);
    for (let i = 0; i < lendingTokensList.length; i++) {
        let totalCollateralDepositedPerToken = BigInt.fromString("0");
        let totalCollateralAmount = BigDecimal.fromString("0");
        for (let j = 0; j < prjTokensList.length; j++) {
            const totalCollateralDepositedPerPair = primaryIndexToken.totalBorrow(prjTokensList[j], lendingTokensList[i]);
            totalCollateralDepositedPerToken = totalCollateralDepositedPerToken.plus(totalCollateralDepositedPerPair);

            const lvr = primaryIndexToken.projectTokenInfo(prjTokensList[j]).getLoanToValueRatio();
            const collateralAmount = getUsdOraclePrice(primaryIndexToken, lendingTokensList[i], totalCollateralDepositedPerPair)
                .times(BigDecimal.fromString(lvr.denominator.toString()))
                .div(BigDecimal.fromString(lvr.numerator.toString()));
            totalCollateralAmount = totalCollateralAmount.plus(collateralAmount);
        }
        const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, lendingTokensList[i], totalCollateralDepositedPerToken);
        totalOutstandingAmount = totalOutstandingAmount.plus(usdOraclePrice);

        updateCollateralDepositedHistory<T>(event, lendingTokensList[i], totalCollateralAmount);
        updateOutstandingHistory<T>(event, lendingTokensList[i], usdOraclePrice);
        updateCollateralVSLoanRatioHistory<T>(event, lendingTokensList[i], totalCollateralAmount, usdOraclePrice);
    }
    return totalOutstandingAmount;
}

function handleDepositWithdrawInPositionState(): Array<BigDecimal> {
    const primaryIndexToken = PrimaryIndexToken.bind(dataSource.address());

    let usdAmount = BigDecimal.fromString("0");
    let totalPITAmount = BigDecimal.fromString("0");

    const prjTokensList = getPrjTokensList(primaryIndexToken);
    for (let i = 0; i < prjTokensList.length; i++) {
        const totalDepositedPerToken = primaryIndexToken.totalDepositedProjectToken(prjTokensList[i]);
        const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, prjTokensList[i], totalDepositedPerToken);
        usdAmount = usdAmount.plus(usdOraclePrice);

        const lvr = primaryIndexToken.projectTokenInfo(prjTokensList[i]).getLoanToValueRatio();
        const pitAmount = usdOraclePrice
            .times(BigDecimal.fromString(lvr.numerator.toString()))
            .div(BigDecimal.fromString(lvr.denominator.toString()));
        totalPITAmount = totalPITAmount.plus(pitAmount);
    }
    let totalStateUpdated = new Array<BigDecimal>();
    totalStateUpdated.push(usdAmount);
    totalStateUpdated.push(totalPITAmount);

    return totalStateUpdated;
}

/************************************ Handle CollateralDepositedHistory ************************************/
function updateCollateralDepositedHistory<T>(event: T, lendingTokenAddress: Address, collateralAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = lendingTokenAddress == Address.zero() ? txhash + "-" + logIndex : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = CollateralDepositedHistory.load(id);
    if (entity == null) {
        entity = new CollateralDepositedHistory(id);
    }

    entity.amount = collateralAmount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
    if (lendingTokenAddress == Address.zero()) {
        updateTotalState<T>(event, collateralAmount);
    }
}

/************************************ Handle PITTokenHistory ************************************/
function updatePITTokenHistory<T>(event : T, pitAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = txhash + "-" + logIndex;

    let entity = PITTokenHistory.load(id);
    if (entity == null) {
        entity = new PITTokenHistory(id);
    }

    entity.amount = pitAmount;
    entity.lendingTokenAddress = null;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle OutstandingHistory ************************************/
function updateOutstandingHistory<T>(event : T, lendingTokenAddress: Address, outstandingAmount: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = lendingTokenAddress == Address.zero() ? txhash + "-" + logIndex : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = OutstandingHistory.load(id);
    if (entity == null) {
        entity = new OutstandingHistory(id);
    }

    entity.amount = outstandingAmount;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle CollateralVSLoanRatioHistory ************************************/
function updateCollateralVSLoanRatioHistory<T>(event : T, lendingTokenAddress: Address, collateralAmount: BigDecimal, outstandingAmount: BigDecimal): void {
    if (outstandingAmount.le(BigDecimal.fromString("0"))) {
        return;
    }
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = lendingTokenAddress == Address.zero() ? txhash + "-" + logIndex : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let specifiedCollateralAmount = collateralAmount;
    if (lendingTokenAddress == Address.zero()) {
        let totalStateEntity = TotalState.load(TOTAL_AMOUNT_COLLATERAL_DEPOSITED);
        if (totalStateEntity == null) {
            totalStateEntity = new TotalState(TOTAL_AMOUNT_COLLATERAL_DEPOSITED);
            log.info("totalStateEntity is created", []);
        }
        specifiedCollateralAmount = totalStateEntity.amount;
    }

    let entity = CollateralVSLoanRatioHistory.load(id);
    if (entity == null) {
        entity = new CollateralVSLoanRatioHistory(id);
    }

    entity.amount = specifiedCollateralAmount.div(outstandingAmount);
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle TotalState ************************************/
function updateTotalState<T>(event: T, totalCollateralAmount: BigDecimal): TotalState {
    const id = TOTAL_AMOUNT_COLLATERAL_DEPOSITED;

    let entity = TotalState.load(id);
    if (entity == null) {
        entity = new TotalState(id);
    }
    entity.amount = totalCollateralAmount;
    entity.updatedAt = event.block.timestamp;
    entity.save();

    return entity;
}

/************************************ Handle LenderAPYHistory ************************************/
function handleLenderAPYHistory<T>(event: T): void {
    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    let totalLenderAPY = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryIndexToken);
    for (let i = 0; i < lendingTokensList.length; i++) {
        const lenderAPY = getLenderAPYPerLendingToken(primaryIndexToken, lendingTokensList[i]);
        totalLenderAPY = totalLenderAPY.plus(lenderAPY);

        updateLenderAPYHistory<T>(event, lendingTokensList[i], lenderAPY);
    }

    updateLenderAPYHistory<T>(event, Address.zero(), totalLenderAPY.div(BigDecimal.fromString(lendingTokensList.length.toString())));
}

function updateLenderAPYHistory<T>(event : T, lendingTokenAddress: Address, lenderAPY: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = lendingTokenAddress == Address.zero() ? txhash + "-" + logIndex : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = LenderAPYHistory.load(id);
    if (entity == null) {
        entity = new LenderAPYHistory(id);
    }

    entity.amount = lenderAPY;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle BorrowingAPYHistory ************************************/
function handleBorrowingAPYHistory<T>(event: T): void {
    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    let totalBorrowingAPY = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryIndexToken);
    for (let i = 0; i < lendingTokensList.length; i++) {
        const borrowingAPY = getBorrowingAPYPerLendingToken(primaryIndexToken, lendingTokensList[i]);
        totalBorrowingAPY = totalBorrowingAPY.plus(borrowingAPY);

        updateBorrowingAPYHistory<T>(event, lendingTokensList[i], borrowingAPY);
    }

    updateBorrowingAPYHistory<T>(event, Address.zero(), totalBorrowingAPY.div(BigDecimal.fromString(lendingTokensList.length.toString())));
}

function updateBorrowingAPYHistory<T>(event : T, lendingTokenAddress: Address, borrowingAPY: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = lendingTokenAddress == Address.zero() ? txhash + "-" + logIndex : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = BorrowingAPYHistory.load(id);
    if (entity == null) {
        entity = new BorrowingAPYHistory(id);
    }

    entity.amount = borrowingAPY;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Handle LenderAggregateCapitalDepositedHistory ************************************/
function handleLenderAggregateCapitalDepositedHistory<T>(event: T): void {
    const primaryIndexToken = PrimaryIndexToken.bind(event.address);
    let totalSupply = BigDecimal.fromString("0");

    const lendingTokensList = getLendingTokensList(primaryIndexToken);
    for (let i = 0; i < lendingTokensList.length; i++) {
        const supplyAmount = getLenderAggregateCapitalDepositedPerLendingToken(primaryIndexToken, lendingTokensList[i]);
        totalSupply = totalSupply.plus(supplyAmount);

        updateLenderAggregateCapitalDepositedHistory<T>(event, lendingTokensList[i], supplyAmount);
    }

    updateLenderAggregateCapitalDepositedHistory<T>(event, Address.zero(), totalSupply);
}

function updateLenderAggregateCapitalDepositedHistory<T>(event : T, lendingTokenAddress: Address, totalSupply: BigDecimal): void {
    const txhash = event.transaction.hash.toHex();
    const logIndex = event.logIndex.toString();
    const id = lendingTokenAddress == Address.zero() ? txhash + "-" + logIndex : txhash + "-" + logIndex + "-" + lendingTokenAddress.toHex();

    let entity = LenderAggregateCapitalDepositedHistory.load(id);
    if (entity == null) {
        entity = new LenderAggregateCapitalDepositedHistory(id);
    }

    entity.amount = totalSupply;
    entity.lendingTokenAddress = lendingTokenAddress == Address.zero() ? null : lendingTokenAddress;
    entity.date = event.block.timestamp;

    entity.save();
}

/************************************ Internal Functions ************************************/
function getUsdOraclePrice(primaryIndexToken: PrimaryIndexToken, tokenAddr: Address, amount: BigInt): BigDecimal {
    const priceOracle = PriceProviderAggregator.bind(primaryIndexToken.priceOracle());
    const usdOraclePrice = priceOracle.try_getEvaluation(tokenAddr, amount);
    if (usdOraclePrice.reverted) {
        log.info("tokenAddr: {}, amount: {}", [tokenAddr.toHexString(), amount.toString()]);
        return BigDecimal.fromString("0");
    }

    return usdOraclePrice.value.toBigDecimal().div(exponentToBigDecimal(USD_DECIMALS));
}

function getPrjTokensList(primaryIndexToken: PrimaryIndexToken): Array<Address> {
    const prjTokensLength = primaryIndexToken.projectTokensLength();
    let prjTokensList = new Array<Address>();
    for (let i = 0; i < prjTokensLength.toI32(); i++) {
        const prjTokenAddress = primaryIndexToken.projectTokens(BigInt.fromI32(i));
        prjTokensList.push(prjTokenAddress);
    }
    return prjTokensList;
}

function getLendingTokensList(primaryIndexToken: PrimaryIndexToken): Array<Address> {
    const lendingTokensLength = primaryIndexToken.lendingTokensLength();
    let lendingTokensList = new Array<Address>();
    for (let i = 0; i < lendingTokensLength.toI32(); i++) {
        const lendingTokenAddress = primaryIndexToken.lendingTokens(BigInt.fromI32(i));
        lendingTokensList.push(lendingTokenAddress);
    }
    return lendingTokensList;
}

function getLenderAPYPerLendingToken(primaryIndexToken: PrimaryIndexToken, lendingTokenAddress: Address): BigDecimal {
    const bLendingTokenAddress = primaryIndexToken.lendingTokenInfo(lendingTokenAddress).getBLendingToken();
    const bLendingToken = BLendingToken.bind(bLendingTokenAddress);
    const supplyRatePerBlock = bLendingToken.supplyRatePerBlock().toBigDecimal().div(exponentToBigDecimal(SCALE_DECIMALS));
    const supplyRatePerDay = supplyRatePerBlock.times(BigDecimal.fromString(BLOCKS_PER_DAY.toString()));
    const lenderAPY = pow(supplyRatePerDay.plus(BigDecimal.fromString("1")), DAY_PER_YEAR)
        .minus(BigDecimal.fromString("1"))
        .times(BigDecimal.fromString("100"));
    
    return lenderAPY;
}

function getBorrowingAPYPerLendingToken(primaryIndexToken: PrimaryIndexToken, lendingTokenAddress: Address): BigDecimal {
    const bLendingTokenAddress = primaryIndexToken.lendingTokenInfo(lendingTokenAddress).getBLendingToken();
    const bLendingToken = BLendingToken.bind(bLendingTokenAddress);
    const borrowRatePerBlock = bLendingToken.borrowRatePerBlock().toBigDecimal().div(exponentToBigDecimal(SCALE_DECIMALS));
    const borrowRatePerDay = borrowRatePerBlock.times(BigDecimal.fromString(BLOCKS_PER_DAY.toString()));
    const borrowingAPY = pow(borrowRatePerDay.plus(BigDecimal.fromString("1")), DAY_PER_YEAR)
        .minus(BigDecimal.fromString("1"))
        .times(BigDecimal.fromString("100"));
    
    return borrowingAPY;
}

function getLenderAggregateCapitalDepositedPerLendingToken(primaryIndexToken: PrimaryIndexToken, lendingTokenAddress: Address): BigDecimal {
    const bLendingTokenAddress = primaryIndexToken.lendingTokenInfo(lendingTokenAddress).getBLendingToken();
    const bLendingToken = BLendingToken.bind(bLendingTokenAddress);
    const totalSupply = bLendingToken.totalSupply();
    const exchangeRateStored = bLendingToken.exchangeRateStored();
    const totalSupplyLendingToken = totalSupply.times(exchangeRateStored);

    const usdOraclePrice = getUsdOraclePrice(primaryIndexToken, lendingTokenAddress, totalSupplyLendingToken)
        .div(exponentToBigDecimal(SCALE_DECIMALS));

    return usdOraclePrice;
}