import { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  Calendar,
  PieChart,
  BarChart3,
  ArrowDownRight,
  Wallet,
  Filter,
  X,
  CreditCard,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Deal, Customer, Patient } from '../types';
import { parse, format, isThisMonth, subMonths, isSameMonth, startOfMonth, endOfMonth, isWithinInterval, addMonths, parseISO, isSameDay, subDays, startOfDay, isSameYear, subYears, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialDashboardProps {
  deals: Deal[];
  customers: Customer[];
  patients?: Patient[];
}

type CashFlowEntry = {
  date: Date;
  value: number;
  dealTitle: string;
  customerName: string;
  type: 'pix_vista' | 'pix_parcelado' | 'card';
  installment?: number;
  totalInstallments?: number;
};

export default function FinancialDashboard({ deals, customers, patients = [] }: FinancialDashboardProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [fixedCosts, setFixedCosts] = useState<number>(() => {
    const saved = localStorage.getItem('fixedCosts');
    return saved ? Number(saved) : 0;
  });
  const [isEditingCosts, setIsEditingCosts] = useState(false);
  const [chartGranularity, setChartGranularity] = useState<'day' | 'month' | 'year'>('month');

  const handleSaveFixedCosts = () => {
    localStorage.setItem('fixedCosts', fixedCosts.toString());
    setIsEditingCosts(false);
  };

  const CARD_TAX_RATE = 0.0349; // 3.49%
  const PIX_PARCELADO_TAX_RATE = 0; // 0% conforme solicitado
  const PIX_VISTA_TAX_RATE = 0; // Pix à vista continua 0%

  const closedDeals = useMemo(() => deals.filter(d => d.stage === 'closed' && d.paymentConfirmed), [deals]);

  // Transformar negócios fechados e pacientes em fluxo de caixa
  const cashFlow = useMemo(() => {
    const entries: CashFlowEntry[] = [];

    // Process Deals
    closedDeals.forEach(deal => {
      const closeDate = parse(deal.expectedCloseDate, 'yyyy-MM-dd', new Date());
      const customer = customers.find(c => c.id === deal.customerId);
      const customerName = customer?.name || 'Desconhecido';

      if (deal.paymentMethod === 'card') {
        const installments = deal.installments || 1;
        const installmentValue = (deal.value / installments) * (1 - CARD_TAX_RATE);
        
        for (let i = 0; i < installments; i++) {
          entries.push({
            date: addMonths(closeDate, i),
            value: installmentValue,
            dealTitle: deal.title,
            customerName,
            type: 'card',
            installment: i + 1,
            totalInstallments: installments
          });
        }
      } else if (deal.paymentMethod === 'pix_parcelado') {
        const installments = deal.installments || 1;
        const installmentValue = (deal.value / installments) * (1 - PIX_PARCELADO_TAX_RATE);
        
        for (let i = 0; i < installments; i++) {
          entries.push({
            date: addMonths(closeDate, i),
            value: installmentValue,
            dealTitle: deal.title,
            customerName,
            type: 'pix_parcelado',
            installment: i + 1,
            totalInstallments: installments
          });
        }
      } else {
        // PIX à Vista - Sem taxa
        entries.push({
          date: closeDate,
          value: deal.value,
          dealTitle: deal.title,
          customerName,
          type: 'pix_vista'
        });
      }
    });

    // Process Patients
    patients.forEach(patient => {
      const startDate = parseISO(patient.startDate);
      const installments = patient.installments;
      const isPixVista = patient.paymentMethod === 'pix' && patient.plan === 'mensal';
      const taxRate = isPixVista ? PIX_VISTA_TAX_RATE : (patient.paymentMethod === 'card' ? CARD_TAX_RATE : PIX_PARCELADO_TAX_RATE);
      const installmentValue = (patient.value / installments) * (1 - taxRate);
      const type = patient.paymentMethod === 'card' ? 'card' : (isPixVista ? 'pix_vista' : 'pix_parcelado');

      for (let i = 0; i < installments; i++) {
        entries.push({
          date: addMonths(startDate, i),
          value: installmentValue,
          dealTitle: `Plano ${patient.plan.charAt(0).toUpperCase() + patient.plan.slice(1)}`,
          customerName: patient.name,
          type: type,
          installment: i + 1,
          totalInstallments: installments
        });
      }
    });

    return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [closedDeals, customers, patients]);

  const filteredCashFlow = useMemo(() => {
    if (!startDate && !endDate) return cashFlow;

    return cashFlow.filter(entry => {
      const start = startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : new Date(0);
      const end = endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : new Date(2100, 0, 1);
      end.setHours(23, 59, 59, 999);

      return isWithinInterval(entry.date, { start, end });
    });
  }, [cashFlow, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalLiquidRevenue = filteredCashFlow.reduce((acc, entry) => acc + entry.value, 0);
    
    const now = new Date();
    const currentMonthLiquidRevenue = cashFlow
      .filter(entry => isThisMonth(entry.date))
      .reduce((acc, entry) => acc + entry.value, 0);

    const lastMonth = subMonths(now, 1);
    const lastMonthLiquidRevenue = cashFlow
      .filter(entry => isSameMonth(entry.date, lastMonth))
      .reduce((acc, entry) => acc + entry.value, 0);

    const growth = lastMonthLiquidRevenue === 0 ? 100 : ((currentMonthLiquidRevenue - lastMonthLiquidRevenue) / lastMonthLiquidRevenue) * 100;

    // Dados para o gráfico baseados na granularidade selecionada
    let chartData = [];
    const today = startOfDay(new Date());

    if (chartGranularity === 'day') {
      // Últimos 30 dias
      chartData = Array.from({ length: 30 }).map((_, i) => {
        const date = addDays(subDays(today, 29), i);
        const label = format(date, 'dd/MM');
        
        const liquidRevenue = cashFlow
          .filter(entry => isSameDay(entry.date, date))
          .reduce((acc, entry) => acc + entry.value, 0);

        const grossRevenue = closedDeals.reduce((acc, deal) => {
          const closeDate = parse(deal.expectedCloseDate, 'yyyy-MM-dd', new Date());
          const installments = deal.installments || 1;
          const installmentValue = deal.value / installments;
          for (let j = 0; j < installments; j++) {
            if (isSameDay(addMonths(closeDate, j), date)) return acc + installmentValue;
          }
          return acc;
        }, 0) + patients.reduce((acc, patient) => {
          const startDate = parseISO(patient.startDate);
          const installments = patient.installments;
          const installmentValue = patient.value / installments;
          for (let j = 0; j < installments; j++) {
            if (isSameDay(addMonths(startDate, j), date)) return acc + installmentValue;
          }
          return acc;
        }, 0);

        return { 
          name: label, 
          grossRevenue,
          liquidRevenue,
          netProfit: liquidRevenue - (fixedCosts / 30) // Custo fixo proporcional diário
        };
      });
    } else if (chartGranularity === 'year') {
      // Últimos 5 anos
      chartData = Array.from({ length: 5 }).map((_, i) => {
        const date = subYears(today, 4 - i);
        const label = format(date, 'yyyy');
        
        const liquidRevenue = cashFlow
          .filter(entry => isSameYear(entry.date, date))
          .reduce((acc, entry) => acc + entry.value, 0);

        const grossRevenue = closedDeals.reduce((acc, deal) => {
          const closeDate = parse(deal.expectedCloseDate, 'yyyy-MM-dd', new Date());
          const installments = deal.installments || 1;
          const installmentValue = deal.value / installments;
          for (let j = 0; j < installments; j++) {
            if (isSameYear(addMonths(closeDate, j), date)) return acc + installmentValue;
          }
          return acc;
        }, 0) + patients.reduce((acc, patient) => {
          const startDate = parseISO(patient.startDate);
          const installments = patient.installments;
          const installmentValue = patient.value / installments;
          for (let j = 0; j < installments; j++) {
            if (isSameYear(addMonths(startDate, j), date)) return acc + installmentValue;
          }
          return acc;
        }, 0);

        return { 
          name: label, 
          grossRevenue,
          liquidRevenue,
          netProfit: liquidRevenue - (fixedCosts * 12) // Custo fixo anual
        };
      });
    } else {
      // Mensal - Próximos 6 meses (comportamento original expandido para 12 meses para melhor visão)
      chartData = Array.from({ length: 12 }).map((_, i) => {
        const date = addMonths(startOfMonth(now), i - 3); // 3 meses atrás até 9 meses à frente
        const monthLabel = format(date, 'MMM', { locale: ptBR });
        
        const liquidRevenue = cashFlow
          .filter(entry => isSameMonth(entry.date, date))
          .reduce((acc, entry) => acc + entry.value, 0);

        // Faturamento Bruto (sem descontar taxas)
        const dealsGrossRevenue = closedDeals.reduce((acc, deal) => {
          const closeDate = parse(deal.expectedCloseDate, 'yyyy-MM-dd', new Date());
          const installments = deal.installments || 1;
          const installmentValue = deal.value / installments;
          
          let monthTotal = 0;
          for (let j = 0; j < installments; j++) {
            if (isSameMonth(addMonths(closeDate, j), date)) {
              monthTotal += installmentValue;
            }
          }
          return acc + monthTotal;
        }, 0);

        const patientsGrossRevenue = patients.reduce((acc, patient) => {
          const startDate = parseISO(patient.startDate);
          const installments = patient.installments;
          const installmentValue = patient.value / installments;
          
          let monthTotal = 0;
          for (let j = 0; j < installments; j++) {
            if (isSameMonth(addMonths(startDate, j), date)) {
              monthTotal += installmentValue;
            }
          }
          return acc + monthTotal;
        }, 0);

        const grossRevenue = dealsGrossRevenue + patientsGrossRevenue;
        
        return { 
          name: monthLabel, 
          grossRevenue,
          liquidRevenue,
          netProfit: liquidRevenue - fixedCosts
        };
      });
    }

    const totalLeads = customers.filter(c => c.status === 'Lead').length;
    const totalContacts = customers.reduce((acc, c) => acc + (c.historico_contatos?.length || 0), 0);

    return {
      totalRevenue: totalLiquidRevenue,
      currentMonthRevenue: currentMonthLiquidRevenue,
      currentMonthNetProfit: currentMonthLiquidRevenue - fixedCosts,
      growth,
      chartData,
      entriesCount: filteredCashFlow.length,
      totalLeads,
      totalContacts
    };
  }, [filteredCashFlow, cashFlow, fixedCosts, closedDeals, customers, chartGranularity, patients]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const setQuickFilter = (type: 'day' | 'month' | 'year') => {
    const now = new Date();
    let start: Date, end: Date;

    if (type === 'day') {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
    } else if (type === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const stats = [
    { 
      label: 'Projeção de Lucro (Mês)', 
      value: formatCurrency(metrics.currentMonthNetProfit), 
      change: `Após R$ ${fixedCosts} de custos fixos`,
      isPositive: metrics.currentMonthNetProfit >= 0,
      icon: TrendingUp, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-400/10' 
    },
    { 
      label: 'Total de Leads Novos', 
      value: metrics.totalLeads.toString(), 
      change: 'Aguardando conversão',
      isPositive: true,
      icon: Zap, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Contatos Realizados', 
      value: metrics.totalContacts.toString(), 
      change: 'Histórico acumulado',
      isPositive: true,
      icon: Calendar, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10' 
    },
    { 
      label: 'Custos Fixos Mensais', 
      value: formatCurrency(fixedCosts), 
      change: 'Clique para editar',
      onClick: () => setIsEditingCosts(true),
      icon: ArrowDownRight, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10' 
    },
  ];

  const gradientOffset = () => {
    const dataMax = Math.max(...metrics.chartData.map((i) => i.netProfit));
    const dataMin = Math.min(...metrics.chartData.map((i) => i.netProfit));
  
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
  
    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Fluxo de Caixa (Líquido)</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-zinc-400 text-sm">Valores reais após taxas e custos fixos.</p>
            {(startDate || endDate) && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-500/20">
                {startDate === endDate 
                  ? format(parse(startDate, 'yyyy-MM-dd', new Date()), "EEEE, dd 'de' MMMM", { locale: ptBR })
                  : 'Período Personalizado'
                }
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button 
              onClick={() => setQuickFilter('day')}
              className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all uppercase"
            >
              Hoje
            </button>
            <button 
              onClick={() => setQuickFilter('month')}
              className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all uppercase"
            >
              Mês
            </button>
            <button 
              onClick={() => setQuickFilter('year')}
              className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all uppercase"
            >
              Ano
            </button>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl shadow-inner">
            <div className="flex items-center gap-2 px-2 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">DE</span>
              <input 
                type="date" 
                className="bg-transparent border-none text-xs text-white font-bold outline-none cursor-pointer [color-scheme:dark]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar size={12} className="text-zinc-600" />
            </div>
            
            <div className="flex items-center gap-2 px-2 py-1 bg-zinc-950/50 rounded-lg border border-zinc-800">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">ATÉ</span>
              <input 
                type="date" 
                className="bg-transparent border-none text-xs text-white font-bold outline-none cursor-pointer [color-scheme:dark]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar size={12} className="text-zinc-600" />
            </div>

            {(startDate || endDate) && (
              <button 
                onClick={clearFilters}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-all border border-transparent hover:border-zinc-700"
                title="Limpar Filtros"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditingCosts && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Editar Custos Fixos</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Valor Mensal (R$)</label>
                <input 
                  type="number"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                />
              </div>
              <button 
                onClick={handleSaveFixedCosts}
                className="w-full py-2.5 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                Salvar Custos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.onClick}
            className={`bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group ${stat.onClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              {stat.isPositive !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              )}
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Fluxo de Recebimento (Bruto) */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" />
                Fluxo de Recebimento (Bruto)
              </h3>
              <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg border border-zinc-700">
                {(['day', 'month', 'year'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartGranularity(mode)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase ${
                      chartGranularity === mode 
                        ? 'bg-emerald-500 text-black' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {mode === 'day' ? 'Dia' : mode === 'month' ? 'Mês' : 'Ano'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento Bruto']}
                  />
                  <Bar dataKey="grossRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Análise de Lucro Líquido */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" />
                Análise de Lucro Líquido
              </h3>
              <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg border border-zinc-700">
                {(['day', 'month', 'year'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartGranularity(mode)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase ${
                      chartGranularity === mode 
                        ? 'bg-emerald-500 text-black' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {mode === 'day' ? 'Dia' : mode === 'month' ? 'Mês' : 'Ano'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset={off} stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset={off} stopColor="#ef4444" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                      <stop offset={off} stopColor="#10b981" stopOpacity={1} />
                      <stop offset={off} stopColor="#ef4444" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    formatter={(value: number, name: string) => [
                      <span className={value < 0 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{formatCurrency(value)}</span>, 
                      name === 'liquidRevenue' ? 'Faturamento Líquido' : 'Lucro Real'
                    ]}
                  />
                  <Area type="monotone" dataKey="netProfit" stroke="url(#splitStroke)" fillOpacity={1} fill="url(#splitColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Lançamentos Futuros */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Lançamentos por Mês
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {filteredCashFlow.length > 0 ? (
              filteredCashFlow.slice(0, 15).map((entry, idx) => (
                <div key={idx} className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {entry.type.startsWith('pix') ? (
                        <Zap size={14} className="text-yellow-500" />
                      ) : (
                        <CreditCard size={14} className="text-blue-500" />
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${entry.type.startsWith('pix') ? 'text-yellow-500' : 'text-blue-500'}`}>
                        {entry.type === 'pix_vista' ? 'PIX À VISTA' : entry.type === 'pix_parcelado' ? `PIX ${entry.installment}/${entry.totalInstallments}` : `Cartão ${entry.installment}/${entry.totalInstallments}`}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 font-medium">
                      {format(entry.date, "EEE, dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{entry.dealTitle}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{entry.customerName}</p>
                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Valor Líquido</span>
                      <span className="text-sm font-bold text-emerald-400">{formatCurrency(entry.value)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-900/50 p-1.5 rounded-lg">
                      <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Lucro Real Aprox.</span>
                      <span className="text-xs font-bold text-emerald-500">
                        {formatCurrency(entry.value - (entry.value * (entry.type === 'card' ? 0.0349 : 0)))}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="text-zinc-600" size={24} />
                </div>
                <p className="text-sm text-zinc-500 italic">Nenhum lançamento encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
