import React, { useState } from 'react';
import { Patient } from '../types';
import { Lock, User, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLoginAdmin: () => void;
  onLoginClient: (patientId: string) => void;
  patients: Patient[];
}

export default function Login({ onLoginAdmin, onLoginClient, patients }: LoginProps) {
  const [view, setView] = useState<'selection' | 'admin' | 'client' | 'register'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check local storage for registered admins
    const savedAdmins = localStorage.getItem('nexus_admins');
    const admins = savedAdmins ? JSON.parse(savedAdmins) : [{ email: 'admin@nexus.com', password: 'admin' }];
    
    const admin = admins.find((a: any) => a.email === email && a.password === password);

    if (admin) {
      onLoginAdmin();
    } else {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      setError('Preencha todos os campos.');
      return;
    }

    const savedAdmins = localStorage.getItem('nexus_admins');
    const admins = savedAdmins ? JSON.parse(savedAdmins) : [{ email: 'admin@nexus.com', password: 'admin' }];
    
    if (admins.find((a: any) => a.email === email)) {
      setError('Este e-mail já está cadastrado.');
      return;
    }

    admins.push({ name, email, password });
    localStorage.setItem('nexus_admins', JSON.stringify(admins));
    
    setSuccess('Cadastro realizado com sucesso! Faça login para continuar.');
    setError('');
    setTimeout(() => {
      setView('admin');
      setSuccess('');
    }, 2000);
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock client login - find patient by email or name (using name for now since email might not be in Patient type)
    const patient = patients.find(p => p.name.toLowerCase() === email.toLowerCase() || p.email?.toLowerCase() === email.toLowerCase());
    
    if (patient && password === 'cliente123') {
      onLoginClient(patient.id);
    } else {
      setError('Credenciais inválidas. Use o nome do paciente e senha "cliente123"');
    }
  };

  if (view === 'selection') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-black font-bold text-3xl">N</span>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Nexus CRM</h1>
            <p className="text-zinc-400">Selecione como deseja acessar a plataforma</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setView('admin')}
              className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 px-6 rounded-xl transition-all"
            >
              <ShieldAlert size={20} />
              Acesso Administrativo
            </button>
            <button 
              onClick={() => setView('client')}
              className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 px-6 rounded-xl transition-all border border-zinc-700"
            >
              <User size={20} />
              Área do Cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl mx-auto flex items-center justify-center mb-4">
            {view === 'admin' ? <ShieldAlert className="text-emerald-500" size={24} /> : <User className="text-emerald-500" size={24} />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {view === 'admin' ? 'Login Administrativo' : view === 'register' ? 'Criar Conta' : 'Área do Cliente'}
          </h2>
          <p className="text-zinc-400 mt-2">
            {view === 'admin' ? 'Acesse o painel de controle' : view === 'register' ? 'Cadastre-se para acessar o CRM' : 'Acesse seus planos e acompanhamentos'}
          </p>
        </div>

        <form onSubmit={view === 'admin' ? handleAdminLogin : view === 'register' ? handleRegister : handleClientLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm text-center">
              {success}
            </div>
          )}
          
          {view === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              {view === 'admin' || view === 'register' ? 'E-mail' : 'Nome ou E-mail'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder={view === 'admin' || view === 'register' ? 'seu@email.com' : 'Seu nome cadastrado'}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-6 rounded-xl transition-all mt-6"
          >
            {view === 'register' ? 'Cadastrar' : 'Entrar'}
          </button>

          {view === 'admin' && (
            <button 
              type="button"
              onClick={() => { setView('register'); setError(''); setEmail(''); setPassword(''); }}
              className="w-full text-emerald-500 hover:text-emerald-400 text-sm py-2 transition-colors font-medium"
            >
              Não tem uma conta? Cadastre-se
            </button>
          )}

          {view === 'register' && (
            <button 
              type="button"
              onClick={() => { setView('admin'); setError(''); setEmail(''); setPassword(''); }}
              className="w-full text-emerald-500 hover:text-emerald-400 text-sm py-2 transition-colors font-medium"
            >
              Já tem uma conta? Faça login
            </button>
          )}

          <button 
            type="button"
            onClick={() => { setView('selection'); setError(''); setEmail(''); setPassword(''); }}
            className="w-full text-zinc-400 hover:text-white text-sm py-2 transition-colors"
          >
            Voltar para seleção
          </button>
        </form>
        
        {view === 'admin' && (
          <div className="text-xs text-zinc-500 text-center mt-4">
            Dica: Use admin@nexus.com / admin ou crie uma nova conta
          </div>
        )}
        {view === 'client' && (
          <div className="text-xs text-zinc-500 text-center mt-4">
            Dica: Use o nome de um paciente cadastrado e senha "cliente123"
          </div>
        )}
      </div>
    </div>
  );
}
