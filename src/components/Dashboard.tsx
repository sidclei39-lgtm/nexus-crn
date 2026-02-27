import { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target,
  ArrowUpRight,
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { Customer, Interaction } from '../types';
import { parse, isToday, isThisMonth, isThisYear, compareDesc } from 'date-fns';

interface DashboardProps {
  customers: Customer[];
}

type InteractionWithLead = Interaction & {
  leadName: string;
  leadStatus: string;
  parsedDate: Date;
};

export default function Dashboard({ customers }: DashboardProps) {
  const metrics = useMemo(() => {
    const allInteractions: InteractionWithLead[] = [];
    
    customers.forEach(customer => {
      const history = customer.historico_contatos || [];
      history.forEach(interaction => {
        try {
          // Format is "DD/MM/AAAA HH:mm"
          const parsedDate = parse(interaction.data, 'dd/MM/yyyy HH:mm', new Date());
          allInteractions.push({
            ...interaction,
            leadName: customer.name,
            leadStatus: customer.status || 'Lead',
            parsedDate
          });
        } catch (e) {
          console.error('Erro ao processar data:', interaction.data);
        }
      });
    });

    // Ordenar por data decrescente
    allInteractions.sort((a, b) => compareDesc(a.parsedDate, b.parsedDate));

    const today = allInteractions.filter(i => isToday(i.parsedDate));
    const month = allInteractions.filter(i => isThisMonth(i.parsedDate));
    const year = allInteractions.filter(i => isThisYear(i.parsedDate));

    // Contabiliza ações ativas de comunicação (novos leads, follow-ups, etc)
    const activeActionsToday = today.filter(i => i.tipo_contato === 'Ativo' || i.titulo.includes('1º Contato') || i.titulo.includes('Ação de Comunicação')).length;
    const activeActionsMonth = month.filter(i => i.tipo_contato === 'Ativo' || i.titulo.includes('1º Contato') || i.titulo.includes('Ação de Comunicação')).length;
    const activeActionsYear = year.filter(i => i.tipo_contato === 'Ativo' || i.titulo.includes('1º Contato') || i.titulo.includes('Ação de Comunicação')).length;

    return {
      allInteractions,
      totals: {
        today: today.length,
        month: month.length,
        year: year.length
      },
      newLeads: {
        today: activeActionsToday,
        month: activeActionsMonth,
        year: activeActionsYear
      }
    };
  }, [customers]);

  const stats = [
    { 
      label: 'Ações Ativas Hoje', 
      value: metrics.newLeads.today, 
      subLabel: `${metrics.totals.today} interações totais`,
      icon: MessageSquare, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Ações Ativas no Mês', 
      value: metrics.newLeads.month, 
      subLabel: `${metrics.totals.month} interações totais`,
      icon: Calendar, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Ações Ativas no Ano', 
      value: metrics.newLeads.year, 
      subLabel: `${metrics.totals.year} interações totais`,
      icon: TrendingUp, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10' 
    },
    { 
      label: 'Total de Leads', 
      value: customers.length, 
      subLabel: 'Base total de contatos',
      icon: Users, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Métricas</h2>
          <p className="text-zinc-400">Acompanhamento de produtividade e novos leads.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button className="px-4 py-1.5 text-xs font-medium bg-emerald-500 text-black rounded-lg transition-all">Geral</button>
          <button className="px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-all">Equipe</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Métrica Real
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <span className="text-xs text-zinc-500 mb-1.5">{stat.subLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={20} className="text-emerald-500" />
            Atividade Recente de Contatos
          </h3>
          <span className="text-xs text-zinc-500">Últimas interações registradas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data / Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Interação</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {metrics.allInteractions.length > 0 ? (
                metrics.allInteractions.slice(0, 15).map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-300 font-medium">{interaction.data.split(' ')[0]}</div>
                      <div className="text-[10px] text-zinc-500">{interaction.data.split(' ')[1] || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                          {interaction.leadName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-white font-medium">{interaction.leadName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        interaction.titulo.includes('1º') 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {interaction.titulo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400">{interaction.leadStatus}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-500 truncate max-w-[200px]" title={interaction.observacao}>
                        {interaction.observacao}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                    Nenhuma interação registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {metrics.allInteractions.length > 15 && (
          <div className="p-4 border-t border-zinc-800 text-center">
            <button className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
              Ver todo o histórico
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
