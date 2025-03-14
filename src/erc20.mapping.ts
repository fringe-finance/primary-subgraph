import { Address, BigDecimal, store } from "@graphprotocol/graph-ts";

import { UniswapV2Pair } from "../generated/PrimaryLendingPlatformModerator/UniswapV2Pair";
import { ERC20 } from "../generated/PrimaryLendingPlatformV3/ERC20";
import { ERC20Token } from "../generated/schema";
import { ERC4626 } from "../generated/PrimaryLendingPlatformModerator/ERC4626";
import { SpecialERC20 } from "../generated/PrimaryLendingPlatformModerator/SpecialERC20";

import { IToken } from "./interface/token.interface";

export function handleAddNewUnderlyingTokens(tokenAddress: Address, isAddNew: boolean): Array<string> {
    let underlyingTokensList = new Array<string>();
    {
        const token = UniswapV2Pair.bind(tokenAddress);
        const existedUnderlyingToken = token.try_token0();

        if (!existedUnderlyingToken.reverted) {
            const token0Address = existedUnderlyingToken.value;
            const token1Address = token.token1();
            increaseUnderlyingToken(token0Address, isAddNew);
            increaseUnderlyingToken(token1Address, isAddNew);
            underlyingTokensList.push(token0Address.toHex());
            underlyingTokensList.push(token1Address.toHex());
        }
    }
    {
        const token = ERC4626.bind(tokenAddress);
        const existedUnderlyingToken = token.try_asset();

        if (!existedUnderlyingToken.reverted) {
            const underlyingTokenAddress = existedUnderlyingToken.value;
            increaseUnderlyingToken(underlyingTokenAddress, isAddNew);
            underlyingTokensList.push(underlyingTokenAddress.toHex());
        }
    }
    return underlyingTokensList;
}

export function increaseUnderlyingToken(tokenAddress: Address, isAddNew: boolean): void {
    const token = ERC20.bind(tokenAddress);
    let entity = ERC20Token.load(tokenAddress.toHex());
    if (entity == null) {
        entity = new ERC20Token(tokenAddress.toHex());
        const name = token.try_name();
        if (name.reverted) {
            const token = SpecialERC20.bind(tokenAddress);
            entity.name = token.name().toString();
            entity.symbol = token.symbol().toString();
            entity.decimals = token.decimals().toI32();
        } else {
            entity.name = name.value;
            entity.symbol = token.symbol();
            entity.decimals = token.decimals();
        }
        entity.address = tokenAddress;
    }
    if (isAddNew) {
        let numberOfLinks = entity.linksNumber;
        entity.linksNumber =
            numberOfLinks !== null
                ? numberOfLinks.plus(BigDecimal.fromString("1"))
                : BigDecimal.fromString("1");
    }
    entity.save();
}

export function decreaseUnderlyingToken<T extends IToken>(entity: T): void {
    const underlyingTokens = entity.underlyingTokens;
    if (underlyingTokens) {
        for (let i = 0; i < underlyingTokens.length; i++) {
            const erc20TokenEntity = ERC20Token.load(underlyingTokens[i]);
            if (erc20TokenEntity) {
                const numberOfLinks = erc20TokenEntity.linksNumber;
                if (numberOfLinks) {
                    if (numberOfLinks.gt(BigDecimal.fromString("1"))) {
                        erc20TokenEntity.linksNumber = numberOfLinks.minus(BigDecimal.fromString("1"));
                        erc20TokenEntity.save();
                    } else {
                        store.remove("ERC20Token", underlyingTokens[i]);
                    }
                }
            }
        }
    }
}
