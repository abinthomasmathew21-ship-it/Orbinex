import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb, resultToObjects } from './db.ts';
import {
  requireAuth,
  requireAdmin,
  generateToken,
  recordAudit,
  checkLoginRateLimit,
  recordFailedLogin,
  clearFailedLogin,
  AuthRequest,
} from './auth.ts';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================

// Login: Supports both Admin (Username: Abin) and Student (Email / College ID)
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const ip = req.ip || 'unknown-ip';

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required.' });
  }

  const rateCheck = checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Too many failed attempts. Please wait ${rateCheck.waitSeconds} seconds before retrying.`,
    });
  }

  try {
    const db = await getDb();
    const cleanId = String(identifier).trim();

    // 1. Check Admin Table first (matches username e.g. "Abin")
    const adminQuery = db.prepare('SELECT * FROM admins WHERE LOWER(username) = LOWER(?) LIMIT 1');
    adminQuery.bind([cleanId]);
    if (adminQuery.step()) {
      const adminRow = adminQuery.getAsObject() as any;
      adminQuery.free();

      const passwordMatch = bcrypt.compareSync(password, adminRow.password_hash);
      if (passwordMatch) {
        clearFailedLogin(ip);
        const userPayload = {
          id: adminRow.id,
          username: adminRow.username,
          name: adminRow.name,
          role: 'ADMIN' as const,
          institution_id: adminRow.institution_id || 'MBCCET',
        };
        const token = generateToken(userPayload);

        res.cookie('orbinex_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        await recordAudit(adminRow.id, adminRow.name, 'Admin Login', 'admins', String(adminRow.id), 'Successful admin login');

        return res.json({
          message: 'Admin signed in successfully',
          token,
          user: userPayload,
        });
      }
    } else {
      adminQuery.free();
    }

    // 2. Check Students Table (matches email or college_id)
    const studentQuery = db.prepare(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(college_id) = LOWER(?) LIMIT 1'
    );
    studentQuery.bind([cleanId, cleanId]);
    if (studentQuery.step()) {
      const studentRow = studentQuery.getAsObject() as any;
      studentQuery.free();

      const passwordMatch = bcrypt.compareSync(password, studentRow.password_hash);
      if (passwordMatch) {
        clearFailedLogin(ip);
        const userPayload = {
          id: studentRow.id,
          name: studentRow.name,
          email: studentRow.email,
          phone: studentRow.phone,
          college_id: studentRow.college_id,
          role: 'STUDENT' as const,
          institution_id: studentRow.institution_id || 'MBCCET',
        };
        const token = generateToken(userPayload);

        res.cookie('orbinex_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
          message: 'Student signed in successfully',
          token,
          user: userPayload,
        });
      }
    } else {
      studentQuery.free();
    }

    // Invalid credentials
    recordFailedLogin(ip);
    return res.status(401).json({ error: 'Invalid credentials. Please verify your details.' });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication service encountered an error.' });
  }
});

// Student Registration
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, phone, college_id, password } = req.body;

  if (!name || !email || !phone || !college_id || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Basic validation
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanCollegeId = String(college_id).trim().toUpperCase();
  const cleanPhone = String(phone).trim();
  const cleanName = String(name).trim();

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const db = await getDb();

    // Check if email or college_id already registered
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(college_id) = ?');
    existing.bind([cleanEmail, cleanCollegeId.toLowerCase()]);
    if (existing.step()) {
      existing.free();
      return res.status(409).json({ error: 'A student with this Email or College ID already exists.' });
    }
    existing.free();

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertStmt = db.prepare(`
      INSERT INTO users (institution_id, name, email, phone, college_id, password_hash, role, status)
      VALUES ('MBCCET', ?, ?, ?, ?, ?, 'STUDENT', 'Active')
    `);
    insertStmt.run([cleanName, cleanEmail, cleanPhone, cleanCollegeId, hashedPassword]);
    insertStmt.free();
    saveDb();

    // Fetch newly created student
    const newStudentResult = db.exec(`SELECT * FROM users WHERE email = '${cleanEmail.replace(/'/g, "''")}'`);
    const newStudents = resultToObjects(newStudentResult);
    const student = newStudents[0];

    const userPayload = {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      college_id: student.college_id,
      role: 'STUDENT' as const,
      institution_id: 'MBCCET',
    };

    const token = generateToken(userPayload);
    res.cookie('orbinex_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(201).json({
      message: 'Student account created successfully',
      token,
      user: userPayload,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create student account.' });
  }
});

