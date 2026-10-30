'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  X,
  Package,
  Layers,
  Minus,
  Truck,
  Building,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
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
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [supplierName, setSupplierName] = useState('');
  const [subWarehouseId, setSubWarehouseId] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [items, setItems] = useState<
    Array<{
      productId: string;
      packQuantity: number;
      unitQuantity: number;
      unitCost: number;
    }>
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
      if (subWhData.length > 0 && !subWarehouseId) {
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

  const adjustItemQuantity = (
    index: number,
    field: 'packQuantity' | 'unitQuantity',
    delta: number,
  ) => {
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

  // 1) Qoralama saqlash (faqat oldindan rejalashtirish uchun)
  const handleSaveDraft = async () => {
    if (items.length === 0) {
      toast('Kamida bitta tovar qo\'shing', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await api.createPurchase({
        supplierName: supplierName.trim() || 'Noma\'lum Yetkazib Beruvchi',
        subWarehouseId,
        paidAmount,
        note,
        items,
      });
      toast('Xarid qoralamasi muvaffaqiyatli saqlandi', 'info');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Xarid saqlashda xatolik', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 2) Darhol Qabul Qilish & Omborga Qo'shish (1-KLIKDA YAKUNLASH)
  const handleSaveAndComplete = async () => {
    if (items.length === 0) {
      toast('Kamida bitta tovar qo\'shing', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const created = await api.createPurchase({
        supplierName: supplierName.trim() || 'Yetkazib Beruvchi',
        subWarehouseId,
        paidAmount,
        note,
        items,
      });
      await api.completePurchase(created.id);
      toast(
        'Kirim to\'liq qabul qilindi va tovarlar omborga qo\'shildi!',
        'success',
      );
      setIsModalOpen(false);
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      toast(err.message || 'Qabul qilishda xatolik yuz berdi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteExisting = async (id: string) => {
    try {
      await api.completePurchase(id);
      toast('Kirim qabul qilindi va tovarlar omborga kirdi!', 'success');
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
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            Xaridlar (Omborga Kirim)
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Zavod va firmalardan tovarlarni qabul qilish hamda tannarxni hisoblash
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi Kirim Qilish</span>
        </button>
      </div>

      {/* Xaridlar Ro'yxati */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-700">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            Hozircha xaridlar kiritilmagan
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Zavoddan kelgan tovarlarni kirim qilish uchun yangi hujjat tuzing
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hujjat Raqami</th>
                  <th className="py-3 px-4">Yetkazib Beruvchi</th>
                  <th className="py-3 px-4">Qaysi Joyga Kirgan?</th>
                  <th className="py-3 px-4">Kelgan Tovarlar</th>
                  <th className="py-3 px-4">Jami Summa</th>
                  <th className="py-3 px-4">To'landi / Qarz</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => {
                  const isCompleted = p.status === 'COMPLETED';
                  const totalPacks = p.items?.reduce(
                    (sum, i) => sum + (i.packQuantity || 0),
                    0,
                  );
                  const totalUnitsOnly = p.items?.reduce(
                    (sum, i) => sum + (i.unitQuantity || 0),
                    0,
                  );

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {p.supplierName}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                        {p.subWarehouse?.name}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <span className="font-bold text-slate-800">
                          {totalPacks} blok
                          {totalUnitsOnly > 0 ? ` + ${totalUnitsOnly} dona` : ''}
                        </span>
                        <span className="text-[11px] text-slate-700 block">
                          ({p.items?.length || 0} xil ichimlik)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs sm:text-sm">
                        {formatMoney(p.totalAmount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="text-emerald-700 font-bold">
                          To'landi: {formatMoney(p.paidAmount)}
                        </div>
                        {p.debtAmount > 0 ? (
                          <div className="text-rose-600 font-semibold text-[11px]">
                            Qarz: {formatMoney(p.debtAmount)}
                          </div>
                        ) : (
                          <div className="text-slate-700 text-[11px]">To'liq to'langan</div>
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
                            onClick={() => handleCompleteExisting(p.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Qabul qilish</span>
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

      {/* Yangi Kirim Modali (1-Kliklik Tezkor Qabul Qilish) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Yangi Tovar Kirim Hujjati
                </h3>
                <span className="text-[11px] text-slate-700">
                  Tovarlar kelganda omborga qabul qilib zaxirani to'ldirish
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3.5 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Yetkazib Beruvchi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Yetkazib Beruvchi (Zavod / Firma) *
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Coca-Cola Bottlers"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto scrollbar-none">
                    {['Coca-Cola', 'Pepsi', 'RC Cola', 'Dena'].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSupplierName(name)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer shrink-0"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Joylashuv */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Qaysi Xona / Sovutgichga Tushadi? *
                  </label>
                  <SelectInput
                    value={subWarehouseId}
                    onChange={(e) => setSubWarehouseId(e.target.value)}
                  >
                    {subWarehouses.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
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
                        className="p-3 bg-slate-50/90 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <SelectInput
                              value={item.productId}
                              onChange={(e) =>
                                handleItemChange(idx, 'productId', e.target.value)
                              }
                              className="font-bold text-xs"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (1 blok = {p.pcsPerPack} dona)
                                </option>
                              ))}
                            </SelectInput>
                          </div>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
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
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'packQuantity', -1)}
                                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-800 cursor-pointer"
                              >
                                -
                              </button>
                              <div className="w-12">
                                <NumberInput
                                  value={item.packQuantity}
                                  onChange={(val) =>
                                    handleItemChange(idx, 'packQuantity', val)
                                  }
                                  className="text-center font-mono font-bold py-1 px-1 text-xs border border-slate-200 rounded-md"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'packQuantity', 1)}
                                className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Dona Stepper */}
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-700">Dona:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'unitQuantity', -1)}
                                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-800 cursor-pointer"
                              >
                                -
                              </button>
                              <div className="w-12">
                                <NumberInput
                                  value={item.unitQuantity}
                                  onChange={(val) =>
                                    handleItemChange(idx, 'unitQuantity', val)
                                  }
                                  className="text-center font-mono font-bold py-1 px-1 text-xs border border-slate-200 rounded-md"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => adjustItemQuantity(idx, 'unitQuantity', 1)}
                                className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* 1 Dona Kelgan Narxi */}
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

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">Hozir to'langan summa:</span>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(totalAmount)}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Barchasi to'landi
                    </button>
                  </div>
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
            </div>

            {/* Pastki Amallar: 1-Klikda Qabul Qilish yoki Qoralama */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveDraft}
                className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl cursor-pointer transition-all"
              >
                Qoralama
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveAndComplete}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {submitting ? 'Kirim qilinmoqda...' : 'Qabul Qilish & Omborga Qo\'shish'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
