import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import {
  Auto,
  Bus,
  SecurityContact,
  TransportRequest,
  MedicalRequest,
  FoodDeliveryRequest,
  AdminStats,
  AuditLog,
  User,
} from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import {
  Layers,
  Car,
  Bus as BusIcon,
  Shield,
  FileText,
  HeartPulse,
  UtensilsCrossed,
  Users,
  History,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Phone,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  ChevronDown,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface AdminPortalProps {
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // Stats & Entities
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [autos, setAutos] = useState<Auto[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [securityContacts, setSecurityContacts] = useState<SecurityContact[]>([]);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [medicalRequests, setMedicalRequests] = useState<MedicalRequest[]>([]);
  const [foodRequests, setFoodRequests] = useState<FoodDeliveryRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Modals
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [editingAuto, setEditingAuto] = useState<Auto | null>(null);
  const [autoForm, setAutoForm] = useState({ auto_number: '', driver_name: '', driver_phone: '', status: 'Available' });

  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [busForm, setBusForm] = useState({ bus_number: '', driver_name: '', driver_phone: '', bus_route: '', status: 'Available' });

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState<SecurityContact | null>(null);
  const [securityForm, setSecurityForm] = useState({ name: '', phone: '', status: 'Active' });

  // Status Update & Assignment Modal
  const [selectedRequest, setSelectedRequest] = useState<{
    id: number;
    type: 'transport' | 'medical' | 'food';
    code: string;
    status: string;
    assigned_vehicle?: string;
  } | null>(null);

  const [assignForm, setAssignForm] = useState({ status: '', assigned_vehicle: '' });

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, autosData, busesData, secData, transData, medData, foodData, logsData, studentsData] =
        await Promise.all([
          api.getAdminStats(),
          api.getAutos(),
          api.getBuses(),
          api.getSecurity(),
          api.getAdminTransportRequests({ search: searchQuery, status: statusFilter, service: serviceFilter }),
          api.getAdminMedicalRequests({ search: searchQuery, status: statusFilter }),
          api.getAdminFoodRequests({ search: searchQuery, status: statusFilter }),
          api.getAuditLogs(),
          api.getStudents(),
        ]);

      setStats(statsData);
      setAutos(autosData);
      setBuses(busesData);
      setSecurityContacts(secData);
      setTransportRequests(transData);
      setMedicalRequests(medData);
      setFoodRequests(foodData);
      setAuditLogs(logsData);
      setStudents(studentsData);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch admin data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter, serviceFilter]);

  // Handle Search Debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAdminData();
  };

  // AUTO CRUD
  const handleSaveAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAuto) {
        await api.updateAuto(editingAuto.id, autoForm as any);
        setStatusMessage({ type: 'success', text: `Auto ${autoForm.auto_number} updated successfully.` });
      } else {
        await api.createAuto(autoForm as any);
        setStatusMessage({ type: 'success', text: `Auto ${autoForm.auto_number} added successfully.` });
      }
      setShowAutoModal(false);
      setEditingAuto(null);
      setAutoForm({ auto_number: '', driver_name: '', driver_phone: '', status: 'Available' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving auto.' });
    }
  };

  const handleDeleteAuto = async (id: number) => {
    if (!confirm('Are you sure you want to delete this auto?')) return;
    try {
      await api.deleteAuto(id);
      setStatusMessage({ type: 'success', text: 'Auto deleted successfully.' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error deleting auto.' });
    }
  };

  // BUS CRUD
  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await api.updateBus(editingBus.id, busForm as any);
        setStatusMessage({ type: 'success', text: `Bus ${busForm.bus_number} updated successfully.` });
      } else {
        await api.createBus(busForm as any);
        setStatusMessage({ type: 'success', text: `Bus ${busForm.bus_number} added successfully.` });
      }
      setShowBusModal(false);
      setEditingBus(null);
      setBusForm({ bus_number: '', driver_name: '', driver_phone: '', bus_route: '', status: 'Available' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving bus.' });
    }
  };

  const handleDeleteBus = async (id: number) => {
    if (!confirm('Are you sure you want to delete this college bus?')) return;
    try {
      await api.deleteBus(id);
      setStatusMessage({ type: 'success', text: 'Bus deleted successfully.' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error deleting bus.' });
    }
  };

  // SECURITY CRUD
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSecurity) {
        await api.updateSecurity(editingSecurity.id, securityForm as any);
        setStatusMessage({ type: 'success', text: 'Security contact updated successfully.' });
      } else {
        await api.createSecurity(securityForm as any);
        setStatusMessage({ type: 'success', text: 'Security contact added successfully.' });
      }
      setShowSecurityModal(false);
      setEditingSecurity(null);
      setSecurityForm({ name: '', phone: '', status: 'Active' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving security contact.' });
    }
  };

  const handleDeleteSecurity = async (id: number) => {
    if (!confirm('Are you sure you want to remove this security contact?')) return;
    try {
      await api.deleteSecurity(id);
      setStatusMessage({ type: 'success', text: 'Security contact removed successfully.' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error removing contact.' });
    }
  };

  // REQUEST STATUS UPDATE
  const handleUpdateRequestStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      if (selectedRequest.type === 'transport') {
        await api.updateAdminTransportRequest(selectedRequest.id, {
          status: assignForm.status,
          assigned_vehicle: assignForm.assigned_vehicle || undefined,
        });
      } else if (selectedRequest.type === 'medical') {
        await api.updateAdminMedicalRequest(selectedRequest.id, {
          status: assignForm.status,
          assigned_vehicle: assignForm.assigned_vehicle || undefined,
        });
      } else if (selectedRequest.type === 'food') {
        await api.updateAdminFoodRequest(selectedRequest.id, {
          status: assignForm.status,
        });
      }

      setStatusMessage({ type: 'success', text: `Request ${selectedRequest.code} updated to ${assignForm.status}.` });
      setSelectedRequest(null);
      await loadAdminData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update request.' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900">
      {/* 1. SaaS Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              O
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 block leading-tight">
                ORBINEX
              </span>
              <span className="text-[11px] font-semibold text-neutral-500">Powered by AMT</span>
            </div>
          </div>
          <div className="mt-4 px-2.5 py-1 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700">MBCCET Campus</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-4 space-y-1 text-xs font-semibold overflow-y-auto">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'dashboard'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4 text-orange-600" />
            <span>Dashboard</span>
          </button>

          <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Transportation
          </div>
          <button
            onClick={() => setActiveSection('autos')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'autos'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <Car className="w-4 h-4 text-neutral-500" />
            <span>Autos & Fleets</span>
            <span className="ml-auto text-[11px] font-mono text-neutral-400">{autos.length}</span>
          </button>
          <button
            onClick={() => setActiveSection('buses')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'buses'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <BusIcon className="w-4 h-4 text-neutral-500" />
            <span>College Buses</span>
            <span className="ml-auto text-[11px] font-mono text-neutral-400">{buses.length}/3</span>
          </button>

          <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Requests Management
          </div>
          <button
            onClick={() => setActiveSection('transport-requests')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'transport-requests'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4 text-neutral-500" />
            <span>Transport Requests</span>
            <span className="ml-auto text-[11px] font-mono text-neutral-400">{transportRequests.length}</span>
          </button>
          <button
            onClick={() => setActiveSection('medical-requests')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'medical-requests'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-red-600" />
            <span>Medical Requests</span>
            <span className="ml-auto text-[11px] font-mono text-red-600 font-bold">
              {medicalRequests.filter((m) => m.status === 'Pending').length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection('food-requests')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'food-requests'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-neutral-500" />
            <span>Hostel Food Requests</span>
            <span className="ml-auto text-[11px] font-mono text-neutral-400">{foodRequests.length}</span>
          </button>

          <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Campus Operations
          </div>
          <button
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'security'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <Shield className="w-4 h-4 text-neutral-500" />
            <span>Security Contacts</span>
            <span className="ml-auto text-[11px] font-mono text-neutral-400">{securityContacts.length}</span>
          </button>
          <button
            onClick={() => setActiveSection('students')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'students'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4 text-neutral-500" />
            <span>Student Directory</span>
            <span className="ml-auto text-[11px] font-mono text-neutral-400">{students.length}</span>
          </button>
          <button
            onClick={() => setActiveSection('audit')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'audit'
                ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <History className="w-4 h-4 text-neutral-500" />
            <span>Audit Trail</span>
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/60">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-neutral-900 block">{user?.name}</span>
              <span className="text-[11px] text-neutral-500">Administrator</span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Operational Bar */}
        <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, college IDs, request codes, destinations..."
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAdminData()}
              title="Refresh Data"
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Section Contents */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Notification feedback */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                statusMessage.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <span className="font-medium">{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SECTION: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Admin Operations Console</h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Institution: Mar Baselios Christian College of Engineering & Technology (MBCCET)
                </p>
              </div>

              {/* Statistic Cards (Section 20) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Total Students
                  </span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
                    {stats?.totalStudents ?? 0}
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Available Autos
                  </span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
                    {stats?.availableAutos ?? 0}
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    College Buses
                  </span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
                    {stats?.collegeBuses ?? 0}/3
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Pending Requests
                  </span>
                  <p className="text-2xl font-bold text-orange-600 mt-2 font-mono">
                    {stats?.pendingRequests ?? 0}
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Medical Requests
                  </span>
                  <p className="text-2xl font-bold text-red-600 mt-2 font-mono">
                    {stats?.medicalRequests ?? 0}
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Food Requests
                  </span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
                    {stats?.foodRequests ?? 0}
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Security Contacts
                  </span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
                    {stats?.securityContacts ?? 0}
                  </p>
                </div>
              </div>

              {/* Quick Admin Actions Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setEditingAuto(null);
                    setAutoForm({ auto_number: '', driver_name: '', driver_phone: '', status: 'Available' });
                    setShowAutoModal(true);
                  }}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Auto</span>
                </button>

                <button
                  onClick={() => {
                    setEditingBus(null);
                    setBusForm({ bus_number: '', driver_name: '', driver_phone: '', bus_route: '', status: 'Available' });
                    setShowBusModal(true);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Bus</span>
                </button>

                <button
                  onClick={() => {
                    setEditingSecurity(null);
                    setSecurityForm({ name: '', phone: '', status: 'Active' });
                    setShowSecurityModal(true);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Security Contact</span>
                </button>
              </div>

              {/* Recent Pending Requests Table */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Pending Transport & Medical Alerts</h3>
                    <p className="text-xs text-neutral-500">Real-time incoming student requests requiring attention</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                        <th className="py-2.5 px-4 font-semibold">Request ID</th>
                        <th className="py-2.5 px-4 font-semibold">Student</th>
                        <th className="py-2.5 px-4 font-semibold">Phone</th>
                        <th className="py-2.5 px-4 font-semibold">Service</th>
                        <th className="py-2.5 px-4 font-semibold">Destination</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {transportRequests.slice(0, 5).map((t) => (
                        <tr key={`t-${t.id}`} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">{t.request_code}</td>
                          <td className="py-3 px-4 font-medium text-neutral-900">
                            {t.student_name} <span className="text-neutral-400">({t.college_id})</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{t.phone_number}</td>
                          <td className="py-3 px-4 font-semibold text-neutral-700">{t.service_type}</td>
                          <td className="py-3 px-4 text-neutral-600">{t.destination}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedRequest({
                                  id: t.id,
                                  type: 'transport',
                                  code: t.request_code,
                                  status: t.status,
                                  assigned_vehicle: t.assigned_vehicle || '',
                                });
                                setAssignForm({
                                  status: t.status,
                                  assigned_vehicle: t.assigned_vehicle || '',
                                });
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 font-semibold rounded text-neutral-700 cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}

                      {transportRequests.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-neutral-500">
                            No requests pending at this time.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AUTOS MANAGEMENT (RULE 21 EMPTY STATE) */}
          {activeSection === 'autos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Auto Fleet Management</h2>
                  <p className="text-xs text-neutral-500">
                    Manage MBCCET campus auto rickshaws, driver details, and availability status
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingAuto(null);
                    setAutoForm({ auto_number: '', driver_name: '', driver_phone: '', status: 'Available' });
                    setShowAutoModal(true);
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Auto</span>
                </button>
              </div>

              {autos.length === 0 ? (
                /* RULE 21: SPECIFIC ADMIN EMPTY STATE FOR AUTOS */
                <div className="py-16 px-4 bg-white border border-dashed border-neutral-300 rounded-xl text-center max-w-xl mx-auto">
                  <Car className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-neutral-900">No autos added yet.</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Add your first auto to make it available to students.
                  </p>
                  <button
                    onClick={() => {
                      setEditingAuto(null);
                      setAutoForm({ auto_number: '', driver_name: '', driver_phone: '', status: 'Available' });
                      setShowAutoModal(true);
                    }}
                    className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Auto</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                          <th className="py-3 px-4 font-semibold">Auto Number</th>
                          <th className="py-3 px-4 font-semibold">Driver Name</th>
                          <th className="py-3 px-4 font-semibold">Driver Phone</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {autos.map((auto) => (
                          <tr key={auto.id} className="hover:bg-neutral-50/70">
                            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{auto.auto_number}</td>
                            <td className="py-3 px-4 text-neutral-800 font-medium">{auto.driver_name}</td>
                            <td className="py-3 px-4 font-mono text-neutral-600">{auto.driver_phone}</td>
                            <td className="py-3 px-4">
                              <StatusBadge status={auto.status} />
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingAuto(auto);
                                  setAutoForm({
                                    auto_number: auto.auto_number,
                                    driver_name: auto.driver_name,
                                    driver_phone: auto.driver_phone,
                                    status: auto.status,
                                  });
                                  setShowAutoModal(true);
                                }}
                                className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAuto(auto.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: BUSES MANAGEMENT (RULE 21 EMPTY STATE) */}
          {activeSection === 'buses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">College Bus Management</h2>
                  <p className="text-xs text-neutral-500">
                    Configure the 3 official MBCCET college buses, routes, and drivers
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingBus(null);
                    setBusForm({ bus_number: '', driver_name: '', driver_phone: '', bus_route: '', status: 'Available' });
                    setShowBusModal(true);
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Bus</span>
                </button>
              </div>

              {buses.length === 0 ? (
                /* RULE 21: SPECIFIC ADMIN EMPTY STATE FOR BUSES */
                <div className="py-16 px-4 bg-white border border-dashed border-neutral-300 rounded-xl text-center max-w-xl mx-auto">
                  <BusIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-neutral-900">No buses added yet.</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    The college has 3 buses. Configure the institutional bus routes for students.
                  </p>
                  <button
                    onClick={() => {
                      setEditingBus(null);
                      setBusForm({ bus_number: '', driver_name: '', driver_phone: '', bus_route: '', status: 'Available' });
                      setShowBusModal(true);
                    }}
                    className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Bus</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {buses.map((bus) => (
                    <div
                      key={bus.id}
                      className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono font-bold text-sm text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                            {bus.bus_number}
                          </span>
                          <StatusBadge status={bus.status} />
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900">{bus.bus_route}</h4>
                        <div className="mt-4 pt-3 border-t border-neutral-100 text-xs space-y-1.5 text-neutral-600">
                          <p className="flex justify-between">
                            <span className="text-neutral-400">Driver:</span>
                            <span className="font-medium text-neutral-800">{bus.driver_name}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-neutral-400">Phone:</span>
                            <span className="font-mono text-neutral-800">{bus.driver_phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingBus(bus);
                            setBusForm({
                              bus_number: bus.bus_number,
                              driver_name: bus.driver_name,
                              driver_phone: bus.driver_phone,
                              bus_route: bus.bus_route,
                              status: bus.status,
                            });
                            setShowBusModal(true);
                          }}
                          className="px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 font-semibold rounded text-xs text-neutral-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBus(bus.id)}
                          className="px-3 py-1 bg-white hover:bg-red-50 border border-red-200 font-semibold rounded text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: CAMPUS SECURITY (RULE 21 EMPTY STATE) */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Campus Security Directory</h2>
                  <p className="text-xs text-neutral-500">
                    Manage security desk contacts and 24/7 hotline numbers for students
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingSecurity(null);
                    setSecurityForm({ name: '', phone: '', status: 'Active' });
                    setShowSecurityModal(true);
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Security Contact</span>
                </button>
              </div>

              {securityContacts.length === 0 ? (
                /* RULE 21: SPECIFIC ADMIN EMPTY STATE FOR SECURITY */
                <div className="py-16 px-4 bg-white border border-dashed border-neutral-300 rounded-xl text-center max-w-xl mx-auto">
                  <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-neutral-900">No security contacts added yet.</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Add campus guard and hostel warden contact numbers for emergency calling.
                  </p>
                  <button
                    onClick={() => {
                      setEditingSecurity(null);
                      setSecurityForm({ name: '', phone: '', status: 'Active' });
                      setShowSecurityModal(true);
                    }}
                    className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Security Contact</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {securityContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-5 bg-white border border-neutral-200 rounded-xl shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-neutral-900">{contact.name}</h4>
                          <StatusBadge status={contact.status} />
                        </div>
                        <p className="font-mono text-xs text-neutral-600 mt-1">{contact.phone}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingSecurity(contact);
                            setSecurityForm({
                              name: contact.name,
                              phone: contact.phone,
                              status: contact.status,
                            });
                            setShowSecurityModal(true);
                          }}
                          className="px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 font-semibold rounded text-xs text-neutral-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSecurity(contact.id)}
                          className="px-3 py-1 bg-white hover:bg-red-50 border border-red-200 font-semibold rounded text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: TRANSPORT REQUESTS TABLE (SECTION 26 & 27) */}
          {activeSection === 'transport-requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Transport Requests</h2>
                  <p className="text-xs text-neutral-500">
                    Live feed of student ₹100 and MBCCET → Kuttikanam bookings
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Vehicle Assigned">Vehicle Assigned</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                  >
                    <option value="all">All Services</option>
                    <option value="₹100 Vehicle Arrangement">₹100 Arrangement</option>
                    <option value="MBCCET → Kuttikanam">MBCCET → Kuttikanam</option>
                    <option value="Medical Transportation">Medical Transport</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                        <th className="py-3 px-4 font-semibold">Request ID</th>
                        <th className="py-3 px-4 font-semibold">Student</th>
                        <th className="py-3 px-4 font-semibold">College ID</th>
                        <th className="py-3 px-4 font-semibold">Phone</th>
                        <th className="py-3 px-4 font-semibold">Service</th>
                        <th className="py-3 px-4 font-semibold">Destination</th>
                        <th className="py-3 px-4 font-semibold">Assigned Vehicle</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Created</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {transportRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">{req.request_code}</td>
                          <td className="py-3 px-4 font-medium text-neutral-900">{req.student_name}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{req.college_id}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{req.phone_number}</td>
                          <td className="py-3 px-4 font-semibold text-neutral-700">{req.service_type}</td>
                          <td className="py-3 px-4 text-neutral-600">{req.destination}</td>
                          <td className="py-3 px-4 font-mono font-medium text-neutral-800">
                            {req.assigned_vehicle || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="py-3 px-4 text-neutral-500 text-[11px]">{req.created_at || 'Today'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedRequest({
                                  id: req.id,
                                  type: 'transport',
                                  code: req.request_code,
                                  status: req.status,
                                  assigned_vehicle: req.assigned_vehicle || '',
                                });
                                setAssignForm({
                                  status: req.status,
                                  assigned_vehicle: req.assigned_vehicle || '',
                                });
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 font-semibold rounded text-neutral-700 cursor-pointer"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}

                      {transportRequests.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-xs text-neutral-500">
                            No transport requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MEDICAL REQUESTS TABLE */}
          {activeSection === 'medical-requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <h2 className="text-xl font-bold text-red-950">Medical Transport Requests</h2>
                  <p className="text-xs text-neutral-500">
                    Urgent campus health transit alerts and vehicle dispatch
                  </p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-red-50/50 text-neutral-700 border-b border-neutral-200">
                        <th className="py-3 px-4 font-semibold">Request ID</th>
                        <th className="py-3 px-4 font-semibold">Student Name</th>
                        <th className="py-3 px-4 font-semibold">College ID</th>
                        <th className="py-3 px-4 font-semibold">Phone</th>
                        <th className="py-3 px-4 font-semibold">Current Location</th>
                        <th className="py-3 px-4 font-semibold">Hospital / Dest</th>
                        <th className="py-3 px-4 font-semibold">Emergency Note</th>
                        <th className="py-3 px-4 font-semibold">Vehicle</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {medicalRequests.map((med) => (
                        <tr key={med.id} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-red-600">{med.request_code}</td>
                          <td className="py-3 px-4 font-medium text-neutral-900">{med.student_name}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{med.college_id}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{med.phone_number}</td>
                          <td className="py-3 px-4 text-neutral-800">{med.current_location}</td>
                          <td className="py-3 px-4 text-neutral-800 font-medium">{med.destination}</td>
                          <td className="py-3 px-4 text-neutral-600 max-w-xs truncate" title={med.emergency_note}>
                            {med.emergency_note}
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-700">{med.assigned_vehicle || '—'}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={med.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedRequest({
                                  id: med.id,
                                  type: 'medical',
                                  code: med.request_code,
                                  status: med.status,
                                  assigned_vehicle: med.assigned_vehicle || '',
                                });
                                setAssignForm({
                                  status: med.status,
                                  assigned_vehicle: med.assigned_vehicle || '',
                                });
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 font-semibold rounded text-neutral-700 cursor-pointer"
                            >
                              Dispatch / Update
                            </button>
                          </td>
                        </tr>
                      ))}

                      {medicalRequests.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-xs text-neutral-500">
                            No medical transport requests recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: HOSTEL FOOD REQUESTS */}
          {activeSection === 'food-requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Hostel Food Delivery Requests</h2>
                  <p className="text-xs text-neutral-500">
                    Hostel night deliveries, canteen packs, and room coordinates
                  </p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                        <th className="py-3 px-4 font-semibold">Request ID</th>
                        <th className="py-3 px-4 font-semibold">Student</th>
                        <th className="py-3 px-4 font-semibold">Hostel Block</th>
                        <th className="py-3 px-4 font-semibold">Room</th>
                        <th className="py-3 px-4 font-semibold">Food Request</th>
                        <th className="py-3 px-4 font-semibold">Drop Location</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {foodRequests.map((food) => (
                        <tr key={food.id} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-orange-600">{food.request_code}</td>
                          <td className="py-3 px-4 font-medium text-neutral-900">{food.student_name}</td>
                          <td className="py-3 px-4 font-semibold text-neutral-700">{food.hostel_block}</td>
                          <td className="py-3 px-4 font-mono text-neutral-800">{food.room_number}</td>
                          <td className="py-3 px-4 text-neutral-800 font-medium">{food.food_request}</td>
                          <td className="py-3 px-4 text-neutral-600">{food.delivery_location}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={food.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedRequest({
                                  id: food.id,
                                  type: 'food',
                                  code: food.request_code,
                                  status: food.status,
                                });
                                setAssignForm({ status: food.status, assigned_vehicle: '' });
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 font-semibold rounded text-neutral-700 cursor-pointer"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}

                      {foodRequests.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-xs text-neutral-500">
                            No food delivery requests recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: STUDENT DIRECTORY */}
          {activeSection === 'students' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900">Student Directory</h2>
                <p className="text-xs text-neutral-500">
                  Registered MBCCET students authenticated on ORBINEX
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                        <th className="py-3 px-4 font-semibold">Student Name</th>
                        <th className="py-3 px-4 font-semibold">College ID</th>
                        <th className="py-3 px-4 font-semibold">Email</th>
                        <th className="py-3 px-4 font-semibold">Phone</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4 font-bold text-neutral-900">{st.name}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-neutral-700">{st.college_id}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{st.email}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{st.phone}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={st.status || 'Active'} />
                          </td>
                          <td className="py-3 px-4 text-neutral-500 text-[11px]">{st.created_at || 'Recent'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AUDIT TRAIL (SECTION 28) */}
          {activeSection === 'audit' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900">System Audit Trail</h2>
                <p className="text-xs text-neutral-500">
                  Tamper-evident logs of administrative actions, logins, and status updates
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                        <th className="py-3 px-4 font-semibold">Timestamp</th>
                        <th className="py-3 px-4 font-semibold">Admin</th>
                        <th className="py-3 px-4 font-semibold">Action</th>
                        <th className="py-3 px-4 font-semibold">Target Entity</th>
                        <th className="py-3 px-4 font-semibold">Identifier</th>
                        <th className="py-3 px-4 font-semibold">Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50/50">
                          <td className="py-2.5 px-4 text-neutral-500">{log.timestamp}</td>
                          <td className="py-2.5 px-4 font-semibold text-neutral-900">{log.admin_name || 'System'}</td>
                          <td className="py-2.5 px-4 text-orange-700 font-bold">{log.action}</td>
                          <td className="py-2.5 px-4 text-neutral-600">{log.target_type}</td>
                          <td className="py-2.5 px-4 text-neutral-800">{log.target_id}</td>
                          <td className="py-2.5 px-4 font-sans text-xs text-neutral-600">{log.details || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT AUTO */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="text-base font-bold text-neutral-900">
                {editingAuto ? 'Edit Vehicle' : '+ Add Auto'}
              </h3>
              <button
                onClick={() => setShowAutoModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuto} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Auto Number *</label>
                <input
                  type="text"
                  required
                  value={autoForm.auto_number}
                  onChange={(e) => setAutoForm({ ...autoForm, auto_number: e.target.value.toUpperCase() })}
                  placeholder="e.g. KL-35-G-4042"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  value={autoForm.driver_name}
                  onChange={(e) => setAutoForm({ ...autoForm, driver_name: e.target.value })}
                  placeholder="e.g. Manoj Kumar"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Driver Phone *</label>
                <input
                  type="tel"
                  required
                  value={autoForm.driver_phone}
                  onChange={(e) => setAutoForm({ ...autoForm, driver_phone: e.target.value })}
                  placeholder="e.g. 9847123999"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Availability Status</label>
                <select
                  value={autoForm.status}
                  onChange={(e) => setAutoForm({ ...autoForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="Available">Available</option>
                  <option value="In Service">In Service</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAutoModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Save Auto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BUS */}
      {showBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="text-base font-bold text-neutral-900">
                {editingBus ? 'Edit College Bus' : '+ Add College Bus'}
              </h3>
              <button
                onClick={() => setShowBusModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Bus Number (1 of 3) *</label>
                <input
                  type="text"
                  required
                  value={busForm.bus_number}
                  onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value.toUpperCase() })}
                  placeholder="e.g. BUS 01 / KL-06-B-1234"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  value={busForm.driver_name}
                  onChange={(e) => setBusForm({ ...busForm, driver_name: e.target.value })}
                  placeholder="e.g. Thomas Varghese"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Driver Phone *</label>
                <input
                  type="tel"
                  required
                  value={busForm.driver_phone}
                  onChange={(e) => setBusForm({ ...busForm, driver_phone: e.target.value })}
                  placeholder="e.g. 9447000111"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Bus Route Description *</label>
                <input
                  type="text"
                  required
                  value={busForm.bus_route}
                  onChange={(e) => setBusForm({ ...busForm, bus_route: e.target.value })}
                  placeholder="e.g. Route A: Mundakayam → Kuttikanam → Campus"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Status</label>
                <select
                  value={busForm.status}
                  onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="Available">Available</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBusModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Save Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SECURITY CONTACT */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="text-base font-bold text-neutral-900">
                {editingSecurity ? 'Edit Security Contact' : '+ Add Security Contact'}
              </h3>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSecurity} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Security Officer / Post Name *</label>
                <input
                  type="text"
                  required
                  value={securityForm.name}
                  onChange={(e) => setSecurityForm({ ...securityForm, name: e.target.value })}
                  placeholder="e.g. Main Gate Security / Night Patrol Officer"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Security Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={securityForm.phone}
                  onChange={(e) => setSecurityForm({ ...securityForm, phone: e.target.value })}
                  placeholder="e.g. 04869-232000 / 9447123456"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Status</label>
                <select
                  value={securityForm.status}
                  onChange={(e) => setSecurityForm({ ...securityForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN VEHICLE & UPDATE STATUS */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Manage Request</h3>
                <p className="font-mono text-xs font-semibold text-orange-600">{selectedRequest.code}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRequestStatus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Update Status</label>
                <select
                  value={assignForm.status}
                  onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  {selectedRequest.type !== 'food' && <option value="Vehicle Assigned">Vehicle Assigned</option>}
                  {selectedRequest.type !== 'food' && <option value="In Transit">In Transit</option>}
                  {selectedRequest.type === 'food' && <option value="Preparing">Preparing</option>}
                  {selectedRequest.type === 'food' && <option value="Out for Delivery">Out for Delivery</option>}
                  {selectedRequest.type === 'food' && <option value="Delivered">Delivered</option>}
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {selectedRequest.type !== 'food' && (
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Assign Campus Vehicle</label>
                  <select
                    value={assignForm.assigned_vehicle}
                    onChange={(e) => setAssignForm({ ...assignForm, assigned_vehicle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="">No Vehicle Assigned</option>
                    {autos.map((a) => (
                      <option key={a.id} value={`${a.auto_number} (${a.driver_name})`}>
                        {a.auto_number} — {a.driver_name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
