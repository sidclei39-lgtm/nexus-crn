import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { Customer, Deal, Interaction } from '../types';
import { format } from 'date-fns';

interface AIAssistantProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
}

export default function AIAssistant({ customers, setCustomers, deals, setDeals }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Olá! Sou seu assistente de CRM. Me diga com quem você falou ou o que aconteceu, e eu atualizarei o funil e o dashboard para você.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Chave de API do Gemini não configurada.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um assistente avançado de CRM e gestão de vendas. Sua função é gerenciar um "Dashboard de Contatos" e um "Funil de Vendas" em tempo real.
      
      Mensagem do usuário: "${userMsg}"
      
      Clientes Atuais: ${JSON.stringify(customers.map((c: any) => ({ id: c.id, name: c.name })))}
      Negócios Atuais: ${JSON.stringify(deals.map((d: any) => ({ id: d.id, customerId: d.customerId, stage: d.stage })))}
      
      1. Etapas do Funil de Vendas:
      - lead (Prospecção)
      - contact (Contato)
      - proposal (Proposta)
      - negotiation (Negociação)
      - closed (Fechado)
      
      2. Regras de Contabilização (Dashboard):
      Apenas marque isCommunicationAction como true para ações ativas de comunicação (ex: novos leads abordados, follow-ups realizados).
      
      Responda em JSON com a sua resposta em texto e uma lista de ações a serem tomadas no sistema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT' as any,
            properties: {
              reply: { type: 'STRING' as any, description: 'Sua resposta amigável para o usuário' },
              actions: {
                type: 'ARRAY' as any,
                items: {
                  type: 'OBJECT' as any,
                  properties: {
                    type: { type: 'STRING' as any, description: '"add_lead", "update_stage", "log_interaction"' },
                    customerName: { type: 'STRING' as any },
                    stage: { type: 'STRING' as any, description: '"lead", "contact", "proposal", "negotiation", "closed"' },
                    notes: { type: 'STRING' as any },
                    isCommunicationAction: { type: 'BOOLEAN' as any }
                  },
                  required: ['type', 'customerName']
                }
              }
            },
            required: ['reply', 'actions']
          }
        }
      });

      if (!response.text) throw new Error('Failed to get AI response');

      const data = JSON.parse(response.text);
      
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);

      // Process actions
      if (data.actions && data.actions.length > 0) {
        let updatedCustomers = [...customers];
        let updatedDeals = [...deals];

        data.actions.forEach((action: any) => {
          let customer = updatedCustomers.find(c => c.name.toLowerCase().includes(action.customerName.toLowerCase()));
          
          if (action.type === 'add_lead' && !customer) {
            const newCustomer: Customer = {
              id: Math.random().toString(36).substr(2, 9),
              name: action.customerName,
              email: '',
              phone: '',
              company: '',
              status: 'Lead',
              createdAt: new Date().toISOString(),
              historico_contatos: []
            };
            updatedCustomers.push(newCustomer);
            customer = newCustomer;

            const newDeal: Deal = {
              id: Math.random().toString(36).substr(2, 9),
              title: `Negócio - ${customer.name}`,
              customerId: customer.id,
              value: 0,
              stage: action.stage || 'lead',
              probability: 20,
              expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
            updatedDeals.push(newDeal);
          }

          if (customer) {
            if (action.type === 'update_stage' && action.stage) {
              const dealIndex = updatedDeals.findIndex(d => d.customerId === customer?.id);
              if (dealIndex >= 0) {
                updatedDeals[dealIndex] = { ...updatedDeals[dealIndex], stage: action.stage };
              } else {
                updatedDeals.push({
                  id: Math.random().toString(36).substr(2, 9),
                  title: `Negócio - ${customer.name}`,
                  customerId: customer.id,
                  value: 0,
                  stage: action.stage,
                  probability: 50,
                  expectedCloseDate: new Date().toISOString()
                });
              }
            }

            if (action.type === 'log_interaction' || action.isCommunicationAction) {
              const newInteraction: Interaction = {
                id: Math.random().toString(36).substr(2, 9),
                titulo: action.isCommunicationAction ? 'Ação de Comunicação' : 'Interação Registrada',
                data: format(new Date(), 'dd/MM/yyyy HH:mm'),
                observacao: action.notes || 'Interação via Assistente IA',
                tipo_contato: action.isCommunicationAction ? 'Ativo' : 'Passivo'
              };
              
              const customerIndex = updatedCustomers.findIndex(c => c.id === customer?.id);
              if (customerIndex >= 0) {
                const hist = updatedCustomers[customerIndex].historico_contatos || [];
                updatedCustomers[customerIndex] = {
                  ...updatedCustomers[customerIndex],
                  historico_contatos: [newInteraction, ...hist]
                };
              }
            }
          }
        });

        setCustomers(updatedCustomers);
        setDeals(updatedDeals);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Desculpe, ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Bot size={28} />
      </button>

      <div className={`fixed bottom-6 right-6 w-96 h-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-50 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Assistente IA</h3>
              <p className="text-xs text-emerald-500">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-500 text-black rounded-tr-sm' 
                  : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-400 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Processando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 rounded-b-2xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
