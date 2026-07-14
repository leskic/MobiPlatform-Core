# Mobi Studio Rooms — Architect Handoff

Implementação isolada em `apps/mobi-studio-rooms/`. Room reutiliza `Environment`; não existe entidade nova. A formalização usa `ROOM:` como convenção serializável da extensão em `Environment.code`. O validador é uma regra modular da Products Layer e não modifica RuleRunner ou RuleBook.

Limitação: a Foundation não possui `Room`, `roomWallIds` ou estado de planta. Assim, a associação é derivada das paredes pertencentes ao Environment, e a ordem do loop é recalculada deterministicamente. Mudanças topológicas alteram o Projeto.mobi e, portanto, são visíveis ao Fingerprint/Sync público; uma política futura deverá solicitar revisão produtiva sem alterar esta etapa.

Não foram iniciados Openings, Technical Points ou Appliances.
