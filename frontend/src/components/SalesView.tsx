'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  X,
  Package,
  Layers,
  Minus,
  DollarSign,
  CreditCard,
  BookOpen,
  User,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
import { SaleInvoice, Product, SubWarehouse } from '@/types';
import { useToast } from './Toast';
import { NumberInput, SelectInput } from './ui/FormControls';

interface SalesViewProps {
  onRefreshGlobal?: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onRefreshGlobal }) => {
  const { toast } = useToast();
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subWarehouses, setSubWarehouses] = useState<SubWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [customerName, setCustomerName] = useState('Chakana xaridor');
  const [subWarehouseId, setSubWarehouseId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DEBT'>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [items, setItems] = useState<
    Array<{
      productId: string;
      packQuantity: number;
      unitQuantity: number;
      unitPrice: number;
    }>
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, prods, subs] = await Promise.all([
        api.getSales(),
        api.getProducts(),
        api.getSubWarehouses(),
      ]);
      setSales(salesData);
      setProducts(prods);
      setSubWarehouses(subs);
      if (subs.length > 0 && !subWarehouseId) {
        setSubWarehouseId(subs[0].id);
      }
    } catch (e: any) {
      toast(e.message || 'Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setCustomerName('Chakana xaridor');
    setPaymentMethod('CASH');
    setPaidAmount(0);
    setNote('');
    if (products.length > 0) {
      setItems([
        {
          productId: products[0].id,
          packQuantity: 1,
          unitQuantity: 0,
          unitPrice: products[0].sellPriceUnit,
        },
      ]);
    } else {
      setItems([]);
    }
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      const prod = products[0];
      setItems([
        ...items,
        {
          productId: prod.id,
          packQuantity: 1,
          unitQuantity: 0,
          unitPrice: prod.sellPriceUnit,
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
        updated[index].unitPrice = prod.sellPriceUnit;
      }
    }
    setItems(updated);
  };

  // Tezkor miqdor oshirish/kamaytirish tugmalari (+1 blok, +1 dona)
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

  // Jami summa
  const totalAmount = items.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    const pcsPerPack = prod ? prod.pcsPerPack : 12;
    const totalUnits = (item.packQuantity || 0) * pcsPerPack + (item.unitQuantity || 0);
    return sum + totalUnits * (item.unitPrice || 0);
  }, 0);

  // 1) Qoralama saqlash (faqat oldindan buyurtmalar uchun)
  const handleSaveDraft = async () => {
    if (items.length === 0) {
      toast('Kamida bitta ichimlik tanlang', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await api.createSale({
        customerName: customerName.trim() || 'Chakana xaridor',
        subWarehouseId,
        paymentMethod,
        paidAmount: paymentMethod === 'DEBT' ? 0 : paidAmount || totalAmount,
        note,
        items,
      });
      toast('Savdo qoralamasi saqlandi', 'info');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 2) Darhol Sotish & Tovarni Chiqarish (1-KLIKDA YAKUNLASH)
  const handleSaveAndComplete = async () => {
    if (items.length === 0) {
      toast('Kamida bitta ichimlik tanlang', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const created = await api.createSale({
        customerName: customerName.trim() || 'Chakana xaridor',
        subWarehouseId,
        paymentMethod,
        paidAmount: paymentMethod === 'DEBT' ? 0 : paidAmount || totalAmount,
        note,
        items,
      });
      const completed = await api.completeSale(created.id);
      toast(
        `Savdo muvaffaqiyatli bajarildi! Foyda: +${formatMoney(completed.grossProfit)}`,
        'success',
      );
      setIsModalOpen(false);
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      toast(err.message || 'Savdoni amalga oshirishda xatolik', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteExisting = async (id: string) => {
    try {
      const res = await api.completeSale(id);
      toast(
        `Savdo bajarildi! Foyda: +${formatMoney(res.grossProfit)}`,
        'success',
      );
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      toast(err.message || 'Savdoni bajarishda xatolik', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha & Savdo Tuzish Tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Savdolar & Sotuvlar
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Ichimliklarni donalab yoki bloklab sotish va kassa tushumini bir zumda qayd etish
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi Savdo Qilish</span>
        </button>
      </div>

      {/* Savdolar Ro'yxati */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-700">
          <ShoppingCart className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            Hozircha sotuvlar amalga oshirilmagan
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Yangi savdo kiritish uchun yuqoridagi tugmani bosing
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hujjat Raqami</th>
                  <th className="py-3 px-4">Xaridor</th>
                  <th className="py-3 px-4">Chiqim Joyi</th>
                  <th className="py-3 px-4">Sotilgan Tovarlar</th>
                  <th className="py-3 px-4">To'lov Turi</th>
                  <th className="py-3 px-4">Summa</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => {
                  const isCompleted = s.status === 'COMPLETED';
                  const totalPacks = s.items?.reduce(
                    (sum, i) => sum + (i.packQuantity || 0),
                    0,
                  );
                  const totalUnitsOnly = s.items?.reduce(
                    (sum, i) => sum + (i.unitQuantity || 0),
                    0,
                  );

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {s.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {s.customerName}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                        {s.subWarehouse?.name}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <span className="font-bold text-slate-800">
                          {totalPacks} blok
                          {totalUnitsOnly > 0 ? ` + ${totalUnitsOnly} dona` : ''}
                        </span>
                        <span className="text-[11px] text-slate-700 block">
                          ({s.items?.length || 0} xil ichimlik)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        {s.paymentMethod === 'CARD' ? (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            Terminal
                          </span>
                        ) : s.paymentMethod === 'DEBT' ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            Nasiya (Qarz)
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Naqd pul
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs sm:text-sm">
                        {formatMoney(s.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Sotildi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Qoralama</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCompleted && (
                          <button
                            onClick={() => handleCompleteExisting(s.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Chiqarish</span>
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

      {/* Yangi Savdo Modali (Tezkor 1-Kliklik POS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Yangi Savdo Hujjati
                </h3>
                <span className="text-[11px] text-slate-700">
                  1-klikda tovar ombordan chiqadi va pul kassaga tushadi
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
                {/* Xaridor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Xaridor Nomi
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomerName('Chakana xaridor')}
                      className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Oddiy xaridor
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Nodir aka"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Joylashuv */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Chiqim Joyi (Qayerdan beriladi?) *
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

              {/* To'lov Turi (Tezkor Tugmalar) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  To'lov Shakli *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Naqd pul</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Terminal (Karta)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('DEBT');
                      if (customerName === 'Chakana xaridor') {
                        setCustomerName('');
                      }
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'DEBT'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                    <span>Nasiya (Qarz)</span>
                  </button>
                </div>
              </div>

              {/* Tovar Tanlash va Tezkor Blok/Dona Stepper */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    Ichimliklar Ro'yxati
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yana ichimlik qo'shish</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const pcsPerPack = prod ? prod.pcsPerPack : 12;
                    const itemTotalUnits =
                      (item.packQuantity || 0) * pcsPerPack + (item.unitQuantity || 0);
                    const itemTotalAmount = itemTotalUnits * (item.unitPrice || 0);

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

                        {/* Tezkor [+1 Blok] va [+1 Dona] Stepperlari (Raqamni bevosita yozish ham mumkin) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
                        </div>

                        {/* Qator hisobi */}
                        <div className="flex items-center justify-between text-xs pt-1 px-1">
                          <span className="text-slate-700 font-mono">
                            Jami: {itemTotalUnits} dona ({item.unitPrice.toLocaleString()} so'm/dona)
                          </span>
                          <span className="font-bold font-mono text-emerald-600">
                            {formatMoney(itemTotalAmount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jami Summa Banner */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Jami Savdo Qiymati:</span>
                  <div className="text-xl font-black font-mono text-emerald-400">
                    {formatMoney(totalAmount)}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-300 font-medium">
                    {paymentMethod === 'DEBT'
                      ? 'Nasiyaga (Mijoz qarziga) yoziladi'
                      : paymentMethod === 'CARD'
                      ? 'Terminal hisobiga tushadi'
                      : 'Kassaga naqd pul kiradi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pastki Amallar: 1-Klikda Sotish yoki Qoralama Saqlash */}
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
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Bajarilmoqda...' : 'Sotish & Tovarni Chiqarish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
