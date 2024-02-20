import { useState } from 'react'
import logo from '/img.png'
import './App.css'
import abi from './abi.json';
import useSWR from "swr";
import {SectionCard} from "@/components/SectionCard.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import ConnectModal from "@/components/ConnectModal.tsx";
import {useAccount, useContract, useProvider} from "@starknet-react/core";
import DisconnectModal from "@/components/DisconnectModal.tsx";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = '0x06793d9e6ed7182978454c79270e5b14d2655204ba6565ce9b0aa8a3c3121025';

const urls = new Array(10).fill(0).map((_, i) => {
    return `https://raw.githubusercontent.com/starknet-io/provisions-data/main/starknet/starknet-${i+1}.json`;
});

const url = 'https://raw.githubusercontent.com/starknet-io/provisions-data/main/starknet/starknet-8.json';

const fetchData = async (addr: string) => {
    let current = null;

    for (const url of urls) {
        const response = await fetch(url);
        const data = await response.json();

        current = data?.eligibles?.find(it => it.identity === addr);
        if (current) break;
    }

    return current;
}
function App() {
    const {address: userAddress, account} = useAccount();
  const [count, setCount] = useState(0);
  const [address, setAddress] = useState('');
    const {provider} = useProvider();

    const { contract } = useContract({
        abi: abi,
        address: CONTRACT_ADDRESS,
        provider: provider,
    });

    if(account) {
        contract?.connect(account!)
    }
  const addr = '0x05c755ba1828c70314349ec4c4ddaf310e648d5773f9bb6c4eb6ce2369288569';

  const {data: current, isLoading} = useSWR(address ? ['starknet', address] : null, () => fetchData(address));

  const [loading, setLoading] = useState(false);

  console.log(current);

    const waitForTransaction = async (hash: any) => {
        toast.success("Transaction has been submitted");

        const recipient = await provider.waitForTransaction(hash);

        if ((recipient as any)?.execution_status === "SUCCEEDED") {
            toast.success("Transaction has been confirmed");
        } else {
            toast.error("Transaction has failed");
        }
    }

    const handleClaim = async () => {
        if(current) {
            setLoading(true);
            const amount = BigInt(current.amount) * (10n ** 18n);
            const arr = [addr, amount.toString(), 0, current.merkle_index, current.merkle_path_len, ...current.merkle_path];
            console.log(arr, arr.join(','))
            const claimData = arr.join(',');
            const call = contract?.populate("claim", [claimData]);
            console.log(call)
            const res = await contract?.claim(call?.calldata);
            await waitForTransaction(res?.transaction_hash);
            setLoading(false);
        } else {
            toast('No data found', {icon: '🤔'})
        }
    }



  return (
    <>
      <div className={'container flex justify-between items-center'}>
        <a href="https://vitejs.dev" target="_blank">
          <img src={logo} className="logo" alt="Vite logo" />
        </a>
          {userAddress ? <DisconnectModal/> : <ConnectModal/>}
      </div>
        {/*<h1 className={'font-bold text-lg py-4'}>Starknet Airdrop</h1>*/}
       <div className="p-8">
           <SectionCard title={'Starknet Airdrop'}>
               <Input placeholder={'Address'} value={address} onChange={e => setAddress(e.target.value)}/>
               <div className="p-2">
                   {
                       JSON.stringify(current, null, 2)
                   }
               </div>
               <Button loading={isLoading} onClick={handleClaim} disabled={!current}>Claim</Button>
           </SectionCard>
       </div>
    </>
  )
}

export default App