// Logout
apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('orbinex_token');
  return res.json({ message: 'Signed out successfully' });
});

// Get Current User Profile
apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// ==========================================
// 2. AUTO MANAGEMENT (RULE 8: INITIALLY EMPTY)
// ==========================================

// Students & Public: View Available Autos
apiRouter.get('/autos', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT id, auto_number, driver_name, driver_phone, status, created_at FROM autos ORDER BY id DESC');
    const autos = resultToObjects(result);
    return res.json(autos);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch autos.' });
  }
});

// Admin: Add Auto (Rule 1: Only admin can add)
apiRouter.post('/admin/autos', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { auto_number, driver_name, driver_phone, status } = req.body;

  if (!auto_number || !driver_name || !driver_phone) {
    return res.status(400).json({ error: 'Auto Number, Driver Name, and Driver Phone are required.' });
  }

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO autos (institution_id, auto_number, driver_name, driver_phone, status)
      VALUES ('MBCCET', ?, ?, ?, ?)
    `);
    stmt.run([
      String(auto_number).trim(),
      String(driver_name).trim(),
      String(driver_phone).trim(),
      status || 'Available',
    ]);
    stmt.free();
    saveDb();

    // Audit log
    await recordAudit(req.user?.id, req.user?.name, 'Auto Added', 'autos', auto_number, `Added auto ${auto_number} (${driver_name})`);

    return res.status(201).json({ message: 'Auto added successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add auto.' });
  }
});

// Admin: Update Auto (Rule 2: Only admin can edit)
apiRouter.put('/admin/autos/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { auto_number, driver_name, driver_phone, status } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid auto ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      UPDATE autos
      SET auto_number = COALESCE(?, auto_number),
          driver_name = COALESCE(?, driver_name),
          driver_phone = COALESCE(?, driver_phone),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([auto_number || null, driver_name || null, driver_phone || null, status || null, id]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Auto Updated', 'autos', String(id), `Updated auto ID ${id}`);

    return res.json({ message: 'Auto updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update auto.' });
  }
});

// Admin: Delete Auto (Rule 3: Only admin can delete)
apiRouter.delete('/admin/autos/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid auto ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare('DELETE FROM autos WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Auto Deleted', 'autos', String(id), `Deleted auto ID ${id}`);

    return res.json({ message: 'Auto deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete auto.' });
  }
});

// ==========================================
// 3. COLLEGE BUS MANAGEMENT (RULE 9 & 14: 3 BUSES)
// ==========================================

// Students: View Buses
apiRouter.get('/buses', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM buses ORDER BY id ASC');
    const buses = resultToObjects(result);
    return res.json(buses);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch buses.' });
  }
});

// Admin: Add Bus
apiRouter.post('/admin/buses', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { bus_number, driver_name, driver_phone, bus_route, status } = req.body;

  if (!bus_number || !driver_name || !driver_phone || !bus_route) {
    return res.status(400).json({ error: 'Bus Number, Driver Name, Driver Phone, and Bus Route are required.' });
  }

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO buses (institution_id, bus_number, driver_name, driver_phone, bus_route, status)
      VALUES ('MBCCET', ?, ?, ?, ?, ?)
    `);
    stmt.run([
      String(bus_number).trim(),
      String(driver_name).trim(),
      String(driver_phone).trim(),
      String(bus_route).trim(),
      status || 'Available',
    ]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Bus Added', 'buses', bus_number, `Configured bus ${bus_number}`);

    return res.status(201).json({ message: 'Bus configured successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add bus.' });
  }
});

// Admin: Update Bus
apiRouter.put('/admin/buses/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { bus_number, driver_name, driver_phone, bus_route, status } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid bus ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      UPDATE buses
      SET bus_number = COALESCE(?, bus_number),
          driver_name = COALESCE(?, driver_name),
          driver_phone = COALESCE(?, driver_phone),
          bus_route = COALESCE(?, bus_route),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([bus_number || null, driver_name || null, driver_phone || null, bus_route || null, status || null, id]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Bus Updated', 'buses', String(id), `Updated bus ID ${id}`);

    return res.json({ message: 'Bus updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update bus.' });
  }
});

