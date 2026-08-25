import { useState, createContext, useContext, type ReactNode } from 'react';
import { RiArrowUpSLine, RiArrowDownSLine, RiCheckboxBlankLine, RiCheckboxLine, RiCheckboxIndeterminateLine } from 'react-icons/ri';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

/* ─── Context ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableContextValue<T = any> {
  data: T[];
  keyField: string;
  sortKey: string | null;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  selectedRows: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  selectable: boolean;
  onRowClick?: (row: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

function useTableContext() {
  const ctx = useContext(DataTableContext);
  if (!ctx) throw new Error('DataTable compound components must be used within <DataTable>');
  return ctx;
}

/* ─── Root ─── */
interface DataTableProps<T> {
  data: T[];
  keyField?: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pagination?: ReactNode;
  children: ReactNode;
  className?: string;
}

function DataTableRoot<T extends Record<string, unknown>>({
  data,
  keyField = 'id',
  loading = false,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  onRowClick,
  selectable = false,
  selectedRows: controlledSelected,
  onSelectionChange,
  pagination,
  children,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());

  const selectedRows = controlledSelected !== undefined
    ? new Set(controlledSelected)
    : internalSelected;

  const onSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const onToggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setInternalSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const onToggleAll = () => {
    if (selectedRows.size === data.length) {
      setInternalSelected(new Set());
      onSelectionChange?.([]);
    } else {
      const all = new Set(data.map((row) => String(row[keyField])));
      setInternalSelected(all);
      onSelectionChange?.(Array.from(all));
    }
  };

  // Sort data
  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      })
    : data;

  // Extract columns from children
  const columns = (Array.isArray(children) ? children : [children]).filter(
    (child) => child && typeof child === 'object' && 'props' in child
  ) as React.ReactElement<{ sortKey?: string; header?: string; align?: string; children: (row: T) => ReactNode }>[];

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  if (loading) {
    return (
      <div className={['w-full overflow-x-auto rounded-xl border border-[var(--color-border-light)]', className].join(' ')}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-surface)]">
              {selectable && <th className="w-10 px-4 py-3" />}
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider"
                >
                  {col.props.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--color-border-light)]">
                {selectable && <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-[var(--color-surface-alt)] animate-pulse" /></td>}
                {columns.map((_, ci) => (
                  <td key={ci} className="px-4 py-3">
                    <div className="h-4 rounded bg-[var(--color-surface-alt)] animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-[var(--color-border-light)]">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <DataTableContext.Provider
      value={{ data: sortedData, keyField, sortKey, sortDir, onSort, selectedRows, onToggleRow, onToggleAll, selectable, onRowClick }}
    >
      <div className={['w-full', className].join(' ')}>
        <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border-light)]">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-surface)]">
                {selectable && (
                  <th className="w-10 px-4 py-3">
                    <button
                      type="button"
                      onClick={onToggleAll}
                      aria-label={allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                      className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                    >
                      {allSelected ? (
                        <RiCheckboxLine size={18} className="text-[var(--color-accent)]" />
                      ) : someSelected ? (
                        <RiCheckboxIndeterminateLine size={18} className="text-[var(--color-accent)]" />
                      ) : (
                        <RiCheckboxBlankLine size={18} />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((col, i) => {
                  const sk = col.props.sortKey;
                  const isActive = sortKey === sk;
                  return (
                    <th
                      key={i}
                      className={[
                        'px-4 py-3 text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider',
                        col.props.align === 'center' ? 'text-center' : col.props.align === 'right' ? 'text-right' : 'text-left',
                        sk ? 'cursor-pointer select-none hover:text-[var(--color-text)]' : '',
                      ].join(' ')}
                      onClick={sk ? () => onSort(sk) : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.props.header}
                        {sk && (
                          <span className="inline-flex flex-col -space-y-1">
                            <RiArrowUpSLine
                              size={12}
                              className={isActive && sortDir === 'asc' ? 'text-[var(--color-accent)]' : 'opacity-30'}
                            />
                            <RiArrowDownSLine
                              size={12}
                              className={isActive && sortDir === 'desc' ? 'text-[var(--color-accent)]' : 'opacity-30'}
                            />
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, ri) => {
                const rowId = String(row[keyField]);
                const isSelected = selectedRows.has(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                      'border-b border-[var(--color-border-light)] transition-colors',
                      ri % 2 === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-surface)]',
                      onRowClick ? 'cursor-pointer hover:bg-[var(--color-accent-soft)]' : '',
                      isSelected ? 'bg-[var(--color-accent-soft)]' : '',
                    ].join(' ')}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onToggleRow(rowId); }}
                          aria-label={isSelected ? 'Deseleccionar fila' : 'Seleccionar fila'}
                          className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                        >
                          {isSelected ? (
                            <RiCheckboxLine size={18} className="text-[var(--color-accent)]" />
                          ) : (
                            <RiCheckboxBlankLine size={18} />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col, ci) => (
                      <td
                        key={ci}
                        className={[
                          'px-4 py-3 text-sm text-[var(--color-text)]',
                          col.props.align === 'center' ? 'text-center' : col.props.align === 'right' ? 'text-right' : '',
                        ].join(' ')}
                      >
                        {col.props.children(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pagination && <div className="mt-3 flex justify-end">{pagination}</div>}
      </div>
    </DataTableContext.Provider>
  );
}

/* ─── Column ─── */
interface ColumnProps<T> {
  header: string;
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
  children: (row: T) => ReactNode;
}

// Column is a placeholder — actual rendering is done in DataTableRoot
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Column<T>(_props: ColumnProps<T>) {
  return null;
}

/* ─── Composed ─── */
const DataTable = Object.assign(DataTableRoot, {
  Column,
});

export default DataTable;
