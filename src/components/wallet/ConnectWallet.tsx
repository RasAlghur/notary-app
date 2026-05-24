import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { LogOut } from "lucide-react";

function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectWallet() {
    const account = useCurrentAccount();
    const dAppKit = useDAppKit();

    if (!account) {
        return <ConnectButton />;
    }

    return (
        <div className="flex items-center gap-3">
            <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5">
                <span className="font-mono text-sm text-gray-300">
                    {shortenAddress(account.address)}
                </span>
            </div>

            <button
                onClick={() => dAppKit.disconnectWallet()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-red-800 hover:text-red-400"
            >
                <LogOut className="h-3.5 w-3.5" />
                Disconnect
            </button>
        </div>
    );
}