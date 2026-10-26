/** Biểu tượng Âm Dương (thái cực), vẽ trong hệ toạ độ tâm (0,0) bán kính `r`. */
export function AmDuongPath({ r = 50 }: { r?: number }) {
  const h = r / 2;
  return (
    <g>
      <circle r={r} fill="#0b1020" stroke="#d4a85a" strokeWidth={r / 40} />
      <path d={`M0,${-r} A${r},${r} 0 0,1 0,${r} A${h},${h} 0 0,1 0,0 A${h},${h} 0 0,0 0,${-r} Z`} fill="#d4a85a" />
      <circle cy={-h} r={r / 7} fill="#d4a85a" />
      <circle cy={h} r={r / 7} fill="#0b1020" />
    </g>
  );
}

export function AmDuong({ className }: { className?: string }) {
  return (
    <svg viewBox="-52 -52 104 104" className={className} aria-hidden>
      <AmDuongPath />
    </svg>
  );
}
