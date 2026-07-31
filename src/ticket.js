(function (root, factory) {
  const api = factory();

  root.PRTagger = api;

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  const TICKET_PATTERN = /(?:^|[^A-Z0-9])([A-Z][A-Z0-9]{1,9}-\d+)(?=$|[^A-Z0-9])/i;

  function normalizeTicket(ticket) {
    return ticket ? ticket.toUpperCase() : null;
  }

  function ticketFromText(text) {
    const match = String(text || "").match(TICKET_PATTERN);
    return match ? normalizeTicket(match[1]) : null;
  }

  function ticketFromCompareUrl(url) {
    let parsed;

    try {
      parsed = new URL(url);
    } catch (_error) {
      return null;
    }

    const compareMarker = "/compare/";
    const markerIndex = parsed.pathname.indexOf(compareMarker);
    if (markerIndex === -1) return null;

    const comparison = decodeURIComponent(
      parsed.pathname.slice(markerIndex + compareMarker.length)
    );
    const head = comparison.includes("...")
      ? comparison.slice(comparison.lastIndexOf("...") + 3)
      : comparison;

    return ticketFromText(head);
  }

  function ticketFromLinearUrl(url) {
    let parsed;

    try {
      parsed = new URL(url, "https://github.com");
    } catch (_error) {
      return null;
    }

    if (!/(^|\.)linear\.app$/i.test(parsed.hostname)) return null;
    return ticketFromText(decodeURIComponent(parsed.pathname));
  }

  function formatDescription(description, ticket, linearUrl) {
    const originalDescription = String(description || "");
    const normalizedTicket = normalizeTicket(ticket);

    if (!normalizedTicket) return originalDescription;

    const escapedTicket = normalizedTicket.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingLine = new RegExp(
      `^\\s*linear\\s+issue\\s*:?\\s*${escapedTicket}\\s*$`,
      "im"
    );

    if (linearUrl) {
      const canonicalUrl = String(linearUrl).replace(/[.,;:!?]+$/, "");
      const escapedUrl = canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const linkedIssue = `[linear issue ${normalizedTicket}](${canonicalUrl})`;
      const existingMarkdownLink = new RegExp(
        `\\[[^\\]\\n]*\\]\\(${escapedUrl}\\)`,
        "i"
      );

      const hasMarkdownLink = existingMarkdownLink.test(originalDescription);
      let nextDescription = hasMarkdownLink
        ? originalDescription.replace(existingMarkdownLink, linkedIssue)
        : originalDescription.replace(canonicalUrl, linkedIssue);

      if (nextDescription.includes(linkedIssue)) {
        nextDescription = nextDescription
          .replace(existingLine, "")
          .replace(/\n{3,}/g, "\n\n")
          .trimEnd();
      }

      return nextDescription;
    }

    if (existingLine.test(originalDescription)) return originalDescription;

    const line = `linear issue ${normalizedTicket}`;
    const cleanDescription = originalDescription.trimEnd();
    if (!cleanDescription) return line;

    return `${cleanDescription}\n\n${line}`;
  }

  return {
    formatDescription,
    ticketFromCompareUrl,
    ticketFromLinearUrl,
    ticketFromText
  };
});
