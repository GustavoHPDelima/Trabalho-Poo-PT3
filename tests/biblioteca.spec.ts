import { Biblioteca } from "../src/models/Biblioteca";
import { Livro } from "../src/models/Livro";
import { AlunoGraduacao } from "../src/models/AlunoGraduacao";
import { Professor } from "../src/models/Professor";
import { Bibliotecario } from "../src/models/Bibliotecario";
import { Emprestimo } from "../src/models/Emprestimo";

describe("Biblioteca - regras de negócio", () => {
  let lib: Biblioteca;

  beforeEach(() => {
    lib = new Biblioteca();

    // livros iniciais
    lib.adicionarLivro(new Livro(1, "Livro A", "Autor X", "111", 2));
    lib.adicionarLivro(new Livro(2, "Livro B", "Autor Y", "222", 3));

    // usuários iniciais
    lib.cadastrarUsuario(new AlunoGraduacao(1, "Aluno A"));
    lib.cadastrarUsuario(new Professor(2, "Prof B"));
    lib.cadastrarUsuario(new Bibliotecario(3, "Bib C"));
  });

  // ------------------------------------------------------------
  test("Aluno não pode ultrapassar limite de 3 empréstimos", () => {
    // cria livros extras para permitir 3 empréstimos
    lib.adicionarLivro(new Livro(10, "L3", "A", "333", 1));
    lib.adicionarLivro(new Livro(11, "L4", "A", "444", 1));
    lib.adicionarLivro(new Livro(12, "L5", "A", "555", 1));

    lib.registrarEmprestimo(1, 1);
    lib.registrarEmprestimo(1, 2);
    lib.registrarEmprestimo(1, 10);

    expect(() => lib.registrarEmprestimo(1, 11)).toThrow(/Limite/);
  });

  // ------------------------------------------------------------
  test("Professor tem limite maior (não trava até 10)", () => {
    const prof = new Professor(99, "Prof Teste");
    lib.cadastrarUsuario(prof);

    // cria 10 livros diferentes só para esse teste
    for (let i = 0; i < 10; i++) {
      const livro = new Livro(
        100 + i,
        `Livro ${i}`,
        "Autor",
        `ISBN-${i}`,
        1
      );
      lib.adicionarLivro(livro);
      lib.registrarEmprestimo(99, 100 + i);
    }

    expect(lib.emprestimosAtivosDoUsuario(99)).toBe(10);
  });

  // ------------------------------------------------------------
  test("Não é possível emprestar quando livro indisponível", () => {
    lib.registrarEmprestimo(1, 1);
    lib.registrarEmprestimo(2, 1);

    expect(() => lib.registrarEmprestimo(1, 1)).toThrow(/indisponível/i);
  });

  // ------------------------------------------------------------
  test("Prazo informado maior que o permitido é limitado ao teto (Aluno 15 dias)", () => {
    const emp = lib.registrarEmprestimo(1, 1, 999); // tenta 999 dias

    const prevista = new Date(emp.devolucaoPrevista);
    const diffDays = Math.round(
      (prevista.getTime() - new Date(emp.dataEmprestimo).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    expect(diffDays).toBeLessThanOrEqual(15);
  });

  // ------------------------------------------------------------
  test("Empréstimo marcado como atrasado após data prevista", () => {
    const emp = lib.registrarEmprestimo(1, 2, 1); // 1 dia
    const registro = lib.emprestimos.find(e => e.id === emp.id)!;

    // força data prevista para 2 dias atrás
    const passada = new Date();
    passada.setDate(passada.getDate() - 2);

    (registro as any).devolucaoPrevista = passada.toISOString();

    lib.emprestimos.forEach(e => e.verificarAtraso());

    expect(registro.status).toBe("atrasado");
  });
});
