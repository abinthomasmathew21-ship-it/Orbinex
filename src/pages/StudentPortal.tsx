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
} from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import {
  Car,
  HeartPulse,
  UtensilsCrossed,
  Bus as BusIcon,
  Shield,
  Clock,
  MapPin,
  Phone,
  PhoneCall,
  User,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Loader2,
  X,
  FileText,
} from 'lucide-react';

interface StudentPortalProps {
  initialTab?: string;
  onLogout: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ initialTab = 'dashboard', onLogout }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Data states
  const [autos, setAutos] = useState<Auto[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [securityContacts, setSecurityContacts] = useState<SecurityContact[]>([]);
  const [myTransport, setMyTransport] = useState<TransportRequest[]>([]);
  const [myMedical, setMyMedical] = useState<MedicalRequest[]>([]);
  const [myFood, setMyFood] = useState<FoodDeliveryRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showTransportModal, setShowTransportModal] = useState<boolean>(false);
  const [showMedicalModal, setShowMedicalModal] = useState<boolean>(false);
  const [showFoodModal, setShowFoodModal] = useState<boolean>(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{ id: string; service: string } | null>(null);

  // Form states
  const [destination, setDestination] = useState('');
  const [serviceType, setServiceType] = useState('₹100 Vehicle Arrangement');
  const [preferredVehicle, setPreferredVehicle] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');

  // Medical form
  const [medLocation, setMedLocation] = useState('');
  const [medDestination, setMedDestination] = useState('Peermade Taluk Hospital');
  const [medNote, setMedNote] = useState('');

  // Food form
  const [hostelBlock, setHostelBlock] = useState('Mens Hostel Block A');
  const [roomNumber, setRoomNumber] = useState('');
  const [foodDetails, setFoodDetails] = useState('');
  const [foodLocation, setFoodLocation] = useState('Hostel Security Gate');
  const [foodNote, setFoodNote] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [autosData, busesData, secData, transData, medData, foodData] = await Promise.all([
        api.getAutos(),
        api.getBuses(),
        api.getSecurity(),
        api.getMyTransportRequests(),
        api.getMyMedicalRequests(),
        api.getMyFoodRequests(),
      ]);
      setAutos(autosData);
      setBuses(busesData);
      setSecurityContacts(secData);
      setMyTransport(transData);
      setMyMedical(medData);
      setMyFood(foodData);
    } catch (err: any) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Transport Request submission
  const handleSubmitTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createTransportRequest({
        destination: destination.trim(),
        service_type: serviceType,
        preferred_vehicle: preferredVehicle || undefined,
        additional_note: additionalNote || undefined,
      });

      setSubmittedReceipt({ id: res.request_code, service: serviceType });
      setShowTransportModal(false);
      setDestination('');
      setAdditionalNote('');
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit transport request.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Medical Request submission
  const handleSubmitMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createMedicalRequest({
        current_location: medLocation.trim(),
        destination: medDestination.trim(),
        emergency_note: medNote.trim(),
      });

      setSubmittedReceipt({ id: res.request_code, service: 'Medical Transportation' });
      setShowMedicalModal(false);
      setMedLocation('');
      setMedNote('');
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit medical request.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Food Request submission
  const handleSubmitFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createFoodRequest({
        hostel_block: hostelBlock,
        room_number: roomNumber.trim(),
        food_request: foodDetails.trim(),
        delivery_location: foodLocation.trim(),
        additional_note: foodNote || undefined,
      });

      setSubmittedReceipt({ id: res.request_code, service: 'Hostel Food Delivery' });
      setShowFoodModal(false);
      setRoomNumber('');
      setFoodDetails('');
      setFoodNote('');
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit food delivery request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const availableAutosCount = autos.filter((a) => a.status === 'Available').length;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Student Subheader */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  Welcome, {user?.name || 'Student'}
                </h1>
                <span className="text-xs px-2 py-0.5 font-semibold bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                  {user?.college_id || 'MBCCET'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Mar Baselios Christian College of Engineering & Technology • Student Portal
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setServiceType('₹100 Vehicle Arrangement');
                  setShowTransportModal(true);
                }}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request Vehicle</span>
              </button>
              <button
                onClick={() => setShowMedicalModal(true)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Medical Transport</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-px border-t border-neutral-100 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'transport', label: 'Transportation', icon: Car },
              { id: 'medical', label: 'Medical Transport', icon: HeartPulse },
              { id: 'food', label: 'Hostel Food', icon: UtensilsCrossed },
              { id: 'bus', label: 'College Bus', icon: BusIcon },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'requests', label: 'My Requests', icon: FileText },
              { id: 'profile', label: 'Profile', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-neutral-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Receipt Banner */}
        {submittedReceipt && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Request Submitted Successfully</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your request has been routed to campus logistics.
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-emerald-200 rounded-md font-mono text-xs font-bold text-emerald-900">
                  Request ID: {submittedReceipt.id}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSubmittedReceipt(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
              message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="text-xs font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Services Large Mobile-Friendly Buttons */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Quick Campus Services
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <button
                  onClick={() => {
                    setServiceType('₹100 Vehicle Arrangement');
                    setShowTransportModal(true);
                  }}
                  className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-orange-300 rounded-xl text-left shadow-2xs transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold mb-3 group-hover:scale-105 transition-transform">
                    ₹100
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">₹100 Vehicle</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Fixed campus transit</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowMedicalModal(true)}
                  className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-red-300 rounded-xl text-left shadow-2xs transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-3 group-hover:scale-105 transition-transform">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Medical Transport</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Urgent hospital transit</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowFoodModal(true)}
                  className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-orange-300 rounded-xl text-left shadow-2xs transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-3 group-hover:scale-105 transition-transform">
                    <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Hostel Food</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Night meal / sick diet</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bus')}
                  className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-orange-300 rounded-xl text-left shadow-2xs transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-3 group-hover:scale-105 transition-transform">
                    <BusIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">College Bus</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">3 campus buses</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-orange-300 rounded-xl text-left shadow-2xs transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-3 group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Security</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Campus gate & patrol</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-neutral-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-neutral-900">MBCCET → Kuttikanam Autos</h3>
                  <button
                    onClick={() => setActiveTab('transport')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View All →
                  </button>
                </div>
                {autos.length === 0 ? (
                  <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-200 text-center">
                    <p className="text-xs font-semibold text-neutral-700">No vehicles available</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      The administrator has not added any vehicles yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {autos.slice(0, 3).map((auto) => (
                      <div
                        key={auto.id}
                        className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-600" />
                          <span className="font-mono font-bold text-neutral-900">{auto.auto_number}</span>
                          <span className="text-neutral-500">({auto.driver_name})</span>
                        </div>
                        <StatusBadge status={auto.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 bg-white border border-neutral-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-neutral-900">Emergency & Security Hotline</h3>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    All Contacts →
                  </button>
                </div>
                {securityContacts.length === 0 ? (
                  <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-200 text-center">
                    <p className="text-xs font-semibold text-neutral-700">No security contacts added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {securityContacts.slice(0, 2).map((sec) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-neutral-900">{sec.name}</p>
                          <p className="text-[11px] font-mono text-neutral-500">{sec.phone}</p>
                        </div>
                        <a
                          href={`tel:${sec.phone}`}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <PhoneCall className="w-3 h-3" />
                          Call
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Recent Requests Widget */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">My Recent Requests</h3>
                  <p className="text-xs text-neutral-500">Live progress and assigned driver status</p>
                </div>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  View All History →
                </button>
              </div>

              {myTransport.length === 0 && myMedical.length === 0 && myFood.length === 0 ? (
                <div className="py-8 text-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                  <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">No active requests found</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Use the quick services above to submit a vehicle, medical, or food request.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {myTransport.slice(0, 3).map((item) => (
                    <div key={`t-${item.id}`} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900">{item.request_code}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="font-semibold text-neutral-700">{item.service_type}</span>
                        </div>
                        <p className="text-neutral-500">Destination: {item.destination}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.assigned_vehicle && (
                          <span className="text-[11px] font-mono font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                            {item.assigned_vehicle}
                          </span>
                        )}
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}

                  {myMedical.slice(0, 2).map((item) => (
                    <div key={`m-${item.id}`} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-600">{item.request_code}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="font-semibold text-neutral-700">Medical Transport</span>
                        </div>
                        <p className="text-neutral-500">To: {item.destination}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TRANSPORTATION */}
        {activeTab === 'transport' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Campus Transportation</h2>
                <p className="text-xs text-neutral-500">
                  Fixed ₹100 arrangements and MBCCET → Kuttikanam autos
                </p>
              </div>
              <button
                onClick={() => {
                  setServiceType('₹100 Vehicle Arrangement');
                  setShowTransportModal(true);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Request Vehicle</span>
              </button>
            </div>

            {/* Service 1: ₹100 Vehicle Arrangement */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-neutral-900">₹100 Vehicle Arrangement</span>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs font-bold">
                      Campus Fixed Rate
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 max-w-2xl">
                    Affordable transportation arrangement for students travelling from campus to the
                    supported destination. The actual availability depends on administrator-configured
                    vehicles.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 font-medium">Available Fleet</p>
                    <p className="text-sm font-bold text-neutral-900">
                      {availableAutosCount} {availableAutosCount === 1 ? 'Auto' : 'Autos'} Ready
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setServiceType('₹100 Vehicle Arrangement');
                      setShowTransportModal(true);
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs cursor-pointer"
                  >
                    Book ₹100 Ride
                  </button>
                </div>
              </div>

              {/* MBCCET -> Kuttikanam Available Autos */}
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <span>MBCCET → Kuttikanam Available Autos</span>
                </h3>

                {autos.length === 0 ? (
                  <div className="py-12 px-4 text-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                    <Car className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-neutral-800">No vehicles available</p>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      The administrator has not added any vehicles yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-600 border-y border-neutral-200">
                          <th className="py-2.5 px-4 font-semibold">Auto Number</th>
                          <th className="py-2.5 px-4 font-semibold">Driver Name</th>
                          <th className="py-2.5 px-4 font-semibold">Driver Phone</th>
                          <th className="py-2.5 px-4 font-semibold">Availability</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {autos.map((auto) => (
                          <tr key={auto.id} className="hover:bg-neutral-50/70">
                            <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                              {auto.auto_number}
                            </td>
                            <td className="py-3 px-4 text-neutral-800 font-medium">
                              {auto.driver_name}
                            </td>
                            <td className="py-3 px-4 text-neutral-600 font-mono">
                              {auto.driver_phone}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={auto.status} />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setPreferredVehicle(auto.auto_number);
                                  setServiceType('MBCCET → Kuttikanam');
                                  setShowTransportModal(true);
                                }}
                                disabled={auto.status !== 'Available'}
                                className="px-3 py-1 bg-white hover:bg-neutral-100 disabled:opacity-50 text-neutral-700 border border-neutral-300 font-medium rounded text-xs transition-colors cursor-pointer"
                              >
                                Request This Vehicle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDICAL TRANSPORT */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-950">Medical Transportation</h2>
                  <p className="text-xs text-red-800 font-semibold mt-0.5">
                    For urgent transportation assistance
                  </p>
                  <p className="text-xs text-red-700 mt-2 leading-relaxed">
                    Note: For life-threatening emergencies, contact the appropriate emergency
                    services (108 / 112) or the nearest campus medical post immediately.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowMedicalModal(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Request Medical Transport</span>
                </button>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-neutral-900 mb-4">My Medical Transport Requests</h3>
              {myMedical.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                  No medical transport requests recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {myMedical.map((med) => (
                    <div
                      key={med.id}
                      className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-600">{med.request_code}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="font-semibold text-neutral-800">
                            From: {med.current_location} → To: {med.destination}
                          </span>
                        </div>
                        <p className="text-neutral-600">Note: {med.emergency_note}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {med.assigned_vehicle && (
                          <span className="font-mono font-medium text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                            Vehicle: {med.assigned_vehicle}
                          </span>
                        )}
                        <StatusBadge status={med.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: HOSTEL FOOD DELIVERY */}
        {activeTab === 'food' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Hostel Food Delivery Support</h2>
                <p className="text-xs text-neutral-500">
                  Hostel canteen meal support, late dietary tokens, and delivery coordination
                </p>
              </div>
              <button
                onClick={() => setShowFoodModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Food Request</span>
              </button>
            </div>

            {/* Food History */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-neutral-900 mb-4">My Hostel Food Requests</h3>
              {myFood.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                  No hostel food requests submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myFood.map((food) => (
                    <div
                      key={food.id}
                      className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-600">{food.request_code}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="font-semibold text-neutral-900">
                            {food.hostel_block} (Room {food.room_number})
                          </span>
                        </div>
                        <p className="text-neutral-700 font-medium">Request: {food.food_request}</p>
                        <p className="text-neutral-500 text-[11px]">Location: {food.delivery_location}</p>
                      </div>
                      <StatusBadge status={food.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: COLLEGE BUS INFORMATION */}
        {activeTab === 'bus' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">College Bus Information</h2>
              <p className="text-xs text-neutral-500">
                Official routes and status for MBCCET's 3 college buses
              </p>
            </div>

            {buses.length === 0 ? (
              <div className="py-12 px-4 text-center bg-white rounded-xl border border-dashed border-neutral-200">
                <BusIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-neutral-800">
                  No college buses have been configured yet.
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  The college administration will publish the 3 bus routes shortly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {buses.map((bus) => (
                  <div
                    key={bus.id}
                    className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs hover:border-orange-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-neutral-100 text-neutral-800">
                          {bus.bus_number}
                        </span>
                        <StatusBadge status={bus.status} />
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900">{bus.bus_route}</h3>
                      <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                        <p className="flex items-center justify-between">
                          <span className="text-neutral-400">Driver:</span>
                          <span className="font-medium text-neutral-800">{bus.driver_name}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-neutral-400">Phone:</span>
                          <span className="font-mono text-neutral-800">{bus.driver_phone}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-neutral-100">
                      <a
                        href={`tel:${bus.driver_phone}`}
                        className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-600" />
                        Call Driver
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CAMPUS SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">Campus Security</h2>
              <p className="text-xs text-neutral-500">
                Official duty phone directory for MBCCET campus gates, hostel posts, and night patrol
              </p>
            </div>

            {securityContacts.length === 0 ? (
              <div className="py-12 px-4 text-center bg-white rounded-xl border border-dashed border-neutral-200">
                <Shield className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-neutral-800">No security contacts added yet.</p>
                <p className="text-xs text-neutral-500 mt-1">
                  The campus administrator will configure security numbers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {securityContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-5 bg-white border border-neutral-200 rounded-xl shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 mb-3">
                        <Shield className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900">{contact.name}</h3>
                      <p className="text-xs font-mono text-neutral-500 mt-1">{contact.phone}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-neutral-100">
                      <a
                        href={`tel:${contact.phone}`}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-2xs transition-colors"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>CALL SECURITY</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: MY REQUESTS (ALL IN ONE) */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">My Requests History</h2>
              <p className="text-xs text-neutral-500">
                Track all your transport, medical, and hostel food requests in real time
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                      <th className="py-3 px-4 font-semibold">Request ID</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Destination / Details</th>
                      <th className="py-3 px-4 font-semibold">Assigned Vehicle</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {/* Combine all types */}
                    {myTransport.map((t) => (
                      <tr key={`trans-${t.id}`} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900">{t.request_code}</td>
                        <td className="py-3 px-4 font-semibold text-neutral-700">{t.service_type}</td>
                        <td className="py-3 px-4 text-neutral-600">{t.destination}</td>
                        <td className="py-3 px-4 font-mono text-neutral-700">{t.assigned_vehicle || '—'}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[11px]">{t.created_at || 'Today'}</td>
                      </tr>
                    ))}

                    {myMedical.map((m) => (
                      <tr key={`med-${m.id}`} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-red-600">{m.request_code}</td>
                        <td className="py-3 px-4 font-semibold text-red-700">Medical Transport</td>
                        <td className="py-3 px-4 text-neutral-600">
                          {m.current_location} → {m.destination}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-700">{m.assigned_vehicle || '—'}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={m.status} />
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[11px]">{m.created_at || 'Today'}</td>
                      </tr>
                    ))}

                    {myFood.map((f) => (
                      <tr key={`food-${f.id}`} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-orange-600">{f.request_code}</td>
                        <td className="py-3 px-4 font-semibold text-orange-700">Hostel Food</td>
                        <td className="py-3 px-4 text-neutral-600">
                          {f.hostel_block} (Room {f.room_number}) - {f.food_request}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-400">—</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={f.status} />
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[11px]">{f.created_at || 'Today'}</td>
                      </tr>
                    ))}

                    {myTransport.length === 0 && myMedical.length === 0 && myFood.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-neutral-500">
                          No requests submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
            <div className="pb-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">Student Profile</h2>
              <p className="text-xs text-neutral-500">Institutional registration credentials and info</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 block mb-0.5">Student Full Name</span>
                <span className="font-bold text-neutral-900">{user?.name}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 block mb-0.5">College ID</span>
                <span className="font-mono font-bold text-neutral-900">{user?.college_id}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 block mb-0.5">Registered Email</span>
                <span className="font-mono text-neutral-900">{user?.email}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 block mb-0.5">Contact Phone</span>
                <span className="font-mono text-neutral-900">{user?.phone}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 sm:col-span-2">
                <span className="text-neutral-500 block mb-0.5">Campus Tenant</span>
                <span className="font-medium text-neutral-900">
                  Mar Baselios Christian College of Engineering & Technology (MBCCET)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Sign Out of Account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: REQUEST TRANSPORT */}
      {showTransportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Request Transportation</h3>
                <p className="text-xs text-neutral-500">MBCCET Campus Transit System</p>
              </div>
              <button
                onClick={() => setShowTransportModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransport} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">College ID</label>
                  <input
                    type="text"
                    disabled
                    value={user?.college_id || ''}
                    className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled
                  value={user?.phone || ''}
                  className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="₹100 Vehicle Arrangement">₹100 Vehicle Arrangement</option>
                  <option value="MBCCET → Kuttikanam">MBCCET → Kuttikanam</option>
                  <option value="Medical Transportation">Medical Transportation</option>
                  <option value="Other Approved Transportation">Other Approved Transportation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Destination *</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kuttikanam Junction / Peermade / Pallikunnu"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Preferred Vehicle (Optional)</label>
                <select
                  value={preferredVehicle}
                  onChange={(e) => setPreferredVehicle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Any Available Vehicle</option>
                  {autos.map((a) => (
                    <option key={a.id} value={a.auto_number}>
                      {a.auto_number} — {a.driver_name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Additional Note (Optional)</label>
                <textarea
                  rows={2}
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                  placeholder="e.g. Near Main Gate security cabin, leaving at 4:30 PM"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransportModal(false)}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST MEDICAL TRANSPORT */}
      {showMedicalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-base font-bold text-red-950">Medical Transportation</h3>
                  <p className="text-xs text-red-700">Priority Assistance Request</p>
                </div>
              </div>
              <button
                onClick={() => setShowMedicalModal(false)}
                className="p-1 text-red-400 hover:text-red-700 rounded-lg hover:bg-red-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMedical} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <span className="font-bold">Life-threatening emergency?</span> Call national emergency (108 / 112)
                or alert hostel warden immediately.
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Current Location *</label>
                <input
                  type="text"
                  required
                  value={medLocation}
                  onChange={(e) => setMedLocation(e.target.value)}
                  placeholder="e.g. Mens Hostel Block B, Room 204 or Mechanical Lab"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Destination / Hospital *</label>
                <input
                  type="text"
                  required
                  value={medDestination}
                  onChange={(e) => setMedDestination(e.target.value)}
                  placeholder="e.g. Taluk Hospital Peermade or St. Joseph Clinic"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Emergency Note / Symptoms *</label>
                <textarea
                  rows={2}
                  required
                  value={medNote}
                  onChange={(e) => setMedNote(e.target.value)}
                  placeholder="Brief description of illness/injury to assist driver & warden"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMedicalModal(false)}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Alert...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Medical Transport</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST HOSTEL FOOD */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Hostel Food Delivery Request</h3>
                <p className="text-xs text-neutral-500">Canteen night delivery & special meal tokens</p>
              </div>
              <button
                onClick={() => setShowFoodModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFood} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Hostel / Block *</label>
                  <select
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="Mens Hostel Block A">Mens Hostel Block A</option>
                    <option value="Mens Hostel Block B">Mens Hostel Block B</option>
                    <option value="Ladies Hostel Block A">Ladies Hostel Block A</option>
                    <option value="Ladies Hostel Block B">Ladies Hostel Block B</option>
                    <option value="PG & Faculty Quarters">PG & Faculty Quarters</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 204 or 112"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Food Request Details *</label>
                <textarea
                  rows={2}
                  required
                  value={foodDetails}
                  onChange={(e) => setFoodDetails(e.target.value)}
                  placeholder="e.g. 2 Night Meals / Sick diet kanji / Canteen token pack"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Delivery Drop Location *</label>
                <input
                  type="text"
                  required
                  value={foodLocation}
                  onChange={(e) => setFoodLocation(e.target.value)}
                  placeholder="e.g. Hostel Security Desk / Lobby"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Additional Note</label>
                <input
                  type="text"
                  value={foodNote}
                  onChange={(e) => setFoodNote(e.target.value)}
                  placeholder="e.g. Ring phone on arrival"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Food Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
