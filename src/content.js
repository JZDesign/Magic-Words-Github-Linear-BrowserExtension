(function () {
  "use strict";

  const DESCRIPTION_SELECTOR = [
    'textarea[name="pull_request[body]"]',
    "#pull_request_body",
    'textarea[aria-label*="description" i]',
    'textarea[placeholder*="description" i]'
  ].join(", ");

  let scheduled = false;
  let pendingTextarea = null;
  let lastUrl = window.location.href;

  function descriptionTextarea() {
    return document.querySelector(DESCRIPTION_SELECTOR);
  }

  function linearIssueFromDescription() {
    const body = descriptionTextarea();
    if (!body) return null;

    const urls = String(body.value || "").match(/https?:\/\/[^\s<>()]+/g) || [];
    for (const url of urls) {
      const ticket = PRTagger.ticketFromLinearUrl(url);
      if (ticket) return { ticket, url };
    }

    return null;
  }

  function setNativeValue(textarea, value) {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    );

    descriptor.set.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function updateDescription() {
    scheduled = false;

    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
    }

    const textarea = pendingTextarea || descriptionTextarea();
    pendingTextarea = null;
    if (!textarea) return;

    const issue = linearIssueFromDescription();
    if (!issue) return;

    const nextDescription = PRTagger.formatDescription(
      textarea.value,
      issue.ticket,
      issue.url
    );
    if (nextDescription !== textarea.value) {
      setNativeValue(textarea, nextDescription);
    }
  }

  function scheduleUpdate(textarea) {
    if (textarea?.matches?.(DESCRIPTION_SELECTOR)) {
      pendingTextarea = textarea;
    }
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(updateDescription, 100);
  }

  document.addEventListener("turbo:load", scheduleUpdate);
  document.addEventListener("pjax:end", scheduleUpdate);
  document.addEventListener("input", function (event) {
    if (event.target.matches?.(DESCRIPTION_SELECTOR)) scheduleUpdate(event.target);
  });
  document.addEventListener("paste", function (event) {
    if (event.target.matches?.(DESCRIPTION_SELECTOR)) scheduleUpdate(event.target);
  });
  window.setTimeout(scheduleUpdate, 0);
  window.setTimeout(scheduleUpdate, 750);
  window.setTimeout(scheduleUpdate, 2000);
})();
