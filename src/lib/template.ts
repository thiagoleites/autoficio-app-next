function escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  
  // Substitui placeholders do tipo {{CHAVE}}.
  // Para campos de texto: escapa HTML.
  // Para campos HTML (ex: CORPO): não escapa.
  export function renderTemplate(
    templateHtml: string,
    vars: Record<string, string>,
    htmlVars: string[] = ["CORPO"]
  ) {
    return templateHtml.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_m, key) => {
      const raw = vars[key] ?? "";
      if (htmlVars.includes(key)) return raw;
      return escapeHtml(raw);
    });
  }
  