# Fase 3 — Interface Gráfica e Apresentação

## Integração com HTML/CSS fornecidos
- Criei um adapter browser (`web/libraryAdapter.js`) que expõe `window.Library` com métodos:
  - `init()`, `listarLivros()`, `listarUsuarios()`, `listarEmprestimos()`, `registrarEmprestimo()`, `registrarDevolucao()`, `adicionarLivro()`, `cadastrarUsuario()`, `resumo()`, `genId()`.
- Atualizei `app.js` (versão browser) para consumir `Library` sem alterar IDs/estrutura do HTML.

## Regras refletidas na UI
- Limites de empréstimo por tipo (Aluno=3/15d, Professor=10/30d, Bibliotecário=ilimitado)
- Mensagens (toasts) para erros como "Limite atingido" ou "Livro indisponível"
- Visualização de empréstimos com status (Ativo / Atrasado / Concluído)

## Preparação da apresentação (roteiro 5 minutos)
1. Slide 1 (30s): Problema e objetivos.
2. Slide 2 (45s): Diagrama de classes e visão POO.
3. Slide 3 (60s): Demonstração — cadastrar usuário, cadastrar livro.
4. Slide 4 (90s): Demonstração — registrar empréstimo (aluno e professor), mostrar bloqueio de limite.
5. Slide 5 (45s): Demonstração — devolução e empréstimo atrasado.
6. Encerramento (30s): lições aprendidas e próximos passos (persistência remota, autenticação).

## Entrega
- Arquivos HTML/CSS/JS prontos (use `web/libraryAdapter.js` + `web/app.js` com seu HTML).
- Arquivos TypeScript para Fase 2 em `src/` e testes em `tests/`.
