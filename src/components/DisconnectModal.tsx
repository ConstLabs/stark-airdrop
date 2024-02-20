import { useAccount, useDisconnect } from "@starknet-react/core";
import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTrigger} from "@/components/ui/dialog.tsx";
// import {DropMenus} from "@/components/DropMenu.tsx";
// import {useNavigate} from "react-router-dom";
// import {shortenAddress} from "@/utils/common.ts";

export default function DisconnectModal() {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const addressShort = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : null;

    return (
        <div className="justify-end">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost">{addressShort}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>Disconnect Wallet</DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => disconnect()}>Disconnect</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}