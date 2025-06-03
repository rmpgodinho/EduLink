function adicionarIdioma() {
  const container = document.getElementById("idiomas-container");

  const div = document.createElement("div");
  div.classList.add("idioma-group");

  const inputIdioma = document.createElement("input");
  inputIdioma.name = "idioma[]";
  inputIdioma.placeholder = "Idioma";

  const inputNivel = document.createElement("input");
  inputNivel.name = "nivel[]";
  inputNivel.placeholder = "Nível";

  div.appendChild(inputIdioma);
  div.appendChild(inputNivel);
  container.appendChild(div);
}

document.getElementById("tutorForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  let texto = "Respostas do Candidato:\n\n";
  for (const [key, value] of formData.entries()) {
    if (key !== "ficheiro") {
      texto += `${key}: ${value}\n`;
    }
  }

  const blob = new Blob([texto], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "respostas.txt";
  a.click();

  const file = formData.get("ficheiro");
  if (file && file.name) {
    const fileURL = URL.createObjectURL(file);
    const fileLink = document.createElement("a");
    fileLink.href = fileURL;
    fileLink.download = file.name;
    fileLink.click();
  }

  alert("Formulário submetido! Os ficheiros foram gerados.");
});
