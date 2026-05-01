/**
 * Seed script — populates Firestore with demo data for development.
 *
 * Run via:  npm run seed
 *
 * Auth (pick one):
 *   1. Place a serviceAccountKey.json in the project root (gitignored).
 *   2. export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 *   3. gcloud auth application-default login
 *
 * Creates:
 *   10 users, 3 circles (6-8 members each),
 *   1 story per circle member (so ~20 stories),
 *   2 rounds of entries + assignments per story.
 */

import { existsSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, applicationDefault, type Credential } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ID = "circle-work-e855b";
const LOCAL_KEY = resolve("serviceAccountKey.json");

let credential: Credential;
if (existsSync(LOCAL_KEY)) {
   
  const keyModule = await import(LOCAL_KEY, { with: { type: "json" } });
  credential = cert({ ...keyModule.default });
  console.log("Using local serviceAccountKey.json");
} else {
  credential = applicationDefault();
  console.log("Using application default credentials");
}

initializeApp({ credential, projectId: PROJECT_ID });
const db = getFirestore();
const auth = getAuth();

// ─── Helpers ────────────────────────────────────────────────────────

function ts(daysAgo: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() - daysAgo * 86_400_000));
}

function uuid(): string {
  return crypto.randomUUID();
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── User data ──────────────────────────────────────────────────────

const USERS = [
  { id: "user-001", name: "Alice Nakamura",  email: "alice@example.com"   },
  { id: "user-002", name: "Ben Torres",      email: "ben@example.com"     },
  { id: "user-003", name: "Clara Chen",       email: "clara@example.com"   },
  { id: "user-004", name: "David Okafor",     email: "david@example.com"   },
  { id: "user-005", name: "Elena Petrova",    email: "elena@example.com"   },
  { id: "user-006", name: "Finn O'Brien",     email: "finn@example.com"    },
  { id: "user-007", name: "Grace Kim",        email: "grace@example.com"   },
  { id: "user-008", name: "Hugo Almeida",     email: "hugo@example.com"    },
  { id: "user-009", name: "Isla Johansson",   email: "isla@example.com"    },
  { id: "user-010", name: "James Whitfield",  email: "james@example.com"   },
];

// ─── Circle definitions ─────────────────────────────────────────────

const CIRCLES = [
  {
    id: "circle-001",
    name: "The Inkwell",
    cadence_hours: 48,
    created_by: "user-001",
    member_ids: ["user-001", "user-002", "user-003", "user-004", "user-005", "user-006"],
    startDaysAgo: 14,
  },
  {
    id: "circle-002",
    name: "Midnight Drafts",
    cadence_hours: 72,
    created_by: "user-003",
    member_ids: ["user-003", "user-004", "user-005", "user-006", "user-007", "user-008", "user-009"],
    startDaysAgo: 10,
  },
  {
    id: "circle-003",
    name: "The Raconteurs",
    cadence_hours: 48,
    created_by: "user-007",
    member_ids: ["user-001", "user-002", "user-007", "user-008", "user-009", "user-010"],
    startDaysAgo: 7,
  },
];

// ─── Sample entry content ──────────────────────────────────────────

const PARAGRAPHS = [
  "The lighthouse had been dark for three years when Mara first noticed the flicker. It was faint, barely more than a candle, but unmistakable against the steel-grey sea. She lowered her binoculars and wondered who—or what—had climbed the spiral stairs.",
  "Rain hammered the tin roof as Elias spread the map across the kitchen table. The ink had bled in places, but the path through the canyon was still legible. \"We leave at dawn,\" he said, not looking up. Nobody argued.",
  "The letter arrived without a return address, sealed with wax the colour of dried blood. Inside, a single sentence: 'They know about the garden.' Vera read it twice, then fed it to the fire.",
  "Somewhere between the third and fourth cup of coffee, Detective Lowe realised the witness was lying. Not about everything—just the part that mattered. He leaned back and let the silence do the work.",
  "The violin had not been played in decades. When Suki drew the bow across the strings, the sound was thin and ghostly, like a voice calling from the bottom of a well.",
  "Captain Reyes watched the shoreline shrink to a dark thread. Behind her, the crew was quiet. They all knew the charts ended fifty miles ahead, and after that there was only rumour and sea.",
  "The old bookshop smelled of cedar and dust. Tomás found the volume on the highest shelf, wedged between two atlases. Its spine bore no title, only a date: 1887.",
  "Kira's hands were steady as she wired the final relay. One wrong connection and the entire grid would go dark. She counted to three, whispered something that might have been a prayer, and pressed the switch.",
  "The forest floor was carpeted with frost. Every footstep crackled like breaking glass. Leo knew the cabin was close—he could smell woodsmoke—but the trees all looked the same in this pale morning light.",
  "Dr. Ashworth stared at the results on her screen for a long time. The numbers were impossible, and yet there they were, blinking steadily. She saved the file, locked the lab, and told no one.",
  "The market square was a riot of colour: pyramids of saffron and paprika, bolts of indigo cloth, cages of songbirds. Nadia moved through it like a ghost, her hand on the folded note in her pocket.",
  "They found the door behind the wallpaper during the renovation. It was small—barely four feet high—and locked from the inside. The contractor refused to open it. He quit the next morning.",
  "The first snow of the year fell as Hana boarded the train. She pressed her forehead to the cold glass and watched the city dissolve into white. Somewhere ahead, a new chapter was waiting.",
  "Marcus had always been good with numbers, but the equation on the blackboard made no sense. The professor had left it there overnight, along with a note: 'Solve this and the scholarship is yours.'",
  "The cave paintings were older than anyone had guessed—twelve thousand years, give or take. But it was the handprint in the corner that made Dr. Yoon pause. It was fresh.",
  "Beneath the theatre, a network of tunnels stretched in every direction. Rosa followed the sound of running water, her flashlight cutting a thin cone through the dark. She was not supposed to be here.",
  "The radio crackled with static, then a voice, calm and measured: 'If you can hear this, do not reply. Just listen.' Agent Cole reached for the volume knob and turned it up.",
  "Grandmother's recipe box was full of secrets. Between the cards for shortbread and blackberry jam, Olive found a photograph of a man she had never seen, standing in front of a house that looked exactly like theirs.",
  "The satellite images showed something at the bottom of the lake—something large, angular, and decidedly not natural. The team packed their diving gear and left before sunrise.",
  "Wind howled through the broken window of the observatory. Professor Kaur adjusted her telescope and aimed it at the coordinates one more time. The star that should have been there was gone.",
];

// ─── Main ───────────────────────────────────────────────────────────

async function seed() {
  const now = ts(0);

  // 1. Auth users + Firestore user docs
  console.log("Seeding auth users + Firestore user docs...");
  const DEFAULT_PASSWORD = "password123";
  for (const u of USERS) {
    // Create or update Firebase Auth user with matching UID
    try {
      await auth.getUser(u.id);
      // Already exists — update to match seed data
      await auth.updateUser(u.id, {
        email: u.email,
        password: DEFAULT_PASSWORD,
        displayName: u.name,
      });
    } catch {
      // Doesn't exist — create with explicit UID
      await auth.createUser({
        uid: u.id,
        email: u.email,
        password: DEFAULT_PASSWORD,
        displayName: u.name,
      });
    }

    // Firestore user doc
    await db.collection("users").doc(u.id).set({
      id: u.id,
      name: u.name,
      email: u.email,
      notification_preferences: {
        email_enabled: true,
        push_enabled: false,
        reminder_hours_before_deadline: 24,
      },
      created_at: ts(30),
      updated_at: ts(30),
    });
  }
  console.log(`  ✓ ${USERS.length} auth users`);
  console.log(`  ✓ ${USERS.length} Firestore user docs`);
  console.log(`    All passwords: ${DEFAULT_PASSWORD}`);

  // 2. Circles
  console.log("Seeding circles...");
  for (const c of CIRCLES) {
    const startAt = ts(c.startDaysAgo);
    await db.collection("circles").doc(c.id).set({
      id: c.id,
      name: c.name,
      cadence_hours: c.cadence_hours,
      start_at: startAt,
      member_ids: c.member_ids,
      rotation_order: shuffleArray(c.member_ids),
      created_by: c.created_by,
      created_at: startAt,
      updated_at: startAt,
    });
  }
  console.log(`  ✓ ${CIRCLES.length} circles`);

  // 3. Stories, entries, and assignments (2 rounds each)
  console.log("Seeding stories, entries, and assignments...");
  let storyCount = 0;
  let entryCount = 0;
  let assignmentCount = 0;
  let paragraphIdx = 0;

  for (const c of CIRCLES) {
    const rotation = shuffleArray(c.member_ids);
    const cadenceMs = c.cadence_hours * 3_600_000;

    for (const ownerId of c.member_ids) {
      const storyId = uuid();
      const storyCreated = ts(c.startDaysAgo);

      await db.collection("stories").doc(storyId).set({
        id: storyId,
        circle_id: c.id,
        owner_id: ownerId,
        status: "active",
        current_round: 2,
        created_at: storyCreated,
        updated_at: now,
      });
      storyCount++;

      // 2 rounds of entries + assignments
      for (let round = 0; round < 2; round++) {
        const writerId = rotation[(round) % rotation.length];
        const assignedAt = Timestamp.fromMillis(
          storyCreated.toMillis() + round * cadenceMs
        );
        const dueAt = Timestamp.fromMillis(
          assignedAt.toMillis() + cadenceMs
        );
        const submittedAt = Timestamp.fromMillis(
          assignedAt.toMillis() + cadenceMs * 0.7
        );

        // Assignment
        const assignmentId = `${writerId}_${storyId}_${round}`;
        await db.collection("assignments").doc(assignmentId).set({
          id: assignmentId,
          user_id: writerId,
          story_id: storyId,
          circle_id: c.id,
          round_number: round,
          assigned_at: assignedAt,
          due_at: dueAt,
          submitted: true,
          submitted_at: submittedAt,
        });
        assignmentCount++;

        // Entry
        const entryId = uuid();
        const content = PARAGRAPHS[paragraphIdx % PARAGRAPHS.length];
        paragraphIdx++;

        await db.collection("entries").doc(entryId).set({
          id: entryId,
          story_id: storyId,
          user_id: writerId,
          round_number: round,
          content,
          created_at: submittedAt,
          locked_at: dueAt,
        });
        entryCount++;
      }
    }
  }

  console.log(`  ✓ ${storyCount} stories`);
  console.log(`  ✓ ${entryCount} entries`);
  console.log(`  ✓ ${assignmentCount} assignments`);
  console.log("\nDone! Demo data seeded successfully.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
});
