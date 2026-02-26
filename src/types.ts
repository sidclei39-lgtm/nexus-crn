export type CustomerStatus = 'Lead' | 'Follow up' | 'Agendou' | 'Não (sem resp.)' | 'active' | 'inactive' | '';

export type Interaction = {
  id: string;
  titulo: string;
  data: string;
  observacao: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  createdAt: string;
  instagramUrl?: string;
  dataPgto?: string;
  origem?: string;
  objetivo?: string;
  primeiroContato?: string;
  ultimoContato?: string;
  cadenciaDias?: number;
  proxContato?: string;
  contatado?: string;
  pacote?: string;
  valor?: string;
  diasProximoContato?: number;
  conversao?: string;
  observacoes?: string;
  interactions?: Interaction[];
  historico_contatos?: Interaction[];
};

export type DealStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed';

export type Deal = {
  id: string;
  title: string;
  customerId: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  customerId?: string;
};

export type RevenueData = {
  month: string;
  revenue: number;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
};

export type Booking = {
  id: string;
  serviceId: string;
  clientId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
};

export type Lead = {
  id: string;
  email: string;
  source: string;
  createdAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
};

export type Coupon = {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
};

export type Referral = {
  id: string;
  referrerId: string;
  referredEmail: string;
  status: 'pending' | 'completed';
  rewardApplied: boolean;
};
