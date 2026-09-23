type Props = {
  status: "online" | "degraded" | "offline";
  title?: string;
  detail?: string;
  onOpen?: () => void;
};

export function CompactOperationalAlert({ status, title, detail, onOpen }: Props) {
  if (status === "online") return null;
  const label = title ?? (status === "offline" ? "API de Produção Offline" : "Serviço degradado");
  return (
    <button
      type="button"
      onClick={onOpen}
      title={detail}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, minHeight: 34,
        padding: "6px 10px", borderRadius: 9,
        border: "1px solid rgba(245,158,11,.35)",
        background: "rgba(245,158,11,.09)", color: "inherit", cursor: "pointer"
      }}
    >
      <span aria-hidden="true">●</span>
      <strong style={{fontSize: 12}}>{label}</strong>
      {detail && <span style={{fontSize: 11, opacity: .72}}>Ver detalhes</span>}
    </button>
  );
}
