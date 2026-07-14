# Post-Processor Specification v1

Um `PostProcessor` declara um controlador e transforma `CAMPackageSnapshot + GCodeMachineProfile + logicalTimestamp` em um único `GCodeFile`.

`BasePostProcessor` cuida somente do cabeçalho obrigatório, ordem neutra das operações, nome do arquivo e composição. Cada fabricante implementa isoladamente comentário, início, comando, encerramento e extensão.

O registry resolve exatamente um processador pelo controlador do perfil. Ausência ou divergência bloqueia a geração. O processamento não pode recalcular geometria, reordenar trajetórias ou alterar o pacote CAM.

Os seis dialetos desta Foundation são contratos determinísticos para validação arquitetural. Exigem homologação específica antes de uso industrial.
