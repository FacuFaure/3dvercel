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

let current = 0;
let answers = [];

function startSurvey() {
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("survey").classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  document.getElementById("counter").textContent = `Pregunta ${current + 1} de ${questions.length}`;
  document.getElementById("progressBar").style.width = `${((current + 1) / questions.length) * 100}%`;
  document.getElementById("question").innerHTML = `<h2>${q.text}</h2>`;

  const box = document.getElementById("answers");
  box.innerHTML = "";
  q.options.forEach(option => {
    const b = document.createElement("button");
    b.className = "option";
    b.textContent = option;
    if (answers[current]?.answer === option) b.classList.add("selected");
    b.onclick = () => choose(option);
    box.appendChild(b);
  });

  const reasonBox = document.getElementById("reasonBox");
  reasonBox.classList.toggle("hidden", answers[current]?.answer !== "No");
  document.getElementById("reason").value = answers[current]?.reason || "";
  document.getElementById("backBtn").disabled = current === 0;
  document.getElementById("nextBtn").textContent =
    current === questions.length - 1 ? "Terminar encuesta" : "Continuar →";
}

function choose(answer) {
  answers[current] = answers[current] || {};
  answers[current].answer = answer;
  if (answer !== "No") answers[current].reason = "";
  renderQuestion();
}

document.getElementById("reason").addEventListener("input", e => {
  answers[current] = answers[current] || {};
  answers[current].reason = e.target.value;
});

function nextQuestion() {
  if (!answers[current]?.answer) {
    alert("Primero selecciona Sí o No. Los botones están ahí por alguna razón.");
    return;
  }
  if (answers[current].answer === "No" && !answers[current].reason?.trim()) {
    alert("Si eliges No, escribe el motivo para poder entender la decisión.");
    return;
  }
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showResult();
  }
}

function previousQuestion() {
  if (current > 0) {
    current--;
    renderQuestion();
  }
}

function showResult() {
  document.getElementById("survey").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  const yes = answers.filter(a => a.answer === "Sí").length;
  const no = answers.filter(a => a.answer === "No").length;

  document.getElementById("resultText").innerHTML =
    `<strong>${yes} respuestas a favor y ${no} en contra.</strong><br>` +
    (no === 0
      ? "Todas las respuestas han sido favorables."
      : "Las respuestas negativas incluyen sus motivos para poder hablar de ellos.");

  const details = document.getElementById("resultDetails");
  details.innerHTML = answers.map((a, i) => `
    <div class="summary">
      <strong>${i + 1}. ${questions[i].text}</strong>
      Respuesta: ${a.answer}
      ${a.answer === "No" ? `<br>Motivo: ${escapeHtml(a.reason)}` : ""}
    </div>
  `).join("");

  localStorage.setItem("impresora3d_encuesta", JSON.stringify({
    fecha: new Date().toLocaleString("es-ES"), answers
  }));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function restart() {
  current = 0;
  answers = [];
  document.getElementById("result").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}
