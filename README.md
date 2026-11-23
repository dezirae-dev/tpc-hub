# TPC Hub

Internal hub for The Premier Connection: ad approvals, leads, sources and costs, traffic, tasks (Trello two-way), AI brainstorm, personal performance. Home page flags what needs attention.

## Deploy
1. Vercel > Add New Project > import this repo.
2. Storage tab > Create > Upstash Redis (adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`).
3. Settings > Environment Variables: copy from `.env.example`. Only `DASH_PASSWORD` and `HUB_API_TOKEN` are required; every integration shows sample data until its key is added.
4. Redeploy.

## Claude / scheduled tasks
Bearer token `HUB_API_TOKEN`:
- `GET /api/claude/packages`, `POST /api/claude/packages[?notify=1]` upsert approval packages (notify pings Jordana in #marketing-updates)
- `GET /api/claude/decisions`

## Data notes
- Meta: ad-level insights, leads = `lead` actions. FUB: `/v1/people`. GA4: service account (viewer on the property).
- Flag rules live in `lib/flags.js`.
