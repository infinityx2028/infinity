const { spawn } = require("node:child_process");
const fs = require("node:fs"),
  path = require("node:path");
const base =
  process.argv.slice(2).find((a) => !a.startsWith("--")) ||
  "http://127.0.0.1:4173";
const quick = process.argv.includes("--quick");
const debug = process.argv.includes("--debug");
const targetViewport = process.argv
  .find((arg) => arg.startsWith("--viewport="))
  ?.split("=")[1]
  .split("x")
  .map(Number);
const out = path.resolve(
  "qa",
  debug ? "v5-debug" : base.includes("127.0.0.1") ? "v5-local" : "v5-live",
);
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  [
    "--headless=new",
    "--no-first-run",
    "--remote-debugging-port=9365",
    `--user-data-dir=${path.resolve("qa/v5-chrome")}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws,
  id = 0;
const pending = new Map();
const report = {
  base,
  checks: [],
  errors: [],
  consoleErrors: [],
  samples: [],
  resizes: [],
  performance: [],
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id,
      timer = setTimeout(() => reject(Error(method)), 25000);
    pending.set(key, {
      resolve: (r) => {
        clearTimeout(timer);
        resolve(r);
      },
      reject,
    });
    ws.send(JSON.stringify({ id: key, method, params }));
  });
}
async function ev(expression) {
  const r = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails)
    throw Error(
      r.exceptionDetails.exception?.description || r.exceptionDetails.text,
    );
  return r.result?.value;
}
function check(name, ok, details) {
  report.checks.push({ name, passed: !!ok, details });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) {
    process.exitCode = 1;
    console.log(JSON.stringify(details));
  }
}
async function until(expression) {
  for (let i = 0; i < 150; i++) {
    if (await ev(expression)) return;
    await sleep(200);
  }
  throw Error("Timed out " + expression);
}
async function size(width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await sleep(120);
}
async function scroll(y) {
  await ev(`window.scrollTo({top:${y},behavior:'instant'})`);
  await sleep(65);
}
async function shot(name) {
  if (process.argv.includes("--no-captures")) return;
  const r = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  fs.writeFileSync(
    path.join(out, name + ".png"),
    Buffer.from(r.data, "base64"),
  );
}
async function snapshot() {
  return ev(`(()=>{
 const s=document.querySelector('.world-stage'),v=document.querySelector('.world-viewport');
 const visible=getComputedStyle(s).visibility==='visible'&&Number(getComputedStyle(s).opacity)>.01;
 const bounds=s.dataset.bounds?JSON.parse(s.dataset.bounds):null;
 const front=s.querySelector('.world-frame-front').getBoundingClientRect();
 const intersect=(a,b,g=0)=>a.left<b.right+g&&a.right>b.left-g&&a.top<b.bottom+g&&a.bottom>b.top-g;
 const collisions=visible&&bounds?[...document.querySelectorAll('[data-frame-exclusion]')].filter(n=>n.getClientRects().length&&intersect(bounds,n.getBoundingClientRect())).map(n=>({tag:n.tagName,text:n.textContent.slice(0,60),class:n.className})):[];
 const gap=innerWidth<768?24:48;
 const gapViolations=visible&&bounds?[...document.querySelectorAll('[data-frame-exclusion]')].filter(n=>n.getClientRects().length&&intersect(bounds,n.getBoundingClientRect(),gap-.5)).map(n=>n.tagName+':'+n.textContent.slice(0,40)):[];
 return {scroll:scrollY,scene:s.dataset.scene,visible,reason:v.dataset.visibilityReason,transition:s.dataset.transition,fallback:s.dataset.fallback,quality:v.dataset.quality,bounds,collisions,gapViolations,
 overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
 bounded:!visible||!!bounds&&bounds.left>=7.5&&bounds.right<=innerWidth-7.5&&bounds.top>=0&&bounds.bottom<=innerHeight+.5,
 physicalContained:!visible||!!bounds&&front.left>=bounds.left-1&&front.right<=bounds.right+1&&front.top>=bounds.top-1&&front.bottom<=bounds.bottom+1};
})()`);
}
const widths = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [393, 852],
  [412, 915],
  [430, 932],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1728, 1117],
  [1920, 1080],
];
const allowed = [
  "hero",
  "ai",
  "categories",
  "camera",
  "magazine",
  "universe",
  "process",
  "difference",
  "final",
];
async function geometry() {
  return ev(
    `[...document.querySelectorAll('[data-film-scene]')].filter(n=>n.offsetHeight>0).map(n=>({name:n.dataset.filmScene,top:n.getBoundingClientRect().top+scrollY,height:n.offsetHeight,zone:n.querySelector('[data-frame-safe-zone]')?{top:n.querySelector('[data-frame-safe-zone]').getBoundingClientRect().top+scrollY,height:n.querySelector('[data-frame-safe-zone]').offsetHeight}:null}))`,
  );
}
(async () => {
  let pages;
  for (let i = 0; i < 60; i++) {
    try {
      pages = await fetch("http://127.0.0.1:9365/json/list").then((r) =>
        r.json(),
      );
      if (pages.length) break;
    } catch {}
    await sleep(200);
  }
  ws = new WebSocket(pages.find((p) => p.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) {
      const p = pending.get(m.id);
      if (p) {
        pending.delete(m.id);
        m.error ? p.reject(Error(m.error.message)) : p.resolve(m.result);
      }
    }
    if (m.method === "Runtime.exceptionThrown")
      report.errors.push(
        m.params.exceptionDetails.exception?.description ||
          m.params.exceptionDetails.text,
      );
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      report.consoleErrors.push(
        m.params.args.map((a) => a.value || a.description).join(" "),
      );
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setHardwareConcurrencyOverride", {
    hardwareConcurrency: 12,
  });
  await size(1440, 900);
  await send("Page.navigate", { url: base + (debug ? "/?frameDebug=1" : "") });
  await until('document.querySelector("#root")?.textContent.length>100');
  if (!(await ev('!!document.querySelector(".world-viewport")'))) {
    check("Live serves V5 director", false);
    for (const w of [390, 1440]) {
      await size(w, w === 390 ? 844 : 900);
      await scroll(0);
      await shot(w + "-previous-live-hero");
      await ev(
        'window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})',
      );
      await shot(w + "-previous-live-footer");
    }
    return;
  }
  await until(
    'document.querySelectorAll(".scene-category-object").length>0||document.querySelector(".scene-status").textContent.includes("unavailable")',
  );
  check(
    "Active catalog loaded",
    await ev('document.querySelectorAll(".scene-category-object").length>0'),
  );
  await ev("document.fonts.ready.then(()=>true)");
  await until('!!document.querySelector(".world-stage").dataset.scene');
  await sleep(500);
  if (process.argv.includes("--inspect")) {
    for (const [w, h, name] of [
      [390, 844, "hero"],
      [1440, 900, "final"],
    ]) {
      await size(w, h);
      const g = (await geometry()).find((s) => s.name === name);
      await scroll(name === "hero" ? 0 : g.zone.top - 148);
      console.log(
        JSON.stringify(
          await ev(
            '(()=>{const z=document.querySelector("[data-frame-safe-zone=' +
              name +
              ']").getBoundingClientRect();const rect=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom});return {width:innerWidth,scene:document.querySelector(".world-stage").dataset.scene,reason:document.querySelector(".world-viewport").dataset.visibilityReason,zone:rect(z),frameWidth:document.querySelector("[data-film-anchor=' +
              name +
              ']").getBoundingClientRect().width,nearby:[...document.querySelectorAll("[data-frame-exclusion]")].filter(n=>{const r=n.getBoundingClientRect();return r.top<z.bottom+100&&r.bottom>z.top-100}).map(n=>({text:n.textContent.slice(0,50),class:n.className,rect:rect(n.getBoundingClientRect())}))}})()',
          ),
          null,
          2,
        ),
      );
      await shot(w + "-" + name + "-inspect");
    }
    return;
  }
  check(
    "One persistent director and physical frame",
    await ev(
      'document.querySelectorAll(".world-viewport").length===1&&document.querySelectorAll(".world-frame-shell").length===1',
    ),
  );
  for (const [w, h] of targetViewport
    ? [targetViewport]
    : quick
      ? [
          [390, 844],
          [1440, 900],
        ]
      : widths) {
    await size(w, h);
    await scroll(0);
    const scenes = await geometry();
    const rows = [];
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i],
        next = scenes[i + 1],
        start = Math.max(0, s.top - (w < 768 ? 74 : 94)),
        end = next ? next.top - (w < 768 ? 74 : 94) : s.top + s.height - h;
      if (i > 0) {
        const focus = Math.min(
          h * (w < 768 ? 0.34 : 0.42),
          w < 768 ? 240 : 390,
        );
        const duration = Math.min(240, h * 0.3);
        for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
          await scroll(Math.max(0, s.top - focus + duration * progress));
          rows.push({
            width: w,
            height: h,
            owner: s.name,
            checkpoint: "transition",
            progress,
            ...(await snapshot()),
          });
          if (!quick || process.argv.includes("--capture-transitions"))
            await shot(
              w + "-" + s.name + "-transition-" + Math.round(progress * 100),
            );
        }
      }
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        await scroll(start + (end - start) * p);
        const sample = {
          width: w,
          height: h,
          owner: s.name,
          checkpoint: p,
          ...(await snapshot()),
        };
        rows.push(sample);
        if (!quick) await shot(w + "-" + s.name + "-" + Math.round(p * 100));
      }
      if (s.zone && allowed.includes(s.name)) {
        await scroll(Math.max(0, s.zone.top - (w < 768 ? 112 : 148)));
        const sample = {
          width: w,
          height: h,
          owner: s.name,
          checkpoint: "visual",
          ...(await snapshot()),
        };
        rows.push(sample);
        await shot(w + "-" + s.name + "-visual");
      }
    }
    report.samples.push(...rows);
    check(
      "Zero collisions, bounds and overflow " + w,
      rows.every(
        (r) =>
          !r.collisions.length &&
          !r.gapViolations.length &&
          r.bounded &&
          r.physicalContained &&
          !r.overflow,
      ),
      rows.filter(
        (r) =>
          r.collisions.length ||
          r.gapViolations.length ||
          !r.bounded ||
          !r.physicalContained ||
          r.overflow,
      ),
    );
    const visibility = Object.fromEntries(
      allowed.map((name) => [
        name,
        rows.some((r) => r.scene === name && r.visible),
      ]),
    );
    check(
      "Required scenes have safe visible positions " + w,
      Object.values(visibility).every(Boolean),
      visibility,
    );
    const final = rows.find((r) => r.scene === "final" && r.visible);
    if (final) {
      await scroll(final.scroll);
      check(
        "Final center axis " + w,
        await ev(
          '(()=>{const f=document.querySelector(".world-frame-front").getBoundingClientRect(),h=document.querySelector(".scene-final h2").getBoundingClientRect();return Math.abs((f.left+f.right-h.left-h.right)/2)<1})()',
        ),
      );
    }
    await ev(
      'window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})',
    );
    await sleep(70);
    check("Footer hides frame " + w, !(await snapshot()).visible);
    await shot(w + "-footer");
  }
  // Resize while the actor is in each important scene. Re-check measured geometry.
  for (const name of ["hero", "ai", "camera", "final"])
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
      [320, 568],
      [1728, 1117],
    ]) {
      await size(w, h);
      const s = (await geometry()).find((s) => s.name === name);
      await scroll(
        s.zone ? Math.max(0, s.zone.top - (w < 768 ? 112 : 148)) : s.top,
      );
      const sample = { target: name, width: w, ...(await snapshot()) };
      report.resizes.push(sample);
    }
  check(
    "Resizes are safe",
    report.resizes.every(
      (s) =>
        !s.collisions.length &&
        !s.gapViolations.length &&
        s.bounded &&
        s.physicalContained,
    ),
  );
  // Enlarge actual text, rather than merely emulating a device pixel ratio.
  for (const [w, h] of [
    [390, 844],
    [1440, 900],
  ]) {
    await size(w, h);
    await ev(
      '(()=>{const nodes=[...document.querySelectorAll(".memory-world h1,.memory-world h2,.memory-world h3,.memory-world p,.memory-world a,.memory-world button,.memory-world span,.memory-world input")].filter(n=>!n.closest(".world-stage"));const values=nodes.map(n=>({n,size:getComputedStyle(n).fontSize}));values.forEach(({n,size})=>{n.dataset.qaFont=n.style.fontSize;n.style.fontSize=parseFloat(size)*2+"px"})})()',
    );
    await sleep(350);
    const scenes = await geometry();
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i],
        end = scenes[i + 1]?.top ?? s.top + s.height - h;
      for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
        await scroll(s.top + (end - s.top) * progress);
        const sample = {
          width: w,
          owner: s.name,
          checkpoint: "200% text",
          progress,
          ...(await snapshot()),
        };
        report.samples.push(sample);
        if (progress === 0) await shot(w + "-" + s.name + "-text200");
      }
    }
    await ev(
      'document.querySelectorAll("[data-qa-font]").forEach(n=>{n.style.fontSize=n.dataset.qaFont;delete n.dataset.qaFont})',
    );
    await sleep(200);
  }
  check(
    "200% text preserves content clearance",
    report.samples
      .filter((s) => s.checkpoint === "200% text")
      .every(
        (s) => !s.collisions.length && !s.gapViolations.length && !s.overflow,
      ),
  );
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await size(390, 844);
  for (const s of await geometry()) {
    await scroll(s.zone ? s.zone.top - 112 : s.top);
    report.samples.push({
      width: 390,
      owner: s.name,
      checkpoint: "reduced motion",
      ...(await snapshot()),
    });
  }
  check(
    "Reduced motion has no 3D travel",
    await ev(
      'getComputedStyle(document.querySelector(".world-object")).transform==="none"',
    ),
  );
  check(
    "Reduced motion is collision safe",
    report.samples
      .filter((s) => s.checkpoint === "reduced motion")
      .every((s) => !s.collisions.length && !s.gapViolations.length),
  );
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  // Each quality mode retains one frame and the same collision policy.
  for (const [cores, quality] of [
    [12, "high"],
    [6, "medium"],
    [2, "low"],
  ]) {
    await send("Emulation.setHardwareConcurrencyOverride", {
      hardwareConcurrency: cores,
    });
    await size(1440, 900);
    await send("Page.navigate", { url: base });
    await until('!!document.querySelector(".world-stage")?.dataset.scene');
    await sleep(200);
    check(
      "Quality " + quality,
      await ev(
        'document.querySelector(".world-viewport").dataset.quality==="' +
          quality +
          '"',
      ),
    );
    const perf = await ev(
      'new Promise(resolve=>{let first,previous;const intervals=[];function f(t){first??=t;if(previous)intervals.push(t-previous);previous=t;window.scrollTo({top:(document.querySelector(".memory-world").offsetHeight-innerHeight)*(t-first)/3000,behavior:"instant"});if(t-first<3000)requestAnimationFrame(f);else{intervals.sort((a,b)=>a-b);resolve({fps:1000/(intervals.reduce((a,b)=>a+b,0)/intervals.length),p95Ms:intervals[Math.floor(intervals.length*.95)],frames:intervals.length})}}requestAnimationFrame(f)})',
    );
    report.performance.push({
      quality,
      context: "Headless Chrome development machine; not a device benchmark",
      ...perf,
    });
  }
  await scroll(0);
  check(
    "390 first fold includes frame and CTA",
    await (async () => {
      await size(390, 844);
      await scroll(0);
      return ev(
        '(()=>{const c=document.querySelector(".scene-hero-actions").getBoundingClientRect(),n=document.querySelector(".scene-ai").getBoundingClientRect();return c.bottom<=844&&n.top<844})()',
      );
    })(),
  );
  await ev('document.querySelector(`[aria-label="Search gifts"]`).click()');
  await sleep(100);
  check("Search hides the frame", !(await snapshot()).visible);
  await ev('document.querySelector(`[aria-label="Close search"]`).click()');
  await sleep(100);
  const ai = (await geometry()).find((s) => s.name === "ai");
  await scroll(ai.top);
  await ev('document.querySelector(".scene-suggestions button").click()');
  await until('!!document.querySelector(".scene-results")');
  await sleep(200);
  check(
    "AI real budget filter",
    await ev(
      '[...document.querySelectorAll(".scene-result-grid strong")].every(n=>Number(n.textContent.replace(/[^0-9.]/g,""))<=800)',
    ),
  );
  const aiState = await snapshot();
  check(
    "AI results relayout is safe",
    !aiState.collisions.length && !aiState.gapViolations.length,
  );
  await shot("390-ai-results");
  await ev('document.querySelector(".scene-result-grid a").click()');
  await until('location.pathname.startsWith("/product/")');
  await until(
    '!document.querySelector(".world-viewport")&&!document.querySelector(".frame-collision-debug")',
  );
  check(
    "Product navigation cleans up the frame and debug layer",
    await ev(
      '!document.querySelector(".world-viewport")&&!document.querySelector(".frame-collision-debug")',
    ),
  );
  check(
    "No runtime or collision assertions",
    !report.errors.length &&
      !report.consoleErrors.some((s) => s.includes("FRAME COLLISION")),
    {
      errors: report.errors,
      assertions: report.consoleErrors.filter((s) =>
        s.includes("FRAME COLLISION"),
      ),
    },
  );
  const visible = report.samples.filter((s) => s.visible);
  report.summary = {
    samples: report.samples.length,
    visibleSamples: visible.length,
    collisions: visible.reduce((n, s) => n + s.collisions.length, 0),
    gapViolations: visible.reduce((n, s) => n + s.gapViolations.length, 0),
    failedChecks: report.checks.filter((c) => !c.passed).length,
  };
})()
  .catch((e) => {
    report.errors.push(e.stack);
    process.exitCode = 1;
    console.error(e);
  })
  .finally(() => {
    fs.writeFileSync(
      path.join(out, "report.json"),
      JSON.stringify(report, null, 2),
    );
    const images = fs.readdirSync(out).filter((n) => n.endsWith(".png"));
    fs.writeFileSync(
      path.join(out, "index.html"),
      '<meta name="viewport" content="width=device-width"><title>V5 frame regression</title><style>body{font:14px sans-serif;background:#faf8f4;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:18px}img{width:100%;border:1px solid #ddd}small{display:block}</style><h1>V5 regression screenshots</h1><main>' +
        images
          .map(
            (n) =>
              '<a href="' +
              n +
              '"><img loading="lazy" src="' +
              n +
              '"><small>' +
              n +
              "</small></a>",
          )
          .join("") +
        "</main>",
    );
    ws?.close();
    chrome.kill();
  });
