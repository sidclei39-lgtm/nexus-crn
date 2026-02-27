import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CRM, { initialCustomers } from './components/CRM';
import Funnel, { initialDeals } from './components/Funnel';
import Agenda, { initialTasks } from './components/Agenda';
import FinancialDashboard from './components/FinancialDashboard';
import PatientManagement from './components/PatientManagement';
import ClientDashboard from './components/ClientDashboard';
import { Bell, Search, User } from 'lucide-react';
import { Customer, Deal, Task, Patient } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('patients');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard customers={customers} />;
      case 'crm': return <CRM customers={customers} setCustomers={setCustomers} deals={deals} setDeals={setDeals} tasks={tasks} setTasks={setTasks} />;
      case 'patients': return <PatientManagement patients={patients} setPatients={setPatients} />;
      case 'client_dashboard': return <ClientDashboard patients={patients} customers={customers} setCustomers={setCustomers} />;
      case 'funnel': return <Funnel customers={customers} deals={deals} setDeals={setDeals} setPatients={setPatients} />;
      case 'finance': return <FinancialDashboard deals={deals} customers={customers} patients={patients} />;
      case 'agenda': return <Agenda tasks={tasks} setTasks={setTasks} patients={patients} setPatients={setPatients} />;
      default: return <Dashboard customers={customers} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-zinc-200 font-sans selection:bg-emerald-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-md z-10">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Pesquisar em toda a plataforma..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-1.5 text-sm text-zinc-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-950"></span>
            </button>
            <div className="h-8 w-px bg-zinc-800 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">Admin User</p>
                <p className="text-xs text-zinc-500 mt-1">Plano Enterprise</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black shadow-lg shadow-emerald-500/10">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderAdminContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
