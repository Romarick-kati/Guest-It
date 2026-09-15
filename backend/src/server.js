import crypto from "node:crypto";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/onpoint";

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

async function start() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
  } catch (error) {
    console.error(`Could not connect to MongoDB at ${mongoUri.replace(/:\/\/.*@/, "://***:***@")}`);
    console.error(error.message);
    process.exit(1);
  }

  const db = client.db();
  const users = db.collection("users");

  // App-level `id` (not Mongo's _id) is what tokens/lookups use throughout,
  // so accounts and sessions aren't tied to Mongo's ObjectId format.
  await users.createIndex({ id: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ phoneNumber: 1 }, { unique: true });

  app.get("/health", async (_request, response) => {
    response.json({
      ok: true,
      service: "onpoint-backend",
      database: {
        connected: true,
        uri: mongoUri.replace(/:\/\/.*@/, "://***:***@")
      }
    });
  });

  app.post("/api/auth/check-username", async (request, response) => {
    const username = normalizeUsername(request.body.username);
    const taken = username ? Boolean(await users.findOne({ username })) : false;
    response.json({ username, available: username.length >= 3 && !taken });
  });

  app.post("/api/auth/signup", async (request, response) => {
    const { countryCode, phoneNumber, password, username } = request.body;
    const cleanUsername = normalizeUsername(username).replace(/\s+/g, "_");
    const cleanPhone = normalizePhone(countryCode, phoneNumber);

    if (!cleanUsername || !cleanPhone || !password) {
      return response.status(400).json({ message: "Username, phone number, and password are required." });
    }

    if (cleanUsername.length < 3 || !/^[a-z0-9_]+$/.test(cleanUsername)) {
      return response.status(400).json({ message: "Use a username with at least 3 letters, numbers, or underscores." });
    }

    if (await users.findOne({ username: cleanUsername })) {
      return response.status(409).json({ message: "That username is already taken." });
    }

    if (await users.findOne({ phoneNumber: cleanPhone })) {
      return response.status(409).json({ message: "That phone number already has an account." });
    }

    const user = {
      id: crypto.randomUUID(),
      fullName: cleanUsername,
      username: cleanUsername,
      phoneNumber: cleanPhone,
      passwordHash: hashPassword(password)
    };

    try {
      await users.insertOne(user);
    } catch (error) {
      // Unique index caught a race between the checks above and the insert.
      if (error.code === 11000) {
        return response.status(409).json({ message: "That username or phone number is already taken." });
      }
      throw error;
    }

    response.status(201).json({ token: createToken(user), user: publicUser(user) });
  });

  app.post("/api/auth/signin", async (request, response) => {
    const { countryCode, phoneNumber, password } = request.body;
    const cleanPhone = normalizePhone(countryCode, phoneNumber);
    const user = await users.findOne({ phoneNumber: cleanPhone });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return response.status(401).json({ message: "Invalid phone number or password." });
    }

    response.json({ token: createToken(user), user: publicUser(user) });
  });

  async function authenticate(request, response) {
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      response.status(401).json({ message: "Sign in required." });
      return null;
    }
    try {
      const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
      const user = await users.findOne({ id: payload.sub });
      if (!user) {
        response.status(401).json({ message: "Session expired." });
        return null;
      }
      return user;
    } catch {
      response.status(401).json({ message: "Invalid session." });
      return null;
    }
  }

  app.get("/api/profile/me", async (request, response) => {
    const user = await authenticate(request, response);
    if (!user) return;
    response.json(publicUser(user));
  });

  app.patch("/api/profile/me", async (request, response) => {
    const user = await authenticate(request, response);
    if (!user) return;

    const { fullName, phoneNumber } = request.body;
    const updates = {};

    // Username is fixed at signup - it's the player's public handle, so it's
    // not editable from this endpoint (the field is read-only client-side too).

    if (phoneNumber !== undefined) {
      const cleanPhone = normalizePhone("", phoneNumber);
      if (!cleanPhone) {
        return response.status(400).json({ message: "Enter a valid phone number." });
      }
      if (cleanPhone !== user.phoneNumber && (await users.findOne({ phoneNumber: cleanPhone }))) {
        return response.status(409).json({ message: "That phone number already has an account." });
      }
      updates.phoneNumber = cleanPhone;
    }

    if (fullName !== undefined && fullName.trim()) {
      updates.fullName = fullName.trim();
    }

    if (Object.keys(updates).length > 0) {
      await users.updateOne({ id: user.id }, { $set: updates });
      Object.assign(user, updates);
    }

    response.json(publicUser(user));
  });

  app.listen(port, () => {
    console.log(`ON Point backend listening on http://localhost:${port}`);
    console.log(`Connected to MongoDB at ${mongoUri.replace(/:\/\/.*@/, "://***:***@")}`);
  });
}

start();
