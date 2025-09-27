// Estado global
let biblia = [];
let progreso = JSON.parse(localStorage.getItem("progreso") || "{}");

// Mapa EN -> ES
const nombresLibros = {
  "Genesis":"Génesis","Exodus":"Éxodo","Leviticus":"Levítico","Numbers":"Números","Deuteronomy":"Deuteronomio",
  "Joshua":"Josué","Judges":"Jueces","Ruth":"Rut","1 Samuel":"1 Samuel","2 Samuel":"2 Samuel",
  "1 Kings":"1 Reyes","2 Kings":"2 Reyes","1 Chronicles":"1 Crónicas","2 Chronicles":"2 Crónicas","Ezra":"Esdras",
  "Nehemiah":"Nehemías","Esther":"Ester","Job":"Job","Psalms":"Salmos","Proverbs":"Proverbios",
  "Ecclesiastes":"Eclesiastés","Song of Solomon":"Cantares","Isaiah":"Isaías","Jeremiah":"Jeremías",
  "Lamentations":"Lamentaciones","Ezekiel":"Ezequiel","Daniel":"Daniel","Hosea":"Oseas","Joel":"Joel",
  "Amos":"Amós","Obadiah":"Abdías","Jonah":"Jonás","Micah":"Miqueas","Nahum":"Nahúm","Habakkuk":"Habacuc",
  "Zephaniah":"Sofonías","Haggai":"Hageo","Zechariah":"Zacarías","Malachi":"Malaquías","Matthew":"Mateo",
  "Mark":"Marcos","Luke":"Lucas","John":"Juan","Acts":"Hechos","Romans":"Romanos","1 Corinthians":"1 Corintios",
  "2 Corinthians":"2 Corintios","Galatians":"Gálatas","Ephesians":"Efesios","Philippians":"Filipenses",
  "Colossians":"Colosenses","1 Thessalonians":"1 Tesalonicenses","2 Thessalonians":"2 Tesalonicenses",
  "1 Timothy":"1 Timoteo","2 Timothy":"2 Timoteo","Titus":"Tito","Philemon":"Filemón","Hebrews":"Hebreos",
  "James":"Santiago","1 Peter":"1 Pedro","2 Peter":"2 Pedro","1 John":"1 Juan","2 John":"2 Juan",
  "3 John":"3 Juan","Jude":"Judas","Revelation":"Apocalipsis"
};

// Índices
const IDX_GENESIS = 0;
const IDX_PSALMS = 18;
const IDX_PROVERBS = 19;
const IDX_NT_START = 39; // Mateo
const IDX_NT_END   = 65; // Apocalipsis

// Utilidades
const nombreES = (idx) => (nombresLibros[biblia[idx].name] || biblia[idx].name);
const capLen   = (idx) => biblia[idx].chapters.length;

// Cargar biblia
fetch("es_rvr.json")
  .then(r => r.json())
  .then(d => {
    biblia = d;
    mostrarPlan();
  })
  .catch(err => {
    console.error("No se pudo cargar es_rvr.json", err);
    document.getElementById("dias").innerHTML = `<p class="small">❌ No se pudo cargar es_rvr.json. Asegúrate de que el archivo esté junto a index.html.</p>`;
  });

