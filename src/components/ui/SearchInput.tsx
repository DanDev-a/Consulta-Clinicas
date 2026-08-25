import { useState, useEffect, useRef, type InputHTMLAttributes } from 'react';
import { RiSearchLine } from 'react-icons/ri';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export default function SearchInput({
  placeholder = 'Buscar...',
  onSearch,
  debounceMs = 300,
  value: controlledValue,
  className = '',
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(val);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <RiSearchLine
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
        aria-hidden="true"
      />
      <input
        type="search"
        role="searchbox"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className={[
          'w-full rounded-lg border pl-10 pr-3 py-2.5',
          'bg-[var(--color-input-bg)] text-[var(--color-text)]',
          'border-[var(--color-input-border)]',
          'placeholder:text-[var(--color-text-subtle)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
