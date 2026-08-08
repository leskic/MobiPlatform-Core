# Mobi Gestor — Manual de Uso

Guia prático de como usar o Gestor no dia a dia da marcenaria. Não é
documentação técnica — isso fica no `ROADMAP.md`, pra quem for mexer
no código.

## Como abrir

**Opção 1 — o `.exe` (mais simples):**
Dá dois cliques em
`release\MobiGestor-win32-x64\MobiGestor.exe`. Abre numa janela
própria, sem precisar de navegador.

**Opção 2 — instalado como app do navegador (PWA):**
Se você instalou pelo Chrome/Edge, procure o ícone "Mobi Gestor" no
menu iniciar ou na área de trabalho, igual qualquer outro programa.

**Opção 3 — modo desenvolvimento (só se for mexer no código):**
```bash
npm run dev
```
e abrir `http://127.0.0.1:5174` no navegador.

## Onde ficam os dados

Tudo é salvo **só neste computador/navegador**, no armazenamento local
do app (não tem nuvem, não tem servidor). Isso quer dizer:

- Se abrir em outro computador, começa vazio — não sincroniza sozinho.
- Se limpar o cache do navegador (ou desinstalar o `.exe` e apagar a
  pasta), os dados somem. Não existe backup automático hoje.
- O `.exe` e a versão instalada como PWA guardam dados **separados**
  um do outro, mesmo sendo o mesmo app — são "gavetas" diferentes do
  navegador/sistema.

## Fluxo de trabalho, passo a passo

### 1. Cadastrar cliente

Painel **Clientes**, no topo. Nome, telefone, e-mail — o básico pra
identificar quem é.

### 2. Criar o projeto

Painel **Projetos**, vinculado a um cliente já cadastrado. O projeto
nasce com status `NOVO`.

### 3. Levantamento (importar PDF)

Dentro do projeto, dá pra importar um PDF de levantamento (planta,
lista de itens) — o sistema tenta extrair os itens automaticamente,
mas **sempre revise antes de confirmar** (é heurística, não é 100%).

### 4. Orçamento (Comercial)

Cadastrar valor, desconto, margem e comissão. Status vai de
`Aberto` → `Negociando` → `Aprovado` (ou `Perdido`, com motivo).
Quando aprovado, o projeto avança pro fluxo de produção.

### 5. Produção — fila de trabalho

Painel com 5 colunas fixas, nessa ordem:
**Fila → Corte → Montagem estrutura → Acabamento → Entrega**.

Cada projeto em produção mostra o responsável e a prioridade. Mover um
projeto de coluna atualiza a etapa dele. Se um projeto ficar tempo
demais sem mexer, ele aparece como **"parado"** no painel de atenção
(seção 8).

### 6. Fechamento do projeto

Ao concluir, registra-se o **custo real** (matéria-prima, mão de obra,
custo fixo) e compara com o que foi orçado — mostra se deu lucro ou
prejuízo real, não só o previsto. Também é aqui que se registra
qualquer **mudança de escopo** que aconteceu no meio do caminho.

### 7. Compras e estoque

Painel separado, não depende de estar dentro de um projeto:

- **Ferragem** (dobradiça, corrediça, puxador, parafuso...) = item
  **compartilhado**, mesmo estoque pra todo mundo, com quantidade
  mínima de alerta.
- **MDF** = item **por cliente** — cada combinação cor+cliente vira um
  item separado (ex.: "MDF Branco 15mm — Torres" é diferente de "MDF
  Branco 15mm — Ana e Bruno"), porque MDF de cliente diferente não se
  mistura no estoque.
- **Entrada** de estoque exige fornecedor e preço de compra (pra
  rastreio de custo). **Saída** exige vincular a um projeto (pra saber
  pra onde foi).

### 8. Painel "O que precisa da sua atenção"

Fica no topo da tela principal. Mostra automaticamente:
- Projetos **atrasados** ou **parados** (sem mexer há muito tempo).
- Itens de estoque **abaixo da quantidade mínima**.

Não precisa ir atrás — ele já avisa.

### 9. Financeiro

Só leitura, sem cadastro próprio — calcula em cima do que já foi
lançado:
- **Valor vendido** = soma dos orçamentos fechados.
- **Custo total** = custo real dos fechamentos + compras de estoque.
- **Fluxo de caixa por mês** — entradas (vendas fechadas) x saídas
  (compras de estoque).

### 10. Indicadores

Também só leitura:
- **Etapas atrasando** — quantos projetos parados em cada etapa de
  produção agora.
- **Ranking de responsável** — quem mais concluiu projetos.
- **Tempo médio** do início do projeto até o fechamento do orçamento,
  em dias.

## Perguntas comuns

**"Apaguei um item de estoque, dá pra recuperar?"**
Não tem lixeira/desfazer hoje — apagar é definitivo. Confira antes.

**"Posso usar no celular?"**
Se instalado como PWA pelo navegador do celular, sim, mas a tela foi
pensada pra computador — vai ficar apertada.

**"Os dados do Windows aparecem no Mac (ou vice-versa)?"**
Não. Cada instalação (exe, PWA, navegador) guarda os dados só onde foi
usada.

**"Como faço backup?"**
Ainda não tem exportação de backup pronta — item pra pedir como
próximo passo se isso virar necessidade real.
