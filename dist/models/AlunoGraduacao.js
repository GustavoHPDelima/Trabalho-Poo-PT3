"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlunoGraduacao = void 0;
const Usuario_1 = require("./Usuario");
class AlunoGraduacao extends Usuario_1.Usuario {
    constructor(id, nome) {
        super(id, nome, "Estudante");
    }
    regras() {
        return { limite: 3, dias: 15 };
    }
    static fromJSON(obj) {
        return new AlunoGraduacao(obj.id, obj.nome);
    }
}
exports.AlunoGraduacao = AlunoGraduacao;
