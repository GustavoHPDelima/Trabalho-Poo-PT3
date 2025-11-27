"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emprestimo = void 0;
class Emprestimo {
    constructor(id, usuarioId, livroId, dataEmprestimo, devolucaoPrevista) {
        this.devolucaoReal = null;
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
        if (this.status !== 'ativo')
            return;
        const prevista = new Date(this.devolucaoPrevista);
        if (prevista < now)
            this.status = 'atrasado';
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
    static fromJSON(obj) {
        const e = new Emprestimo(obj.id, obj.usuarioId, obj.livroId, new Date(obj.dataEmprestimo), new Date(obj.devolucaoPrevista));
        e.devolucaoReal = obj.devolucaoReal ?? null;
        e.status = obj.status ?? 'ativo';
        return e;
    }
}
exports.Emprestimo = Emprestimo;
