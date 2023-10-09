import { Address, BigDecimal, store } from "@graphprotocol/graph-ts";

import { UniswapV2Pair } from "../generated/PrimaryLendingPlatformModerator/UniswapV2Pair";
import { ERC20 } from "../generated/PrimaryLendingPlatformV3/ERC20";
import { ERC20Token } from "../generated/schema";

import { IToken } from "./interface/token.interface";

export function handleAddNewUnderlyingTokens(tokenAddress: Address, isAddNew: boolean): Array<string> {
    const underlyingTokensList = new Array<string>();
    const lpToken = UniswapV2Pair.bind(tokenAddress);
    const existedLPToken = lpToken.try_token0();

    if (!existedLPToken.reverted) {
        const token0Address = existedLPToken.value;
        const token1Address = lpToken.token1();
        increaseUnderlyingToken(token0Address, isAddNew);
        increaseUnderlyingToken(token1Address, isAddNew);
        underlyingTokensList.push(token0Address.toHex());
        underlyingTokensList.push(token1Address.toHex());
    }
    return underlyingTokensList;
}

export function increaseUnderlyingToken(tokenAddress: Address, isAddNew: boolean): void {
    const token0 = ERC20.bind(tokenAddress);
    let entity = ERC20Token.load(tokenAddress.toHex());
    if (!entity) {
        entity = new ERC20Token(tokenAddress.toHex());
        entity.name = token0.name();
        entity.symbol = token0.symbol();
        entity.address = tokenAddress;
    }
    if (isAddNew) {
        const numberOfLinks = entity.linksNumber;
        entity.linksNumber = numberOfLinks
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
