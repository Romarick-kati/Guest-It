import crypto from "node:crypto";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/onpoint";

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
// Game media is stored as a base64 data URI (no separate file/object storage
// exists yet), so the default 100kb JSON body limit is far too small.
app.use(express.json({ limit: "8mb" }));

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
    phoneNumber: user.phoneNumber,
    email: user.email,
    isAdmin: Boolean(user.isAdmin)
  };
}

function createToken(user) {
  return Buffer.from(
    JSON.stringify({ sub: user.id, username: user.username, createdAt: Date.now() })
  ).toString("base64url");
}

// The winner pool is never admin-entered - it's a genuine 80/20 split of
// what players have actually paid in, same rule the player-facing screens
// describe ("80 FCFA from each donation goes to the winner pool" on a
// 100 FCFA entry fee). Computed fresh on every response instead of stored,
// so it can never drift out of sync with the real participant count.
const WINNER_SHARE = 0.8;

function withComputedPrize(doc) {
  const { _id, ...rest } = doc;
  return { ...rest, prize: Math.round((rest.participants || 0) * (rest.entryFee || 0) * WINNER_SHARE) };
}

function toMillis(datetimeLocal, fallback) {
  if (!datetimeLocal) return fallback;
  const ms = new Date(datetimeLocal).getTime();
  return Number.isNaN(ms) ? fallback : ms;
}

// Maps the admin GameForm's flat field shape onto the stored game record -
// mirrors frontend/src/lib/mockData.js's old buildGameRecord exactly, since
// that's the contract the admin form and its EditGame/CreateGame pages
// already rely on. `existing`, when provided (edit), supplies defaults for
// anything the form didn't send for this particular game.
function buildGameRecord(values, existing) {
  const startsAt = toMillis(values.startAt, existing?.startsAt ?? Date.now());
  const endsAt = toMillis(values.endAt, existing?.endsAt ?? startsAt + 1000 * 60 * 60);
  const entryFee = values.entryFee !== "" && values.entryFee != null ? Number(values.entryFee) : existing?.entryFee ?? 0;
  const hasCorrectAnswer = values.correctAnswer !== "" && values.correctAnswer != null;

  return {
    ...existing,
    title: values.title ?? existing?.title ?? "Untitled game",
    gameType: values.gameType ?? existing?.gameType ?? "GUESSING",
    description: values.description ?? existing?.description ?? "",
    howToPlay: values.instructions ?? existing?.howToPlay ?? "",
    media: values.media ?? existing?.media ?? null,
    question: values.question ?? existing?.question ?? "",
    unit: values.unit ?? existing?.unit ?? "",
    status: values.status ?? existing?.status ?? "DRAFT",
    // No `prize` here - it's never admin-entered, see withComputedPrize.
    entryFee,
    rewardDescription: values.rewardDescription ?? existing?.rewardDescription ?? "",
    participantLimit:
      values.participantLimit !== "" && values.participantLimit != null
        ? Number(values.participantLimit)
        : existing?.participantLimit ?? null,
    startsAt,
    endsAt,
    currency: existing?.currency ?? "FCFA",
    participants: existing?.participants ?? 0,
    submissions: existing?.submissions ?? 0,
    createdAt: existing?.createdAt ?? new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    requiresPayment: entryFee > 0,
    requiresVerification: existing?.requiresVerification ?? false,
    rules: existing?.rules ?? [],
    // Setting a correct answer is how an admin publishes a result - it's
    // what getExactMatches/summariseOutcome in lib/resolution.js key off.
    result: hasCorrectAnswer ? { correctAnswer: Number(values.correctAnswer) } : existing?.result ?? null
  };
}

