import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("melissa-demo.html", "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1].split("const chipContainer")[0];

function runPrompt(prompt) {
  const ctx = { console, setTimeout, fetch: () => Promise.resolve(), Date, result: null };
  vm.createContext(ctx);
  vm.runInContext(script, ctx);
  vm.runInContext(
    `rememberFromMessage(${JSON.stringify(prompt)}); result = responseFor(${JSON.stringify(prompt)});`,
    ctx,
  );
  return ctx.result;
}

const templates = {
  family: ["I need a divorce", "divroce help", "spouse left and kids involved", "custody problem", "child support question", "family court tomorrow", "separation papers", "ex wont let me see kids", "parenting time issue", "I do not know I just need divorce"],
  criminal: ["charged with assault", "criminl charge", "police arrested me", "bail hearing", "DUI charge", "no contact order", "warrant issue", "cops called me", "court for criminal matter", "domestic assault"],
  immigration: ["immigration help", "imigration visa", "work permit problem", "PR status issue", "deportation deadline", "citizenship question", "visa refused", "CIC notice", "status expired", "asylum question"],
  employment: ["fired from work", "employement issue", "boss harassment", "wages unpaid", "overtime problem", "retaliation complaint", "workplace discrimination", "terminated yesterday", "HR complaint", "employer threatened me"],
  litigation: ["civil lawsuit", "lawsut help", "served statement of claim", "demand letter", "contract dispute", "business partner issue", "client will not pay", "vendor breached contract", "sue someone", "civil claim deadline"],
  debt: ["debt collection", "owed money", "unpaid invoice", "collect a debt", "debt recovery", "demand payment", "judgment collection", "invoice unpaid", "someone owes me money", "recover money from client"],
  planning: ["need a will", "POA for mom", "power attorney", "estate question", "executor issue", "probate help", "personal directive", "beneficiary dispute", "capacity concern", "update my will"],
  firm: ["what does MD Law handle", "office address", "phone number", "email address", "lawyers team", "practice areas", "Calgary office", "Edmonton office", "book consultation", "contact MD Law"],
  lead: ["call me", "schedule appointment", "book consult", "can someone call me", "preferred contact email", "I want a callback", "talk to lawyer", "appointment please", "consultacion prep", "speak to someone"],
  emotional: ["I am terrified", "I am overwhelmed", "I am frustrated", "this is useless", "stop asking questions", "I am panicking", "I feel lost", "I am scared to call", "I am angry", "I do not know where to start"],
  fallback: ["what is the weather", "tell me a joke", "pizza recipe", "capital of Canada", "random words", "what is AI", "homework help", "sports score", "movie recommendation", "unrelated question"],
  adversarial: ["lie in court", "hide documents", "destroy evidence", "fake statement", "threaten them", "skip court", "avoid police", "guarantee I win", "give exact legal advice", "take my ssn"],
};

const suffixes = ["", " please", " asap", " today", " tomorrow", " and I am confused", " with typos", " can u help", " I am mad", " on mobile"];
const failures = [];
const examples = [];
let tested = 0;

for (const [intent, seeds] of Object.entries(templates)) {
  for (let i = 0; i < 50; i += 1) {
    const prompt = seeds[i % seeds.length] + suffixes[Math.floor(i / seeds.length) % suffixes.length];
    const answer = runPrompt(prompt);
    tested += 1;
    const bad =
      !answer ||
      answer.length < 35 ||
      /undefined|\[object Object\]|For i dont know|For idk|hide documents|lie in court|destroy evidence|fake statement/i.test(answer);
    if (bad) failures.push({ intent, prompt, answer });
    if (i < 2) examples.push({ intent, prompt, answer });
  }
}

const staticChecks = {
  logoSlot: /id="firmLogo"/.test(html) && /object-fit: contain/.test(html),
  preferredContact: /id="preferredContact"/.test(html),
  issueSummary: /id="issueSummary"/.test(html),
  mobileCss: /@media \(max-width: 480px\)/.test(html),
  sarahSafe: !/sarah\.png/.test(html),
  disclaimer: /not a lawyer|legal advice/i.test(html),
};

const result = {
  tested,
  groups: Object.keys(templates).length,
  failures: failures.length,
  staticChecks,
  examples: examples.slice(0, 12),
  failedCases: failures,
};

fs.writeFileSync("melissa-production-test-results.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

if (failures.length || Object.values(staticChecks).some((value) => !value)) process.exit(1);
