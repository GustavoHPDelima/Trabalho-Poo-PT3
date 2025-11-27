/* Browser adapter in TypeScript - compiles to web/libraryAdapter.js for direct use in browser.
   Exports a global "Library" object on window with the methods used by the UI.
*/
import { Livro } from '../src/models/Livro';
import { AlunoGraduacao } from '../src/models/AlunoGraduacao';
import { Professor } from '../src/models/Professor';
import { Bibliotecario } from '../src/models/Bibliotecario';
import { Emprestimo } from '../src/models/Emprestimo';

declare global {
  interface Window { Library?: any }
}

(function (global: any) {
  const STORAGE_KEYS = { livros: 'pooLivros', usuarios: 'pooUsuarios', emprestimos: 'pooEmprestimos' };

  class BibliotecaLocal {
    livros: Livro[] = [];
    usuarios: any[] = [];
    emprestimos: Emprestimo[] = [];

    carregarLocal(defaults: any|null = null) {
      const rawL = localStorage.getItem(STORAGE_KEYS.livros);
      const rawU = localStorage.getItem(STORAGE_KEYS.usuarios);
      const rawE = localStorage.getItem(STORAGE_KEYS.emprestimos);
      if (rawL && rawU && rawE) {
        try {
          this.livros = JSON.parse(rawL).map((x:any) => Livro.fromJSON(x));
          this.usuarios = JSON.parse(rawU).map((u:any) => {
            if (u.tipo === 'Estudante') return AlunoGraduacao.fromJSON(u);
            if (u.tipo === 'Professor') return Professor.fromJSON(u);
            return Bibliotecario.fromJSON(u);
          });
          this.emprestimos = JSON.parse(rawE).map((e:any)=> Emprestimo.fromJSON(e));
          this.emprestimos.forEach(e => e.verificarAtraso());
          return;
        } catch (err) {
          console.warn('Falha parse localStorage', err);
        }
      }
      if (defaults) {
        this.livros = (defaults.livros || []).map((x:any)=> Livro.fromJSON(x));
        this.usuarios = (defaults.usuarios || []).map((u:any)=> {
          if (u.tipo === 'Estudante') return AlunoGraduacao.fromJSON(u);
          if (u.tipo === 'Professor') return Professor.fromJSON(u);
          return Bibliotecario.fromJSON(u);
        });
        this.emprestimos = (defaults.emprestimos || []).map((e:any)=> Emprestimo.fromJSON(e));
        this.salvarLocal();
      }
    }
    salvarLocal() {
      localStorage.setItem(STORAGE_KEYS.livros, JSON.stringify(this.livros.map(l=>l.toJSON())));
      localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify(this.usuarios.map((u:any)=>u.toJSON())));
      localStorage.setItem(STORAGE_KEYS.emprestimos, JSON.stringify(this.emprestimos.map(e=>e.toJSON())));
    }
  }

  // The rest of the implementation mirrors the JS adapter (omitted here for brevity).
  (global as any).Library = (global as any).Library || {};
})(window);
export {};
