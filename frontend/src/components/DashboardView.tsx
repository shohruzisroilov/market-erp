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
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
import { PnlReport } from '@/types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
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
      {/* 4 Asosiy Do'kon Ko'rsatkichi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sof Foyda */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>SOF FOYDA (CHO'NTAKKA QOLGAN)</span>
            <div
              className={`p-1.5 rounded-lg ${
                isNetProfitPositive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isNetProfitPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-black font-mono tracking-tight ${
                isNetProfitPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatMoney(pnl?.netProfit)}
            </div>
            <div className="text-xs text-slate-700 mt-1 flex items-center justify-between">
              <span>Foyda foizi:</span>
              <span className="font-bold font-mono text-slate-800">
                {pnl?.netMarginPercent?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Jami Sotuv Tushumi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>JAMI SOTUV TUSHUMI</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {formatMoney(pnl?.revenue)}
            </div>
            <div className="text-xs text-slate-700 mt-1 flex items-center justify-between">
              <span>Ichimliklarning o'z narxi:</span>
              <span className="font-mono text-slate-800">
                {formatMoney(pnl?.cogs)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Do'kon Xarajatlari */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>DO'KON XARAJATLARI</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-amber-600">
              {formatMoney(pnl?.operatingExpenses?.total)}
            </div>
            <div className="text-xs text-slate-700 mt-1 flex items-center justify-between">
              <span>Yo'l kira / Yuk tashish:</span>
              <span className="font-bold font-mono text-slate-800">
                {formatMoney(pnl?.operatingExpenses?.transport)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Ombordagi Ichimliklar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>OMBORDA BOR TOVARLAR</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {formatNumber(stockSummary?.overallTotalUnits)} dona
            </div>
            <div className="text-xs text-slate-700 mt-1 flex items-center justify-between">
              <span>Ombor qiymati (kelgan narxi):</span>
              <span className="font-bold font-mono text-slate-800">
                {formatMoney(stockSummary?.overallTotalCost)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sof Foyda Qanday Chiqdi? (Oddiy 5 Bosqich) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Sof Foyda Qanday Hisoblandi?
            </h3>
            <p className="text-xs text-slate-700 mt-0.5">
              Sotilgan puldan ichimlikning kelish narxi va barcha xarajatlar chiqariladi
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Batafsil Hisobot</span>
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
              Qarz berish ({formatMoney(pnlData?.financingAndDebtFlow?.debtGiven)}) va qarz olish ({formatMoney(pnlData?.financingAndDebtFlow?.debtTaken)}) bu xarajat yoki foyda emas — ular kassa harakatlarida saqlanadi.
            </span>
          </div>
          <button
            onClick={() => onNavigate('cashbox')}
            className="text-xs font-bold text-slate-800 hover:text-blue-600 shrink-0 ml-2"
          >
            Kassa Daftari $\rightarrow$
          </button>
        </div>
      </div>

      {/* 2 Ustunli Kassa va Qarzlar Ro'yxati */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Kassalar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Kassadagi Naqd va Karta Pullar</h3>
            </div>
            <button
              onClick={() => onNavigate('cashbox')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
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
                    {reg.isDefault ? 'Do\'kondagi naqd pul' : 'Bank kartasi orqali tushgan pul'}
                  </p>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  {formatMoney(reg.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nasiya va Qarzlar Kitobi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Qarzlar Kitobi</h3>
            </div>
            <button
              onClick={() => onNavigate('cashbox')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Barcha qarzlar $\rightarrow$
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <span className="text-xs text-emerald-800 font-bold">Mijozlar qarzi (Bizga berishi kerak)</span>
              <div className="text-sm font-bold font-mono text-emerald-700 mt-1">
                +{formatMoney(counterparties?.totalReceivable)}
              </div>
            </div>
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
              <span className="text-xs text-rose-800 font-bold">Bizning qarzimiz (Yetkazuvchiga to'lash kerak)</span>
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
