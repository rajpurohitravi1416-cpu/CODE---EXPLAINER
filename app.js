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
}

async function run() {
  let input = document.getElementById("input").value;

  if (feature === "image") {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return alert("Upload image");

    const result = await Tesseract.recognize(file, 'eng');
    input = result.data.text;

    document.getElementById("input").value = input;
  }

  let endpoint = `/api/${feature}`;
  let body = { input };

  if (feature === "convert") {
    body.from = document.getElementById("fromLang").value;
    body.to = document.getElementById("toLang").value;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });

  const data = await res.json();

  document.getElementById("output").textContent =
    data.result || data.explanation || "No response";
}