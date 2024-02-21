import {shortString} from "starknet";

export const snapId = 'npm:@consensys/starknet-snap';

function getReqFlagsFromCheckbox() {
    return {
        isDev: true,
        debugLevel: 'all',
    };
}

export async function callSnap(method: string, params: any) {
    try {
        const chainId = shortString.encodeShortString('SN_MAIN');
        //0x534e5f474f45524c42
        console.log(shortString.encodeShortString('SN_MAIN'))
        console.log(params)
        const response = await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: {
                snapId,
                request: {
                    method: method,
                    params: {
                        chainId,
                        ...getReqFlagsFromCheckbox(),
                        ...params,
                    },
                },
            },
        });
        console.log(`${method} response:`, response);
        return response;
    } catch (err: any) {
        console.error(`${method} problem happened:`, err);
        alert(`${method} problem happened: ${err.message || err}`);
    }
}