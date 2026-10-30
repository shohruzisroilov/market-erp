'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { ProductsView } from '@/components/ProductsView';
import { WarehousesView } from '@/components/WarehousesView';
import { PurchasesView } from '@/components/PurchasesView';
import { SalesView } from '@/components/SalesView';
import { InventoryView } from '@/components/InventoryView';
import { CashboxView } from '@/components/CashboxView';
import { ReportsView } from '@/components/ReportsView';
import { ToastProvider } from '@/components/Toast';
import { api } from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [totalCashBalance, setTotalCashBalance] = useState(0);
  const [quickExpenseTrigger, setQuickExpenseTrigger] = useState(false);

  useEffect(() => {
    refreshCashBalance();
  }, []);

  const refreshCashBalance = async () => {
    try {
      const data = await api.getCashRegisters();
      setTotalCashBalance(data.totalBalance);
    } catch (e) {
      console.error('Kassa balansini yuklashda xatolik:', e);
    }
  };

  const handleOpenQuickSale = () => {
    setActiveTab('sales');
  };

  const handleOpenQuickPurchase = () => {
    setActiveTab('purchases');
  };

  const handleOpenQuickExpense = () => {
    setActiveTab('cashbox');
    setQuickExpenseTrigger((prev) => !prev);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600/10 selection:text-blue-600">
        {/* Yuqori & Mobil Pastki Navigatsiya */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cashBalance={totalCashBalance}
          onOpenQuickSale={handleOpenQuickSale}
          onOpenQuickPurchase={handleOpenQuickPurchase}
          onOpenQuickExpense={handleOpenQuickExpense}
        />

        {/* Asosiy Kontent Maydoni */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenQuickSale={handleOpenQuickSale}
              onOpenQuickExpense={handleOpenQuickExpense}
            />
          )}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'warehouses' && <WarehousesView />}
          {activeTab === 'purchases' && (
            <PurchasesView onRefreshGlobal={refreshCashBalance} />
          )}
          {activeTab === 'sales' && (
            <SalesView onRefreshGlobal={refreshCashBalance} />
          )}
          {activeTab === 'inventory' && (
            <InventoryView onRefreshGlobal={refreshCashBalance} />
          )}
          {activeTab === 'cashbox' && (
            <CashboxView
              onRefreshGlobal={refreshCashBalance}
              quickExpenseTrigger={quickExpenseTrigger}
            />
          )}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>
    </ToastProvider>
  );
}
