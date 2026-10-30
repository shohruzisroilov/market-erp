'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Truck,
  Building,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
import { PnlReport } from '@/types';
import { useToast } from './Toast';

export const ReportsView: React.FC = () => {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<'pnl' | 'stock' | 'sales'>('pnl');
  const [pnlData, setPnlData] = useState<PnlReport | null>(null);
  const [stockReport, setStockReport] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [pnl, stock, sales] = await Promise.all([
        api.getPnlReport(),
        api.getStockReport(),
        api.getSalesReport(),
      ]);
      setPnlData(pnl);
      setStockReport(stock);
      setSalesReport(sales);
    } catch (e: any) {
      toast(e.message || 'Hisobotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pnl = pnlData?.pnl;
  const isNetProfitPositive = (pnl?.netProfit || 0) >= 0;

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha & Tablar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Do'kon Hisobotlari & Tahlillar
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Sof foyda, xarajatlar tahlili va ombordagi tovarlar qiymati
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSubTab('pnl')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              subTab === 'pnl' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sof Foyda Hisob-Kitobi
          </button>
          <button
            onClick={() => setSubTab('stock')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              subTab === 'stock' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ombor Qoldiqlari
          </button>
          <button
            onClick={() => setSubTab('sales')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              subTab === 'sales' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sotuvlar Tahlili
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : subTab === 'pnl' ? (
        /* ================= 1. SOF FOYDA HISOB-KITOBI ================= */
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Do'kon Egasi Cho'ntagiga Qoladigan Pul (Sof Foyda)
                </span>
                <div
                  className={`text-3xl font-black font-mono tracking-tight mt-1 ${
                    isNetProfitPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatMoney(pnl?.netProfit)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-right">
                  <span className="text-[11px] text-slate-700 block">Savdo Foydasi (Yalpi)</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {formatMoney(pnl?.grossProfit)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-right">
                  <span className="text-[11px] text-slate-700 block">Foydalilik darajasi</span>
                  <span className="text-sm font-bold font-mono text-blue-600">
                    {pnl?.netMarginPercent?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Qadam-baqadam Formula */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                <span className="font-semibold text-slate-800">
                  1. Jami Sotuvdan Tushgan Pul
                </span>
                <span className="font-mono font-bold text-slate-900">
                  +{formatMoney(pnl?.revenue)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                <span className="text-slate-600 pl-4">
                  Sotilgan ichimliklarning o'z kelgan narxi
                </span>
                <span className="font-mono font-bold text-rose-600">
                  -{formatMoney(pnl?.cogs)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 bg-blue-50/70 rounded-xl text-sm font-bold text-blue-900">
                <span>= Savdo Foydasi (Yalpi)</span>
                <span className="font-mono">{formatMoney(pnl?.grossProfit)}</span>
              </div>

              {/* Do'kon xarajatlari */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Do'kon Xarajatlari (Chiqqan pullar)
                </div>

                <div className="space-y-1.5 pl-4 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-500" />
                      Yo'l kira / Yuk tashish (Logistika)
                    </span>
                    <span className="font-mono font-bold text-rose-600">
                      -{formatMoney(pnl?.operatingExpenses?.transport)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-purple-500" />
                      Do'kon va Ombor Ijarasi
                    </span>
                    <span className="font-mono font-bold text-rose-600">
                      -{formatMoney(pnl?.operatingExpenses?.rent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Xodimlar Maoshi</span>
                    <span className="font-mono font-bold text-rose-600">
                      -{formatMoney(pnl?.operatingExpenses?.salary)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Elektr va Kommunal To'lovlar</span>
                    <span className="font-mono font-bold text-rose-600">
                      -{formatMoney(pnl?.operatingExpenses?.utilities)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Boshqa Mayda Xarajatlar</span>
                    <span className="font-mono font-bold text-rose-600">
                      -{formatMoney(pnl?.operatingExpenses?.other)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-rose-50/60 rounded-xl text-xs font-bold text-rose-900 mt-2">
                  <span>Jami Xarajatlar</span>
                  <span className="font-mono">
                    -{formatMoney(pnl?.operatingExpenses?.total)}
                  </span>
                </div>
              </div>

              {/* Sanashdagi farqlar */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Qayta Sanashdagi Farqlar
                </div>

                <div className="space-y-1.5 pl-4 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">
                      Kam chiqqan tovarlar (Kamomad zarari)
                    </span>
                    <span className="font-mono font-bold text-rose-600">
                      -{formatMoney(pnl?.inventoryAdjustments?.deficit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">
                      Ortiqcha chiqqan tovarlar
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      +{formatMoney(pnl?.inventoryAdjustments?.surplus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* YAKUNIY SOF DAROMAD */}
              <div
                className={`flex items-center justify-between p-4 rounded-xl text-sm sm:text-base font-black ${
                  isNetProfitPositive
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-rose-50 text-rose-950 border border-rose-200'
                }`}
              >
                <span>= CHO'NTAKKA QOLGAN TOZA SOF FOYDA</span>
                <span className="font-mono text-xl">{formatMoney(pnl?.netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : subTab === 'stock' ? (
        /* ================= 2. OMBOR QOLDIQLARI ================= */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Jami Ichimliklar Qoldig'i
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {formatNumber(stockReport?.summary?.overallTotalUnits)} dona
              </div>
              <p className="text-xs text-slate-700 mt-1">
                {stockReport?.summary?.totalProductsCount} xil ichimlik
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Kelgan Narxidagi Umumiy Qiymat
              </span>
              <div className="text-2xl font-black font-mono text-indigo-600 mt-1">
                {formatMoney(stockReport?.summary?.overallTotalCost)}
              </div>
              <p className="text-xs text-slate-700 mt-1">Ombordagi tovarlar tannarxi</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Sotilgandagi Kutilayotgan Pul
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {formatMoney(stockReport?.summary?.overallTotalSell)}
              </div>
              <p className="text-xs text-slate-700 mt-1">
                Kutilayotgan daromad: {formatMoney(stockReport?.summary?.overallPotentialProfit)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Har Bir Ichimlikning Joylashuv va Blok/Dona Qoldig'i
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {stockReport?.products?.map((item: any) => (
                <div key={item.productId} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-slate-700 mt-0.5">
                        {item.category} • 1 blok = {item.pcsPerPack} dona
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 font-mono">
                        {item.displayText}
                      </div>
                      <div className="text-right text-xs font-mono">
                        <div className="text-slate-700">
                          Kelishi: {formatMoney(item.totalCostValue)}
                        </div>
                        <div className="font-bold text-emerald-600">
                          Sotilishi: {formatMoney(item.totalSellValue)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Qayerda turibdi:</span>
                    {item.locations?.length === 0 ? (
                      <span className="text-[11px] text-slate-700">Omborda yo'q</span>
                    ) : (
                      item.locations.map((loc: any, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium"
                        >
                          <strong>{loc.subWarehouseName}:</strong> {loc.displayText}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= 3. SOTUVLAR TAHLILI ================= */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Sotuvlar Soni
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {salesReport?.summary?.totalOrders} ta
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Sotuv Tushumi
              </span>
              <div className="text-2xl font-black font-mono text-blue-600 mt-1">
                {formatMoney(salesReport?.summary?.totalSalesAmount)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Savdo Foydasi
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {formatMoney(salesReport?.summary?.totalGrossProfit)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                O'rtacha Savdo
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {formatMoney(salesReport?.summary?.averageOrderValue)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Eng Ko'p Sotilgan Ichimliklar
              </h3>
            </div>

            {salesReport?.topSellingProducts?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-700">
                Hozircha sotilgan tovarlar statistikasi yo'q
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ichimlik</th>
                      <th className="py-3 px-4">Turi</th>
                      <th className="py-3 px-4">Qancha Sotildi</th>
                      <th className="py-3 px-4">Sotilgan Summasi</th>
                      <th className="py-3 px-4 text-right">Keltirgan Foydasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesReport?.topSellingProducts?.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 text-xs text-slate-700">{p.category}</td>
                        <td className="py-3 px-4 text-xs font-mono font-bold text-blue-700">
                          {p.displayText}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono font-bold text-slate-900">
                          {formatMoney(p.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-mono font-bold text-emerald-600">
                          +{formatMoney(p.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
