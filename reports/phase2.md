# Fase 2 — Implementação em TypeScript (Resumo das entregas)

## O que foi implementado
- Projeto TypeScript com classes (src/models) correspondentes ao diagrama da Fase 1.
- Métodos principais em `Biblioteca`: `adicionarLivro`, `cadastrarUsuario`, `registrarEmprestimo`, `devolverLivro`, `consultarEstoque`, `salvarDados`, `carregarDados`.
- Exceções tratadas: usuário inválido, livro indisponível, limite atingido, empréstimo inexistente.
- **Persistência**:
  - Node.js: salvar/carregar JSON via métodos `salvarDados(path)` e `carregarDados(path)`.
  - Browser: adapter `Library` que usa `localStorage` e fornece API para a UI.
- **Testes unitários (Jest)** cobrindo cenários normais e de erro (exemplos em `tests/`).

## Observações sobre testes
- Os testes verificam limites por tipo, atualização de disponibilidade no empréstimo/devolução e erro quando o livro não tem exemplares.
- Meta de cobertura: >= 80% (o conjunto fornecido é um ponto inicial; é possível estender).

## Dificuldades e soluções
- Serialização de classes: implementada via `toJSON()`/`fromJSON()` em cada classe para preservar estado.
- Atrasos: definidos como mudança de status e recalculados ao carregar/listar.
