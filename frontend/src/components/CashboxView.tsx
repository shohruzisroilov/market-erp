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
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = useState('');
  const [type, setType] = useState('EXPENSE_TRANSPORT');
  const [amount, setAmount] = useState<number>(30000);
  const [partyName, setPartyName] = useState('');
  const [note, setNote] = useState('');

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
      handleOpenModal('EXPENSE_TRANSPORT');
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

  const handleOpenModal = (presetType = 'EXPENSE_TRANSPORT') => {
    setType(presetType);
    setAmount(presetType === 'EXPENSE_TRANSPORT' ? 30000 : 100000);
    setPartyName('');
    setNote('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCashTransaction({
        cashRegisterId: selectedRegisterId,
        type,
        amount: Number(amount),
        partyName: partyName || undefined,
        note: note || undefined,
      });
      toast('Tranzaksiya muvaffaqiyatli bajarildi', 'success');
      setIsModalOpen(false);
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      toast(err.message || 'Tranzaksiyani bajarishda xatolik', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Sarlavha & Tezkor Tugmalar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Kassa, Xarajatlar & Qarzlar
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Yo'l kira, ijara, maosh va qarz harakatlarini aniq qayd qilish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('EXPENSE_TRANSPORT')}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Yo'l Kira Kiritish</span>
          </button>

          <button
            onClick={() => handleOpenModal('DEBT_GIVEN')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Qarz Berish/Olish</span>
          </button>
        </div>
      </div>

      {/* Kassalar & Qarzdorlik Balansi Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Jami Mavjud Kassa
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {formatMoney(totalBalance)}
          </div>
          <div className="text-[11px] text-slate-700 mt-1">
            Naqd + Karta terminali
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Mijozlar Qarzi (Debitorlik)
          </span>
          <div className="text-2xl font-black font-mono text-blue-600 mt-1">
            +{formatMoney(totalReceivable)}
          </div>
          <div className="text-[11px] text-slate-700 mt-1">Bizga to'lanishi kerak</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Bizning Qarz (Kreditorlik)
          </span>
          <div className="text-2xl font-black font-mono text-rose-600 mt-1">
            -{formatMoney(totalPayable)}
          </div>
          <div className="text-[11px] text-slate-700 mt-1">Yetkazib beruvchilarga</div>
        </div>
      </div>

      {/* Operatsiyalar va Qarzdorlar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kassa Operatsiyalari Jurnali */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Oxirgi Kassa Harakatlari
            </h3>
            <span className="text-xs text-slate-700 font-medium">
              {transactions.length} ta yozuv
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const info = typeConfig[tx.type] || {
                label: tx.type,
                icon: HelpCircle,
                color: 'text-slate-600 bg-slate-100',
              };
              const Icon = info.icon;
              const isIncome = tx.direction === 'IN';

              return (
                <div
                  key={tx.id}
                  className="p-3 sm:p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${info.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{info.label}</div>
                      <div className="text-[11px] text-slate-700">
                        {tx.partyName ? `${tx.partyName} • ` : ''}
                        {tx.note || tx.cashRegister?.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono font-bold text-xs sm:text-sm ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                    </div>
                    <div className="text-[10px] text-slate-700">
                      {new Date(tx.createdAt).toLocaleTimeString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nasiyadorlar Ro'yxati */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Qarzdorlar Daftari
            </h3>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {counterparties.map((cp) => {
              const isDebtor = cp.balance > 0;
              const isCreditor = cp.balance < 0;

              return (
                <div
                  key={cp.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cp.name}</span>
                    <span
                      className={`font-mono font-bold ${
                        isDebtor
                          ? 'text-emerald-600'
                          : isCreditor
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {isDebtor
                        ? `+${formatMoney(cp.balance)}`
                        : isCreditor
                        ? `-${formatMoney(Math.abs(cp.balance))}`
                        : '0 so\'m'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    {cp.phone || (isDebtor ? 'Do\'kondan qarzdor' : 'Yetkazib beruvchi')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tranzaksiya Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Kassa Kirim / Chiqim Amali
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operatsiya Turi *
                </label>
                <SelectInput
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="font-semibold"
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
                  Kassa
                </label>
                <SelectInput
                  value={selectedRegisterId}
                  onChange={(e) => setSelectedRegisterId(e.target.value)}
                >
                  {registers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({formatMoney(r.balance)})
                    </option>
                  ))}
                </SelectInput>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Summa (so'mda) *
                </label>
                <NumberInput
                  placeholder="Masalan: 50 000"
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  className="w-full text-base font-bold font-mono"
                />
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Izoh
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Gazlangan ichimliklar tashish xarajati"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
