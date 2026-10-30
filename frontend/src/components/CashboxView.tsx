'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Building,
  UserCheck,
  Zap,
  HelpCircle,
  Users,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
  Phone,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/utils';
import { CashRegister, CashTransaction, Counterparty } from '@/types';
import { useToast } from './Toast';
import { NumberInput, SelectInput } from './ui/FormControls';

interface CashboxViewProps {
  onRefreshGlobal?: () => void;
  quickExpenseTrigger?: boolean;
}

export const CashboxView: React.FC<CashboxViewProps> = ({
  onRefreshGlobal,
  quickExpenseTrigger,
}) => {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<'transactions' | 'debts'>('transactions');
  const [debtFilter, setDebtFilter] = useState<'ALL' | 'CUSTOMERS' | 'SUPPLIERS'>('ALL');
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = useState('');
  const [type, setType] = useState('EXPENSE_TRANSPORT');
  const [amount, setAmount] = useState<number>(20000);
  const [partyName, setPartyName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
    SALE_INCOME: { label: 'Savdo tushumi', icon: ArrowUpRight, color: 'text-emerald-600 bg-emerald-50' },
    PURCHASE_PAYMENT: { label: 'Xarid to\'lovi', icon: ArrowDownRight, color: 'text-rose-600 bg-rose-50' },
    EXPENSE_TRANSPORT: { label: 'Yo\'l kira / Logistika', icon: Truck, color: 'text-amber-600 bg-amber-50' },
    EXPENSE_RENT: { label: 'Ijara to\'lovi', icon: Building, color: 'text-purple-600 bg-purple-50' },
    EXPENSE_SALARY: { label: 'Xodimlar maoshi', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50' },
    EXPENSE_UTILITIES: { label: 'Kommunal to\'lov', icon: Zap, color: 'text-cyan-600 bg-cyan-50' },
    EXPENSE_OTHER: { label: 'Boshqa xarajat', icon: HelpCircle, color: 'text-slate-600 bg-slate-100' },
    DEBT_GIVEN: { label: 'Qarz berish (Chiqim)', icon: ArrowDownRight, color: 'text-orange-600 bg-orange-50' },
    DEBT_COLLECTED: { label: 'Qarz qaytishi (Kirim)', icon: ArrowUpRight, color: 'text-teal-600 bg-teal-50' },
    DEBT_TAKEN: { label: 'Qarz olish (Kirim)', icon: ArrowUpRight, color: 'text-blue-600 bg-blue-50' },
    DEBT_REPAID: { label: 'Olingan qarzni to\'lash', icon: ArrowDownRight, color: 'text-rose-600 bg-rose-50' },
    OTHER_INCOME: { label: 'Boshqa kirim', icon: ArrowUpRight, color: 'text-emerald-600 bg-emerald-50' },
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (quickExpenseTrigger) {
      handleOpenModal('EXPENSE_TRANSPORT', 20000, '', 'Haydovchiga yo\'l kira');
    }
  }, [quickExpenseTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regData, txData, cpData] = await Promise.all([
        api.getCashRegisters(),
        api.getCashTransactions(),
        api.getCounterparties(),
      ]);
      setRegisters(regData.registers);
      setTotalBalance(regData.totalBalance);
      setTransactions(txData);
      setCounterparties(cpData.counterparties);
      setTotalReceivable(cpData.totalReceivable);
      setTotalPayable(cpData.totalPayable);
      if (regData.registers.length > 0) {
        setSelectedRegisterId(regData.registers[0].id);
      }
    } catch (e: any) {
      toast(e.message || 'Kassa ma\'lumotlarini yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (
    presetType = 'EXPENSE_TRANSPORT',
    presetAmount = 20000,
    presetParty = '',
    presetNote = '',
  ) => {
    setType(presetType);
    setAmount(presetAmount);
    setPartyName(presetParty);
    setNote(presetNote);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast('To\'g\'ri summa kiriting', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createCashTransaction({
        cashRegisterId: selectedRegisterId,
        type,
        amount,
        partyName: partyName.trim() || undefined,
        note: note.trim() || undefined,
      });

      toast('Amal muvaffaqiyatli saqlandi!', 'success');
      setIsModalOpen(false);
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      toast(err.message || 'Tranzaksiya bajarilmadi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCounterparties = counterparties.filter((cp) => {
    if (debtFilter === 'CUSTOMERS') return cp.balance > 0;
    if (debtFilter === 'SUPPLIERS') return cp.balance < 0;
    return true;
  });

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha & Tezkor Chiqim Tugmalari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Kassa & Xarajatlar Daftari
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Naqd pul va karta hisobi, yo'l kira xarajatlari hamda qarz munosabatlari
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() =>
              handleOpenModal(
                'EXPENSE_TRANSPORT',
                20000,
                '',
                'Laboga yo\'l kira',
              )
            }
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>+ Yo'l kira kiritish</span>
          </button>

          <button
            onClick={() => handleOpenModal('EXPENSE_OTHER', 50000)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kirim / Chiqim</span>
          </button>
        </div>
      </div>

      {/* Kassa Balanslari & Qarzlar Xulosasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Jami Kassa */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>KASSADAGI JAMI PUL</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-2">
            {formatMoney(totalBalance)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            {registers.map((r) => (
              <span key={r.id} className="font-mono text-[11px]">
                {r.name}: <strong>{formatMoney(r.balance)}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Mijozlar Qarzi */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>MIJOZLAR QARZI (BIZGA)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-700 mt-2">
            +{formatMoney(totalReceivable)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
            Mijozlarimizdan kutilayotgan nasiyalar
          </div>
        </div>

        {/* Bizning Qarzimiz */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>BIZNING QARZIMIZ (ZAVODGA)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 mt-2">
            -{formatMoney(totalPayable)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
            Yetkazib beruvchilarga to'lanishi kerak
          </div>
        </div>
      </div>

      {/* Tablar: Kassa Harakatlari vs Qarzlar Kitobi */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('transactions')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            subTab === 'transactions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Kassa Harakatlari (Kirim-Chiqim)
        </button>

        <button
          onClick={() => setSubTab('debts')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            subTab === 'debts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Qarzlar Kitobi (Mijozlar & Firmalar)
        </button>
      </div>

      {subTab === 'transactions' ? (
        /* Kassa Tranzaksiyalari Ro'yxati */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Barcha Pul Harakatlari
            </span>
            <span className="text-xs text-slate-700">
              Jami: {transactions.length} ta operatsiya
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Amal Turi</th>
                  <th className="py-3 px-4">Kassa</th>
                  <th className="py-3 px-4">Kimga / Kimdan</th>
                  <th className="py-3 px-4">Izoh</th>
                  <th className="py-3 px-4 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const cfg = typeConfig[tx.type] || {
                    label: tx.type,
                    icon: DollarSign,
                    color: 'text-slate-600 bg-slate-50',
                  };
                  const Icon = cfg.icon;
                  const isIncome = tx.direction === 'IN';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${cfg.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {cfg.label}
                            </div>
                            <div className="text-[10px] text-slate-700">
                              {new Date(tx.createdAt).toLocaleDateString('uz-UZ', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {tx.cashRegister?.name}
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {tx.partyName || '—'}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-700 max-w-xs truncate">
                        {tx.note || '—'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-xs sm:text-sm">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Qarzlar Kitobi */
        <div className="space-y-4">
          {/* Filtr Chiplari */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDebtFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                debtFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Barcha Hamkorlar
            </button>
            <button
              onClick={() => setDebtFilter('CUSTOMERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                debtFilter === 'CUSTOMERS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Mijozlarimiz (Bizga Qarzdorlar)
            </button>
            <button
              onClick={() => setDebtFilter('SUPPLIERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                debtFilter === 'SUPPLIERS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Yetkazuvchilar (Biz Qarzdormiz)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCounterparties.map((cp) => {
              const isReceivable = cp.balance > 0;
              const isPayable = cp.balance < 0;

              return (
                <div
                  key={cp.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cp.name}</h4>
                      {cp.phone && (
                        <span className="text-[11px] text-slate-700 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {cp.phone}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isReceivable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isPayable
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isReceivable
                        ? 'Bizga qarzdor'
                        : isPayable
                        ? 'Biz qarzdormiz'
                        : 'Hisob yopiq'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-700 font-medium">Balans:</span>
                    <span
                      className={`text-base font-black font-mono ${
                        isReceivable
                          ? 'text-emerald-600'
                          : isPayable
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {isReceivable
                        ? `+${formatMoney(cp.balance)}`
                        : isPayable
                        ? `-${formatMoney(Math.abs(cp.balance))}`
                        : '0 so\'m'}
                    </span>
                  </div>

                  {/* Tezkor To'lov / Qarz qaytarish tugmasi */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isReceivable) {
                        handleOpenModal(
                          'DEBT_COLLECTED',
                          Math.abs(cp.balance),
                          cp.name,
                          'Qarz qaytarildi',
                        );
                      } else {
                        handleOpenModal(
                          'DEBT_REPAID',
                          Math.abs(cp.balance),
                          cp.name,
                          'Zavodga qarz to\'landi',
                        );
                      }
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition-colors"
                  >
                    {isReceivable ? 'Qarzni qabul qilish' : 'Qarzni to\'lash'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tranzaksiya Modali (Tezkor Chiplar Bilan) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Kassa Kirim / Chiqim Amali
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operatsiya Turi *
                </label>
                <SelectInput
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="font-semibold text-xs"
                >
                  <optgroup label="Operatsion Xarajatlar (Sof foydadan ayriladi)">
                    <option value="EXPENSE_TRANSPORT">Yo'l kira / Logistika (Transport)</option>
                    <option value="EXPENSE_RENT">Do'kon / Ombor ijarasi</option>
                    <option value="EXPENSE_SALARY">Xodimlar maoshi</option>
                    <option value="EXPENSE_UTILITIES">Kommunal to'lovlar</option>
                    <option value="EXPENSE_OTHER">Boshqa operatsion xarajat</option>
                  </optgroup>
                  <optgroup label="Qarzlar (Kassa aylanmasi)">
                    <option value="DEBT_GIVEN">Qarz berish (Chiqim)</option>
                    <option value="DEBT_COLLECTED">Berilgan qarzning qaytishi (Kirim)</option>
                    <option value="DEBT_TAKEN">Qarz olish (Kirim)</option>
                    <option value="DEBT_REPAID">Olingan qarzni to'lash (Chiqim)</option>
                  </optgroup>
                  <optgroup label="Boshqa">
                    <option value="OTHER_INCOME">Boshqa operatsion daromad</option>
                  </optgroup>
                </SelectInput>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qaysi Kassadan? *
                </label>
                <SelectInput
                  value={selectedRegisterId}
                  onChange={(e) => setSelectedRegisterId(e.target.value)}
                  className="text-xs"
                >
                  {registers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({formatMoney(r.balance)})
                    </option>
                  ))}
                </SelectInput>
              </div>

              {/* Summa & Tezkor Chiplar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Summa (so'mda) *
                  </label>
                </div>
                <NumberInput
                  placeholder="Masalan: 20 000"
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  className="w-full text-base font-bold font-mono"
                />
                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto scrollbar-none">
                  {[10000, 20000, 30000, 50000, 100000, 200000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer shrink-0 font-mono"
                    >
                      +{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kimga / Kimdan
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Haydovchi Akmal"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Izoh (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Gazlangan ichimliklar tashish xarajati"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
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
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Tasdiqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
