import { GoogleGenAI, Type } from '@google/genai';
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle,
  MapPin,
  User,
  Calendar as CalendarIcon,
  Mic,
  Trash2
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task, Patient, Customer } from '../types';

export const initialTasks: Task[] = [
  { id: '1', title: 'Reunião de Alinhamento', description: 'Discutir proposta do ERP', date: new Date().toISOString(), completed: false, customerId: '1' },
  { id: '2', title: 'Enviar Contrato', description: 'Contrato da consultoria Cloud', date: addDays(new Date(), 1).toISOString(), completed: true, customerId: '2' },
  { id: '3', title: 'Call de Vendas', description: 'Primeiro contato App Mobile', date: addDays(new Date(), 2).toISOString(), completed: false, customerId: '3' },
  { id: '4', title: 'Follow-up', description: 'Verificar status da proposta', date: addDays(new Date(), -1).toISOString(), completed: false, customerId: '4' },
];

interface AgendaProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export default function Agenda({ tasks, setTasks, patients, setPatients, customers, setCustomers }: AgendaProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isAddingManualEvent, setIsAddingManualEvent] = useState(false);
  const [manualEvent, setManualEvent] = useState({
    patientName: '',
    time: '09:00',
    eventType: 'Consulta'
  });

  const fetchGoogleEvents = async () => {
    try {
      const response = await fetch('/api/google/events');
      if (response.ok) {
        const data = await response.json();
        setGoogleEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch Google events:', error);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const response = await fetch('/api/google/auth-url');
      const { url } = await response.json();
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Por favor, permita popups para conectar sua conta.');
      }
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
    }
  };

  React.useEffect(() => {
    const checkGoogleStatus = async () => {
      try {
        const response = await fetch('/api/google/status');
        if (response.ok) {
          const data = await response.json();
          setIsGoogleConnected(data.connected);
          if (data.connected) {
            fetchGoogleEvents();
          }
        }
      } catch (error) {
        console.error('Failed to check Google Calendar status:', error);
      }
    };
    checkGoogleStatus();

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsGoogleConnected(true);
        fetchGoogleEvents();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const tasksForSelectedDate = tasks.filter(t => isSameDay(new Date(t.date), selectedDate));

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };



  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();

      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);

        // Convert audio to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];

          try {
            setIsProcessingAudio(true);
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey) {
              throw new Error('Chave de API do Gemini não configurada.');
            }
            const ai = new GoogleGenAI({ apiKey });
            
            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: {
                parts: [
                  {
                    inlineData: {
                      mimeType: "audio/webm",
                      data: base64Audio
                    }
                  },
                  {
                    text: `A partir do áudio, extraia as seguintes informações para um evento de calendário ou registro de contato: nome do paciente/lead, data, hora, tipo de evento, e se foi mencionada uma cadência de dias (ex: "cadência de 3 dias"), extraia o número de dias. Se o usuário informar que o retorno foi feito, defina "isReturnMade" como true. Formate a resposta como JSON com as chaves: "transcription" (transcrição exata), "patientName", "date" (YYYY-MM-DD), "time" (HH:MM), "eventType", "cadenceDays" (número ou null), "isReturnMade" (boolean).`
                  }
                ]
              },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    transcription: { type: Type.STRING, description: "A transcrição exata do áudio" },
                    patientName: { type: Type.STRING },
                    date: { type: Type.STRING },
                    time: { type: Type.STRING },
                    eventType: { type: Type.STRING },
                    cadenceDays: { type: Type.NUMBER, nullable: true },
                    isReturnMade: { type: Type.BOOLEAN }
                  },
                  required: ["transcription", "patientName", "date", "time", "eventType", "isReturnMade"]
                }
              }
            });

            if (response.text) {
              const data = JSON.parse(response.text);
              setTranscription(data.transcription);
              setExtractedData({
                patientName: data.patientName,
                date: data.date,
                time: data.time,
                eventType: data.eventType,
                cadenceDays: data.cadenceDays,
                isReturnMade: data.isReturnMade
              });
            }
          } catch (error) {
            console.error('Error processing audio:', error);
            alert('Erro ao processar o áudio. Verifique sua conexão e tente novamente.');
          } finally {
            setIsProcessingAudio(false);
          }
        };
      };

      setIsRecording(true);
    }
  };

  const handleConfirmEvent = async () => {
    if (!extractedData) return;

    const { patientName, date, time, eventType, cadenceDays, isReturnMade } = extractedData;
    const startDateTime = new Date(`${date}T${time}`).toISOString();
    // Assuming the event is 1 hour long
    const endDateTime = new Date(new Date(`${date}T${time}`).getTime() + 60 * 60 * 1000).toISOString();

    try {
      if (isGoogleConnected) {
        const response = await fetch('/api/google/create-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: `${eventType} - ${patientName}`,
            description: 'Evento criado via comando de voz pelo CRM Sidclei Nutri.',
            start: startDateTime,
            end: endDateTime,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to create Google Calendar event:', errorData);
          alert(`Aviso: O evento foi salvo localmente, mas não no Google Calendar. Erro: ${errorData.error || 'Desconhecido'}`);
        }
      }

      // Add the new task to the local state
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: `${eventType} - ${patientName}`,
        description: `Evento criado via comando de voz`,
        date: startDateTime,
        completed: false,
      };
      setTasks([...tasks, newTask]);

      // Update patient's next contact date
      const patient = patients.find(p => p.name.toLowerCase() === patientName.toLowerCase());
      if (patient) {
        const updatedPatient = { ...patient, proxContato: date };
        setPatients(patients.map(p => p.id === patient.id ? updatedPatient : p));
      }

      // Update customer cadence
      const customer = customers.find(c => c.name.toLowerCase() === patientName.toLowerCase());
      if (customer) {
        let updatedCustomer = { ...customer };
        if (isReturnMade) {
          updatedCustomer.contatado = 'Sim';
          updatedCustomer.proxContato = undefined;
        }
        if (cadenceDays) {
          const baseDate = new Date(date + 'T12:00:00');
          const nextContactDate = addDays(baseDate, cadenceDays);
          updatedCustomer.proxContato = format(nextContactDate, 'yyyy-MM-dd');
          updatedCustomer.cadenciaDias = cadenceDays;
        }
        setCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c));
      }

      setExtractedData(null);
      setTranscription(null);
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      alert('Erro ao criar evento. Tente novamente.');
    }
  };

  const handleManualEventSubmit = async () => {
    if (!manualEvent.patientName) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startDateTime = new Date(`${dateStr}T${manualEvent.time}`).toISOString();
    const endDateTime = new Date(new Date(`${dateStr}T${manualEvent.time}`).getTime() + 60 * 60 * 1000).toISOString();

    try {
      if (isGoogleConnected) {
        const response = await fetch('/api/google/create-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: `${manualEvent.eventType} - ${manualEvent.patientName}`,
            description: 'Evento criado manualmente pelo CRM Sidclei Nutri.',
            start: startDateTime,
            end: endDateTime,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to create Google Calendar event:', errorData);
          alert(`Aviso: O evento foi salvo localmente, mas não no Google Calendar. Erro: ${errorData.error || 'Desconhecido'}`);
        }
      }

      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: `${manualEvent.eventType} - ${manualEvent.patientName}`,
        description: `Evento criado manualmente`,
        date: startDateTime,
        completed: false,
      };
      setTasks([...tasks, newTask]);

      const patient = patients.find(p => p.name.toLowerCase() === manualEvent.patientName.toLowerCase());
      if (patient) {
        const updatedPatient = { ...patient, proxContato: dateStr };
        setPatients(patients.map(p => p.id === patient.id ? updatedPatient : p));
      }

      setIsAddingManualEvent(false);
      setManualEvent({ patientName: '', time: '09:00', eventType: 'Consulta' });
    } catch (error) {
      console.error('Error creating manual event:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Agenda</h2>
            <p className="text-zinc-400">Organize seus compromissos e tarefas.</p>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-white min-w-[120px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-zinc-800">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const hasTasks = tasks.some(t => isSameDay(new Date(t.date), day));

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`h-24 p-2 border-r border-b border-zinc-800 text-left transition-all relative group ${
                    !isCurrentMonth ? 'bg-zinc-950/30 text-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50'
                  } ${isSelected ? 'bg-emerald-500/5 ring-1 ring-inset ring-emerald-500/50' : ''}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-emerald-400' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasTasks && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tasks.filter(t => isSameDay(new Date(t.date), day)).slice(0, 2).map(t => (
                        <div key={t.id} className={`w-full h-1.5 rounded-full ${t.completed ? 'bg-zinc-700' : 'bg-emerald-500'}`} />
                      ))}
                      {tasks.filter(t => isSameDay(new Date(t.date), day)).length > 2 && (
                        <span className="text-[8px] text-zinc-500 font-bold">+ mais</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Agenda de Cadência</h3>
            <span className="text-sm text-zinc-400">Leads para retornar</span>
          </div>
          <div className="space-y-4">
            {customers.filter(c => c.proxContato && new Date(c.proxContato) >= new Date(new Date().setHours(0,0,0,0))).length > 0 ? (
              customers.filter(c => c.proxContato && new Date(c.proxContato) >= new Date(new Date().setHours(0,0,0,0))).map(customer => (
                <div key={customer.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{customer.name}</h4>
                      <p className="text-sm text-zinc-400 flex items-center gap-1">
                        <CalendarIcon size={14} />
                        Retornar em: <span className="text-emerald-400 font-medium">{format(new Date(customer.proxContato!), 'dd/MM/yyyy')}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const updatedCustomer = { ...customer, contatado: 'Sim', proxContato: undefined };
                      setCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c));
                    }}
                    className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black px-4 py-2 rounded-lg text-sm font-bold transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Feito
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-600 mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-zinc-500 text-sm">Nenhum retorno agendado para o futuro.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isGoogleConnected ? (
          <button 
            disabled
            className="w-full bg-emerald-600/20 text-emerald-500 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-default border border-emerald-500/50">
            <CheckCircle2 size={20} />
            Google Calendar Conectado
          </button>
        ) : (
          <button 
            onClick={handleGoogleConnect}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H9a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M12 18h.01"/></svg>
            Conectar Google Calendar
          </button>
        )}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
          {isGoogleConnected && googleEvents.length > 0 && (
            <div className="mb-8 pb-6 border-b border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Google Calendar</h4>
              <div className="space-y-3">
                {googleEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <CalendarIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.summary}</p>
                      <p className="text-xs text-zinc-500">
                        {event.start?.dateTime ? format(new Date(event.start.dateTime), 'HH:mm') : 'Dia todo'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {isSameDay(selectedDate, new Date()) ? 'Hoje' : format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <button 
              onClick={() => setIsAddingManualEvent(true)}
              className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors">
              <Plus size={18} />
            </button>
            <button 
              onClick={handleMicClick}
              disabled={isProcessingAudio}
              className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : isProcessingAudio ? 'bg-emerald-500/50 text-white cursor-not-allowed' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
              <Mic size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {tasksForSelectedDate.length > 0 ? (
              tasksForSelectedDate.map((task) => (
                <div key={task.id} className={`p-4 rounded-xl border transition-all ${
                  task.completed ? 'bg-zinc-950 border-zinc-800 opacity-60' : 'bg-zinc-800/50 border-zinc-700 hover:border-emerald-500/50'
                }`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleTask(task.id)} className="mt-1 text-emerald-500">
                      {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-semibold text-white ${task.completed ? 'line-through text-zinc-500' : ''}`}>
                          {task.title}
                        </h4>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock size={14} />
                          {format(new Date(task.date), 'HH:mm')}
                        </div>
                        {task.customerId && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500/70">
                            <User size={14} />
                            Lead #{task.customerId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-600">
                  <CalendarIcon size={24} />
                </div>
                <p className="text-zinc-500 text-sm">Nenhum compromisso para este dia.</p>
                <button 
                  onClick={handleGoogleConnect}
                  className="bg-zinc-800/50 border border-zinc-700 text-zinc-300 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-zinc-700 transition-colors">
                  Conectar Google Calendar
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Próximos Dias</h4>
            <div className="space-y-4">
              {tasks.filter(t => !isSameDay(new Date(t.date), selectedDate) && new Date(t.date) > selectedDate).slice(0, 2).map(t => (
                <div key={t.id} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex flex-col items-center justify-center text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                    <span className="text-[10px] font-bold uppercase">{format(new Date(t.date), 'MMM', { locale: ptBR })}</span>
                    <span className="text-sm font-bold text-white">{format(new Date(t.date), 'dd')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">{t.title}</p>
                    <p className="text-xs text-zinc-500">{format(new Date(t.date), 'HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAddingManualEvent && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 mt-6 animate-in fade-in duration-300">
              <h4 className="text-lg font-bold text-white mb-4">Novo Evento</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-zinc-400 mb-1">Paciente / Título</label>
                  <input 
                    type="text" 
                    value={manualEvent.patientName}
                    onChange={(e) => setManualEvent({...manualEvent, patientName: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Nome do paciente"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Data</label>
                    <input 
                      type="date" 
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Hora</label>
                    <input 
                      type="time" 
                      value={manualEvent.time}
                      onChange={(e) => setManualEvent({...manualEvent, time: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tipo de Evento</label>
                  <input 
                    type="text" 
                    value={manualEvent.eventType}
                    onChange={(e) => setManualEvent({...manualEvent, eventType: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: Consulta, Retorno"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => setIsAddingManualEvent(false)}
                  className="flex-1 bg-zinc-700 text-zinc-300 font-bold py-2 px-4 rounded-xl hover:bg-zinc-600 transition-colors">
                  Cancelar
                </button>
                <button 
                  onClick={handleManualEventSubmit}
                  className="flex-1 bg-emerald-500 text-black font-bold py-2 px-4 rounded-xl hover:bg-emerald-400 transition-colors">
                  Salvar
                </button>
              </div>
            </div>
          )}

          {extractedData && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 mt-6 animate-in fade-in duration-300">
              <h4 className="text-lg font-bold text-white mb-4">Confirmar Evento</h4>
              {transcription && (
                <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
                  <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Transcrição do Áudio:</p>
                  <p className="text-sm text-zinc-300 italic">"{transcription}"</p>
                </div>
              )}
              <div className="space-y-2 text-sm">
                <p><strong className="text-zinc-400">Paciente/Lead:</strong> {extractedData.patientName}</p>
                <p><strong className="text-zinc-400">Data:</strong> {extractedData.date}</p>
                <p><strong className="text-zinc-400">Hora:</strong> {extractedData.time}</p>
                <p><strong className="text-zinc-400">Tipo:</strong> {extractedData.eventType}</p>
                {extractedData.cadenceDays && (
                  <p><strong className="text-zinc-400">Cadência:</strong> {extractedData.cadenceDays} dias</p>
                )}
                {extractedData.isReturnMade && (
                  <p><strong className="text-zinc-400">Status:</strong> Retorno Realizado</p>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => {
                    setExtractedData(null);
                    setTranscription(null);
                  }}
                  className="flex-1 bg-zinc-700 text-zinc-300 font-bold py-2 px-4 rounded-xl hover:bg-zinc-600 transition-colors">
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmEvent}
                  className="flex-1 bg-emerald-500 text-black font-bold py-2 px-4 rounded-xl hover:bg-emerald-400 transition-colors">
                  Salvar na Agenda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
