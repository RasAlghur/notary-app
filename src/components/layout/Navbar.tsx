// src/components/layout/Navbar.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileCheck, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import ConnectWallet from '../../components/wallet/ConnectWallet';
import { navLinks } from '../../config/nav';

export default function Navbar() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const account = useCurrentAccount();
    
    return (
        <nav className="border-b border-gray-800 bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-white">
                        <FileCheck className="h-5 w-5 text-blue-400" />
                        {/* Show text on desktop always; on mobile only when wallet is NOT connected */}
                        <span className={clsx(
                            'font-semibold tracking-tight',
                            account ? 'hidden sm:inline' : 'inline'
                        )}>
                            Notary
                        </span>
                    </Link>

                    {/* Nav Links — desktop */}
                    <div className="hidden items-center gap-6 sm:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={clsx(
                                    'text-sm transition-colors hover:text-white',
                                    location.pathname === link.href
                                        ? 'font-medium text-white'
                                        : 'text-gray-400'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <ConnectWallet />

                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white sm:hidden"
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                </div>

                {/* Dropdown — mobile only */}
                {menuOpen && (
                    <div className="mt-3 flex flex-col gap-1 border-t border-gray-800 pt-3 sm:hidden">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={clsx(
                                    'rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-800 hover:text-white',
                                    location.pathname === link.href
                                        ? 'bg-gray-800 font-medium text-white'
                                        : 'text-gray-400'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}