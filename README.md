# Nonflex Contact Center

## Project Goals

Nonflex provides a starter contact center that demonstrates how to orchestrate
voice, WhatsApp, and web chat interactions with a multi‑tenant architecture.
It integrates Twilio services and simple AI responses to help teams build their
own flexible customer‑care platform.

## Architecture

### Backend (`server/`)
- Node.js + Express service exposing routes for agents, customers, tasks, AI and
  Twilio webhooks.
- Middleware `tenantResolver` reads an `X-Tenant-Id` header and attaches
  tenant configuration from `infra/tenants.json`.
- Connects to MongoDB, Redis, external CRM and Twilio APIs.

### Frontend (`client/`)
- React + Vite single-page application with pages for dashboard, agent desk and
  administration.

### Infrastructure (`infra/`)
- Seed scripts and sample definitions for Twilio TaskRouter and Studio flows.
- Postman collections for API testing live in `postman/`.

### Multi-tenant approach
- Tenants are defined in `infra/tenants.json`.
- API requests include an `X-Tenant-Id` header to select the tenant.
- Each tenant can supply unique CRM and Twilio credentials via configuration or
  environment variables.

## Environment Variables

Copy `.env.example` to `.env` and adjust the values as needed:

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default 3000). |
| `MONGO_URI` / `MONGO_URL` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign JWTs. |
| `OPENAI_API_KEY` | Key for AI assistant replies. |
| `DEFAULT_TENANT` | Default tenant id when none supplied. |
| `CLIENT_URL` | Allowed origin for CORS. |
| `REDIS_URL` | Redis connection string. |
| `CRM_BASE_URL` | Base URL of external CRM. |
| `CRM_API_KEY` | API key for the CRM. |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier. |
| `TWILIO_API_KEY` / `TWILIO_API_SECRET` | API key pair used to mint access tokens. |
| `TWILIO_AUTH_TOKEN` | Twilio auth token for validating webhooks. |

## Required Twilio Resources

- **Conversations Service** – Create a service and attach a WhatsApp or chat
  address. Set the **Incoming Messages** webhook to
  `https://<your-domain>/webhooks/twilio/conversations`.
- **Voice Number / Studio Flow** – Purchase a phone number and connect it to the
  sample Studio flow in `infra/studio-flow.json` or point the voice webhook
  directly to `https://<your-domain>/webhooks/twilio/voice`.
- **TaskRouter** – Create a workspace using `infra/taskrouter.json`. It defines
  activities, queues, and a default workflow used by the Studio flow.
- Adjust credentials per tenant as needed in `infra/tenants.json`.

## Runbook

1. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```
2. **Configure environment**
   - `cp .env.example .env` and populate the variables above.
3. **Seed database**
   ```bash
   npm run seed
   ```
4. **Start backend**
   ```bash
   node server/app.js
   ```
5. **Start frontend**
   ```bash
   cd client
   npm run dev
   ```
   The React app will be available at <http://localhost:5173>.
6. **Test flows**
   - **WhatsApp / chat** – Send a message to your configured WhatsApp number or
     create a conversation; the server replies through Twilio Conversations.
   - **Voice** – Call the provisioned phone number. The Studio flow gathers
     input and creates a TaskRouter task.
   - **Web chat** – Use the frontend or Postman to exchange messages and verify
     webhook responses.

## Postman & Resources

- Postman collection:
  [`postman/custom-cc.postman_collection.json`](postman/custom-cc.postman_collection.json)
- Twilio TaskRouter: <https://www.twilio.com/docs/taskrouter>
- Twilio Conversations: <https://www.twilio.com/docs/conversations>
- Twilio Studio: <https://www.twilio.com/docs/studio>

