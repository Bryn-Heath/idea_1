const LOG_PREFIX = "[Form Autofill]";

const SKIP_TYPES = new Set(["hidden", "file"]);

function buildFieldData(field, id) {
  return {
    id: id,
    name: field.name || null,
    label: getFieldLabel(field),
    input_type: getInputType(field),
    placeholder: field.placeholder || null,
    description: null,
    required: field.required || false,
    value: field.value || null,
  };
}

function scanForms() {
  const allFields = [];

  // Scan fields inside <form> elements
  document.querySelectorAll("form").forEach((form, formIdx) => {
    form
      .querySelectorAll("input, textarea, select")
      .forEach((field, fieldIdx) => {
        const id = field.id || field.name || `field-${formIdx}-${fieldIdx}`;
        allFields.push(buildFieldData(field, id));
      });
  });

  // Scan standalone fields (outside <form>)
  document.querySelectorAll("input, textarea, select").forEach((field, idx) => {
    if (field.closest("form")) return;
    if (SKIP_TYPES.has(field.type)) return;
    if (field.type === "file" && field.style.display === "none") return;

    const id = field.id || field.name || `standalone-${idx}`;
    allFields.push(buildFieldData(field, id));
  });

  const filtered = allFields.filter(
    (f) => f.label && f.label.trim() && f.label !== "no-id",
  );

  console.log(`${LOG_PREFIX} Found ${filtered.length} labeled fields`);
  return filtered;
}

function getInputType(field) {
  const tag = field.tagName.toLowerCase();
  const type = (field.type || "").toLowerCase();

  if (tag === "textarea") return "textarea";
  if (tag === "select") return "select";
  if (type === "file") return "file";
  if (type === "email") return "email";
  if (type === "url") return "url";
  if (type === "tel") return "tel";
  if (type === "number") return "number";
  if (type === "checkbox") return "checkbox";
  if (type === "radio") return "radio";
  return "text";
}

function getFieldLabel(field) {
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label?.textContent.trim()) return label.textContent.trim();
  }

  const parentLabel = field.closest("label");
  if (parentLabel?.textContent.trim()) return parentLabel.textContent.trim();

  const aria = field.getAttribute("aria-label");
  if (aria) return aria;
  if (field.placeholder) return field.placeholder;
  if (field.name) return field.name;

  return field.type || field.tagName.toLowerCase();
}

function fillFields(answers) {
  let filledCount = 0;

  answers.forEach((answer) => {
    let field =
      document.getElementById(answer.field_id) ||
      document.querySelector(`[name="${answer.field_id}"]`);

    // Fuzzy label match
    if (!field) {
      for (const label of document.querySelectorAll("label")) {
        if (
          label.textContent
            .trim()
            .toLowerCase()
            .includes(answer.label.toLowerCase())
        ) {
          const forId = label.getAttribute("for");
          if (forId) {
            field = document.getElementById(forId);
            if (field) break;
          }
        }
      }
    }

    if (!field) return;

    const tag = field.tagName.toLowerCase();
    const type = (field.type || "").toLowerCase();

    if (
      tag === "textarea" ||
      ["text", "email", "url", "tel", "number"].includes(type)
    ) {
      field.value = answer.suggested_answer;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      filledCount++;
    } else if (tag === "select") {
      const match = Array.from(field.options).find(
        (opt) =>
          opt.text
            .toLowerCase()
            .includes(answer.suggested_answer.toLowerCase()) ||
          opt.value
            .toLowerCase()
            .includes(answer.suggested_answer.toLowerCase()),
      );
      if (match) {
        field.value = match.value;
        field.dispatchEvent(new Event("change", { bubbles: true }));
        filledCount++;
      }
    } else if (type === "checkbox") {
      const shouldCheck =
        answer.suggested_answer.toLowerCase().includes("yes") ||
        answer.suggested_answer.toLowerCase().includes("true");
      field.checked = shouldCheck;
      field.dispatchEvent(new Event("change", { bubbles: true }));
      filledCount++;
    } else if (type === "radio") {
      for (const radio of document.querySelectorAll(
        `input[name="${field.name}"]`,
      )) {
        if (
          radio.value.toLowerCase() === answer.suggested_answer.toLowerCase()
        ) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
          filledCount++;
          break;
        }
      }
    }
  });

  console.log(`${LOG_PREFIX} Filled ${filledCount}/${answers.length} fields`);
}

// Message handler
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  try {
    if (request.action === "ping") {
      sendResponse({ status: "pong", url: window.location.href });
    } else if (request.action === "scan") {
      sendResponse({ fields: scanForms() });
    } else if (request.action === "fill") {
      fillFields(request.answers);
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error:`, error);
    sendResponse({ error: error.message });
  }
  return true;
});

window.scanForms = scanForms;
