import React, { useMemo, useState } from 'react';
import { Patient, Customer, Interaction } from '../types';
import { 
  format, 
  isBefore, 
  parseISO, 
  differenceInDays, 
  startOfDay, 
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  AlertCircle, 
  Calendar, 
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  X,
  Plus,
  History,
  Filter
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface ClientDashboardProps {
  patients: Patient[];
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

type CategoryType = 'active' | 'expired' | 'upcoming' | null;
type TimeFilter = 'day' | 'month' | 'year';

export default function ClientDashboard({ patients, customers, setCustomers }: ClientDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  
  // New Interaction State
  const [newInteractionTitle, setNewInteractionTitle] = useState('');
  const [newInteractionDate, setNewInteractionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newInteractionObs, setNewInteractionObs] = useState('');

  // 1. Filter Logic
  const filteredPatients = useMemo(() => {
    const today = startOfDay(new Date());
    
    return patients.filter(p => {
      const startDate = parseISO(p.startDate);
      const endDate = parseISO(p.endDate);

      if (timeFilter === 'day') {
        // Active today OR Expired today
        const isActiveToday = isWithinInterval(today, { start: startDate, end: endDate });
        const isExpiredToday = isSameDay(endDate, today); // Expired exactly today
        // Or maybe just check status relative to today
        return true; // For "Day" view, we usually just show current status snapshot
      } 
      
      if (timeFilter === 'month') {
        // Active in this month OR Expired in this month
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        
        const overlapsMonth = (startDate <= monthEnd) && (endDate >= monthStart);
        return overlapsMonth;
      }

      if (timeFilter === 'year') {
        const yearStart = startOfYear(today);
        const yearEnd = endOfYear(today);
        
        const overlapsYear = (startDate <= yearEnd) && (endDate >= yearStart);
        return overlapsYear;
      }

      return true;
    });
  }, [patients, timeFilter]);

  // 2. Status Calculation based on Filtered Patients
  const statusData = useMemo(() => {
    const today = startOfDay(new Date());
    let activeCount = 0;
    let expiredCount = 0;

    filteredPatients.forEach(p => {
      const endDate = parseISO(p.endDate);
      
      // Logic: If end date is before today, it's expired.
      // However, for "Day" filter, we might want strict "Expired Today" vs "Active Today"?
      // The prompt says: "Dia: Quem venceu ou está ativo hoje".
      // Let's stick to the standard status definition but applied to the filtered set.
      
      if (isBefore(endDate, today)) {
        expiredCount++;
      } else {
        activeCount++;
      }
    });

    return [
      { name: 'Ativos', value: activeCount, color: '#00FF00' }, // Neon Green
      { name: 'Vencidos', value: expiredCount, color: '#EF4444' }, // Red
    ];
  }, [filteredPatients]);

  // 3. KPIs (Global or Filtered? Let's use Global for top cards to maintain overview, or Filtered?)
  // The prompt asks for "Gráficos... filtráveis". The top cards usually show current state.
  // Let's keep top cards as "Current State" (Snapshot) because "Total Active" implies right now.
  const kpis = useMemo(() => {
    const today = startOfDay(new Date());
    
    let active = 0;
    let expired = 0;
    let upcoming = 0;

    patients.forEach(p => {
      const endDate = parseISO(p.endDate);
      
      if (isBefore(endDate, today)) {
        expired++;
      } else {
        active++;
        const daysToExpiration = differenceInDays(endDate, today);
        if (daysToExpiration >= 0 && daysToExpiration <= 7) {
          upcoming++;
        }
      }
    });

    return { active, expired, upcoming };
  }, [patients]);

  // 4. Upcoming Expirations List (Next 7 days)
  const upcomingExpirations = useMemo(() => {
    const today = startOfDay(new Date());
    return patients
      .filter(p => {
        const endDate = parseISO(p.endDate);
        const days = differenceInDays(endDate, today);
        return days >= 0 && days <= 7;
      })
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [patients]);

  // 5. Monitoring Table Data (All patients, sorted)
  const tableData = useMemo(() => {
    const today = startOfDay(new Date());
    
    return patients.map(patient => {
      const endDate = parseISO(patient.endDate);
      const isExpired = isBefore(endDate, today);
      const daysDiff = Math.abs(differenceInDays(today, endDate));
      
      // Find customer for contact history
      const customer = customers.find(c => c.name.toLowerCase() === patient.name.toLowerCase());
      const lastContact = customer?.historico_contatos?.[customer.historico_contatos.length - 1];

      return {
        ...patient,
        isExpired,
        daysDiff,
        lastContact
      };
    }).sort((a, b) => {
        // Sort by expired first, then by days overdue desc
        if (a.isExpired && !b.isExpired) return -1;
        if (!a.isExpired && b.isExpired) return 1;
        if (a.isExpired && b.isExpired) return b.daysDiff - a.daysDiff;
        return 0;
    });
  }, [patients, customers]);

  const filteredPatientsForModal = useMemo(() => {
    if (!selectedCategory) return [];
    
    const today = startOfDay(new Date());
    
    return patients.filter(p => {
      const endDate = parseISO(p.endDate);
      const isExpired = isBefore(endDate, today);
      const daysToExpiration = differenceInDays(endDate, today);
      
      if (selectedCategory === 'active') return !isExpired;
      if (selectedCategory === 'expired') return isExpired;
      if (selectedCategory === 'upcoming') return !isExpired && daysToExpiration <= 7;
      return false;
    });
  }, [selectedCategory, patients]);

  const selectedCustomerHistory = useMemo(() => {
    if (!selectedPatient) return [];
    const customer = customers.find(c => c.name.toLowerCase() === selectedPatient.name.toLowerCase());
    return customer?.historico_contatos || [];
  }, [selectedPatient, customers]);

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newInteraction: Interaction = {
      id: crypto.randomUUID(),
      titulo: newInteractionTitle,
      data: newInteractionDate,
      observacao: newInteractionObs,
      tipo_contato: 'Histórico Dashboard'
    };

    const customerIndex = customers.findIndex(c => c.name.toLowerCase() === selectedPatient.name.toLowerCase());

    if (customerIndex >= 0) {
      // Update existing customer
      const updatedCustomers = [...customers];
      const customer = updatedCustomers[customerIndex];
      
      updatedCustomers[customerIndex] = {
        ...customer,
        historico_contatos: [...(customer.historico_contatos || []), newInteraction],
        ultimoContato: newInteractionDate
      };
      
      setCustomers(updatedCustomers);
    } else {
      // Create new customer if not exists (to store history)
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        name: selectedPatient.name,
        email: '', // Placeholder
        phone: '', // Placeholder
        company: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        historico_contatos: [newInteraction],
        ultimoContato: newInteractionDate
      };
      setCustomers([...customers, newCustomer]);
    }

    // Reset form
    setNewInteractionTitle('');
    setNewInteractionObs('');
    setNewInteractionDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-[#00FF00]" />
            Dashboard de Leads
          </h2>
          <p className="text-zinc-400">Controle de status e vencimentos.</p>
        </div>
        
        {/* Time Filter Controls */}
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setTimeFilter('day')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeFilter === 'day' ? 'bg-[#00FF00]/20 text-[#00FF00]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeFilter === 'month' ? 'bg-[#00FF00]/20 text-[#00FF00]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeFilter === 'year' ? 'bg-[#00FF00]/20 text-[#00FF00]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ano
          </button>
        </div>
      </div>

      {/* Top Cards (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setSelectedCategory('active')}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-[#00FF00]/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-[#00FF00]/10 group-hover:bg-[#00FF00]/20 transition-colors">
              <CheckCircle2 className="text-[#00FF00]" size={24} />
            </div>
          </div>
          <p className="text-zinc-400 text-sm font-medium">Pacientes Ativos</p>
          <p className="text-3xl font-bold text-white mt-1">{kpis.active}</p>
          <p className="text-xs text-[#00FF00] mt-2 font-bold uppercase">Dentro do prazo</p>
        </div>

        <div 
          onClick={() => setSelectedCategory('expired')}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-red-500/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
          <p className="text-zinc-400 text-sm font-medium">Pacientes Vencidos</p>
          <p className="text-3xl font-bold text-white mt-1">{kpis.expired}</p>
          <p className="text-xs text-red-500 mt-2 font-bold uppercase">Renovação Necessária</p>
        </div>

        <div 
          onClick={() => setSelectedCategory('upcoming')}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-yellow-500/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-zinc-400 text-sm font-medium">Vencem em 7 dias</p>
          <p className="text-3xl font-bold text-white mt-1">{kpis.upcoming}</p>
          <div className="mt-2 space-y-1">
            {upcomingExpirations.slice(0, 2).map(p => (
              <p key={p.id} className="text-xs text-zinc-500 flex justify-between">
                <span>{p.name}</span>
                <span className="text-yellow-500 font-bold">{format(parseISO(p.endDate), 'dd/MM')}</span>
              </p>
            ))}
            {upcomingExpirations.length > 2 && (
              <p className="text-xs text-zinc-600">+ {upcomingExpirations.length - 2} outros</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Chart */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter size={20} className="text-[#00FF00]" />
              Proporção de Status ({timeFilter === 'day' ? 'Hoje' : timeFilter === 'month' ? 'Mês Atual' : 'Ano Atual'})
            </h3>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monitoring Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar size={20} className="text-zinc-400" />
            Tabela de Controle Operacional
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-950/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Vigência</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Alerta</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Último Contato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {tableData.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                  onClick={() => {
                     setSelectedPatient(patient);
                     setSelectedCategory(patient.isExpired ? 'expired' : 'active'); // Open modal with correct context
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-300 capitalize border border-zinc-700">
                      {patient.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-zinc-400">
                      Início: {format(parseISO(patient.startDate), 'dd/MM/yy')}
                    </div>
                    <div className="text-xs text-zinc-400">
                      Fim: {format(parseISO(patient.endDate), 'dd/MM/yy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      patient.isExpired 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/20'
                    }`}>
                      {patient.isExpired ? 'VENCIDO' : 'ATIVO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.isExpired ? (
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        Vencido há {patient.daysDiff} dias
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#00FF00] flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        {patient.daysDiff} dias restantes
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.lastContact ? (
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <MessageSquare size={14} className="text-zinc-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-300 truncate font-medium">{patient.lastContact.titulo}</p>
                          <p className="text-[10px] text-zinc-500">{format(parseISO(patient.lastContact.data), 'dd/MM/yy')}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">Sem histórico</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-zinc-800 flex flex-col">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                  {selectedCategory === 'active' && <CheckCircle2 className="text-[#00FF00]" size={18} />}
                  {selectedCategory === 'expired' && <XCircle className="text-red-500" size={18} />}
                  {selectedCategory === 'upcoming' && <Clock className="text-yellow-500" size={18} />}
                  {selectedCategory === 'active' ? 'Pacientes Ativos' : selectedCategory === 'expired' ? 'Pacientes Vencidos' : 'Vencem em 7 dias'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {filteredPatientsForModal.length > 0 ? (
                  filteredPatientsForModal.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        selectedPatient?.id === patient.id 
                          ? 'bg-[#00FF00]/10 border-[#00FF00]/50' 
                          : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <p className={`font-bold ${selectedPatient?.id === patient.id ? 'text-[#00FF00]' : 'text-white'}`}>
                        {patient.name}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-zinc-500 capitalize">{patient.plan}</span>
                        <span className="text-[10px] text-zinc-400">
                          {format(parseISO(patient.endDate), 'dd/MM/yy')}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    Nenhum paciente nesta categoria.
                  </div>
                )}
              </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 flex flex-col bg-zinc-900/30">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-bold text-white">
                  {selectedPatient ? selectedPatient.name : 'Selecione um paciente'}
                </h3>
                <button 
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedPatient(null);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {selectedPatient ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {/* Patient Info */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Plano</p>
                      <p className="text-white font-medium capitalize">{selectedPatient.plan}</p>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Vigência</p>
                      <p className="text-white font-medium">
                        {format(parseISO(selectedPatient.startDate), 'dd/MM')} - {format(parseISO(selectedPatient.endDate), 'dd/MM/yy')}
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Status</p>
                      <p className={`font-bold ${selectedPatient.status === 'ATIVO' ? 'text-[#00FF00]' : 'text-red-500'}`}>
                        {selectedPatient.status}
                      </p>
                    </div>
                  </div>

                  {/* History Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <History size={20} className="text-blue-500" />
                      Histórico de Contatos
                    </h4>
                    
                    <div className="space-y-4 mb-6">
                      {selectedCustomerHistory.length > 0 ? (
                        selectedCustomerHistory.map((interaction, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-white">{interaction.titulo}</h5>
                              <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-lg">
                                {format(parseISO(interaction.data), 'dd/MM/yyyy')}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-400">{interaction.observacao}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-sm italic">Nenhum histórico registrado.</p>
                      )}
                    </div>

                    {/* Add Interaction Form */}
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                      <h5 className="font-bold text-white mb-3 text-sm uppercase flex items-center gap-2">
                        <Plus size={16} className="text-[#00FF00]" />
                        Adicionar Novo Contato
                      </h5>
                      <form onSubmit={handleAddInteraction} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            required
                            type="text" 
                            placeholder="Título (ex: Ligação de Cobrança)"
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#00FF00] outline-none"
                            value={newInteractionTitle}
                            onChange={e => setNewInteractionTitle(e.target.value)}
                          />
                          <input 
                            required
                            type="date" 
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#00FF00] outline-none"
                            value={newInteractionDate}
                            onChange={e => setNewInteractionDate(e.target.value)}
                          />
                        </div>
                        <textarea 
                          required
                          placeholder="Observações sobre o contato..."
                          rows={3}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#00FF00] outline-none resize-none"
                          value={newInteractionObs}
                          onChange={e => setNewInteractionObs(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <button 
                            type="submit"
                            className="bg-[#00FF00] hover:bg-[#00FF00]/80 text-black font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                          >
                            Salvar Histórico
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  <p>Selecione um paciente ao lado para ver detalhes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
