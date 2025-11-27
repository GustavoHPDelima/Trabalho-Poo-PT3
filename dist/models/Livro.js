"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Livro = void 0;
class Livro {
    constructor(id, titulo, autor, isbn, quantidade, disponivel) {
        this.id = Number(id);
        this.titulo = titulo;
        this.autor = autor;
        this.isbn = isbn;
        this.quantidade = Number(quantidade);
        this._disponivel = disponivel == null ? this.quantidade : Number(disponivel);
    }
    get disponivel() {
        return this._disponivel;
    }
    emprestar() {
        if (this._disponivel <= 0)
            throw new Error("Livro indisponível");
        this._disponivel -= 1;
    }
    devolver() {
        this._disponivel = Math.min(this.quantidade, this._disponivel + 1);
    }
    toJSON() {
        return {
            id: this.id,
            titulo: this.titulo,
            autor: this.autor,
            isbn: this.isbn,
            quantidade: this.quantidade,
            disponivel: this._disponivel
        };
    }
    static fromJSON(obj) {
        return new Livro(obj.id, obj.titulo, obj.autor, obj.isbn, obj.quantidade, obj.disponivel ?? obj._disponivel);
    }
}
exports.Livro = Livro;
