# Lumier

## Sync local database from production

1. Ensure PostgreSQL client tools are installed (`pg_dump`, `psql`).
2. Add these values to `.env` or `backend/.env`:

```env
PROD_DB_URL=postgresql://<prod_user>:<prod_password>@<prod_host>:5432/<prod_db>?sslmode=require
DB_URL=jdbc:postgresql://localhost:5432/lumier?sslmode=disable
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Optional (if you want to bypass JDBC conversion):

```env
LOCAL_DB_URL=postgresql://postgres:postgres@localhost:5432/lumier?sslmode=disable
```

3. Run sync:

```bash
npm run db:sync:prod-to-local
```

Notes:
- The script overwrites local DB content with production data.
- Backend order history is queried by `googleId`, so this sync helps local show the same order history as production.
- Env loading order is: `.env` then `backend/.env` (backend file can override root values).

## Supabase Storage Integration (Image + Audio)

Follow these steps to store uploaded media directly in Supabase Storage (instead of local `/api/media/*` files).

1. Create a Supabase project.
2. In Storage, create a bucket (for example: `lumier-media`) and set it to public if you want direct public URLs.
3. Open Project Settings -> API and copy:
- Project URL (`https://<project-ref>.supabase.co`)
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`)
4. Add these variables to `backend/.env`:

```env
SUPABASE_STORAGE_ENABLED=true
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_STORAGE_BUCKET=lumier-media
SUPABASE_STORAGE_PUBLIC_BASE_URL=https://<project-ref>.supabase.co/storage/v1/object/public/lumier-media
```

Notes for `SUPABASE_STORAGE_PUBLIC_BASE_URL`:
- If omitted, backend auto-builds URL from `SUPABASE_URL` + bucket.
- If you use a custom CDN/domain, set this value to that public base URL.

5. Restart backend:

```bash
npm run backend:dev
```

6. Open Admin dashboard and upload image/audio. New uploads will return and store direct Supabase URLs in DB.

Notes:
- If `SUPABASE_STORAGE_ENABLED=false` (or unset), backend automatically falls back to local disk storage.
- Existing local URLs in DB are not auto-migrated; only new uploads go to Supabase.
