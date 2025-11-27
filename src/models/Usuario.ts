export abstract class Usuario {
  public readonly id: number;
  public nome: string;
  public tipo: string;

  constructor(id: number, nome: string, tipo: string) {
    this.id = Number(id);
    this.nome = nome;
    this.tipo = tipo;
  }

  abstract regras(): { limite: number; dias: number };

  // verifica se ainda pode pegar mais livros
  podeEmprestar(emprestimosAtivos: number): boolean {
    const { limite } = this.regras();
    return limite === Infinity ? true : emprestimosAtivos < limite;
  }

  toJSON() {
    return { id: this.id, nome: this.nome, tipo: this.tipo };
  }
}
