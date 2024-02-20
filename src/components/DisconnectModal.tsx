import { useAccount, useDisconnect } from "@starknet-react/core";
import { Button } from "@/components/ui/button";
import {useCopyToClipboard} from "react-use";
import {useEffect} from "react";
import toast from "react-hot-toast";
import {ChevronDown, Copy, Unlink, User} from "lucide-react";
import {DropMenus} from "@/components/DropMenu.tsx";
import {useNavigate} from "react-router-dom";
import {shortenAddress} from "@/utils/common.ts";

export default function DisconnectModal() {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const [state, copyToClipboard] = useCopyToClipboard();
    const navigate = useNavigate();

    const addressShort = shortenAddress(address);

    useEffect(() => {
        if(state.value) {
            toast.success(`Copied ${state.value}`);
        }
        if(state.error) {
            toast.error(`Unable to copy value, ${state.error.message}`);
        }
    }, [state]);

    return (
        <div className="justify-end">
            <DropMenus trigger={
                <Button variant="outline">
                    {addressShort}
                    <ChevronDown size={16} className={'ml-2 opacity-50'} />
                </Button>
            } items={[
                {
                    label: (
                        <div className={'flex items-center gap-2 cursor-pointer'}>
                            <User size={16} />
                            <span>
                                Assets
                            </span>
                        </div>
                    ),
                    value: 'assets',
                    onClick: () => navigate('/user')
                },
                {
                    label: (
                        <div className={'flex items-center gap-2 cursor-pointer'}>
                            <Copy size={16} />
                            <span>
                                Copy Address
                            </span>
                        </div>
                    ),
                    value: 'copy',
                    onClick: () => copyToClipboard(address!)
                },
                {
                    label: (
                        <div className={'flex items-center gap-2 cursor-pointer'}>
                            <Unlink size={16} />
                            <span>
                                Disconnect
                            </span>
                        </div>
                    ),
                    value: 'disconnect',
                    onClick: () => disconnect()
                }
            ]}/>
        </div>
    );
}