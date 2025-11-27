"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Professor = void 0;
const Usuario_1 = require("./Usuario");
class Professor extends Usuario_1.Usuario {
    constructor(id, nome) {
        super(id, nome, "Professor");
    }
    regras() {
        return { limite: 10, dias: 30 };
    }
    static fromJSON(obj) {
        return new Professor(obj.id, obj.nome);
    }
}
exports.Professor = Professor;
