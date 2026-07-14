# Mobi Platform v1 Foundations

Validador determinístico de objetos desconhecidos contra JSON Schema Draft 2020-12.

```bash
npm install
npm test
npm run build
npm run coverage
```

Uso:

```ts
import { validate } from "./validator/SchemaValidator";

const result = validate(project);
```

O Validator não corrige, converte nem modifica o objeto recebido. Caminhos de erro usam JSON Pointer.

O `ProjectBuilder` monta exclusivamente a hierarquia oficial a partir de entradas explícitas. `build()` retorna uma cópia validada e `toJSON()` só serializa após validação bem-sucedida.

O `ProjectCodec` é a fronteira textual oficial: `parse(string)` separa erros de sintaxe e schema; `serialize(unknown)` valida antes de produzir JSON e separa falhas de serialização.

O `MobiOrigin` gerencia o ciclo de vida de um projeto ativo e usa um `ProjectRepository` exclusivamente em memória nesta versão.

O `MobiStudio` fornece sessão, estado de apresentação e eventos, delegando todas as operações do Projeto.mobi ao Origin.

O `MobiCopilot` observa eventos públicos do Studio, lê cópias pelo Origin e produz sugestões determinísticas sem alterar ou salvar o projeto.

O RuleSet v1 fornece registro, ativação e execução ordenada de regras técnicas, sem incluir regras reais de produto.

O Mobi Rulebook organiza regras em pacotes registráveis e carregáveis, com carga transacional e sem persistência.

O pacote oficial `mobi.core` adiciona somente diagnósticos estruturais: projeto vazio, IDs duplicados, parentId incoerente e hostId inválido.

O pacote `mobi.cabinetry` adiciona consistência cadastral básica de ambientes, módulos, peças e hardware, sem regras geométricas.

O pacote `mobi.hardware` adiciona integridade cadastral e relacional de host, catálogo, posição e parentId de ferragens.

O pacote `mobi.production` adiciona verificações cadastrais preparatórias de peças, sem CNC, CAM ou geração de arquivos.

O Schema v1 inclui o patch excepcional ADR-007: `Infrastructure.hostId?: uuid | null`, referenciando Architecture.
