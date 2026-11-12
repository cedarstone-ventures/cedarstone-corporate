"use strict";
const body = document.querySelector("#records");
const filter = document.querySelector("#status-filter");
const count = document.querySelector("#row-count");
let records = [];
filter.disabled = true;
const fields = [
  "inquiry_id",
  "name",
  "email",
  "received_at",
  "source",
  "request",
];
function validRecord(row) {
  return (
    row &&
    Number.isInteger(row.source_record) &&
    row.source_record >= 2 &&
    ["ready", "duplicate", "review"].includes(row.status) &&
    Array.isArray(row.reasons) &&
    row.reasons.every((reason) => typeof reason === "string") &&
    [row.original, row.normalized].every(
      (values) =>
        values && fields.every((field) => typeof values[field] === "string"),
    )
  );
}
function render() {
  const visible = records.filter(
    (row) => filter.value === "all" || row.status === filter.value,
  );
  body.replaceChildren();
  for (const row of visible) {
    const tr = document.createElement("tr");
    const changes = Object.keys(row.normalized).filter(
      (key) => row.original[key] !== row.normalized[key],
    );
    const reason = row.reasons.length
      ? row.reasons.join("; ")
      : changes.length
        ? "Standardized: " + changes.join(", ")
        : "Passed the example rules";
    for (const value of [
      row.source_record,
      row.normalized.inquiry_id,
      row.normalized.name || "(name missing)",
      row.status === "review"
        ? "Review"
        : row.status === "duplicate"
          ? "Duplicate"
          : "Ready",
      reason,
    ]) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    }
    body.append(tr);
  }
  count.textContent = `${visible.length} of ${records.length} records shown`;
  const url = new URL(location.href);
  if (filter.value === "all") url.searchParams.delete("status");
  else url.searchParams.set("status", filter.value);
  history.replaceState(null, "", url);
}
const initial = new URLSearchParams(location.search).get("status");
if (["ready", "duplicate", "review"].includes(initial)) filter.value = initial;
filter.addEventListener("change", render);
fetch("data/result.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load the example");
    return response.json();
  })
  .then((result) => {
    if (
      !result ||
      !Array.isArray(result.records) ||
      result.records.length > 5000 ||
      !result.records.every(validRecord)
    ) {
      throw new Error("Unexpected example data");
    }
    records = result.records;
    render();
    filter.disabled = false;
  })
  .catch(() => {
    const error = document.querySelector("#error");
    error.hidden = false;
    error.className = "error";
    error.textContent =
      "The interactive example could not load. You can still download the CSV results below or reload this page.";
    count.textContent = "Results unavailable";
  });
