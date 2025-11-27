export type EmprestimoStatus = 'ativo' | 'concluido' | 'atrasado';

export class Emprestimo {
  public readonly id: string;
  public usuarioId: number;
  public livroId: number;
  public dataEmprestimo: string;
  public devolucaoPrevista: string;
  public devolucaoReal: string | null = null;
  public status: EmprestimoStatus;

  constructor(
    id: string,
    usuarioId: number,
    livroId: number,
    dataEmprestimo: Date,
    devolucaoPrevista: Date
  ) {
    this.id = id;
    this.usuarioId = Number(usuarioId);
    this.livroId = Number(livroId);
    this.dataEmprestimo = dataEmprestimo.toISOString();
    this.devolucaoPrevista = devolucaoPrevista.toISOString();
    this.status = 'ativo';
  }

  marcarConcluido() {
    this.status = 'concluido';
    this.devolucaoReal = new Date().toISOString();
  }

  verificarAtraso(now = new Date()) {
    if (this.status !== 'ativo') return;
    const prevista = new Date(this.devolucaoPrevista);
    if (prevista < now) this.status = 'atrasado';
  }

  toJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      livroId: this.livroId,
      dataEmprestimo: this.dataEmprestimo,
      devolucaoPrevista: this.devolucaoPrevista,
      devolucaoReal: this.devolucaoReal,
      status: this.status
    };
  }

  static fromJSON(obj: any) {
    const e = new Emprestimo(obj.id, obj.usuarioId, obj.livroId, new Date(obj.dataEmprestimo), new Date(obj.devolucaoPrevista));
    e.devolucaoReal = obj.devolucaoReal ?? null;
    e.status = obj.status ?? 'ativo';
    return e;
  }
}
