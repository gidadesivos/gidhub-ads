// Sem "server-only": este módulo também é importado pelo proxy (Edge runtime).
const DEV_FALLBACK = "dev-secret-fallback-nao-use-em-producao";

export function getSessionSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET não está definido. Configure essa variável de ambiente antes de rodar em produção."
      );
    }
    return new TextEncoder().encode(DEV_FALLBACK);
  }
  return new TextEncoder().encode(secret);
}
