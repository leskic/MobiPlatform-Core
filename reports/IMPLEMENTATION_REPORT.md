# Mobi G-Code Foundation v1 — Implementation Report

## Escopo entregue

Implementado `apps/mobi-gcode/` com sessão, controller, repository, contexto, resultado/relatório, registries, leitor CAM neutro, geradores, seis pós-processadores isolados, validação sintática, validação de máquina e fingerprint, dry run, pacote de exportação, eventos, contratos, testes, README e manifest.

Fora do novo aplicativo, somente `tsconfig.json` e `vitest.config.ts` foram atualizados para incluir build e testes.

## Pós-processadores

- Fanuc (`.nc`)
- Homag (`.mpr`)
- Biesse (`.bpp`)
- SCM (`.pgm`)
- Morbidelli (`.xxl`)
- Siemens (`.mpf`)

Cada classe contém sua própria sintaxe. `BasePostProcessor` compartilha apenas montagem do arquivo, metadados obrigatórios e iteração das operações neutras.

## Validações executadas

| Verificação | Resultado |
|---|---:|
| TypeScript strict | aprovado |
| Testes | 313/313 em 32/32 arquivos |
| G-Code statements/lines | 100% |
| G-Code branches | 95,34% |
| G-Code functions | 97,87% |
| Global statements/lines | 99,72% |
| Global branches | 96,62% |
| Global functions | 98,72% |
| Componentes congelados | 441 arquivos inalterados |

## Decisões técnicas

- O timestamp é lógico e fornecido no input; não há dependência de relógio ou ambiente.
- A geração é bloqueada por fingerprint divergente, pacote CAM não empacotado, perfil ausente, operação não suportada, sintaxe inválida ou dry run inválido.
- O repository só recebe pacotes aprovados. Uma falha posterior preserva o último pacote válido, implementando rollback lógico da exportação.
- O módulo lê coordenadas já presentes nas operações neutras e não calcula contornos ou trajetórias.
- Todo arquivo inclui projeto, fingerprint, versão, timestamp lógico e MachineProfile.

## Limitações

Os dialetos implementados validam a arquitetura e o isolamento dos pós-processadores. Eles não constituem programas certificados para execução em máquinas físicas. Não incluem parâmetros tecnológicos, ciclos proprietários completos, seleção física de ferramentas, feeds, speeds ou homologação de fabricante/controlador.

Nenhuma geometria ou trajetória foi calculada e nenhum Projeto.mobi foi alterado.

---

## Patch de Estabilidade — Cross-Product Coupling Audit V1

Foram removidos 39 imports proibidos entre produtos, apps e internals. Studio e Constructor receberam DTOs, fixtures e portas locais, sem modificação de contratos congelados. Um teste arquitetural executável passou a impedir reintrodução desses acoplamentos.

Validação final: build e TypeScript strict aprovados; 612/612 execuções de teste aprovadas; cobertura Studio 100/98,47/100/100 e Constructor 100/97,59/100/100; zero imports cruzados. Três necessidades de contrato público foram registradas como RfE, sem workaround.
