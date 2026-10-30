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
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
import { SaleInvoice, Product, SubWarehouse } from '@/types';
import { useToast } from './Toast';

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

  // Form
  const [customerName, setCustomerName] = useState('Chakana xaridor');
  const [subWarehouseId, setSubWarehouseId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState('');
  const [items, setItems] = useState<
    {
      productId: string;
      packQuantity: number;
      unitQuantity: number;
      unitPrice: number;
    }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, productsData, subWhData] = await Promise.all([
        api.getSales(),
        api.getProducts(),
        api.getSubWarehouses(),
      ]);
      setSales(salesData);
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
    setCustomerName('Chakana xaridor');
    setPaymentMethod('CASH');
    setNote('');
    if (products.length > 0) {
      const firstProd = products[0];
      setItems([
        {
          productId: firstProd.id,
          packQuantity: 1,
          unitQuantity: 0,
          unitPrice: firstProd.sellPriceUnit,
        },
      ]);
      setPaidAmount(firstProd.sellPriceUnit * firstProd.pcsPerPack);
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
          packQuantity: 0,
          unitQuantity: 1,
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

  // Tezkor miqdor oshirish tugmalari (+1 blok, +1 dona)
  const adjustItemQuantity = (index: number, field: 'packQuantity' | 'unitQuantity', delta: number) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast('Kamida bitta mahsulot qo\'shing', 'error');
      return;
    }

    try {
      await api.createSale({
        customerName,
        subWarehouseId,
        paymentMethod,
        paidAmount: paymentMethod === 'DEBT' ? 0 : paidAmount || totalAmount,
        note,
        items,
      });
      toast('Savdo qoralamasi muvaffaqiyatli saqlandi', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Savdo yaratishda xatolik', 'error');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await api.completeSale(id);
      toast(
        `Savdo muvaffaqiyatli bajarildi! Foyda: +${formatMoney(res.grossProfit)}`,
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
            Savdolar (Ombordan Chiqim)
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Ichimliklarni donalab yoki bloklab sotish va kassa tushumini qayd etish
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Savdo Hujjati</span>
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
          <p className="text-sm font-semibold text-slate-800">Hozircha savdolar yo'q</p>
          <p className="text-xs text-slate-700 mt-1">Yangi savdo hujjati orqali tovar soting</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Mobil Card Ko'rinishi */}
          <div className="sm:hidden divide-y divide-slate-100">
            {sales.map((s) => {
              const isCompleted = s.status === 'COMPLETED';
              return (
                <div key={s.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {s.invoiceNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{s.customerName}</h4>
                      <p className="text-[11px] text-slate-700">
                        {s.subWarehouse?.name} ({s.subWarehouse?.warehouse?.name})
                      </p>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Bajarildi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>Qoralama</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50">
                    <div>
                      <span className="text-[11px] text-slate-700 block">Jami summa:</span>
                      <span className="font-bold font-mono text-sm text-slate-900">
                        {formatMoney(s.totalAmount)}
                      </span>
                    </div>

                    {!isCompleted ? (
                      <button
                        onClick={() => handleComplete(s.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs"
                      >
                        Bajarish (Chiqim)
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-700 block">Yalpi foyda:</span>
                        <span className="font-bold font-mono text-xs text-emerald-600">
                          +{formatMoney(s.grossProfit)}
                        </span>
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
                  <th className="py-3 px-4">Hujjat</th>
                  <th className="py-3 px-4">Xaridor</th>
                  <th className="py-3 px-4">Joylashuv</th>
                  <th className="py-3 px-4">Summa</th>
                  <th className="py-3 px-4">To'lov</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => {
                  const isCompleted = s.status === 'COMPLETED';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {s.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {s.customerName}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {s.subWarehouse?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="font-bold text-slate-900">{formatMoney(s.totalAmount)}</div>
                        <div className="text-[11px] text-emerald-600 font-medium">
                          +{formatMoney(s.grossProfit)} foyda
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700">
                          {s.paymentMethod === 'CASH'
                            ? 'Naqd'
                            : s.paymentMethod === 'CARD'
                            ? 'Terminal'
                            : 'Nasiya'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Bajarildi</span>
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
                            onClick={() => handleComplete(s.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                          >
                            Bajarish
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

      {/* Yangi Savdo Modali (Zero-Wasted-Time POS uslubida) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Yangi Savdo Hujjati
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Xaridor
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Chiqim Joylashuvi *
                  </label>
                  <select
                    value={subWarehouseId}
                    onChange={(e) => setSubWarehouseId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {subWarehouses.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    To'lov Shakli
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="CASH">Naqd pul</option>
                    <option value="CARD">Terminal (Karta)</option>
                    <option value="DEBT">Nasiya (Qarz)</option>
                  </select>
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
                    <span>Yana qo'shish</span>
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
                        className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(idx, 'productId', e.target.value)
                            }
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (1 blok = {p.pcsPerPack} dona)
                              </option>
                            ))}
                          </select>

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

                        {/* Tezkor [+1 Blok] va [+1 Dona] Stepperlari */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
                  <span className="text-slate-300">
                    {paymentMethod === 'DEBT'
                      ? 'Nasiyaga berilmoqda'
                      : paymentMethod === 'CARD'
                      ? 'Terminalga tushadi'
                      : 'Kassaga naqd tushadi'}
                  </span>
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
                  Savdoni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
