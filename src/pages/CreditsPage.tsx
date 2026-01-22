import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCredits } from '../hooks/useCredits';
import { PurchaseCreditsModal } from '../components/ui/PurchaseCreditsModal';

export function CreditsPage() {
    const navigate = useNavigate();
    const { state } = useApp();
    const {
        balance,
        isLoading,
        transactions,
        packages,
        costs,
        fetchHistory,
        initiatePurchase
    } = useCredits();
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Credits & Billing</h1>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark hidden md:block">Manage your credits and view transaction history</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
                {/* Balance Card */}
                <section className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-blue-100 font-medium mb-2">Available Balance</p>
                        <div className="flex items-baseline gap-2 mb-8">
                            <h2 className="text-5xl font-bold">{isLoading ? '...' : balance}</h2>
                            <span className="text-xl opacity-80">credits</span>
                        </div>

                        <button
                            onClick={() => setShowPurchaseModal(true)}
                            className="bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            Top Up Credits
                        </button>
                    </div>
                </section>

                {/* Features Cost Info */}
                <section>
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Feature Costs</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined">auto_awesome</span>
                            </div>
                            <div>
                                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">AI Insights</p>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{costs?.health_insight ?? 1} Credit / analysis</p>
                            </div>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                <span className="material-symbols-outlined">summarize</span>
                            </div>
                            <div>
                                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Doctor Brief</p>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{costs?.doctor_brief ?? 5} Credits / export</p>
                            </div>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                <span className="material-symbols-outlined">emergency_share</span>
                            </div>
                            <div>
                                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Emergency Alerts</p>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Free (Standard)</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Transaction History */}
                <section>
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Transaction History</h3>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        {transactions.length > 0 ? (
                            transactions.map((tx, i) => (
                                <div key={tx.id} className={`p-4 flex items-center justify-between ${i !== transactions.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'purchase' || tx.type === 'signup' || tx.type === 'referral'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                            }`}>
                                            <span className="material-symbols-outlined">
                                                {tx.type === 'purchase' || tx.type === 'signup' || tx.type === 'referral' ? 'add' : 'remove'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary-light dark:text-text-primary-dark">{tx.description}</p>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'purchase' || tx.type === 'signup' || tx.type === 'referral' ? 'text-green-600' : 'text-text-primary-light dark:text-text-primary-dark'
                                        }`}>
                                        {tx.type === 'purchase' || tx.type === 'signup' || tx.type === 'referral' ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                                No transactions yet
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <PurchaseCreditsModal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                packages={packages}
                currentBalance={balance}
                onPurchase={initiatePurchase}
                isLoading={isLoading}
            />
        </div>
    );
}
