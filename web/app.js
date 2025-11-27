// web/app.js
(() => {
  if (!window.Library) { console.error("Library adapter não encontrado. Certifique-se de carregar libraryAdapter.js antes."); return; }

  Library.init(); // carrega do localStorage ou defaults

  const filters = { status: "todos", busca: "" };
  const sections = document.querySelectorAll(".tab-section");
  const navButtons = document.querySelectorAll(".nav-btn");
  const toastEl = document.getElementById("toast");

  const refs = {
    dashboard: document.getElementById("dashboard-content"),
    livrosGrid: document.getElementById("livros-grid"),
    usuariosTable: document.getElementById("usuarios-table"),
    usuariosCount: document.getElementById("usuarios-count"),
    emprestimosResumo: document.getElementById("emprestimos-resumo"),
    emprestimosTable: document.getElementById("emprestimos-table"),
    buscaEmprestimo: document.getElementById("busca-emprestimo"),
    statusEmprestimo: document.getElementById("status-emprestimo"),
  };

  navButtons.forEach((btn) => { btn.addEventListener("click", () => switchSection(btn.dataset.nav)); });
  document.getElementById("btn-add-livro").addEventListener("click", () => openModal("add-livro"));
  document.querySelectorAll("[data-close-modal]").forEach((btn) => btn.addEventListener("click", () => { const modal = btn.closest(".modal"); if (modal) modal.classList.remove("visible"); }));
  document.querySelectorAll(".modal").forEach((modal) => { modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("visible"); }); });

  document.getElementById("form-add-livro").addEventListener("submit", handleAddLivro);
  document.getElementById("form-usuario").addEventListener("submit", handleAddUsuario);
  document.getElementById("form-emprestimo").addEventListener("submit", handleEmprestimo);

  refs.buscaEmprestimo.addEventListener("input", (e) => { filters.busca = e.target.value.toLowerCase(); renderEmprestimos(); });
  refs.statusEmprestimo.addEventListener("change", (e) => { filters.status = e.target.value; renderEmprestimos(); });

  // export/import UI elements (Fase 3)
  const btnExport = document.getElementById('btn-export-json');
  const btnImport = document.getElementById('btn-import-json');
  const importFileInput = document.getElementById('import-file');
  if (btnExport) btnExport.addEventListener('click', exportDados);
  if (btnImport && importFileInput) {
    btnImport.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (f) importarDadosFromFile(f);
      importFileInput.value = "";
    });
  }

  function switchSection(target) {
    sections.forEach((section) => { section.classList.toggle("active", section.dataset.section === target); });
    navButtons.forEach((btn) => { btn.classList.toggle("active", btn.dataset.nav === target); });
  }

  function openModal(name) { const modal = document.querySelector(`.modal[data-modal="${name}"]`); if (modal) modal.classList.add("visible"); }
  function closeModal(name) { const modal = document.querySelector(`.modal[data-modal="${name}"]`); if (modal) modal.classList.remove("visible"); }
  function showToast(message) { toastEl.textContent = message; toastEl.classList.add("visible"); setTimeout(() => toastEl.classList.remove("visible"), 2200); }

  function handleAddLivro(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const quantidade = Number(data.quantidade);
    if (!data.titulo || !data.autor || !data.isbn || !quantidade) { showToast("Preencha os campos corretamente."); return; }
    const novo = { id: Library.genId(), titulo: data.titulo.trim(), autor: data.autor.trim(), isbn: data.isbn.trim(), quantidade };
    try { Library.adicionarLivro(novo); event.currentTarget.reset(); closeModal("add-livro"); renderAll(); showToast("Livro adicionado com sucesso."); } catch (err) { showToast(err.message || "Erro ao adicionar livro."); }
  }

  function handleAddUsuario(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.nome?.trim()) { showToast("Nome é obrigatório."); return; }
    const novo = { id: Library.genId(), nome: data.nome.trim(), tipo: data.tipo };
    try { Library.cadastrarUsuario(novo); event.currentTarget.reset(); renderAll(); showToast("Usuário cadastrado."); } catch (err) { showToast(err.message || "Erro ao cadastrar usuário."); }
  }

  function handleEmprestimo(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const livroId = Number(data.livroId);
    const usuarioId = Number(data.usuarioId);
    const diasInformados = Number(data.duracao) || undefined;
    try {
      Library.registrarEmprestimo(usuarioId, livroId, diasInformados);
      closeModal("emprestimo");
      renderAll();
      showToast("Empréstimo registrado.");
    } catch (err) {
      showToast(err.message || "Erro ao registrar empréstimo.");
    }
  }

  function registrarDevolucao(emprestimoId) {
    try { Library.registrarDevolucao(emprestimoId); renderAll(); showToast("Empréstimo finalizado."); } catch (err) { showToast(err.message || "Erro na devolução."); }
  }

  // Renderizações
  function renderAll() { renderDashboard(); renderLivros(); renderUsuarios(); renderEmprestimos(); }

  function cardMetric(label, value, accent) {
    return `<article class="panel ${accent}"><p class="section-subtitle">${label}</p><h2>${value}</h2></article>`;
  }

  function autorMaisPopular() {
    const emprestimos = Library.listarEmprestimos();
    const contagem = emprestimos.reduce((acc, e) => {
      const livro = Library.listarLivros().find(l => l.id === e.livroId);
      if (livro) acc[livro.autor] = (acc[livro.autor] || 0) + 1;
      return acc;
    }, {});
    const ordenado = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
    return ordenado[0]?.[0] || "Sem dados";
  }

  function renderDashboard() {
    const livros = Library.listarLivros();
    const totalTitulos = livros.length;
    const totalExemplares = livros.reduce((acc, l) => acc + Number(l.quantidade || 0), 0);
    const livrosDisponiveis = livros.filter(l => l.disponivel > 0).length;
    const livrosIndisponiveis = livros.filter(l => l.disponivel === 0).length;
    const resumo = Library.resumo();

    refs.dashboard.innerHTML = `
      <div class="cards-grid">
        ${cardMetric("Total de títulos", totalTitulos, "border-blue")}
        ${cardMetric("Exemplares", totalExemplares, "border-cyan")}
        ${cardMetric("Usuários", Library.listarUsuarios().length, "border-emerald")}
      </div>
      <div class="cards-grid">
        ${cardMetric("Disponíveis", livrosDisponiveis, "border-green")}
        ${cardMetric("Indisponíveis", livrosIndisponiveis, "border-rose")}
        ${cardMetric("Empréstimos ativos", resumo.ativos, "border-amber")}
      </div>
      <div class="panel">
        <h2>Tendências</h2>
        <ul>
          <li>Concluídos: ${resumo.concluidos}</li>
          <li>Atrasados: ${resumo.atrasados}</li>
          <li>Autor top: ${autorMaisPopular()}</li>
        </ul>
      </div>
    `;
  }

  function renderLivros() {
    const livros = Library.listarLivros();
    refs.livrosGrid.innerHTML = livros
      .map((livro) => {
        const disponibilidade = livro.disponivel > 0 ? `<span class="status-pill available">${livro.disponivel} disponíveis</span>` : `<span class="status-pill unavailable">Indisponível</span>`;
        const disabled = livro.disponivel <= 0 ? "disabled" : "";
        const btnClass = livro.disponivel <= 0 ? "action-btn disabled" : "action-btn success";
        return `
          <article class="book-card">
            <div>
              <h3>${livro.titulo}</h3>
              <p class="book-card__meta">${livro.autor}</p>
              <p class="book-card__meta">ISBN: ${livro.isbn}</p>
            </div>
            ${disponibilidade}
            <button class="${btnClass}" data-emprestar="${livro.id}" ${disabled}>Emprestar</button>
          </article>
        `;
      })
      .join("");

    refs.livrosGrid.querySelectorAll("[data-emprestar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalEmprestimo(Number(btn.dataset.emprestar)));
    });
  }

  function abrirModalEmprestimo(livroId) {
    const livro = Library.listarLivros().find((item) => item.id === livroId);
    if (!livro) return;
    const modal = document.querySelector('.modal[data-modal="emprestimo"]');
    const form = document.getElementById("form-emprestimo");
    const selectUsuarios = form.elements.usuarioId;
    selectUsuarios.innerHTML = Library.listarUsuarios().map((usuario) => `<option value="${usuario.id}">${usuario.nome} (${usuario.tipo})</option>`).join("");
    form.elements.livroId.value = livro.id;
    document.getElementById("emprestimo-livro-info").textContent = `Livro selecionado: ${livro.titulo} (${livro.disponivel} disponíveis)`;
    modal.classList.add("visible");
  }

  function renderUsuarios() {
    const usuarios = Library.listarUsuarios();
    refs.usuariosCount.textContent = `${usuarios.length} no total`;
    refs.usuariosTable.innerHTML = usuarios.map(u => `<tr><td>${u.nome}</td><td>${u.tipo}</td></tr>`).join("");
  }

  function formatarData(dateIso) { if (!dateIso) return "-"; return new Intl.DateTimeFormat("pt-BR").format(new Date(dateIso)); }

  function renderEmprestimos() {
    const resumo = Library.resumo();
    refs.emprestimosResumo.innerHTML = `<span class="chip">Ativos: ${resumo.ativos}</span><span class="chip">Concluídos: ${resumo.concluidos}</span><span class="chip">Atrasados: ${resumo.atrasados}</span>`;

    const emprestimos = Library.listarEmprestimos()
      .filter((emprestimo) => { if (filters.status === "todos") return true; return emprestimo.status === filters.status; })
      .filter((emprestimo) => {
        if (!filters.busca) return true;
        const termo = filters.busca;
        const usuario = Library.listarUsuarios().find(u => u.id === emprestimo.usuarioId);
        const livro = Library.listarLivros().find(l => l.id === emprestimo.livroId);
        return (usuario && usuario.nome.toLowerCase().includes(termo)) || (livro && livro.titulo.toLowerCase().includes(termo));
      })
      .sort((a, b) => {
        const dataA = a.dataEmprestimo ? new Date(a.dataEmprestimo).getTime() : 0;
        const dataB = b.dataEmprestimo ? new Date(b.dataEmprestimo).getTime() : 0;
        return dataB - dataA;
      });

    const linhas = emprestimos.map((emprestimo) => {
      const usuario = Library.listarUsuarios().find(u => u.id === emprestimo.usuarioId) || { nome: "—" };
      const livro = Library.listarLivros().find(l => l.id === emprestimo.livroId) || { titulo: "—" };
      const atrasado = emprestimo.status === "atrasado";
      const statusLabel = atrasado ? "Atrasado" : (emprestimo.status === "ativo" ? "Ativo" : "Concluído");
      const statusClass = atrasado ? "status-pill unavailable" : (emprestimo.status === "concluido" ? "status-pill available" : "status-pill available");
      const button = emprestimo.status === "concluido" ? `<button class="action-btn disabled" disabled>Devolvido</button>` : `<button class="action-btn success" data-devolver="${emprestimo.id}">Registrar devolução</button>`;
      return `<tr><td>${usuario.nome}</td><td>${livro.titulo}</td><td>${formatarData(emprestimo.dataEmprestimo)}</td><td>${formatarData(emprestimo.devolucaoPrevista)}</td><td><span class="${statusClass}">${statusLabel}</span></td><td>${button}</td></tr>`;
    }).join("");

    refs.emprestimosTable.innerHTML = linhas || `<tr><td colspan="6" style="text-align:center; color:#94a3b8;">Sem registros para o filtro atual.</td></tr>`;

    refs.emprestimosTable.querySelectorAll("[data-devolver]").forEach((btn) => {
      btn.addEventListener("click", () => registrarDevolucao(btn.dataset.devolver));
    });
  }

  // ---------- Export / Import ----------
  function exportDados() {
    const payload = { livros: Library.listarLivros(), usuarios: Library.listarUsuarios(), emprestimos: Library.listarEmprestimos() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `biblioteca_afya_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importarDadosFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (obj.livros && obj.usuarios && obj.emprestimos) {
          localStorage.setItem('pooLivros', JSON.stringify(obj.livros));
          localStorage.setItem('pooUsuarios', JSON.stringify(obj.usuarios));
          localStorage.setItem('pooEmprestimos', JSON.stringify(obj.emprestimos));
          Library.carregarLocal();
          renderAll();
          showToast("Dados importados com sucesso.");
        } else {
          showToast("Arquivo inválido: formato esperado não encontrado.");
        }
      } catch (err) {
        showToast("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  }

  // Inicializa visual
  renderAll();
})();
