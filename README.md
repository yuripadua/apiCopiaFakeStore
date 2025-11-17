# apiCopiaFakeStore

API pedagógica que espelha a FakeStoreAPI, feita em Node.js + Express, usando banco Postgres gratuito da Vercel.

## Rotas principais

- `GET /` – mensagem de boas-vindas e links
- `GET /products` – lista todos os produtos
- `GET /products/:id` – detalhe de um produto
- `POST /products` – cria produto
- `PUT /products/:id` – atualiza produto
- `DELETE /products/:id` – remove produto

## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um banco Postgres (pode ser o Postgres da Vercel) e configure a variável de ambiente `DATABASE_URL`. Você pode copiar `.env.example` para `.env`:

   ```bash
   cp .env.example .env
   # edite .env e coloque sua DATABASE_URL
   ```

3. Rode o seed dos 20 produtos:

   ```bash
   npm run seed
   ```

4. Inicie o servidor em desenvolvimento:

   ```bash
   npm run dev
   ```

   A API responderá em `http://localhost:3000`.

## Deploy na Vercel (resumo)

- Crie o projeto na Vercel apontando para este repositório.
- Crie um banco Postgres via Vercel (seção **Storage → Postgres**).
- Copie a `DATABASE_URL` que a Vercel fornece e configure nas variáveis de ambiente do projeto (`DATABASE_URL`).
- Faça o deploy; a API ficará disponível em uma URL do tipo:
  `https://seu-projeto.vercel.app/products`.
