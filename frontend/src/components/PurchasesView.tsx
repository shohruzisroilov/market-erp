'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/utils';
import { PurchaseInvoice, Product, SubWarehouse } from '@/types';
import { useToast } from './Toast';
import { NumberInput, SelectInput } from './ui/FormControls';

interface PurchasesViewProps {
  onRefreshGlobal?: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ onRefreshGlobal }) => {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subWarehouses, setSubWarehouses] = useState<SubWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [supplierName, setSupplierName] = useState('');
  const [subWarehouseId, setSubWarehouseId] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState('');
  const [items, setItems] = useState<
    {
      productId: string;
      packQuantity: number;
      unitQuantity: number;
      unitCost: number;
    }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [purchasesData, productsData, subWhData] = await Promise.all([
        api.getPurchases(),
        api.getProducts(),
        api.getSubWarehouses(),
      ]);
      setPurchases(purchasesData);
      setProducts(productsData);
      setSubWarehouses(subWhData);
      if (subWhData.length > 0) {
        setSubWarehouseId(subWhData[0].id);
      }
    } catch (e: any) {
      toast(e.message || 'Xaridlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setSupplierName('');
    setPaidAmount(0);
    setNote('');
    if (products.length > 0) {
      setItems([
        {
          productId: products[0].id,
          packQuantity: 5,
          unitQuantity: 0,
          unitCost: products[0].costPrice,
        },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([
        ...items,
        {
          productId: products[0].id,
          packQuantity: 1,
          unitQuantity: 0,
          unitCost: products[0].costPrice,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].unitCost = prod.costPrice;
      }
    }
    setItems(updated);
  };

  const adjustItemQuantity = (index: number, field: 'packQuantity' | 'unitQuantity', delta: number) => {
    const updated = [...items];
    const current = updated[index][field] || 0;
    updated[index][field] = Math.max(0, current + delta);
    setItems(updated);
  };

  // Hisoblangan umumiy summa
  const totalAmount = items.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    const pcsPerPack = prod ? prod.pcsPerPack : 12;
    const totalUnits = (item.packQuantity || 0) * pcsPerPack + (item.unitQuantity || 0);
    return sum + totalUnits * (item.unitCost || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      toast('Yetkazib beruvchi nomini kiriting', 'error');
      return;
    }
    if (items.length === 0) {
      toast('Kamida bitta tovar qo\'shing', 'error');
      return;
    }

    try {
      await api.createPurchase({
        supplierName,
        subWarehouseId,
        paidAmount,
        note,
        items,
      });
      toast('Kirim hujjati saqlandi (kutilmoqda)', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Xarid yaratishda xatolik', 'error');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completePurchase(id);
      toast('Tovarlar omborga muvaffaqiyatli qabul qilindi!', 'success');
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      toast(err.message || 'Qabul qilishda xatolik', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha & Yangi Xarid Tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Tovar Qabul Qilish (Omborga Kirim)
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Zavod va yetkazib beruvchilardan tovar qabul qilish va omborga joylash
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Kirim Hujjati</span>
        </button>
      </div>

      {/* Xaridlar Jadvali */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-700">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            Hozircha kirim hujjatlari yo'q
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Zavoddan tovar kelganda yangi kirim hujjati tuzing
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Mobil Card Ko'rinishi */}
          <div className="sm:hidden divide-y divide-slate-100">
            {purchases.map((p) => {
              const isCompleted = p.status === 'COMPLETED';
              return (
                <div key={p.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {p.invoiceNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{p.supplierName}</h4>
                      <p className="text-[11px] text-slate-700">
                        Joylashuv: {p.subWarehouse?.name}
                      </p>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Qabul qilindi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>Kutilmoqda</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50">
                    <div>
                      <span className="text-[11px] text-slate-700 block">Jami summa:</span>
                      <span className="font-bold font-mono text-sm text-slate-900">
                        {formatMoney(p.totalAmount)}
                      </span>
                    </div>

                    {!isCompleted ? (
                      <button
                        onClick={() => handleComplete(p.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs"
                      >
                        Omborga qabul qilish
                      </button>
                    ) : (
                      <div className="text-right text-[11px]">
                        <div className="text-emerald-600 font-bold">
                          To'landi: {formatMoney(p.paidAmount)}
                        </div>
                        {p.debtAmount > 0 && (
                          <div className="text-rose-600 font-bold">
                            Qarz: {formatMoney(p.debtAmount)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Jadval Ko'rinishi */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hujjat Raqami</th>
                  <th className="py-3 px-4">Yetkazib Beruvchi (Zavod)</th>
                  <th className="py-3 px-4">Kirim Joyi</th>
                  <th className="py-3 px-4">Jami Summa</th>
                  <th className="py-3 px-4">To'lov & Qarz</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => {
                  const isCompleted = p.status === 'COMPLETED';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {p.supplierName}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {p.subWarehouse?.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {formatMoney(p.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <div className="text-emerald-600 font-semibold">
                          To'landi: {formatMoney(p.paidAmount)}
                        </div>
                        {p.debtAmount > 0 && (
                          <div className="text-rose-600 font-semibold">
                            Qarz: {formatMoney(p.debtAmount)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Qabul qilindi</span>
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
                            onClick={() => handleComplete(p.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                          >
                            Qabul qilish
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

      {/* Yangi Kirim Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Yangi Tovar Kirim Hujjati
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Yetkazib Beruvchi (Zavod / Firma) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Coca-Cola Bottlers"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qaysi Xona / Sovutgichga Tushadi? *
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
              </div>

              {/* Tovar ro'yxati va Tezkor Stepperlar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    Kelgan Ichimliklar
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yana tovar qo'shish</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const pcsPerPack = prod ? prod.pcsPerPack : 12;
                    const itemTotalUnits =
                      (item.packQuantity || 0) * pcsPerPack + (item.unitQuantity || 0);
                    const itemTotalCost = itemTotalUnits * (item.unitCost || 0);

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <SelectInput
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(idx, 'productId', e.target.value)
                            }
                            className="font-bold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (1 blok = {p.pcsPerPack} dona)
                              </option>
                            ))}
                          </SelectInput>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Stepperlar va narx */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {/* Blok Stepper */}
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-700">Blok:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'packQuantity', -1)}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold">
                                {item.packQuantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'packQuantity', 1)}
                                className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Dona Stepper */}
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-700">Dona:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'unitQuantity', -1)}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold">
                                {item.unitQuantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'unitQuantity', 1)}
                                className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* 1 Dona Kelgan Narxi (NumberInput bilan nol yopishib qolmaydi) */}
                          <div className="p-1 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 px-2">
                            <span className="text-[11px] text-slate-700 whitespace-nowrap">
                              Dona narxi:
                            </span>
                            <NumberInput
                              placeholder="Narxi"
                              value={item.unitCost}
                              onChange={(val) => handleItemChange(idx, 'unitCost', val)}
                              className="py-1 px-1 text-xs border-none font-bold"
                            />
                          </div>
                        </div>

                        {/* Qator Jami */}
                        <div className="flex items-center justify-between text-xs pt-1 px-1">
                          <span className="text-slate-700 font-mono">
                            Jami: {itemTotalUnits} dona
                          </span>
                          <span className="font-bold font-mono text-slate-900">
                            {formatMoney(itemTotalCost)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jami va To'lov */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Jami Kirim Summasi:</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {formatMoney(totalAmount)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Hozir to'langan summa:</span>
                  <div className="w-36">
                    <NumberInput
                      placeholder="To'langan pul"
                      value={paidAmount}
                      onChange={(val) => setPaidAmount(val)}
                      className="bg-slate-800 text-white border-slate-700 text-right py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-right text-rose-400 font-medium">
                  Yetkazib beruvchiga qarz:{' '}
                  <strong className="font-mono">
                    {formatMoney(Math.max(0, totalAmount - paidAmount))}
                  </strong>
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
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Kirimni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
