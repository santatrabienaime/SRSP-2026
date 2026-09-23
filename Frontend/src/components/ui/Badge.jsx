/** Badge générique (statut, priorité, rôle…). */
export function Badge({ children, className = '', dot = false, dotClass }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotClass || 'bg-current'}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;