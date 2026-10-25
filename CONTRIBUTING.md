# Contribuindo

Obrigado por se dispor a contribuir com o **Classificador de Imagens IA**! Este documento estabelece as diretrizes para que a colaboração seja produtiva, respeitosa e alinhada com os padrões de qualidade do projeto.

## Código de Conduta

Ao participar, você concorda em tratar todos com respeito e acolhimento, independentemente de idade, deficiência, etnia, identidade de gênero, nível de experiência, nacionalidade, aparência, raça, religião ou orientação sexual. Assédio de qualquer tipo não será tolerado.

## Como contribuir

1. **Faça um fork** do repositório e crie uma branch a partir de `main`:
   ```bash
   git checkout -b feature/minha-melhoria
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Faça suas alterações** seguindo os padrões de código existentes (ESLint + Prettier).

4. **Valide antes de enviar**:
   ```bash
   npm run lint       # lintagem
   npm run format     # formatação
   npm run test       # testes unitários
   npm run build      # build de produção
   ```

5. **Abra um Pull Request** descrevendo o problema resolvido, a solução adotada e como testar. Vincule a issue relacionada, se houver.

## Padrões de commit

Mensagens no formato `tipo: descrição curta`, em português:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` refatoração sem mudar comportamento
- `docs:` alteração de documentação
- `test:` adição/ajuste de testes
- `chore:` tarefas de build/ferramentas

Exemplo: `feat: adiciona atalhos de teclado para a câmera`

## Revisão

Todo PR precisa de aprovação de pelo menos um mantenedor antes do merge. Mantenha os PRs pequenos e focados para facilitar a revisão.

## Suporte

Dúvidas? Abra uma issue com a etiqueta `question` ou entre em contato pelo LinkedIn do autor.
