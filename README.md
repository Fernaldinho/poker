# Poker Analyzer

Aplicação web de análise de sessões de poker para revisão e estudo pós-partida.
Uso exclusivamente pessoal, sem login, autenticação ou multiusuário.

## Stack

| Camada   | Tecnologia                                        |
| -------- | ------------------------------------------------- |
| Frontend | React, TypeScript, Vite, TailwindCSS, React Router, React Query, Framer Motion |
| Backend  | Node.js, Express, TypeScript                      |
| Banco    | Supabase PostgreSQL                               |
| ORM      | Prisma                                            |
| Storage  | Supabase Storage                                  |
| Gráficos | Recharts                                          |
| Realtime | Supabase Realtime (atualização ao vivo)           |

## Estrutura

```
poker/
├── frontend/        # React + Vite + Tailwind
│   └── src/
│       ├── components/   # Sidebar, Navbar, layout
│       ├── pages/        # Dashboard, Sessões, Biblioteca, Estatísticas, Replayer, Configurações
│       ├── hooks/        # React Query + Realtime hooks
│       ├── services/     # Supabase, Realtime, API, Storage
│       └── utils/        # Helpers
├── backend/         # Express + Prisma
│   └── src/
│       ├── controllers/  # HTTP -> services
│       ├── services/     # Regras de negócio
│       ├── repositories/ # Acesso a dados (Prisma)
│       ├── middlewares/  # Validação, erro global, cors
│       ├── routes/       # Rotas da API
│       └── storage/      # Cliente Supabase Storage
├── shared/          # Tipos compartilhados
├── database/        # Migrations SQL (Supabase)
├── prisma/          # Schema e seed
├── scripts/         # Scripts de operação
└── storage/         # Artefatos de storage local (se necessário)
```

## Começando

```bash
npm run scripts bootstrap   # ou: npm install
npm run scripts setup-db    # Prisma generate + migrate + seed
npm run dev                 # API em http://localhost:3333
npm run dev:frontend        # App em http://localhost:5173
```

### Variáveis de ambiente

- `backend/.env` - credenciais do Supabase (ver `.env.example`)
- `frontend/.env` - URL e anon key (ver `.env.example`)

## Banco de dados

Tabelas: `sessions`, `tables`, `hands`, `statistics`, `uploads`, `notes`, `tags`, `settings`.

Buckets: `uploads`, `videos`, `images`, `thumbnails`, `sessions`, `reports`, `imports`.

Realtime habilitado em todas as tabelas para atualização ao vivo da interface.

## API

| Método | Rota                       | Descrição                  |
| ------ | -------------------------- | -------------------------- |
| GET    | `/api/health`              | Health check               |
| GET/POST | `/api/sessions`          | Listar/criar sessões       |
| GET/PATCH/DELETE | `/api/sessions/:id` | Gerenciar sessão          |
| POST   | `/api/sessions/:id/live/start` | Iniciar captura ao vivo |
| POST   | `/api/sessions/:id/live/stop`  | Finalizar sessão ao vivo |
| GET/POST | `/api/sessions/:id/hands` | Mãos da sessão            |
| GET/PATCH/DELETE | `/api/hands/:id`   | Gerenciar mão             |
| POST   | `/api/storage/upload`      | Upload de arquivo          |
| GET    | `/api/settings`, `/api/tables`, `/api/tags`, `/api/notes` | Apoio |
