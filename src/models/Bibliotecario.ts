import { Usuario } from "./Usuario";

export class Bibliotecario extends Usuario {
  constructor(id: number, nome: string) {
    super(id, nome, "Bibliotecário");
  }

  // por padrão deixei 10/30 para bibliotecário — se quiser ilimitado, altere limite: Infinity
  regras() {
    return { limite: 10, dias: 30 };
  }

  static fromJSON(obj: any) {
    return new Bibliotecario(obj.id, obj.nome);
  }
}
