# Linear PR Description

A small Chrome, Firefox, and Safari extension that formats a Linear issue link
in a GitHub pull request description.

For example, pasting this Linear URL into the description:

```text
https://linear.app/revenuecat/issue/FUN-2262/fix-fill-height-discrepancies
```

turns it into:

```markdown
[linear issue FUN-2262](https://linear.app/revenuecat/issue/FUN-2262/fix-fill-height-discrepancies)
```

The conversion runs immediately after a Linear issue URL is pasted into a new
or existing pull request description. The extension preserves the rest of the
PR template or description and does not add duplicates.

## Install in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this folder.

## Install in Safari

Safari packages WebExtensions inside a small Xcode app. On a Mac with Xcode
installed, run:

```bash
npm run build:safari
```

Open the generated Xcode project under `build/LinearPRDescriptionSafari`,
choose your development team under **Signing & Capabilities**, then run the app.
Enable the extension in **Safari → Settings → Extensions**.

Before distributing it, use a bundle identifier owned by your Apple Developer
account. The build defaults to development team `5X48PFL69D` and bundle identifier
`com.jacobzivandesign.linear-pr-description`. Both can be overridden without
editing the script:

```bash
DEVELOPMENT_TEAM=YOURTEAMID \
BUNDLE_IDENTIFIER=com.yourcompany.linear-pr-description \
npm run build:safari
```

## Install in Firefox

For local testing, open `about:debugging`, choose **This Firefox**, click
**Load Temporary Add-on**, and select this project's `manifest.json`. Temporary
add-ons are removed when Firefox restarts.

To create an uploadable package, run:

```bash
npm run build:firefox
```

This creates `dist/linear-pr-description-firefox-1.0.2.zip`. Submit that archive
to [Firefox Add-ons](https://addons.mozilla.org/developers/) for signing before
normal permanent installation. The extension declares that it collects no data.

## Test

```bash
npm test
```
