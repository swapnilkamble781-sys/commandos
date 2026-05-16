const commandInput = document.querySelector("#commandInput");
const runBtn = document.querySelector("#runBtn");
const demoBtn = document.querySelector("#demoBtn");
const clearBtn = document.querySelector("#clearBtn");
const listenBtn = document.querySelector("#listenBtn");
const voiceOrb = document.querySelector("#voiceOrb");
const statusText = document.querySelector("#statusText");
const statusDot = document.querySelector("#statusDot");
const transcript = document.querySelector("#transcript");
const intentChips = document.querySelector("#intentChips");
const confidenceBadge = document.querySelector("#confidenceBadge");
const languageBadge = document.querySelector("#languageBadge");
const planList = document.querySelector("#planList");
const confirmBtn = document.querySelector("#confirmBtn");
const browserScript = document.querySelector("#browserScript");
const figmaBrief = document.querySelector("#figmaBrief");
const mailDraft = document.querySelector("#mailDraft");
const navItems = document.querySelectorAll(".nav-item");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

let recognition;
let latestPlan = null;

const keywords = {
  browser: [
    "chrome",
    "browser",
    "website",
    "open",
    "click",
    "download",
    "form",
    "tab",
    "search",
    "crome",
    "kholo",
    "khol",
    "dabao",
    "download",
  ],
  figma: [
    "figma",
    "design",
    "dashboard",
    "ui",
    "wireframe",
    "prototype",
    "landing",
    "frame",
    "component",
    "diagram",
    "banao",
    "banana",
  ],
  mail: [
    "email",
    "gmail",
    "mail",
    "inbox",
    "reply",
    "draft",
    "send",
    "unread",
    "padhna",
    "padho",
    "jawab",
  ],
  risky: [
    "send",
    "delete",
    "purchase",
    "pay",
    "transfer",
    "submit",
    "reply",
    "download",
    "bhejo",
    "delete",
    "payment",
  ],
};

function detectLanguage(text) {
  const hindiHints = [
    "mujhe",
    "mere",
    "karo",
    "banao",
    "padho",
    "bhejo",
    "kholo",
    "jo bhi",
    "kaam",
  ];
  return hindiHints.some((word) => text.toLowerCase().includes(word))
    ? "Hinglish"
    : "English";
}

function scoreIntent(text) {
  const lower = text.toLowerCase();
  const matches = Object.fromEntries(
    Object.entries(keywords).map(([key, words]) => [
      key,
      words.filter((word) => lower.includes(word)).length,
    ]),
  );

  const tools = ["browser", "figma", "mail"].filter((tool) => matches[tool] > 0);
  const risky = matches.risky > 0;
  const confidence = Math.min(96, Math.max(38, 46 + tools.length * 16 + matches.risky * 5));

  return {
    tools: tools.length ? tools : ["automation"],
    risky,
    confidence,
    language: detectLanguage(text),
  };
}

function buildPlan(text, intent) {
  const plan = [];

  plan.push("Understand the spoken goal and split it into separate executable jobs.");

  if (intent.tools.includes("browser")) {
    plan.push("Chrome: open the needed site or existing tab, inspect the page, then click/type/download only the requested items.");
  }

  if (intent.tools.includes("figma")) {
    plan.push("Figma: create a structured design brief, choose layout type, build frames/components, then visually verify spacing and responsiveness.");
  }

  if (intent.tools.includes("mail")) {
    plan.push("Email: read relevant unread threads, summarize them, prepare reply drafts, and wait for approval before sending.");
  }

  if (intent.tools.includes("automation")) {
    plan.push("Automation: ask for the target app or file, then create a repeatable workflow from the command.");
  }

  if (intent.risky) {
    plan.push("Safety checkpoint: ask before sending email, deleting files, submitting forms, paying, or downloading unknown files.");
  }

  plan.push("Report back with what was done, what failed, and what still needs human confirmation.");

  return {
    command: text,
    intent,
    steps: plan,
  };
}

