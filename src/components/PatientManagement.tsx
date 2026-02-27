import { useState, useEffect, FormEvent, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Patient, PlanType } from '../types';
import { addDays, format, isBefore, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  Plus, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Trash2,
  Edit2,
  Search
} from 'lucide-react';

interface PatientManagementProps {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
}

export default function PatientManagement({ patients, setPatients }: PatientManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<PlanType>('mensal');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [value, setValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [timeFilter, setTimeFilter] = useState<'day' | 'month' | 'year'>('month');

  // Update status based on dates
  useEffect(() => {
    const updatedPatients = patients.map(p => {
      const end = parseISO(p.endDate);
      const today = startOfDay(new Date());
      const isExpired = isBefore(end, today);
      const newStatus: 'ATIVO' | 'VENCIDO' | 'INATIVO' = isExpired ? 'VENCIDO' : 'ATIVO';
      
      if (p.status !== newStatus) {
        return { ...p, status: newStatus };
      }
      return p;
    });

    if (JSON.stringify(updatedPatients) !== JSON.stringify(patients)) {
      setPatients(updatedPatients);
    }
  }, [patients, setPatients]);

  const calculateEndDate = (start: string, planType: PlanType) => {
    const date = parseISO(start);
    let daysToAdd = 30;
    if (planType === 'trimestral') daysToAdd = 90;
    if (planType === 'semestral') daysToAdd = 180;
    return format(addDays(date, daysToAdd), 'yyyy-MM-dd');
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    
    const endDate = calculateEndDate(startDate, plan);
    const installments = plan === 'mensal' ? 1 : (plan === 'trimestral' ? 3 : 6);
    
    const newPatient: Patient = {
      id: editingPatient ? editingPatient.id : Math.random().toString(36).substr(2, 9),
      name,
      plan,
      startDate,
      endDate,
      status: 'ATIVO', // Will be recalculated by effect
      value: Number(value),
      paymentMethod,
      installments
    };

    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? newPatient : p));
    } else {
      setPatients([...patients, newPatient]);
    }

    handleCloseModal();
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setName(patient.name);
    setPlan(patient.plan);
    setStartDate(patient.startDate);
    setValue(patient.value.toString());
    setPaymentMethod(patient.paymentMethod);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPatientToDelete(id);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      setPatients(patients.filter(p => p.id !== patientToDelete));
      setPatientToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setName('');
    setPlan('mensal');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setValue('');
    setPaymentMethod('pix');
  };

  const chartData = useMemo(() => {
    const active = patients.filter(p => p.status === 'ATIVO').length;
    const expired = patients.filter(p => p.status === 'VENCIDO').length;
    return [{ name: 'Ativos', value: active }, { name: 'Vencidos', value: expired }];
  }, [patients]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysRemaining = (endDate: string) => {
    const end = parseISO(endDate);
    const today = startOfDay(new Date());
    return differenceInDays(end, today);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-500" />
            Gestão de Pacientes
          </h2>
          <p className="text-zinc-400">Gerencie planos, prazos e status dos pacientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Paciente
        </button>
      </div>

      {/* Chart and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-bold">Status dos Pacientes</h4>
            <div className="flex gap-1 bg-zinc-800/50 border border-zinc-700 rounded-lg p-1">
              {(['day', 'month', 'year'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    timeFilter === f ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:bg-zinc-700'
                  }`}>
                  {f === 'day' ? 'Dia' : f === 'month' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                <Cell key="cell-0" fill="#10B981" />
                <Cell key="cell-1" fill="#EF4444" />
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#18181b', 
                  borderColor: '#3f3f46',
                  borderRadius: '0.75rem',
                  color: '#d4d4d8'
                }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 relative self-end">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar paciente por nome..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => {
            const daysRemaining = getDaysRemaining(patient.endDate);
            const isExpired = daysRemaining < 0;
            
            return (
              <div key={patient.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isExpired ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {isExpired ? 'VENCIDO' : 'ATIVO'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <CreditCard size={14} />
                      {patient.plan.charAt(0).toUpperCase() + patient.plan.slice(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Início: {format(parseISO(patient.startDate), 'dd/MM/yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Fim: {format(parseISO(patient.endDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase font-bold">Valor Total</p>
                    <p className="text-emerald-400 font-bold">{formatCurrency(patient.value)}</p>
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    <p className="text-xs text-zinc-500 uppercase font-bold">
                      {isExpired ? 'Atraso' : 'Restante'}
                    </p>
                    <p className={`font-bold ${isExpired ? 'text-red-500' : 'text-white'}`}>
                      {Math.abs(daysRemaining)} dias
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(patient)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(patient.id)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl">
            <Users className="mx-auto text-zinc-600 mb-4" size={48} />
            <p className="text-zinc-500">Nenhum paciente encontrado.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Excluir Paciente</h3>
                <p className="text-zinc-400 text-sm mt-1">
                  Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setPatientToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 text-zinc-400 font-semibold rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h3>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome do Paciente</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Plano</label>
                  <select 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                    value={plan}
                    onChange={e => setPlan(e.target.value as PlanType)}
                  >
                    <option value="mensal">Mensal (30 dias)</option>
                    <option value="trimestral">Trimestral (90 dias)</option>
                    <option value="semestral">Semestral (180 dias)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Data de Início</label>
                  <input 
                    required
                    type="date" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Valor Total (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Pagamento</label>
                  <select 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as 'pix' | 'card')}
                  >
                    <option value="pix">PIX</option>
                    <option value="card">Cartão</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-colors"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
