import { useState } from 'react';
import logo from '/img.png';
import './App.css';
import abi from './abi.json';
import { SectionCard } from '@/components/SectionCard.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import ConnectModal from '@/components/ConnectModal.tsx';
import { useAccount, useContract, useDisconnect, useNetwork, useProvider } from '@starknet-react/core';
import DisconnectModal from '@/components/DisconnectModal.tsx';
import toast from 'react-hot-toast';
import { callSnap } from '@/lib/snap.ts';

const CONTRACT_ADDRESS = '0x06793d9e6ed7182978454c79270e5b14d2655204ba6565ce9b0aa8a3c3121025';

// const urls = new Array(10).fill(0).map((_, i) => {
//     return `https://raw.githubusercontent.com/starknet-io/provisions-data/main/starknet/starknet-${i + 1}.json`;
// });
//
// const cache = {} as any;
//
// const fetchData = async (addr: string) => {
//     let current = null;
//
//     for (const [index, url] of urls.entries()) {
//         toast(`🔍 Fetching page ${index + 1} data....`)
//
//         let data;
//         if (cache[url]) {
//             data = cache[url];
//         } else {
//             const response = await fetch(url);
//             data = await response.json();
//             // 将数据存入缓存
//             cache[url] = data;
//         }
//         console.log(data)
//
//         current = data?.eligibles?.find((it: any) => it.identity.toLowerCase() === addr.toLowerCase());
//         if (current) break;
//     }
//
//     if (current) {
//         toast.success("Data has been found");
//     } else {
//         toast.error("No data found");
//     }
//
//     return current;
// }

const getSQL = (address: string) => {
  const sql = `SELECT 
    e.identity, 
    e.amount, 
    e.merkle_index, 
    c.contract_address, 
    c.contract_type,
    GROUP_CONCAT(mp.path) AS merkle_path
FROM eligibles e
JOIN contracts c ON e.contract_id = c.id
LEFT JOIN merkle_paths mp ON e.id = mp.eligible_id
WHERE e.identity = '${address}'
GROUP BY e.identity, e.amount, e.merkle_index, c.contract_address, c.contract_type;`;
  return window.btoa(sql);
};

const fetchData = async (address: string) => {
  const sql = getSQL(address);
  const apiKey = 'myqe4hMZUQV_ceKF7Ep118MKbTJ84f8TXkut6b0Zw6fiuOjdG8pnlQ';
  const dbOwner = 'cryptonerdcn';
  const dbName = 'contracts.db';

  const formData = new FormData();
  formData.append('apikey', apiKey);
  formData.append('dbowner', dbOwner);
  formData.append('dbname', dbName);
  formData.append('sql', sql);

  const response = await fetch('https://api.dbhub.io/v1/query', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  console.log(data);
  if (data?.length) {
    const current = data[0].reduce((acc: any, item: any) => {
      acc[item.Name] = item.Value;
      return acc;
    }, {});
    current.merkle_path = current.merkle_path.split(',');
    console.log(current);
    return current;
  } else {
    toast('No data found', { icon: '🤔' });
    console.error('Error fetching data:', response.statusText);
  }
};

function App() {
  const { address: userAddress, account } = useAccount();
  const network = useNetwork();
  console.log(network);
  const [address, setAddress] = useState('');
  const { provider } = useProvider();

  const { contract } = useContract({
    abi: abi,
    address: CONTRACT_ADDRESS,
    provider: provider
  });

  const [snapAccount, setSnapAccount] = useState<any>();
  const { disconnect } = useDisconnect();

  if (account) {
    contract?.connect(account!);
  }

  const [current, setCurrent] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setCurrent(undefined);
    setIsLoading(true);
    const current = await fetchData(address);
    setCurrent(current);
    setIsLoading(false);
  };

  console.log(current);

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
      toast.error('Please connect wallet first');
      return;
    }
    if (current) {
      setLoading(true);
      const call = contract?.populate('claim', [
        {
          identity: current.identity,
          balance: current.amount,
          index: current.merkle_index,
          merkle_path: current.merkle_path
        }
      ]);
      console.log(call);
      const res = await contract?.claim(call?.calldata);
      await waitForTransaction(res?.transaction_hash);
      setLoading(false);
    } else {
      toast('No data found', { icon: '🤔' });
    }
  };

  async function sendTransaction() {
    if (!snapAccount) {
      toast.error('No snap account found');
      return;
    }
    const amount = BigInt(current.amount) * 10n ** 18n;
    const arr = [
      current.identity,
      amount.toString(),
      0,
      current.merkle_index,
      current.merkle_path_len,
      ...current.merkle_path
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
    <div className={'container'}>
      <div className={'flex justify-between items-center p-5'}>
        <a href="https://provisions.starknet.io/" target="_blank">
          <img src={logo} className="logo w-8 h-8" alt="logo" />
        </a>
        {userAddress || snapAccount ? (
          <DisconnectModal
            address={snapAccount?.address || userAddress}
            onDisconnect={() => {
              if (snapAccount) {
                setSnapAccount(null);
              } else {
                disconnect();
              }
            }}
          />
        ) : (
          <ConnectModal setSnapAccount={setSnapAccount} />
        )}
      </div>
      {/*<h1 className={'font-bold text-lg py-4'}>Starknet Airdrop</h1>*/}
      <div className="p-8">
        <SectionCard title={'Starknet Airdrop Claim'}>
          <div className="flex items-center gap-4">
            <Input placeholder={'Address'} value={address} onChange={(e) => setAddress(e.target.value)} />
            <Button onClick={handleSearch} disabled={!address}>
              Search Claim Data
            </Button>
          </div>
          <div className="p-2">{JSON.stringify(current, null, 2)}</div>
          <Button
            loading={isLoading || loading}
            onClick={() => {
              if (snapAccount) {
                sendTransaction();
              } else {
                handleClaim();
              }
            }}
            disabled={!current}
          >
            Claim
          </Button>
        </SectionCard>
      </div>
      <div className="p-12">
        <p>This is a simple website of claim airdrop using Metamask Starknet Snaps. Also supports ArgentX and Braavos.</p>
        <br/>
        <p>For ArgentX and Braavos users: If you prefer not to claim directly from this site, you can instead retrieve the data needed for claiming and learn how to use it <em><a href='https://github.com/starknet-io/provisions-data?tab=readme-ov-file#starknet-eligibles'>here</a></em> .</p>
        <br/>
        <em><a
          href="https://github.com/YanYuanFE/stark-airdrop
"
          target="_blank"
        >
          Github: https://github.com/YanYuanFE/stark-airdrop
        </a>
        </em>
        <br/>
        <br/>
        By <em><a href='https://twitter.com/yanyuan888'>YanYuanFE</a></em> and <em><a href='https://twitter.com/cryptonerdcn'>Cryptonerdcn</a></em>
        <br/>
      </div>
    </div>
  );
}

export default App;
