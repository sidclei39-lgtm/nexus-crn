import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  DollarSign, 
  Calendar as CalendarIcon,
  AlertCircle,
  X,
  Instagram,
  Calendar,
  Search
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Deal, DealStage, Customer, Patient, PlanType } from '../types';

// Import initialCustomers to show real customer data in the modal

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Prospecção', color: 'bg-blue-500' },
  { id: 'contact', label: 'Contato', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Proposta', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Negociação', color: 'bg-emerald-500' },
  { id: 'closed', label: 'Fechado', color: 'bg-zinc-500' },
];

export const initialDeals: Deal[] = [
  { id: '1', title: 'Software ERP', customerId: '1', value: 15000, stage: 'negotiation', probability: 80, expectedCloseDate: '2024-03-15' },
  { id: '2', title: 'Consultoria Cloud', customerId: '2', value: 8000, stage: 'proposal', probability: 60, expectedCloseDate: '2024-03-20' },
  { id: '3', title: 'App Mobile', customerId: '3', value: 25000, stage: 'lead', probability: 20, expectedCloseDate: '2024-04-10' },
  { id: '4', title: 'Suporte Anual', customerId: '4', value: 5000, stage: 'closed', probability: 100, expectedCloseDate: '2024-02-28' },
  { id: '5', title: 'Design System', customerId: '5', value: 12000, stage: 'contact', probability: 40, expectedCloseDate: '2024-03-25' },
];

