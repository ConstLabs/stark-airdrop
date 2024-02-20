import {Connector, useConnect} from "@starknet-react/core";
import {
    Dialog,
    DialogContent,
    DialogHeader, DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Button, ButtonProps} from "@/components/ui/button";


export default function ConnectModal(props: ButtonProps) {
    const { connect, connectors } = useConnect();

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
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}