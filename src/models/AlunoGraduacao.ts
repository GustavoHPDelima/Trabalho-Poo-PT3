import { Usuario } from "./Usuario";

export class AlunoGraduacao extends Usuario {
  constructor(id: number, nome: string) {
    super(id, nome, "Estudante");
  }

  regras() {
    return { limite: 3, dias: 15 };
  }

  static fromJSON(obj: any) {
    return new AlunoGraduacao(obj.id, obj.nome);
  }
}