// Admin: Delete Bus
apiRouter.delete('/admin/buses/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid bus ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare('DELETE FROM buses WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Bus Deleted', 'buses', String(id), `Deleted bus ID ${id}`);

    return res.json({ message: 'Bus deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete bus.' });
  }
});

// ==========================================
// 4. CAMPUS SECURITY (RULE 10 & 16: INITIALLY EMPTY)
// ==========================================

// Students: View Security Contacts
apiRouter.get('/security', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM security_contacts WHERE status = 'Active' ORDER BY id ASC");
    const contacts = resultToObjects(result);
    return res.json(contacts);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch security contacts.' });
  }
});

// Admin: Add Security Contact
apiRouter.post('/admin/security', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, phone, status } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Security Name and Phone Number are required.' });
  }

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO security_contacts (institution_id, name, phone, status)
      VALUES ('MBCCET', ?, ?, ?)
    `);
    stmt.run([String(name).trim(), String(phone).trim(), status || 'Active']);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Security Contact Added', 'security_contacts', name, `Added security contact ${name}`);

    return res.status(201).json({ message: 'Security contact added successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add security contact.' });
  }
});

// Admin: Edit Security Contact
apiRouter.put('/admin/security/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name, phone, status } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid contact ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      UPDATE security_contacts
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([name || null, phone || null, status || null, id]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Security Contact Updated', 'security_contacts', String(id), `Updated contact ID ${id}`);

    return res.json({ message: 'Security contact updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update security contact.' });
  }
});

// Admin: Delete Security Contact
apiRouter.delete('/admin/security/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid contact ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare('DELETE FROM security_contacts WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Security Contact Deleted', 'security_contacts', String(id), `Deleted contact ID ${id}`);

    return res.json({ message: 'Security contact deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete security contact.' });
  }
});

// ==========================================
// 5. TRANSPORT REQUESTS (₹100 & MBCCET -> KUTTIKANAM)
// ==========================================

// Student: Create Transport Request
apiRouter.post('/transport-requests', requireAuth, async (req: AuthRequest, res: Response) => {
  const { destination, service_type, preferred_vehicle, additional_note } = req.body;

  if (!destination || !service_type) {
    return res.status(400).json({ error: 'Destination and Service Type are required.' });
  }

  const allowedTypes = [
    '₹100 Vehicle Arrangement',
    'MBCCET → Kuttikanam',
    'Medical Transportation',
    'Other Approved Transportation',
  ];

  if (!allowedTypes.includes(service_type)) {
    return res.status(400).json({ error: 'Invalid service type.' });
  }

  try {
    const db = await getDb();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestCode = `ORB-2026-${randomSuffix}`;

    const stmt = db.prepare(`
      INSERT INTO transport_requests (
        request_code, institution_id, user_id, student_name, college_id, phone_number,
        service_type, destination, preferred_vehicle, additional_note, status
      ) VALUES (?, 'MBCCET', ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    stmt.run([
      requestCode,
      req.user!.id,
      req.user!.name,
      req.user!.college_id || 'N/A',
      req.user!.phone || 'N/A',
      service_type,
      String(destination).trim(),
      preferred_vehicle || null,
      additional_note || null,
    ]);
    stmt.free();
    saveDb();

    return res.status(201).json({
      message: 'Request Submitted Successfully',
      request_code: requestCode,
    });
  } catch (err) {
    console.error('Transport request error:', err);
    return res.status(500).json({ error: 'Failed to submit transport request.' });
  }
});

// Student: View Own Transport Requests (Rule 6: Students cannot access other students' requests)
apiRouter.get('/transport-requests/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM transport_requests WHERE user_id = ? ORDER BY id DESC');
    stmt.bind([req.user!.id]);
    const items: any[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch your transport requests.' });
  }
});