function renderPlan(plan) {
  latestPlan = plan;
  transcript.textContent = plan.command;
  confidenceBadge.textContent = `${plan.intent.confidence}%`;
  languageBadge.textContent = plan.intent.language;
  intentChips.innerHTML = "";

  [...plan.intent.tools, plan.intent.risky ? "risky" : "safe"].forEach((tool) => {
    const chip = document.createElement("span");
    chip.textContent = tool === "risky" ? "needs confirmation" : tool;
    chip.className = tool;
    intentChips.appendChild(chip);
  });

  planList.innerHTML = "";
  plan.steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    planList.appendChild(item);
  });

  confirmBtn.disabled = !plan.intent.risky;
  renderToolOutputs(plan);
}

function renderToolOutputs(plan) {
  const command = plan.command;

  browserScript.textContent = plan.intent.tools.includes("browser")
    ? `Browser task plan
1. Launch or focus Google Chrome.
2. Navigate/search based on: "${command}"
3. Inspect buttons, links, downloads, and forms.
4. Execute low-risk clicks.
5. Pause before downloads, checkout, login changes, or form submit.`
    : "No Chrome action detected.";

  figmaBrief.textContent = plan.intent.tools.includes("figma")
    ? `Figma design brief
Goal: ${command}
Output: polished editable frames, reusable components, clean spacing, and named layers.
Quality bar: responsive desktop/mobile checks, no overlapping text, no random decoration.`
    : "No Figma action detected.";

  mailDraft.textContent = plan.intent.tools.includes("mail")
    ? `Email workflow
1. Fetch unread/relevant threads.
2. Summarize sender, urgency, and requested action.
3. Draft reply in your tone.
4. Ask before sending:
"Review this draft. Should I send it?"`
    : "No email action detected.";
}

function planCurrentCommand() {
  const value = commandInput.value.trim();
  if (!value) {
    commandInput.focus();
    return;
  }

  setStatus("Planning", false);
  const intent = scoreIntent(value);
  renderPlan(buildPlan(value, intent));
  setStatus(intent.risky ? "Waiting for confirmation" : "Plan ready", false);
}

function setStatus(text, listening) {
  statusText.textContent = text;
  statusDot.classList.toggle("listening", listening);
  voiceOrb.classList.toggle("active", listening);
}

function startListening() {
  if (!SpeechRecognition) {
    setStatus("Speech not supported in this browser", false);
    commandInput.placeholder = "Chrome browser me open karo. Safari speech recognition support nahi deta.";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => setStatus("Listening", true);
  recognition.onerror = () => setStatus("Mic permission needed", false);
  recognition.onend = () => setStatus("Ready", false);

  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");

    commandInput.value = text;
    transcript.textContent = text || "Listening...";

    const finalResult = event.results[event.results.length - 1].isFinal;
    if (finalResult) {
      planCurrentCommand();
    }
  };

  recognition.start();
}

runBtn.addEventListener("click", planCurrentCommand);
listenBtn.addEventListener("click", startListening);

demoBtn.addEventListener("click", () => {
  commandInput.value =
    "Chrome me Gmail kholo, unread client emails summarize karo, ek polite reply draft banao, aur Figma me us client ke liye AI analytics dashboard design banao";
  planCurrentCommand();
});

clearBtn.addEventListener("click", () => {
  commandInput.value = "";
  transcript.textContent = "No command yet.";
  intentChips.innerHTML = "";
  confidenceBadge.textContent = "0%";
  languageBadge.textContent = "Auto";
  planList.innerHTML = "<li>Speak or type a task to generate an execution plan.</li>";
  browserScript.textContent = "Waiting for a browser task...";
  figmaBrief.textContent = "Waiting for a design task...";
  mailDraft.textContent = "Waiting for an email task...";
  confirmBtn.disabled = true;
  latestPlan = null;
  setStatus("Ready", false);
});

confirmBtn.addEventListener("click", () => {
  if (!latestPlan) return;
  setStatus("Confirmed safe steps", false);
  const item = document.createElement("li");
  item.textContent = "Human approval captured for preview-only safe execution. Native app build will still ask before final send/delete/pay actions.";
  planList.appendChild(item);
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
    const tool = item.dataset.mode;
    const target = document.querySelector(`[data-tool="${tool}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
