# ON Point Backend

Express API workspace for the integrated `Production` branch.

```bash
npm install
npm run dev
```

Available starter routes:

- `GET /health`
- `POST /api/auth/check-username`
- `POST /api/auth/signin`
- `POST /api/auth/signup`
- `GET /api/profile/me`

Database configuration is intentionally one env value:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/onpoint
```

When moving from local MongoDB Compass to Atlas, replace only that value:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/onpoint
```
