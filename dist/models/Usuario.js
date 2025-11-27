"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    constructor(id, nome, tipo) {
        this.id = Number(id);
        this.nome = nome;
        this.tipo = tipo;
    }
    // verifica se ainda pode pegar mais livros
    podeEmprestar(emprestimosAtivos) {
        const { limite } = this.regras();
        return limite === Infinity ? true : emprestimosAtivos < limite;
    }
    toJSON() {
        return { id: this.id, nome: this.nome, tipo: this.tipo };
    }
}
exports.Usuario = Usuario;
