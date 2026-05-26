// src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import { clsx } from 'clsx';
import ConnectWallet from '../../components/wallet/ConnectWallet';

const navLinks = [
    { label: 'Notarize', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Verify', href: '/verify' },
];

export default function Navbar() {
    const location = useLocation();

    return (
        <nav className="border-b border-gray-800 bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-4xl items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-white">
                    <FileCheck className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold tracking-tight">Notary</span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={clsx(
                                'text-sm transition-colors hover:text-white',
                                location.pathname === link.href
                                    ? 'text-white font-medium'
                                    : 'text-gray-400'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Wallet */}
                <ConnectWallet />

            </div>
        </nav>
    );
}