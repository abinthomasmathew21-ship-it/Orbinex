import initSqlJs from 'sql.js';
import type { Database, QueryExecResult } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

let dbInstance: Database | null = null;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'orbinex.sqlite');

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Enable foreign keys
  dbInstance.run('PRAGMA foreign_keys = ON;');

  initSchema(dbInstance);
  saveDb();

  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

function initSchema(db: Database) {
  // 1. Tenants / Institutions
  db.run(`
    CREATE TABLE IF NOT EXISTS institutions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed MBCCET if not exists
  const instCheck = db.exec("SELECT id FROM institutions WHERE code = 'MBCCET'");
  if (instCheck.length === 0 || instCheck[0].values.length === 0) {
    db.run(
      "INSERT INTO institutions (id, name, code) VALUES ('inst_mbccet', 'Mar Baselios Christian College of Engineering & Technology (MBCCET)', 'MBCCET')"
    );
  }

  // 2. Admins Table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin: Username: Abin, Password: abinabiya (Securely hashed using bcrypt)
  const adminCheck = db.exec("SELECT id FROM admins WHERE username = 'Abin'");
  if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
    const hashed = bcrypt.hashSync('abinabiya', 10);
    const stmt = db.prepare(
      "INSERT INTO admins (institution_id, username, password_hash, name, status) VALUES ('MBCCET', 'Abin', ?, 'Abin (Campus Admin)', 'Active')"
    );
    stmt.run([hashed]);
    stmt.free();
    console.log('[ORBINEX Security] Initialized secure admin account: Abin');
  }

  // 3. Users (Students) Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      college_id TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STUDENT',
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed a sample student for immediate testing if empty
  const studentCheck = db.exec("SELECT id FROM users WHERE email = 'student@mbccet.ac.in'");
  if (studentCheck.length === 0 || studentCheck[0].values.length === 0) {
    const studentHash = bcrypt.hashSync('student123', 10);
    const sStmt = db.prepare(`
      INSERT INTO users (institution_id, name, email, phone, college_id, password_hash, role, status)
      VALUES ('MBCCET', 'Rahul Varma', 'student@mbccet.ac.in', '9847123456', 'MBC23CS042', ?, 'STUDENT', 'Active')
    `);
    sStmt.run([studentHash]);
    sStmt.free();
  }

  // 4. Autos Table (Initially empty as per Rule 8)
  db.run(`
    CREATE TABLE IF NOT EXISTS autos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      auto_number TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. College Buses Table (Initially empty as per Rule 9)
  db.run(`
    CREATE TABLE IF NOT EXISTS buses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      bus_number TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      bus_route TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Security Contacts Table (Initially empty as per Rule 10)
  db.run(`
    CREATE TABLE IF NOT EXISTS security_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Transport Requests Table
  db.run(`
    CREATE TABLE IF NOT EXISTS transport_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT NOT NULL UNIQUE,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      user_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      college_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      service_type TEXT NOT NULL,
      destination TEXT NOT NULL,
      preferred_vehicle TEXT,
      assigned_vehicle TEXT,
      additional_note TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 8. Medical Requests Table
  db.run(`
    CREATE TABLE IF NOT EXISTS medical_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT NOT NULL UNIQUE,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      user_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      college_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      current_location TEXT NOT NULL,
      destination TEXT NOT NULL,
      emergency_note TEXT NOT NULL,
      assigned_vehicle TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 9. Hostel Food Delivery Requests Table
  db.run(`
    CREATE TABLE IF NOT EXISTS food_delivery_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT NOT NULL UNIQUE,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      user_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      college_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      hostel_block TEXT NOT NULL,
      room_number TEXT NOT NULL,
      food_request TEXT NOT NULL,
      delivery_location TEXT NOT NULL,
      additional_note TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 10. Audit Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id TEXT NOT NULL DEFAULT 'MBCCET',
      admin_id INTEGER,
      admin_name TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Helper to convert SQL query result to array of objects
export function resultToObjects<T = any>(result: QueryExecResult[]): T[] {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as T;
  });
}
