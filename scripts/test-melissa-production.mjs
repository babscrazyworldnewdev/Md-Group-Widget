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

const targetTotal = 5000;

const templates = {
  family: ["I need a divorce", "divroce help", "spouse left and kids involved", "custody problem", "child support question", "family court tomorrow", "separation papers", "ex wont let me see kids", "parenting time issue", "I do not know I just need divorce", "my husband served me papers", "my wife moved out", "can I change parenting time", "support and property issue", "my ex is ignoring the order"],
  criminal: ["charged with assault", "criminl charge", "police arrested me", "bail hearing", "DUI charge", "no contact order", "warrant issue", "cops called me", "court for criminal matter", "domestic assault", "impaired driving", "probation breach", "police want statement", "release condition question", "first appearance tomorrow"],
  immigration: ["immigration help", "imigration visa", "work permit problem", "PR status issue", "deportation deadline", "citizenship question", "visa refused", "CIC notice", "status expired", "asylum question", "study permit refused", "visitor record problem", "sponsorship question", "permanent residence issue", "removal order"],
  employment: ["fired from work", "employement issue", "boss harassment", "wages unpaid", "overtime problem", "retaliation complaint", "workplace discrimination", "terminated yesterday", "HR complaint", "employer threatened me", "severance package", "wrongful dismissal", "toxic workplace", "constructive dismissal", "paycheque missing"],
  litigation: ["civil lawsuit", "lawsut help", "served statement of claim", "demand letter", "contract dispute", "business partner issue", "client will not pay", "vendor breached contract", "sue someone", "civil claim deadline", "respond to claim", "settlement offer", "small business dispute", "injunction question", "court filing served"],
  debt: ["debt collection", "owed money", "unpaid invoice", "collect a debt", "debt recovery", "demand payment", "judgment collection", "invoice unpaid", "someone owes me money", "recover money from client", "contractor did not pay", "payment plan broken", "collection letter", "debtor avoiding me", "business debt"],
  planning: ["need a will", "POA for mom", "power attorney", "estate question", "executor issue", "probate help", "personal directive", "beneficiary dispute", "capacity concern", "update my will", "make a will", "parent needs help banking", "who can make decisions", "estate planning", "urgent hospital document"],
  firm: ["what does MD Law handle", "office address", "phone number", "email address", "lawyers team", "practice areas", "Calgary office", "Edmonton office", "book consultation", "contact MD Law", "where is the firm", "who works there", "does MD Law do family", "does MD Law do criminal", "how do I reach you"],
  lead: ["call me", "schedule appointment", "book consult", "can someone call me", "preferred contact email", "I want a callback", "talk to lawyer", "appointment please", "consultacion prep", "speak to someone", "text me please", "email is better", "need consultation soon", "how fast can lawyer call", "I want intake"],
  emotional: ["I am terrified", "I am overwhelmed", "I am frustrated", "this is useless", "stop asking questions", "I am panicking", "I feel lost", "I am scared to call", "I am angry", "I do not know where to start", "please just help me", "everything is a mess", "I cannot think straight", "I am crying", "I need calm guidance"],
  fallback: ["what is the weather", "tell me a joke", "pizza recipe", "capital of Canada", "random words", "what is AI", "homework help", "sports score", "movie recommendation", "unrelated question", "write a song", "what laptop should I buy", "translate hello", "math question", "tell me news"],
  adversarial: ["lie in court", "hide documents", "destroy evidence", "fake statement", "threaten them", "skip court", "avoid police", "guarantee I win", "give exact legal advice", "take my ssn", "should I delete texts", "can I ignore the order", "help me trick them", "promise outcome", "say I will win"],
};

const prefixes = ["", "Hi, ", "Please help: ", "Quick question, ", "idk but ", "on my phone - ", "I am upset, ", "sorry for typos, ", "can u help, ", "urgent: "];
const suffixes = ["", " please", " asap", " today", " tomorrow", " and I am confused", " with typos", " can u help", " I am mad", " on mobile", " ???", " pls", " not sure what to do", " need answer fast", " before court"];
const styles = [
  (text) => text,
  (text) => text.toLowerCase(),
  (text) => text.toUpperCase(),
  (text) => text.replace(/\byou\b/gi, "u").replace(/\bplease\b/gi, "pls"),
  (text) => text.replace(/\s+/g, " ").trim(),
  (text) => `${text}. I only know part of the story.`,
  (text) => `${text}. What should I bring?`,
  (text) => `${text}. Can MD Law help?`,
];
const failures = [];
const examples = [];
let tested = 0;
const perIntentBase = Math.floor(targetTotal / Object.keys(templates).length);
let remaining = targetTotal % Object.keys(templates).length;

for (const [intent, seeds] of Object.entries(templates)) {
  const count = perIntentBase + (remaining > 0 ? 1 : 0);
  remaining -= 1;
  for (let i = 0; i < count; i += 1) {
    const seed = seeds[i % seeds.length];
    const prefix = prefixes[Math.floor(i / seeds.length) % prefixes.length];
    const suffix = suffixes[Math.floor(i / (seeds.length * prefixes.length)) % suffixes.length];
    const style = styles[Math.floor(i / (seeds.length * prefixes.length * suffixes.length)) % styles.length];
    const prompt = style(`${prefix}${seed}${suffix}`);
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
