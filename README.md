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
