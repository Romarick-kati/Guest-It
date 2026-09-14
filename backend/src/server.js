import crypto from "node:crypto";
import cors from "cors";
import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/onpoint";
const users = new Map();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

function normalizePhone(countryCode = "", phoneNumber = "") {
  return `${countryCode}${phoneNumber}`.replace(/[^\d+]/g, "");
}

function normalizeUsername(username = "") {
  return username.trim().replace(/^@+/, "").toLowerCase();
}

function hashPassword(password = "") {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    phoneNumber: user.phoneNumber
  };
}

function createToken(user) {
  return Buffer.from(
    JSON.stringify({ sub: user.id, username: user.username, createdAt: Date.now() })
  ).toString("base64url");
}

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "onpoint-backend",
    database: {
      readyForMongo: true,
      uri: mongoUri.replace(/:\/\/.*@/, "://***:***@")
    }
  });
});

app.post("/api/auth/check-username", (request, response) => {
  const username = normalizeUsername(request.body.username);
  const taken = [...users.values()].some((user) => user.username === username);
  response.json({ username, available: username.length >= 3 && !taken });
});

app.post("/api/auth/signup", (request, response) => {
  const { countryCode, phoneNumber, password, username } = request.body;
  const cleanUsername = normalizeUsername(username).replace(/\s+/g, "_");
  const cleanPhone = normalizePhone(countryCode, phoneNumber);

  if (!cleanUsername || !cleanPhone || !password) {
    return response.status(400).json({ message: "Username, phone number, and password are required." });
  }

  if (cleanUsername.length < 3 || !/^[a-z0-9_]+$/.test(cleanUsername)) {
    return response.status(400).json({ message: "Use a username with at least 3 letters, numbers, or underscores." });
  }

  if ([...users.values()].some((user) => user.username === cleanUsername)) {
    return response.status(409).json({ message: "That username is already taken." });
  }

  if ([...users.values()].some((user) => user.phoneNumber === cleanPhone)) {
    return response.status(409).json({ message: "That phone number already has an account." });
  }

  const user = {
    id: crypto.randomUUID(),
    fullName: cleanUsername,
    username: cleanUsername,
    phoneNumber: cleanPhone,
    passwordHash: hashPassword(password)
  };

  users.set(user.id, user);
  response.status(201).json({ token: createToken(user), user: publicUser(user) });
});

app.post("/api/auth/signin", (request, response) => {
  const { countryCode, phoneNumber, password } = request.body;
  const cleanPhone = normalizePhone(countryCode, phoneNumber);
  const user = [...users.values()].find((item) => item.phoneNumber === cleanPhone);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return response.status(401).json({ message: "Invalid phone number or password." });
  }

  response.json({ token: createToken(user), user: publicUser(user) });
});

app.get("/api/profile/me", (request, response) => {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) return response.status(401).json({ message: "Sign in required." });

  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    const user = users.get(payload.sub);
    if (!user) return response.status(401).json({ message: "Session expired." });
    response.json(publicUser(user));
  } catch {
    response.status(401).json({ message: "Invalid session." });
  }
});

app.listen(port, () => {
  console.log(`ON Point backend listening on http://localhost:${port}`);
  console.log(`MongoDB URI configured as ${mongoUri.replace(/:\/\/.*@/, "://***:***@")}`);
});
