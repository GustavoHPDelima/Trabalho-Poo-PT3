// web/libraryAdapter.js
(function (global) {
  const STORAGE_KEYS = {
    livros: "pooLivros",
    usuarios: "pooUsuarios",
    emprestimos: "pooEmprestimos",
  };

  // ==========================
  // MODELO: LIVRO
  // ==========================
  class Livro {
    constructor(id, titulo, autor, isbn, quantidade, disponivel = null) {
      this.id = Number(id);
      this.titulo = titulo;
      this.autor = autor;
      this.isbn = isbn;
      this.quantidade = Number(quantidade);
      this._disponivel = disponivel == null ? this.quantidade : Number(disponivel);
    }

    get disponivel() {
      return this._disponivel;
    }

    emprestar() {
      if (this._disponivel <= 0) throw new Error("Livro indisponível");
      this._disponivel -= 1;
    }

    devolver() {
      this._disponivel = Math.min(this.quantidade, this._disponivel + 1);
    }

    toJSON() {
      return {
        id: this.id,
        titulo: this.titulo,
        autor: this.autor,
        isbn: this.isbn,
        quantidade: this.quantidade,
        disponivel: this._disponivel,
      };
    }

    static fromJSON(o) {
      return new Livro(
        o.id,
        o.titulo,
        o.autor,
        o.isbn,
        o.quantidade,
        o.disponivel ?? o._disponivel
      );
    }
  }

  // ==========================
  // MODELO: USUÁRIO E TIPOS
  // ==========================
  class Usuario {
    constructor(id, nome, tipo) {
      this.id = Number(id);
      this.nome = nome;
      this.tipo = tipo;
    }

    regras() {
      // fallback → nunca usado nos tipos corretos
      return { limite: Infinity, dias: 30 };
    }

    podeEmprestar(ativos) {
      const { limite } = this.regras();
      return limite === Infinity ? true : ativos < limite;
    }

    toJSON() {
      return { id: this.id, nome: this.nome, tipo: this.tipo };
    }

    static fromJSON(o) {
      if (!o) return null;
      if (o.tipo === "Estudante") return new AlunoGraduacao(o.id, o.nome);
      if (o.tipo === "Professor") return new Professor(o.id, o.nome);
      if (o.tipo === "Bibliotecário") return new Bibliotecario(o.id, o.nome);
      return new Usuario(o.id, o.nome, o.tipo);
    }
  }

  class AlunoGraduacao extends Usuario {
    constructor(id, nome) {
      super(id, nome, "Estudante");
    }
    regras() {
      return { limite: 3, dias: 15 };
    }
  }

  class Professor extends Usuario {
    constructor(id, nome) {
      super(id, nome, "Professor");
    }
    regras() {
      return { limite: 10, dias: 30 };
    }
  }

  class Bibliotecario extends Usuario {
    constructor(id, nome) {
      super(id, nome, "Bibliotecário");
    }
    regras() {
      return { limite: 10, dias: 30 };
    }
  }

  // ==========================
  // MODELO: EMPRÉSTIMO
  // ==========================
  class Emprestimo {
    constructor(
      id,
      usuarioId,
      livroId,
      dataEmprestimo,
      devolucaoPrevista,
      devolucaoReal = null,
      status = "ativo"
    ) {
      this.id = id;
      this.usuarioId = Number(usuarioId);
      this.livroId = Number(livroId);
      this.dataEmprestimo = new Date(dataEmprestimo).toISOString();
      this.devolucaoPrevista = new Date(devolucaoPrevista).toISOString();
      this.devolucaoReal = devolucaoReal;
      this.status = status;
    }

    marcarConcluido() {
      this.status = "concluido";
      this.devolucaoReal = new Date().toISOString();
    }

    verificarAtraso(now = new Date()) {
      if (this.status !== "ativo") return;
      if (new Date(this.devolucaoPrevista) < now) this.status = "atrasado";
    }

    toJSON() {
      return {
        id: this.id,
        usuarioId: this.usuarioId,
        livroId: this.livroId,
        dataEmprestimo: this.dataEmprestimo,
        devolucaoPrevista: this.devolucaoPrevista,
        devolucaoReal: this.devolucaoReal,
        status: this.status,
      };
    }

    static fromJSON(o) {
      return new Emprestimo(
        o.id,
        o.usuarioId,
        o.livroId,
        o.dataEmprestimo,
        o.devolucaoPrevista,
        o.devolucaoReal ?? null,
        o.status ?? "ativo"
      );
    }
  }

  // ==========================
  // BIBLIOTECA (BUSINESS LOGIC)
  // ==========================
  class Biblioteca {
    constructor() {
      this.livros = [];
      this.usuarios = [];
      this.emprestimos = [];
    }

    carregarLocal(defaults = null) {
      const rawL = localStorage.getItem(STORAGE_KEYS.livros);
      const rawU = localStorage.getItem(STORAGE_KEYS.usuarios);
      const rawE = localStorage.getItem(STORAGE_KEYS.emprestimos);

      if (rawL && rawU && rawE) {
        try {
          this.livros = JSON.parse(rawL).map(Livro.fromJSON);
          this.usuarios = JSON.parse(rawU).map(Usuario.fromJSON);
          this.emprestimos = JSON.parse(rawE).map(Emprestimo.fromJSON);
          this.emprestimos.forEach((e) => e.verificarAtraso());
          return;
        } catch (err) {
          console.warn("Falha parse localStorage", err);
        }
      }

      if (defaults) {
        this.livros = (defaults.livros || []).map(Livro.fromJSON);
        this.usuarios = (defaults.usuarios || []).map(Usuario.fromJSON);
        this.emprestimos = (defaults.emprestimos || []).map(Emprestimo.fromJSON);
        this.salvarLocal();
      }
    }

    salvarLocal() {
      localStorage.setItem(
        STORAGE_KEYS.livros,
        JSON.stringify(this.livros.map((l) => l.toJSON()))
      );
      localStorage.setItem(
        STORAGE_KEYS.usuarios,
        JSON.stringify(this.usuarios.map((u) => u.toJSON()))
      );
      localStorage.setItem(
        STORAGE_KEYS.emprestimos,
        JSON.stringify(this.emprestimos.map((e) => e.toJSON()))
      );
    }

    adicionarLivro(l) {
      if (this.livros.find((x) => x.id === l.id))
        throw new Error("ID de livro já existe");
      this.livros.push(l);
      this.salvarLocal();
    }

    cadastrarUsuario(u) {
      if (this.usuarios.find((x) => x.id === u.id))
        throw new Error("ID de usuário já existe");
      this.usuarios.push(u);
      this.salvarLocal();
    }

    listarLivros() {
      return this.livros.map((l) => l.toJSON());
    }
    listarUsuarios() {
      return this.usuarios.map((u) => u.toJSON());
    }

    listarEmprestimos() {
      this.emprestimos.forEach((e) => e.verificarAtraso());
      return this.emprestimos.map((e) => e.toJSON());
    }

    emprestimosAtivosDoUsuario(id) {
      return this.emprestimos.filter(
        (e) => e.usuarioId === id && e.status === "ativo"
      ).length;
    }

    // =============================================
    // ** MÉTODO CRÍTICO — REGRAS 100% CORRIGIDAS **
    // =============================================
    registrarEmprestimo(usuarioId, livroId, duracaoDias) {
      const usuario = this.usuarios.find((u) => u.id === Number(usuarioId));
      const livro = this.livros.find((l) => l.id === Number(livroId));

      if (!usuario) throw new Error("Usuário inválido");
      if (!livro) throw new Error("Livro inválido");

      this.emprestimos.forEach((e) => e.verificarAtraso());

      const ativos = this.emprestimosAtivosDoUsuario(usuario.id);
      if (!usuario.podeEmprestar(ativos))
        throw new Error(`Limite atingido para ${usuario.tipo}`);

      if (livro.disponivel <= 0) throw new Error("Livro indisponível");

      const regra = usuario.regras();
      const limiteDias = regra.dias;

      const qtd = Number(duracaoDias);
      const dias =
        qtd > 0 ? Math.min(qtd, limiteDias) : limiteDias;

      const now = new Date();
      const prevista = new Date();
      prevista.setDate(now.getDate() + dias);

      livro.emprestar();

      const emp = new Emprestimo(
        `emp-${Date.now()}`,
        usuario.id,
        livro.id,
        now,
        prevista
      );

      this.emprestimos.push(emp);
      this.salvarLocal();
      return emp;
    }

    registrarDevolucao(id) {
      const emp = this.emprestimos.find((e) => e.id === id);
      if (!emp) throw new Error("Empréstimo não encontrado");
      if (emp.status === "concluido")
        throw new Error("Empréstimo já concluído");

      emp.marcarConcluido();

      const livro = this.livros.find((l) => l.id === emp.livroId);
      if (livro) livro.devolver();

      this.salvarLocal();
      return emp;
    }

    resumoEmprestimos() {
      this.emprestimos.forEach((e) => e.verificarAtraso());
      return {
        ativos: this.emprestimos.filter((e) => e.status === "ativo").length,
        concluidos: this.emprestimos.filter((e) => e.status === "concluido")
          .length,
        atrasados: this.emprestimos.filter((e) => e.status === "atrasado")
          .length,
      };
    }
  }

  // ==========================
  // DEFAULTS (Fase 3)
  // ==========================
  const DEFAULTS = {
    livros: [
      {
        id: 101,
        titulo: "Estruturas de Dados Modernas",
        autor: "Niklaus Wirth",
        isbn: "978-1-40283-101-6",
        quantidade: 8,
        disponivel: 6,
      },
      {
        id: 102,
        titulo: "Arquitetura de Sistemas Distribuídos",
        autor: "Leonard Kleinrock",
        isbn: "978-1-40283-102-3",
        quantidade: 5,
        disponivel: 2,
      },
      {
        id: 103,
        titulo: "Introdução ao Machine Learning",
        autor: "Andrew Ng",
        isbn: "978-1-40283-103-0",
        quantidade: 10,
        disponivel: 10,
      },
      {
        id: 104,
        titulo: "POO com JavaScript",
        autor: "M. Fowler",
        isbn: "978-1-40283-104-7",
        quantidade: 4,
        disponivel: 1,
      },
    ],
    usuarios: [
      { id: 1, nome: "Felipe Bordin", tipo: "Estudante" },
      { id: 2, nome: "Marina Costa", tipo: "Professor" },
      { id: 3, nome: "Carlos Nunes", tipo: "Bibliotecário" },
      { id: 4, nome: "Ana Souza", tipo: "Estudante" },
    ],
    emprestimos: [
      {
        id: "emp-101",
        usuarioId: 1,
        livroId: 101,
        dataEmprestimo: "2025-11-15T12:00:00.000Z",
        devolucaoPrevista: "2025-11-22T12:00:00.000Z",
        devolucaoReal: null,
        status: "ativo",
      },
    ],
  };

  // ==========================
  // API EXPOSTA AO APP.JS
  // ==========================
  const _lib = new Biblioteca();

  const API = {
    init(defaults = null) {
      _lib.carregarLocal(defaults ?? DEFAULTS);
    },
    listarLivros() {
      return _lib.listarLivros();
    },
    listarUsuarios() {
      return _lib.listarUsuarios();
    },
    listarEmprestimos() {
      return _lib.listarEmprestimos();
    },
    registrarEmprestimo(u, l, d) {
      return _lib.registrarEmprestimo(u, l, d);
    },
    registrarDevolucao(id) {
      return _lib.registrarDevolucao(id);
    },
    adicionarLivro(payload) {
      const l = new Livro(
        payload.id,
        payload.titulo,
        payload.autor,
        payload.isbn,
        payload.quantidade
      );
      _lib.adicionarLivro(l);
      return l.toJSON();
    },
    cadastrarUsuario(payload) {
      let usuario;

      if (payload.tipo === "Estudante")
        usuario = new AlunoGraduacao(payload.id, payload.nome);
      else if (payload.tipo === "Professor")
        usuario = new Professor(payload.id, payload.nome);
      else if (payload.tipo === "Bibliotecário")
        usuario = new Bibliotecario(payload.id, payload.nome);
      else usuario = new Usuario(payload.id, payload.nome, payload.tipo);

      _lib.cadastrarUsuario(usuario);
      return usuario.toJSON();
    },
    salvarLocal() {
      _lib.salvarLocal();
    },
    carregarLocal() {
      _lib.carregarLocal(DEFAULTS);
    },
    resumo() {
      return _lib.resumoEmprestimos();
    },
    genId() {
      return Date.now();
    },
  };

  global.Library = API;
})(window);
