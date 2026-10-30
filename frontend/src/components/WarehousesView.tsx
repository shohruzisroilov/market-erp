'use client';

import React, { useState, useEffect } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Package,
  MapPin,
  ChevronRight,
  Refrigerator,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
import { Warehouse } from '@/types';
import { useToast } from './Toast';

export const WarehousesView: React.FC = () => {
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubWarehouseId, setSelectedSubWarehouseId] = useState<string | null>(null);
  const [subWarehouseStock, setSubWarehouseStock] = useState<any>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  // Modallar
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isSubWarehouseModalOpen, setIsSubWarehouseModalOpen] = useState(false);
  const [targetWarehouseId, setTargetWarehouseId] = useState('');

  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    address: '',
    isDefault: false,
  });

  const [subWarehouseForm, setSubWarehouseForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await api.getWarehouses();
      setWarehouses(data);
      if (data.length > 0 && data[0].subWarehouses.length > 0) {
        selectSubWarehouse(data[0].subWarehouses[0].id);
      }
    } catch (e: any) {
      toast(e.message || 'Omborlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectSubWarehouse = async (subId: string) => {
    setSelectedSubWarehouseId(subId);
    try {
      setLoadingStock(true);
      const stock = await api.getSubWarehouseStock(subId);
      setSubWarehouseStock(stock);
    } catch (e: any) {
      toast(e.message || 'Qoldiqlarni yuklashda xatolik', 'error');
    } finally {
      setLoadingStock(false);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseForm.name.trim()) return;
    try {
      await api.createWarehouse(warehouseForm);
      toast('Yangi ombor qo\'shildi', 'success');
      setIsWarehouseModalOpen(false);
      setWarehouseForm({ name: '', address: '', isDefault: false });
      loadWarehouses();
    } catch (err: any) {
      toast(err.message || 'Xatolik yuz berdi', 'error');
    }
  };

  const handleCreateSubWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subWarehouseForm.name.trim()) return;
    try {
      await api.createSubWarehouse({
        warehouseId: targetWarehouseId,
        ...subWarehouseForm,
      });
      toast('Yangi do\'kon joyi qo\'shildi', 'success');
      setIsSubWarehouseModalOpen(false);
      setSubWarehouseForm({ name: '', description: '' });
      loadWarehouses();
    } catch (err: any) {
      toast(err.message || 'Xatolik yuz berdi', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha & Bosh Ombor Qo'shish */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <WarehouseIcon className="w-5 h-5 text-indigo-600" />
            Omborlar va Joylashuvlar
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Ichimliklar aynan qaysi sovutgich, vitrina yoki omborxonada turganini ko'rish
          </p>
        </div>

        <button
          onClick={() => setIsWarehouseModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Ombor Qo'shish</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chap ustun: Joylar Ro'yxati */}
          <div className="lg:col-span-5 space-y-3.5">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
              >
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <WarehouseIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{wh.name}</h3>
                      {wh.address && (
                        <span className="text-[10px] text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {wh.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTargetWarehouseId(wh.id);
                      setIsSubWarehouseModalOpen(true);
                    }}
                    className="p-1 px-2.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Joy qo'shish</span>
                  </button>
                </div>

                <div className="p-2 space-y-1">
                  {wh.subWarehouses.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-700">
                      Ushbu omborda hali joylar yaratilmagan
                    </div>
                  ) : (
                    wh.subWarehouses.map((sub) => {
                      const isSelected = selectedSubWarehouseId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => selectSubWarehouse(sub.id)}
                          className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 border border-indigo-200/90 shadow-2xs'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Refrigerator
                              className={`w-4 h-4 ${
                                isSelected ? 'text-indigo-600' : 'text-slate-400'
                              }`}
                            />
                            <div>
                              <div
                                className={`text-xs font-bold ${
                                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                                }`}
                              >
                                {sub.name}
                              </div>
                              {sub.description && (
                                <div className="text-[11px] text-slate-700">
                                  {sub.description}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              {formatNumber(sub.totalUnits)} dona
                            </span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 ${
                                isSelected ? 'text-indigo-600' : 'text-slate-300'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* O'ng ustun: Joydagi Tovar Qoldiqlari */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Joydagi Tovarlar
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    {subWarehouseStock?.subWarehouse?.name || 'Joyni tanlang'}
                  </h3>
                  <p className="text-xs text-slate-700">
                    Ombor: {subWarehouseStock?.subWarehouse?.warehouseName}
                  </p>
                </div>

                {subWarehouseStock && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-700 block">Jami qiymati:</span>
                    <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600">
                      {formatMoney(subWarehouseStock?.totalStockCost)}
                    </div>
                  </div>
                )}
              </div>

              {loadingStock ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : !subWarehouseStock || subWarehouseStock.items.length === 0 ? (
                <div className="p-12 text-center text-slate-700">
                  <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-800">
                    Ushbu joyda tovar yo'q
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    Xarid qilish orqali tovar kirim qiling
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {subWarehouseStock.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-700 mt-0.5">
                          {item.category} • 1 blok = {item.pcsPerPack} dona
                        </div>
                      </div>

                      <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-right shrink-0">
                        <div className="text-xs font-bold text-blue-900 font-mono">
                          {item.displayText}
                        </div>
                        <div className="text-[10px] text-blue-700">
                          {formatMoney(item.totalCostValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bosh Ombor Qo'shish Modali */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Yangi Ombor Binosi Qo'shish</h3>
              <button onClick={() => setIsWarehouseModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ombor Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Markaziy Ombor"
                  value={warehouseForm.name}
                  onChange={(e) =>
                    setWarehouseForm({ ...warehouseForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manzili</label>
                <input
                  type="text"
                  placeholder="Masalan: Chilonzor tumani"
                  value={warehouseForm.address}
                  onChange={(e) =>
                    setWarehouseForm({ ...warehouseForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Do'kon Joyi (Sub-ombor) Qo'shish Modali */}
      {isSubWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Yangi Joy (Sovutgich / Vitrina) Qo'shish
              </h3>
              <button onClick={() => setIsSubWarehouseModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubWarehouse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Joylashuv Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 2-Sovutgich (Zal) yoki 1-Vitrina"
                  value={subWarehouseForm.name}
                  onChange={(e) =>
                    setSubWarehouseForm({ ...subWarehouseForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tavsif</label>
                <input
                  type="text"
                  placeholder="Masalan: Muzdek suvlar uchun"
                  value={subWarehouseForm.description}
                  onChange={(e) =>
                    setSubWarehouseForm({ ...subWarehouseForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubWarehouseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Joyni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
