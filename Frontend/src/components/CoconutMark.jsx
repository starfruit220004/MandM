export default function CoconutMark({ size = 32, spin = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${spin ? 'animate-ring-spin' : ''} ${className}`}
    >
      <circle cx="20" cy="20" r="19" fill="var(--color-bark-900)" />
      <circle cx="20" cy="20" r="15.5" fill="var(--color-husk-700)" />
      <circle cx="20" cy="20" r="11.5" fill="var(--color-copra-200)" />
      <circle cx="20" cy="20" r="6.5" fill="var(--color-cream-50)" />
      <circle cx="20" cy="20" r="2.4" fill="var(--color-palm-600)" />
    </svg>
  );
}
