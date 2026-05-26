# XelbMinds — Plataforma de Centro de Explicações

Demo da plataforma de gestão para o centro de explicações **XelbMinds**. Construída com Vite + React + TypeScript + Tailwind, **pronta para integração com Firebase**, mas a correr em modo demo com dados em `localStorage`.

🌐 **Demo online:** https://manuelmarrao0887.github.io/xelbminds/

## Funcionalidades

### Gestor / Administrador
- Painel com KPIs e gráficos (Recharts)
- Gestão de alunos (CRUD com validação Zod)
- Financeiro: pagamentos, cobrança via WhatsApp (em massa)
- Despesas e cálculo de lucro
- Horário semanal visual
- **CRM Leads** — pipeline com 4 estágios
- **Centro de Comunicações** — campanhas WhatsApp/Email/SMS
- **Relatórios PDF** — exportação mensal completa (jsPDF)
- **Backup/Restore** — JSON import/export
- Faturação (V2 mockup) — MB WAY, Stripe, Multibanco UI

### Professor
- Área do professor com aulas, presenças e progresso
- **Marcação rápida de presenças** (um toque por aluno)
- **Biblioteca de materiais** (fichas, resumos, testes)
- **Gráficos de progresso** do aluno (explicações vs escola)
- Registo de aulas com sumário, TPC, avaliação

### Encarregado de Educação
- **Multi-criança** — um login, vários filhos
- **Notificações** (sino + página dedicada)
- **Centro de pagamentos** — histórico, recibos, total anual
- **Pedir aula extra** — fluxo aprovado/recusado
- Acompanhamento de progresso em tempo real

### Aluno
- **Gamificação** — XP, badges, streak de aulas
- **Objetivos** — meta + progresso real
- **Submeter TPC** — upload de exercícios resolvidos
- **Calendário de exames** com countdown
- **Pomodoro** (25/5) com estatísticas
- Histórico de aulas, notas, ficheiros

## Stack

- **Vite 5** + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** + **Plus Jakarta Sans**
- **React Router 6** (HashRouter para GH Pages)
- **Zustand** + persist (auth)
- **Zod** (validação)
- **Lucide React** (ícones)
- **Recharts** (gráficos)
- **jsPDF** + **autoTable** (PDFs)
- **localStorage** wrapper (preparado para trocar por Firestore)

## Instalação

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # produção em dist/
npm run preview      # serve dist/ localmente
```

## Contas Demo

| Email | Password | Papel |
|---|---|---|
| `admin@xelbminds.pt` | `demo1234` | Administrador |
| `prof@xelbminds.pt` | `demo1234` | Professor (Matemática, Física e Química) |
| `aluno@xelbminds.pt` | `demo1234` | Encarregado (com 2 filhos) |

Ou usa os botões "Acesso rápido demo" na página de login.

## Arquitetura

```
src/
├── lib/             # theme, utils, constants
├── types/           # TypeScript interfaces
├── data/seed.ts     # dados mock iniciais (50 alunos)
├── services/        # camada trocável por Firebase
│   ├── storage.ts   # wrapper de localStorage
│   ├── db.ts        # bootstrap + backup/restore
│   ├── authService.ts  # mock auth (3 contas)
│   └── domain.ts    # CRUD para students, payments, lessons...
├── store/           # Zustand stores (auth, toasts)
├── hooks/           # useStudents, usePayments, etc.
├── components/
│   ├── ui/          # primitives (Button, Card, Modal, ...)
│   ├── layout/      # AppShell, Sidebar, Topbar, RouteGuard
│   └── auth/
├── pages/           # 16 páginas
└── routes/routes.tsx
```

## Segurança

- TypeScript strict mode
- Validação Zod em todos os formulários
- Role-based route guards
- Sanitização de input (trim, length limits)
- Sem `dangerouslySetInnerHTML`, sem `eval`, sem scripts inline
- Passwords demo flagadas com `TODO`

⚠️ Esta é uma versão demo. As passwords estão em código (intencionalmente, para o demo). NÃO usar em produção.

## Migrar para Firebase

A camada de serviços está abstraída. Para integrar Firebase:

1. Criar projeto Firebase + ativar Auth + Firestore
2. Preencher `.env` (ver `.env.example`)
3. Substituir `src/services/storage.ts` por wrapper Firestore
4. Substituir `src/services/authService.ts` por Firebase Auth
5. Componentes e páginas não precisam de mudar

## Deploy

GitHub Actions com workflow em `.github/workflows/deploy.yml`. Cada push em `main` faz deploy automático para GitHub Pages.

## Licença

Privado — Proof Studio · XelbMinds 2026
