import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTrigger} from "@/components/ui/dialog.tsx";

export default function DisconnectModal({address, onDisconnect}: {address: string; onDisconnect: () => void}) {

    const addressShort = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : null;

    return (
        <div className="justify-end">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">{addressShort}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>Disconnect Wallet</DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => onDisconnect()}>Disconnect</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}