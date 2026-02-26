import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { RevenueData } from '../types';

const data: RevenueData[] = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Fev', revenue: 5200 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Abr', revenue: 6100 },
  { month: 'Mai', revenue: 5900 },
  { month: 'Jun', revenue: 7500 },
];

const stats = [
  { label: 'Faturamento Total', value: 'R$ 34.000', change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Novos Clientes', value: '124', change: '+18.2%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Negócios Ativos', value: '42', change: '-4.1%', icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { label: 'Taxa de Conversão', value: '24%', change: '+2.4%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
        <p className="text-zinc-400">Bem-vindo ao seu painel de controle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change}
                {stat.change.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white">Faturamento Mensal</h3>
            <select className="bg-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 border-none focus:ring-1 focus:ring-emerald-500">
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="month" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Negócios por Origem</h3>
          <div className="space-y-6">
            {[
              { label: 'Indicação', value: 45, color: 'bg-emerald-500' },
              { label: 'Redes Sociais', value: 30, color: 'bg-blue-500' },
              { label: 'Google Ads', value: 15, color: 'bg-purple-500' },
              { label: 'Outros', value: 10, color: 'bg-zinc-700' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full`} 
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Dica do Dia</p>
            <p className="text-sm text-zinc-300 mt-1">Suas indicações cresceram 15% este mês. Considere um programa de recompensas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
