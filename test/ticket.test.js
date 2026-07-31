const test = require("node:test");
const assert = require("node:assert/strict");
const {
  formatDescription,
  ticketFromCompareUrl,
  ticketFromLinearUrl,
  ticketFromText
} = require("../src/ticket.js");

test("extracts a ticket from common branch names", () => {
  assert.equal(ticketFromText("feature/eng-123-fix-login"), "ENG-123");
  assert.equal(ticketFromText("JIRA2-900/do-the-thing"), "JIRA2-900");
});

test("extracts the ticket from the head side of a compare URL", () => {
  assert.equal(
    ticketFromCompareUrl("https://github.com/acme/app/compare/main...eng-42-new-nav?expand=1"),
    "ENG-42"
  );
  assert.equal(
    ticketFromCompareUrl("https://github.com/acme/app/compare/release-123...feature/no-ticket"),
    null
  );
});

test("only extracts Linear links from linear.app", () => {
  assert.equal(
    ticketFromLinearUrl("https://linear.app/acme/issue/WEB-88/better-header"),
    "WEB-88"
  );
  assert.equal(ticketFromLinearUrl("https://example.com/WEB-88"), null);
});

test("adds the ticket to an empty description", () => {
  assert.equal(formatDescription("", "eng-123"), "linear issue ENG-123");
});

test("appends the ticket after existing description content", () => {
  assert.equal(
    formatDescription("## Summary\n\nFixes login.", "ENG-123"),
    "## Summary\n\nFixes login.\n\nlinear issue ENG-123"
  );
});

test("does not add an existing Linear issue line twice", () => {
  assert.equal(
    formatDescription("Fixes login.\n\nlinear issue ENG-123", "ENG-123"),
    "Fixes login.\n\nlinear issue ENG-123"
  );
});

test("turns a pasted Linear URL into a labeled Markdown link", () => {
  const url = "https://linear.app/revenuecat/issue/FUN-2262/fix-fill-height-discrepancies";
  assert.equal(
    formatDescription(`Fixes layout.\n\n${url}`, "FUN-2262", url),
    `Fixes layout.\n\n[linear issue FUN-2262](${url})`
  );
});

test("replaces a plain fallback when a Linear URL is pasted later", () => {
  const url = "https://linear.app/revenuecat/issue/FUN-2262/fix-fill-height-discrepancies";
  assert.equal(
    formatDescription(`Fixes layout.\n\n${url}\n\nlinear issue FUN-2262`, "FUN-2262", url),
    `Fixes layout.\n\n[linear issue FUN-2262](${url})`
  );
});

test("normalizes an existing Markdown link label without nesting links", () => {
  const url = "https://linear.app/revenuecat/issue/FUN-2262/fix-fill-height-discrepancies";
  assert.equal(
    formatDescription(`[ticket](${url})`, "FUN-2262", url),
    `[linear issue FUN-2262](${url})`
  );
});

test("keeps the formatted Markdown link unchanged across repeated input events", () => {
  const url = "https://linear.app/revenuecat/issue/FUN-2262/fix-fill-height-discrepancies";
  const expected = `[linear issue FUN-2262](${url})`;
  let description = url;

  for (let update = 0; update < 5; update += 1) {
    description = formatDescription(description, "FUN-2262", url);
  }

  assert.equal(description, expected);
});
