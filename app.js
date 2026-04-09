let editor;

require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: "// Paste your code here",
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true
  });

  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: () => {
      return {
        suggestions: [
          {
            label: "public",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "public ",
            detail: "keyword"
          },
          {
            label: "print",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "console.log()",
            detail: "log output"
          }
        ]
      };
    }
  });

});

let feature = "explain";

function setFeature(f) {
  feature = f;

  const title = document.getElementById("title");
  const textarea = document.getElementById("input");
  const langBox = document.getElementById("langSelectors");
  const imageInput = document.getElementById("imageInput");
  
  langBox.style.display = "none";
  imageInput.style.display = "none";

  if (f === "explain") {
    title.innerText = "Explain Code";
    textarea.placeholder = "Paste code to explain...";

  } else if (f === "convert") {
    title.innerText = "Convert Code";
    textarea.placeholder = "Paste code to convert...";
    langBox.style.display = "block";

  } else if (f === "optimize") {
    title.innerText = "Optimize Code";
    textarea.placeholder = "Paste code to optimize...";

  } else if (f === "compress") {
    title.innerText = "Compress Code";
    textarea.placeholder = "Paste large code...";

  } else if (f === "prompt") {
    title.innerText = "Prompt → Code";
    textarea.placeholder = "Describe what you want...";

  } else if (f === "fill") {
    title.innerText = "Complete Code";
    textarea.placeholder = "Paste half code...";

  } else if (f === "image") {
    title.innerText = "Image → Code";
    textarea.placeholder = "Upload image...";
    imageInput.style.display = "block";
  }
else if (f === "line-explain") {
  title.innerText = "Explain Selected Line";
}
  
}

async function run() {
  let selection = editor.getSelection();
let input = editor.getModel().getValueInRange(selection);

// fallback if nothing selected
if (!input) {
  input = editor.getValue();
}

  document.getElementById("output").textContent = "⚡ Processing...";
switchTab("output");

  let detectedLang = detectLanguage(input);if (editor) {
  let lang = "plaintext";

  if (f === "explain" || f === "optimize" || f === "compress") {
    lang = "javascript"; // temporary default
  }

  monaco.editor.setModelLanguage(editor.getModel(), lang);
}

// update Monaco editor language
if (editor) {
  monaco.editor.setModelLanguage(editor.getModel(), detectedLang);
}

  if (feature === "image") {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return alert("Upload image");

    const result = await Tesseract.recognize(file, 'eng');
    input = result.data.text;

    editor.setValue(input);
  }

  let endpoint = `/api/${feature}`;
  let body = {
  input,
  language: detectedLang
};
  if (feature === "convert") {
    body.from = document.getElementById("fromLang").value;
    body.to = document.getElementById("toLang").value;
  }

  if (feature === "line-explain") {
  endpoint = "/api/line-explain";
}

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });

  const data = await res.json();

  document.getElementById("output").textContent =
    data.result || data.explanation || "No response";

    switchTab("output");
}
function detectLanguage(code) {
  code = code.toLowerCase();

  if (code.includes("#include") || code.includes("printf")) return "c";
  if (code.includes("public static void main")) return "java";
  if (code.includes("def ") || code.includes("print(")) return "python";
  if (code.includes("console.log") || code.includes("function")) return "javascript";
  if (code.includes("using namespace std")) return "cpp";

  return "plaintext";
}

function switchTab(tab) {
  document.getElementById("editorTab").style.display =
    tab === "editor" ? "block" : "none";

  document.getElementById("outputTab").style.display =
    tab === "output" ? "block" : "none";

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => t.classList.remove("active"));

  if (tab === "editor") tabs[0].classList.add("active");
  else tabs[1].classList.add("active");
}