import React, { useState } from 'react';
import { Patient } from '../types';
import { 
  LogOut, 
  User, 
  Calendar, 
  CreditCard, 
  Activity,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientPortalProps {
  patientId: string;
  patients: Patient[];
  onLogout: () => void;
}

export default function ClientPortal({ patientId, patients, onLogout }: ClientPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  
  const patient = patients.find(p => p.id === patientId);

  if (!patient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Paciente não encontrado</h2>
          <button onClick={onLogout} className="text-emerald-500 hover:underline">Voltar para o login</button>
        </div>
      </div>
    );
  }

  const daysRemaining = differenceInDays(parseISO(patient.endDate), new Date());
  const isActive = daysRemaining >= 0;

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 sm:px-8 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold">N</span>
          </div>
          <h1 className="text-white font-semibold text-xl tracking-tight hidden sm:block">Nexus Área do Cliente</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">{patient.name}</p>
              <p className="text-xs text-zinc-500 mt-1">Plano {patient.plan}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black shadow-lg shadow-emerald-500/10">
              <User size={20} />
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-800 mx-2"></div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Olá, {patient.name.split(' ')[0]}!</h2>
            <p className="text-zinc-400 mt-1">Bem-vindo(a) à sua área exclusiva de acompanhamento.</p>
          </div>
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {isActive ? <CheckCircle2 size={18} /> : <Clock size={18} />}
            Status: {isActive ? 'Ativo' : 'Inativo'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-medium text-zinc-400">Seu Plano</h3>
            </div>
            <p className="text-2xl font-bold text-white">{patient.plan}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Calendar size={20} />
              </div>
              <h3 className="text-sm font-medium text-zinc-400">Início</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {format(parseISO(patient.startDate), "dd 'de' MMM", { locale: ptBR })}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="text-sm font-medium text-zinc-400">Vencimento</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {format(parseISO(patient.endDate), "dd 'de' MMM", { locale: ptBR })}
            </p>
            {isActive && (
              <p className="text-xs text-orange-500 mt-1">Faltam {daysRemaining} dias</p>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <CreditCard size={20} />
              </div>
              <h3 className="text-sm font-medium text-zinc-400">Valor</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(patient.value)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-800">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
          >
            Visão Geral
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
          >
            Histórico de Acompanhamento
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Suas Informações</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Observações do Profissional</p>
                    <div className="bg-zinc-950 rounded-xl p-4 text-zinc-300 text-sm leading-relaxed border border-zinc-800/50">
                      {patient.notes || 'Nenhuma observação registrada no momento.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Suporte</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-6">
                  Precisa de ajuda com seu plano ou tem alguma dúvida?
                </p>
                <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={18} />
                  Falar com Suporte
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">Linha do Tempo</h3>
            </div>

            {patient.interactions && patient.interactions.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                {patient.interactions.map((interaction, index) => (
                  <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-900 bg-emerald-500 text-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-950 p-4 rounded-2xl border border-zinc-800 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-white">{interaction.title}</div>
                        <time className="text-xs font-medium text-emerald-500">
                          {format(parseISO(interaction.date), "dd/MM/yyyy")}
                        </time>
                      </div>
                      <div className="text-sm text-zinc-400">{interaction.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-zinc-500" size={24} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Nenhum histórico</h3>
                <p className="text-zinc-400">Ainda não há registros de acompanhamento para o seu perfil.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
