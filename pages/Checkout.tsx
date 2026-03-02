
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const PROCEDURES = [
  { id: 1, title: 'Inventory Lock', desc: 'Reserving physical stock in nearest FPO warehouse', icon: 'fa-warehouse' },
  { id: 2, title: 'Bio-Safety Check', desc: 'Verifying chemical compliance for your specific soil type', icon: 'fa-microscope' },
  { id: 3, title: 'FPO Agent Assignment', desc: 'Designating a local officer for quality verification', icon: 'fa-user-check' },
  { id: 4, title: 'Logistics Queue', desc: 'Preparing doorstep delivery via regional agri-vans', icon: 'fa-truck-fast' }
];

const Checkout: React.FC = () => {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const [isOrdering, setIsOrdering] = useState(false);
  const [activeProcedure, setActiveProcedure] = useState(0);
  const [orderComplete, setOrderComplete] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    setIsOrdering(true);
    setActiveProcedure(1);
  };

  useEffect(() => {
    if (isOrdering && activeProcedure <= PROCEDURES.length) {
      const timer = setTimeout(() => {
        if (activeProcedure < PROCEDURES.length) {
          setActiveProcedure(prev => prev + 1);
        } else {
          setIsOrdering(false);
          setOrderComplete(true);
          clearCart();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOrdering, activeProcedure]);

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white dark:bg-stone-900 rounded-[4rem] p-12 text-center shadow-3xl animate-fade-in border border-stone-100 dark:border-stone-800">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10">
            <i className="fas fa-check-double text-4xl"></i>
          </div>
          <h2 className="heading-font text-5xl font-black text-stone-900 dark:text-stone-100 mb-4 tracking-tighter">Verified Procurement</h2>
          <p className="text-stone-500 dark:text-stone-400 font-bold mb-12">Your supplies have cleared all 4 bio-sanitary procedures. Track delivery in your dashboard.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-12">
             <div className="p-6 bg-stone-50 dark:bg-stone-950 rounded-[2.5rem] text-left border border-stone-100 dark:border-stone-800">
               <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Tracking ID</p>
               <p className="font-black text-emerald-600 font-mono text-lg">DK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
             </div>
             <div className="p-6 bg-stone-50 dark:bg-stone-950 rounded-[2.5rem] text-left border border-stone-100 dark:border-stone-800">
               <p className="text-[10px] font-black uppercase text-stone-400 mb-2">ETA</p>
               <p className="font-black text-stone-800 dark:text-stone-200 text-lg">Within 48 Hours</p>
             </div>
          </div>

          <button 
            onClick={() => navigate('/query')}
            className="w-full py-7 bg-emerald-900 dark:bg-emerald-700 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-black transition-all"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-16 transition-colors duration-300">
      {isOrdering && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white dark:bg-stone-900 rounded-[4rem] p-12 shadow-3xl animate-fade-in">
             <div className="text-center mb-12">
               <h3 className="heading-font text-4xl font-black text-stone-900 dark:text-stone-100 mb-2 tracking-tighter">Procurement Protocol</h3>
               <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Executing mandatory agri-validation</p>
             </div>
             <div className="space-y-6">
                {PROCEDURES.map((step) => (
                  <div key={step.id} className={`flex items-center p-6 rounded-[2.5rem] border transition-all duration-700 ${activeProcedure >= step.id ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-stone-50 dark:bg-stone-950 border-transparent opacity-30'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 ${activeProcedure === step.id ? 'bg-emerald-500 text-white animate-pulse' : activeProcedure > step.id ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-stone-200 dark:bg-stone-800 text-stone-400'}`}>
                      <i className={`fas ${activeProcedure > step.id ? 'fa-check' : step.icon} text-xl`}></i>
                    </div>
                    <div>
                      <h4 className={`font-black uppercase tracking-tight text-lg ${activeProcedure >= step.id ? 'text-emerald-900 dark:text-emerald-400' : 'text-stone-400'}`}>{step.title}</h4>
                      <p className="text-xs font-bold text-stone-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="heading-font text-6xl font-black text-stone-900 dark:text-stone-100 tracking-tighter mb-12">{t('cart_review')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {cart.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 p-20 rounded-[4rem] text-center border border-stone-100 dark:border-stone-800 shadow-sm">
                <i className="fas fa-shopping-basket text-6xl text-stone-200 dark:text-stone-800 mb-8"></i>
                <p className="text-stone-400 font-black uppercase tracking-widest text-xs mb-8">{t('cart_empty')}</p>
                <button onClick={() => navigate('/store')} className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.4em] border-b-2 border-emerald-600 pb-1">{t('nav_store')}</button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-white dark:bg-stone-900 p-8 rounded-[3rem] border border-stone-100 dark:border-stone-800 flex items-center gap-8 shadow-sm hover:shadow-xl transition-all">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 shadow-inner">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-stone-900 dark:text-stone-100 text-xl mb-1">{item.name}</h4>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">{item.category}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-6">
                       <span className="text-xs font-black text-stone-600 dark:text-stone-400">UNIT QTY: {item.quantity}</span>
                       <span className="font-black text-2xl text-stone-900 dark:text-emerald-400 tracking-tighter">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-stone-900 p-10 rounded-[4rem] shadow-3xl border border-stone-100 dark:border-stone-800 sticky top-24">
              <h3 className="font-black text-stone-900 dark:text-stone-100 text-2xl mb-8 tracking-tight">{t('cart_summary')}</h3>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-sm font-bold text-stone-500">
                  <span>{t('cart_subtotal')}</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-500">
                  <span>Agri-Supply Logistics</span>
                  <span className="text-emerald-600 font-black uppercase text-[10px]">{t('cart_free')}</span>
                </div>
                <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-between">
                  <span className="font-black text-stone-900 dark:text-stone-100 uppercase text-xs tracking-widest">{t('cart_total')}</span>
                  <span className="font-black text-4xl text-emerald-900 dark:text-emerald-400 tracking-tighter">₹{totalPrice}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || isOrdering}
                className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all ${cart.length === 0 || isOrdering ? 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-700' : 'bg-emerald-900 dark:bg-emerald-700 text-white hover:bg-black active:scale-95'}`}
              >
                {t('cart_confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
