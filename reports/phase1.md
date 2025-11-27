# Fase 1 — Entendimento e Modelagem (Resumo)

**Situação-problema:** O Centro Universitário AFYA precisa substituir o controle manual de empréstimos por um sistema digital que gerencie estoque, usuários e empréstimos, evitando duplicidade de registros, perda por atrasos e garantindo regras diferentes por tipo de usuário.

## Atores
- **Usuário**: Estudante, Professor, Bibliotecário
- **Bibliotecário/Operador**: administrador do sistema
- **Sistema de Biblioteca**

## Processos principais
- Registrar empréstimo
- Registrar devolução
- Consultar estoque / disponibilidade
- Cadastro de livros e usuários
- Relatórios: empréstimos ativos, atrasados, concluídos

## Diagrama de classes (resumo textual)
- **Livro**: id, titulo, autor, isbn, quantidade, disponivel — métodos: emprestar(), devolver()
- **Usuario (abstrato)**: id, nome, tipo — métodos: regras(), podeEmprestar()
  - **AlunoGraduacao**: limite=3, dias=15
  - **Professor**: limite=10, dias=30
  - **Bibliotecario**: limite=Infinity, dias=60
- **Emprestimo**: id, usuarioId, livroId, dataEmprestimo, devolucaoPrevista, devolucaoReal, status — métodos: verificarAtraso(), marcarConcluido()
- **Biblioteca**: coleções de livros, usuários, emprestimos — métodos: adicionarLivro(), cadastrarUsuario(), registrarEmprestimo(), devolverLivro(), consultarEstoque(), salvar/carregar

## Funcionalidades adicionais modeladas
1. **Atraso automático**: empréstimos são avaliados ao carregar/listar e marcados como `atrasado` se a data prevista passou.
2. **Persistência**: serialização/deserialização para JSON (em Node) e `localStorage` (no browser).

## Justificativa (POO)
- **Encapsulamento**: `Livro` mantém `_disponivel` privado e expõe métodos para operação segura.
- **Herança e Polimorfismo**: `Usuario` define interface `regras()` e as subclasses implementam comportamentos específicos; `Biblioteca` usa polimorfismo ao perguntar `usuario.regras()`.
- **Composição**: `Biblioteca` agrega `Livro`, `Usuario` e `Emprestimo`.
