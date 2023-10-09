import { Address, BigInt } from "@graphprotocol/graph-ts";

import { PrimaryLendingPlatformV3 } from "../../generated/PrimaryLendingPlatformV3/PrimaryLendingPlatformV3";

export function getPrjTokensList(primaryLendingPlatformV3: PrimaryLendingPlatformV3): Array<Address> {
    const projectTokensLength = primaryLendingPlatformV3.projectTokensLength();
    const projectTokens = new Array<Address>();

    for (let i = 0; i < projectTokensLength.toI32(); i++) {
        const projectTokenAddress = primaryLendingPlatformV3.projectTokens(BigInt.fromI32(i));
        projectTokens.push(projectTokenAddress);
    }

    return projectTokens;
}

export function getLendingTokensList(primaryLendingPlatformV3: PrimaryLendingPlatformV3): Array<Address> {
    const lendingTokensLength = primaryLendingPlatformV3.lendingTokensLength();
    const lendingTokens = new Array<Address>();

    for (let i = 0; i < lendingTokensLength.toI32(); i++) {
        const lendingTokenAddress = primaryLendingPlatformV3.lendingTokens(BigInt.fromI32(i));
        lendingTokens.push(lendingTokenAddress);
    }

    return lendingTokens;
}