interface FunnelProps {
  customers: Customer[];
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

export default function Funnel({ customers, deals, setDeals, setPatients }: FunnelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewingStage, setViewingStage] = useState<DealStage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterContact, setFilterContact] = useState<string>('all');
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: '',
    value: 0,
    stage: 'lead',
    probability: 10,
    customerId: '',
    expectedCloseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix_vista',
    installments: 1,
    paymentConfirmed: false,
    planType: 'mensal'
  });

  const getDealsByStage = (stage: DealStage) => {
    return deals.filter(d => {
      const matchesStage = d.stage === stage;
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPayment = filterPayment === 'all' || d.paymentMethod === filterPayment;
      
      const customer = customers.find(c => c.id === d.customerId);
      const contactCount = customer?.historico_contatos?.length || 0;
      const matchesContact = filterContact === 'all' || 
        (filterContact === '5+' ? contactCount >= 5 : contactCount.toString() === filterContact);

      return matchesStage && matchesSearch && matchesPayment && matchesContact;
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId as DealStage;
    const updatedDeals = deals.map(deal => 
      deal.id === draggableId 
        ? { 
            ...deal, 
            stage: newStage,
            paymentConfirmed: newStage === 'closed' ? true : deal.paymentConfirmed
          } 
        : deal
    );

    setDeals(updatedDeals);

    // Automation: if deal is closed, create a new patient
    if (newStage === 'closed') {
      const closedDeal = updatedDeals.find(d => d.id === draggableId);
      const customer = customers.find(c => c.id === closedDeal?.customerId);

      if (closedDeal && customer) {
        const startDate = new Date().toISOString().split('T')[0];
        let daysToAdd = 30;
        if (closedDeal.planType === 'trimestral') daysToAdd = 90;
        if (closedDeal.planType === 'semestral') daysToAdd = 180;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysToAdd);

        const newPatient: Patient = {
          id: Math.random().toString(36).substr(2, 9),
          name: customer.name,
          plan: closedDeal.planType as PlanType,
          startDate: startDate,
          endDate: endDate.toISOString().split('T')[0],
          status: 'ATIVO',
          value: closedDeal.value,
          paymentMethod: closedDeal.paymentMethod as 'pix' | 'card',
          installments: closedDeal.installments || 1,
        };

        setPatients(prevPatients => [...prevPatients, newPatient]);
      }
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const deal: Deal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newDeal.title || 'Novo Negócio',
      customerId: newDeal.customerId || 'temp-' + Date.now(),
      value: Number(newDeal.value) || 0,
      stage: newDeal.stage as DealStage,
      probability: Number(newDeal.probability) || 0,
      expectedCloseDate: newDeal.expectedCloseDate || new Date().toISOString().split('T')[0],
      paymentMethod: newDeal.paymentMethod as 'pix_vista' | 'pix_parcelado' | 'card',
      installments: newDeal.installments,
      paymentConfirmed: newDeal.stage === 'closed' ? true : newDeal.paymentConfirmed,
      planType: newDeal.planType as 'mensal' | 'trimestral' | 'semestral'
    };

    setDeals([deal, ...deals]);
    setIsModalOpen(false);
    setNewDeal({
      title: '',
      value: 0,
      stage: 'lead',
      probability: 10,
      customerId: '',
      expectedCloseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix_vista',
      installments: 1,
      paymentConfirmed: false,
      planType: 'mensal'
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Funil de Vendas</h2>
          <p className="text-zinc-400 text-sm">Acompanhe o progresso dos seus negócios em tempo real.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              placeholder="Pesquisar negócio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none w-full md:w-64 transition-all"
            />
          </div>

          <select
            value={filterContact}
            onChange={(e) => setFilterContact(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">Todos Contatos</option>
            <option value="0">Sem Contato</option>
            <option value="1">Contato 1</option>
            <option value="2">Contato 2</option>
            <option value="3">Contato 3</option>
            <option value="4">Contato 4</option>
            <option value="5+">Contato 5+</option>
          </select>

          <select 
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">Todos Pagamentos</option>
            <option value="pix_vista">PIX à Vista</option>
            <option value="pix_parcelado">PIX Parcelado</option>
            <option value="card">Cartão (Asaas)</option>
          </select>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Plus size={18} />
            Novo Negócio
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max h-full">
            {stages.map((stage) => {
              const stageDeals = getDealsByStage(stage.id);
              const totalValue = stageDeals.reduce((acc, curr) => acc + curr.value, 0);

              return (
                <div key={stage.id} className="w-80 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="flex items-center gap-2 cursor-pointer group/header hover:bg-zinc-800/50 px-2 py-1 rounded-lg transition-all"
                      onClick={() => setViewingStage(stage.id)}
                    >
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider group-hover/header:text-emerald-400 transition-colors">{stage.label}</h3>
                      <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                        {stageDeals.length}
                      </span>
                    </div>
                    <button className="text-zinc-500 hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Valor Total</p>
                    <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalValue)}</p>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar min-h-[100px] transition-colors rounded-xl ${
                          snapshot.isDraggingOver ? 'bg-emerald-500/5' : ''
                        }`}
                      >
                        {stageDeals.map((deal, index) => {
                          const customer = customers.find(c => c.id === deal.customerId);
                          const isOverdue = customer?.diasProximoContato !== undefined && customer.diasProximoContato <= 0;

                          return (
                            // @ts-ignore
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-zinc-900 border p-4 rounded-xl hover:border-zinc-600 transition-all cursor-pointer group ${
                                    isOverdue ? 'border-red-500/30 bg-red-500/5' : 'border-zinc-800'
                                  } ${snapshot.isDragging ? 'shadow-2xl border-emerald-500/50 scale-[1.02] z-50' : ''}`}
                                  onClick={() => setSelectedDeal(deal)}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">{deal.title}</h4>
                                      {isOverdue && (
                                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-0.5">
                                          <AlertCircle size={10} />
                                          ATRASADO
                                        </span>
                                      )}
                                    </div>
                                    <button className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical size={14} />
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-1.5 text-zinc-400">
                                        <DollarSign size={14} className="text-emerald-500" />
                                        <span className="font-semibold text-zinc-200">{formatCurrency(deal.value)}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-zinc-500">
                                        <CalendarIcon size={14} />
                                        <span className="text-xs">{new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                    </div>

                                    {(deal.paymentMethod || deal.paymentConfirmed !== undefined) && (
                                      <div className="flex flex-wrap gap-2">
                                        {deal.paymentMethod && (
                                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700">
                                            {deal.paymentMethod === 'pix_vista' ? 'PIX à Vista' : 
                                             deal.paymentMethod === 'pix_parcelado' ? `PIX ${deal.installments}x` : 
                                             `Cartão ${deal.installments}x`}
                                          </span>
                                        )}
                                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                          deal.paymentConfirmed 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                        }`}>
                                          {deal.paymentConfirmed ? 'PAGO' : 'PENDENTE'}
                                        </div>
                                      </div>
                                    )}

                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                                        <span>Probabilidade</span>
                                        <span>{deal.probability}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            deal.probability > 70 ? 'bg-emerald-500' : 
                                            deal.probability > 40 ? 'bg-orange-500' : 'bg-blue-500'
                                          }`} 
                                          style={{ width: `${deal.probability}%` }}
                                        />
                                      </div>
                                    </div>

                                    {deal.probability < 30 && (
                                      <div className="flex items-center gap-1.5 text-[10px] text-orange-400 bg-orange-400/5 p-1.5 rounded-lg">
                                        <AlertCircle size={12} />
                                        Atenção: Baixa probabilidade
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Modal Novo Negócio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-white">Novo Negócio</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDeal} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Lead / Empresa</label>
                  <select 
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    value={newDeal.customerId}
                    onChange={(e) => setNewDeal({ ...newDeal, customerId: e.target.value })}
                  >
                    <option value="">Selecione um lead...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Título do Negócio</label>
                  <input 
                    required
                    type="text"
                    placeholder="Ex: Software ERP"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    value={newDeal.title}
                    onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Valor (R$)</label>
                    <input 
                      required
                      type="number"
                      placeholder="0,00"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newDeal.value}
                      onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Probabilidade (%)</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newDeal.probability}
                      onChange={(e) => setNewDeal({ ...newDeal, probability: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Etapa</label>
                  <select 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    value={newDeal.stage}
                    onChange={(e) => {
                      const newStage = e.target.value as DealStage;
                      setNewDeal({ 
                        ...newDeal, 
                        stage: newStage,
                        paymentConfirmed: newStage === 'closed' ? true : newDeal.paymentConfirmed
                      });
                    }}
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Pacote / Plano</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['mensal', 'trimestral', 'semestral'] as const).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          const inst = plan === 'mensal' ? 1 : plan === 'trimestral' ? 3 : 6;
                          setNewDeal({ ...newDeal, planType: plan, installments: inst });
                        }}
                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all uppercase ${
                          newDeal.planType === plan 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Previsão de Fechamento</label>
                  <input 
                    required
                    type="date"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    value={newDeal.expectedCloseDate}
                    onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className={`p-4 rounded-xl border transition-all ${
                    newDeal.stage === 'closed' 
                      ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                      : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-500" />
                        Confirmação de Pagamento
                      </label>
                      {newDeal.stage === 'closed' && (
                        <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">OBRIGATÓRIO</span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase">Forma de Pagamento</label>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => setNewDeal({ ...newDeal, paymentMethod: 'pix_vista', installments: 1 })}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                              newDeal.paymentMethod === 'pix_vista' 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            PIX À VISTA
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewDeal({ ...newDeal, paymentMethod: 'pix_parcelado' })}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                              newDeal.paymentMethod === 'pix_parcelado' 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            PIX PARCELADO
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewDeal({ ...newDeal, paymentMethod: 'card' })}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                              newDeal.paymentMethod === 'card' 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            CARTÃO DE CRÉDITO (ASAAS)
                          </button>
                        </div>
                      </div>

                      {(newDeal.paymentMethod === 'card' || newDeal.paymentMethod === 'pix_parcelado') && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                          <label className="text-xs font-medium text-zinc-500 uppercase">Número de Parcelas</label>
                          <select
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                            value={newDeal.installments}
                            onChange={(e) => setNewDeal({ ...newDeal, installments: Number(e.target.value) })}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                              <option key={n} value={n}>{n}x {n === 1 ? '(À vista)' : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setNewDeal({ ...newDeal, paymentConfirmed: !newDeal.paymentConfirmed })}
                          className={`w-10 h-6 rounded-full transition-all relative ${
                            newDeal.paymentConfirmed ? 'bg-emerald-500' : 'bg-zinc-800'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            newDeal.paymentConfirmed ? 'left-5' : 'left-1'
                          }`} />
                        </button>
                        <span className="text-sm font-medium text-zinc-300">Pagamento Confirmado?</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 text-zinc-400 font-semibold rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Criar Negócio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Detalhes do Negócio/Lead */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 w-full pr-8">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-500 font-bold border border-zinc-700 text-xl shrink-0">
                  {selectedDeal.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    value={selectedDeal.title}
                    onChange={(e) => setSelectedDeal({...selectedDeal, title: e.target.value})}
                    className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 outline-none w-full transition-colors pb-1"
                  />
                  <select
                    value={selectedDeal.stage}
                    onChange={(e) => {
                      const newStage = e.target.value as DealStage;
                      setSelectedDeal({
                        ...selectedDeal, 
                        stage: newStage,
                        paymentConfirmed: newStage === 'closed' ? true : selectedDeal.paymentConfirmed
                      });
                    }}
                    className={`mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-medium outline-none appearance-none cursor-pointer ${
                      stages.find(s => s.id === selectedDeal.stage)?.color.replace('bg-', 'text-').replace('500', '400')
                    }`}
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id} className="text-zinc-300">{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDeal(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
              {/* Informações do Negócio */}
              <div>
                <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4">Informações do Negócio</h4>
                
                <div className="mb-6 space-y-2">
                  <label className="text-xs text-zinc-500 uppercase font-bold">Pacote / Plano</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['mensal', 'trimestral', 'semestral'] as const).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          const inst = plan === 'mensal' ? 1 : plan === 'trimestral' ? 3 : 6;
                          setSelectedDeal({ ...selectedDeal, planType: plan, installments: inst });
                        }}
                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all uppercase ${
                          selectedDeal.planType === plan 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Valor (R$)</p>
                    <input 
                      type="number"
                      value={selectedDeal.value}
                      onChange={(e) => setSelectedDeal({...selectedDeal, value: Number(e.target.value)})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-emerald-400 font-medium focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Probabilidade (%)</p>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={selectedDeal.probability}
                      onChange={(e) => setSelectedDeal({...selectedDeal, probability: Number(e.target.value)})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Previsão de Fechamento</p>
                    <input 
                      type="date"
                      value={selectedDeal.expectedCloseDate}
                      onChange={(e) => setSelectedDeal({...selectedDeal, expectedCloseDate: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Forma de Pagamento</p>
                    <select
                      value={selectedDeal.paymentMethod || 'pix_vista'}
                      onChange={(e) => {
                        const method = e.target.value as any;
                        setSelectedDeal({
                          ...selectedDeal, 
                          paymentMethod: method,
                          installments: method === 'pix_vista' ? 1 : selectedDeal.installments
                        });
                      }}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    >
                      <option value="pix_vista">PIX à Vista</option>
                      <option value="pix_parcelado">PIX Parcelado</option>
                      <option value="card">Cartão (Asaas)</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Parcelas</p>
                    <select
                      disabled={selectedDeal.paymentMethod === 'pix_vista'}
                      value={selectedDeal.installments || 1}
                      onChange={(e) => setSelectedDeal({...selectedDeal, installments: Number(e.target.value)})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <option key={n} value={n}>{n}x</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Status Pagamento</p>
                    <button
                      onClick={() => setSelectedDeal({ ...selectedDeal, paymentConfirmed: !selectedDeal.paymentConfirmed })}
                      className={`w-full py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                        selectedDeal.paymentConfirmed 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
                      }`}
                    >
                      {selectedDeal.paymentConfirmed ? 'CONFIRMADO' : 'PENDENTE'}
                    </button>
                  </div>
                </div>

                <div className={`mt-6 pt-6 border-t border-zinc-800 space-y-6 ${
                  selectedDeal.stage === 'closed' ? 'animate-in slide-in-from-bottom-4 duration-500' : ''
                }`}>
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedDeal.stage === 'closed' 
                      ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                      : 'bg-zinc-900/50 border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-500" />
                        Confirmação de Pagamento
                      </label>
                      {selectedDeal.stage === 'closed' && (
                        <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">FECHAMENTO</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-zinc-500 mb-2 font-bold uppercase tracking-wider">Forma de Pagamento</p>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedDeal({...selectedDeal, paymentMethod: 'pix_vista', installments: 1})}
                            className={`w-full py-2 text-xs font-bold rounded-xl border transition-all ${
                              selectedDeal.paymentMethod === 'pix_vista' 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                            }`}
                          >
                            PIX À VISTA
                          </button>
                          <button
                            onClick={() => setSelectedDeal({...selectedDeal, paymentMethod: 'pix_parcelado'})}
                            className={`w-full py-2 text-xs font-bold rounded-xl border transition-all ${
                              selectedDeal.paymentMethod === 'pix_parcelado' 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                            }`}
                          >
                            PIX PARCELADO
                          </button>
                          <button
                            onClick={() => setSelectedDeal({...selectedDeal, paymentMethod: 'card'})}
                            className={`w-full py-2 text-xs font-bold rounded-xl border transition-all ${
                              selectedDeal.paymentMethod === 'card' 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                            }`}
                          >
                            CARTÃO (ASAAS)
                          </button>
                        </div>
                      </div>
                      
                      {(selectedDeal.paymentMethod === 'card' || selectedDeal.paymentMethod === 'pix_parcelado') && (
                        <div className="animate-in slide-in-from-left-2 duration-200">
                          <p className="text-xs text-zinc-500 mb-2 font-bold uppercase tracking-wider">Parcelas</p>
                          <select
                            value={selectedDeal.installments || 1}
                            onChange={(e) => setSelectedDeal({...selectedDeal, installments: Number(e.target.value)})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                              <option key={n} value={n}>{n}x</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-zinc-800/50">
                      <button
                        type="button"
                        onClick={() => setSelectedDeal({ ...selectedDeal, paymentConfirmed: !selectedDeal.paymentConfirmed })}
                        className={`w-10 h-6 rounded-full transition-all relative ${
                          selectedDeal.paymentConfirmed ? 'bg-emerald-500' : 'bg-zinc-800'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          selectedDeal.paymentConfirmed ? 'left-5' : 'left-1'
                        }`} />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-300">Pagamento Confirmado?</span>
                        <span className="text-[10px] text-zinc-500 italic">Ative para validar o recebimento no dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Lead */}
              {(() => {
                const customer = customers.find(c => c.id === selectedDeal.customerId) || customers[0];
                
                return (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4">Detalhes do Lead</h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Nome</p>
                          <p className="text-sm text-zinc-200">{customer.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Instagram / Contato</p>
                          {customer.instagramUrl ? (
                            <a href={customer.instagramUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-400 hover:underline flex items-center gap-1">
                              <Instagram size={14} />
                              Acessar Link
                            </a>
                          ) : (
                            <p className="text-sm text-zinc-200">-</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Origem</p>
                          <p className="text-sm text-zinc-200">{customer.origem || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Objetivo</p>
                          <p className="text-sm text-zinc-200">{customer.objetivo || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Histórico de Contatos */}
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4">Histórico de Contatos</h4>
                      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">1° Contato</p>
                            <p className="text-sm text-zinc-200 font-medium">{customer.primeiroContato || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Último Contato</p>
                            <p className="text-sm text-zinc-200 font-medium">{customer.ultimoContato || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Cadência</p>
                            <p className="text-sm text-zinc-200 font-medium">{customer.cadenciaDias ? `${customer.cadenciaDias} dias` : '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Contatado?</p>
                            <p className="text-sm text-zinc-200 font-medium">{customer.contatado || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Próximo Contato</p>
                            <div className="flex items-center gap-2 text-sm text-zinc-200 font-medium">
                              <Calendar size={16} className="text-emerald-500" />
                              {customer.proxContato || '-'}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 mb-1">Status do Atraso</p>
                            {customer.diasProximoContato !== undefined ? (
                              <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                                customer.diasProximoContato <= 0 
                                  ? 'bg-red-500/10 text-red-400' 
                                  : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {customer.diasProximoContato <= 0 
                                  ? `Atrasado em ${Math.abs(customer.diasProximoContato)} dias` 
                                  : `Faltam ${customer.diasProximoContato} dias`}
                              </span>
                            ) : (
                              <span className="text-sm text-zinc-500">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4">Observações do Lead</h4>
                      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 min-h-[100px]">
                        {customer.observacoes ? (
                          <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {customer.observacoes}
                          </p>
                        ) : (
                          <p className="text-sm text-zinc-500 italic">Nenhuma observação registrada para este lead.</p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0 flex justify-between items-center gap-3">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
                  <span className="text-sm text-red-400 font-medium mr-2">Tem certeza?</span>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-zinc-900 text-zinc-300 text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      setDeals(deals.filter(d => d.id !== selectedDeal.id));
                      setSelectedDeal(null);
                      setShowDeleteConfirm(false);
                    }}
                    className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sim, excluir
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500/10 text-red-500 font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  Excluir Negócio
                </button>
              )}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedDeal(null);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 font-semibold rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => {
                    setDeals(deals.map(d => d.id === selectedDeal.id ? selectedDeal : d));
                    setSelectedDeal(null);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Etapa */}
      {viewingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${stages.find(s => s.id === viewingStage)?.color}`} />
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  Etapa: {stages.find(s => s.id === viewingStage)?.label}
                </h3>
                <span className="bg-zinc-900 text-zinc-400 text-sm px-3 py-1 rounded-full border border-zinc-800">
                  {getDealsByStage(viewingStage).length} Negócios
                </span>
              </div>
              <button 
                onClick={() => setViewingStage(null)}
                className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-900 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getDealsByStage(viewingStage).map((deal) => {
                  const customer = customers.find(c => c.id === deal.customerId);
                  const isOverdue = customer?.diasProximoContato !== undefined && customer.diasProximoContato <= 0;

                  return (
                    <div 
                      key={deal.id} 
                      className={`bg-zinc-900 border p-5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden ${
                        isOverdue ? 'border-red-500/30 bg-red-500/5' : 'border-zinc-800'
                      }`}
                      onClick={() => {
                        setSelectedDeal(deal);
                        setViewingStage(null);
                      }}
                    >
                      {isOverdue && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                          ATRASADO
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-500 font-bold border border-zinc-700 shrink-0">
                          {deal.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-lg truncate group-hover:text-emerald-400 transition-colors">
                            {deal.title}
                          </h4>
                          <p className="text-zinc-400 text-sm truncate">{customer?.name || 'Lead Desconhecido'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Valor</p>
                          <p className="text-emerald-400 font-bold">{formatCurrency(deal.value)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Probabilidade</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  deal.probability > 70 ? 'bg-emerald-500' : 
                                  deal.probability > 40 ? 'bg-orange-500' : 'bg-blue-500'
                                }`} 
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-300 font-medium">{deal.probability}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Previsão</p>
                          <div className="flex items-center gap-1.5 text-zinc-300 text-xs">
                            <CalendarIcon size={12} className="text-zinc-500" />
                            {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Pagamento</p>
                          <div className="flex flex-col gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${
                              deal.paymentConfirmed 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {deal.paymentConfirmed ? 'CONFIRMADO' : 'PENDENTE'}
                            </span>
                            {deal.paymentMethod && (
                              <span className="text-[10px] text-zinc-400">
                                {deal.paymentMethod === 'pix_vista' ? 'PIX à Vista' : 
                                 deal.paymentMethod === 'pix_parcelado' ? `PIX ${deal.installments}x` : 
                                 `Cartão ${deal.installments}x`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getDealsByStage(viewingStage).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                    <DollarSign size={32} />
                  </div>
                  <p className="text-lg font-medium">Nenhum negócio nesta etapa</p>
                  <p className="text-sm">Os leads que você adicionar aparecerão aqui.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end shrink-0">
              <button 
                onClick={() => setViewingStage(null)}
                className="px-6 py-2.5 bg-zinc-900 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
