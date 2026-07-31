const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const PRTagger = require("../src/ticket.js");

test("converts a Linear URL after it is pasted into the PR description", () => {
  const listeners = new Map();
  const timers = [];
  const dispatchedEvents = [];

  class FakeTextarea {
    constructor() {
      this.currentValue = "";
    }

    get value() {
      return this.currentValue;
    }

    set value(value) {
      this.currentValue = value;
    }

    matches() {
      return true;
    }

    dispatchEvent(event) {
      dispatchedEvents.push(event.type);
    }
  }

  class FakeEvent {
    constructor(type) {
      this.type = type;
    }
  }

  const textarea = new FakeTextarea();
  const document = {
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
    querySelector() {
      return textarea;
    }
  };
  const window = {
    location: { href: "https://github.com/acme/app/pull/new/feature" },
    setTimeout(callback) {
      timers.push(callback);
      return timers.length;
    }
  };
  const context = vm.createContext({
    document,
    Event: FakeEvent,
    globalThis: null,
    HTMLTextAreaElement: FakeTextarea,
    PRTagger,
    window
  });
  context.globalThis = context;

  vm.runInContext(fs.readFileSync("src/content.js", "utf8"), context);

  const url = "https://linear.app/revenuecat/issue/FUN-2262/fix-fill-height-discrepancies";
  textarea.value = url;
  listeners.get("paste")({ target: textarea });
  listeners.get("input")({ target: textarea });

  while (timers.length) timers.shift()();

  assert.equal(textarea.value, `[linear issue FUN-2262](${url})`);
  assert.deepEqual(dispatchedEvents, ["input", "change"]);
});
