export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  username?: string;
  name: string;
  email?: string;
  phone?: string;
  college_id?: string;
  role: Role;
  institution_id: string;
  status?: string;
  created_at?: string;
}

export interface Auto {
  id: number;
  institution_id: string;
  auto_number: string;
  driver_name: string;
  driver_phone: string;
  status: 'Available' | 'In Service' | 'Unavailable';
  created_at: string;
  updated_at?: string;
}

export interface Bus {
  id: number;
  institution_id: string;
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  bus_route: string;
  status: 'Available' | 'In Transit' | 'Maintenance' | 'Unavailable';
  created_at: string;
  updated_at?: string;
}

export interface SecurityContact {
  id: number;
  institution_id: string;
  name: string;
  phone: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export type TransportStatus =
  | 'Pending'
  | 'Accepted'
  | 'Vehicle Assigned'
  | 'In Transit'
  | 'Completed'
  | 'Cancelled';

export interface TransportRequest {
  id: number;
  request_code: string;
  institution_id: string;
  user_id: number;
  student_name: string;
  college_id: string;
  phone_number: string;
  service_type: string;
  destination: string;
  preferred_vehicle?: string | null;
  assigned_vehicle?: string | null;
  additional_note?: string | null;
  status: TransportStatus;
  created_at: string;
  updated_at?: string;
}

export interface MedicalRequest {
  id: number;
  request_code: string;
  institution_id: string;
  user_id: number;
  student_name: string;
  college_id: string;
  phone_number: string;
  current_location: string;
  destination: string;
  emergency_note: string;
  assigned_vehicle?: string | null;
  status: TransportStatus;
  created_at: string;
  updated_at?: string;
}

export type FoodRequestStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface FoodDeliveryRequest {
  id: number;
  request_code: string;
  institution_id: string;
  user_id: number;
  student_name: string;
  college_id: string;
  phone_number: string;
  hostel_block: string;
  room_number: string;
  food_request: string;
  delivery_location: string;
  additional_note?: string | null;
  status: FoodRequestStatus;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  institution_id: string;
  admin_id?: number;
  admin_name?: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: string;
  timestamp: string;
}

export interface AdminStats {
  totalStudents: number;
  totalAutos: number;
  availableAutos: number;
  collegeBuses: number;
  pendingRequests: number;
  medicalRequests: number;
  foodRequests: number;
  securityContacts: number;
}
