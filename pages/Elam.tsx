import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CropListing {
    id: string;
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    cropName: string;
    quantity: number;
    unit: 'kg' | 'ton';
    basePrice: number;
    qualityGrade: 'A' | 'B' | 'C';
    location: string;
    harvestDate: string;
    imageUrl: string;
    auctionEndTime: string;
    currentBid: number;
    currentBidder: string;
    currentBidderPhone: string;
    bids: Bid[];
    status: 'active' | 'ended' | 'sold';
    createdAt: string;
}

interface Bid {
    bidderName: string;
    bidderPhone: string;
    amount: number;
    timestamp: string;
}

// ─── Translation Keys ─────────────────────────────────────────────────────────
const T: Record<string, Record<string, string>> = {
    English: {
        title: '🌾 Elam — Crop Auction',
        subtitle: 'List your harvest, get the best price',
        tab_browse: 'Browse Auctions',
        tab_list: 'List My Crop',
        tab_dashboard: 'My Dashboard',
        active_auctions: 'Active Auctions',
        no_auctions: 'No active auctions right now. Be the first to list!',
        place_bid: 'Place Bid',
        current_bid: 'Current Bid',
        base_price: 'Base Price',
        ends_in: 'Ends in',
        quantity: 'Quantity',
        location: 'Location',
        grade: 'Grade',
        bid_history: 'Bid History',
        winner: '🏆 Winner',
        auction_ended: 'Auction Ended',
        list_title: 'List Your Crop for Auction',
        crop_name: 'Crop Name',
        crop_qty: 'Quantity',
        unit: 'Unit',
        base_price_kg: 'Base Price (₹ per kg)',
        quality_grade: 'Quality Grade',
        harvest_date: 'Harvest Date',
        auction_end: 'Auction End Date & Time',
        crop_image: 'Crop Photo',
        upload_photo: 'Upload Photo',
        photo_hint: 'JPG, PNG up to 5MB',
        change_photo: 'Change Photo',
        submit_listing: 'List for Auction',
        success_listed: '✅ Your crop has been listed for auction!',
        dash_farmer: 'Farmer Dashboard',
        dash_buyer: 'Buyer Dashboard',
        active_listings: 'Active Listings',
        sold_crops: 'Sold Crops',
        bid_on: 'Crops I Bid On',
        won_auctions: 'Won Auctions',
        contact_farmer: 'Contact Farmer',
        confirm_payment: '✅ Confirm Payment (Demo)',
        payment_confirmed: 'Payment Confirmed!',
        enter_bid: 'Enter your bid (₹)',
        bid_submitted: '✅ Bid submitted!',
        bid_low: '❌ Bid must be higher than current bid',
        harvested: 'Harvested',
        bids: 'bids',
        per_kg: '/kg',
    },
    Tamil: {
        title: '🌾 ஏலம் — பயிர் ஏலம்',
        subtitle: 'உங்கள் அறுவடையை பட்டியலிடுங்கள், சிறந்த விலை பெறுங்கள்',
        tab_browse: 'ஏலங்களை பார்க்கவும்',
        tab_list: 'என் பயிரை பட்டியலிடு',
        tab_dashboard: 'என் டாஷ்போர்டு',
        active_auctions: 'செயலில் உள்ள ஏலங்கள்',
        no_auctions: 'தற்போது செயலில் உள்ள ஏலங்கள் இல்லை.',
        place_bid: 'ஏலம் போடு',
        current_bid: 'தற்போதைய ஏலம்',
        base_price: 'அடிப்படை விலை',
        ends_in: 'முடியும் நேரம்',
        quantity: 'அளவு',
        location: 'இடம்',
        grade: 'தரம்',
        bid_history: 'ஏல வரலாறு',
        winner: '🏆 வெற்றியாளர்',
        auction_ended: 'ஏலம் முடிந்தது',
        list_title: 'உங்கள் பயிரை ஏலத்திற்கு பட்டியலிடவும்',
        crop_name: 'பயிர் பெயர்',
        crop_qty: 'அளவு',
        unit: 'அலகு',
        base_price_kg: 'அடிப்படை விலை (₹ கிலோவுக்கு)',
        quality_grade: 'தர வகை',
        harvest_date: 'அறுவடை தேதி',
        auction_end: 'ஏல முடிவு தேதி & நேரம்',
        crop_image: 'பயிர் புகைப்படம்',
        upload_photo: 'புகைப்படம் பதிவேற்றவும்',
        photo_hint: 'JPG, PNG 5MB வரை',
        change_photo: 'புகைப்படத்தை மாற்றவும்',
        submit_listing: 'ஏலத்திற்கு பட்டியலிடவும்',
        success_listed: '✅ உங்கள் பயிர் ஏலத்திற்கு பட்டியலிடப்பட்டது!',
        dash_farmer: 'விவசாயி டாஷ்போர்டு',
        dash_buyer: 'வாங்குபவர் டாஷ்போர்டு',
        active_listings: 'செயலில் உள்ள பட்டியல்கள்',
        sold_crops: 'விற்கப்பட்ட பயிர்கள்',
        bid_on: 'நான் ஏலம் போட்ட பயிர்கள்',
        won_auctions: 'வென்ற ஏலங்கள்',
        contact_farmer: 'விவசாயியை தொடர்பு கொள்',
        confirm_payment: '✅ கட்டணத்தை உறுதிப்படுத்து (டெமோ)',
        payment_confirmed: 'கட்டணம் உறுதிப்படுத்தப்பட்டது!',
        enter_bid: 'உங்கள் ஏலத்தை உள்ளிடவும் (₹)',
        bid_submitted: '✅ ஏலம் சமர்ப்பிக்கப்பட்டது!',
        bid_low: '❌ ஏலம் தற்போதைய ஏலத்தை விட அதிகமாக இருக்க வேண்டும்',
        harvested: 'அறுவடை',
        bids: 'ஏலங்கள்',
        per_kg: '/கிலோ',
    },
    Malayalam: {
        title: '🌾 ഇലം — വിള ലേലം',
        subtitle: 'നിങ്ങളുടെ വിള ലിസ്റ്റ് ചെയ്യുക, മികച്ച വില നേടൂ',
        tab_browse: 'ലേലങ്ങൾ കാണുക',
        tab_list: 'എന്റെ വിള ലിസ്റ്റ് ചെയ്യൂ',
        tab_dashboard: 'എന്റെ ഡാഷ്ബോർഡ്',
        active_auctions: 'സജീവ ലേലങ്ങൾ',
        no_auctions: 'ഇപ്പോൾ സജീവ ലേലങ്ങൾ ഇല്ല.',
        place_bid: 'ബിഡ് ചെയ്യൂ',
        current_bid: 'നിലവിലെ ബിഡ്',
        base_price: 'അടിസ്ഥാന വില',
        ends_in: 'അവസാനിക്കും',
        quantity: 'അളവ്',
        location: 'സ്ഥലം',
        grade: 'ഗ്രേഡ്',
        bid_history: 'ബിഡ് വിവരങ്ങൾ',
        winner: '🏆 വിജയി',
        auction_ended: 'ലേലം അവസാനിച്ചു',
        list_title: 'ലേലത്തിനായി വിള ലിസ്റ്റ് ചെയ്യൂ',
        crop_name: 'വിള പേര്',
        crop_qty: 'അളവ്',
        unit: 'യൂണിറ്റ്',
        base_price_kg: 'അടിസ്ഥാന വില (₹ കിലോ)',
        quality_grade: 'ഗുണനിലവാര ഗ്രേഡ്',
        harvest_date: 'വിളവെടുപ്പ് തീയതി',
        auction_end: 'ലേലം അവസാന തീയതി & സമയം',
        crop_image: 'വിള ഫോട്ടോ',
        upload_photo: 'ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യൂ',
        photo_hint: 'JPG, PNG 5MB വരെ',
        change_photo: 'ഫോട്ടോ മാറ്റുക',
        submit_listing: 'ലേലത്തിനായി ലിസ്റ്റ് ചെയ്യൂ',
        success_listed: '✅ നിങ്ങളുടെ വിള ലേലത്തിനായി ലിസ്റ്റ് ചെയ്തു!',
        dash_farmer: 'കർഷക ഡാഷ്ബോർഡ്',
        dash_buyer: 'വാങ്ങുന്നവർ ഡാഷ്ബോർഡ്',
        active_listings: 'സജീവ ലിസ്റ്റിംഗുകൾ',
        sold_crops: 'വിറ്റ വിളകൾ',
        bid_on: 'ഞാൻ ബിഡ് ചെയ്ത വിളകൾ',
        won_auctions: 'നേടിയ ലേലങ്ങൾ',
        contact_farmer: 'കർഷകനെ ബന്ധപ്പെടൂ',
        confirm_payment: '✅ പേയ്‌മെന്റ് സ്ഥിരീകരിക്കൂ (ഡെമോ)',
        payment_confirmed: 'പേയ്‌മെന്റ് സ്ഥിരീകരിച്ചു!',
        enter_bid: 'നിങ്ങളുടെ ബിഡ് നൽകൂ (₹)',
        bid_submitted: '✅ ബിഡ് സമർപ്പിച്ചു!',
        bid_low: '❌ ബിഡ് നിലവിലെ ബിഡിനേക്കാൾ കൂടുതലായിരിക്കണം',
        harvested: 'വിളവെടുപ്പ്',
        bids: 'ബിഡുകൾ',
        per_kg: '/കിലോ',
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'elam_auctions';

function loadAuctions(): CropListing[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
}
function saveAuctions(list: CropListing[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function useCountdown(endTime: string) {
    const [remaining, setRemaining] = useState('');
    const [expired, setExpired] = useState(false);
    useEffect(() => {
        const tick = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) { setRemaining('00:00:00'); setExpired(true); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endTime]);
    return { remaining, expired };
}

const gradeColor = { A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', B: 'text-amber-400 bg-amber-500/10 border-amber-500/30', C: 'text-red-400 bg-red-500/10 border-red-500/30' };

// ─── Countdown Badge ─────────────────────────────────────────────────────────
const CountdownBadge: React.FC<{ endTime: string; label: string }> = ({ endTime, label }) => {
    const { remaining, expired } = useCountdown(endTime);
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${expired ? 'bg-red-500/15 border border-red-500/30 text-red-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
            <i className={`fas ${expired ? 'fa-ban' : 'fa-clock'} text-xs`} />
            {expired ? label : remaining}
        </div>
    );
};

// ─── Bid Modal ────────────────────────────────────────────────────────────────
const BidModal: React.FC<{
    listing: CropListing;
    farmerPhone: string;
    farmerName: string;
    onClose: () => void;
    onBid: (listing: CropListing, amount: number) => string;
    txt: Record<string, string>;
}> = ({ listing, farmerPhone, farmerName, onClose, onBid, txt }) => {
    const [amount, setAmount] = useState('');
    const [msg, setMsg] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    const submit = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= listing.currentBid) { setMsg(txt.bid_low); return; }
        const res = onBid(listing, val);
        setMsg(res);
        if (res === txt.bid_submitted) setConfirmed(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-stone-900 border border-stone-700 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-black text-xl tracking-tight">{listing.cropName}</h3>
                    <button onClick={onClose} className="w-9 h-9 bg-stone-800 hover:bg-stone-700 rounded-full flex items-center justify-center text-stone-400">
                        <i className="fas fa-times text-sm" />
                    </button>
                </div>

                {confirmed ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-check text-emerald-400 text-2xl" />
                        </div>
                        <p className="text-emerald-400 font-black text-lg">{txt.bid_submitted}</p>
                        <p className="text-stone-400 text-sm mt-2">₹{parseFloat(amount).toLocaleString()} — Highest Bid</p>
                        <button onClick={onClose} className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Close</button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between p-4 bg-stone-800 rounded-2xl">
                                <span className="text-stone-400 text-sm font-bold">{txt.current_bid}</span>
                                <span className="text-emerald-400 font-black">₹{listing.currentBid.toLocaleString()}{txt.per_kg}</span>
                            </div>
                            <div className="flex justify-between p-4 bg-stone-800 rounded-2xl">
                                <span className="text-stone-400 text-sm font-bold">{txt.quantity}</span>
                                <span className="text-white font-black">{listing.quantity} {listing.unit}</span>
                            </div>
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => { setAmount(e.target.value); setMsg(''); }}
                            placeholder={txt.enter_bid}
                            className="w-full px-5 py-4 bg-stone-800 border border-stone-600 rounded-2xl text-white font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500/40 mb-4"
                        />
                        {msg && <p className={`text-sm font-bold mb-4 ${msg.includes('❌') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>}
                        <p className="text-stone-500 text-xs mb-4">Bidding as: <span className="text-white font-bold">{farmerName} ({farmerPhone})</span></p>
                        <button onClick={submit} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                            <i className="fas fa-gavel mr-2" />{txt.place_bid}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Auction Card ─────────────────────────────────────────────────────────────
const AuctionCard: React.FC<{
    listing: CropListing;
    currentUserPhone: string;
    currentUserName: string;
    onBid: (listing: CropListing, amount: number) => string;
    txt: Record<string, string>;
}> = ({ listing, currentUserPhone, currentUserName, onBid, txt }) => {
    const { remaining, expired } = useCountdown(listing.auctionEndTime);
    const [showBid, setShowBid] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const isOwn = listing.farmerPhone === currentUserPhone;
    const isEnded = expired || listing.status === 'ended' || listing.status === 'sold';

    return (
        <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                    src={listing.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
                    alt={listing.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'; }}
                />
                <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${gradeColor[listing.qualityGrade]}`}>
                        Grade {listing.qualityGrade}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <CountdownBadge endTime={listing.auctionEndTime} label={txt.auction_ended} />
                </div>
                {isEnded && listing.currentBidder && (
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/95 py-2 text-center">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">{txt.winner}: {listing.currentBidder}</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-5">
                <h3 className="font-black text-stone-900 dark:text-white text-xl tracking-tight mb-1">{listing.cropName}</h3>
                <div className="flex items-center gap-1.5 text-stone-500 text-xs font-bold mb-4">
                    <i className="fas fa-map-marker-alt text-emerald-500" />
                    {listing.location}
                    <span className="mx-1">·</span>
                    <i className="fas fa-calendar text-stone-400" />
                    {txt.harvested}: {listing.harvestDate}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{txt.base_price}</p>
                        <p className="text-stone-700 dark:text-stone-300 font-black">₹{listing.basePrice}{txt.per_kg}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/40">
                        <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">{txt.current_bid}</p>
                        <p className="text-emerald-700 dark:text-emerald-300 font-black">₹{listing.currentBid}{txt.per_kg}</p>
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{txt.quantity}</p>
                        <p className="text-stone-700 dark:text-stone-300 font-black">{listing.quantity} {listing.unit}</p>
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{txt.bids}</p>
                        <p className="text-stone-700 dark:text-stone-300 font-black">{listing.bids.length} {txt.bids}</p>
                    </div>
                </div>

                {/* Bid history toggle */}
                {listing.bids.length > 0 && (
                    <button onClick={() => setShowHistory(h => !h)} className="w-full text-left text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-3 hover:text-emerald-500 transition-colors">
                        <i className={`fas fa-chevron-${showHistory ? 'up' : 'down'} text-xs`} /> {txt.bid_history} ({listing.bids.length})
                    </button>
                )}
                {showHistory && (
                    <div className="space-y-1.5 mb-4 max-h-36 overflow-y-auto">
                        {[...listing.bids].reverse().map((b, i) => (
                            <div key={i} className="flex justify-between items-center px-3 py-2 bg-stone-50 dark:bg-stone-800 rounded-xl">
                                <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{b.bidderName}</span>
                                <span className={`text-xs font-black ${i === 0 ? 'text-emerald-500' : 'text-stone-500'}`}>₹{b.amount.toLocaleString()}</span>
                                <span className="text-[9px] text-stone-400">{new Date(b.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    {!isOwn && !isEnded && (
                        <button onClick={() => setShowBid(true)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 flex items-center justify-center gap-2">
                            <i className="fas fa-gavel" /> {txt.place_bid}
                        </button>
                    )}
                    {isOwn && (
                        <div className="flex-1 py-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl font-black uppercase tracking-widest text-[11px] text-center">
                            <i className="fas fa-leaf mr-2" />Your Listing
                        </div>
                    )}
                </div>
            </div>

            {showBid && (
                <BidModal
                    listing={listing}
                    farmerPhone={currentUserPhone}
                    farmerName={currentUserName}
                    onClose={() => setShowBid(false)}
                    onBid={onBid}
                    txt={txt}
                />
            )}
        </div>
    );
};

// ─── List Form ────────────────────────────────────────────────────────────────
const ListCropForm: React.FC<{
    farmerPhone: string;
    farmerName: string;
    onListed: () => void;
    txt: Record<string, string>;
}> = ({ farmerPhone, farmerName, onListed, txt }) => {
    const [form, setForm] = useState({
        cropName: '', quantity: '', unit: 'kg' as 'kg' | 'ton', basePrice: '',
        qualityGrade: 'A' as 'A' | 'B' | 'C', location: '', harvestDate: '', imageUrl: '', auctionEndTime: '',
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            setImagePreview(base64);
            setForm(f => ({ ...f, imageUrl: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.cropName || !form.quantity || !form.basePrice || !form.location || !form.harvestDate || !form.auctionEndTime) {
            setError('Please fill all required fields.'); return;
        }
        if (new Date(form.auctionEndTime).getTime() <= Date.now()) {
            setError('Auction end time must be in the future.'); return;
        }
        const newListing: CropListing = {
            id: `EL-${Date.now()}`,
            farmerId: farmerPhone,
            farmerName, farmerPhone,
            cropName: form.cropName,
            quantity: parseFloat(form.quantity),
            unit: form.unit as 'kg' | 'ton',
            basePrice: parseFloat(form.basePrice),
            qualityGrade: form.qualityGrade,
            location: form.location,
            harvestDate: form.harvestDate,
            imageUrl: form.imageUrl,
            auctionEndTime: form.auctionEndTime,
            currentBid: parseFloat(form.basePrice),
            currentBidder: '', currentBidderPhone: '',
            bids: [], status: 'active',
            createdAt: new Date().toISOString(),
        };
        const auctions = loadAuctions();
        auctions.unshift(newListing);
        saveAuctions(auctions);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); onListed(); }, 2000);
    };

    const inputCls = "w-full px-5 py-4 bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm";
    const labelCls = "text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2 block";

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 p-8 shadow-sm">
            <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight mb-8 flex items-center gap-3">
                <span className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                    <i className="fas fa-seedling" />
                </span>
                {txt.list_title}
            </h2>

            {success && (
                <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-2xl text-emerald-700 dark:text-emerald-400 font-black text-sm">
                    {txt.success_listed}
                </div>
            )}
            {error && (
                <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-2xl text-red-600 text-sm font-bold">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className={labelCls}>{txt.crop_name} *</label>
                        <input value={form.cropName} onChange={e => set('cropName', e.target.value)} placeholder="e.g. Paddy, Tomato..." className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>{txt.crop_qty} *</label>
                            <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="100" className={inputCls} /></div>
                        <div><label className={labelCls}>{txt.unit}</label>
                            <select value={form.unit} onChange={e => set('unit', e.target.value)} className={inputCls}>
                                <option value="kg">kg</option><option value="ton">ton</option>
                            </select></div>
                    </div>
                    <div><label className={labelCls}>{txt.base_price_kg} *</label>
                        <input type="number" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="25" className={inputCls} /></div>
                    <div><label className={labelCls}>{txt.quality_grade}</label>
                        <select value={form.qualityGrade} onChange={e => set('qualityGrade', e.target.value)} className={inputCls}>
                            <option value="A">Grade A — Premium</option>
                            <option value="B">Grade B — Standard</option>
                            <option value="C">Grade C — Basic</option>
                        </select></div>
                    <div><label className={labelCls}>{txt.location} *</label>
                        <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Village, District" className={inputCls} /></div>
                    <div><label className={labelCls}>{txt.harvest_date} *</label>
                        <input type="date" value={form.harvestDate} onChange={e => set('harvestDate', e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>{txt.auction_end} *</label>
                    <input type="datetime-local" value={form.auctionEndTime} onChange={e => set('auctionEndTime', e.target.value)} className={inputCls} /></div>
                {/* Photo Upload */}
                <div>
                    <label className={labelCls}>{txt.crop_image} <span className="text-stone-400 normal-case font-bold">(optional)</span></label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    {imagePreview ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/40 group">
                            <img src={imagePreview} alt="Crop preview" className="w-full h-48 object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => { setImagePreview(null); setForm(f => ({ ...f, imageUrl: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    className="px-4 py-2 bg-white text-stone-900 rounded-xl font-black text-xs uppercase tracking-widest"
                                >
                                    <i className="fas fa-times mr-2" />{txt.change_photo}
                                </button>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                                <i className="fas fa-check mr-1" />Photo Ready
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-36 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group"
                        >
                            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                <i className="fas fa-camera text-stone-400 group-hover:text-emerald-500 text-lg transition-colors" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-stone-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{txt.upload_photo}</p>
                                <p className="text-[10px] text-stone-400 font-bold mt-0.5">{txt.photo_hint}</p>
                            </div>
                        </button>
                    )}
                </div>

                <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3">
                    <i className="fas fa-gavel" /> {txt.submit_listing}
                </button>
            </form>
        </div>
    );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC<{
    auctions: CropListing[];
    currentPhone: string;
    txt: Record<string, string>;
    onRefresh: () => void;
}> = ({ auctions, currentPhone, txt, onRefresh }) => {
    const [tab, setTab] = useState<'farmer' | 'buyer'>('farmer');
    const [paidIds, setPaidIds] = useState<Set<string>>(() => {
        try { return new Set(JSON.parse(localStorage.getItem('elam_paid') || '[]')); } catch { return new Set(); }
    });

    const confirmPayment = (id: string) => {
        const next = new Set(paidIds).add(id);
        setPaidIds(next);
        localStorage.setItem('elam_paid', JSON.stringify([...next]));
    };

    const myListings = auctions.filter(a => a.farmerPhone === currentPhone);
    const activeMine = myListings.filter(a => a.status === 'active');
    const soldMine = myListings.filter(a => a.status !== 'active' || new Date(a.auctionEndTime) < new Date());
    const myBids = auctions.filter(a => a.bids.some(b => b.bidderPhone === currentPhone));
    const wonAuctions = auctions.filter(a => a.currentBidderPhone === currentPhone && (a.status !== 'active' || new Date(a.auctionEndTime) < new Date()));

    const rowCls = "flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl";
    const statCls = "bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 text-center";

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-stone-100 dark:bg-stone-800/50 p-1.5 rounded-2xl w-fit mx-auto">
                {(['farmer', 'buyer'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow' : 'text-stone-500'}`}>
                        {t === 'farmer' ? txt.dash_farmer : txt.dash_buyer}
                    </button>
                ))}
            </div>

            {tab === 'farmer' && (
                <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className={statCls}><p className="text-3xl font-black text-emerald-500">{activeMine.length}</p><p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">{txt.active_listings}</p></div>
                        <div className={statCls}><p className="text-3xl font-black text-amber-500">{soldMine.length}</p><p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">{txt.sold_crops}</p></div>
                        <div className={statCls}><p className="text-3xl font-black text-blue-500">{myListings.reduce((s, a) => s + a.bids.length, 0)}</p><p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">Total {txt.bids}</p></div>
                    </div>

                    {/* Active listings */}
                    {activeMine.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-widest mb-4">{txt.active_listings}</h3>
                            <div className="space-y-3">
                                {activeMine.map(a => (
                                    <div key={a.id} className={rowCls}>
                                        <div>
                                            <p className="font-black text-stone-900 dark:text-white">{a.cropName}</p>
                                            <p className="text-xs text-stone-500">{a.quantity}{a.unit} · {a.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-500 font-black">₹{a.currentBid}{txt.per_kg}</p>
                                            <p className="text-xs text-stone-500">{a.bids.length} {txt.bids}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ended/sold with winner */}
                    {soldMine.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-widest mb-4">{txt.sold_crops}</h3>
                            <div className="space-y-3">
                                {soldMine.map(a => (
                                    <div key={a.id} className={`${rowCls} border border-amber-500/20`}>
                                        <div>
                                            <p className="font-black text-stone-900 dark:text-white">{a.cropName}</p>
                                            {a.currentBidder && <p className="text-xs text-emerald-500 font-bold">{txt.winner}: {a.currentBidder}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-amber-500 font-black">₹{a.currentBid}{txt.per_kg}</p>
                                            {a.currentBidder && (
                                                <a href={`tel:${a.currentBidderPhone}`} className="text-[10px] text-blue-400 underline">{txt.contact_farmer}</a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {myListings.length === 0 && <p className="text-center text-stone-400 py-12 font-bold">{txt.no_auctions}</p>}
                </div>
            )}

            {tab === 'buyer' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className={statCls}><p className="text-3xl font-black text-blue-500">{myBids.length}</p><p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">{txt.bid_on}</p></div>
                        <div className={statCls}><p className="text-3xl font-black text-emerald-500">{wonAuctions.length}</p><p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">{txt.won_auctions}</p></div>
                    </div>

                    {wonAuctions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-widest mb-4">{txt.won_auctions}</h3>
                            <div className="space-y-3">
                                {wonAuctions.map(a => (
                                    <div key={a.id} className="p-5 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-700/40 rounded-2xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-black text-stone-900 dark:text-white text-lg">{a.cropName}</p>
                                                <p className="text-xs text-stone-500">{a.quantity}{a.unit} · {a.location}</p>
                                                <p className="text-xs text-stone-500 mt-1">Farmer: <span className="font-bold text-stone-700 dark:text-stone-300">{a.farmerName}</span></p>
                                            </div>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-xl">₹{a.currentBid.toLocaleString()}</span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <a href={`tel:${a.farmerPhone}`} className="px-4 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                                                <i className="fas fa-phone text-xs" /> {txt.contact_farmer}
                                            </a>
                                            {paidIds.has(a.id) ? (
                                                <span className="px-4 py-2 bg-emerald-600/10 border border-emerald-500/30 text-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest">{txt.payment_confirmed}</span>
                                            ) : (
                                                <button onClick={() => confirmPayment(a.id)} className="px-4 py-2 bg-amber-600/10 border border-amber-500/30 text-amber-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-amber-600/20 transition-colors">
                                                    <i className="fas fa-check-circle text-xs" /> {txt.confirm_payment}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {myBids.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-widest mb-4">{txt.bid_on}</h3>
                            <div className="space-y-3">
                                {myBids.map(a => {
                                    const myBid = [...a.bids].filter(b => b.bidderPhone === currentPhone).sort((x, y) => y.amount - x.amount)[0];
                                    const isLeading = a.currentBidderPhone === currentPhone;
                                    return (
                                        <div key={a.id} className={rowCls}>
                                            <div>
                                                <p className="font-black text-stone-900 dark:text-white">{a.cropName}</p>
                                                <p className="text-xs text-stone-500">{a.location}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black ${isLeading ? 'text-emerald-500' : 'text-red-400'}`}>
                                                    {isLeading ? '▲ Leading' : '▼ Outbid'}
                                                </p>
                                                <p className="text-xs text-stone-500">My bid: ₹{myBid?.amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {myBids.length === 0 && <p className="text-center text-stone-400 py-12 font-bold">You haven't placed any bids yet.</p>}
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Elam: React.FC = () => {
    const { language } = useLanguage();
    const txt = T[language] || T.English;

    const [tab, setTab] = useState<'browse' | 'list' | 'dashboard'>('browse');
    const [auctions, setAuctions] = useState<CropListing[]>([]);
    const [profile, setProfile] = useState<{ name: string; phone: string } | null>(null);
    const [filterGrade, setFilterGrade] = useState<'all' | 'A' | 'B' | 'C'>('all');

    // Load user profile
    useEffect(() => {
        const phone = localStorage.getItem('currentUserPhone') || '';
        const raw = localStorage.getItem('farmerProfile');
        if (raw) {
            const p = JSON.parse(raw);
            setProfile({ name: p.name || 'Farmer', phone });
        }
    }, []);

    const refresh = useCallback(() => {
        // Auto-end expired auctions
        const all = loadAuctions().map(a => {
            if (a.status === 'active' && new Date(a.auctionEndTime) < new Date()) {
                return { ...a, status: a.currentBidder ? 'sold' : 'ended' } as CropListing;
            }
            return a;
        });
        saveAuctions(all);
        setAuctions(all);
    }, []);

    useEffect(() => { refresh(); const id = setInterval(refresh, 10000); return () => clearInterval(id); }, [refresh]);

    const handleBid = useCallback((listing: CropListing, amount: number): string => {
        if (!profile) return 'Please login first.';
        if (amount <= listing.currentBid) return txt.bid_low;
        const bid: Bid = {
            bidderName: profile.name,
            bidderPhone: profile.phone,
            amount,
            timestamp: new Date().toISOString(),
        };
        const updated = loadAuctions().map(a =>
            a.id === listing.id
                ? { ...a, currentBid: amount, currentBidder: profile.name, currentBidderPhone: profile.phone, bids: [...a.bids, bid] }
                : a
        );
        saveAuctions(updated);
        setAuctions(updated);
        return txt.bid_submitted;
    }, [profile, txt]);

    const activeAuctions = auctions.filter(a => a.status === 'active' && new Date(a.auctionEndTime) > new Date());
    const endedAuctions = auctions.filter(a => a.status !== 'active' || new Date(a.auctionEndTime) <= new Date());
    const filtered = (filterGrade === 'all' ? activeAuctions : activeAuctions.filter(a => a.qualityGrade === filterGrade));

    const tabBtn = (key: 'browse' | 'list' | 'dashboard', label: string, icon: string) => (
        <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' : 'bg-white dark:bg-stone-900 text-stone-500 border border-stone-100 dark:border-stone-800 hover:border-emerald-400/40'}`}>
            <i className={`fas ${icon}`} /> {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-10 px-4 transition-colors">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">Live Auction Platform</span>
                    </div>
                    <h1 className="heading-font text-5xl md:text-6xl font-black text-stone-900 dark:text-white tracking-tighter">{txt.title}</h1>
                    <p className="text-stone-500 font-bold mt-2">{txt.subtitle}</p>
                    {profile && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-stone-100 dark:border-stone-800 text-sm">
                            <i className="fas fa-user-circle text-emerald-500" />
                            <span className="font-bold text-stone-700 dark:text-stone-300">{profile.name}</span>
                            <span className="text-stone-400">·</span>
                            <span className="text-stone-500 text-xs">{profile.phone}</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {tabBtn('browse', txt.tab_browse, 'fa-store')}
                    {tabBtn('list', txt.tab_list, 'fa-seedling')}
                    {tabBtn('dashboard', txt.tab_dashboard, 'fa-chart-bar')}
                </div>

                {/* Browse Tab */}
                {tab === 'browse' && (
                    <div>
                        {/* Filters */}
                        <div className="flex items-center gap-3 mb-8 flex-wrap">
                            <span className="text-xs font-black text-stone-500 uppercase tracking-widest">Filter by Grade:</span>
                            {(['all', 'A', 'B', 'C'] as const).map(g => (
                                <button key={g} onClick={() => setFilterGrade(g)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${filterGrade === g ? 'bg-emerald-600 text-white border-transparent' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-500'}`}>
                                    {g === 'all' ? 'All' : `Grade ${g}`}
                                </button>
                            ))}
                            <span className="ml-auto text-xs text-stone-400 font-bold">{filtered.length} {txt.active_auctions}</span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <i className="fas fa-store-slash text-stone-300 text-3xl" />
                                </div>
                                <p className="text-stone-400 font-bold text-lg">{txt.no_auctions}</p>
                                <button onClick={() => setTab('list')} className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                                    {txt.tab_list}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map(a => (
                                    <AuctionCard
                                        key={a.id}
                                        listing={a}
                                        currentUserPhone={profile?.phone || ''}
                                        currentUserName={profile?.name || 'Buyer'}
                                        onBid={handleBid}
                                        txt={txt}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Ended auctions */}
                        {endedAuctions.length > 0 && (
                            <div className="mt-16">
                                <h2 className="text-sm font-black text-stone-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <i className="fas fa-history" /> {txt.auction_ended} ({endedAuctions.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                                    {endedAuctions.map(a => (
                                        <AuctionCard key={a.id} listing={a} currentUserPhone={profile?.phone || ''} currentUserName={profile?.name || ''} onBid={handleBid} txt={txt} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* List Tab */}
                {tab === 'list' && profile && (
                    <ListCropForm
                        farmerPhone={profile.phone}
                        farmerName={profile.name}
                        onListed={() => { refresh(); setTab('browse'); }}
                        txt={txt}
                    />
                )}
                {tab === 'list' && !profile && (
                    <div className="text-center py-24">
                        <i className="fas fa-lock text-stone-300 text-4xl mb-4" />
                        <p className="text-stone-500 font-bold">Please login as a Farmer to list crops.</p>
                    </div>
                )}

                {/* Dashboard Tab */}
                {tab === 'dashboard' && profile && (
                    <Dashboard auctions={auctions} currentPhone={profile.phone} txt={txt} onRefresh={refresh} />
                )}
                {tab === 'dashboard' && !profile && (
                    <div className="text-center py-24">
                        <i className="fas fa-lock text-stone-300 text-4xl mb-4" />
                        <p className="text-stone-500 font-bold">Please login to view your dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Elam;
