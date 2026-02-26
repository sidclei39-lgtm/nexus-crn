import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle,
  MapPin,
  User,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '../types';

const initialTasks: Task[] = [
  { id: '1', title: 'Reunião de Alinhamento', description: 'Discutir proposta do ERP', date: new Date().toISOString(), completed: false, customerId: '1' },
  { id: '2', title: 'Enviar Contrato', description: 'Contrato da consultoria Cloud', date: addDays(new Date(), 1).toISOString(), completed: true, customerId: '2' },
  { id: '3', title: 'Call de Vendas', description: 'Primeiro contato App Mobile', date: addDays(new Date(), 2).toISOString(), completed: false, customerId: '3' },
  { id: '4', title: 'Follow-up', description: 'Verificar status da proposta', date: addDays(new Date(), -1).toISOString(), completed: false, customerId: '4' },
];

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {isSameDay(selectedDate, new Date()) ? 'Hoje' : format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <button className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors">
              <Plus size={18} />
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
                      <h4 className={`font-semibold text-white ${task.completed ? 'line-through text-zinc-500' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock size={14} />
                          {format(new Date(task.date), 'HH:mm')}
                        </div>
                        {task.customerId && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500/70">
                            <User size={14} />
                            Cliente #{task.customerId}
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
        </div>
      </div>
    </div>
  );
}