// The app's original 8 demo games, ported over so every existing page
// (results, tie-break resolution, admin views) keeps working once games
// move to a real collection. Only seeded once, when the collection is
// empty - a later restart won't overwrite an admin's real edits to these,
// same as any other game.
//
// `participants`/`submissions` start at 0, not the old mock's decorative
// counts (143, 320, etc.) - those numbers never reflected anyone actually
// joining, and showing them on the admin dashboard's real, summed totals
// would make invented activity look real. They only grow now through
// POST /api/games/:id/join and /submissions, i.e. someone actually playing.
function seedGames() {
  const now = Date.now();
  return [
    {
      id: "g1",
      title: "Guess it",
      gameType: "GUESSING",
      slug: "guess-it",
      image: "candy-jar",
      description: "How many candies are packed into the jar? Get closest to win.",
      howToPlay: "Look at the image carefully and estimate the total number of objects shown. Enter your best guess before time runs out.",
      rules: [
        "One entry per player per game.",
        "Entry fee is non-refundable once the game starts.",
        "Matching the exact count wins the prize.",
        "If more than one player matches exactly, the system resolves it automatically, or offers those players a split or a tiebreaker game."
      ],
      status: "LIVE",
      prize: 150000,
      entryFee: 100,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: 500,
      startsAt: now - 1000 * 60 * 5,
      endsAt: now + 42 * 1000,
      createdAt: "Sep 1, 2026",
      requiresPayment: true,
      requiresVerification: true,
      unit: "objects"
    },
    {
      id: "g2",
      title: "Estimate the Coins",
      gameType: "GUESSING",
      slug: "estimate-the-coins",
      image: "coins",
      description: "A jar full of coins. Guess the total value inside.",
      howToPlay: "Study the photo and estimate the total number of coins in the jar.",
      rules: [
        "One entry per player per game.",
        "Entry fee is non-refundable once the game starts.",
        "Matching the exact count wins the prize."
      ],
      status: "UPCOMING",
      prize: 80000,
      entryFee: 200,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: 300,
      startsAt: now + 1000 * 60 * 60 * 2 + 1000 * 60 * 14,
      endsAt: now + 1000 * 60 * 60 * 3,
      createdAt: "Sep 4, 2026",
      requiresPayment: true,
      requiresVerification: false,
      unit: "coins"
    },
    {
      id: "g3",
      title: "Marble Challenge",
      gameType: "CHALLENGE",
      slug: "marble-challenge",
      image: "marbles",
      description: "Count the marbles in the bowl. Free entry, bragging rights only.",
      howToPlay: "Look closely at the bowl of marbles and submit your best estimate.",
      rules: ["Free entry.", "One submission per player.", "Matching the exact number wins."],
      status: "CLOSED",
      prize: 0,
      entryFee: 0,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: null,
      startsAt: now - 1000 * 60 * 60 * 5,
      endsAt: now - 1000 * 60 * 2,
      createdAt: "Aug 28, 2026",
      requiresPayment: false,
      requiresVerification: false,
      unit: "marbles",
      result: { correctAnswer: 268 }
    },
    {
      id: "g4",
      title: "Popcorn Bucket",
      gameType: "GUESSING",
      slug: "popcorn-bucket",
      image: "popcorn",
      description: "A giant bucket of popcorn. How many kernels do you see?",
      howToPlay: "Estimate the number of popcorn kernels visible in the bucket image.",
      rules: [
        "Entry fee applies.",
        "One entry per player.",
        "Matching the exact number wins the prize.",
        "If more than one player matches exactly, the system resolves it — automatically, or by offering those players a split or a tiebreaker game."
      ],
      status: "COMPLETED",
      prize: 60000,
      entryFee: 100,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: null,
      startsAt: now - 1000 * 60 * 60 * 30,
      endsAt: now - 1000 * 60 * 60 * 28,
      createdAt: "Sep 6, 2026",
      requiresPayment: true,
      requiresVerification: true,
      unit: "kernels",
      result: { correctAnswer: 350 }
    },
    {
      id: "g5",
      title: "Button Jar",
      gameType: "GUESSING",
      slug: "button-jar",
      image: "buttons",
      description: "Bright buttons packed into a glass jar. Guess the total.",
      howToPlay: "Count as closely as you can, then submit your estimate.",
      rules: ["Entry fee applies.", "One entry per player.", "Matching the exact number wins the prize."],
      status: "LIVE",
      prize: 45000,
      entryFee: 50,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: 500,
      startsAt: now - 1000 * 60 * 20,
      endsAt: now + 8 * 1000,
      createdAt: "Sep 7, 2026",
      requiresPayment: true,
      requiresVerification: false,
      unit: "buttons"
    },
    {
      id: "g6",
      title: "Sweet Jellybeans",
      gameType: "GUESSING",
      slug: "sweet-jellybeans",
      image: "jellybeans",
      description: "A colourful jar of jellybeans. Prize goes to the closest guess.",
      howToPlay: "Estimate the total number of jellybeans in the jar.",
      rules: ["Entry fee applies.", "One entry per player."],
      status: "UPCOMING",
      prize: 100000,
      entryFee: 150,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: 400,
      startsAt: now + 1000 * 60 * 60 * 26,
      endsAt: now + 1000 * 60 * 60 * 27,
      createdAt: "Sep 8, 2026",
      requiresPayment: true,
      requiresVerification: true,
      unit: "jellybeans"
    },
    {
      id: "g7",
      title: "Score Predictor",
      gameType: "PREDICTION",
      slug: "score-predictor",
      image: "coins",
      description: "Predict the final score of tonight's match.",
      howToPlay: "Enter your predicted final score before kickoff.",
      rules: ["Entry fee applies.", "Closest prediction wins."],
      status: "DRAFT",
      prize: 70000,
      entryFee: 100,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: null,
      startsAt: now + 1000 * 60 * 60 * 48,
      endsAt: now + 1000 * 60 * 60 * 50,
      createdAt: "Sep 9, 2026",
      requiresPayment: true,
      requiresVerification: false,
      unit: "points"
    },
    {
      id: "g8",
      title: "Marble Jar Rematch",
      gameType: "GUESSING",
      slug: "marble-jar-rematch",
      image: "marbles",
      description: "A fresh bowl of marbles. Match the exact number to win.",
      howToPlay: "Estimate the total number of marbles in the bowl. Matching the exact number enters you into the winner pool.",
      rules: [
        "Entry fee applies.",
        "One entry per player.",
        "Matching the exact number wins the prize.",
        "If more than one player matches exactly, the system resolves it — automatically, or by offering those players a split or a tiebreaker game."
      ],
      status: "COMPLETED",
      prize: 90000,
      entryFee: 150,
      currency: "FCFA",
      participants: 0,
      submissions: 0,
      participantLimit: null,
      startsAt: now - 1000 * 60 * 60 * 10,
      endsAt: now - 1000 * 60 * 60 * 8,
      createdAt: "Sep 9, 2026",
      requiresPayment: true,
      requiresVerification: true,
      unit: "marbles",
      result: { correctAnswer: 214 }
    }
  ];
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
  const games = db.collection("games");

  // App-level `id` (not Mongo's _id) is what tokens/lookups use throughout,
  // so accounts and sessions aren't tied to Mongo's ObjectId format.
  await users.createIndex({ id: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true });
  // sparse: an admin account (see below) can have no phoneNumber at all -
  // a plain unique index would only ever allow ONE such document. An
  // existing deployment may already have a non-sparse phoneNumber index
  // under the same auto-generated name, which Mongo refuses to redefine
  // in place - drop and recreate it rather than erroring out on startup.
  try {
    await users.createIndex({ phoneNumber: 1 }, { unique: true, sparse: true });
  } catch (error) {
    if (error.codeName !== "IndexKeySpecsConflict") throw error;
    await users.dropIndex("phoneNumber_1");
    await users.createIndex({ phoneNumber: 1 }, { unique: true, sparse: true });
  }
  await users.createIndex({ email: 1 }, { unique: true, sparse: true });
  await games.createIndex({ id: 1 }, { unique: true });

  if ((await games.countDocuments()) === 0) {
    await games.insertMany(seedGames());
  }

  // The two seed games marked LIVE ("g1", "g5") are meant to always have
  // something to actually play for demo/testing purposes. Their countdown
  // is real (a fixed endsAt), so it does genuinely run out - once it has,
  // give them a fresh window rather than leaving a contradictory "Live" /
  // "Time's up" state sitting there. 20 minutes, not the original seed's
  // 42s/8s - those were only ever going to look freshly-live for a few
  // seconds after each restart, which is the exact same broken-looking
  // state this is meant to fix. Only touches timing, never participants/
  // submissions/title/etc - an admin's real edits stick.
  for (const id of ["g1", "g5"]) {
    const game = await games.findOne({ id });
    if (game && game.status === "LIVE" && game.endsAt < Date.now()) {
      const now = Date.now();
      await games.updateOne({ id }, { $set: { startsAt: now, endsAt: now + 1000 * 60 * 20 } });
    }
  }

  // One seed admin account so the admin area isn't unreachable before a
  // real admin-invite flow exists. Signs in with email, not phone - players
  // still only ever get phone accounts via /api/auth/signup.
  if (!(await users.findOne({ email: "ndefrubrayan@gmail.com" }))) {
    await users.insertOne({
      id: crypto.randomUUID(),
      fullName: "Admin",
      username: "admin",
      email: "ndefrubrayan@gmail.com",
      passwordHash: hashPassword("admin123"),
      isAdmin: true
    });
  }

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
    const { email, countryCode, phoneNumber, password } = request.body;

    // Email sign-in is only used for admin accounts today (players still
    // only ever get a phone-based account via /api/auth/signup) - both
    // share this one endpoint/form rather than a separate admin login.
    const cleanEmail = email?.trim().toLowerCase();
    const user = cleanEmail
      ? await users.findOne({ email: cleanEmail })
      : await users.findOne({ phoneNumber: normalizePhone(countryCode, phoneNumber) });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return response.status(401).json({ message: cleanEmail ? "Invalid email or password." : "Invalid phone number or password." });
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

  async function requireAdmin(request, response) {
    const user = await authenticate(request, response);
    if (!user) return null;
    if (!user.isAdmin) {
      response.status(403).json({ message: "Admin access required." });
      return null;
    }
    return user;
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

  // ---------------------------------------------------------------------
  // GAMES
  // Reading games is public (players browse without signing in). Creating
  // and editing them requires an admin account - see requireAdmin above.
  // Every route below is otherwise a straight port of the old frontend
  // mock's semantics (see buildGameRecord above) so the admin form and
  // player pages don't need to change how they call these.
  // ---------------------------------------------------------------------

  app.get("/api/games", async (_request, response) => {
    response.json((await games.find().toArray()).map(withComputedPrize));
  });

  app.get("/api/games/:id", async (request, response) => {
    const game = await games.findOne({ id: request.params.id });
    if (!game) return response.status(404).json({ message: "Game not found" });
    response.json(withComputedPrize(game));
  });

  app.post("/api/games", async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    const id = crypto.randomUUID();
    const record = { id, ...buildGameRecord(request.body, null) };
    await games.insertOne(record);
    response.status(201).json(withComputedPrize(record));
  });

  app.patch("/api/games/:id", async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    const existing = await games.findOne({ id: request.params.id });
    if (!existing) return response.status(404).json({ message: "Game not found" });

    const record = { id: existing.id, ...buildGameRecord(request.body, existing) };
    await games.replaceOne({ id: existing.id }, record);
    response.json(withComputedPrize(record));
  });

  // Called once per player the first time they actually join a game (not
  // on every revisit to the entry screen) - see lib/api.js's joinGame,
  // which only calls this the first time joinParticipant adds a new local
  // record, so this can't be double-counted by a player refreshing.
  app.post("/api/games/:id/join", async (request, response) => {
    const result = await games.findOneAndUpdate(
      { id: request.params.id },
      { $inc: { participants: 1 } },
      { returnDocument: "after" }
    );
    if (!result) return response.status(404).json({ message: "Game not found" });
    response.json(withComputedPrize(result));
  });

  app.post("/api/games/:id/submissions", async (request, response) => {
    const result = await games.findOneAndUpdate(
      { id: request.params.id },
      { $inc: { submissions: 1 } },
      { returnDocument: "after" }
    );
    if (!result) return response.status(404).json({ message: "Game not found" });
    response.json(withComputedPrize(result));
  });

  // Everything else the admin dashboard needs (active/completed game
  // counts, participant/submission totals) is already derivable client-side
  // from GET /api/games - this is the one number that genuinely can't be:
  // there's no public users list, and there shouldn't be one.
  app.get("/api/admin/stats", async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    response.json({ totalUsers: await users.countDocuments() });
  });

  app.listen(port, () => {
    console.log(`ON Point backend listening on http://localhost:${port}`);
    console.log(`Connected to MongoDB at ${mongoUri.replace(/:\/\/.*@/, "://***:***@")}`);
  });
}

start();
