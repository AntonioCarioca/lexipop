function createDialog() {
  const backdrop = document.createElement("div");
  backdrop.id = "dic-backdrop";

  const dialog = document.createElement("div");
  dialog.id = "dic-dialog";

  const close = document.createElement("button");
  close.className = "close";
  close.innerHTML = "&times;";
  close.onclick = () => backdrop.remove();

  const content = document.createElement("div");
  content.id = "dic-content";
  content.innerHTML = "<p>Carregando definição...</p>";

  dialog.appendChild(close);
  dialog.appendChild(content);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  return content;
}

async function fetchDefinition(word) {
  const url = `https://pt.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&format=json&origin=*`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) return null;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(data.parse.text["*"], "text/html");

    const ol = htmlDoc.querySelector("ol");
    if (!ol) return null;

    const definitions = Array.from(ol.querySelectorAll("li"))
      .slice(0, 3)
      .map(li => li.textContent.trim());

    return definitions;
  } catch {
    return null;
  }
}

document.addEventListener("click", async (e) => {
  if (!e.ctrlKey) return;

  const selection = window.getSelection().toString().trim();
  if (!selection || /\s/.test(selection)) return;

  const content = createDialog();
  const defs = await fetchDefinition(selection.toLowerCase());

  if (!defs) {
    content.innerHTML = `<p>Não foi possível encontrar definição para "<strong>${selection}</strong>".</p>`;
    return;
  }

  content.innerHTML = `<h2>${selection}</h2><ul>${defs.map(d => `<li>${d}</li>`).join("")}</ul>`;
});