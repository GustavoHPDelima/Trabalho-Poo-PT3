import { Livro } from './Livro';
import { Usuario } from './Usuario';
import { AlunoGraduacao } from './AlunoGraduacao';
import { Professor } from './Professor';
import { Bibliotecario } from './Bibliotecario';
import { Emprestimo } from './Emprestimo';

export class Biblioteca {
  livros: Livro[] = [];
  usuarios: Usuario[] = [];
  emprestimos: Emprestimo[] = [];

  constructor() {}

  adicionarLivro(l: Livro) {
    if (this.livros.find(x => x.id === l.id)) throw new Error('ID de livro já existe');
    this.livros.push(l);
  }

  cadastrarUsuario(u: Usuario) {
    if (this.usuarios.find(x => x.id === u.id)) throw new Error('ID de usuário já existe');
    this.usuarios.push(u);
  }

  consultarEstoque(): Livro[] {
    return this.livros.map(l => l);
  }

  emprestimosAtivosDoUsuario(usuarioId: number): number {
    return this.emprestimos.filter(e => e.usuarioId === usuarioId && e.status === 'ativo').length;
  }

  registrarEmprestimo(usuarioId: number, livroId: number, duracaoDias?: number): Emprestimo {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    const livro = this.livros.find(l => l.id === livroId);
    if (!usuario) throw new Error('Usuário inválido');
    if (!livro) throw new Error('Livro inválido');

    // atualizar atrasos antes de validar limites
    this.emprestimos.forEach(e => e.verificarAtraso());

    const ativos = this.emprestimosAtivosDoUsuario(usuarioId);
    if (!usuario.podeEmprestar(ativos)) throw new Error(`Limite atingido para ${usuario.tipo}`);

    if (livro.disponivel <= 0) throw new Error('Livro indisponível');

    // regras de prazo por tipo
    const regra = usuario.regras();
    // se duracaoDias foi informada, respeitar teto (Math.min)
    const dias = (duracaoDias && Number(duracaoDias) > 0) ? Math.min(Number(duracaoDias), regra.dias) : regra.dias;

    const now = new Date();
    const prevista = new Date(now);
    prevista.setDate(prevista.getDate() + dias);

    // atualizar estoque e registrar emprestimo
    livro.emprestar();

    const emprestimo = new Emprestimo(`emp-${Date.now()}`, usuarioId, livroId, now, prevista);
    this.emprestimos.push(emprestimo);
    return emprestimo;
  }

  devolverLivro(emprestimoId: string) {
    const emprestimo = this.emprestimos.find(e => e.id === emprestimoId);
    if (!emprestimo) throw new Error('Empréstimo não encontrado');
    if (emprestimo.status === 'concluido') throw new Error('Empréstimo já concluído');

    emprestimo.marcarConcluido();
    const livro = this.livros.find(l => l.id === emprestimo.livroId);
    if (livro) livro.devolver();
  }

  resumoEmprestimos() {
    // atualiza atrasos
    this.emprestimos.forEach(e => e.verificarAtraso());
    const ativos = this.emprestimos.filter(e => e.status === 'ativo').length;
    const concluidos = this.emprestimos.filter(e => e.status === 'concluido').length;
    const atrasados = this.emprestimos.filter(e => e.status === 'atrasado').length;
    return { ativos, concluidos, atrasados };
  }
}
