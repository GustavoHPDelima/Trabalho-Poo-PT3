export class Livro {
  public readonly id: number;
  public titulo: string;
  public autor: string;
  public isbn: string;
  public quantidade: number;
  private _disponivel: number;

  constructor(id: number, titulo: string, autor: string, isbn: string, quantidade: number, disponivel?: number) {
    this.id = Number(id);
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn;
    this.quantidade = Number(quantidade);
    this._disponivel = disponivel == null ? this.quantidade : Number(disponivel);
  }

  get disponivel(): number {
    return this._disponivel;
  }

  emprestar(): void {
    if (this._disponivel <= 0) throw new Error("Livro indisponível");
    this._disponivel -= 1;
  }

  devolver(): void {
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

  static fromJSON(obj: any): Livro {
    return new Livro(obj.id, obj.titulo, obj.autor, obj.isbn, obj.quantidade, obj.disponivel ?? obj._disponivel);
  }
}