// Admin: View All Transport Requests (Search & Filter)
apiRouter.get('/admin/transport-requests', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { status, service, search } = req.query;

  try {
    const db = await getDb();
    let query = 'SELECT * FROM transport_requests WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(String(status));
    }
    if (service && service !== 'all') {
      query += ' AND service_type = ?';
      params.push(String(service));
    }
    if (search) {
      query += ' AND (student_name LIKE ? OR college_id LIKE ? OR request_code LIKE ? OR destination LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY id DESC';

    const stmt = db.prepare(query);
    stmt.bind(params);
    const items: any[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch transport requests.' });
  }
});

// Admin: Update Transport Request Status / Assign Vehicle
apiRouter.put('/admin/transport-requests/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status, assigned_vehicle } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      UPDATE transport_requests
      SET status = COALESCE(?, status),
          assigned_vehicle = COALESCE(?, assigned_vehicle),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([status || null, assigned_vehicle || null, id]);
    stmt.free();
    saveDb();

    await recordAudit(
      req.user?.id,
      req.user?.name,
      'Request Status Changed',
      'transport_requests',
      String(id),
      `Updated to ${status}${assigned_vehicle ? ` (Vehicle: ${assigned_vehicle})` : ''}`
    );

    return res.json({ message: 'Transport request updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update transport request.' });
  }
});

// ==========================================
// 6. MEDICAL TRANSPORTATION
// ==========================================

// Student: Create Medical Transport Request
apiRouter.post('/medical-requests', requireAuth, async (req: AuthRequest, res: Response) => {
  const { current_location, destination, emergency_note } = req.body;

  if (!current_location || !destination || !emergency_note) {
    return res.status(400).json({ error: 'Current Location, Destination, and Emergency Note are required.' });
  }

  try {
    const db = await getDb();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestCode = `ORB-MED-${randomSuffix}`;

    const stmt = db.prepare(`
      INSERT INTO medical_requests (
        request_code, institution_id, user_id, student_name, college_id, phone_number,
        current_location, destination, emergency_note, status
      ) VALUES (?, 'MBCCET', ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    stmt.run([
      requestCode,
      req.user!.id,
      req.user!.name,
      req.user!.college_id || 'N/A',
      req.user!.phone || 'N/A',
      String(current_location).trim(),
      String(destination).trim(),
      String(emergency_note).trim(),
    ]);
    stmt.free();
    saveDb();

    return res.status(201).json({
      message: 'Medical Transport Request Submitted Successfully',
      request_code: requestCode,
    });
  } catch (err) {
    console.error('Medical request error:', err);
    return res.status(500).json({ error: 'Failed to submit medical request.' });
  }
});

// Student: View Own Medical Requests
apiRouter.get('/medical-requests/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM medical_requests WHERE user_id = ? ORDER BY id DESC');
    stmt.bind([req.user!.id]);
    const items: any[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch your medical requests.' });
  }
});

// Admin: View All Medical Requests
apiRouter.get('/admin/medical-requests', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { status, search } = req.query;

  try {
    const db = await getDb();
    let query = 'SELECT * FROM medical_requests WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(String(status));
    }
    if (search) {
      query += ' AND (student_name LIKE ? OR college_id LIKE ? OR request_code LIKE ? OR destination LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY id DESC';

    const stmt = db.prepare(query);
    stmt.bind(params);
    const items: any[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch medical requests.' });
  }
});

// Admin: Update Medical Request Status / Vehicle
apiRouter.put('/admin/medical-requests/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status, assigned_vehicle } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      UPDATE medical_requests
      SET status = COALESCE(?, status),
          assigned_vehicle = COALESCE(?, assigned_vehicle),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([status || null, assigned_vehicle || null, id]);
    stmt.free();
    saveDb();

    await recordAudit(
      req.user?.id,
      req.user?.name,
      'Medical Status Changed',
      'medical_requests',
      String(id),
      `Updated to ${status}${assigned_vehicle ? ` (Vehicle: ${assigned_vehicle})` : ''}`
    );

    return res.json({ message: 'Medical request updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update medical request.' });
  }
});

// ==========================================
// 7. HOSTEL FOOD DELIVERY
// ==========================================

// Student: Create Food Request
apiRouter.post('/food-requests', requireAuth, async (req: AuthRequest, res: Response) => {
  const { hostel_block, room_number, food_request, delivery_location, additional_note } = req.body;

  if (!hostel_block || !room_number || !food_request || !delivery_location) {
    return res.status(400).json({
      error: 'Hostel Block, Room Number, Food Request details, and Delivery Location are required.',
    });
  }

  try {
    const db = await getDb();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestCode = `ORB-FOOD-${randomSuffix}`;

    const stmt = db.prepare(`
      INSERT INTO food_delivery_requests (
        request_code, institution_id, user_id, student_name, college_id, phone_number,
        hostel_block, room_number, food_request, delivery_location, additional_note, status
      ) VALUES (?, 'MBCCET', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    stmt.run([
      requestCode,
      req.user!.id,
      req.user!.name,
      req.user!.college_id || 'N/A',
      req.user!.phone || 'N/A',
      String(hostel_block).trim(),
      String(room_number).trim(),
      String(food_request).trim(),
      String(delivery_location).trim(),
      additional_note || null,
    ]);
    stmt.free();
    saveDb();

    return res.status(201).json({
      message: 'Food Delivery Request Submitted Successfully',
      request_code: requestCode,
    });
  } catch (err) {
    console.error('Food request error:', err);
    return res.status(500).json({ error: 'Failed to submit food delivery request.' });
  }
});

// Student: View Own Food Requests
apiRouter.get('/food-requests/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM food_delivery_requests WHERE user_id = ? ORDER BY id DESC');
    stmt.bind([req.user!.id]);
    const items: any[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch your food delivery requests.' });
  }
});

