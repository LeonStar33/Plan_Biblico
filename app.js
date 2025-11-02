const lector = document.getElementById("lector");
const plan = document.getElementById("plan");

const VERSION = "es-vbl";

// Libros del Nuevo Testamento (orden correcto)
const nuevoTestamento = [
  "mateo", "marcos", "lucas", "juan", "hechos", "romanos", "1corintios",
  "2corintios", "galatas", "efesios", "filipenses", "colosenses",
  "1tesalonicenses", "2tesalonicenses", "1timoteo", "2timoteo", "tito",
  "filemon", "hebreos", "santiago", "1pedro", "2pedro", "1juan", "2juan",
  "3juan", "judas", "apocalipsis"
];

// Libros del plan cíclico
const librosCiclicos = ["proverbios", "salmos"];

// Génesis se lee una vez, junto con el Nuevo Testamento
const libroGenesis = "genesis";

// Base del plan
let planLectura = [];

// Crear plan
function generarPlan() {
  let dia = 1;
  let indiceNT = 0;
  let indiceCiclico = 0;
  let capProverbios = 1, capSalmos = 1, capGenesis = 1;

  while (indiceNT < nuevoTestamento.length) {
    let libroCiclico = librosCiclicos[indiceCiclico % 2];
    let capCiclico = libroCiclico === "proverbios" ? capProverbios : capSalmos;

    planLectura.push({
      dia,
      lecturas: [
        { libro: libroCiclico, capitulo: capCiclico },
        { libro: indiceNT === 0 && capGenesis <= 50 ? libroGenesis : nuevoTestamento[indiceNT], capitulo: indiceNT === 0 && capGenesis <= 50 ? capGenesis : 1 }
      ]
    });

    // Actualizar contadores
    if (libroCiclico === "proverbios") {
      capProverbios++;
      if (capProverbios > 31) capProverbios = 1;
      indiceCiclico++;
    } else {
      capSalmos++;
      if (capSalmos > 150) capSalmos = 1;
      indiceCiclico++;
    }

    if (indiceNT === 0 && capGenesis <= 50) capGenesis++;
    else indiceNT++;

    dia++;
  }
}

// Cargar plan visualmente
function mostrarPlan() {
  plan.innerHTML = "<p>Cargando plan...</p>";
  generarPlan();

  let html = "";
  for (let d of planLectura) {
    html += `<div class="dia">
      <h3>Día ${d.dia}</h3>`;
    d.lecturas.forEach(l => {
      html += `
        <label>
          <input type="checkbox" class="check" data-libro="${l.libro}" data-cap="${l.capitulo}">
          ${capitalizar(l.libro)} ${l.capitulo}
          <button class="leer" data-libro="${l.libro}" data-cap="${l.capitulo}">📖 Leer</button>
        </label>
      `;
    });
    html += "</div>";
  }

  plan.innerHTML = html;
  document.querySelectorAll(".leer").forEach(b => b.addEventListener("click", abrirCapitulo));
}

// Capitaliza títulos
function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Abre un capítulo desde la API
async function abrirCapitulo(e) {
  const libro = e.target.dataset.libro;
  const cap = e.target.dataset.cap;

  lector.classList.remove("oculto");
  plan.classList.add("oculto");
  lector.innerHTML = `<h2>${capitalizar(libro)} ${cap}</h2><p>Cargando...</p>`;

  try {
    const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${VERSION}/books/${libro}/chapters/${cap}.json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Error al conectar a la API");
    const data = await resp.json();

    if (data && data.data && data.data.length > 0) {
      let html = `<button id="volver" class="volver">← Volver al plan de lectura</button><h2>${capitalizar(libro)} ${cap}</h2>`;
      data.data.forEach(v => {
        html += `<p><b>${v.verse}.</b> ${v.text}</p>`;
      });
      lector.innerHTML = html;
      document.getElementById("volver").onclick = volverAlPlan;

      // Guarda respaldo local
      localStorage.setItem(`respaldo_${libro}_${cap}`, JSON.stringify(data));
    } else {
      throw new Error("Formato de respuesta inesperado");
    }
  } catch (err) {
    console.error("Error:", err);
    lector.innerHTML = `<button id="volver" class="volver">← Volver al plan de lectura</button>
    <p>⚠️ No se pudo conectar a la API. Se usará contenido local de respaldo.</p>`;

    const respaldo = localStorage.getItem(`respaldo_${libro}_${cap}`);
    if (respaldo) {
      const data = JSON.parse(respaldo);
      let html = `<h2>${capitalizar(libro)} ${cap}</h2>`;
      data.data.forEach(v => {
        html += `<p><b>${v.verse}.</b> ${v.text}</p>`;
      });
      lector.innerHTML += html;
    } else {
      lector.innerHTML += "<p>No hay respaldo local para este libro.</p>";
    }
  }
}

// Volver al menú principal
function volverAlPlan() {
  lector.classList.add("oculto");
  plan.classList.remove("oculto");
  window.scrollTo(0, 0);
}

// Inicialización
mostrarPlan();
