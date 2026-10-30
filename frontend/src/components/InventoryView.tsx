'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/utils';
import { InventoryAudit, Product, SubWarehouse } from '@/types';
import { useToast } from './Toast';
import { NumberInput, SelectInput } from './ui/FormControls';

interface InventoryViewProps {
  onRefreshGlobal?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onRefreshGlobal }) => {
  const { toast } = useToast();
  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subWarehouses, setSubWarehouses] = useState<SubWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [subWarehouseId, setSubWarehouseId] = useState('');
  const [note, setNote] = useState('');
  const [auditItems, setAuditItems] = useState<
    {
      productId: string;
      actualPacks: number;
      actualUnits: number;
    }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditsData, productsData, subWhData] = await Promise.all([
        api.getInventoryAudits(),
        api.getProducts(),
        api.getSubWarehouses(),
      ]);
      setAudits(auditsData);
      setProducts(productsData);
      setSubWarehouses(subWhData);
      if (subWhData.length > 0) {
        setSubWarehouseId(subWhData[0].id);
      }
    } catch (e: any) {
      toast(e.message || 'Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setNote('');
    const initialItems = products.map((p) => ({
      productId: p.id,
      actualPacks: 0,
      actualUnits: 0,
    }));
    setAuditItems(initialItems);
    setIsModalOpen(true);
  };

  const handleItemChange = (index: number, field: string, val: number) => {
    const updated = [...auditItems];
    updated[index] = { ...updated[index], [field]: val };
    setAuditItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInventoryAudit({
        subWarehouseId,
        note,
        items: auditItems,
      });
      toast('Sanash hujjati tuzildi (kutilmoqda)', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Sanash yaratishda xatolik', 'error');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completeInventoryAudit(id);
      toast('Ombor qoldiqlari haqiqiy sanalgan songa to\'g\'rilandi!', 'success');
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      toast(err.message || 'Tasdiqlashda xatolik', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha & Yangi Sanash Tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            Qayta Sanash & Tekshirish (Inventarizatsiya)
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Sovutgich va ombordagi tovarlarni sanab, haqiqiy sonini tizimga to'g'rilash
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Qayta Sanash</span>
        </button>
      </div>

      {/* Ro'yxat */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : audits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-700">
          <ClipboardCheck className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            Hozircha tekshiruvlar o'tkazilmagan
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Haqiqiy tovarlarni sanab tekshirish uchun yangi hujjat tuzing
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hujjat Raqami</th>
                  <th className="py-3 px-4">Qaysi Joy Sanaldi?</th>
                  <th className="py-3 px-4">Tovarlar</th>
                  <th className="py-3 px-4">Kam / Ko'p Chiqqan Farq</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audits.map((a) => {
                  const isCompleted = a.status === 'COMPLETED';
                  const isDeficit = a.totalDifferenceValue < 0;
                  const isSurplus = a.totalDifferenceValue > 0;

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {a.auditNumber}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {a.subWarehouse?.name}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {a.items?.length || 0} xil ichimlik
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {isDeficit ? (
                          <div className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>Kamomad: -{formatMoney(Math.abs(a.totalDifferenceValue))}</span>
                          </div>
                        ) : isSurplus ? (
                          <div className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Ortiqcha: +{formatMoney(a.totalDifferenceValue)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-700 font-bold">Farq yo'q (To'liq mos)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>To'g'rilandi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Kutilmoqda</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCompleted && (
                          <button
                            onClick={() => handleComplete(a.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                          >
                            Tasdiqlash & Qoldiqni to'g'rilash
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yangi Sanash Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Qayta Sanash Hujjatini Tuzish
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qaysi Joy Sanalmoqda? *
                  </label>
                  <SelectInput
                    value={subWarehouseId}
                    onChange={(e) => setSubWarehouseId(e.target.value)}
                  >
                    {subWarehouses.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.warehouse?.name})
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Izoh
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Haftalik qayta sanash"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Sanalgan blok va ortiqcha donalar */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-800 uppercase block">
                  Haqiqiy Sanalgan Blok va Ortiqcha Donalar
                </span>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {auditItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    if (!prod) return null;
                    const totalCounted =
                      (item.actualPacks || 0) * prod.pcsPerPack + (item.actualUnits || 0);

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{prod.name}</div>
                          <div className="text-[11px] text-slate-700">
                            1 blok = {prod.pcsPerPack} dona
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-[11px] text-slate-700 block">Sanalgan Blok</span>
                            <div className="w-20">
                              <NumberInput
                                placeholder="Blok"
                                value={item.actualPacks}
                                onChange={(val) => handleItemChange(idx, 'actualPacks', val)}
                                className="py-1 px-2 text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-700 block">Ortiqcha Dona</span>
                            <div className="w-20">
                              <NumberInput
                                placeholder="Dona"
                                value={item.actualUnits}
                                onChange={(val) => handleItemChange(idx, 'actualUnits', val)}
                                className="py-1 px-2 text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="text-[11px] text-slate-700 block">Jami</span>
                            <span className="font-bold font-mono text-indigo-700 text-sm">
                              {totalCounted} dona
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Hujjatni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
