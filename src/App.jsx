import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, increment, setDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Menu, X } from 'lucide-react'; // Menu (3 çizgi) ve X (Kapat) ikonları
import { 
  Package, ShoppingCart, Lightbulb, ClipboardList, Plus, Trash2, Store, LogOut, Settings, Trello, 
  Coins, Printer, Box, Activity, LayoutDashboard, TrendingUp, AlertTriangle, 
  Check, ArrowRight, ArrowLeftCircle, Wrench, ArrowUpRight, ArrowDownRight,
  Moon, Sun, FileSpreadsheet, User, Search, ListTodo, Calendar, CreditCard, Wallet, Edit, ShoppingBag, Minus, PenTool, CheckCircle, CheckSquare, Layers, Pin, Sparkles, Archive, Globe, Link, PieChart, Banknote, ShoppingBasket, ListChecks, LogIn, ShieldAlert, Key, Clock, MapPin, BookOpen, Info, Filter, Calculator, Palette, ExternalLink, TrendingDown, Tag, UserPlus, Lock, RefreshCw, LayoutGrid
} from 'lucide-react';

// --- HATA YAKALAYICI ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uygulama Hatası:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-800 p-8 text-center">
          <AlertTriangle size={48} className="mb-4" />
          <h2 className="text-2xl font-bold mb-2">Bir şeyler ters gitti.</h2>
          <p className="mb-4">Uygulama çöktü. Lütfen sayfayı yenileyin.</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700">Sayfayı Yenile</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- FIREBASE BAŞLATMA ---
let app, auth, db;
let isFirebaseInitialized = false;

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const config = JSON.parse(__firebase_config);
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseInitialized = true;
  } else {
    // Manuel Config
    const manualConfig = {
      apiKey: "AIzaSyCt6qLthhCPMlQ5GYUdOQAbByb9HAlccbM",
      authDomain: "berilden-ede58.firebaseapp.com",
      projectId: "berilden-ede58",
      storageBucket: "berilden-ede58.firebasestorage.app",
      messagingSenderId: "59384339014",
      appId: "1:59384339014:web:ffa57c12d4b65f4b28c847",
      measurementId: "G-EK5M5X22JV"
    };

    if (manualConfig.apiKey && manualConfig.apiKey !== "SİZİN_API_KEYİNİZ") {
        app = initializeApp(manualConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        isFirebaseInitialized = true;
    }
  }
} catch (error) {
  console.error("Firebase Hatası:", error);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'berilden-store-v3';

// --- YARDIMCI FONKSİYONLAR ---
const notify = (setNotification, msg, type = 'success') => {
  setNotification({ message: msg, type });
  setTimeout(() => setNotification(null), 3000);
};

const crud = (setNotification) => ({
    add: async (col, d) => { 
      if (!isFirebaseInitialized) return alert("Veritabanı bağlantısı yok.");
      try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', col), { ...d, createdAt: serverTimestamp() }); notify(setNotification, "Eklendi"); } catch(e) { console.error(e); notify(setNotification, "Hata", "error"); } 
    },
    update: async (col, id, d) => { 
      if (!isFirebaseInitialized) return;
      try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), d); notify(setNotification, "Güncellendi"); } catch(e) { console.error(e); notify(setNotification, "Hata", "error"); } 
    },
    delete: async (id, col) => { 
      if (!isFirebaseInitialized) return;
      if(!confirm("Silmek istediğine emin misin?")) return; try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); notify(setNotification, "Silindi"); } catch(e) { console.error(e); notify(setNotification, "Hata", "error"); } 
    }
});

const InfoIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

// --- UI BİLEŞENLERİ (MOBİL UYUMLU MODAL) ---
const MobileModal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                <h3 className="font-bold text-lg dark:text-white">{title}</h3>
                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <X size={20} className="text-slate-500 dark:text-slate-300"/>
                </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

// --- SAYFA BİLEŞENLERİ ---

const LoginPage = ({ onLogin, loading, error, setError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isFirebaseInitialized) return <div className="h-screen flex items-center justify-center text-red-500 font-bold p-4 text-center">Veritabanı Bağlantısı Yok<br/><span className="text-sm font-normal text-slate-500">Lütfen API Key ayarlarını kontrol edin.</span></div>;
  if (loading) return <div className="h-screen flex items-center justify-center text-orange-600 font-bold animate-pulse text-xl">Yükleniyor...</div>;

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">BerildenStore</h2>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }}>
          <input className="w-full p-3 border rounded-lg mb-4" placeholder="Kullanıcı Adı" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="w-full p-3 border rounded-lg mb-6" type="password" placeholder="Şifre" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"><LogIn size={18}/> Giriş Yap</button>
          {error && <p className="text-red-500 text-center mt-3 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
};

// --- GÜNCELLENMİŞ DASHBOARD (Grafiksiz, Operasyon Odaklı) ---
// --- DASHBOARD (Top 3 "En Çok Satanlar" Eklendi) ---
const DashboardView = ({ data, setActiveTab }) => {
    const { items, orders, recentSales, markets, expenses, shoppingList, printers, printJobs } = data;
    
    // --- HESAPLAMALAR ---
    const totalRev = recentSales.reduce((a,s)=>a+(Number(s.totalPrice)||0),0) + markets.reduce((a,m)=>a+(Number(m.totalRevenue)||0),0);
    const totalExp = expenses.reduce((a,e)=>a+(Number(e.amount)||0),0) + markets.reduce((a,m)=>a+(Number(m.totalExpenses)||0),0);
    const netProfit = totalRev - totalExp;

    const lowStockItems = items.filter(i => i.stock < 3);
    const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'processing');
    const urgentShopping = shoppingList.filter(i => !i.completed && i.priority === 'high');
    const activePrinters = printers.filter(p => p.status === 'printing');

    // --- EN ÇOK SATANLAR (Son 30 Gün) ---
    const topSellers = useMemo(() => {
        const stats = {};
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - 30); // Geriye dönük 30 gün sınırı

        recentSales.forEach(s => {
            // Eğer createdAt varsa timestamp kullan, yoksa tarih stringine güven
            const sDate = s.createdAt ? new Date(s.createdAt.seconds * 1000) : new Date(s.date);
            
            // Tarih sınırını kontrol et
            if (sDate >= limitDate) {
                stats[s.productName] = (stats[s.productName] || 0) + (Number(s.quantity) || 1);
            }
        });

        // Objeyi diziye çevir, çoktan aza sırala ve ilk 3'ü al
        return Object.entries(stats)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 3);
    }, [recentSales]);

    return (
        <div className="space-y-6 animate-in fade-in pb-24">
            {/* Üst Başlık */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="text-orange-600"/> Kontrol Paneli
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Operasyonel durum özeti.</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase">Bugün</span>
                    <p className="text-sm font-bold dark:text-white">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Finansal Kartlar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 text-orange-600"><Coins size={80}/></div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Ciro</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{totalRev}₺</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 text-blue-600"><Wallet size={80}/></div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Net Kâr</p>
                    <p className={`text-2xl font-black ${netProfit>=0?'text-blue-600':'text-red-500'}`}>{netProfit}₺</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 text-purple-600"><Trello size={80}/></div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Sipariş</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{pendingOrders.length}</p>
                    <p className="text-[10px] text-orange-500 font-bold">İşlem Bekliyor</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5 text-green-600"><Printer size={80}/></div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Atölye</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{activePrinters.length} / {printers.length}</p>
                    <p className="text-[10px] text-green-500 font-bold">Cihaz Çalışıyor</p>
                </div>
            </div>

            {/* ANA İÇERİK IZGARASI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                
                {/* SOL KOLON: Aksiyon Merkezi */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm flex flex-col h-full min-h-[400px]">
                    <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                        <ShieldAlert size={20} className="text-red-500"/> Aksiyon Merkezi
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                        {lowStockItems.length > 0 && (
                            <div onClick={()=>setActiveTab('inventory')} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-red-100 transition-colors group">
                                <div className="bg-white dark:bg-red-900/40 p-3 rounded-xl text-red-500 shadow-sm"><AlertTriangle size={24}/></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-red-700 dark:text-red-300 group-hover:underline">Kritik Stok Seviyesi</p>
                                    <p className="text-xs text-red-600/70 dark:text-red-400">{lowStockItems.length} ürün tükenmek üzere.</p>
                                </div>
                                <ArrowRight size={18} className="text-red-400"/>
                            </div>
                        )}

                        {pendingOrders.length > 0 && (
                            <div onClick={()=>setActiveTab('orders')} className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-orange-100 transition-colors group">
                                <div className="bg-white dark:bg-orange-900/40 p-3 rounded-xl text-orange-500 shadow-sm"><Clock size={24}/></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-orange-700 dark:text-orange-300 group-hover:underline">Bekleyen Siparişler</p>
                                    <p className="text-xs text-orange-600/70 dark:text-orange-400">{pendingOrders.length} sipariş hazırlanmalı.</p>
                                </div>
                                <ArrowRight size={18} className="text-orange-400"/>
                            </div>
                        )}
                        
                        {urgentShopping.length > 0 && (
                            <div onClick={()=>setActiveTab('shopping')} className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-yellow-100 transition-colors group">
                                <div className="bg-white dark:bg-yellow-900/40 p-3 rounded-xl text-yellow-600 shadow-sm"><ShoppingBag size={24}/></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300 group-hover:underline">Acil Malzeme İhtiyacı</p>
                                    <p className="text-xs text-yellow-600/70 dark:text-yellow-400">{urgentShopping.length} acil öncelikli malzeme alınmalı.</p>
                                </div>
                                <ArrowRight size={18} className="text-yellow-400"/>
                            </div>
                        )}

                        {lowStockItems.length === 0 && pendingOrders.length === 0 && urgentShopping.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 h-full">
                                <CheckCircle size={48} className="mb-4 text-green-500 opacity-50"/>
                                <p className="font-bold text-slate-500">Harika!</p>
                                <p className="text-sm">Şu an acil bir durum yok.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SAĞ KOLON: Top 3, Yazıcılar, Kısayollar */}
                <div className="flex flex-col gap-6">

                    {/* YENİ: Top 3 En Çok Satanlar */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={100}/></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <TrendingUp size={20} className="text-yellow-300"/> Son 30 Günün Yıldızları
                            </h3>
                            
                            <div className="space-y-3">
                                {topSellers.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-sm ${index===0 ? 'bg-yellow-400 text-yellow-900' : index===1 ? 'bg-slate-300 text-slate-800' : 'bg-orange-300 text-orange-900'}`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{item.name}</p>
                                        </div>
                                        <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                                            {item.qty} Adet
                                        </div>
                                    </div>
                                ))}
                                {topSellers.length === 0 && (
                                    <p className="text-sm opacity-70 text-center py-4">Henüz yeterli satış verisi yok.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Canlı Yazıcı Durumu */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <Printer size={20} className="text-slate-500"/> Atölye
                             </h3>
                             <button onClick={()=>setActiveTab('workshop')} className="text-xs bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg hover:bg-slate-200">Yönet</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {printers.slice(0,6).map(p => (
                                <div key={p.id} className={`p-2 rounded-lg border flex flex-col items-center text-center transition-all ${p.status==='printing' ? 'bg-green-50 border-green-200' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                                    <div className={`w-2 h-2 rounded-full mb-1 ${p.status==='printing'?'bg-green-500 animate-pulse':p.status==='maintenance'?'bg-red-500':'bg-slate-300'}`}></div>
                                    <span className="text-[10px] font-bold dark:text-white truncate w-full">{p.name}</span>
                                </div>
                            ))}
                            {printers.length === 0 && <div className="col-span-3 text-center text-xs text-slate-400">Yazıcı yok.</div>}
                        </div>
                    </div>

                    {/* Hızlı Kısayollar */}
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={()=>setActiveTab('sales')} className="bg-white dark:bg-slate-800 border dark:border-slate-700 hover:border-blue-400 p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group shadow-sm">
                            <ShoppingCart size={20} className="text-slate-400 group-hover:text-blue-500"/>
                            <span className="text-xs font-bold dark:text-white">Satış Yap</span>
                        </button>
                        <button onClick={()=>setActiveTab('orders')} className="bg-white dark:bg-slate-800 border dark:border-slate-700 hover:border-blue-400 p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group shadow-sm">
                            <Plus size={20} className="text-slate-400 group-hover:text-blue-500"/>
                            <span className="text-xs font-bold dark:text-white">Sipariş Al</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const InventoryView = ({ items, ops }) => {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tümü');
    const [viewMode, setViewMode] = useState('list');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({});

    const categories = ['Tümü', ...new Set(items.map(i => i.type || 'Genel').filter(c => c))];
    const filtered = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'Tümü' || i.type === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    const totalValue = items.reduce((acc, item) => acc + (Number(item.sellPrice || 0) * Number(item.stock || 0)), 0);
    const lowStockCount = items.filter(i => i.stock < 3).length;

    const handleSave = () => { if(form.id) ops.update('inventory', form.id, form); else ops.add('inventory', form); setModal(false); };
    const quickUpdateStock = (item, amount) => {
        const newStock = Number(item.stock) + amount;
        if (newStock < 0) return;
        ops.update('inventory', item.id, { stock: newStock });
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex items-center justify-between"><div><p className="text-xs text-slate-500 font-bold uppercase">Toplam Ürün</p><p className="text-2xl font-black dark:text-white">{items.length}</p></div><div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-600"><Package size={24}/></div></div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex items-center justify-between"><div><p className="text-xs text-slate-500 font-bold uppercase">Stok Değeri</p><p className="text-2xl font-black text-purple-600">{totalValue}₺</p></div><div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-purple-600"><Coins size={24}/></div></div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex items-center justify-between"><div><p className="text-xs text-slate-500 font-bold uppercase">Kritik Stok</p><p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockCount}</p></div><div className={`p-3 rounded-lg ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}><AlertTriangle size={24}/></div></div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">{categories.map(cat => (<button key={cat} type="button" onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${categoryFilter === cat ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}>{cat}</button>))}</div>
                <div className="flex gap-2 w-full md:w-auto"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="Ara..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1"><button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600' : 'text-slate-400'}`}><ListTodo size={18}/></button><button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutDashboard size={18}/></button></div><button type="button" onClick={()=>{setForm({}); setModal(true)}} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"><Plus size={20}/> <span className="hidden lg:inline">Ekle</span></button></div>
            </div>
            {viewMode === 'list' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden shadow-sm"><table className="w-full text-sm text-left"><thead className="bg-slate-50 dark:bg-slate-700 text-slate-500"><tr><th className="p-4">Ürün</th><th className="p-4">Kategori</th><th className="p-4 text-center">Stok Yönetimi</th><th className="p-4 text-right">Fiyat</th><th className="p-4 text-right">İşlem</th></tr></thead><tbody>{filtered.map(i => (<tr key={i.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"><td className="p-4 font-bold dark:text-white flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-600 flex items-center justify-center overflow-hidden">{i.imageUrl ? <img src={i.imageUrl} className="w-full h-full object-cover"/> : <Package className="text-slate-400"/>}</div>{i.name}</td><td className="p-4 text-slate-500"><span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{i.type || 'Genel'}</span></td><td className="p-4"><div className="flex items-center justify-center gap-3"><button type="button" onClick={() => quickUpdateStock(i, -1)} className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 flex items-center justify-center font-bold text-slate-500 transition-colors">-</button><span className={`w-8 text-center font-bold ${i.stock < 3 ? 'text-red-500' : 'dark:text-white'}`}>{i.stock}</span><button type="button" onClick={() => quickUpdateStock(i, 1)} className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 hover:bg-green-100 hover:text-green-600 flex items-center justify-center font-bold text-slate-500 transition-colors">+</button></div></td><td className="p-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{i.sellPrice}₺</td><td className="p-4 text-right"><div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity"><button type="button" onClick={()=>{setForm(i); setModal(true)}} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit size={16}/></button><button type="button" onClick={()=>ops.delete(i.id, 'inventory')} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button></div></td></tr>))}</tbody></table></div>
            )}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{filtered.map(i => (<div key={i.id} className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col"><div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"><button type="button" onClick={()=>{setForm(i); setModal(true)}} className="p-1.5 bg-white/90 text-blue-500 rounded-lg shadow-sm"><Edit size={14}/></button><button type="button" onClick={()=>ops.delete(i.id, 'inventory')} className="p-1.5 bg-white/90 text-red-500 rounded-lg shadow-sm"><Trash2 size={14}/></button></div><div className="aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">{i.imageUrl ? <img src={i.imageUrl} className="w-full h-full object-cover"/> : <Package size={48} className="text-slate-300"/>}{i.stock < 3 && <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">Kritik Stok</div>}</div><div className="p-3 flex flex-col flex-1"><div className="flex justify-between items-start mb-1"><span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{i.type || 'Genel'}</span><span className="font-bold text-blue-600">{i.sellPrice}₺</span></div><h4 className="font-bold text-sm dark:text-white line-clamp-2 mb-2 flex-1">{i.name}</h4><div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-lg p-1"><button type="button" onClick={() => quickUpdateStock(i, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500">-</button><span className={`text-xs font-bold ${i.stock<3?'text-red-500':'dark:text-white'}`}>{i.stock} Adet</span><button type="button" onClick={() => quickUpdateStock(i, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500">+</button></div></div></div>))}</div>
            )}
            {modal && (
                <MobileModal title={form.id ? "Ürün Düzenle" : "Yeni Ürün"} onClose={()=>setModal(false)}>
                    <div className="space-y-4">
                        <input className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-xl font-bold dark:text-white outline-none" placeholder="Ürün Adı" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Stok</label>
                                <input type="number" inputMode="decimal" className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none" value={form.stock||''} onChange={e=>setForm({...form,stock:e.target.value})}/>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Fiyat (₺)</label>
                                <input type="number" inputMode="decimal" className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-blue-600" value={form.sellPrice||''} onChange={e=>setForm({...form,sellPrice:e.target.value})}/>
                            </div>
                        </div>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none text-sm" placeholder="Kategori (3D, Elektronik...)" value={form.type||''} onChange={e=>setForm({...form,type:e.target.value})}/>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none text-sm" placeholder="Resim URL" value={form.imageUrl||''} onChange={e=>setForm({...form,imageUrl:e.target.value})}/>
                        <div className="flex gap-3 pt-2">
                             <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform">Kaydet</button>
                        </div>
                    </div>
                </MobileModal>
            )}
        </div>
    );
};

