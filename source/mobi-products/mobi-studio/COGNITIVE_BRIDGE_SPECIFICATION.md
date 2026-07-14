# Cognitive Bridge Specification

Assina exclusivamente CognitiveEvents e TransactionEvents, clona eventos defensivamente, encaminha-os aos módulos de apresentação e gerencia start/stop. O estado expõe `ruleProcessing: false`. Nenhum RuleRunner, diagnóstico, proposta ou correção é executado.
