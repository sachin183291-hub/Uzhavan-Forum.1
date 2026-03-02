import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';

const MOCK_PRODUCTS_BASE: any[] = [
  {
    id: 'p1',
    price: 450,
    category: 'Pesticide',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p2',
    price: 850,
    category: 'Fertilizer',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p3',
    price: 1200,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p4',
    price: 320,
    category: 'Pesticide',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p5',
    price: 250,
    category: 'Fertilizer',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p6',
    price: 180,
    category: 'Farming Tools',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p7',
    price: 480,
    category: 'Farming Tools',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p8',
    price: 750,
    category: 'Farming Tools',
    image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p9',
    price: 920,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p10',
    price: 560,
    category: 'Fertilizer',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600',
  }
];

const Store: React.FC = () => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>('All');

  const getLocalizedProduct = (p: any): Product => {
    return {
      ...p,
      name: t(p.id + '_name'),
      description: t(p.id + '_desc')
    };
  };

  const categories = [
    { key: 'All', label: t('cat_all') },
    { key: 'Fertilizer', label: t('cat_fertilizer') },
    { key: 'Pesticide', label: t('cat_pesticide') },
    { key: 'Seeds', label: t('cat_seeds') },
    { key: 'Farming Tools', label: t('cat_tools') }
  ];

  const filtered = (filter === 'All'
    ? MOCK_PRODUCTS_BASE
    : MOCK_PRODUCTS_BASE.filter(p => p.category === filter)).map(getLocalizedProduct);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-emerald-900 text-emerald-100 px-4 py-1.5 rounded-full mb-4">
              <i className="fas fa-seedling text-[10px]"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">{t('store_badge')}</span>
            </div>
            <h1 className="heading-font text-6xl font-black text-stone-900 dark:text-stone-100 tracking-tighter">{t('store_title')}</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium">{t('store_subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={"px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all " + (filter === cat.key ? 'bg-emerald-900 text-white' : 'bg-white dark:bg-stone-900 text-stone-400 border border-stone-100 dark:border-stone-800')}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(product => (
            <div key={product.id} className="bg-white dark:bg-stone-900 rounded-[3rem] overflow-hidden shadow-sm border border-stone-100 dark:border-stone-800 group hover:shadow-2xl transition-all">
              <div className="h-72 overflow-hidden relative bg-emerald-50 dark:bg-stone-800">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600';
                  }}
                />

                {/* Category badge */}
                <div className="absolute top-6 left-6 bg-emerald-900/90 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <span className="text-emerald-100 text-[9px] font-black uppercase tracking-widest">{product.category}</span>
                </div>

                {/* Price badge */}
                <div className="absolute top-6 right-6 bg-white/95 dark:bg-stone-800/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                  <span className="font-black text-emerald-950 dark:text-emerald-400 text-lg">₹{product.price}</span>
                </div>
              </div>

              <div className="p-10">
                <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100 mb-3 tracking-tighter leading-tight">{product.name}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium leading-relaxed mb-10 h-12 line-clamp-2">{product.description}</p>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-stone-900 dark:bg-emerald-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all active:scale-95 shadow-lg"
                >
                  {t('store_add_cart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Store;