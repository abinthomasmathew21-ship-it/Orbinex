import React from 'react';
import {
  Car,
  HeartPulse,
  UtensilsCrossed,
  Bus as BusIcon,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  onSelectService: (serviceKey: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onSelectService }) => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Institutional Top Alert Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-2 px-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white">Campus Mobility Active:</span>
            <span>Mar Baselios Christian College of Engineering & Technology (MBCCET)</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-neutral-400">
            <span>Peermade, Idukki</span>
            <span>•</span>
            <span className="text-orange-400 font-semibold">₹100 Flat Route Available</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-700 mb-6">
              <span className="text-orange-600 font-bold">ORBINEX</span>
              <span className="text-neutral-400">/</span>
              <span>Powered by AMT</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.15]">
              Campus Mobility & <br className="hidden sm:block" />
              <span className="text-orange-600">Student Support</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
              A centralized digital platform connecting MBCCET students with campus transportation,
              ₹100 vehicle arrangements, urgent medical transport, hostel food support, college bus
              schedules, and 24/7 security contacts.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Student Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="px-5 py-3 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-sm rounded-lg border border-neutral-300 transition-colors cursor-pointer"
              >
                Register Student ID
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-3 text-xs font-semibold text-neutral-600 hover:text-orange-600 transition-colors"
              >
                Admin Portal Login →
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-neutral-100">
              <div>
                <p className="text-2xl font-bold text-neutral-900">₹100</p>
                <p className="text-xs text-neutral-500 font-medium">Standard Campus Route</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">3 Buses</p>
                <p className="text-xs text-neutral-500 font-medium">Institutional Fleet</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">24/7</p>
                <p className="text-xs text-neutral-500 font-medium">Security & Medical Link</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Core Campus Services
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mt-1">
                Everything students need to navigate MBCCET
              </h2>
            </div>
            <p className="text-xs text-neutral-500 max-w-md mt-2 md:mt-0">
              Authenticated access ensures real-time tracking, privacy, and accountability for every
              transportation and assistance request.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1: ₹100 Vehicle Arrangement */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs hover:border-orange-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4 font-bold">
                  ₹
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-neutral-900">
                    ₹100 Vehicle Arrangement
                  </h3>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Fixed Rate
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Affordable transportation arrangement for students travelling from campus to
                  the supported destination. Vehicle availability is updated in real time by
                  authorized administrators.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Kuttikanam & Local</span>
                <button
                  onClick={() => onSelectService('transport')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  View Details →
                </button>
              </div>
            </div>

            {/* Service 2: MBCCET -> Kuttikanam Transport */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs hover:border-orange-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                  <Car className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  MBCCET → Kuttikanam Transport
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Direct auto-rickshaw network for seamless connectivity between the campus gate,
                  Kuttikanam junction, and transit terminals.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Live Auto Status</span>
                <button
                  onClick={() => onSelectService('transport')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  Check Autos →
                </button>
              </div>
            </div>

            {/* Service 3: Medical Transportation */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs hover:border-red-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
                  <HeartPulse className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-neutral-900">
                    Medical Transportation
                  </h3>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Urgent
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Expedited transport assistance for unwell students requiring transit from
                  hostel or campus to Peermade Taluk hospital or medical clinics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-red-600 font-semibold">Priority Routing</span>
                <button
                  onClick={() => onSelectService('medical')}
                  className="text-xs font-bold text-neutral-900 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  Request Medical →
                </button>
              </div>
            </div>

            {/* Service 4: College Bus Management */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs hover:border-orange-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                  <BusIcon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  College Bus Information
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Institutional bus fleet route tracking, departure times, and driver contacts
                  for all 3 official MBCCET college buses.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">3 College Buses</span>
                <button
                  onClick={() => onSelectService('bus')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  View Routes →
                </button>
              </div>
            </div>

            {/* Service 5: Hostel Food Delivery */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs hover:border-orange-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                  <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  Hostel Food Delivery Support
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Coordination for hostel night meals, canteen sick-diet tokens, and late delivery
                  requests directly to designated residential hostel blocks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Hostel Blocks</span>
                <button
                  onClick={() => onSelectService('food')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  Food Requests →
                </button>
              </div>
            </div>

            {/* Service 6: Campus Security */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs hover:border-orange-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                  <ShieldAlert className="w-5 h-5 text-neutral-800" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  Campus Security Contacts
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Instant mobile access to campus gate security officers, main reception, and
                  hostel warden duty desks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Instant Phone Call</span>
                <button
                  onClick={() => onSelectService('security')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  Call Contacts →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Guidelines & Emergency Notice */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 mb-1">
                <ShieldAlert className="w-4 h-4 text-orange-600" />
                <span>IMPORTANT INSTITUTIONAL NOTE</span>
              </div>
              <h4 className="text-lg font-bold text-neutral-900">
                Life-Threatening Emergency Protocol
              </h4>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                ORBINEX provides coordination and campus logistics support. For acute,
                life-threatening medical emergencies, immediately alert the college security gate
                and call national emergency numbers (108 / 112) without waiting.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Access Portal
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
