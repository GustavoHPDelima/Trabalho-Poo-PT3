import { Usuario } from "./Usuario";

export class Professor extends Usuario {
  constructor(id: number, nome: string) {
    super(id, nome, "Professor");
  }

  regras() {
    return { limite: 10, dias: 30 };
  }

  static fromJSON(obj: any) {
    return new Professor(obj.id, obj.nome);
  }
}
