-- ====================================================================
-- ORBINEX (Powered by AMT) - Production PostgreSQL Database Schema
-- Multi-Tenant Campus Mobility & Student Support Platform
-- Initial Tenant: MBCCET (Mar Baselios Christian College of Engineering & Technology)
-- ====================================================================

-- 1. Institutions (Multi-tenant partition)
CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO institutions (id, name, code)
VALUES ('inst_mbccet', 'Mar Baselios Christian College of Engineering & Technology (MBCCET)', 'MBCCET')
ON CONFLICT (code) DO NOTHING;

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- 3. Users (Students) Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    college_id VARCHAR(60) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_college_id ON users(college_id);

-- 4. Autos Table (Admin managed, initially empty)
CREATE TABLE IF NOT EXISTS autos (
    id SERIAL PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    auto_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(30) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Buses Table (3 College Buses)
CREATE TABLE IF NOT EXISTS buses (
    id SERIAL PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    bus_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(30) NOT NULL,
    bus_route TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Campus Security Contacts Table
CREATE TABLE IF NOT EXISTS security_contacts (
    id SERIAL PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Transport Requests Table
CREATE TABLE IF NOT EXISTS transport_requests (
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(60) NOT NULL UNIQUE,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    college_id VARCHAR(60) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    preferred_vehicle VARCHAR(100),
    assigned_vehicle VARCHAR(100),
    additional_note TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transport_user_id ON transport_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_status ON transport_requests(status);

-- 8. Medical Requests Table (Urgent)
CREATE TABLE IF NOT EXISTS medical_requests (
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(60) NOT NULL UNIQUE,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    college_id VARCHAR(60) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    current_location VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    emergency_note TEXT NOT NULL,
    assigned_vehicle VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medical_user_id ON medical_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_status ON medical_requests(status);

-- 9. Hostel Food Delivery Requests Table
CREATE TABLE IF NOT EXISTS food_delivery_requests (
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(60) NOT NULL UNIQUE,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    college_id VARCHAR(60) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    hostel_block VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    food_request TEXT NOT NULL,
    delivery_location VARCHAR(255) NOT NULL,
    additional_note TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_user_id ON food_delivery_requests(user_id);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL DEFAULT 'MBCCET',
    admin_id INTEGER,
    admin_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
