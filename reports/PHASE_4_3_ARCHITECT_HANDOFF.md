# Architect Handoff — Cognitive Layer Phase 4.3

A nova camada somente promove propostas elegíveis de `PENDING` para execução controlada. O commit ocorre pela API pública do `TransactionCoordinator`; o app não importa nem acessa Origin ou Transaction Engine. Golden Rules são descritores locais que referenciam IDs oficiais do RuleRunner sem modificar regras congeladas.

Walls, Rooms, Openings e topologia são bloqueados por política. O escopo implementado corrige apenas referência de material ausente. A plataforma deve permanecer parada até auditoria arquitetural.
