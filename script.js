const questions = [
  {
    text: "¿Crees que ahora tengo más proyectos concretos para usar una impresora 3D?",
    options: ["Sí", "No"]
  },
  {
    text: "¿Crees que una impresora podría ser una herramienta útil para aprender diseño 3D, fabricación, electrónica y resolución de problemas?",
    options: ["Sí", "No"]
  },
  {
    text: "¿Te parece razonable juntar el regalo de cumpleaños y Navidad en una sola compra que pueda utilizar durante años?",
    options: ["Sí", "No"]
  },
  {
    text: "¿Crees que el compromiso de mantenerla, aprender a usarla, diseñar modelos y cuidar los materiales es suficiente?",
    options: ["Sí", "No"]
  },
  {
    text: "Después de ver la propuesta completa, ¿estarías dispuesto/a a apoyar la compra?",
    options: ["Sí", "No"]
  }
];

let person = 1;
let current = 0;
let answers = [[], []];

const blocked = [
  "te parece que somos ricos",
  "loco",
  "cara"
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?!¡.,;:()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsBlocked(text) {
  const n = normalize(text);
  return blocked.some(word => n.includes(normalize(word)));
}

function startSurvey(p) {
  person = p;
  current = 0;
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("presenter").classList.add("hidden");
  document.getElementById("handoff").classList.add("hidden");
  document.getElementById("survey").classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  const saved = answers[person - 1][current] || {};

  document.getElementById("phaseLabel").textContent = `PERSONA ${person}`;
  document.getElementById("counter").textContent = `Pregunta ${current + 1} de ${questions.length}`;
  document.getElementById("progressBar").style.width =
    `${((current + 1) / questions.length) * 100}%`;

  document.getElementById("question").innerHTML = `<h2>${q.text}</h2>`;

  const box = document.getElementById("answers");
  box.innerHTML = "";
  q.options.forEach(option => {
    const b = document.createElement("button");
    b.className = "option";
    b.textContent = option;
    if (saved.answer === option) b.classList.add("selected");
    b.onclick = () => choose(option);
    box.appendChild(b);
  });

  const reasonBox = document.getElementById("reasonBox");
  reasonBox.classList.toggle("hidden", saved.answer !== "No");
  document.getElementById("reason").value = saved.reason || "";
  document.getElementById("reasonError").classList.add("hidden");
  document.getElementById("reasonError").textContent = "";
  document.getElementById("backBtn").disabled = current === 0;
  document.getElementById("nextBtn").textContent =
    current === questions.length - 1 ? "Terminar encuesta" : "Continuar →";
}

function choose(answer) {
  answers[person - 1][current] = answers[person - 1][current] || {};
  answers[person - 1][current].answer = answer;
  if (answer !== "No") answers[person - 1][current].reason = "";
  renderQuestion();
}

document.getElementById("reason").addEventListener("input", e => {
  answers[person - 1][current] = answers[person - 1][current] || {};
  answers[person - 1][current].reason = e.target.value;
  document.getElementById("reasonError").classList.add("hidden");
});

function validateCurrent() {
  const a = answers[person - 1][current];
  if (!a?.answer) {
    alert("Primero selecciona Sí o No.");
    return false;
  }
  if (a.answer === "No") {
    const reason = a.reason?.trim() || "";
    if (!reason) {
      alert("Si eliges No, escribe el motivo.");
      return false;
    }
    if (containsBlocked(reason)) {
      const error = document.getElementById("reasonError");
      error.textContent = "Ese motivo contiene una frase o palabra que no está permitida. Escribe el motivo de otra manera.";
      error.classList.remove("hidden");
      return false;
    }
  }
  return true;
}

function nextQuestion() {
  if (!validateCurrent()) return;

  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    finishPerson();
  }
}

function previousQuestion() {
  if (current > 0) {
    current--;
    renderQuestion();
  }
}

function finishPerson() {
  document.getElementById("survey").classList.add("hidden");
  document.getElementById("handoff").classList.remove("hidden");

  if (person === 1) {
    document.getElementById("handoffTitle").textContent = "Pasa el dispositivo a la persona 2";
    document.getElementById("handoffText").textContent =
      "La persona 1 ha terminado. No se muestran sus respuestas. Ahora debe responder la segunda persona.";
    document.getElementById("handoffButton").textContent = "Pasar a la persona 2 →";
  } else {
    document.getElementById("handoffTitle").textContent = "Pásame el dispositivo";
    document.getElementById("handoffText").textContent =
      "Las dos personas han terminado. Las respuestas siguen completamente ocultas. Ahora el dispositivo pasa al presentador.";
    document.getElementById("handoffButton").textContent = "Pasar al presentador →";
  }
}

function continueHandoff() {
  document.getElementById("handoff").classList.add("hidden");
  if (person === 1) {
    startSurvey(2);
  } else {
    document.getElementById("presenter").classList.remove("hidden");
  }
}

function revealAnswers() {
  document.getElementById("presenter").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  let yes = 0, no = 0;
  answers.flat().forEach(a => {
    if (a.answer === "Sí") yes++;
    if (a.answer === "No") no++;
  });

  document.getElementById("resultText").innerHTML =
    `<strong>${yes} respuestas a favor y ${no} en contra.</strong><br>Estas son las respuestas de las dos personas.`;

  const details = document.getElementById("resultDetails");
  details.innerHTML = answers.map((personAnswers, pIndex) => `
    <h3 class="person-title">Persona ${pIndex + 1}</h3>
    ${personAnswers.map((a, i) => `
      <div class="summary">
        <strong>${i + 1}. ${questions[i].text}</strong>
        Respuesta: ${a.answer}
        ${a.answer === "No" ? `<br><strong>Motivo:</strong> ${escapeHtml(a.reason)}` : ""}
      </div>
    `).join("")}
  `).join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function restart() {
  person = 1;
  current = 0;
  answers = [[], []];
  document.getElementById("result").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}
