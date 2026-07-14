# G-Code Export Specification v1

## Entrada

- Neutral CAM Package empacotado
- fingerprint atual
- ID de MachineProfile registrado
- timestamp lógico não negativo

## Saída

`GCodePackageSnapshot` contém projeto, fingerprint, perfil e arquivos. Cada arquivo registra controlador, conteúdo, projeto, fingerprint, versão, timestamp lógico e ID do perfil.

## Gate obrigatório

Leitura neutra → fingerprint → perfil/máquina → pós-processamento → sintaxe → dry run → pacote → repository.

Qualquer falha retorna `package: null`. O repository só é atualizado depois de todos os gates, preservando atomicidade e rollback lógico.
