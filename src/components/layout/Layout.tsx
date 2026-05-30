// src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { NotaryAgent } from '../agent/NotaryAgent';

export default function Layout() {
    const account = useCurrentAccount();

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Agent floats on all pages when wallet is connected */}
            {account && (
                <NotaryAgent
                    address={account.address}
                    documents={[]} // base level — Dashboard overrides this
                />
            )}
        </div>
    );
}