const SalesView = ({ items, ops }) => {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tümü');
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualForm, setManualForm] = useState({ name: '', price: '' });

    const categories = ['Tümü', ...new Set(items.map(i => i.type || 'Genel').filter(c => c))];
    const filteredItems = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'Tümü' || i.type === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (item) => { const exist = cart.find(c => c.id === item.id); if (exist) { if (!item.isManual && exist.qty >= item.stock) return alert("Stok yetersiz!"); setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)); } else { setCart([...cart, { ...item, qty: 1 }]); } };
    const updateQty = (id, delta) => { const item = cart.find(c => c.id === id); if (!item) return; const newQty = item.qty + delta; if (newQty <= 0) { setCart(cart.filter(c => c.id !== id)); return; } if (!item.isManual && newQty > item.stock) { alert("Stok sınırına ulaşıldı!"); return; } setCart(cart.map(c => c.id === id ? { ...c, qty: newQty } : c)); };
    const addManualItem = () => { if (!manualForm.name || !manualForm.price) return; const newItem = { id: `manual_${Date.now()}`, name: manualForm.name, sellPrice: Number(manualForm.price), stock: 9999, isManual: true, imageUrl: null }; addToCart(newItem); setManualForm({ name: '', price: '' }); setIsManualModalOpen(false); };
    const checkout = async (method) => { if (cart.length === 0) return; const total = cart.reduce((a, c) => a + c.sellPrice * c.qty, 0); await Promise.all(cart.map(async c => { if (!c.isManual) { await ops.update('inventory', c.id, { stock: Number(c.stock) - c.qty }); } await ops.add('sales_history', { productName: c.name, quantity: c.qty, totalPrice: c.sellPrice * c.qty, unitPrice: c.sellPrice, platform: method === 'Cash' ? 'Kasa (Nakit)' : 'Kasa (Kart)', date: new Date().toLocaleDateString('tr-TR'), paymentMethod: method }); })); setCart([]); alert(`Satış Başarılı! \nToplam: ${total}₺ \nÖdeme: ${method === 'Cash' ? 'Nakit' : 'Kredi Kartı'}`); };
    const cartTotal = cart.reduce((a, c) => a + c.sellPrice * c.qty, 0);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-in fade-in pb-20">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 flex flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b dark:border-slate-700 flex flex-col gap-4">
                    <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Ürün barkodu veya adı ara..." value={search} onChange={e => setSearch(e.target.value)} autoFocus /></div><button type="button" onClick={() => setIsManualModalOpen(true)} className="bg-purple-100 text-purple-600 px-4 rounded-xl font-bold hover:bg-purple-200 transition-colors flex items-center gap-2 whitespace-nowrap"><PenTool size={18}/> <span className="hidden sm:inline">Manuel Ekle</span></button></div>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">{categories.map(cat => (<button key={cat} type="button" onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}>{cat}</button>))}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-slate-900/50"><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{filteredItems.map(i => (<button key={i.id} type="button" onClick={() => addToCart(i)} disabled={i.stock <= 0} className="bg-white dark:bg-slate-800 p-3 rounded-xl border dark:border-slate-700 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-500 text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all group flex flex-col h-full relative">{i.stock > 0 && <span className="absolute top-2 right-2 bg-slate-100 dark:bg-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-500">{i.stock}</span>}{i.stock <= 0 && <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">Tükendi</span>}<div className="aspect-square bg-slate-100 dark:bg-slate-700 mb-3 rounded-lg flex items-center justify-center overflow-hidden">{i.imageUrl ? <img src={i.imageUrl} className="h-full w-full object-cover group-hover:scale-105 transition-transform" /> : <Package className="text-slate-300" size={32}/>}</div><div className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 flex-1 mb-1">{i.name}</div><div className="text-blue-600 font-black text-lg">{i.sellPrice}₺</div></button>))}</div></div>
            </div>
            <div className="w-full lg:w-96 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 flex flex-col shadow-xl">
                <div className="p-5 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl flex justify-between items-center"><h3 className="font-black text-lg flex items-center gap-2 dark:text-white"><ShoppingBag className="text-blue-600"/> Satış Sepeti</h3>{cart.length > 0 && <button type="button" onClick={() => setCart([])} className="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors">Sepeti Temizle</button>}</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">{cart.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4"><ShoppingCart size={64} strokeWidth={1} /><p>Sepete ürün ekleyin</p></div>) : (cart.map(c => (<div key={c.id} className="flex flex-col bg-white dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm"><div className="flex justify-between items-start mb-2"><span className="font-bold text-sm dark:text-white line-clamp-2">{c.name}</span><span className="font-bold text-blue-600">{c.sellPrice * c.qty}₺</span></div><div className="flex justify-between items-center"><div className="text-xs text-slate-400">{c.sellPrice}₺ / adet</div><div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1"><button type="button" onClick={() => updateQty(c.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 transition-colors"><Minus size={14}/></button><span className="w-6 text-center font-bold text-sm dark:text-white">{c.qty}</span><button type="button" onClick={() => updateQty(c.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 transition-colors"><Plus size={14}/></button></div></div></div>)))}</div>
                <div className="p-5 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 rounded-b-2xl"><div className="flex justify-between items-center mb-6"><span className="text-slate-500 font-bold">TOPLAM TUTAR</span><span className="text-3xl font-black text-slate-800 dark:text-white">{cartTotal}₺</span></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => checkout('Cash')} disabled={cart.length === 0} className="py-4 bg-green-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-all flex flex-col items-center justify-center gap-1 active:scale-95"><Banknote size={24}/><span>NAKİT</span></button><button type="button" onClick={() => checkout('Card')} disabled={cart.length === 0} className="py-4 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all flex flex-col items-center justify-center gap-1 active:scale-95"><CreditCard size={24}/><span>KART</span></button></div></div>
            </div>
            {isManualModalOpen && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl dark:text-white flex items-center gap-2"><PenTool size={20} className="text-purple-600"/> Manuel Satış</h3><button type="button" onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X/></button></div><div className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ürün / Hizmet Adı</label><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:border-purple-500" placeholder="Örn: Hediye Paketi" value={manualForm.name} onChange={e => setManualForm({ ...manualForm, name: e.target.value })} autoFocus/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiyat (₺)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:border-purple-500" placeholder="0.00" value={manualForm.price} onChange={e => setManualForm({ ...manualForm, price: e.target.value })} /></div><button type="button" onClick={addManualItem} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold mt-2 hover:bg-purple-700 transition-colors">Sepete Ekle</button></div></div></div>)}
        </div>
    );
};

// --- GÜNCELLENMİŞ SİPARİŞLER SAYFASI (EXCEL ÖZELLİKLİ) ---
const OrdersView = ({ orders, ops }) => {
    const [search, setSearch] = useState('');
    const [platformFilter, setPlatformFilter] = useState('Tümü');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({});

    const platforms = ['Instagram', 'Shopier', 'Dolap', 'Etsy', 'Trendyol', 'Hepsiburada', 'Çiçeksepeti', 'Diğer'];
    
    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.customerName || '').toLowerCase().includes(search.toLowerCase()) || (o.productName || '').toLowerCase().includes(search.toLowerCase());
        const matchesPlatform = platformFilter === 'Tümü' || o.platform === platformFilter;
        return matchesSearch && matchesPlatform;
    });

    const pendingAmount = filteredOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').reduce((acc, o) => acc + (Number(o.price) || 0), 0);

    const handleSave = () => {
        const data = { ...form, createdAt: form.createdAt || serverTimestamp(), status: form.status || 'new' };
        if (form.id) ops.update('orders', form.id, data);
        else ops.add('orders', data);
        setIsModalOpen(false); setForm({});
    };

    // --- EXCEL (CSV) İNDİRME FONKSİYONU ---
    const downloadExcel = () => {
        if (filteredOrders.length === 0) return alert("Listede indirilecek sipariş yok.");

        // 1. Başlık Satırı
        let csvContent = "Sipariş Tarihi;Müşteri Adı;Tutar;Platform;Ürün;Sipariş No;Durum\n";

        // 2. Verileri Döngüye Al
        filteredOrders.forEach(o => {
            const date = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '-';
            // Noktalı virgül (;) Excel'in sütun ayıracıdır. Veri içindeki ;'leri temizliyoruz.
            const row = [
                date,
                `"${o.customerName}"`, // İsimde boşluk varsa tırnak içine al
                `${o.price}`.replace('.', ','), // Excel ondalık için virgül sever
                o.platform,
                `"${o.productName}"`,
                `"${o.note || ''}"`,
                o.status === 'new' ? 'Yeni' : o.status === 'processing' ? 'Hazırlanıyor' : 'Tamamlandı'
            ].join(";");
            csvContent += row + "\n";
        });

        // 3. Dosyayı Oluştur ve İndir (Türkçe Karakter için BOM ekledik: \uFEFF)
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Siparis_Listesi_${new Date().toLocaleDateString('tr-TR')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getPlatformColor = (p) => {
        switch(p) {
            case 'Trendyol': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'Hepsiburada': return 'bg-orange-100 text-orange-800 border-orange-200'; // HB turuncusu
            case 'Çiçeksepeti': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'Instagram': return 'bg-pink-100 text-pink-600 border-pink-200';
            case 'Shopier': return 'bg-blue-100 text-blue-600 border-blue-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="Sipariş, Müşteri Ara..." value={search} onChange={e => setSearch(e.target.value)}/></div>
                    <select className="p-2 bg-slate-100 dark:bg-slate-900 dark:text-white rounded-lg outline-none border-none text-sm font-medium" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}><option value="Tümü">Tüm Platformlar</option>{platforms.map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right hidden md:block"><p className="text-[10px] text-slate-400 font-bold uppercase">Bekleyen Ciro</p><p className="font-bold text-lg text-blue-600">{pendingAmount}₺</p></div>
                    
                    {/* YENİ EXCEL BUTONU */}
                    <button type="button" onClick={downloadExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
                        <FileSpreadsheet size={20}/> <span className="hidden sm:inline">Excel İndir</span>
                    </button>

                    <button type="button" onClick={()=>{setForm({status:'new', platform:'Instagram'}); setIsModalOpen(true)}} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"><Plus size={20}/> <span className="hidden sm:inline">Manuel Ekle</span></button>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 flex-1 custom-scrollbar">
                {['new', 'processing', 'shipped', 'completed'].map(status => {
                    const statusLabels = { new: 'Yeni Sipariş', processing: 'Hazırlanıyor', shipped: 'Kargolandı', completed: 'Tamamlandı' };
                    const statusColors = { new: 'border-blue-200 bg-blue-50 text-blue-700', processing: 'border-yellow-200 bg-yellow-50 text-yellow-700', shipped: 'border-purple-200 bg-purple-50 text-purple-700', completed: 'border-green-200 bg-green-50 text-green-700' };
                    return (
                        <div key={status} className="min-w-[300px] w-full md:w-1/4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-700 flex flex-col h-full">
                            <div className={`p-3 font-bold uppercase text-xs border-b dark:border-slate-700 flex justify-between items-center rounded-t-xl bg-white dark:bg-slate-800 dark:text-white`}>
                                <span className={`px-2 py-1 rounded border ${statusColors[status].replace('text-', 'text-opacity-80 ')} bg-white`}>{statusLabels[status]}</span>
                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{filteredOrders.filter(o=>o.status===status).length}</span>
                            </div>
                            <div className="p-2 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                {filteredOrders.filter(o=>o.status===status).map(o => (
                                    <div key={o.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm group relative hover:shadow-md transition-all">
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm z-10">
                                            <button type="button" onClick={()=>{setForm(o); setIsModalOpen(true)}} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded"><Edit size={14}/></button>
                                            <button type="button" onClick={()=>ops.delete(o.id, 'orders')} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14}/></button>
                                        </div>
                                        <div className="flex justify-between items-start mb-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPlatformColor(o.platform)}`}>{o.platform}</span><span className="text-[10px] text-slate-400">{o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '-'}</span></div>
                                        <div className="mb-3"><h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{o.customerName}</h4><p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{o.productName}</p></div>
                                        {o.note && (<div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg mb-3 border border-amber-100 dark:border-amber-800/30"><p className="text-[10px] text-amber-700 dark:text-amber-400 italic flex gap-1"><Info size={12} className="shrink-0 mt-0.5"/> {o.note}</p></div>)}
                                        <div className="flex items-center justify-between pt-2 border-t border-dashed dark:border-slate-700">
                                            <span className="font-bold text-blue-600">{o.price}₺</span>
                                            <div className="flex gap-1">
                                                {status !== 'new' && (<button type="button" onClick={()=>ops.update('orders', o.id, {status: status==='completed'?'shipped':status==='shipped'?'processing':'new'})} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400" title="Geri Al"><ArrowLeftCircle size={16}/></button>)}
                                                {status !== 'completed' && (<button type="button" onClick={()=>ops.update('orders', o.id, {status: status==='new'?'processing':status==='processing'?'shipped':'completed'})} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded text-green-500" title="İlerlet"><ArrowRight size={16}/></button>)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredOrders.filter(o=>o.status===status).length === 0 && (<div className="text-center py-10 opacity-30 flex flex-col items-center"><Trello size={32} className="mb-2"/><span className="text-xs">Sipariş Yok</span></div>)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl dark:text-white">{form.id ? 'Siparişi Düzenle' : 'Yeni Sipariş'}</h3><button type="button" onClick={()=>setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-600"/></button></div>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Müşteri Adı</label><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Ad Soyad" value={form.customerName||''} onChange={e=>setForm({...form, customerName:e.target.value})}/></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ürün / Hizmet Detayı</label><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Ürün adı, renk, beden..." value={form.productName||''} onChange={e=>setForm({...form, productName:e.target.value})}/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiyat (₺)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="0.00" value={form.price||''} onChange={e=>setForm({...form, price:e.target.value})}/></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Platform</label><select className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={form.platform||'Instagram'} onChange={e=>setForm({...form, platform:e.target.value})}>{platforms.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sipariş Notu</label><textarea className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white h-20 resize-none" placeholder="Kargo notu, özel istekler..." value={form.note||''} onChange={e=>setForm({...form, note:e.target.value})}/></div>
                            {form.id && (<div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statü</label><div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">{['new', 'processing', 'shipped', 'completed'].map(s => (<button key={s} type="button" onClick={()=>setForm({...form, status:s})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${form.status===s ? 'bg-white dark:bg-slate-600 shadow text-blue-600' : 'text-slate-400'}`}>{s === 'new' ? 'Yeni' : s === 'processing' ? 'Hazır' : s === 'shipped' ? 'Kargo' : 'Tamam'}</button>))}</div></div>)}
                            <button type="button" onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none mt-2">{form.id ? 'Değişiklikleri Kaydet' : 'Siparişi Oluştur'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlanningView = ({ todos, proposals, ideas, ops }) => {
    const [view, setView] = useState('tasks');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({});
    const [filterPriority, setFilterPriority] = useState('all');

    const pendingTasks = todos.filter(t => t.status === 'pending').length;
    const highPriorityTasks = todos.filter(t => t.status === 'pending' && t.priority === 'high').length;
    const pendingProposals = proposals.filter(p => p.status === 'pending').length;
    const filteredTodos = todos.filter(t => filterPriority === 'all' || t.priority === filterPriority);

    const handleSave = () => {
        const col = view === 'tasks' || view === 'calendar' ? 'todos' : view === 'proposals' ? 'proposals' : 'ideas';
        const data = { ...form, createdAt: serverTimestamp(), status: form.status || 'pending', priority: form.priority || 'medium' };
        if(view === 'ideas') data.isPinned = false;
        if(form.id) ops.update(col, form.id, data); else ops.add(col, data);
        setModal(false); setForm({});
    };

    const renderCalendar = () => {
        const days = Array.from({length: 30}, (_, i) => i + 1);
        const today = new Date().getDate();
        return (
            <div className="grid grid-cols-7 gap-2">{days.map(day => {
                const tasksForDay = todos.filter(t => t.endDate && new Date(t.endDate).getDate() === day && new Date(t.endDate).getMonth() === new Date().getMonth());
                return (<div key={day} className={`min-h-[100px] bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-2 flex flex-col ${day === today ? 'ring-2 ring-blue-500' : ''}`}><span className={`text-xs font-bold mb-1 ${day === today ? 'text-blue-600' : 'text-slate-400'}`}>{day}</span><div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">{tasksForDay.map(t => (<div key={t.id} onClick={()=>{setForm(t); setModal(true)}} className={`text-[9px] p-1 rounded border cursor-pointer truncate ${t.priority==='high'?'bg-red-50 text-red-600 border-red-100':'bg-blue-50 text-blue-600 border-blue-100'}`}>{t.title}</div>))}</div></div>);
            })}</div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Bekleyen Görev</p><p className="text-2xl font-black text-slate-800 dark:text-white">{pendingTasks}</p></div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Acil İşler</p><p className="text-2xl font-black text-red-600">{highPriorityTasks}</p></div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Açık Teklifler</p><p className="text-2xl font-black text-purple-600">{pendingProposals}</p></div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex items-center justify-center"><button type="button" onClick={()=>{setForm({}); setModal(true)}} className="w-full h-full bg-blue-600 text-white rounded-lg font-bold flex flex-col items-center justify-center gap-1 hover:bg-blue-700 transition-colors"><Plus size={24}/><span>Yeni Ekle</span></button></div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                <div className="flex gap-1 bg-white dark:bg-slate-700 p-1 rounded-lg shadow-sm w-full md:w-auto overflow-x-auto">{[{id:'tasks', label:'Görev Panosu', icon:ListTodo},{id:'calendar', label:'Takvim', icon:Calendar},{id:'proposals', label:'Teklifler', icon:FileSpreadsheet},{id:'ideas', label:'Fikirler', icon:Sparkles}].map(tab => (<button key={tab.id} type="button" onClick={() => setView(tab.id)} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${view === tab.id ? 'bg-slate-800 text-white dark:bg-slate-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-slate-300'}`}><tab.icon size={16}/> {tab.label}</button>))}</div>
                {view === 'tasks' && (<div className="flex items-center gap-2 text-sm font-bold text-slate-500"><Filter size={16}/><select className="bg-transparent outline-none cursor-pointer dark:text-slate-300" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}><option value="all">Tüm Öncelikler</option><option value="high">Yüksek Öncelik</option><option value="medium">Orta Öncelik</option><option value="low">Düşük Öncelik</option></select></div>)}
            </div>
            {view === 'calendar' && renderCalendar()}
            {view === 'tasks' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-320px)] overflow-hidden">{['pending', 'in_progress', 'completed'].map(status => (
                    <div key={status} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-700 flex flex-col h-full">
                        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 rounded-t-xl"><h4 className="font-bold uppercase text-xs text-slate-500">{status === 'pending' ? 'Yapılacak' : status === 'in_progress' ? 'Sürüyor' : 'Tamamlandı'}</h4><span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-bold">{filteredTodos.filter(t=>t.status===status).length}</span></div>
                        <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">{filteredTodos.filter(t=>t.status===status).map(t=>(<div key={t.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm group relative hover:shadow-md transition-all ${t.priority==='high' ? 'border-l-4 border-l-red-500' : 'dark:border-slate-700'}`}><div className="flex justify-between items-start mb-1"><h5 className={`font-bold text-sm ${status==='completed'?'line-through text-slate-400':'dark:text-white'}`}>{t.title}</h5>{t.endDate && new Date(t.endDate) < new Date() && status !== 'completed' && <AlertTriangle size={14} className="text-red-500" title="Gecikmiş"/>}</div><p className="text-xs text-slate-500 mb-3 line-clamp-2">{t.desc}</p><div className="flex justify-between items-center pt-2 border-t border-dashed dark:border-slate-700">{t.endDate && <span className={`text-[10px] flex items-center gap-1 ${t.endDate && new Date(t.endDate) < new Date() ? 'text-red-500 font-bold' : 'text-slate-400'}`}><Clock size={12}/> {new Date(t.endDate).toLocaleDateString()}</span>}<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">{status !== 'pending' && <button type="button" onClick={()=>ops.update('todos',t.id,{status:'pending'})} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowLeftCircle size={14}/></button>}<button type="button" onClick={()=>ops.delete(t.id,'todos')} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14}/></button>{status !== 'completed' && <button type="button" onClick={()=>ops.update('todos',t.id,{status:status==='pending'?'in_progress':'completed'})} className="p-1 hover:bg-green-50 text-green-500 rounded"><ArrowRight size={14}/></button>}</div></div></div>))}</div>
                    </div>
                ))}</div>
            )}
            {view === 'proposals' && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{proposals.map(p => (<div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm relative group hover:border-purple-300 transition-colors"><button type="button" onClick={()=>ops.delete(p.id,'proposals')} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={16}/></button><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center"><User size={20}/></div><div><h5 className="font-bold text-sm dark:text-white">{p.customer}</h5><span className={`text-[10px] px-2 py-0.5 rounded ${p.status==='accepted'?'bg-green-100 text-green-600':'bg-yellow-100 text-yellow-600'}`}>{p.status==='accepted'?'Onaylandı':'Bekliyor'}</span></div></div><div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mb-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{p.product}</div><div className="flex justify-between items-center"><span className="font-bold text-lg text-blue-600">{p.price}₺</span><div className="flex gap-2"><button type="button" onClick={()=>ops.update('proposals', p.id, {status:'rejected'})} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><X size={16}/></button><button type="button" onClick={()=>ops.update('proposals', p.id, {status:'accepted'})} className="p-2 hover:bg-green-50 text-green-500 rounded-lg"><Check size={16}/></button></div></div></div>))}</div>)}
            {view === 'ideas' && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{ideas.map(i => (<div key={i.id} className={`p-4 rounded-xl border shadow-sm relative group transition-all hover:-translate-y-1 ${i.isPinned ? 'bg-yellow-50 border-yellow-200' : 'bg-white dark:bg-slate-800 dark:border-slate-700'}`}><div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button type="button" onClick={()=>ops.update('ideas', i.id, {isPinned: !i.isPinned})} className="p-1.5 bg-white/50 rounded-full hover:bg-white"><Pin size={14} className={i.isPinned ? "fill-current text-yellow-600" : "text-slate-400"}/></button><button type="button" onClick={()=>ops.delete(i.id,'ideas')} className="p-1.5 bg-white/50 rounded-full hover:bg-white hover:text-red-500"><Trash2 size={14}/></button></div><span className="text-[10px] font-bold opacity-50 uppercase tracking-wider mb-2 block">{i.category}</span><h4 className="font-bold mb-2 dark:text-white leading-tight">{i.title}</h4><p className="text-sm opacity-80 dark:text-slate-300 whitespace-pre-wrap">{i.desc}</p></div>))}</div>)}
            {modal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl dark:text-white">Yeni {view === 'tasks' || view === 'calendar' ? 'Görev' : view === 'proposals' ? 'Teklif' : 'Fikir'}</h3><button type="button" onClick={()=>setModal(false)}><X/></button></div><div className="space-y-4"><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Başlık / Müşteri" value={form.title || form.customer || ''} onChange={e=>setForm({...form, [view==='proposals'?'customer':'title']:e.target.value})}/><textarea className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white h-24 resize-none" placeholder="Detaylar..." value={form.desc || form.product || ''} onChange={e=>setForm({...form, [view==='proposals'?'product':'desc']:e.target.value})}/>{(view === 'tasks' || view === 'calendar') && (<div className="grid grid-cols-2 gap-4"><input type="date" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={form.endDate||''} onChange={e=>setForm({...form, endDate:e.target.value})}/><select className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={form.priority||'medium'} onChange={e=>setForm({...form, priority:e.target.value})}><option value="low">Düşük</option><option value="medium">Orta</option><option value="high">Yüksek</option></select></div>)}{view === 'proposals' && <input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Fiyat" value={form.price||''} onChange={e=>setForm({...form, price:e.target.value})}/>}{view === 'ideas' && <input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Kategori" value={form.category||''} onChange={e=>setForm({...form, category:e.target.value})}/>}<button type="button" onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">Kaydet</button></div></div></div>)}
        </div>
    );
};

const WorkshopView = ({ printers, jobs, filaments, archive, ops }) => {
    const [view, setView] = useState('overview');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({});
    const [modelSearch, setModelSearch] = useState('');
    const [costCalc, setCostCalc] = useState({ weight: 0, hours: 0, filamentCost: 400, electricity: 5, profitMargin: 100 });
    const rawCost = (costCalc.weight * (costCalc.filamentCost / 1000)) + (costCalc.hours * costCalc.electricity);
    const sellPrice = rawCost * (1 + costCalc.profitMargin / 100);

    const searchModels = (e) => {
        e.preventDefault();
        if(!modelSearch) return;
        window.open(`https://www.thingiverse.com/search?q=${modelSearch}&type=things&sort=relevant`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm"><div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">{[{id:'overview', label:'Genel Bakış', icon:LayoutDashboard},{id:'queue', label:'İş Kuyruğu', icon:Layers},{id:'filaments', label:'Filamentler', icon:Palette},{id:'archive', label:'Arşiv', icon:Archive},{id:'calculator', label:'Maliyet', icon:Calculator}].map(tab => (<button key={tab.id} type="button" onClick={()=>setView(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${view===tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><tab.icon size={16}/> {tab.label}</button>))}</div><form onSubmit={searchModels} className="flex gap-2 w-full lg:w-auto"><div className="relative flex-1 lg:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="3D Model Ara..." value={modelSearch} onChange={e=>setModelSearch(e.target.value)}/></div><button type="submit" className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><ExternalLink size={18}/></button></form></div>
            {view === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{printers.map(p => (<div key={p.id} className={`p-5 rounded-2xl border-2 shadow-sm relative group transition-all ${p.status==='printing'?'border-green-500 bg-green-50':p.status==='maintenance'?'border-red-500 bg-red-50':'border-slate-200 bg-white'} dark:border-slate-700`}><button type="button" onClick={()=>ops.delete(p.id,'printers')} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-lg text-red-500 shadow-sm"><Trash2 size={14}/></button><div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${p.status==='printing'?'bg-green-500':p.status==='maintenance'?'bg-red-500':'bg-slate-400'}`}><Printer size={20}/></div><div><h4 className="font-bold text-slate-800">{p.name}</h4><span className="text-xs font-bold uppercase opacity-60">{p.status === 'printing' ? 'Basılıyor...' : p.status === 'maintenance' ? 'Bakımda' : 'Hazır'}</span></div></div></div><div className="grid grid-cols-3 gap-2 mt-4"><button type="button" onClick={()=>ops.update('printers',p.id,{status:'idle'})} className="py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200">Boşta</button><button type="button" onClick={()=>ops.update('printers',p.id,{status:'printing'})} className="py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-600 hover:bg-green-200">Başlat</button><button type="button" onClick={()=>ops.update('printers',p.id,{status:'maintenance'})} className="py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200">Bakım</button></div></div>))}<button type="button" onClick={()=>{setForm({}); setModal(true)}} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all min-h-[180px]"><Plus size={32} className="mb-2"/><span className="font-bold">Yeni Yazıcı Ekle</span></button></div>
            )}
            {view === 'queue' && (<div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Layers className="text-indigo-500"/> Bekleyen İşler</h3><div className="flex gap-2"><input className="p-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none w-48" placeholder="Dosya adı..." value={form.jobName || ''} onChange={e=>setForm({...form, jobName:e.target.value})}/><button type="button" onClick={()=>{if(form.jobName) ops.add('workshop_jobs', {name:form.jobName, status:'pending', createdAt: serverTimestamp()}); setForm({})}} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">Ekle</button></div></div><div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">{jobs.map(j => (<div key={j.id} className="flex justify-between items-center p-4 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${j.status==='done' ? 'bg-green-500' : 'bg-orange-500'}`}></div><span className={`font-medium ${j.status==='done'?'line-through text-slate-400':'dark:text-white'}`}>{j.name}</span></div><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button type="button" onClick={()=>ops.update('workshop_jobs',j.id,{status: j.status==='done'?'pending':'done'})} className={`p-2 rounded-lg ${j.status==='done'?'text-orange-500 bg-orange-50':'text-green-600 bg-green-50'}`}>{j.status==='done' ? <ArrowLeftCircle size={16}/> : <Check size={16}/>}</button><button type="button" onClick={()=>ops.delete(j.id,'workshop_jobs')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button></div></div>))}</div></div>)}
            {view === 'filaments' && (<div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Palette className="text-pink-500"/> Filament Stoğu</h3><div className="flex gap-2"><input className="p-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none" placeholder="Marka/Tür" value={form.filName||''} onChange={e=>setForm({...form, filName:e.target.value})}/><input type="color" className="h-9 w-12 p-1 border rounded-lg cursor-pointer bg-transparent" value={form.filColor||'#000000'} onChange={e=>setForm({...form, filColor:e.target.value})}/><button type="button" onClick={()=>{if(form.filName) ops.add('workshop_filaments', {name:form.filName, color:form.filColor||'#000000'}); setForm({...form, filName:''})}} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">Ekle</button></div></div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{filaments.map(f => (<div key={f.id} className="p-4 border dark:border-slate-700 rounded-xl flex flex-col items-center text-center relative group hover:shadow-md transition-all dark:bg-slate-900/50"><button type="button" onClick={()=>ops.delete(f.id, 'workshop_filaments')} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button><div className="w-16 h-16 rounded-full shadow-inner mb-3 border-4 border-white dark:border-slate-700" style={{backgroundColor: f.color}}></div><span className="font-bold text-sm dark:text-white truncate w-full">{f.name}</span></div>))}</div></div>)}
            {view === 'archive' && (<div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Archive className="text-orange-500"/> Baskı Arşivi</h3><button type="button" onClick={()=>{setForm({}); setModal(true)}} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-700 flex items-center gap-2"><Plus size={16}/> Kayıt Ekle</button></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-xs"><tr><th className="p-3">Model</th><th className="p-3">Gramaj</th><th className="p-3">Maliyet</th><th className="p-3">Link</th><th className="p-3 text-right">Sil</th></tr></thead><tbody>{archive.map(a => (<tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><td className="p-3 font-bold dark:text-white">{a.name}</td><td className="p-3 font-mono">{a.weight}g</td><td className="p-3 font-bold text-green-600">{a.cost}₺</td><td className="p-3">{a.link && <a href={a.link} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1"><Link size={14}/> Git</a>}</td><td className="p-3 text-right"><button type="button" onClick={()=>ops.delete(a.id, 'print_archive')} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div></div>)}
            {view === 'calculator' && (<div className="grid md:grid-cols-2 gap-6"><div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm"><h3 className="font-bold text-lg mb-6 dark:text-white flex items-center gap-2"><Calculator className="text-blue-500"/> Maliyet Parametreleri</h3><div className="space-y-4"><div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Model Ağırlığı (Gram)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" value={costCalc.weight} onChange={e=>setCostCalc({...costCalc, weight:Number(e.target.value)})}/></div><div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Baskı Süresi (Saat)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" value={costCalc.hours} onChange={e=>setCostCalc({...costCalc, hours:Number(e.target.value)})}/></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Filament (₺/kg)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" value={costCalc.filamentCost} onChange={e=>setCostCalc({...costCalc, filamentCost:Number(e.target.value)})}/></div><div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Elektrik (₺/saat)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" value={costCalc.electricity} onChange={e=>setCostCalc({...costCalc, electricity:Number(e.target.value)})}/></div></div><div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Kâr Marjı (%)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" value={costCalc.profitMargin} onChange={e=>setCostCalc({...costCalc, profitMargin:Number(e.target.value)})}/></div></div></div><div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-xl flex flex-col justify-center relative overflow-hidden"><Coins className="absolute top-0 right-0 p-8 opacity-20" size={200}/><div className="relative z-10 space-y-6"><div><p className="text-indigo-200 font-bold uppercase text-sm mb-1">Hammadde Maliyeti</p><p className="text-2xl font-mono">{((costCalc.weight * costCalc.filamentCost) / 1000).toFixed(2)}₺</p></div><div><p className="text-indigo-200 font-bold uppercase text-sm mb-1">Enerji/Amortisman</p><p className="text-2xl font-mono">{(costCalc.hours * costCalc.electricity).toFixed(2)}₺</p></div><div className="pt-6 border-t border-white/20"><p className="text-indigo-100 font-bold uppercase text-sm mb-2">Önerilen Satış Fiyatı</p><p className="text-6xl font-black tracking-tight">{sellPrice.toFixed(2)}₺</p><p className="text-sm mt-2 opacity-80">Toplam Maliyet: {rawCost.toFixed(2)}₺ • Kâr: {(sellPrice - rawCost).toFixed(2)}₺</p></div></div></div></div>)}
            {modal && view === 'overview' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl dark:text-white">Yeni Yazıcı Ekle</h3>
                            <button onClick={()=>setModal(false)}><X/></button>
                        </div>
                        <div className="space-y-4">
                            <input 
                                className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                                placeholder="Yazıcı Adı (Örn: Ender 3 V2)" 
                                value={form.name||''} 
                                onChange={e=>setForm({...form,name:e.target.value})}
                                autoFocus
                            />
                            <button 
                                onClick={()=>{
                                    if(!form.name) return alert("Lütfen bir isim giriniz");
                                    ops.add('printers', {name: form.name, status: 'idle'}); 
                                    setModal(false);
                                }} 
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {modal && view === 'archive' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl dark:text-white">Arşiv Kaydı Ekle</h3><button type="button" onClick={()=>setModal(false)}><X/></button></div><div className="space-y-4"><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" placeholder="Model Adı" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/><div className="flex gap-4"><input type="number" className="flex-1 p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" placeholder="Gramaj (g)" value={form.weight||''} onChange={e=>setForm({...form,weight:e.target.value})}/><input type="number" className="flex-1 p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" placeholder="Maliyet (₺)" value={form.cost||''} onChange={e=>setForm({...form,cost:e.target.value})}/></div><input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" placeholder="Link (Opsiyonel)" value={form.link||''} onChange={e=>setForm({...form,link:e.target.value})}/><button type="button" onClick={()=>{ops.add('print_archive', form); setModal(false); setForm({});}} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700">Kaydet</button></div></div></div>)}
        </div>
    );
};

// --- GÜNCELLENMİŞ MARKET (PAZAR) BİLEŞENİ ---
const MarketView = ({ markets, items, sales, expenses, ops }) => {
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [detailTab, setDetailTab] = useState('pos'); // pos, expenses, summary
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({});
    const [expenseForm, setExpenseForm] = useState({ desc: '', amount: '' });
    const [marketManualForm, setMarketManualForm] = useState({ name: '', price: '' });
    const [isMarketManualSaleOpen, setIsMarketManualSaleOpen] = useState(false);

    // Seçili market güncellendiğinde state'i güncelle
    useEffect(() => {
        if (selectedMarket) {
            const updatedMarket = markets.find(m => m.id === selectedMarket.id);
            if (updatedMarket) setSelectedMarket(updatedMarket);
        }
    }, [markets]);

    // Genel İstatistikler
    const totalRevenue = markets.reduce((a, m) => a + (m.totalRevenue || 0), 0);
    const totalExpenses = markets.reduce((a, m) => a + (m.totalExpenses || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Tarih Yardımcıları
    const isToday = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    };

    const getStatus = (dateStr) => {
        if (isToday(dateStr)) return { label: 'BUGÜN AKTİF', color: 'bg-green-100 text-green-700 border-green-200 animate-pulse' };
        if (new Date(dateStr) > new Date()) return { label: 'YAKLAŞIYOR', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        return { label: 'TAMAMLANDI', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    };

    // İşlemler
    const handleMarketSale = async (item) => {
        if (!selectedMarket) return;
        if (item.stock <= 0) return alert("Stok yetersiz!");
        
        await ops.update('inventory', item.id, {stock: Number(item.stock) - 1});
        await ops.add('sales_history', {
            productName: item.name, 
            quantity: 1, 
            totalPrice: Number(item.sellPrice), 
            unitPrice: Number(item.sellPrice),
            platform: `Pazar: ${selectedMarket.name}`,
            date: new Date().toLocaleDateString('tr-TR'),
            marketId: selectedMarket.id,
            createdAt: serverTimestamp()
        });
        
        const newRevenue = (selectedMarket.totalRevenue || 0) + Number(item.sellPrice);
        await ops.update('markets', selectedMarket.id, { totalRevenue: newRevenue });
        
        // UI Güncelleme (Anlık hissetmek için)
        setSelectedMarket({ ...selectedMarket, totalRevenue: newRevenue });
    };

    const handleMarketManualSale = async (e) => { 
        e.preventDefault(); 
        const p = Number(marketManualForm.price); 
        const newRev = (selectedMarket.totalRevenue||0)+p; 
        
        await ops.update('markets', selectedMarket.id, {totalRevenue:newRev}); 
        await ops.add('sales_history', {
            productName:marketManualForm.name, 
            quantity:1, 
            unitPrice:p, 
            totalPrice:p, 
            platform:`Pazar: ${selectedMarket.name} (Manuel)`, 
            marketId:selectedMarket.id, 
            date:new Date().toLocaleDateString('tr-TR'), 
            createdAt:serverTimestamp()
        }); 
        
        setSelectedMarket(prev=>({...prev, totalRevenue:newRev}));
        setIsMarketManualSaleOpen(false); 
    };

    const handleAddExpense = async () => {
        if(!expenseForm.amount || !selectedMarket) return;
        const amount = Number(expenseForm.amount);
        
        await ops.add('general_expenses', {
            description: `Pazar: ${selectedMarket.name} - ${expenseForm.desc}`,
            amount: amount,
            category: 'Pazar',
            marketId: selectedMarket.id,
            date: new Date().toLocaleDateString('tr-TR'),
            createdAt: serverTimestamp()
        });
        
        const newExpenses = (selectedMarket.totalExpenses || 0) + amount;
        await ops.update('markets', selectedMarket.id, { totalExpenses: newExpenses });
        
        setSelectedMarket({ ...selectedMarket, totalExpenses: newExpenses });
        setExpenseForm({ desc: '', amount: '' });
    };

    // Detay Modu (Pazarın İçindeyken)
    if (selectedMarket) {
        const marketSales = sales.filter(s => s.marketId === selectedMarket.id);
        const marketExpenses = expenses.filter(e => e.marketId === selectedMarket.id || (e.category === 'Pazar' && e.description.includes(selectedMarket.name)));
        const currentProfit = (selectedMarket.totalRevenue || 0) - (selectedMarket.totalExpenses || 0);

        return (
            <div className="space-y-6 animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
                {/* Pazar Başlığı ve Özet */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm shrink-0">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={()=>setSelectedMarket(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><ArrowLeftCircle size={24}/></button>
                            <div>
                                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                    {selectedMarket.name} 
                                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">{new Date(selectedMarket.date).toLocaleDateString('tr-TR')}</span>
                                </h2>
                                <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12}/> {selectedMarket.location || 'Konum belirtilmedi'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-right bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                            <div className="px-2 border-r border-slate-200 dark:border-slate-700">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Ciro</p>
                                <p className="font-bold text-green-600">+{selectedMarket.totalRevenue || 0}₺</p>
                            </div>
                            <div className="px-2 border-r border-slate-200 dark:border-slate-700">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Gider</p>
                                <p className="font-bold text-red-500">-{selectedMarket.totalExpenses || 0}₺</p>
                            </div>
                            <div className="px-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Net</p>
                                <p className={`font-bold ${currentProfit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{currentProfit}₺</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Sekmeler */}
                    <div className="flex gap-1 mt-4 border-t dark:border-slate-700 pt-4">
                        <button onClick={()=>setDetailTab('pos')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${detailTab==='pos' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><ShoppingCart size={16}/> Satış Yap</button>
                        <button onClick={()=>setDetailTab('expenses')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${detailTab==='expenses' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><Wallet size={16}/> Giderler</button>
                        <button onClick={()=>setDetailTab('summary')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${detailTab==='summary' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><FileSpreadsheet size={16}/> Özet Rapor</button>
                    </div>
                </div>

                {/* Sekme İçerikleri */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm flex flex-col">
                    {detailTab === 'pos' && (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <Search size={18} className="text-slate-400"/>
                                    <input className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 dark:text-white" placeholder="Ürün Ara..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
                                </div>
                                <button onClick={() => setIsMarketManualSaleOpen(true)} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center gap-1"><PenTool size={14}/> Manuel</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {items.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                                        <button key={item.id} disabled={item.stock <= 0} onClick={() => handleMarketSale(item)} className="p-3 border dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all group flex flex-col relative bg-white dark:bg-slate-800">
                                            <div className="absolute top-2 right-2 bg-slate-100 dark:bg-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-500">{item.stock}</div>
                                            <div className="aspect-square mb-2 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                                                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover"/> : <Package className="text-slate-300"/>}
                                            </div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 mb-1">{item.name}</p>
                                            <p className="text-blue-600 font-bold">{item.sellPrice}₺</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {detailTab === 'expenses' && (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold mb-4 dark:text-white">Yeni Gider Ekle</h3>
                                <div className="flex gap-2">
                                    <input className="flex-1 p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Açıklama (Örn: Yemek, Otopark)" value={expenseForm.desc} onChange={e=>setExpenseForm({...expenseForm, desc:e.target.value})}/>
                                    <input type="number" className="w-32 p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Tutar" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount:e.target.value})}/>
                                    <button onClick={handleAddExpense} className="bg-red-600 text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-colors">Kaydet</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400"><tr><th className="p-3">Açıklama</th><th className="p-3 text-right">Tutar</th><th className="p-3 text-right">Sil</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {marketExpenses.map(e => (
                                            <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="p-3 font-medium dark:text-white">{e.description.replace(`Pazar: ${selectedMarket.name} - `, '')}</td>
                                                <td className="p-3 text-right text-red-500 font-bold">-{e.amount}₺</td>
                                                <td className="p-3 text-right"><button onClick={()=>ops.delete(e.id, 'general_expenses')} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button></td>
                                            </tr>
                                        ))}
                                        {marketExpenses.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400">Henüz gider eklenmedi.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {detailTab === 'summary' && (
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><Activity size={20}/> Satış Özeti</h3>
                            <div className="space-y-2">
                                {Object.values(marketSales.reduce((acc, sale) => {
                                    if (!acc[sale.productName]) acc[sale.productName] = { name: sale.productName, qty: 0, total: 0 };
                                    acc[sale.productName].qty += sale.quantity;
                                    acc[sale.productName].total += sale.totalPrice;
                                    return acc;
                                }, {})).sort((a,b) => b.total - a.total).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 dark:bg-slate-700 text-slate-500 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">{idx+1}</div>
                                            <span className="font-medium dark:text-white">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded mr-2">{item.qty} Adet</span>
                                            <span className="font-bold text-green-600">{item.total}₺</span>
                                        </div>
                                    </div>
                                ))}
                                {marketSales.length === 0 && <div className="text-center text-slate-400 py-10">Henüz satış yapılmadı.</div>}
                            </div>
                        </div>
                    )}
                </div>
                 {isMarketManualSaleOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in">
                            <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl text-slate-800 dark:text-white">Pazarda Manuel Satış</h3><button onClick={() => setIsMarketManualSaleOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button></div>
                            <form onSubmit={handleMarketManualSale} className="space-y-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ürün / Hizmet Adı</label><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" placeholder="Örn: Özel Tasarım, İndirimli Ürün" value={marketManualForm.name} onChange={e=>setMarketManualForm({...marketManualForm, name:e.target.value})} autoFocus /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Satış Fiyatı (₺)</label><input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" placeholder="0.00" value={marketManualForm.price} onChange={e=>setMarketManualForm({...marketManualForm, price:e.target.value})} /></div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300"><InfoIcon size={14} className="inline mr-1"/> Bu işlem stoktan düşmez, sadece pazar cirosuna ve satış geçmişine eklenir.</div>
                                <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl font-bold mt-2 hover:bg-green-700 transition-colors">Satışı Onayla</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Liste Modu (Genel Görünüm)
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Pazar Etkinlikleri</h2>
                <button type="button" onClick={()=>{setForm({}); setModal(true)}} className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 flex items-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none transition-all"><Plus size={20}/> Yeni Pazar</button>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div><p className="text-xs text-slate-500 font-bold uppercase">Toplam Pazar Cirosu</p><p className="text-2xl font-black text-slate-800 dark:text-white">{totalRevenue}₺</p></div>
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg"><Coins size={24}/></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div><p className="text-xs text-slate-500 font-bold uppercase">Toplam Kâr</p><p className="text-2xl font-black text-blue-600">{netProfit}₺</p></div>
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><TrendingUp size={24}/></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div><p className="text-xs text-slate-500 font-bold uppercase">Düzenlenen Etkinlik</p><p className="text-2xl font-black text-purple-600">{markets.length}</p></div>
                    <div className="bg-purple-50 text-purple-600 p-3 rounded-lg"><Store size={24}/></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markets.map(m => {
                    const status = getStatus(m.date);
                    return (
                        <div key={m.id} onClick={()=>setSelectedMarket(m)} className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative flex flex-col h-full">
                            <button onClick={(e)=>{e.stopPropagation(); ops.delete(m.id,'markets')}} className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-700/90 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={16}/></button>
                            
                            <div className="h-28 bg-gradient-to-br from-orange-400 to-pink-600 p-6 text-white relative">
                                <div className={`absolute top-4 left-4 px-2 py-1 rounded text-[10px] font-bold border ${status.color} bg-white/90 backdrop-blur-sm`}>{status.label}</div>
                                <div className="absolute bottom-4 left-6">
                                    <h3 className="font-bold text-xl drop-shadow-md">{m.name}</h3>
                                    <div className="text-sm opacity-90 flex gap-2 items-center mt-1"><Calendar size={12}/> {new Date(m.date).toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col justify-center">
                                {m.location && <p className="text-xs text-slate-500 mb-4 flex items-center gap-1"><MapPin size={12}/> {m.location}</p>}
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Ciro</p>
                                        <p className="font-bold text-green-600 text-lg">{m.totalRevenue||0}₺</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Kâr</p>
                                        <p className="font-bold text-blue-600 text-lg">{(m.totalRevenue||0)-(m.totalExpenses||0)}₺</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 text-center border-t dark:border-slate-700 text-xs font-bold text-slate-500 group-hover:text-orange-600 transition-colors">
                                Yönetmek İçin Tıkla
                            </div>
                        </div>
                    );
                })}
                
                {/* Yeni Ekle Kartı */}
                <button onClick={()=>{setForm({}); setModal(true)}} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all min-h-[250px]">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform"><Plus size={32}/></div>
                    <span className="font-bold">Yeni Etkinlik Planla</span>
                </button>
            </div>

            {/* Yeni Pazar Modalı */}
            {modal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl dark:text-white">Yeni Pazar Etkinliği</h3><button onClick={()=>setModal(false)}><X className="text-slate-400 hover:text-slate-600"/></button></div>
                        <div className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Etkinlik Adı</label><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Örn: Tasarım Tomtom" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Konum</label><input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Örn: Beyoğlu" value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})}/></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tarih</label><input type="date" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                            <button onClick={()=>{ops.add('markets', {name:form.name, location:form.location, date:form.date, totalRevenue:0, totalExpenses:0}); setModal(false)}} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 dark:shadow-none">Etkinliği Oluştur</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- GÜNCELLENMİŞ MUHASEBE BİLEŞENİ ---
const AccountingView = ({ expenses, sales, ops }) => {
    const [filterTime, setFilterTime] = useState('all'); 
    const [filterType, setFilterType] = useState('all');
    const [form, setForm] = useState({});

    // Verileri Birleştir ve Hazırla
    const allTransactions = useMemo(() => {
        const income = sales.map(s => ({
            id: s.id,
            type: 'income',
            desc: s.productName,
            amount: Number(s.totalPrice),
            category: 'Satış',
            date: s.date,
            // Eğer createdAt yoksa şimdiki zamanı kullan (sıralama hatasını önler)
            dateObj: s.createdAt ? new Date(s.createdAt.seconds * 1000) : new Date()
        }));
        
        const expense = expenses.map(e => ({
            id: e.id,
            type: 'expense',
            desc: e.description,
            amount: Number(e.amount),
            category: e.category || 'Diğer',
            date: e.date,
            dateObj: e.createdAt ? new Date(e.createdAt.seconds * 1000) : new Date()
        }));

        return [...income, ...expense].sort((a,b) => b.dateObj - a.dateObj);
    }, [sales, expenses]);

    // Filtreleme
    const filtered = allTransactions.filter(t => {
        const isTypeMatch = filterType === 'all' || t.type === filterType;
        // Tarih kontrolü
        const isTimeMatch = filterTime === 'all' || (
            t.dateObj.getMonth() === new Date().getMonth() && 
            t.dateObj.getFullYear() === new Date().getFullYear()
        );
        return isTypeMatch && isTimeMatch;
    });

    // Hesaplamalar
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    // Kategori Özeti (Sadece Giderler İçin)
    const categorySummary = filtered.filter(t => t.type === 'expense').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Üst Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Toplam Gelir</p>
                    <div className="flex justify-between items-center">
                        <p className="text-2xl font-black text-green-600">+{totalIncome}₺</p>
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg"><TrendingUp size={20}/></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Toplam Gider</p>
                    <div className="flex justify-between items-center">
                        <p className="text-2xl font-black text-red-600">-{totalExpense}₺</p>
                        <div className="bg-red-100 text-red-600 p-2 rounded-lg"><TrendingDown size={20}/></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Net Kâr</p>
                    <div className="flex justify-between items-center">
                        <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{netProfit}₺</p>
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Wallet size={20}/></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Kâr Marjı</p>
                    <div className="flex justify-between items-center">
                        <p className="text-2xl font-black text-purple-600">%{profitMargin}</p>
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><PieChart size={20}/></div>
                    </div>
                </div>
            </div>

            {/* Bütçe Görselleştirme */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold dark:text-white">Bütçe Dengesi</h3>
                    <div className="flex gap-2 text-sm font-bold">
                        <button type="button" onClick={()=>setFilterTime('month')} className={`px-3 py-1 rounded transition-colors ${filterTime==='month'?'bg-slate-800 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 text-slate-500'}`}>Bu Ay</button>
                        <button type="button" onClick={()=>setFilterTime('all')} className={`px-3 py-1 rounded transition-colors ${filterTime==='all'?'bg-slate-800 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 text-slate-500'}`}>Tüm Zamanlar</button>
                    </div>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 0}%` }}></div>
                    <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 0}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2 text-slate-500">
                    <span className="text-green-600">Gelir %{(totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 0).toFixed(0)}</span>
                    <span className="text-red-600">Gider %{(totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 0).toFixed(0)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol: İşlem Ekleme & Kategori Özeti */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white"><Banknote size={20} className="text-blue-500"/> Hızlı Gider Ekle</h3>
                        <div className="space-y-4">
                            <select className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none" value={form.category||'Genel'} onChange={e=>setForm({...form, category:e.target.value})}>
                                <option value="Genel">Genel</option><option value="Malzeme">Malzeme</option><option value="Kargo">Kargo</option><option value="Yemek">Yemek</option><option value="Fatura">Fatura</option><option value="Pazar">Pazar</option>
                            </select>
                            <input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none" placeholder="Açıklama" value={form.desc||''} onChange={e=>setForm({...form, desc:e.target.value})}/>
                            <input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none" placeholder="Tutar" value={form.amount||''} onChange={e=>setForm({...form, amount:e.target.value})}/>
                            <button type="button" onClick={()=>{if(form.amount) ops.add('general_expenses', {description:form.desc, amount:Number(form.amount), category:form.category, date:new Date().toLocaleDateString('tr-TR'), createdAt: serverTimestamp()}); setForm({})}} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100 dark:shadow-none">Kaydet</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold mb-4 dark:text-white text-sm uppercase text-slate-500">Gider Dağılımı</h3>
                        <div className="space-y-3">
                            {Object.entries(categorySummary).sort((a,b)=>b[1]-a[1]).map(([cat, val]) => (
                                <div key={cat} className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-600 dark:text-slate-300">{cat}</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{val}₺</span>
                                </div>
                            ))}
                            {Object.keys(categorySummary).length === 0 && <div className="text-slate-400 text-xs italic">Veri yok.</div>}
                        </div>
                    </div>
                </div>

                {/* Sağ: İşlem Listesi */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 flex flex-col overflow-hidden shadow-sm h-[600px]">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <h3 className="font-bold dark:text-white">Hesap Hareketleri</h3>
                        <div className="flex gap-2">
                            <button type="button" onClick={()=>setFilterType('all')} className={`text-xs font-bold px-3 py-1 rounded-full ${filterType==='all'?'bg-slate-200 text-slate-800':'text-slate-400'}`}>Tümü</button><button type="button" onClick={()=>setFilterType('income')} className={`text-xs font-bold px-3 py-1 rounded-full ${filterType==='income'?'bg-green-100 text-green-700':'text-slate-400'}`}>Gelir</button><button type="button" onClick={()=>setFilterType('expense')} className={`text-xs font-bold px-3 py-1 rounded-full ${filterType==='expense'?'bg-red-100 text-red-700':'text-slate-400'}`}>Gider</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                        {filtered.map((t) => (
                            <div key={t.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${t.type==='income'?'bg-green-100 text-green-600':'bg-red-100 text-red-600'}`}>
                                        {t.type==='income'?<ArrowDownRight size={20}/>:<ArrowUpRight size={20}/>}
                                    </div>
                                    <div>
                                        <p className="font-bold dark:text-white text-sm line-clamp-1">{t.desc}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{t.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{t.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <p className={`font-black text-lg ${t.type==='income'?'text-green-600':'text-red-600'}`}>{t.type==='income'?'+':'-'}{t.amount}₺</p>
                                    <button type="button" onClick={() => {
                                        let delType = 'general_expenses';
                                        if (t.type === 'income') {
                                            delType = 'sales_history';
                                        } else {
                                            delType = 'general_expenses';
                                        }
                                        ops.delete(t.id, delType);
                                    }} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2"><Filter size={32} className="opacity-50"/><p>İşlem bulunamadı.</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- GÜNCELLENMİŞ ALINACAKLAR (SHOPPING) BİLEŞENİ ---
const ShoppingView = ({ items, ops }) => {
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({});

    // İstatistikler
    const totalItems = items.length;
    const completedItems = items.filter(i => i.completed).length;
    const estimatedCost = items.filter(i => !i.completed).reduce((acc, i) => acc + (Number(i.estimatedCost) || 0), 0);
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const filteredItems = items.filter(i => {
        if (filter === 'pending') return !i.completed;
        if (filter === 'completed') return i.completed;
        return true;
    }).sort((a,b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

    const handleSave = () => {
        const data = { 
            text: form.text, 
            category: form.category || 'Genel',
            priority: form.priority || 'medium',
            estimatedCost: Number(form.estimatedCost),
            link: form.link,
            completed: false, 
            createdAt: serverTimestamp() 
        };
        ops.add('shopping', data);
        setModal(false); setForm({});
    };

    const getPriorityBadge = (p) => {
        switch(p) {
            case 'high': return <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded border border-red-200 font-bold uppercase">Acil</span>;
            case 'medium': return <span className="bg-yellow-100 text-yellow-600 text-[10px] px-2 py-0.5 rounded border border-yellow-200 font-bold uppercase">Normal</span>;
            default: return <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded border border-blue-200 font-bold uppercase">Düşük</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Üst Bilgi Kartı */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><ShoppingBag className="text-orange-500"/> Alışveriş Listesi</h2>
                        <p className="text-sm text-slate-500 mt-1">Tahmini Tutar: <span className="font-bold text-slate-800 dark:text-white">{estimatedCost}₺</span></p>
                    </div>
                    <button type="button" onClick={()=>{setForm({}); setModal(true)}} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-blue-700"><Plus size={16}/> Ekle</button>
                </div>
                
                {/* İlerleme Çubuğu */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>{completedItems}/{totalItems} Tamamlandı</span>
                    <span>%{progress.toFixed(0)}</span>
                </div>
            </div>

            {/* Filtreler */}
            <div className="flex gap-2 border-b dark:border-slate-700 pb-2 overflow-x-auto">
                {['all', 'pending', 'completed'].map(f => (
                    <button type="button" key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${filter===f ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                        {f === 'all' ? 'Tümü' : f === 'pending' ? 'Alınacaklar' : 'Tamamlananlar'}
                    </button>
                ))}
            </div>

            {/* Liste */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm group relative hover:shadow-md transition-all ${item.completed ? 'opacity-60 border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-600'}`}>
                        <div className="flex items-start gap-3">
                            <button type="button" onClick={()=>ops.update('shopping', item.id, {completed: !item.completed})} className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-blue-500'}`}>
                                {item.completed && <Check size={14}/>}
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-1">
                                    {getPriorityBadge(item.priority)}
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 uppercase font-bold">{item.category}</span>
                                </div>
                                <h4 className={`font-bold text-sm mb-1 ${item.completed ? 'line-through text-slate-400' : 'dark:text-white'}`}>{item.text}</h4>
                                {item.estimatedCost > 0 && <p className="text-xs font-bold text-slate-500">~{item.estimatedCost}₺</p>}
                                
                                {item.link && (
                                    <a href={item.link} target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                        <Link size={12}/> Linke Git
                                    </a>
                                )}
                            </div>
                            <button type="button" onClick={()=>ops.delete(item.id, 'shopping')} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl dark:text-white">Yeni Ekle</h3><button type="button" onClick={()=>setModal(false)}><X/></button></div>
                        <div className="space-y-4">
                            <input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Ne alınacak?" value={form.text||''} onChange={e=>setForm({...form, text:e.target.value})}/>
                            <div className="grid grid-cols-2 gap-4">
                                <select className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={form.category||'Genel'} onChange={e=>setForm({...form, category:e.target.value})}>
                                    <option value="Genel">Genel</option><option value="Malzeme">Malzeme</option><option value="Ofis">Ofis</option><option value="Mutfak">Mutfak</option><option value="Elektronik">Elektronik</option>
                                </select>
                                <select className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={form.priority||'medium'} onChange={e=>setForm({...form, priority:e.target.value})}>
                                    <option value="low">Düşük</option><option value="medium">Normal</option><option value="high">Acil</option>
                                </select>
                            </div>
                            <input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Tahmini Tutar (Opsiyonel)" value={form.estimatedCost||''} onChange={e=>setForm({...form, estimatedCost:e.target.value})}/>
                            <input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Link (Opsiyonel)" value={form.link||''} onChange={e=>setForm({...form, link:e.target.value})}/>
                            <button type="button" onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Listeye Ekle</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
// --- TRENDYOL ENTEGRASYON BİLEŞENİ (OTOMATİK GİRİŞLİ) ---
const TrendyolView = ({ ops }) => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    
    // BİLGİLER BURAYA GÖMÜLDÜ
    const [creds, setCreds] = useState({
        sellerId: "376308",
        apiKey: "9eXV6icsPUn67B54dtd4",
        apiSecret: "rHjrH8ep9wv4MElIgrFz"
    });

    // Kaydetmeye gerek kalmadı ama yine de manuel değişiklik yapılırsa diye dursun
    const saveCreds = () => {
        localStorage.setItem('ty_sellerId', creds.sellerId);
        localStorage.setItem('ty_apiKey', creds.apiKey);
        localStorage.setItem('ty_apiSecret', creds.apiSecret);
        alert("Bilgiler tarayıcı hafızasına da alındı!");
    };

    const fetchTrendyol = async () => {
    setLoading(true);
    try {
        // DİKKAT: Aşağıdaki https://... kısmına Render'dan aldığın linki yapıştır!
        const res = await fetch('https://berilden-api.onrender.com/api/trendyol-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
            // body sildik, çünkü şifreler sunucuda!
        });
            
            const result = await res.json();
            
            if(result.success) {
                setOrders(result.data);
                if(result.data.length === 0) alert("Belirtilen tarihlerde yeni sipariş bulunamadı.");
            } else {
                alert("Hata: " + (result.error || "Bilinmeyen bir hata oluştu"));
            }
        } catch (error) {
            alert("Sunucuya bağlanılamadı. Terminalde 'node server.js' komutunu çalıştırdınız mı?");
        } finally {
            setLoading(false);
        }
    };

    const importOrder = async (order) => {
        // Trendyol verisini bizim sisteme uyarlıyoruz
        const newOrder = {
            customerName: `${order.customerFirstName} ${order.customerLastName}`,
            productName: order.lines[0]?.productName || 'Belirsiz Ürün',
            price: order.grossAmount,
            platform: 'Trendyol',
            status: 'new',
            note: `Sipariş No: ${order.orderNumber} - Kargo: ${order.cargoTrackingNumber}`,
            createdAt: serverTimestamp()
        };

        await ops.add('orders', newOrder);
        // Eklenen siparişi listeden çıkar (görsel olarak)
        setOrders(orders.filter(o => o.orderNumber !== order.orderNumber));
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* API Ayarları */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">T</div>
                    Trendyol Entegrasyonu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="opacity-50 pointer-events-none">
                        <label className="text-xs text-slate-400 block mb-1">Satıcı ID</label>
                        <input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={creds.sellerId} readOnly/>
                    </div>
                    <div className="opacity-50 pointer-events-none">
                        <label className="text-xs text-slate-400 block mb-1">API Key</label>
                        <input className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={creds.apiKey} readOnly/>
                    </div>
                    <div className="opacity-50 pointer-events-none">
                        <label className="text-xs text-slate-400 block mb-1">API Secret</label>
                        <input type="password" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={creds.apiSecret} readOnly/>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchTrendyol} disabled={loading} className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 flex justify-center items-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none transition-all">
                        {loading ? <RefreshCw className="animate-spin"/> : <ArrowDownRight/>} SİPARİŞLERİ ÇEK
                    </button>
                </div>
            </div>

            {/* Sipariş Listesi */}
            {orders.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map(o => (
                        <div key={o.orderNumber} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-orange-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><Box size={10}/> {o.orderNumber}</span>
                                    <span className="text-xs text-slate-400">{new Date(o.createdDate).toLocaleDateString('tr-TR')}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{o.cargoTrackingNumber}</span>
                                </div>
                                <h4 className="font-bold dark:text-white text-lg">{o.customerFirstName} {o.customerLastName}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-300 flex items-center gap-1"><Package size={14}/> {o.lines[0]?.productName} <span className="text-xs opacity-50">({o.lines[0]?.quantity} Adet)</span></p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <p className="text-2xl font-black text-orange-600">{o.grossAmount}₺</p>
                                <button onClick={() => importOrder(o)} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md shadow-blue-100 dark:shadow-none">
                                    <Plus size={16}/> Sisteme Ekle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- HEPSİBURADA ENTEGRASYON BİLEŞENİ (EKSİK OLAN PARÇA) ---
const HepsiburadaView = ({ ops }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // BİLGİLER GÖMÜLDÜ
    const [creds] = useState({ 
        merchantId: "185984e9-ec40-46c6-9745-edd35bce9b7e", 
        username: "softtr_dev", 
        password: "c49hZmQ8g5Yy" 
    });

    const fetchHepsiburada = async () => {
    setLoading(true);
    try {
        // DİKKAT: Aşağıdaki https://... kısmına Render'dan aldığın linki yapıştır!
        const res = await fetch('https://berilden-api.onrender.com/api/hepsiburada-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
            // body sildik, çünkü şifreler sunucuda!
        });
            const result = await res.json();
            
            if(result.success) {
                setOrders(result.data);
                if(result.data.length === 0) alert("Yeni sipariş bulunamadı.");
            } else {
                alert("Hata: " + (result.error || "Bağlantı sağlanamadı."));
            }
        } catch (e) { 
            alert("Sunucu hatası! Terminalde 'node server.js' çalışıyor mu?"); 
        }
        setLoading(false);
    };

    const importOrder = async (order) => {
        await ops.add('orders', {
            customerName: order.customer ? order.customer.name : "Hepsiburada Müşterisi",
            productName: order.items ? order.items[0].productName : "HB Ürünü",
            price: order.totalPrice.amount,
            platform: 'Hepsiburada',
            status: 'new',
            note: `Sipariş No: ${order.orderNumber}`,
            createdAt: serverTimestamp()
        });
        setOrders(orders.filter(o => o.orderNumber !== order.orderNumber));
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-orange-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-bold dark:text-white mb-4 text-orange-600 flex items-center gap-2">
                    Hepsiburada Entegrasyonu
                </h2>
                <div className="bg-orange-50 text-orange-800 p-3 rounded-lg mb-4 text-xs">
                    ✅ API Bilgileri Tanımlı: {creds.merchantId}
                </div>
                <button onClick={fetchHepsiburada} disabled={loading} className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 dark:shadow-none flex justify-center items-center gap-2">
                    {loading ? 'Bağlanıyor...' : 'SİPARİŞLERİ ÇEK'}
                </button>
            </div>

            {orders.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {orders.map(o => (
                        <div key={o.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <h4 className="font-bold dark:text-white">{o.customer ? o.customer.name : 'Müşteri Adı Gizli'}</h4>
                                <p className="text-sm text-slate-500">{o.orderNumber} • {o.items ? o.items[0].productName : 'Ürün'}</p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <p className="font-bold text-orange-600 text-lg">{o.totalPrice.amount}₺</p>
                                <button onClick={()=>importOrder(o)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">
                                    Sisteme Al
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- ÇİÇEKSEPETİ ENTEGRASYON BİLEŞENİ (HAZIR) ---
const CiceksepetiView = ({ ops }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // BİLGİLER GÖMÜLDÜ
    const [apiKey] = useState("NhHlBcIq3JYvXZv8wKtBfv33h0xn6qL63NgASFMg");

    const fetchCiceksepeti = async () => {
        setLoading(true);
    try {
        // DİKKAT: Aşağıdaki https://... kısmına Render'dan aldığın linki yapıştır!
        const res = await fetch('https://berilden-api.onrender.com/api/ciceksepeti-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
            // body sildik, çünkü şifreler sunucuda!
        });
            const result = await res.json();
            if(result.success) {
                setOrders(result.data);
                if(result.data.length === 0) alert("Yeni sipariş bulunamadı.");
            } else {
                alert("Hata: " + (result.error || "Bağlantı sağlanamadı."));
            }
        } catch (e) { alert("Sunucu hatası!"); }
        setLoading(false);
    };

    const importOrder = async (order) => {
        await ops.add('orders', {
            customerName: order.receiverName,
            productName: order.orderItems ? order.orderItems[0].productName : "Çiçeksepeti Ürünü",
            price: order.totalPrice,
            platform: 'Çiçeksepeti',
            status: 'new',
            note: `Sipariş No: ${order.orderId}`,
            createdAt: serverTimestamp()
        });
        setOrders(orders.filter(o => o.orderId !== order.orderId));
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-blue-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-bold dark:text-white mb-4 text-blue-600">Çiçeksepeti Entegrasyonu</h2>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-xs">
                    ✅ API Anahtarı Tanımlı
                </div>
                <button onClick={fetchCiceksepeti} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 dark:shadow-none">
                    {loading ? 'Bağlanıyor...' : 'SİPARİŞLERİ ÇEK'}
                </button>
            </div>

            {orders.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {orders.map(o => (
                        <div key={o.orderId} className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <h4 className="font-bold dark:text-white">{o.receiverName}</h4>
                                <p className="text-sm text-slate-500">{o.orderId}</p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <p className="font-bold text-blue-600 text-lg">{o.totalPrice}₺</p>
                                <button onClick={()=>importOrder(o)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700">
                                    Sisteme Al
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- SOFTTR ENTEGRASYON ---
const SofttrView = ({ ops }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSofttr = async () => {
        setLoading(true);
        try {
            // Render sunucumuzdaki adrese istek atıyoruz
            const res = await fetch('https://berilden-api.onrender.com/api/softtr-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await res.json();
            
            if(result.success) {
                // Fiyatı 0'dan büyük olanları alalım
                const validOrders = result.data.filter(o => o.price > 0 || o.price > "0"); 
                setOrders(validOrders);
                if(validOrders.length === 0) alert("Sipariş listesi boş geldi. (Sütun isimleri uyuşmuyor olabilir)");
            } else {
                alert("Hata: " + (result.error || "Bilinmeyen hata"));
            }
        } catch (error) {
            alert("Sunucu hatası! Lütfen 1 dakika bekleyip tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const importOrder = async (order) => {
        await ops.add('orders', {
            customerName: order.customerName,
            productName: order.productName,
            price: parseFloat(order.price),
            platform: 'Berildenn.com',
            status: 'new',
            note: `Web Siparişi No: ${order.orderNumber}`,
            createdAt: serverTimestamp()
        });
        setOrders(orders.filter(o => o.orderNumber !== order.orderNumber));
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-purple-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-bold dark:text-white mb-4 text-purple-600">Berildenn.com Entegrasyonu</h2>
                <div className="bg-purple-50 text-purple-800 p-3 rounded-lg mb-4 text-xs">
                    ✅ Excel Bağlantısı Aktif
                </div>
                <button onClick={fetchSofttr} disabled={loading} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100 dark:shadow-none flex justify-center items-center gap-2">
                    {loading ? 'Bağlanıyor...' : 'SİTEDEN SİPARİŞLERİ ÇEK'}
                </button>
            </div>

            {orders.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {orders.map((o, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <h4 className="font-bold dark:text-white">{o.customerName}</h4>
                                <p className="text-sm text-slate-500">#{o.orderNumber} • {o.productName}</p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <p className="font-bold text-purple-600 text-lg">{o.price}₺</p>
                                <button onClick={()=>importOrder(o)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700">
                                    Sisteme Al
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- BİRLEŞTİRİLMİŞ PAZARYERİ SAYFASI ---
const MarketplacesView = ({ ops }) => {
    const [activeTab, setActiveTab] = useState('trendyol');

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Üst Sekmeler */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Globe className="text-blue-500"/> Pazaryeri Entegrasyonları
                    </h2>
                    <p className="text-sm text-slate-500">Tüm mağazalarınızı tek ekrandan yönetin.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg mt-4 md:mt-0 overflow-x-auto w-full md:w-auto">
                    <button onClick={() => setActiveTab('trendyol')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'trendyol' ? 'bg-white dark:bg-slate-700 shadow text-orange-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        Trendyol
                    </button>
                    <button onClick={() => setActiveTab('hepsiburada')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'hepsiburada' ? 'bg-white dark:bg-slate-700 shadow text-orange-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        Hepsiburada
                    </button>
                    <button onClick={() => setActiveTab('ciceksepeti')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ciceksepeti' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        Çiçeksepeti
                    </button>
                    <button onClick={() => setActiveTab('softtr')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'softtr' ? 'bg-white dark:bg-slate-700 shadow text-purple-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        Berildenn
                    </button>
                </div>
            </div>

            {/* Seçili Olan İçeriği Göster */}
            <div className="min-h-[500px]">
                {activeTab === 'trendyol' && <TrendyolView ops={ops} />}
                {activeTab === 'hepsiburada' && <HepsiburadaView ops={ops} />}
                {activeTab === 'ciceksepeti' && <CiceksepetiView ops={ops} />}
                {activeTab === 'softtr' && <SofttrView ops={ops} />}
            </div>
        </div>
    );
};

// --- ANA UYGULAMA ---
// --- ANA UYGULAMA (MainApp) ---
function MainApp() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Menü durumu
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [notification, setNotification] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const [data, setData] = useState({ items: [], orders: [], recentSales: [], markets: [], expenses: [], shoppingList: [], printers: [], printJobs: [], todos: [], proposals: [], ideas: [], filaments: [], printArchive: [] });
  
  const ops = useMemo(() => {
      if (!isFirebaseInitialized) return { add: ()=>{}, update: ()=>{}, delete: ()=>{} };
      return {
        add: async (col, d) => { try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', col), { ...d, createdAt: serverTimestamp() }); notify(setNotification, "Eklendi"); } catch(e) { console.error(e); notify(setNotification, "Hata", "error"); } },
        update: async (col, id, d) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), d); notify(setNotification, "Güncellendi"); } catch(e) { console.error(e); notify(setNotification, "Hata", "error"); } },
        delete: async (id, col) => { if(!confirm("Silmek istediğine emin misin?")) return; try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); notify(setNotification, "Silindi"); } catch(e) { console.error(e); notify(setNotification, "Hata", "error"); } }
      };
  }, []);

  const handleResetData = async () => {
    if (!confirm("⚠️ DİKKAT: Tüm veritabanı silinecek! \n\nStok, siparişler, müşteriler, ayarlar... Her şey kalıcı olarak yok olacak.\n\nOnaylıyor musunuz?")) return;
    const verification = prompt("İşlemi onaylamak için 'SIFIRLA' yazınız:");
    if (verification !== 'SIFIRLA') { alert("İşlem iptal edildi."); return; }
    setLoading(true);
    try {
        const collections = ['inventory', 'orders', 'sales_history', 'markets', 'general_expenses', 'shopping', 'printers', 'workshop_jobs', 'workshop_filaments', 'print_archive', 'todos', 'proposals', 'ideas'];
        for (const col of collections) {
            const ref = collection(db, 'artifacts', appId, 'public', 'data', col);
            const snapshot = await getDocs(ref);
            const batchPromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(batchPromises);
        }
        notify(setNotification, "Sistem fabrika ayarlarına döndürüldü.");
    } catch (e) { console.error(e); notify(setNotification, "Sıfırlama hatası: " + e.message, "error"); } finally { setLoading(false); }
  };

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); }, [theme]);

  useEffect(() => {
    if(!isFirebaseInitialized) { setLoading(false); return; }
    const init = async () => { if(typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); setLoading(false); };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseInitialized) return;
    const path = (c) => collection(db, 'artifacts', appId, 'public', 'data', c);
    const unsubs = [
        onSnapshot(path('inventory'), s => setData(p => ({...p, items: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('orders'), s => setData(p => ({...p, orders: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('sales_history'), s => setData(p => ({...p, recentSales: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('markets'), s => setData(p => ({...p, markets: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('general_expenses'), s => setData(p => ({...p, expenses: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('shopping'), s => setData(p => ({...p, shoppingList: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('printers'), s => setData(p => ({...p, printers: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('workshop_jobs'), s => setData(p => ({...p, printJobs: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('todos'), s => setData(p => ({...p, todos: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('proposals'), s => setData(p => ({...p, proposals: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('ideas'), s => setData(p => ({...p, ideas: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('workshop_filaments'), s => setData(p => ({...p, filaments: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
        onSnapshot(path('print_archive'), s => setData(p => ({...p, printArchive: s.docs.map(d=>({id:d.id, ...d.data()}))})))
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  if (loading) return <div className="h-screen flex items-center justify-center text-orange-600 font-bold animate-pulse">Yükleniyor...</div>;
  if (!user) return <LoginPage onLogin={async (u,p) => { if(!isFirebaseInitialized) return alert("Firebase bağlı değil."); const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'), where('username', '==', u), where('password', '==', p)); const s = await getDocs(q); if(!s.empty) { if(!auth.currentUser) await signInAnonymously(auth); setUser({uid:'user', username: u}); } else alert("Hatalı Giriş"); }} loading={loading} error="" setError={alert} />;

  const tabs = [
      { id: 'home', label: 'Dashboard', icon: LayoutDashboard, view: <DashboardView data={data} setActiveTab={setActiveTab}/> },
      { id: 'inventory', label: 'Stok', icon: Package, view: <InventoryView items={data.items} ops={ops}/> },
      { id: 'sales', label: 'Satış', icon: ShoppingCart, view: <SalesView items={data.items} ops={ops}/> },
      { id: 'orders', label: 'Siparişler', icon: Trello, view: <OrdersView orders={data.orders} ops={ops}/> },
      { id: 'planning', label: 'Planlama', icon: BookOpen, view: <PlanningView todos={data.todos} proposals={data.proposals} ideas={data.ideas} ops={ops}/> },
      { id: 'marketplaces', label: 'Pazaryeri', icon: Globe, view: <MarketplacesView ops={ops}/> },
      { id: 'workshop', label: '3D Atölye', icon: Box, view: <WorkshopView printers={data.printers} jobs={data.printJobs} filaments={data.filaments} archive={data.printArchive} ops={ops}/> },
      { id: 'market', label: 'Pazar', icon: Store, view: <MarketView markets={data.markets} items={data.items} sales={data.recentSales} expenses={data.expenses} ops={ops}/> },
      { id: 'accounting', label: 'Muhasebe', icon: Coins, view: <AccountingView expenses={data.expenses} sales={data.recentSales} ops={ops}/> },
      { id: 'shopping', label: 'Alınacaklar', icon: ClipboardList, view: <ShoppingView items={data.shoppingList} ops={ops}/> },
      { id: 'settings', label: 'Ayarlar', icon: Settings, view: <SettingsView user={user} onReset={handleResetData} fullData={data} theme={theme} setTheme={setTheme} /> }
  ];

  // --- BURASI DÜZELTİLDİ: Mobil Menü ve Yeni Sidebar Yapısı ---
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 transition-colors overflow-hidden">
      
      {/* 1. MOBİL ÜST BAR (Hamburger Menü) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-50">
        <div className="font-bold text-xl text-orange-600">BerildenStore</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 2. KARARTMA PERDESİ */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 3. YAN MENÜ (SIDEBAR) */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
        `}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-orange-600">BerildenStore</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Yönetim Paneli V11.5</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {tabs.map(t => (
                <button 
                    key={t.id} 
                    type="button" 
                    onClick={() => { setActiveTab(t.id); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === t.id ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <t.icon size={20}/> 
                    <span className="text-sm font-medium">{t.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
            <button type="button" onClick={()=>setTheme(theme==='light'?'dark':'light')} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 dark:text-white hover:bg-slate-200 transition-colors">
                {theme==='light'?<Moon size={18}/>:<Sun size={18}/>}
            </button>
            <button type="button" onClick={() => { setUser(null); localStorage.removeItem('berilden_logged_in'); }} className="text-red-500 font-bold text-sm hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                Çıkış
            </button>
        </div>
      </aside>

      {/* 4. ANA İÇERİK ALANI */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative pt-16 md:pt-0">
        {notification && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-[60] text-white font-bold flex items-center gap-2 animate-in slide-in-from-top-4 ${notification.type==='error'?'bg-red-600':'bg-green-600'}`}>
                {notification.type==='success'?<Check size={18}/>:<ShieldAlert size={18}/>} {notification.message}
            </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {tabs.find(t=>t.id===activeTab)?.view}
        </div>
      </main>
    </div>
  );
}

// --- GELİŞTİRİLMİŞ AYARLAR MENÜSÜ ---
// --- AYARLAR MENÜSÜ (DÜZELTİLMİŞ HALİ) ---
const SettingsView = ({ user, onReset, fullData, theme, setTheme }) => {
    
    // Verileri JSON olarak indirme fonksiyonu
    const downloadBackup = () => {
        if (!fullData) return alert("Veri bulunamadı.");
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "berilden_yedek_" + new Date().toLocaleDateString('tr-TR').replace(/\./g, '-') + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20">
            {/* Başlık ve Profil Kartı */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Settings className="text-slate-500"/> Sistem Ayarları
                    </h2>
                    <p className="text-slate-500 mt-1">Uygulama tercihleri ve veri yönetimi.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                        <p className="text-sm font-bold dark:text-white">{user?.username || 'Yönetici'}</p>
                        <p className="text-xs text-slate-400">Tam Yetkili</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Kolon: Görünüm ve Sistem */}
                <div className="space-y-6">
                    {/* Görünüm Ayarları */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2"><Sun size={20} className="text-yellow-500"/> Görünüm</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'bg-orange-50 border-orange-200 text-orange-600 ring-2 ring-orange-100' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                <Sun size={24}/>
                                <span className="text-sm font-bold">Aydınlık</span>
                            </button>
                            <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white ring-2 ring-slate-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                <Moon size={24}/>
                                <span className="text-sm font-bold">Karanlık</span>
                            </button>
                        </div>
                    </div>

                    {/* Uygulama Bilgileri */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2"><Info size={20} className="text-blue-500"/> Hakkında</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <span className="text-sm font-medium dark:text-white">Versiyon</span>
                                <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">v11.5.0</span>
                            </div>
                            <button type="button" onClick={()=>window.location.reload()} className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm">
                                <RefreshCw size={16}/> Uygulamayı Yeniden Başlat
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sağ Kolon: Veri Yönetimi */}
                <div className="space-y-6">
                    {/* Yedekleme Alanı */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <Archive size={120}/>
                        </div>
                        <h3 className="font-bold text-xl mb-2 relative z-10 flex items-center gap-2"><Archive size={20}/> Veri Yedekleme</h3>
                        <p className="text-blue-100 text-sm mb-6 relative z-10 opacity-90">Tüm verilerinizi güvenli bir şekilde indirin.</p>
                        
                        <button onClick={downloadBackup} className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors relative z-10">
                            <ArrowDownRight size={20}/> Yedek İndir (.json)
                        </button>
                    </div>

                    {/* Tehlikeli Bölge */}
                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2"><ShieldAlert size={20}/> Tehlikeli Bölge</h3>
                        <button type="button" onClick={onReset} className="w-full py-3 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-600 hover:text-white dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={18}/> Verileri Sıfırla
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- APP EXPORT ---
export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}