
import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const MOCK_PRODUCTS_BASE: any[] = [
  { id: 'p1', price: 450, category: 'Pesticide', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=300' },
  { id: 'p2', price: 850, category: 'Fertilizer', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=300' },
  { id: 'p3', price: 1200, category: 'Seeds', image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=300' },
  { id: 'p4', price: 320, category: 'Pesticide', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=300' },
  { id: 'p5', price: 250, category: 'Fertilizer', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=300' },
  { id: 'p6', price: 180, category: 'Farming Tools', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=300' },
  { id: 'p7', price: 480, category: 'Farming Tools', image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=300' },
  { id: 'p8', price: 750, category: 'Farming Tools', image: 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&q=80&w=300' },
  { id: 'p9', price: 920, category: 'Farming Tools', image: 'https://images.unsplash.com/photo-1592319207223-388f62309191?auto=format&fit=crop&q=80&w=300' },
  { id: 'p10', price: 560, category: 'Farming Tools', image: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?auto=format&fit=crop&q=80&w=300' },
];

const SearchPage: React.FC = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get('q') || '';

  const results = useMemo(() => {
    const products = MOCK_PRODUCTS_BASE.map(p => ({
      ...p,
      name: t(`${p.id}_name`),
      description: t(`${p.id}_desc`)
    }));

    if (!q) return { products: [], pages: [] };
    const lowerQ = q.toLowerCase();
    
    const filteredProducts = products.filter(p => 
      (p.name || '').toLowerCase().includes(lowerQ) || 
      (p.description || '').toLowerCase().includes(lowerQ) ||
      (p.category || '').toLowerCase().includes(lowerQ)
    );

    const CONTENT_PAGES = [
      { title: t('nav_about'), path: '/about', description: 'Deep dive into research and agricultural solutions.' },
      { title: t('nav_tech'), path: '/technical', description: 'DBMS and Personalization Architecture.' },
      { title: t('nav_contact'), path: '/contact', description: 'Reach out to the Digital Krishi Support Team.' },
      { title: t('query_title'), path: '/query', description: 'Consult the AI Krishi Officer for crop diagnosis.' },
    ];

    const filteredPages = CONTENT_PAGES.filter(p => 
      (p.title || '').toLowerCase().includes(lowerQ) || 
      (p.description || '').toLowerCase().includes(lowerQ)
    );

    return { products: filteredProducts, pages: filteredPages };
  }, [q, t]);

  const isEmpty = results.products.length === 0 && results.pages.length === 0;

  return (
    <div className="bg-stone-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] block mb-2">Search Results</span>
          <h1 className="heading-font text-5xl font-black text-stone-900 tracking-tighter">
            Showing results for <span className="text-emerald-700">"{q}"</span>
          </h1>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-[4rem] p-20 text-center shadow-sm border border-stone-100 animate-fade-in">
            <div className="w-24 h-24 bg-stone-50 text-stone-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-search-minus text-5xl"></i>
            </div>
            <h2 className="text-2xl font-black text-stone-900 mb-4">No results found</h2>
            <p className="text-stone-500 max-w-md mx-auto mb-10">We couldn't find anything matching your search. Try different keywords or check your spelling.</p>
            <Link to="/store" className="bg-emerald-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-black transition-all">
              {t('nav_store')}
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {results.pages.length > 0 && (
              <section className="animate-fade-in">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                  <i className="fas fa-file-alt mr-3 text-emerald-600"></i> Information Pages
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.pages.map((page, idx) => (
                    <Link key={idx} to={page.path} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-black text-emerald-950 group-hover:text-emerald-600 transition-colors">{page.title}</h4>
                        <i className="fas fa-arrow-right text-stone-200 group-hover:text-emerald-500 transition-colors"></i>
                      </div>
                      <p className="text-sm text-stone-500 font-medium leading-relaxed">{page.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.products.length > 0 && (
              <section className="animate-fade-in">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                  <i className="fas fa-shopping-basket mr-3 text-emerald-600"></i> {t('store_title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.products.map(product => (
                    <div key={product.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-stone-100 group hover:shadow-2xl transition-all">
                      <div className="h-64 overflow-hidden relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                          <span className="font-black text-emerald-950 text-lg">₹{product.price}</span>
                        </div>
                      </div>
                      <div className="p-8">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">{t(`cat_${(product.category || '').toLowerCase().replace(' ', '_')}`)}</p>
                        <h3 className="text-2xl font-black text-stone-900 mb-3 tracking-tighter leading-none">{product.name}</h3>
                        <p className="text-sm text-stone-500 font-medium leading-relaxed mb-8 h-10 line-clamp-2">{product.description}</p>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
                        >
                          {t('store_add_cart')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
