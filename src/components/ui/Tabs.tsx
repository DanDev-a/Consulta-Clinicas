import { useState, createContext, useContext, type ReactNode } from 'react';
import type { IconType } from 'react-icons';

/* ─── Context ─── */
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
}

/* ─── Root ─── */
interface TabsProps {
  defaultActiveTab: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

function TabsRoot({ defaultActiveTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultActiveTab);

  const setActiveTab = (value: string) => {
    setActiveTabState(value);
    onChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

/* ─── TabList ─── */
interface TabListProps {
  children: ReactNode;
  className?: string;
}

function TabList({ children, className = '' }: TabListProps) {
  return (
    <div
      role="tablist"
      className={[
        'flex gap-1 border-b border-[var(--color-border-light)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/* ─── Tab ─── */
interface TabProps {
  value: string;
  label: string;
  icon?: IconType;
  disabled?: boolean;
}

function Tab({ value, label, icon: Icon, disabled = false }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={[
        'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
        isActive
          ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      {label}
    </button>
  );
}

/* ─── TabPanel ─── */
interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

function TabPanel({ value, children, className = '' }: TabPanelProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={['py-4 focus:outline-none', className].join(' ')}
    >
      {children}
    </div>
  );
}

/* ─── Composed ─── */
const Tabs = Object.assign(TabsRoot, {
  List: TabList,
  Tab,
  Panel: TabPanel,
});

export default Tabs;
