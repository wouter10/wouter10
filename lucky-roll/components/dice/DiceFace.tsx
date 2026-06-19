const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [30, 30],
    [70, 70],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [30, 30],
    [70, 30],
    [30, 70],
    [70, 70],
  ],
  5: [
    [30, 30],
    [70, 30],
    [50, 50],
    [30, 70],
    [70, 70],
  ],
  6: [
    [30, 25],
    [70, 25],
    [30, 50],
    [70, 50],
    [30, 75],
    [70, 75],
  ],
};

interface DiceFaceProps {
  value: number;
  size?: number;
  className?: string;
}

export function DiceFace({ value, size = 120, className = "" }: DiceFaceProps) {
  const positions = DOT_POSITIONS[value] ?? DOT_POSITIONS[1];
  const dotSize = Math.round(size * 0.16);

  return (
    <div
      className={`relative rounded-[22%] bg-white shadow-dice flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Dobbelsteen: ${value}`}
    >
      {positions.map(([x, y], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-surface-900"
          style={{
            width: dotSize,
            height: dotSize,
            left: `${x}%`,
            top: `${y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
