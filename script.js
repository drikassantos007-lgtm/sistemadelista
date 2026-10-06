const CHAVE = "listas-v1";

const estadoInicial = () => ({
  cur: 0, // índice da aba aberta
  tabs: [
    { name: "Levar",          items: [], f: "" },
    { name: "Comprar",        items: [], f: "" },
    { name: "Fazer no local", items: [], f: "" }
  ]
});

let S = estadoInicial(); 

const dadosAntigos = () => {
  try { return JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { return null; }
};

const salvar = () => salvarNaNuvem(S);

let editando = null; 

const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));

const $ = (id) => document.getElementById(id);

const unicas = (lista) => [...new Set(lista.filter(Boolean))];

function htmlAbas() {
  return S.tabs
    .map((t, i) => `
      <button class="tab ${i == S.cur ? "on" : ""}" data-tab="${i}">
        ${esc(t.name)} (${t.items.length})
      </button>`)
    .join("");
}

function htmlFiltros(categorias, filtroAtual) {
  if (!categorias.length) return "";

  const botoes = categorias
    .map((c) => `
      <button class="chip ${filtroAtual === c ? "on" : ""}" data-f="${esc(c)}">${esc(c)}</button>`)
    .join("");

  return `
    <div class="chips">
      <button class="chip ${!filtroAtual ? "on" : ""}" data-f="">Todas</button>
      ${botoes}
    </div>`;
}

function htmlItemEdicao(item, idx) {
  return `
    <li>
      <div class="edit">
        <input id="et" value="${esc(item.text)}">
        <input id="ec" list="cats" value="${esc(item.cat)}" placeholder="Categoria">
        <button class="go" data-save="${idx}">Salvar</button>
        <button class="ic" data-cancel>Cancelar</button>
      </div>
    </li>`;
}

function htmlItem(item, idx, opcoesAbas) {
  return `
    <li class="${item.done ? "done" : ""}">
      <input type="checkbox" ${item.done ? "checked" : ""} data-chk="${idx}">
      <span class="tx">${esc(item.text)}</span>
      ${item.cat ? `<span class="tag">${esc(item.cat)}</span>` : ""}
      <button class="ic mv" data-up="${idx}" title="Subir">↑</button>
      <button class="ic mv" data-dn="${idx}" title="Descer">↓</button>
      <select class="mv" data-to="${idx}" title="Mover para outra aba">
        <option value="">Mover…</option>${opcoesAbas}
      </select>
      <button class="ic" data-edit="${idx}" title="Editar">✏️</button>
      <button class="ic" data-del="${idx}" title="Excluir">🗑️</button>
    </li>`;
}


/* ---------- 4. TELA (RENDER) ---------- */

function render() {
  const aba = S.tabs[S.cur];

  // Abas no topo
  $("tabs").innerHTML = htmlAbas();

  // Sugestões de categoria (de todas as abas)
  const todasCategorias = unicas(S.tabs.flatMap((t) => t.items.map((i) => i.cat)));
  $("cats").innerHTML = todasCategorias.map((c) => `<option value="${esc(c)}">`).join("");

  // Categorias da aba atual (viram os botões de filtro)
  const categoriasDaAba = unicas(aba.items.map((i) => i.cat));
  if (aba.f && !categoriasDaAba.includes(aba.f)) aba.f = "";

  // Itens visíveis, respeitando o filtro
  const visiveis = aba.items
    .map((item, idx) => ({ item, idx }))
    .filter((o) => !aba.f || o.item.cat === aba.f);

  // Opções do "Mover…" (todas as abas, menos a atual)
  const opcoesAbas = S.tabs
    .map((t, i) => (i == S.cur ? "" : `<option value="${i}">${esc(t.name)}</option>`))
    .join("");

  const htmlLista = visiveis.length
    ? visiveis
        .map(({ item, idx }) =>
          editando === item.id ? htmlItemEdicao(item, idx) : htmlItem(item, idx, opcoesAbas))
        .join("")
    : `<div class="empty">Nada por aqui ainda </div>`;

  $("panel").innerHTML = `
    <div class="title" contenteditable="true" spellcheck="false" id="ttl"
         title="Clique para renomear a aba">${esc(aba.name)}</div>

    <div class="add">
      <input class="t" id="nt" placeholder="Novo item…">
      <input class="c" id="nc" list="cats" placeholder="Categoria (opcional)">
      <button class="go" id="addb">Adicionar</button>
    </div>

    ${htmlFiltros(categoriasDaAba, aba.f)}

    <ul>${htmlLista}</ul>`;

  ligarEventosDoPainel(aba);
}

function ligarEventosDoPainel(aba) {
 
  const titulo = $("ttl");
  titulo.onblur = () => {
    aba.name = titulo.textContent.trim() || aba.name;
    salvar();
    render();
  };
  titulo.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titulo.blur();
    }
  };

  const adicionar = () => {
    const texto = $("nt").value.trim();
    if (!texto) return;

    aba.items.push({
      id: Date.now() + Math.random(),
      text: texto,
      cat: $("nc").value.trim(),
      done: false
    });

    salvar();
    render();
    $("nt").focus();
  };

  $("addb").onclick = adicionar;
  $("nt").onkeydown = (e) => {
    if (e.key === "Enter") adicionar();
  };

  if (editando) {
    $("et").focus();
    $("panel").onkeydown = (e) => {
      if (e.key === "Enter") {
        const botaoSalvar = document.querySelector("[data-save]");
        if (botaoSalvar) botaoSalvar.click();
      }
    };
  } else {
    $("panel").onkeydown = null;
  }
}

document.addEventListener("click", (e) => {
  const d = e.target.dataset;
  const aba = S.tabs[S.cur];
  if (!d) return;

  if (d.tab !== undefined) {                
    S.cur = +d.tab;
    editando = null;

  } else if (d.f !== undefined && e.target.classList.contains("chip")) {
    aba.f = d.f;                           
  } else if (d.del !== undefined) {         
    if (!confirm("Excluir este item?")) return;
    aba.items.splice(+d.del, 1);

  } else if (d.edit !== undefined) {         
    editando = aba.items[+d.edit].id;

  } else if (d.cancel !== undefined) {      
    editando = null;

  } else if (d.save !== undefined) {         
    const item = aba.items[+d.save];
    const texto = $("et").value.trim();
    if (texto) item.text = texto;
    item.cat = $("ec").value.trim();
    editando = null;

  } else if (d.up !== undefined) {         
    const i = +d.up;
    if (i > 0) [aba.items[i - 1], aba.items[i]] = [aba.items[i], aba.items[i - 1]];

  } else if (d.dn !== undefined) {
    const i = +d.dn;
    if (i < aba.items.length - 1) [aba.items[i + 1], aba.items[i]] = [aba.items[i], aba.items[i + 1]];

  } else {
    return;
  }

  salvar();
  render();
});

document.addEventListener("change", (e) => {
  const d = e.target.dataset;
  const aba = S.tabs[S.cur];

  if (d.chk !== undefined) {                 
    aba.items[+d.chk].done = e.target.checked;

  } else if (d.to !== undefined && e.target.value !== "") {
    const [item] = aba.items.splice(+d.to, 1);
    S.tabs[+e.target.value].items.push(item);

  } else {
    return;
  }

  salvar();
  render();
});

$("sair").onclick = sair;

esperarLogin(async (user) => {
  try {
    const nuvem = await carregarDaNuvem(user.uid);
    S = nuvem || dadosAntigos() || estadoInicial();
    if (!nuvem) salvar();
  } catch (e) {
    mostrarStatus("Não foi possível carregar suas listas.");
  }
  render();
});
