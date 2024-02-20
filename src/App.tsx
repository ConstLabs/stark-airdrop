import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import abi from 'abi.json';
import useSWR from "swr";

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
  const [count, setCount] = useState(0);
    const addr = '0x05c755ba1828c70314349ec4c4ddaf310e648d5773f9bb6c4eb6ce2369288569';

  const {data: current} = useSWR('starknet', () => fetchData(addr));

  console.log(current);

  if(current) {
      const amount = BigInt(current.amount) * (10n ** 18n);
      const arr = [addr, amount.toString(), 0, current.merkle_index, current.merkle_path_len, ...current.merkle_path];
      console.log(arr, arr.join(','))
  }



  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
