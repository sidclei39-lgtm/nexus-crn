import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2,
  Filter,
  Download,
  X,
  Instagram,
  Calendar,
  ArrowUpDown,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Customer, CustomerStatus, Interaction, Deal, DealStage, Task } from '../types';

export const initialCustomers: Customer[] = [
  { id: '1', name: 'Fabio dropshing', instagramUrl: 'https://surl.li/bgroia', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '13/02/2026', ultimoContato: '13/02/2026', status: 'Não (sem resp.)', cadenciaDias: 3, proxContato: '16/02/2026', contatado: 'Sim', diasProximoContato: -10, email: '', phone: '', company: '', createdAt: '2026-02-13' },
  { id: '2', name: 'Vanessa', instagramUrl: 'https://www.instagram.com/nessa.lima24', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '13/02/2026', ultimoContato: '13/02/2026', status: 'Não (sem resp.)', cadenciaDias: 3, proxContato: '16/02/2026', contatado: 'Sim', diasProximoContato: -10, email: '', phone: '', company: '', createdAt: '2026-02-13' },
  { id: '3', name: 'rafaela aquino', instagramUrl: 'https://www.instagram.com/rafaela__aquino77', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Lead', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '4', name: 'Maria laura', instagramUrl: 'https://www.instagram.com/marialaurabt07', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Lead', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, observacoes: 'Ficou de conversar com o Marido', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '5', name: 'Vanessinha', instagramUrl: 'https://www.instagram.com/vanessinha_am', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '18/02/2026', ultimoContato: '18/02/2026', status: 'Não (sem resp.)', cadenciaDias: 3, proxContato: '21/02/2026', diasProximoContato: -5, email: '', phone: '', company: '', createdAt: '2026-02-18' },
  { id: '6', name: 'Fernanda Moura', instagramUrl: 'https://www.instagram.com/f3rmour4', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Não (sem resp.)', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '7', name: 'bylisinails', instagramUrl: 'https://www.instagram.com/bylisinails', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Não (sem resp.)', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '8', name: 'Rute Costa', instagramUrl: 'https://www.instagram.com/rute_cost4_', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Não (sem resp.)', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '9', name: 'adroaldo neto', instagramUrl: 'https://www.instagram.com/adroaldoneto_', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Lead', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '10', name: 'Ju Soares', instagramUrl: 'https://www.instagram.com/ju_soares11', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Não (sem resp.)', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '11', name: 'Natali Santos', instagramUrl: 'https://www.instagram.com/nathallysantoss_', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '24/02/2026', ultimoContato: '24/02/2026', status: 'Follow up', cadenciaDias: 7, proxContato: '03/03/2026', contatado: 'Sim', pacote: 'Trimestral', valor: 'R$ 600,00', diasProximoContato: 5, observacoes: 'Mandei mensagem agora pra ela,tanto no whathsaph e no insta', email: '', phone: '', company: '', createdAt: '2026-02-24' },
  { id: '12', name: 'deise rebouças', instagramUrl: 'https://www.instagram.com/deisereboucas', origem: 'Instagram', objetivo: 'Hipertrofia', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Agendou', cadenciaDias: 7, proxContato: '26/02/2026', diasProximoContato: 0, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '13', name: 'Henry Lima', instagramUrl: 'https://www.instagram.com/henry_lima14', origem: 'Instagram', objetivo: 'Saúde', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Lead', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '14', name: 'barilanny_5756', instagramUrl: 'https://www.instagram.com/barilanny_5756', origem: 'Instagram', objetivo: 'Saúde', primeiroContato: '19/02/2026', ultimoContato: '19/02/2026', status: 'Lead', cadenciaDias: 3, proxContato: '22/02/2026', diasProximoContato: -4, email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '15', name: 'gabriela.c.a7', instagramUrl: 'https://www.instagram.com/gabriela.c.a7', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '16', name: 'erick de moraes', instagramUrl: 'https://www.instagram.com/erickdemoraes_', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '17', name: 'gil', instagramUrl: 'https://www.instagram.com/gil_professor28', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '18', name: 'Marlon wallas', instagramUrl: 'https://www.instagram.com/marllonwallas', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '19', name: 'Guilherme bossoni', instagramUrl: 'https://www.instagram.com/gui_bossoni', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '20', name: 'fabiola nogueira', instagramUrl: 'https://www.instagram.com/fabiolanogueira.s', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '21', name: 'valeria macedo', instagramUrl: 'https://www.instagram.com/val3ria_macedo', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '22', name: 'douglas nairon', instagramUrl: 'https://www.instagram.com/douglas_nairon', origem: 'Instagram', status: '', email: '', phone: '', company: '', createdAt: '2026-02-19' },
  { id: '23', name: 'Thais(follow up infinito)', instagramUrl: 'https://w.app/thais2', origem: 'Indicação', objetivo: 'Emagrecimento', primeiroContato: '09/01/2026', ultimoContato: '13/02/2026', status: 'Lead', cadenciaDias: 7, proxContato: '20/02/2026', contatado: 'Sim', diasProximoContato: -6, observacoes: 'Estar no follow up infinito', email: '', phone: '', company: '', createdAt: '2026-01-09' },
  { id: '24', name: 'Ranna', instagramUrl: 'https://w.app/ranna', origem: 'Indicação', objetivo: 'Emagrecimento', primeiroContato: '05/01/2026', ultimoContato: '13/02/2026', status: 'Não (sem resp.)', cadenciaDias: 7, proxContato: '20/02/2026', contatado: 'Sim', pacote: 'Semestral', diasProximoContato: -6, observacoes: 'Entrei em contato 5x sem resposta,então não vou colocar na minha lista de lead,vou encerrar o contato', email: '', phone: '', company: '', createdAt: '2026-01-05' },
  { id: '25', name: 'topera(follow up infinito)', instagramUrl: 'https://w.app/topera', origem: 'Instagram', objetivo: 'Emagrecimento', primeiroContato: '26/01/2026', ultimoContato: '13/02/2026', status: 'Lead', cadenciaDias: 7, proxContato: '20/02/2026', contatado: 'Sim', diasProximoContato: -6, observacoes: 'Estar no follow up infinito', email: '', phone: '', company: '', createdAt: '2026-01-26' },
  { id: '26', name: 'Milena', instagramUrl: 'https://w.app/milenafaria', origem: 'Indicação', objetivo: 'Emagrecimento', primeiroContato: '13/01/2026', ultimoContato: '13/02/2026', status: 'Não (sem resp.)', cadenciaDias: 7, proxContato: '20/02/2026', contatado: 'Sim', diasProximoContato: -6, observacoes: 'Entrei em contato 5x sem resposta,então não vou colocar na minha lista de lead,vou encerrar o contato', email: '', phone: '', company: '', createdAt: '2026-01-13' },
];

interface CRMProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function CRM({ customers, setCustomers, deals, setDeals, tasks, setTasks }: CRMProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContact, setFilterContact] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<keyof Customer | 'diasProximoContato'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [newInteraction, setNewInteraction] = useState('');
  const [showNewInteraction, setShowNewInteraction] = useState(false);
  const [newInteractionData, setNewInteractionData] = useState({
    dataContato: '',
    cadencia: '',
    contatado: 'Sim',
    proxContato: '',
    observacao: ''
  });
  const [editingInteractionId, setEditingInteractionId] = useState<string | null>(null);
  const [editingInteractionData, setEditingInteractionData] = useState({
    data: '',
    observacao: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer> & { funnelStage?: DealStage | '', lembreteData?: string, lembreteHora?: string }>({
    name: '',
    instagramUrl: '',
    origem: 'Instagram',
    objetivo: '',
    status: 'Lead',
    email: '',
    phone: '',
    company: '',
    dataPgto: '',
    primeiroContato: '',
    ultimoContato: '',
    cadenciaDias: 3,
    proxContato: '',
    contatado: 'Não',
    pacote: '',
    valor: '',
    diasProximoContato: 0,
    conversao: '',
    observacoes: '',
    funnelStage: '',
    lembreteData: '',
    lembreteHora: ''
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.objetivo && c.objetivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.status && c.status.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const contactCount = c.historico_contatos?.length || 0;
    const matchesContact = filterContact === 'all' || 
      (filterContact === '5+' ? contactCount >= 5 : contactCount.toString() === filterContact);

    return matchesSearch && matchesContact;
  });

  const handleSort = (column: keyof Customer | 'diasProximoContato') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];

    if (valA === undefined) valA = '';
    if (valB === undefined) valB = '';

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const calculateDiasProximoContato = (proxContato: string | undefined): number => {
    if (!proxContato) return 0;
    
    // Parse the date string (assuming YYYY-MM-DD format from input type="date")
    // or DD/MM/YYYY format from initial data
    let targetDate: Date;
    
    if (proxContato.includes('/')) {
      const [day, month, year] = proxContato.split('/');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      targetDate = new Date(proxContato);
      // Adjust for timezone offset to ensure we compare local dates correctly
      targetDate.setMinutes(targetDate.getMinutes() + targetDate.getTimezoneOffset());
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    const calculatedDias = calculateDiasProximoContato(newCustomer.proxContato);
    
    if (editingCustomerId) {
      const updatedCustomer: Customer = {
        ...(customers.find(c => c.id === editingCustomerId) as Customer),
        name: newCustomer.name || '',
        instagramUrl: newCustomer.instagramUrl || '',
        origem: newCustomer.origem || 'Instagram',
        objetivo: newCustomer.objetivo || '',
        status: (newCustomer.status as CustomerStatus) || 'Lead',
        email: newCustomer.email || '',
        phone: newCustomer.phone || '',
        company: newCustomer.company || '',
        dataPgto: newCustomer.dataPgto || '',
        primeiroContato: newCustomer.primeiroContato || '',
        ultimoContato: newCustomer.ultimoContato || '',
        cadenciaDias: newCustomer.cadenciaDias || 3,
        proxContato: newCustomer.proxContato || '',
        contatado: newCustomer.contatado || 'Não',
        pacote: newCustomer.pacote || '',
        valor: newCustomer.valor || '',
        diasProximoContato: calculatedDias,
        conversao: newCustomer.conversao || '',
        observacoes: newCustomer.observacoes || '',
      };
      
      setCustomers(customers.map(c => c.id === editingCustomerId ? updatedCustomer : c));

      // Update existing deal if funnelStage is selected
      if (newCustomer.funnelStage) {
        const existingDeal = deals.find(d => d.customerId === editingCustomerId);
        if (existingDeal) {
          setDeals(deals.map(d => d.id === existingDeal.id ? { ...d, stage: newCustomer.funnelStage as DealStage } : d));
        } else {
          // Create new deal if it doesn't exist
          const newDeal: Deal = {
            id: Math.random().toString(36).substr(2, 9),
            title: `Negócio - ${updatedCustomer.name}`,
            customerId: updatedCustomer.id,
            value: Number(updatedCustomer.valor?.replace(/[^0-9.-]+/g,"")) || 0,
            stage: newCustomer.funnelStage as DealStage,
            probability: 50,
            expectedCloseDate: new Date().toISOString().split('T')[0],
          };
          setDeals([newDeal, ...deals]);
        }
      }
      if (newCustomer.lembreteData && newCustomer.lembreteHora) {
        const startDateTime = new Date(`${newCustomer.lembreteData}T${newCustomer.lembreteHora}`).toISOString();
        const newTask: Task = {
          id: Math.random().toString(36).substr(2, 9),
          title: `Follow-up: ${updatedCustomer.name}`,
          description: `Lembrete de follow-up para o lead ${updatedCustomer.name}`,
          date: startDateTime,
          completed: false,
          customerId: updatedCustomer.id
        };
        setTasks([...tasks, newTask]);
      }
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const customer: Customer = {
        id: newId,
        name: newCustomer.name || '',
        instagramUrl: newCustomer.instagramUrl || '',
        origem: newCustomer.origem || 'Instagram',
        objetivo: newCustomer.objetivo || '',
        status: (newCustomer.status as CustomerStatus) || 'Lead',
        email: newCustomer.email || '',
        phone: newCustomer.phone || '',
        company: newCustomer.company || '',
        dataPgto: newCustomer.dataPgto || '',
        primeiroContato: newCustomer.primeiroContato || '',
        ultimoContato: newCustomer.ultimoContato || '',
        cadenciaDias: newCustomer.cadenciaDias || 3,
        proxContato: newCustomer.proxContato || '',
        contatado: newCustomer.contatado || 'Não',
        pacote: newCustomer.pacote || '',
        valor: newCustomer.valor || '',
        diasProximoContato: calculatedDias,
        conversao: newCustomer.conversao || '',
        observacoes: newCustomer.observacoes || '',
        interactions: [],
        createdAt: new Date().toISOString()
      };

      setCustomers([customer, ...customers]);

      if (newCustomer.funnelStage) {
        const newDeal: Deal = {
          id: Math.random().toString(36).substr(2, 9),
          title: `Negócio - ${customer.name}`,
          customerId: customer.id,
          value: Number(customer.valor?.replace(/[^0-9.-]+/g,"")) || 0,
          stage: newCustomer.funnelStage as DealStage,
          probability: 50,
          expectedCloseDate: new Date().toISOString().split('T')[0],
        };
        setDeals([newDeal, ...deals]);
      }
      if (newCustomer.lembreteData && newCustomer.lembreteHora) {
        const startDateTime = new Date(`${newCustomer.lembreteData}T${newCustomer.lembreteHora}`).toISOString();
        const newTask: Task = {
          id: Math.random().toString(36).substr(2, 9),
          title: `Follow-up: ${customer.name}`,
          description: `Lembrete de follow-up para o lead ${customer.name}`,
          date: startDateTime,
          completed: false,
          customerId: customer.id
        };
        setTasks([...tasks, newTask]);
      }
    }
    
    setIsModalOpen(false);
    setEditingCustomerId(null);
    setNewCustomer({
      name: '',
      instagramUrl: '',
      origem: 'Instagram',
      objetivo: '',
      status: 'Lead',
      email: '',
      phone: '',
      company: '',
      dataPgto: '',
      primeiroContato: '',
      ultimoContato: '',
      cadenciaDias: 3,
      proxContato: '',
      contatado: 'Não',
      pacote: '',
      valor: '',
      diasProximoContato: 0,
      conversao: '',
      observacoes: '',
      funnelStage: '',
      lembreteData: '',
      lembreteHora: ''
    });
  };

  const handleAddInteraction = () => {
    if (!selectedCustomer || !newInteractionData.observacao.trim()) return;

    const historico = selectedCustomer.historico_contatos || [];
    const count = historico.length + 1;
    const now = new Date();
    
    // Formata a data e hora: DD/MM/AAAA HH:mm
    const dataFormatada = now.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    const interaction: Interaction = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: `Contato ${count}`,
      data: dataFormatada,
      observacao: newInteractionData.observacao.trim(),
      tipo_contato: `Contato ${count}`
    };
    
    // Calcula diasProximoContato
    let diasProximoContato = selectedCustomer.diasProximoContato;
    if (newInteractionData.proxContato) {
      const parts = newInteractionData.proxContato.split('/');
      if (parts.length === 3) {
        const proxDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = proxDate.getTime() - today.getTime();
        diasProximoContato = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    const updatedCustomer = {
      ...selectedCustomer,
      ultimoContato: newInteractionData.dataContato || selectedCustomer.ultimoContato,
      cadenciaDias: parseInt(newInteractionData.cadencia) || selectedCustomer.cadenciaDias,
      contatado: newInteractionData.contatado || selectedCustomer.contatado,
      proxContato: newInteractionData.proxContato || selectedCustomer.proxContato,
      diasProximoContato: diasProximoContato,
      historico_contatos: [interaction, ...historico] // Adiciona no início para ordem decrescente
    };

    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
    setNewInteractionData({
      dataContato: '',
      cadencia: '',
      contatado: 'Sim',
      proxContato: '',
      observacao: ''
    });
  };

  const handleOpenNewInteraction = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    
    // Tenta calcular cadência baseada no último contato
    let cadenciaCalculada = '';
    if (selectedCustomer?.ultimoContato) {
      const parts = selectedCustomer.ultimoContato.split('/');
      if (parts.length === 3) {
        const lastDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = now.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
          cadenciaCalculada = diffDays.toString();
        }
      }
    }

    setNewInteractionData({
      dataContato: today,
      cadencia: cadenciaCalculada,
      contatado: 'Sim',
      proxContato: '',
      observacao: ''
    });
    setShowNewInteraction(true);
  };

  const handleSaveInteractionEdit = (interactionId: string) => {
    if (!selectedCustomer) return;

    const updatedHistorico = selectedCustomer.historico_contatos?.map(interaction => {
      if (interaction.id === interactionId) {
        return {
          ...interaction,
          data: editingInteractionData.data,
          observacao: editingInteractionData.observacao
        };
      }
      return interaction;
    });

    const updatedCustomer = {
      ...selectedCustomer,
      historico_contatos: updatedHistorico
    };

    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
    setEditingInteractionId(null);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    setSelectedCustomer(null);
    setShowDeleteConfirm(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Lead': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Follow up': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Agendou': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Não (sem resp.)': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Leads</h2>
          <p className="text-zinc-400">Gerencie sua base de contatos, origens e acompanhamentos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700">
            <Download size={18} />
            Exportar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
          >
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome, objetivo ou status..."
              className="w-full bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-zinc-200 focus:ring-1 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterContact}
              onChange={(e) => setFilterContact(e.target.value)}
              className="bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">Todos os Contatos</option>
              <option value="0">Sem Contato</option>
              <option value="1">Contato 1</option>
              <option value="2">Contato 2</option>
              <option value="3">Contato 3</option>
              <option value="4">Contato 4</option>
              <option value="5+">Contato 5+</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white transition-colors">
              <Filter size={18} />
              Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Lead <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('origem')}>
                  <div className="flex items-center gap-2">Origem / Objetivo <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('ultimoContato')}>
                  <div className="flex items-center gap-2">Acompanhamento <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('proxContato')}>
                  <div className="flex items-center gap-2">Próximo Contato <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('valor')}>
                  <div className="flex items-center gap-2">Valor <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ação</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedCustomers.map((customer) => {
                const isUrgent = customer.diasProximoContato !== undefined && customer.diasProximoContato <= 0 && (customer.status === 'Lead' || customer.status === 'Follow up');
                
                return (
                <tr 
                  key={customer.id} 
                  className={`transition-colors group cursor-pointer ${isUrgent ? 'bg-red-500/5 hover:bg-red-500/10 border-l-2 border-l-red-500' : 'hover:bg-zinc-800/50'}`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${isUrgent ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-zinc-800 text-emerald-500 border-zinc-700'}`}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{customer.name}</p>
                          {isUrgent && <AlertCircle size={14} className="text-red-500" />}
                        </div>
                        {customer.instagramUrl && (
                          <a href={customer.instagramUrl} target="_blank" rel="noreferrer" className="text-zinc-500 text-xs hover:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Instagram size={12} />
                            Instagram/Contato
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-zinc-300">{customer.origem || '-'}</div>
                      <div className="text-xs text-zinc-500">{customer.objetivo || '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-xs text-zinc-400">
                        Último: {customer.ultimoContato || '-'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Cadência: {customer.cadenciaDias ? `${customer.cadenciaDias} dias` : '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Calendar size={14} />
                        {customer.proxContato || '-'}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-zinc-500">
                          Dias: <span className={customer.diasProximoContato !== undefined && customer.diasProximoContato <= 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{customer.diasProximoContato ?? '-'}</span>
                        </div>
                        {customer.diasProximoContato !== undefined && customer.diasProximoContato <= 0 && (customer.status === 'Lead' || customer.status === 'Follow up') && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 w-fit">
                            ATRASADO {Math.abs(customer.diasProximoContato)} DIAS
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                      {customer.status || 'Novo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-300">{customer.valor || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {isUrgent ? (
                      <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-md flex items-center gap-1 w-fit">
                        <AlertCircle size={12} />
                        Contato Imediato
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerToDelete(customer.id);
                        }}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Excluir Lead"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-500">
          <p>Mostrando {sortedCustomers.length} de {customers.length} leads</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 rounded border border-zinc-800 hover:bg-zinc-800">Próxima</button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal for Table */}
      {customerToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 mx-auto">
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Excluir Lead</h3>
            <p className="text-zinc-400 text-center mb-6">
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 px-4 py-2 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  handleDeleteCustomer(customerToDelete);
                  setCustomerToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingCustomerId ? 'Editar Lead' : 'Novo Lead'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCustomerId(null);
                  setNewCustomer({
                    name: '',
                    instagramUrl: '',
                    origem: 'Instagram',
                    objetivo: '',
                    status: 'Lead',
                    email: '',
                    phone: '',
                    company: '',
                    dataPgto: '',
                    primeiroContato: '',
                    ultimoContato: '',
                    cadenciaDias: 3,
                    proxContato: '',
                    contatado: 'Não',
                    pacote: '',
                    valor: '',
                    diasProximoContato: 0,
                    conversao: '',
                    observacoes: ''
                  });
                }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Informações Básicas</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Nome do Lead</label>
                  <input 
                    required
                    type="text"
                    placeholder="Ex: João Silva"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Instagram / Link Contato</label>
                  <input 
                    type="text"
                    placeholder="https://instagram.com/..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    value={newCustomer.instagramUrl}
                    onChange={(e) => setNewCustomer({ ...newCustomer, instagramUrl: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Origem</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={newCustomer.origem}
                      onChange={(e) => setNewCustomer({ ...newCustomer, origem: e.target.value })}
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Indicação">Indicação</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Objetivo</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={newCustomer.objetivo}
                      onChange={(e) => setNewCustomer({ ...newCustomer, objetivo: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      <option value="Emagrecimento">Emagrecimento</option>
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Saúde">Saúde</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Acompanhamento */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Acompanhamento</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Status</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={newCustomer.status}
                      onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value as CustomerStatus })}
                    >
                      <option value="Lead">Lead</option>
                      <option value="Follow up">Follow up</option>
                      <option value="Agendou">Agendou</option>
                      <option value="Não (sem resp.)">Não (sem resp.)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Etapa do Funil</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={newCustomer.funnelStage || ''}
                      onChange={(e) => setNewCustomer({ ...newCustomer, funnelStage: e.target.value as DealStage | '' })}
                    >
                      <option value="">Não adicionar ao funil</option>
                      <option value="lead">Prospecção</option>
                      <option value="contact">Contato</option>
                      <option value="proposal">Proposta</option>
                      <option value="negotiation">Negociação</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Contatado?</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={newCustomer.contatado}
                      onChange={(e) => setNewCustomer({ ...newCustomer, contatado: e.target.value })}
                    >
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">1° Contato</label>
                    <input 
                      type="date"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.primeiroContato}
                      onChange={(e) => setNewCustomer({ ...newCustomer, primeiroContato: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Último Contato</label>
                    <input 
                      type="date"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.ultimoContato}
                      onChange={(e) => setNewCustomer({ ...newCustomer, ultimoContato: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Cadência (dias)</label>
                    <input 
                      type="number"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.cadenciaDias}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cadenciaDias: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Próx. Contato</label>
                    <input 
                      type="date"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.proxContato}
                      onChange={(e) => setNewCustomer({ ...newCustomer, proxContato: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Dias Próx.</label>
                    <input 
                      type="number"
                      className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 outline-none transition-all ${calculateDiasProximoContato(newCustomer.proxContato) < 0 ? 'text-red-500 font-bold' : 'text-white'}`}
                      value={calculateDiasProximoContato(newCustomer.proxContato)}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Definir Lembrete (Data)</label>
                    <input 
                      type="date"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.lembreteData}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lembreteData: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Hora do Lembrete</label>
                    <input 
                      type="time"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.lembreteHora}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lembreteHora: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Venda */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Venda</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Data Pgto</label>
                    <input 
                      type="date"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.dataPgto}
                      onChange={(e) => setNewCustomer({ ...newCustomer, dataPgto: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Conversão</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={newCustomer.conversao}
                      onChange={(e) => setNewCustomer({ ...newCustomer, conversao: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Pacote / Plano</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                      value={newCustomer.pacote}
                      onChange={(e) => setNewCustomer({ ...newCustomer, pacote: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      <option value="Plano Mensal">Plano Mensal</option>
                      <option value="Plano Trimestral">Plano Trimestral</option>
                      <option value="Plano Semestral">Plano Semestral</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Valor</label>
                    <input 
                      type="text"
                      placeholder="R$ 0,00"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={newCustomer.valor}
                      onChange={(e) => setNewCustomer({ ...newCustomer, valor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Observações</label>
                  <textarea 
                    rows={3}
                    placeholder="Anotações sobre o lead..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                    value={newCustomer.observacoes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, observacoes: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-zinc-950 pb-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCustomerId(null);
                    setNewCustomer({
                      name: '',
                      instagramUrl: '',
                      origem: 'Instagram',
                      objetivo: '',
                      status: 'Lead',
                      email: '',
                      phone: '',
                      company: '',
                      dataPgto: '',
                      primeiroContato: '',
                      ultimoContato: '',
                      cadenciaDias: 3,
                      proxContato: '',
                      contatado: 'Não',
                      pacote: '',
                      valor: '',
                      diasProximoContato: 0,
                      conversao: '',
                      observacoes: ''
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 text-zinc-400 font-semibold rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  {editingCustomerId ? 'Salvar Alterações' : 'Adicionar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Side Drawer Detalhes do Lead */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border-l border-zinc-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/95 backdrop-blur z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-500 font-bold border border-zinc-700 text-xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <input 
                    type="text"
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                    className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 outline-none px-1 -ml-1 transition-colors"
                  />
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      value={selectedCustomer.status}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, status: e.target.value as CustomerStatus})}
                      className={`text-xs font-medium border rounded-full px-2.5 py-0.5 outline-none appearance-none cursor-pointer ${getStatusColor(selectedCustomer.status)}`}
                    >
                      <option value="Lead" className="bg-zinc-900 text-white">Lead</option>
                      <option value="Follow up" className="bg-zinc-900 text-white">Follow up</option>
                      <option value="Agendou" className="bg-zinc-900 text-white">Agendou</option>
                      <option value="Não (sem resp.)" className="bg-zinc-900 text-white">Não (sem resp.)</option>
                      <option value="active" className="bg-zinc-900 text-white">Ativo</option>
                      <option value="inactive" className="bg-zinc-900 text-white">Inativo</option>
                    </select>
                    {selectedCustomer.diasProximoContato !== undefined && selectedCustomer.diasProximoContato <= 0 && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        ATRASADO {Math.abs(selectedCustomer.diasProximoContato)} DIAS
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-900 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
              {/* Informações Básicas */}
              <div>
                <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Origem</p>
                    <input 
                      type="text"
                      value={selectedCustomer.origem || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, origem: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Ex: Instagram"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Objetivo</p>
                    <input 
                      type="text"
                      value={selectedCustomer.objetivo || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, objetivo: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Ex: Emagrecimento"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Instagram / Contato</p>
                    <input 
                      type="text"
                      value={selectedCustomer.instagramUrl || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, instagramUrl: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Link ou @usuario"
                    />
                    {selectedCustomer.instagramUrl && (
                      <a href={selectedCustomer.instagramUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-1">
                        <Instagram size={12} />
                        Acessar Link
                      </a>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Data de Criação</p>
                    <p className="text-sm text-zinc-200 px-3 py-1.5">{new Date(selectedCustomer.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              {/* Histórico de Contatos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-emerald-500 uppercase tracking-wider">Histórico de Contatos</h4>
                  <button 
                    onClick={handleOpenNewInteraction}
                    className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1.5 rounded-lg transition-colors hover:bg-emerald-500/20"
                  >
                    <Plus size={14} /> Novo Contato
                  </button>
                </div>
                
                <div className="bg-[#131315] rounded-xl border border-zinc-800/80 p-5 mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1.5">1° Contato</p>
                      <input 
                        type="text"
                        value={selectedCustomer.primeiroContato || ''}
                        onChange={(e) => setSelectedCustomer({...selectedCustomer, primeiroContato: e.target.value})}
                        className="w-full bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 px-1 py-0.5 text-base text-white font-bold outline-none transition-colors -ml-1"
                        placeholder="DD/MM/AAAA"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1.5">Último Contato</p>
                      <input 
                        type="text"
                        value={selectedCustomer.ultimoContato || ''}
                        onChange={(e) => setSelectedCustomer({...selectedCustomer, ultimoContato: e.target.value})}
                        className="w-full bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 px-1 py-0.5 text-base text-white font-bold outline-none transition-colors -ml-1"
                        placeholder="DD/MM/AAAA"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1.5">Cadência (dias)</p>
                      <input 
                        type="number"
                        value={selectedCustomer.cadenciaDias || ''}
                        onChange={(e) => setSelectedCustomer({...selectedCustomer, cadenciaDias: parseInt(e.target.value) || 0})}
                        className="w-full bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 px-1 py-0.5 text-base text-white font-bold outline-none transition-colors -ml-1"
                        placeholder="Ex: 3"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1.5">Contatado?</p>
                      <select 
                        value={selectedCustomer.contatado || ''}
                        onChange={(e) => setSelectedCustomer({...selectedCustomer, contatado: e.target.value})}
                        className="w-full bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 px-1 py-0.5 text-base text-white font-bold outline-none transition-colors appearance-none cursor-pointer -ml-1"
                      >
                        <option value="" className="bg-zinc-900 text-base font-normal">-</option>
                        <option value="Sim" className="bg-zinc-900 text-base font-normal">Sim</option>
                        <option value="Não" className="bg-zinc-900 text-base font-normal">Não</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-5 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-xs text-zinc-500 mb-1.5">Próximo Contato</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-500 shrink-0" />
                        <input 
                          type="text"
                          value={selectedCustomer.proxContato || ''}
                          onChange={(e) => setSelectedCustomer({...selectedCustomer, proxContato: e.target.value})}
                          className="w-full max-w-[150px] bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 px-1 py-0.5 text-base text-white font-bold outline-none transition-colors"
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-xs text-zinc-500 mb-1.5">Status do Atraso</p>
                      {selectedCustomer.diasProximoContato !== undefined ? (
                        <span className={`text-sm font-semibold px-3 py-1.5 rounded-md ${
                          selectedCustomer.diasProximoContato <= 0 
                            ? 'bg-red-950/60 text-red-400' 
                            : 'bg-emerald-950/60 text-emerald-400'
                        }`}>
                          {selectedCustomer.diasProximoContato <= 0 
                            ? `Atrasado em ${Math.abs(selectedCustomer.diasProximoContato)} dias` 
                            : `Faltam ${selectedCustomer.diasProximoContato} dias`}
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-500">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nova Interação */}
                {showNewInteraction && (
                  <div className="bg-[#131315] border border-emerald-500/30 rounded-xl p-5 mb-6 animate-in fade-in slide-in-from-top-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-emerald-500 font-bold flex items-center gap-2">
                        <span className="bg-emerald-500/20 px-2 py-1 rounded-md text-sm">
                          Contato {(selectedCustomer.historico_contatos?.length || 0) + 1}
                        </span>
                        Novo Registro
                      </h5>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">Data do Contato</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                          <input 
                            type="text"
                            value={newInteractionData.dataContato}
                            onChange={(e) => setNewInteractionData({...newInteractionData, dataContato: e.target.value})}
                            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="DD/MM/AAAA"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">Cadência (dias)</label>
                        <input 
                          type="number"
                          value={newInteractionData.cadencia}
                          onChange={(e) => setNewInteractionData({...newInteractionData, cadencia: e.target.value})}
                          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                          placeholder="Ex: 3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">Contatado?</label>
                        <select 
                          value={newInteractionData.contatado}
                          onChange={(e) => setNewInteractionData({...newInteractionData, contatado: e.target.value})}
                          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                        >
                          <option value="Sim">Sim</option>
                          <option value="Não">Não</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">Próximo Contato</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                          <input 
                            type="text"
                            value={newInteractionData.proxContato}
                            onChange={(e) => setNewInteractionData({...newInteractionData, proxContato: e.target.value})}
                            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="DD/MM/AAAA"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="block text-xs text-zinc-400 mb-1.5">Resumo da Interação</label>
                    <textarea 
                      rows={3}
                      placeholder="Como foi a conversa?..."
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none mb-4"
                      value={newInteractionData.observacao}
                      onChange={(e) => setNewInteractionData({...newInteractionData, observacao: e.target.value})}
                    />
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setShowNewInteraction(false)}
                        className="px-4 py-2 bg-zinc-800 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-700 transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => {
                          handleAddInteraction();
                          setShowNewInteraction(false);
                        }}
                        disabled={!newInteractionData.observacao.trim()}
                        className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Salvar Registro
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Interações - Timeline Vertical */}
                <div className="relative pl-4 space-y-8 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pt-2">
                  {/* Linha vertical da timeline */}
                  <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-zinc-800/50" />

                  {selectedCustomer.historico_contatos && selectedCustomer.historico_contatos.length > 0 ? (
                    selectedCustomer.historico_contatos.map((interaction) => (
                      <div key={interaction.id} className="relative pl-10 group">
                        {/* Ícone da timeline */}
                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-emerald-500 z-10 relative shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                        </div>

                        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4 hover:border-emerald-500/30 transition-all group-hover:bg-zinc-900/50">
                          {editingInteractionId === interaction.id ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{interaction.titulo}</span>
                                <input 
                                  type="text"
                                  value={editingInteractionData.data}
                                  onChange={(e) => setEditingInteractionData({...editingInteractionData, data: e.target.value})}
                                  className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none w-32 text-right"
                                  placeholder="DD/MM/AAAA HH:mm"
                                />
                              </div>
                              <textarea 
                                rows={3}
                                value={editingInteractionData.observacao}
                                onChange={(e) => setEditingInteractionData({...editingInteractionData, observacao: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button 
                                  onClick={() => setEditingInteractionId(null)}
                                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg hover:bg-zinc-700 transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button 
                                  onClick={() => handleSaveInteractionEdit(interaction.id)}
                                  className="px-3 py-1.5 bg-emerald-500 text-black text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{interaction.titulo}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{interaction.data}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingInteractionId(interaction.id);
                                      setEditingInteractionData({
                                        data: interaction.data,
                                        observacao: interaction.observacao
                                      });
                                    }}
                                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                    title="Editar"
                                  >
                                    <MoreHorizontal size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {interaction.observacao}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 pl-8">
                      <p className="text-zinc-500 text-sm italic">Nenhum histórico de contato registrado.</p>
                      <button 
                        onClick={handleOpenNewInteraction}
                        className="mt-2 text-emerald-500 text-xs font-bold hover:underline"
                      >
                        Registrar primeiro contato
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Venda */}
              <div>
                <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4">Informações de Venda</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Conversão</p>
                    <select 
                      value={selectedCustomer.conversao || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, conversao: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="">-</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Data Pgto</p>
                    <input 
                      type="date"
                      value={selectedCustomer.dataPgto || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, dataPgto: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Pacote / Plano</p>
                    <select 
                      value={selectedCustomer.pacote || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, pacote: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="Plano Mensal">Plano Mensal</option>
                      <option value="Plano Trimestral">Plano Trimestral</option>
                      <option value="Plano Semestral">Plano Semestral</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Valor</p>
                    <input 
                      type="text"
                      value={selectedCustomer.valor || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, valor: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-emerald-400 font-medium focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4">Observações</h4>
                <textarea 
                  rows={4}
                  value={selectedCustomer.observacoes || ''}
                  onChange={(e) => setSelectedCustomer({...selectedCustomer, observacoes: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                  placeholder="Anotações sobre o lead..."
                />
              </div>
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
                    onClick={() => handleDeleteCustomer(selectedCustomer.id)}
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
                  Excluir Lead
                </button>
              )}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedCustomer(null);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 font-semibold rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => {
                    setCustomers(customers.map(c => c.id === selectedCustomer.id ? selectedCustomer : c));
                    setSelectedCustomer(null);
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
