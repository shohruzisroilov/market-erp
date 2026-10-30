'use client';

import React, { useState, useEffect } from 'react';
import {
  Wine,
  Plus,
  Search,
  Package,
  Layers,
  Edit2,
  Trash2,
  X,
  MapPin,
  ChevronDown,
  ChevronUp,
  Warehouse,
  AlertTriangle,
  Refrigerator,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/utils';
import { Product } from '@/types';
import { useToast } from './Toast';
import { NumberInput, SelectInput } from './ui/FormControls';
import { WarehousesView } from './WarehousesView';

export const ProductsView: React.FC = () => {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<'products' | 'locations'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // O'chirishni tasdiqlash modali
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Gazlangan ichimliklar',
    barcode: '',
    pcsPerPack: 12,
    costPrice: 0,
    sellPriceUnit: 0,
    sellPricePack: 0,
    minStockAlert: 0,
  });

  const categories = [
    'ALL',
    'Gazlangan ichimliklar',
    'Mineral suvlar',
    'Ichimlik suvlari',
    'Sharbatlar',
    'Energetik ichimliklar',
    'Boshqa',
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (e: any) {
      toast(e.message || 'Mahsulotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Gazlangan ichimliklar',
      barcode: '',
      pcsPerPack: 12,
      costPrice: 0,
      sellPriceUnit: 0,
      sellPricePack: 0,
      minStockAlert: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      barcode: p.barcode || '',
      pcsPerPack: p.pcsPerPack,
      costPrice: p.costPrice,
      sellPriceUnit: p.sellPriceUnit,
      sellPricePack: p.sellPricePack,
      minStockAlert: p.minStockAlert,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast('Ichimlik nomini kiriting', 'error');
      return;
    }

    const payload = {
      ...formData,
      pcsPerPack: Number(formData.pcsPerPack) > 0 ? Number(formData.pcsPerPack) : 1,
      costPrice: Number(formData.costPrice) || 0,
      sellPriceUnit: Number(formData.sellPriceUnit) || 0,
      sellPricePack: Number(formData.sellPricePack) || 0,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        toast(`"${formData.name}" ma'lumotlari yangilandi`, 'success');
      } else {
        await api.createProduct(payload);
        toast(`Yangi ichimlik "${formData.name}" qo'shildi`, 'success');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast(err.message || 'Saqlashda xatolik yuz berdi', 'error');
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteProduct(deleteConfirm.id);
      toast(`"${deleteConfirm.name}" o'chirildi`, 'info');
      setDeleteConfirm(null);
      loadProducts();
    } catch (err: any) {
      toast(err.message || 'O\'chirishda xatolik', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha, Tablar & Yangi Mahsulot Tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wine className="w-5 h-5 text-blue-600" />
            Ichimliklar & Ombor Joylari
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Dona va blok qoldig'i, narxlar hamda sovutgichdagi joylashuvlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* SubTab Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSubTab('products')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                subTab === 'products'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Katalog & Qoldiq
            </button>
            <button
              onClick={() => setSubTab('locations')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                subTab === 'locations'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sovutgich & Joylar
            </button>
          </div>

          {subTab === 'products' && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Yangi Ichimlik</span>
              <span className="sm:hidden">Qo'shish</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'locations' ? (
        /* Sovutgich va Joylar ko'rinishi */
        <WarehousesView />
      ) : (
        /* Ichimliklar Katalogi & Qoldiqlar */
        <div className="space-y-4">
          {/* Qidiruv & Kategoriya Filtrlari */}
          <div className="space-y-2.5">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ichimlik nomi yoki shtrix-kod bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
              />
            </div>

            {/* Kategoriya Chiplari */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === c
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {c === 'ALL' ? 'Barcha ichimliklar' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Mahsulotlar Ro'yxati */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-700">
              <Wine className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-800">Ichimlik topilmadi</p>
              <p className="text-xs text-slate-700 mt-1">
                Boshqa nom bilan qidiring yoki yangisini qo'shing
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              {/* Mobil Card Ko'rinishi */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isExpanded = expandedProductId === p.id;

                  return (
                    <div key={p.id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                          <span className="text-[11px] font-medium text-slate-700 px-2 py-0.5 bg-slate-100 rounded-md">
                            {p.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dona/Blok Ko'rsatkichi (Bosilganda joylashuvlar ochiladi) */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedProductId(isExpanded ? null : p.id)
                        }
                        className="w-full text-left p-2.5 bg-blue-50/70 hover:bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 font-mono">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span>{p.displayText}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                          <span>Joylar</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </button>

                      {/* Joylashuvlar (Sovutgichlar) bo'yicha taqsimot */}
                      {isExpanded && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs animate-in fade-in-50 duration-150">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                            Qaysi Sovutgichda Qancha Bor?
                          </span>
                          <div className="grid grid-cols-1 gap-1">
                            {p.subWarehouseStock && p.subWarehouseStock.length > 0 ? (
                              p.subWarehouseStock.map((sw: any) => (
                                <div
                                  key={sw.subWarehouseId}
                                  className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-100 text-xs"
                                >
                                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                                    <Refrigerator className="w-3.5 h-3.5 text-slate-400" />
                                    {sw.subWarehouseName}
                                  </span>
                                  <span
                                    className={`font-mono font-bold ${
                                      sw.quantityInUnits > 0
                                        ? 'text-blue-700'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {sw.displayText}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-700 text-[11px]">
                                Joylarga taqsimlanmagan
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                        <span className="text-slate-700">
                          Kelgan narxi: {formatMoney(p.costPrice)}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-emerald-600">
                            Dona: {formatMoney(p.sellPriceUnit)}
                          </span>
                          <span className="text-slate-600 font-semibold ml-2">
                            Blok: {formatMoney(p.sellPricePack)}
                          </span>
                        </div>
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
                      <th className="py-3 px-4">Ichimlik Nomi</th>
                      <th className="py-3 px-4">Turi</th>
                      <th className="py-3 px-4">1 Blokda</th>
                      <th className="py-3 px-4">Ombordagi Qoldiq</th>
                      <th className="py-3 px-4">Kelish / Sotish Narxi</th>
                      <th className="py-3 px-4">Blok Sotish Narxi</th>
                      <th className="py-3 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const isExpanded = expandedProductId === p.id;

                      return (
                        <React.Fragment key={p.id}>
                          <tr className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{p.name}</div>
                              {p.barcode && (
                                <div className="text-[11px] font-mono text-slate-700">
                                  {p.barcode}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                              {p.pcsPerPack} dona
                            </td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedProductId(isExpanded ? null : p.id)
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 font-mono cursor-pointer transition-colors"
                                title="Qaysi sovutgichda qancha borligini ko'rish"
                              >
                                <Package className="w-3.5 h-3.5 text-blue-600" />
                                <span>{p.displayText}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3 text-blue-600 ml-0.5" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-blue-600 ml-0.5" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs">
                              <div className="text-slate-700">
                                Kelishi: {formatMoney(p.costPrice)}
                              </div>
                              <div className="font-bold text-emerald-600">
                                Sotilishi: {formatMoney(p.sellPriceUnit)}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-indigo-600 text-xs">
                              {formatMoney(p.sellPricePack)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Tahrirlash"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({ id: p.id, name: p.name })
                                  }
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="O'chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Desktop Ochiluvchi Joylashuv Paneli */}
                          {isExpanded && (
                            <tr className="bg-slate-50/90 border-b border-slate-100">
                              <td colSpan={7} className="py-2.5 px-6">
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1">
                                    <Refrigerator className="w-3.5 h-3.5 text-indigo-600" />
                                    Joylashuvlar:
                                  </span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {p.subWarehouseStock &&
                                    p.subWarehouseStock.length > 0 ? (
                                      p.subWarehouseStock.map((sw: any) => (
                                        <div
                                          key={sw.subWarehouseId}
                                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs"
                                        >
                                          <span className="font-medium text-slate-800">
                                            {sw.subWarehouseName}:
                                          </span>
                                          <span
                                            className={`font-mono font-bold ${
                                              sw.quantityInUnits > 0
                                                ? 'text-blue-700'
                                                : 'text-slate-400'
                                            }`}
                                          >
                                            {sw.displayText}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-slate-700">
                                        Omborlarga joylashtirilmagan
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Yangi / Tahrirlash Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {editingProduct ? 'Ichimlikni Tahrirlash' : 'Yangi Ichimlik Qo\'shish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ichimlik Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Coca-Cola Classic 0.5L"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ichimlik Turi (Kategoriya)
                  </label>
                  <SelectInput
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {categories
                      .filter((c) => c !== 'ALL')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </SelectInput>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shtrix-kod (Ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    placeholder="Shtrix-kod"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* 1 Blokdagi donalar soni */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    1 Blokdagi Donalar Soni (Upakovka) *
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {formData.pcsPerPack || 1} dona
                  </span>
                </div>
                <NumberInput
                  placeholder="Masalan: 12"
                  value={formData.pcsPerPack}
                  onChange={(val) => setFormData({ ...formData, pcsPerPack: val })}
                  className="font-bold font-mono text-base bg-white"
                />
                <p className="text-[11px] text-blue-700 mt-1">
                  Savdo va xaridlarda bloklar soni avtomatik shu songa ko'paytiriladi.
                </p>
              </div>

              {/* Narxlar (Nol qotib qolmaydigan qulay NumberInput) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kelish narxi (Dona)
                  </label>
                  <NumberInput
                    placeholder="Masalan: 5000"
                    value={formData.costPrice}
                    onChange={(val) => setFormData({ ...formData, costPrice: val })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Sotish (Dona)
                  </label>
                  <NumberInput
                    placeholder="Masalan: 7000"
                    value={formData.sellPriceUnit}
                    onChange={(val) =>
                      setFormData({ ...formData, sellPriceUnit: val })
                    }
                    className="text-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Sotish (Blok)
                  </label>
                  <NumberInput
                    placeholder="Masalan: 75000"
                    value={formData.sellPricePack}
                    onChange={(val) =>
                      setFormData({ ...formData, sellPricePack: val })
                    }
                    className="text-indigo-600 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  {editingProduct ? 'Saqlash' : 'Ichimlikni Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* O'chirishni Tasdiqlash Modali (Brauzer confirm() o'rniga zamonaviy modal) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Ichimlikni O'chirish
                </h3>
                <span className="text-xs text-slate-700">Ortga qaytarib bo'lmaydi</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 mb-4">
              Haqiqatan ham <strong className="text-slate-900 font-bold">"{deleteConfirm.name}"</strong> ichimligini ro'yxatdan o'chirmoqchimisiz?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
