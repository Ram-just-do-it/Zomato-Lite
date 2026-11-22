// One star shape. Filled or outline — purely visual.
export function Star({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      className={filled ? "fill-accent stroke-accent" : "fill-none stroke-line"} strokeWidth={1.5}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" strokeLinejoin="round" />
    </svg>
  );
}