// Admin: View All Food Requests
apiRouter.get('/admin/food-requests', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { status, search } = req.query;

  try {
    const db = await getDb();
    let query = 'SELECT * FROM food_delivery_requests WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(String(status));
    }
    if (search) {
      query += ' AND (student_name LIKE ? OR college_id LIKE ? OR request_code LIKE ? OR hostel_block LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY id DESC';

    const stmt = db.prepare(query);
    stmt.bind(params);
    const items: any[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch food delivery requests.' });
  }
});

// Admin: Update Food Request Status
apiRouter.put('/admin/food-requests/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db = await getDb();
    const stmt = db.prepare(`
      UPDATE food_delivery_requests
      SET status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([status || null, id]);
    stmt.free();
    saveDb();

    await recordAudit(req.user?.id, req.user?.name, 'Food Request Updated', 'food_delivery_requests', String(id), `Updated status to ${status}`);

    return res.json({ message: 'Food delivery request updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update food request.' });
  }
});

// ==========================================
// 8. ADMIN DASHBOARD STATS & AUDIT LOG
// ==========================================

apiRouter.get('/admin/stats', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getDb();

    const getCount = (sql: string): number => {
      const res = db.exec(sql);
      if (res.length > 0 && res[0].values.length > 0) {
        return Number(res[0].values[0][0]) || 0;
      }
      return 0;
    };

    const totalStudents = getCount("SELECT COUNT(*) FROM users WHERE role = 'STUDENT'");
    const totalAutos = getCount('SELECT COUNT(*) FROM autos');
    const availableAutos = getCount("SELECT COUNT(*) FROM autos WHERE status = 'Available'");
    const collegeBuses = getCount('SELECT COUNT(*) FROM buses');
    const pendingTransport = getCount("SELECT COUNT(*) FROM transport_requests WHERE status = 'Pending'");
    const pendingMedical = getCount("SELECT COUNT(*) FROM medical_requests WHERE status = 'Pending'");
    const pendingFood = getCount("SELECT COUNT(*) FROM food_delivery_requests WHERE status = 'Pending'");
    const totalPendingRequests = pendingTransport + pendingMedical + pendingFood;
    const securityContacts = getCount('SELECT COUNT(*) FROM security_contacts');

    return res.json({
      totalStudents,
      totalAutos,
      availableAutos,
      collegeBuses,
      pendingRequests: totalPendingRequests,
      medicalRequests: pendingMedical,
      foodRequests: pendingFood,
      securityContacts,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate statistics.' });
  }
});

// Admin: Audit Logs
apiRouter.get('/admin/audit-logs', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50');
    const logs = resultToObjects(result);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// Admin: Student Directory
apiRouter.get('/admin/students', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec(
      "SELECT id, name, email, phone, college_id, status, created_at FROM users WHERE role = 'STUDENT' ORDER BY id DESC"
    );
    const students = resultToObjects(result);
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch student directory.' });
  }
});
