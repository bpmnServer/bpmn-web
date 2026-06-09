# bpmn-web — Tier 2/3 cleanup notes

## Modeler view refactor (Tier 2)
- ~300 lines of duplicated inline HTML (two `getText()` blobs in `Modeler-noProp.ts` /
  `Modeler-wProp.ts`) → one parameterized `views/modeler.pug` (`withProps` / `cspHost`).
- The two classes are now thin stateless renderers calling `response.render('modeler', …)`,
  keeping their exact signatures (model.ts untouched).
- **Bug fixed**: `Modeler-noProp` held `xml/title/processName` in module-level mutable state —
  concurrent modeler requests clobbered each other. Rendering is now stateless.
- Dead files removed: `Modeller.ts`, `Modeller.pug`, `Modeller.js.bu` (double-l; unused).
- Verified: build clean; pug renders both variants; classes assert-tested via mock response.

## Pug layout consolidation (Tier 2/3)
- 4 layouts (`layout`, `layoutHome`, `layoutDocs`, `user/layout`) were ~90% identical:
  235 lines → 40, plus shared `base.pug` (20) + `includes/head.pug` (21) + `includes/flash.pug` (11).
- Each layout now `extends base` and overrides `block nav` / `block head` / `block title`.
- **Bug fixed**: `includes/nav.pug` and `user/nav.pug` each emitted their own `#navbarCollapse`
  wrapper while the layout also wrapped them → duplicated id. Navs normalized to bare `ul`
  lists; `base` owns the single wrapper. Verified `#navbarCollapse` now renders exactly once.
- Verified: all 54 pug templates compile; representative children (login→layout, docs→layoutDocs)
  render correctly with blocks resolving and no cross-layout `block head` leakage.

## Client JS (Tier 3, surgical)
- `workflow.js`: fixed `File==null` typo (should be `file` — `File` is the global File API,
  always truthy); fixed undefined `startDate` in `dateDiff` (produced NaN) → `Date.now()`;
  declared leaked globals (`itemId`, `url`); removed two dead commented blocks. Parses clean.
- Deliberately NOT rewritten: `processEditor.js` (1999 lines), `jsonHelper.js`, `descriptions.js`,
  `caseView.js`, `SVGHelper.js`. They are functional jQuery with no large dead code; meaningful
  changes are behavior-affecting and cannot be runtime-verified here (no browser). All parse clean.
- `modeller-withPropertyPanel.js` (89k lines) is the bundled bpmn-js — vendored, left untouched.

## Findings to decide on (NOT auto-fixed — would change behavior unverifiably)
- **Missing script**: the no-property-panel modeler references `/javascripts/modeller.js`, which
  does NOT exist in `public/javascripts/` (only `modeller-withPropertyPanel.js`). The no-panel
  modeler page is therefore broken today. Fix options: ship a real `modeller.js`, or point the
  `withProps:false` branch at the existing bundle. Left for your call (UX decision).
- **Dead partial**: `partials/flash.pug` reads `messages.*`, but the app sets `res.locals`
  `info/successes/errors`. It renders nothing as-is. The real flash logic now lives in
  `includes/flash.pug`. `partials/flash.pug` can be deleted.

## Verification ceiling
Pug = compiled + representative renders. TS = full build. Client JS = parse-checked only
(no browser/runtime here). Full visual/UX verification needs the app running in your environment.
