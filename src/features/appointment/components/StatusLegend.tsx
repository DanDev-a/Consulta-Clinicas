const legendItems = [
  { status: 'PENDIENTE', label: 'Pendiente' },
  { status: 'CONFIRMADA', label: 'Confirmada' },
  { status: 'ATENDIDA', label: 'Atendida' },
  { status: 'CANCELADA', label: 'Cancelada' },
];

export default function StatusLegend() {
  return (
    <div className="cal-legend">
      {legendItems.map((item) => (
        <div key={item.status} className="cal-legend-item">
          <div className={`cal-legend-dot cal-legend-dot-${item.status}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
