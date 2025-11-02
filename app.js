// ===================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ===================================
const version = "es-vbl"; // versión preferida de la Biblia (API)
let biblia = [];
let progreso = JSON.parse(localStorage.getItem("progreso") || "{}");

// ==========================
// MAPA DE LIBROS (Español → API)
// ==========================
const librosMap = {
  "Génesis": "génesis",
  "Éxodo": "éxodo",
  "Levítico": "levítico",
  "Números": "números",
  "Deuteronomio": "deuteronomio",
  "Josué": "josué",
  "Jueces": "jueces",
  "Rut": "rut",
  "1 Samuel": "1samuel",
  "2 Samuel": "2samuel",
  "1 Reyes": "1reyes",
  "2 Reyes": "2reyes",
  "1 Crónicas": "1crónicas",
  "2 Crónicas": "2crónicas",
  "Esdras": "esdras",
  "Nehemías": "nehemías",
  "Ester": "ester",
  "Job": "job",
  "Salmos": "salmos",
  "Proverbios": "proverbios",
  "Eclesiastés": "eclesiastés",
  "Cantares": "cantares",
  "Isaías": "isaías",
  "Jeremías": "jeremías",
  "Lamentaciones": "lamentaciones",
  "Ezequiel": "ezequiel",
  "Daniel": "daniel",
  "Oseas": "oseas",
  "Joel": "joel",
  "Amós": "amós",
  "Abdías": "abdías",
  "Jonás": "jonás",
  "Miqueas": "miqueas",
  "Nahúm": "nahúm",
  "Habacuc": "habacuc",
  "Sofonías": "sofonías",
  "Hageo": "hageo",
  "Zacarías": "zacarías",
  "Malaquías": "malaquías",
  "Mateo": "mateo",
  "Marcos": "marcos",
  "Lucas": "lucas",
  "Juan": "juan",
  "Hechos": "hechos",
  "Romanos": "romanos",
  "1 Corintios": "1corintios",
  "2 Corintios": "2corintios",
  "Gálatas": "gálatas",
  "Efesios": "efesios",
  "Filipenses": "filipenses",
  "Colosenses": "colosenses",
  "1 Tesalonicenses": "1tesalonicenses",
  "2 Tesalonicenses": "2tesalonicenses",
  "1 Timoteo": "1timoteo",
  "2 Timoteo": "2timoteo",
  "Tito": "tito",
  "Filemón": "filemón",
  "Hebreos": "hebreos",
  "Santiago": "santiago",
  "1 Pedro": "1pedro",
  "2 Pedro": "2pedro",
  "1 Juan": "1juan",
  "2 Juan": "2juan",
  "3 Juan": "3juan",
  "Judas": "judas",
  "Apocalipsis": "apocalipsis"
};

// =========================================================
// CARGA DEL PLAN PRINCIPAL (usa API o fallback local)
// =========================================================
function iniciarPlan() {
  const diasCont = document.getElementById("dias");
  diasCont.innerHTML = "<p>Cargando plan...</p>";

  // Intentar cargar plan básico desde local o API
  try {
    fetch("es_rvr.json") // respaldo local
      .then((r) => r.json())
      .then((d) => {
        biblia = d;
        mostrarPlan();
      })
      .catch(() => {
        diasCont.innerHTML =
          "<p>No se pudo cargar el plan. Verifica tu conexión o el archivo local.</p>";
      });
  } catch (e) {
    diasCont.innerHTML = "<p>Error al iniciar el plan.</p>";
  }
}

// =========================================================
// MOSTRAR PLAN (estructura de días)
// =========================================================
function mostrarPlan() {
  const cont = document.getElementById("dias");
  cont.innerHTML = "";

  const libros = ["Proverbios", "Salmos", "Génesis", "Mateo", "Marcos", "Lucas", "Juan", "Hechos", "Romanos", "Apocalipsis"];
  let dia = 1;

  // Ejemplo de 60 días (puedes ajustar según tu orden completo)
  for (let i = 0; i < 60; i++) {
    const div = document.createElement("div");
    div.className = "dia";
    div.id = `dia-${dia}`;
    div.innerHTML = `<h3>Día ${dia}</h3>`;

    // Alterna Proverbios / Salmos y Nuevo Testamento
    const libroSab = i % 2 === 0 ? "Proverbios" : "Salmos";
    const libroNT = libros[(i % libros.length)];

    crearBtn(div, libroSab, 1, `Dia${dia}_${libroSab}_1`);
    crearBtn(div, libroNT, 1, `Dia${dia}_${libroNT}_1`);

    cont.appendChild(div);
    dia++;
  }
}

// =========================================================
// CREAR BOTÓN DE CAPÍTULO
// =========================================================
function crearBtn(container, libro, cap, key) {
  const check = progreso[key] ? "✅" : "⬜";
  const btn = document.createElement("button");
  btn.className = "dia-btn";
  btn.textContent = `${check} ${libro} ${cap}`;
  btn.onclick = () => abrirCapitulo(libro, cap, key);
  container.appendChild(btn);
}

// =========================================================
// ABRIR CAPÍTULO DESDE API (con fallback local)
// =========================================================
function abrirCapitulo(libroES, capitulo, key) {
  const libroAPI = librosMap[libroES];
  const lector = document.getElementById("lector");
  const plan = document.getElementById("plan");
  const titulo = document.getElementById("titulo-verso");
  const texto = document.getElementById("texto-verso");

  plan.classList.add("oculto");
  lector.classList.remove("oculto");

  titulo.innerText = `${libroES} ${capitulo}`;
  texto.innerHTML = "<p>Cargando capítulo...</p>";

  const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${libroAPI}/chapters/${capitulo}.json`;

  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      if (!data.verses || !data.verses.length) throw new Error("Sin datos");

      let html = "";
      data.verses.forEach((v) => {
        html += `<p><b style="color:#ccff00">${v.verse}</b>. ${v.text}</p>`;
      });
      texto.innerHTML = html;

      progreso[key] = true;
      localStorage.setItem("progreso", JSON.stringify(progreso));
    })
    .catch(() => {
      // FALLBACK: usar texto local si falla la API
      texto.innerHTML = `<p style="opacity:.8;">⚠️ No se pudo conectar a la API. 
      Se usará contenido local de respaldo.</p>`;

      const localLibro = biblia.find((l) => l.name.toLowerCase().includes(libroES.toLowerCase()));
      if (localLibro && localLibro.chapters[capitulo - 1]) {
        let html = "";
        localLibro.chapters[capitulo - 1].forEach((verso, i) => {
          html += `<p><b style="color:#ccff00">${i + 1}</b>. ${verso}</p>`;
        });
        texto.innerHTML += html;
      } else {
        texto.innerHTML += "<p>No hay respaldo local para este libro.</p>";
      }
    });
}

// =========================================================
// BOTÓN "VOLVER"
// =========================================================
function cerrarVerso() {
  document.getElementById("lector").classList.add("oculto");
  document.getElementById("plan").classList.remove("oculto");
}

// =========================================================
// EXPORTAR / IMPORTAR PROGRESO
// =========================================================
function exportarProgreso() {
  const blob = new Blob([JSON.stringify(progreso)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "progreso.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importarProgreso(ev) {
  const f = ev.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      progreso = JSON.parse(e.target.result);
      localStorage.setItem("progreso", JSON.stringify(progreso));
      mostrarPlan();
      alert("✅ Progreso importado correctamente");
    } catch {
      alert("❌ Archivo inválido");
    }
  };
  reader.readAsText(f);
}

// =========================================================
// INICIAR TODO
// =========================================================
window.addEventListener("load", iniciarPlan);
