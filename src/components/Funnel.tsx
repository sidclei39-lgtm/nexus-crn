import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  DollarSign, 
  Calendar as CalendarIcon,
  AlertCircle,
  X,
  Instagram,
  Calendar
} from 'lucide-react';
import { Deal, DealStage, Customer } from '../types';

// Import initialCustomers to show real customer data in the modal
import { initialCustomers } from './CRM';

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Prospecção', color: 'bg-blue-500' },
  { id: 'contact', label: 'Contato', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Proposta', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Negociação', color: 'bg-emerald-500' },
  { id: 'closed', label: 'Fechado', color: 'bg-zinc-500' },
];

const initialDeals: Deal[] = [
  { id: '1', title: 'Software ERP', customerId: '1', value: 15000, stage: 'negotiation', probability: 80, expectedCloseDate: '2024-03-15' },
  { id: '2', title: 'Consultoria Cloud', customerId: '2', value: 8000, stage: 'proposal', probability: 60, expectedCloseDate: '2024-03-20' },
  { id: '3', title: 'App Mobile', customerId: '3', value: 25000, stage: 'lead', probability: 20, expectedCloseDate: '2024-04-10' },
  { id: '4', title: 'Suporte Anual', customerId: '4', value: 5000, stage: 'closed', probability: 100, expectedCloseDate: '2024-02-28' },
  { id: '5', title: 'Design System', customerId: '5', value: 12000, stage: 'contact', probability: 40, expectedCloseDate: '2024-03-25' },
];

export default function Funnel() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: '',
    value: 0,
    stage: 'lead',
    probability: 10,
    customerId: '',
    expectedCloseDate: new Date().toISOString().split('T')[0]
  });

  const getDealsByStage = (stage: DealStage) => deals.filter(d => d.stage === stage);

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
    };

    setDeals([deal, ...deals]);
    setIsModalOpen(false);
    setNewDeal({
      title: '',
      value: 0,
      stage: 'lead',
      probability: 10,
      customerId: '',
      expectedCloseDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Funil de Vendas</h2>
          <p className="text-zinc-400">Acompanhe o progresso dos seus negócios.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <Plus size={18} />
          Novo Negócio
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const totalValue = stageDeals.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div key={stage.id} className="w-80 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{stage.label}</h3>
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

                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                  {stageDeals.map((deal) => (
                    <div 
                      key={deal.id} 
                      className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-600 transition-all cursor-pointer group"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">{deal.title}</h4>
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
                  ))}
                  
                  {stageDeals.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-sm italic">
                      Nenhum negócio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Novo Negócio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Novo Negócio</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDeal} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Cliente / Empresa</label>
                <select 
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                  value={newDeal.customerId}
                  onChange={(e) => setNewDeal({ ...newDeal, customerId: e.target.value })}
                >
                  <option value="">Selecione um cliente...</option>
                  <option value="1">Ana Silva (Tech Solutions)</option>
                  <option value="2">Bruno Costa (Vendas S.A.)</option>
                  <option value="3">Carla Oliveira (Design Studio)</option>
                  <option value="4">Daniel Santos (Logística Brasil)</option>
                  <option value="5">Eduarda Lima (Marketing Pro)</option>
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
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as DealStage })}
                >
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
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

              <div className="pt-4 flex gap-3">
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
      {/* Modal Detalhes do Negócio/Cliente */}
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
                    onChange={(e) => setSelectedDeal({...selectedDeal, stage: e.target.value as DealStage})}
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
                </div>
              </div>

              {/* Informações do Cliente (Mockado para o exemplo, idealmente buscaria do estado global/contexto) */}
              {(() => {
                const customer = initialCustomers.find(c => c.id === selectedDeal.customerId) || initialCustomers[0];
                
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
    </div>
  );
}
