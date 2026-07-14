# MIC 1.1.0 — Architect Handoff

O provider vive dentro do Mobi Constructor e adapta resultados já calculados. Consumidores importam exclusivamente o entrypoint público e recebem DTOs MIC versionados.

O Neutral CAM público não recalcula CAM: serializa a geometria de apresentação dos placements calculados pelo Nesting Engine e associa operações industriais existentes às paths.

Fronteiras preservadas: nenhum acesso a Origin, nenhuma escrita em Projeto.mobi, nenhuma alteração na Foundation, nenhuma lógica industrial no Studio, nenhum import de internal exigido dos consumidores e transações somente pelo coordinator injetado.

MIC Version: `1.1.0`. Alterações incompatíveis exigem nova versão contratual.

