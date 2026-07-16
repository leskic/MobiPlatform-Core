# Mobi Gestor — Roadmap

A visão completa (fornecida por Charles em 2026-07-16) descreve um centro
operacional completo: captação de cliente, levantamento multi-formato
(áudio, foto, vídeo, PDF, DWG, IFC, SketchUp...), comercial, engenharia,
produção, CNC, compras, estoque, montagem, pós-venda, financeiro, gestão,
inteligência artificial e uma dezena de integrações externas (WhatsApp,
ERP, Power BI, etc).

Isso é escopo de produto de longo prazo, não de um checkpoint. Registrar
tudo aqui evita perder a visão, e evita também tentar implementar tudo de
uma vez sem especificação real de cada parte.

## Fases propostas

| Fase | Escopo | Status |
|---|---|---|
| CP001 | Fundação: cadastro de Cliente, cadastro de Projeto vinculado, painel "O que precisa de atenção" (atrasado / parado) | **Implementado** |
| CP002 | Comercial: orçamento, negociação, desconto, margem, comissão, motivo de perda | **Implementado — com suposições, ver seção abaixo** |
| CP003 | Levantamento multi-formato: começar por 1-2 formatos reais (ex.: foto + PDF), não os ~20 formatos da visão de uma vez | Não iniciado |
| CP004 | Produção: fila, etapas, responsável, prioridade | Não iniciado |
| CP005 | Compras e estoque: itens faltantes, entrada/saída | Não iniciado |
| CP006 | Financeiro: valor vendido, custos, fluxo de caixa | Não iniciado |
| CP007 | Indicadores/KPIs: setor atrasando, ranking, tempo médio | Não iniciado |
| CP008+ | Integrações externas (WhatsApp, ERP, ferramentas de corte, Power BI) e IA (perguntas em linguagem natural, sugestões) | Não iniciado — cada integração precisa de checkpoint próprio, credenciais e decisão de arquitetura separada |

## Por que começar pelo CP001 assim

A pergunta que mais se repete na visão do Charles é: "o que está atrasado,
quem está parado, qual cliente precisa de atenção". CP001 responde
diretamente a essa pergunta com o menor recorte possível: cliente,
projeto, status, e uma lista derivada de atenção. Sem isso, nenhuma das
fases seguintes (comercial, produção, financeiro) tem uma base para se
apoiar.

## Decisão de arquitetura assumida no CP001

- Segue o mesmo padrão do `mobi-studio-host`: app Vite + TypeScript
  standalone, sem framework, com testes em Vitest.
- Persistência local via `localStorage` (sem backend, sem banco de dados)
  — coerente com o resto do monorepo, que não tem nenhuma infraestrutura
  de servidor/banco hoje. Se o Gestor precisar ser multiusuário/multi-
  dispositivo mais adiante, isso é uma decisão de arquitetura maior que
  precisa de autorização explícita antes do CP002 ou de quando a
  necessidade aparecer.
- Nenhuma integração externa, nenhuma IA, nenhum upload de arquivo neste
  checkpoint — fora de escopo deliberadamente.

## Suposições assumidas no CP002 (implementado durante a madrugada, sem
## confirmação do Charles — revisar e corrigir o que estiver errado)

- **Um orçamento por projeto.** Não modelei múltiplas propostas/versões de
  orçamento por projeto (renegociação vira só uma edição de status/valor
  do mesmo orçamento, não um histórico de versões). Se o real é "cada
  negociação gera um novo orçamento e o cliente compara", isso precisa
  de outro modelo (lista de orçamentos por projeto, não um só).
- **Margem e comissão são só capturadas, não usadas em nenhum cálculo
  ainda.** Não existe dado de custo (material, mão de obra) no sistema
  pra calcular margem de verdade — o campo é só um número que o
  responsável digita. Cálculo real de margem fica para quando existir
  módulo de custo/produção.
- **"Motivo da perda" usa `window.prompt()`** — uma caixa de diálogo
  nativa do navegador, não um formulário desenhado. Foi a forma mais
  rápida de capturar o dado sem inventar um modal novo às pressas de
  madrugada. Deve ser substituído por um formulário de verdade quando
  o design geral do Gestor for revisado.
- **Conversão/funil não foi implementado** (ex.: relatório de "quantos
  orçamentos viram projeto aprovado"). Só o estado atual é mostrado, sem
  histórico agregado.
- **Moeda fixa em BRL**, sem qualquer configuração.
