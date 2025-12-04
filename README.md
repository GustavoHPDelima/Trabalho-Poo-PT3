# Projeto: Biblioteca AFYA

Inclui:
- Código TypeScript em `src/`
- Adapter browser em `web/libraryAdapter.js` e `web/app.js`
- Testes em `tests/`
- Relatórios em `reports/`

## Como usar (modo rápido - browser)
1. Copie os arquivos `web/libraryAdapter.js`, `web/app.js`, e seu `index.html`/`styles.css` (os que você me enviou) para a mesma pasta.
2. No `index.html` inclua, antes de `app.js`:
   ```html
   <script src="./web/libraryAdapter.js"></script>
   <script defer src="./web/app.js"></script>
   ```
3. Abra o `index.html` no navegador. Na primeira execução os dados default serão gravados no localStorage.

## Como usar (modo Node / TypeScript)
1. Instale dependências:
   ```bash
   npm install
   ```
2. Compile:
   ```bash
   npm run build
   ```
3. Rode os testes:
   ```bash
   npm test
   ```

## Arquivos relevantes
- `src/models/*` - classes TypeScript
- `web/libraryAdapter.js` - adapter para browser (compatível com seu HTML)
- `web/app.js` - UI integration (versão browser)
- `reports/` - relatórios em Markdown (Fase 1-3)
- `tests/` - testes unitários Jest

## Roteiro para apresentação (5 minutos)
Veja `reports/phase3.md` para roteiro detalhado.

