'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Truck,
  Wallet,
  Users,
  ChevronRight,
  Plus,
  ShoppingCart,
  ShoppingBag,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Wine,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
import { PnlReport } from '@/types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenQuickSale?: () => void;
  onOpenQuickExpense?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickSale,
  onOpenQuickExpense,
}) => {
  const [pnlData, setPnlData] = useState<PnlReport | null>(null);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [cashSummary, setCashSummary] = useState<any>(null);
  const [counterparties, setCounterparties] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [pnl, stock, cash, cp] = await Promise.all([
        api.getPnlReport(),
        api.getStockReport(),
        api.getCashRegisters(),
        api.getCounterparties(),
      ]);
      setPnlData(pnl);
      setStockSummary(stock.summary);
      setCashSummary(cash);
      setCounterparties(cp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const pnl = pnlData?.pnl;
  const isNetProfitPositive = (pnl?.netProfit || 0) >= 0;

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      {/* 1. HERO CARD: Cho'ntakka Qolgan Toza Sof Foyda & Tezkor Amallar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Orqa fon bezagi */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-800 text-emerald-400 border border-slate-700/80">
                Toza Foyda (P&L)
              </span>
              <span className="text-xs text-slate-400">
                Barcha tannarx va xarajatlar chegirilgandan so'ng
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <span
                className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight ${
                  isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatMoney(pnl?.netProfit)}
              </span>
              <span
                className={`text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-lg ${
                  isNetProfitPositive
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {pnl?.netMarginPercent?.toFixed(1)}% foydalilik
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Sotuv tushumi: <strong className="text-white font-mono">{formatMoney(pnl?.revenue)}</strong> •
              Ichimliklar kelish narxi: <strong className="text-slate-300 font-mono">-{formatMoney(pnl?.cogs)}</strong> •
              Xarajatlar: <strong className="text-amber-400 font-mono">-{formatMoney(pnl?.operatingExpenses?.total)}</strong>
            </p>
          </div>

          {/* Tezkor Tugmalar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => (onOpenQuickSale ? onOpenQuickSale() : onNavigate('sales'))}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm cursor-pointer transition-all"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              <span>Yangi Sotuv</span>
            </button>

            <button
              onClick={() =>
                onOpenQuickExpense ? onOpenQuickExpense() : onNavigate('cashbox')
              }
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/80 text-xs sm:text-sm font-semibold rounded-2xl cursor-pointer transition-all"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Yo'l kira / Chiqim</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. UCHTA ASOSIY DO'KON STATISTIKASI (Kassa, Ombor, Qarzlar) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Kassa */}
        <div
          onClick={() => onNavigate('cashbox')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kassadagi Pul
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-emerald-600">
              {formatMoney(cashSummary?.totalBalance)}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
              <span>Naqd va karta hisobi</span>
              <span className="text-blue-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Kassaga o'tish <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Ombor */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ombordagi Tovar
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900">
              {formatNumber(stockSummary?.overallTotalUnits)} dona
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
              <span>Qiymati: {formatMoney(stockSummary?.overallTotalCost)}</span>
              <span className="text-blue-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Katalog <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Qarzlar */}
        <div
          onClick={() => onNavigate('cashbox')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Qarzlar Balansi
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900">
              +{formatMoney(counterparties?.totalReceivable)}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
              <span>Mijozlarimizdan olinadigan</span>
              <span className="text-rose-600 font-mono font-bold">
                Bizning qarz: {formatMoney(counterparties?.totalPayable)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SOF FOYDA QANDAY CHIQDI? (Oddiy 5 Bosqichli Zanjir) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Sof Foyda Qanday Hisoblandi?
            </h3>
            <p className="text-xs text-slate-700 mt-0.5">
              Sotuv tushumidan ichimliklarning kelish tannarxi va barcha xarajatlar chiqariladi
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Batafsil P&L</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-xs font-bold text-slate-700 block">1. Sotuv Summasi</span>
            <div className="text-sm font-bold font-mono text-slate-900 mt-1">
              +{formatMoney(pnl?.revenue)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-xs font-bold text-slate-700 block">2. Kelish Narxi</span>
            <div className="text-sm font-bold font-mono text-rose-600 mt-1">
              -{formatMoney(pnl?.cogs)}
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
            <span className="text-xs font-bold text-blue-700 block">= Savdo Foydasi</span>
            <div className="text-sm font-bold font-mono text-blue-700 mt-1">
              {formatMoney(pnl?.grossProfit)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-xs font-bold text-slate-700 block">3. Do'kon Xarajatlari</span>
            <div className="text-sm font-bold font-mono text-amber-600 mt-1">
              -{formatMoney(
                (pnl?.operatingExpenses?.total || 0) +
                  (pnl?.inventoryAdjustments?.deficit || 0),
              )}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-xs font-bold text-emerald-800 block">= SOF FOYDA</span>
            <div className="text-base font-black font-mono text-emerald-700 mt-1">
              {formatMoney(pnl?.netProfit)}
            </div>
          </div>
        </div>

        <div className="mt-3.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>
              Qarz berish ({formatMoney(pnlData?.financingAndDebtFlow?.debtGiven)}) va olish ({formatMoney(pnlData?.financingAndDebtFlow?.debtTaken)}) sof foydani o'zgartirmaydi — ular faqat kassa daftari balansida saqlanadi.
            </span>
          </div>
          <button
            onClick={() => onNavigate('cashbox')}
            className="text-xs font-bold text-slate-800 hover:text-blue-600 shrink-0 ml-2 cursor-pointer"
          >
            Kassa Daftari $\rightarrow$
          </button>
        </div>
      </div>

      {/* 4. KASSA VA QARZLAR KITOBI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Kassalar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Kassadagi Pullar</h3>
            </div>
            <button
              onClick={() => onNavigate('cashbox')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Kassaga o'tish $\rightarrow$
            </button>
          </div>

          <div className="space-y-2">
            {cashSummary?.registers?.map((reg: any) => (
              <div
                key={reg.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800">{reg.name}</span>
                  <p className="text-[11px] text-slate-700">
                    {reg.isDefault ? 'Do\'kondagi naqd pul' : 'Bank kartasi / Terminal hisobi'}
                  </p>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  {formatMoney(reg.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nasiya va Qarzlar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Qarzlar Kitobi</h3>
            </div>
            <button
              onClick={() => onNavigate('cashbox')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Barcha qarzlar $\rightarrow$
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <span className="text-xs text-emerald-800 font-bold block">
                Mijozlar Qarzi (Kutilmoqda)
              </span>
              <div className="text-sm font-bold font-mono text-emerald-700 mt-1">
                +{formatMoney(counterparties?.totalReceivable)}
              </div>
            </div>
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
              <span className="text-xs text-rose-800 font-bold block">
                Bizning Qarzimiz (Zavodga)
              </span>
              <div className="text-sm font-bold font-mono text-rose-700 mt-1">
                -{formatMoney(counterparties?.totalPayable)}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {counterparties?.counterparties?.slice(0, 3).map((cp: any) => (
              <div
                key={cp.id}
                className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-none text-xs"
              >
                <span className="font-semibold text-slate-800">{cp.name}</span>
                <span
                  className={`font-mono font-bold ${
                    cp.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {cp.balance >= 0
                    ? `+${formatMoney(cp.balance)}`
                    : `-${formatMoney(Math.abs(cp.balance))}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
