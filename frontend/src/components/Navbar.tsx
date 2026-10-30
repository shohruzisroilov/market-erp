'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wine,
  Warehouse,
  ShoppingBag,
  ShoppingCart,
  ClipboardCheck,
  Wallet,
  BarChart3,
  Plus,
  Truck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { formatMoney } from '@/lib/utils';

export type TabType =
  | 'dashboard'
  | 'products'
  | 'warehouses'
  | 'purchases'
  | 'sales'
  | 'inventory'
  | 'cashbox'
  | 'reports';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cashBalance: number;
  onOpenQuickSale: () => void;
  onOpenQuickPurchase: () => void;
  onOpenQuickExpense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cashBalance,
  onOpenQuickSale,
  onOpenQuickPurchase,
  onOpenQuickExpense,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Boshqaruv & Foyda', icon: LayoutDashboard },
    { id: 'sales', label: 'Savdo (Sotuv)', icon: ShoppingCart },
    { id: 'purchases', label: 'Kirim (Xarid)', icon: ShoppingBag },
    { id: 'products', label: 'Ichimliklar & Qoldiq', icon: Wine },
    { id: 'cashbox', label: 'Kassa & Xarajatlar', icon: Wallet },
    { id: 'inventory', label: 'Qayta Sanash', icon: ClipboardCheck },
    { id: 'reports', label: 'Hisobotlar', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo va Do'kon Nomi */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Wine className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight block">
                  Ichimliklar ERP
                </span>
                <span className="text-[10px] text-slate-700 hidden sm:block font-medium">
                  Dona & Blok hisobi • Sof Foyda
                </span>
              </div>
            </div>

            {/* O'rta: Kassadagi Pul Badge */}
            <div
              onClick={() => setActiveTab('cashbox')}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-xl cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800 hidden sm:inline">
                Kassadagi Pul:
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-950">
                {formatMoney(cashBalance)}
              </span>
            </div>

            {/* O'ng tomon: Tezkor Amallar */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenQuickSale}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Yangi Sotuv</span>
              </button>

              <button
                onClick={onOpenQuickExpense}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span className="hidden sm:inline">Yo'l kira / Chiqim</span>
                <span className="sm:hidden">Chiqim</span>
              </button>

              {/* Mobilda Qo'shimcha Menyu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigatsiya (Toza & Minimalist) */}
          <nav className="hidden md:flex space-x-1 border-t border-slate-100 py-1.5 overflow-x-auto scrollbar-none">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-blue-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobil Ochiladigan Kengaytirilgan Menyu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 z-30 p-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobil Pastki Menyusi (Bottom Navigation Bar) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard', label: 'Foyda', icon: LayoutDashboard },
          { id: 'sales', label: 'Sotuv', icon: ShoppingCart },
          { id: 'purchases', label: 'Kirim', icon: ShoppingBag },
          { id: 'products', label: 'Ombor', icon: Wine },
          { id: 'cashbox', label: 'Kassa', icon: Wallet },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                isActive ? 'text-blue-600 scale-105' : 'text-slate-700 hover:text-slate-800'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${
                  isActive ? 'text-blue-600' : 'text-slate-700'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
