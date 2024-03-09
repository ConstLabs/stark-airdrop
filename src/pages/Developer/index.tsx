import abi from './abi.json';
import {useAccount, useContract, useProvider} from "@starknet-react/core";
import {useSnapAccountStore} from "@/stores/useSnapAccount.tsx";
import treeJSON from './treeTestPoseidon.json';
import {num} from "starknet";
import {Button} from "@/components/ui/button.tsx";
import toast from "react-hot-toast";
import {useState} from "react";
import * as Merkle from "starknet-merkle-tree";
import {SectionCard} from "@/components/SectionCard.tsx";
import {callSnap} from "@/lib/snap.ts";
import {Input} from "@/components/ui/input.tsx";
import {shortenAddress} from "@/lib/utils.ts";

const CONTRACT_ADDRESS = '0x057d6914b57d0881b786cdafe5123e4eaff96e70c740e957fd4e698707ff50ff';


export default function DeveloperAirdrop () {
    const { address: userAddress, account } = useAccount();
    const [inputAddress, setInputAddress] = useState('');
    const { account: snapAccount, } = useSnapAccountStore();
    const { provider } = useProvider();
    const [loading, setLoading] = useState(false);

    const { contract } = useContract({
        abi: abi,
        address: CONTRACT_ADDRESS,
        provider: provider
    });

    const tree = Merkle.StarknetMerkleTree.load(treeJSON as any);

    if (account) {
        contract?.connect(account!);
    }

    const claimAddress = inputAddress || userAddress;

    const data = treeJSON.values.find(it => {
        return it.value[0].toLowerCase() === claimAddress?.toLowerCase();
    });

    console.log(data);

    const displayAmount = data ? (BigInt(num.hexToDecimalString(data.value[1])) / (10n ** 18n)).toString() : undefined;

    const waitForTransaction = async (hash: any) => {
        toast.success('Transaction has been submitted');

        const recipient = await provider.waitForTransaction(hash);

        if ((recipient as any)?.execution_status === 'SUCCEEDED') {
            toast.success('Transaction has been confirmed');
        } else {
            toast.error('Transaction has failed');
        }
    };

    const handleClaim = async () => {
        if (!account) {
            console.log('Please connect wallet first');
            return;
        }
        console.log('Claiming');
        if (data) {
            setLoading(true);
            console.log([
                data.value[0],
                num.hexToDecimalString(data.value[1]),
                tree.getProof(data.value)
            ])
            const call = contract?.populate('claim', [
                data.value[0],
                num.hexToDecimalString(data.value[1]),
                tree.getProof(data.value)
            ]);
            console.log(call);
            const res = await contract?.claim(call?.calldata);
            const result = await waitForTransaction(res?.transaction_hash);
            console.log(result);
            setLoading(false);
        } else {
            toast('No data found', {icon: '🤔'});
        }
    }

    async function sendTransaction() {
        if (!snapAccount) {
            toast.error('No snap account found');
            return;
        }
        if(!data) {
            toast.error('No data found');
            return;
        }
        const arr = [
            data.value[0],
            num.hexToDecimalString(data.value[1]),
            tree.getProof(data.value)
        ];
        console.log(arr, arr.join(','));

        const contractAddress = CONTRACT_ADDRESS;
        const contractFuncName = 'claim';
        const contractCallData = arr.join(',');
        const senderAddress = snapAccount.address;

        const res = await callSnap('starkNet_sendTransaction', {
            contractAddress,
            contractFuncName,
            contractCallData,
            senderAddress
        });
        console.log(res);
        toast.success(`Transaction has been submitted, hash: ${res.transaction_hash}`);
    }

    return (
        <div className={'container pt-10'}>
            <SectionCard title={'Developer Airdrop Claim'} className={'w-full md:w-1/2 m-auto'}>
                {/*<div className="p-2">{JSON.stringify(current, null, 2)}</div>*/}
                <div className={'py-10'}>
                    <div className={'text-center space-y-2'}>
                        {
                            data ? (
                                <>
                                    <div>
                                        {shortenAddress(claimAddress!)}
                                    </div>
                                    <div
                                        className={'font-semibold md:font-medium text-foreground text-center'}>Available
                                        to Claim
                                    </div>
                                    <div
                                        className={'mt-6 font-bold text-lg flex items-center gap-1 w-full justify-center'}>
                                        {displayAmount}
                                        <span className={'text-gray-500'}>STRK</span>
                                    </div>
                                </>
                            ) : <div className={'space-y-2'}>
                                <div>
                                    You aren’t eligible
                                </div>
                                <div className="flex items-center gap-4">
                                    <Input placeholder={'Input other address check'} value={inputAddress} onChange={(e) => setInputAddress(e.target.value)} />
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <Button
                    className={'w-full'}
                    loading={loading}
                    onClick={() => {
                        if (snapAccount) {
                            sendTransaction();
                        } else {
                            handleClaim();
                        }
                    }}
                    disabled={!data}
                >
                    Claim
                </Button>
            </SectionCard>
        </div>
    )
}