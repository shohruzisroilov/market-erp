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
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/utils';
import { Product } from '@/types';
import { useToast } from './Toast';
import { NumberInput, SelectInput } from './ui/FormControls';

export const ProductsView: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form (Bo'sh qolishi va oson o'zgarishi uchun)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Gazlangan ichimliklar',
    barcode: '',
    pcsPerPack: 12,
    costPrice: 5000,
    sellPriceUnit: 7000,
    sellPricePack: 75000,
    minStockAlert: 24,
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
      toast(e.message || 'Ichimliklarni yuklashda xatolik', 'error');
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

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Rostdan ham "${name}" ichimligini o'chirmoqchimisiz?`)) {
      try {
        await api.deleteProduct(id);
        toast(`"${name}" o'chirildi`, 'info');
        loadProducts();
      } catch (err: any) {
        toast(err.message || 'O\'chirishda xatolik', 'error');
      }
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
      {/* Sarlavha & Yangi Mahsulot Tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wine className="w-5 h-5 text-blue-600" />
            Ichimliklar Ro'yxati & Qoldiqlar
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Dona va blok hisobi, kelgan narxi hamda sotish bahosi
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Ichimlik Qo'shish</span>
        </button>
      </div>

      {/* Qidiruv & Kategoriya Filtrlari */}
      <div className="space-y-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Ichimlik nomi yoki shtrix-kodini yozing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Barcha ichimliklar' : cat}
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
          <p className="text-xs text-slate-700 mt-1">Boshqa nom bilan qidiring yoki yangisini qo'shing</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Mobil Card Ko'rinishi */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filteredProducts.map((p) => (
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
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dona/Blok Ko'rsatkichi */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 font-mono">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>{p.displayText}</span>
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium">
                    1 blok = {p.pcsPerPack} dona
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                  <span className="text-slate-700">Kelgan narxi: {formatMoney(p.costPrice)}</span>
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
            ))}
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
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
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
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 font-mono">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>{p.displayText}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="text-slate-700">Kelishi: {formatMoney(p.costPrice)}</div>
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
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mahsulot Qo'shish / Tahrirlash Modali (Yangi qulay NumberInput va SelectInput bilan) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {editingProduct ? 'Ichimlikni Tahrirlash' : 'Yangi Ichimlik Qo\'shish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* 1 Blokdagi donalar soni (Qulay NumberInput) */}
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
                  Tovarlar kelganda yoki sotilganda avtomatik shu raqam orqali blokga aylanadi.
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
                    onChange={(val) => setFormData({ ...formData, sellPriceUnit: val })}
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
                    onChange={(val) => setFormData({ ...formData, sellPricePack: val })}
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
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Saqlash' : 'Ichimlikni Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
