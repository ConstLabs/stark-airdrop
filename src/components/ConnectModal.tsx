import {Connector, useConnect} from "@starknet-react/core";
import {
    Dialog,
    DialogContent,
    DialogHeader, DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Button, ButtonProps} from "@/components/ui/button";
import {callSnap} from "@/lib/snap.ts";
import toast from "react-hot-toast";


export default function ConnectModal({setSnapAccount, ...props}: ButtonProps & { setSnapAccount: (account: any) => void}) {
    const { connect, connectors } = useConnect();

    async function getDeployedAccContracts() {
        const account = await callSnap('starkNet_getStoredUserAccounts', {});
        if(account?.length) {
            setSnapAccount(account[0]);
        } else {
            toast.error("No account found");
        }
    }

    const connectSnap = async() => {
        await window.ethereum.request({
            method: 'wallet_requestSnaps',
            params: {
                ["npm:@consensys/starknet-snap"]: { version: "2.4.0"}, //Snap's version
            },
        });

        await getDeployedAccContracts();
    }

    return (
        <div className="flex justify-end">
            <Dialog>
                <DialogTrigger asChild>
                    <Button {...props}>Connect Wallet</Button>
                </DialogTrigger>
                <DialogContent className={'w-[400px]'}>
                    <DialogHeader>
                        <DialogTitle>Connect Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        {connectors.map((connector: Connector) => (
                            <Button
                                key={connector.id}
                                onClick={() => connect({ connector })}
                                disabled={!connector.available()}
                            >
                                Connect {connector.name}
                            </Button>
                        ))}
                        <Button onClick={connectSnap}>Starknet snap</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}