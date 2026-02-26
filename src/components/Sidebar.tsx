import { 
  LayoutDashboard, 
  Users, 
  Trello, 
  Calendar, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'crm', label: 'Clientes', icon: Users },
    { id: 'funnel', label: 'Funil de Vendas', icon: Trello },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
  ];

  return (
    <div className="w-64 h-screen bg-zinc-950 text-zinc-400 flex flex-col border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <span className="text-black font-bold">N</span>
        </div>
        <h1 className="text-white font-semibold text-xl tracking-tight">Nexus CRM</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
              activeTab === item.id 
                ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]" 
                : "hover:bg-zinc-900 text-zinc-400 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
              <item.icon size={20} className={cn(
                "transition-colors duration-300",
                activeTab === item.id ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-400"
              )} />
              <span className="font-medium">{item.label}</span>
            </div>
            {activeTab === item.id && (
              <ChevronRight size={16} className="ml-auto text-emerald-400" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-300 group">
          <div className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
            <Settings size={20} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            <span className="font-medium">Configurações</span>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:bg-red-950/20 hover:text-red-400 transition-all duration-300 group">
          <div className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
            <LogOut size={20} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
            <span className="font-medium">Sair</span>
          </div>
        </button>
      </div>
    </div>
  );
}
