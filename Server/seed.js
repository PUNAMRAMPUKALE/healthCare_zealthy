const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const seedData = {
  users: [
    {
      id: 1,
      name: "Mark Johnson",
      email: "mark@some-email-provider.net",
      password: "Password123!",
      appointments: [
        { id: 1, provider: "Dr Kim West", datetime: "2026-04-16T16:30:00.000-07:00", repeat: "weekly" },
        { id: 2, provider: "Dr Lin James", datetime: "2026-04-19T18:30:00.000-07:00", repeat: "monthly" }
      ],
      prescriptions: [
        { id: 1, medication: "Lexapro", dosage: "5mg", quantity: 2, refill_on: "2026-04-05", refill_schedule: "monthly" },
        { id: 2, medication: "Ozempic", dosage: "1mg", quantity: 1, refill_on: "2026-04-10", refill_schedule: "monthly" }
      ]
    },
    {
      id: 2,
      name: "Lisa Smith",
      email: "lisa@some-email-provider.net",
      password: "Password123!",
      appointments: [
        { id: 3, provider: "Dr Sally Field", datetime: "2026-04-22T18:15:00.000-07:00", repeat: "monthly" },
        { id: 4, provider: "Dr Lin James", datetime: "2026-04-25T20:00:00.000-07:00", repeat: "weekly" }
      ],
      prescriptions: [
        { id: 3, medication: "Metformin", dosage: "500mg", quantity: 2, refill_on: "2026-04-15", refill_schedule: "monthly" },
        { id: 4, medication: "Diovan", dosage: "100mg", quantity: 1, refill_on: "2026-04-25", refill_schedule: "monthly" }
      ]
    }
  ],
  medications: ["Diovan", "Lexapro", "Metformin", "Ozempic", "Prozac", "Seroquel", "Tegretol"],
  dosages: ["1mg", "2mg", "3mg", "5mg", "10mg", "25mg", "50mg", "100mg", "250mg", "500mg", "1000mg"]
};

async function seed() {
  const db = getDb();

  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) {
    console.log('✅ Database already seeded, skipping.');
    return;
  }

  console.log('🌱 Seeding database...');

  // Seed medications
  const insertMed = db.prepare('INSERT INTO medications (name) VALUES (?)');
  for (const med of seedData.medications) {
    insertMed.run(med);
  }
  console.log(`  ✓ ${seedData.medications.length} medications`);

  // Seed dosages
  const insertDosage = db.prepare('INSERT INTO dosages (value) VALUES (?)');
  for (const dosage of seedData.dosages) {
    insertDosage.run(dosage);
  }
  console.log(`  ✓ ${seedData.dosages.length} dosages`);

  // Seed users with appointments and prescriptions
  const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
  const insertAppt = db.prepare('INSERT INTO appointments (user_id, provider, datetime, repeat) VALUES (?, ?, ?, ?)');
  const insertRx = db.prepare('INSERT INTO prescriptions (user_id, medication, dosage, quantity, refill_on, refill_schedule) VALUES (?, ?, ?, ?, ?, ?)');

  for (const user of seedData.users) {
    const hash = bcrypt.hashSync(user.password, 10);
    const result = insertUser.run(user.name, user.email, hash);
    const userId = result.lastInsertRowid;

    for (const appt of user.appointments) {
      insertAppt.run(userId, appt.provider, appt.datetime, appt.repeat);
    }

    for (const rx of user.prescriptions) {
      insertRx.run(userId, rx.medication, rx.dosage, rx.quantity, rx.refill_on, rx.refill_schedule);
    }
  }
  console.log(`  ✓ ${seedData.users.length} users with appointments & prescriptions`);

  console.log('Seed complete!');
}

seed();
