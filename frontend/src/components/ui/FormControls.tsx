'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string;
  onChange: (value: number) => void;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState<string>(() => {
    if (value === 0 || value === '0' || value === '' || value === undefined || value === null) {
      return '';
    }
    return String(value);
  });

  // Tashqaridan kelgan qiymat o'zgarganda faqat fokus bo'lmaganda sinxronlash
  useEffect(() => {
    if (!focused) {
      if (value === 0 || value === '0' || value === '' || value === undefined || value === null) {
        setText('');
      } else {
        setText(String(value));
      }
    }
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={
        focused
          ? text
          : value === 0 || value === '0' || value === '' || value === undefined || value === null
          ? ''
          : String(value)
      }
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onBlur={() => {
        setFocused(false);
        const cleaned = text.trim();
        if (cleaned === '' || isNaN(Number(cleaned))) {
          onChange(0);
          setText('');
        } else {
          const num = parseFloat(cleaned);
          onChange(num);
          setText(num === 0 ? '' : String(num));
        }
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        setText(raw);
        if (raw === '' || isNaN(Number(raw))) {
          onChange(0);
        } else {
          onChange(parseFloat(raw));
        }
      }}
      className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${className}`}
      {...props}
    />
  );
};

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <select
        className={`w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10 cursor-pointer shadow-2xs transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
};