function mostrarPlan(){
  const cont = document.getElementById("dias");
  cont.innerHTML = "";

  if (!Array.isArray(biblia) || biblia.length < 66){
    cont.innerHTML = `<p class="small">❌ El archivo de la Biblia no parece válido.</p>`;
    return;
  }

  // Longitudes
  const lenPro = capLen(IDX_PROVERBS);
  const lenPsa = capLen(IDX_PSALMS);
  const lenGen = capLen(IDX_GENESIS);

  let proCap = 1, psaCap = 1, genCap = 1;
  let ntIdx = null, ntCap = null;

  let fase = 1;
  let dia = 1;
  const MAX_DIAS = 20000;

  while (dia < MAX_DIAS){
    const div = document.createElement("div");
    div.id = `dia-${dia}`;
    div.className = "dia";
    div.innerHTML = `<h3>Día ${dia}</h3>`;

    if (fase === 1){
      if (proCap <= lenPro && genCap <= lenGen){
        crearBtn(div, IDX_PROVERBS, proCap, `Dia${dia}_${nombreES(IDX_PROVERBS)}_${proCap}`);
        crearBtn(div, IDX_GENESIS,  genCap, `Dia${dia}_${nombreES(IDX_GENESIS)}_${genCap}`);
        proCap++; genCap++;
      } else {
        // Terminó Proverbios → pasamos a fase 2
        fase = 2;
        psaCap = 1;
        continue; // 👈 vuelve al while en el mismo día
        }

    }
    else if (fase === 2){
      if (genCap <= lenGen){
        crearBtn(div, IDX_PSALMS,   psaCap, `Dia${dia}_${nombreES(IDX_PSALMS)}_${psaCap}`);
        crearBtn(div, IDX_GENESIS,  genCap, `Dia${dia}_${nombreES(IDX_GENESIS)}_${genCap}`);
        psaCap++; genCap++;
      } else {
        // Terminó Génesis → pasamos a fase 3
        fase = 3;
        ntIdx = IDX_NT_START; ntCap = 1;
        continue; // 👈 vuelve al while en el mismo día
        }

    }
    else if (fase === 3){
      if (psaCap <= lenPsa){
        crearBtn(div, IDX_PSALMS, psaCap, `Dia${dia}_${nombreES(IDX_PSALMS)}_${psaCap}`);
        psaCap++;
        if (ntIdx !== null && ntIdx <= IDX_NT_END){
          crearBtn(div, ntIdx, ntCap, `Dia${dia}_${nombreES(ntIdx)}_${ntCap}`);
          avanzarNT();
        } else break;
      } else {
        // Terminó Salmos → pasamos a fase 4 (ciclo con NT)
        fase = 4;
        proCap = 1;
        continue; // 👈 vuelve al while en el mismo día
        }

    }
    else if (fase === 4){
      if (ntIdx !== null && ntIdx > IDX_NT_END){
        const fin = document.createElement("p");
        fin.className = "small";
        fin.textContent = "🎉 Plan completado: Apocalipsis leído.";
        div.appendChild(fin);
        cont.appendChild(div);
        break;
      }
      if (proCap <= lenPro){
        crearBtn(div, IDX_PROVERBS, proCap, `Dia${dia}_${nombreES(IDX_PROVERBS)}_${proCap}`);
        proCap++;
      } else {
        if (psaCap < 1 || psaCap > lenPsa) psaCap = 1;
        crearBtn(div, IDX_PSALMS, psaCap, `Dia${dia}_${nombreES(IDX_PSALMS)}_${psaCap}`);
        psaCap++;
        if (psaCap > lenPsa) proCap = 1;
      }
      if (ntIdx !== null && ntIdx <= IDX_NT_END){
        crearBtn(div, ntIdx, ntCap, `Dia${dia}_${nombreES(ntIdx)}_${ntCap}`);
        avanzarNT();
      } else break;
    }

    if (div.children.length > 1){ cont.appendChild(div); dia++; }
    else break;
  }

  function crearBtn(container, idxLibro, cap, key){
    const libro = biblia[idxLibro];
    if (!libro || !libro.chapters[cap-1]) return;
    const nombre = nombreES(idxLibro);
    const check = progreso[key] ? "✅" : "⬜";
    const btn = document.createElement("button");
    btn.className = "dia-btn";
    btn.textContent = `${check} ${nombre} ${cap}`;
    btn.onclick = (() => () => abrirCapitulo(idxLibro, cap, key))();
    container.appendChild(btn);
  }

  function avanzarNT(){
    const len = capLen(ntIdx);
    ntCap++;
    if (ntCap > len){ ntIdx++; ntCap = 1; }
  }
}

function abrirCapitulo(idxLibro, capitulo, key){
  const libro = biblia[idxLibro];
  if (!libro || !libro.chapters[capitulo-1]) return;
  let html = "";
  libro.chapters[capitulo-1].forEach((verso,i)=>{
    html += `<p><b>${i+1}</b>. ${verso}</p>`;
  });
  const nombre = nombresLibros[libro.name] || libro.name;
  document.getElementById("titulo-verso").innerText = `${nombre} ${capitulo}`;
  document.getElementById("texto-verso").innerHTML = html;
  document.getElementById("plan").classList.add("oculto");
  const lector = document.getElementById("lector");
  lector.classList.remove("oculto");
  lector.scrollTop = 0;
  progreso[key] = true;
  localStorage.setItem("progreso", JSON.stringify(progreso));
  // Ocultar el plan completo (header + lista de días)
  document.getElementById("plan").classList.add("oculto");
  // Mostrar lector
  document.getElementById("lector").classList.remove("oculto");
}

function cerrarVerso() {
  document.getElementById("lector").classList.add("oculto");
  document.getElementById("plan").classList.remove("oculto");
  mostrarPlan(); // vuelve a pintar el progreso
}

function irUltimoDia(){
  const keys = Object.keys(progreso);
  if (!keys.length){ alert("Aún no tienes lecturas registradas."); return; }
  let maxDia = 0;
  for (const k of keys){
    const m = /Dia(\d+)_/.exec(k);
    if (m){ const n=parseInt(m[1],10); if (n>maxDia) maxDia=n; }
  }
  const el = document.getElementById(`dia-${maxDia}`);
  if (el){
    el.scrollIntoView({behavior:"smooth", block:"start"});
    el.classList.add("destacado");
    setTimeout(()=>el.classList.remove("destacado"),1200);
  }
}

function exportarProgreso(){
  const blob = new Blob([JSON.stringify(progreso)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download="progreso.json"; a.click();
  URL.revokeObjectURL(url);
}

function importarProgreso(ev){
  const f=ev.target.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      progreso=JSON.parse(e.target.result);
      localStorage.setItem("progreso",JSON.stringify(progreso));
      mostrarPlan(); alert("✅ Progreso restaurado");
    }catch{ alert("❌ Archivo inválido"); }
  };
  reader.readAsText(f);
}
