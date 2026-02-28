import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CRM, { initialCustomers } from './components/CRM';
import Funnel, { initialDeals } from './components/Funnel';
import Agenda, { initialTasks } from './components/Agenda';
import FinancialDashboard from './components/FinancialDashboard';
import PatientManagement from './components/PatientManagement';
import ClientDashboard from './components/ClientDashboard';
import Login from './components/Login';
import ClientPortal from './components/ClientPortal';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { Customer, Deal, Task, Patient } from './types';

export default function App() {
  const [userRole, setUserRole] = useState<'admin' | 'client' | null>(null);
  const [loggedInAdminEmail, setLoggedInAdminEmail] = useState<string | null>(null);
  const [loggedInAdminName, setLoggedInAdminName] = useState<string>('Admin');
  const [loggedInPatientId, setLoggedInPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Load data when admin logs in
  useEffect(() => {
    const loadData = async () => {
      if (userRole === 'admin' && loggedInAdminEmail) {
        try {
          const response = await fetch(`/api/data/${loggedInAdminEmail}`);
          if (response.ok) {
            const parsed = await response.json();
            const loadedCustomers = parsed.customers || [];
            const loadedDeals = parsed.deals || [];
            
            // Auto-merge logic: check if Fabio dropshing (new list indicator) exists
            const hasNewList = loadedCustomers.some((c: any) => c.name === 'Fabio dropshing');
            
            if (!hasNewList && initialCustomers.length > 20) {
              // Merge missing initial customers
              const missingInitial = initialCustomers.filter(ic => 
                !loadedCustomers.some((lc: any) => lc.name.toLowerCase() === ic.name.toLowerCase())
              );
              
              if (missingInitial.length > 0) {
                const mergedCustomers = [...loadedCustomers, ...missingInitial];
                const missingDeals = initialDeals.filter(id => 
                  missingInitial.some(ml => ml.id === id.customerId)
                );
                const mergedDeals = [...loadedDeals, ...missingDeals];
                
                setCustomers(mergedCustomers);
                setDeals(mergedDeals);
                setTasks(parsed.tasks || initialTasks);
                setPatients(parsed.patients || []);
                
                // Save merged data back to server
                fetch(`/api/data/${loggedInAdminEmail}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customers: mergedCustomers,
                    deals: mergedDeals,
                    tasks: parsed.tasks || initialTasks,
                    patients: parsed.patients || []
                  })
                });
              } else {
                setCustomers(loadedCustomers);
                setDeals(loadedDeals);
                setTasks(parsed.tasks || initialTasks);
                setPatients(parsed.patients || []);
              }
            } else {
              setCustomers(loadedCustomers);
              setDeals(loadedDeals);
              setTasks(parsed.tasks || initialTasks);
              setPatients(parsed.patients || []);
            }
          } else {
            // Check localStorage for migration if server data is missing
            const savedData = localStorage.getItem(`nexus_data_${loggedInAdminEmail}`);
            if (savedData) {
              const parsed = JSON.parse(savedData);
              setCustomers(parsed.customers || initialCustomers);
              setDeals(parsed.deals || initialDeals);
              setTasks(parsed.tasks || initialTasks);
              setPatients(parsed.patients || []);
              
              // Migrate to server
              fetch(`/api/data/${loggedInAdminEmail}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: savedData
              });
            } else if (loggedInAdminEmail === 'admin@nexus.com') {
              // Legacy data fallback for default admin
              const legacyCustomers = localStorage.getItem('customers');
              const legacyDeals = localStorage.getItem('deals');
              const legacyTasks = localStorage.getItem('tasks');
              const legacyPatients = localStorage.getItem('patients');
              
              const customersData = legacyCustomers ? JSON.parse(legacyCustomers) : initialCustomers;
              const dealsData = legacyDeals ? JSON.parse(legacyDeals) : initialDeals;
              const tasksData = legacyTasks ? JSON.parse(legacyTasks) : initialTasks;
              const patientsData = legacyPatients ? JSON.parse(legacyPatients) : [];

              setCustomers(customersData);
              setDeals(dealsData);
              setTasks(tasksData);
              setPatients(patientsData);

              // Migrate to server
              fetch(`/api/data/${loggedInAdminEmail}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customers: customersData,
                  deals: dealsData,
                  tasks: tasksData,
                  patients: patientsData
                })
              });
            } else {
              // New admin, empty data
              setCustomers([]);
              setDeals([]);
              setTasks([]);
              setPatients([]);
            }
          }
        } catch (error) {
          console.error('Error loading data from server:', error);
        }
      }
    };
    loadData();
  }, [userRole, loggedInAdminEmail]);

  // Load data when client logs in
  useEffect(() => {
    const loadClientData = async () => {
      if (userRole === 'client' && loggedInAdminEmail) {
        try {
          const response = await fetch(`/api/data/${loggedInAdminEmail}`);
          if (response.ok) {
            const parsed = await response.json();
            setPatients(parsed.patients || []);
          } else {
            // Fallback to localStorage
            if (loggedInAdminEmail === 'legacy') {
              const legacyPatients = localStorage.getItem('patients');
              setPatients(legacyPatients ? JSON.parse(legacyPatients) : []);
            } else {
              const savedData = localStorage.getItem(`nexus_data_${loggedInAdminEmail}`);
              if (savedData) {
                const parsed = JSON.parse(savedData);
                setPatients(parsed.patients || []);
              }
            }
          }
        } catch (error) {
          console.error('Error loading client data from server:', error);
        }
      }
    };
    loadClientData();
  }, [userRole, loggedInAdminEmail]);

  // Save data when it changes
  useEffect(() => {
    const saveData = async () => {
      if (userRole === 'admin' && loggedInAdminEmail) {
        const dataToSave = {
          customers,
          deals,
          tasks,
          patients
        };
        
        // Save to server
        try {
          await fetch(`/api/data/${loggedInAdminEmail}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
          });
        } catch (error) {
          console.error('Error saving data to server:', error);
        }

        // Also save to localStorage as backup
        localStorage.setItem(`nexus_data_${loggedInAdminEmail}`, JSON.stringify(dataToSave));
      }
    };
    
    // Debounce saving to avoid too many requests
    const timer = setTimeout(() => {
      saveData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [customers, deals, tasks, patients, userRole, loggedInAdminEmail]);

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard customers={customers} />;
      case 'crm': return <CRM customers={customers} setCustomers={setCustomers} deals={deals} setDeals={setDeals} tasks={tasks} setTasks={setTasks} />;
      case 'patients': return <PatientManagement patients={patients} setPatients={setPatients} />;
      case 'client_dashboard': return <ClientDashboard patients={patients} customers={customers} setCustomers={setCustomers} />;
      case 'funnel': return <Funnel customers={customers} deals={deals} setDeals={setDeals} setPatients={setPatients} />;
      case 'finance': return <FinancialDashboard deals={deals} customers={customers} patients={patients} />;
      case 'agenda': return <Agenda tasks={tasks} setTasks={setTasks} patients={patients} setPatients={setPatients} customers={customers} setCustomers={setCustomers} />;
      default: return <Dashboard customers={customers} />;
    }
  };

  if (!userRole) {
    return (
      <Login 
        onLoginAdmin={(email, name) => { 
          setUserRole('admin'); 
          setLoggedInAdminEmail(email);
          setLoggedInAdminName(name);
        }} 
        onLoginClient={(id, adminEmail) => { 
          setUserRole('client'); 
          setLoggedInPatientId(id); 
          setLoggedInAdminEmail(adminEmail);
        }} 
        patients={patients} 
      />
    );
  }

  if (userRole === 'client' && loggedInPatientId) {
    return (
      <ClientPortal 
        patientId={loggedInPatientId} 
        patients={patients} 
        onLogout={() => { 
          setUserRole(null); 
          setLoggedInPatientId(null); 
          setLoggedInAdminEmail(null);
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-black text-zinc-200 font-sans selection:bg-emerald-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => {
        setUserRole(null);
        setLoggedInAdminEmail(null);
      }} />
      
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
                <p className="text-sm font-bold text-white leading-none">{loggedInAdminName}</p>
                <p className="text-xs text-zinc-500 mt-1">Plano Enterprise</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black shadow-lg shadow-emerald-500/10">
                <User size={20} />
              </div>
            </div>
            <button 
              onClick={() => {
                setUserRole(null);
                setLoggedInAdminEmail(null);
              }}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
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
