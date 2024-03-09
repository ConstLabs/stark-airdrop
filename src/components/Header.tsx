import logo from '/img.png';
import DisconnectModal from "@/components/DisconnectModal.tsx";
import ConnectModal from "@/components/ConnectModal.tsx";
import {useAccount, useDisconnect} from "@starknet-react/core";
import {useSnapAccountStore} from "@/stores/useSnapAccount.tsx";


export const Header = () => {
    const { address: userAddress } = useAccount();
    const { disconnect } = useDisconnect();
    const { account: snapAccount, setAccount: setSnapAccount} = useSnapAccountStore();
    return (
        <header className={'flex justify-between items-center p-5'}>
            <a href="https://provisions.starknet.io/" target="_blank" className={'flex items-center gap-2'}>
                <img src={logo} className="logo w-8 h-8" alt="logo"/>
                <div>
                    StarkNet Airdrop
                </div>
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
                <ConnectModal setSnapAccount={setSnapAccount}/>
            )}
        </header>
    )
}