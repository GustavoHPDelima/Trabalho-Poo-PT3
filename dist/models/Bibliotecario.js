"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bibliotecario = void 0;
const Usuario_1 = require("./Usuario");
class Bibliotecario extends Usuario_1.Usuario {
    constructor(id, nome) {
        super(id, nome, "Bibliotecário");
    }
    // por padrão deixei 10/30 para bibliotecário — se quiser ilimitado, altere limite: Infinity
    regras() {
        return { limite: 10, dias: 30 };
    }
    static fromJSON(obj) {
        return new Bibliotecario(obj.id, obj.nome);
    }
}
exports.Bibliotecario = Bibliotecario;
