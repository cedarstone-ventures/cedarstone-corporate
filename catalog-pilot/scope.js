"use strict";
(() => {
  const questions = [
    [
      "source",
      "1. Where is the source?",
      [
        ["public", "A public supplier PDF, without a login"],
        ["private", "A private file, account or customer record"],
        ["unsure", "I need to check"],
      ],
    ],
    [
      "products",
      "2. How many product records?",
      [
        ["within", "1–100"],
        ["over", "More than 100"],
        ["unsure", "I need to count them"],
      ],
    ],
    [
      "pages",
      "3. How many selected pages?",
      [
        ["within", "1–10"],
        ["over", "More than 10"],
        ["unsure", "I need to count them"],
      ],
    ],
    [
      "fields",
      "4. How many source fields?",
      [
        ["within", "1–8, plus a page reference"],
        ["over", "More than 8"],
        ["unsure", "The columns are not agreed yet"],
      ],
    ],
    [
      "layout",
      "5. What does the source look like?",
      [
        ["consistent", "One clear, consistent table layout"],
        ["mixed", "Mixed layouts, scans or unclear values"],
        ["unsure", "I need to check"],
      ],
    ],
    [
      "outcome",
      "6. What output do you need?",
      [
        ["csv", "Source facts in agreed spreadsheet columns"],
        ["outside", "Images, new descriptions, variants or store upload"],
        ["unsure", "I need to define the output"],
      ],
    ],
  ];
  const form = document.querySelector("#scope-form");
  if (!form) return;
  const fields = document.querySelector("#form-fields");
  const result = document.querySelector("#scope-result");
  const announcement = document.querySelector("#check-announcement");
  let summary = null;
  for (const [id, label, options] of questions) {
    const group = document.createElement("div");
    group.className = "field";
    const title = document.createElement("label");
    title.htmlFor = id;
    title.textContent = label;
    const select = document.createElement("select");
    select.id = id;
    select.name = id;
    select.required = true;
    select.setAttribute("aria-describedby", "form-help");
    select.append(new Option("Choose an answer…", ""));
    for (const [value, text] of options) select.append(new Option(text, value));
    const error = document.createElement("p");
    error.id = `${id}-error`;
    error.className = "field-error";
    error.hidden = true;
    group.append(title, select, error);
    fields.append(group);
  }
  form.hidden = false;
  const invalidate = () => {
    result.hidden = true;
    summary = null;
    announcement.textContent = "";
  };
  form.addEventListener("change", (event) => {
    invalidate();
    const select = event.target;
    if (select.matches("select")) {
      select.removeAttribute("aria-invalid");
      select.setAttribute("aria-describedby", "form-help");
      document.getElementById(`${select.id}-error`).hidden = true;
    }
  });
  form.addEventListener("reset", () => {
    invalidate();
    for (const select of form.querySelectorAll("select")) {
      select.removeAttribute("aria-invalid");
      select.setAttribute("aria-describedby", "form-help");
    }
    for (const error of form.querySelectorAll(".field-error"))
      error.hidden = true;
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    invalidate();
    let firstInvalid = null;
    const answers = {};
    for (const [id, , options] of questions) {
      const select = document.getElementById(id);
      const valid = options.some(([value]) => value === select.value);
      const error = document.getElementById(`${id}-error`);
      error.hidden = valid;
      if (!valid) {
        select.setAttribute("aria-invalid", "true");
        select.setAttribute("aria-describedby", `${id}-error`);
        error.textContent = "Choose an answer for this question.";
        if (!firstInvalid) firstInvalid = select;
      } else {
        select.removeAttribute("aria-invalid");
        select.setAttribute("aria-describedby", "form-help");
        answers[id] = select.value;
      }
    }
    if (firstInvalid) {
      announcement.textContent = "Please answer all six questions.";
      firstInvalid.focus();
      return;
    }
    const reasons = [];
    if (answers.source === "private")
      reasons.push(
        "Private files, accounts and customer records are outside this public-catalog pilot.",
      );
    if (answers.products === "over")
      reasons.push("The proposed pilot covers up to 100 product records.");
    if (answers.pages === "over")
      reasons.push("The proposed pilot covers up to 10 selected pages.");
    if (answers.fields === "over")
      reasons.push(
        "The proposed pilot covers up to 8 source fields plus page references.",
      );
    if (answers.layout === "mixed")
      reasons.push("This scope requires one clear, consistent table layout.");
    if (answers.outcome === "outside")
      reasons.push(
        "Images, new descriptions, variant expansion and direct store upload are outside this pilot.",
      );
    const uncertain = Object.values(answers).includes("unsure");
    const state = reasons.length
      ? "outside_scope"
      : uncertain
        ? "details_needed"
        : "within_scope_limits";
    const title =
      state === "outside_scope"
        ? "This job falls outside the pilot."
        : uncertain
          ? "A few details need checking."
          : "Your answers fit the published limits.";
    if (uncertain)
      reasons.push(
        "Resolve the answers marked “I need to check” or not yet defined before a source review.",
      );
    if (!reasons.length)
      reasons.push(
        "The source still needs review for rights, privacy, legibility and required-field completeness.",
      );
    const next =
      "Enquiries are not open yet. This is a scope guide, not an acceptance, reservation or submission. You can download these answers for later.";
    document.getElementById("result-title").textContent = title;
    const list = document.getElementById("result-reasons");
    list.replaceChildren();
    for (const reason of reasons) {
      const li = document.createElement("li");
      li.textContent = reason;
      list.append(li);
    }
    document.getElementById("result-next").textContent = next;
    summary = {
      schema_version: 1,
      purpose: "local_scope_guide",
      submitted: false,
      source_approved: false,
      payment_enabled: false,
      scope_status: state,
      answers,
      reasons,
    };
    result.hidden = false;
    result.focus();
  });
  document.getElementById("download-summary").addEventListener("click", () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cedarstone-scope-summary.json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });
})();
