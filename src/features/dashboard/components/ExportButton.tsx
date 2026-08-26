import { useState } from 'react';
import { RiDownloadLine } from 'react-icons/ri';

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename: string;
  label?: string;
}

export default function ExportButton({ data, filename, label = 'Exportar CSV' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (data.length === 0) return;
    setExporting(true);

    try {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers.map((h) => {
            const val = row[h];
            const str = val === null || val === undefined ? '' : String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          }).join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || data.length === 0}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
        bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]
        hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200"
    >
      <RiDownloadLine />
      {exporting ? 'Exportando...' : label}
    </button>
  );
}
