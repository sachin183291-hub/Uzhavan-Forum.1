// Tamil translations for Crop Lifecycle Intelligence

export const UI_TA = {
    title: 'பயிர் வாழ்க்கைச்சுழல் நுண்ணறிவு',
    subtitle: 'விதை முதல் அறுவடை வரை — நோய் மேலாண்மை வழிகாட்டி',
    placeholder: 'பயிர் பெயர் தேடுக (எ.கா. நெல், தக்காளி...)',
    searchBtn: 'தேடு',
    recent: 'சமீபத்திய:',
    stagesLabel: 'நிலைகள்',
    diseasesLabel: 'நோய்கள்',
    treatmentsLabel: 'சிகிச்சைகள்',
    possibleDiseases: 'சாத்தியமான நோய்கள்',
    clickHint: 'விரிவுக்கு கிளிக் செய்யவும்',
    symptoms: 'அறிகுறிகள்',
    prevention: 'தடுப்பு முறை',
    treatment: 'சிகிச்சை',
    noResult: 'பயிர் கிடைக்கவில்லை. Rice, Maize, Banana, Tomato, Cotton, Chilli என்று தட்டச்சு செய்யவும்.',
    beginSearch: 'தொடங்க ஒரு பயிரை தேடவும்',
    beginDesc: 'மேலே பயிர் பெயர் தட்டச்சு செய்து முழு வாழ்க்கைச்சுழலை காணவும்.',
    lifecycle: 'பயிர் வாழ்க்கைச்சுழல்',
    stageLabel: 'நிலை',
    durationLabel: 'காலம்',
};

export const CROP_NAME_TA: Record<string, string> = {
    Rice: 'நெல்',
    Maize: 'மக்காச்சோளம்',
    Banana: 'வாழை',
    Tomato: 'தக்காளி',
    Cotton: 'பருத்தி',
    Chilli: 'மிளகாய்',
};

export const STAGE_TA: Record<string, { name: string; desc: string }> = {
    'Seed Stage': { name: 'விதை நிலை', desc: 'விதைகள் நாற்றங்காலில் ஊறவைக்கப்பட்டு தயாரிக்கப்படும்.' },
    'Germination Stage': { name: 'முளைப்பு நிலை', desc: 'விதை ஓடு உடைந்து வேர் மற்றும் துளிர் வெளிவரும்.' },
    'Seedling Stage': { name: 'நாற்று நிலை', desc: 'இளம் நாற்றுகள் நாற்றங்காலில் வளர்க்கப்படும்.' },
    'Vegetative Stage': { name: 'வளர்ச்சி நிலை', desc: 'தண்டு மற்றும் இலைகள் வேகமாக வளரும்.' },
    'Flowering Stage': { name: 'பூக்கும் நிலை', desc: 'பூக்கள் மலர்ந்து மகரந்தச்சேர்க்கை நடக்கும்.' },
    'Fruiting / Grain Formation Stage': { name: 'காய்ப்பு / தானிய நிரம்பல்', desc: 'காய் மற்றும் தானியங்கள் உருவாகும்.' },
    'Grain Formation Stage': { name: 'தானிய நிரம்பல் நிலை', desc: 'தானியங்கள் நிறைவடையும்.' },
    'Maturity Stage': { name: 'முதிர்ச்சி நிலை', desc: 'பயிர் முதிர்வடைந்து அறுவடைக்கு தயாராகும்.' },
    'Harvest Stage': { name: 'அறுவடை நிலை', desc: 'பயிர் அறுவடை செய்யப்பட்டு சேமிக்கப்படும்.' },
    'Fruiting Stage': { name: 'காய்ப்பு நிலை', desc: 'காய்கள் உருவாகி வளரும்.' },
};

export type DiseaseType = 'fungal' | 'bacterial' | 'viral' | 'pest' | 'physiological';

export const TYPE_CONFIG: Record<DiseaseType, { bg: string; border: string; color: string; emoji: string; label: string; labelTa: string }> = {
    fungal: { bg: '#fff7ed', border: '#fed7aa', color: '#c2410c', emoji: '🍄', label: 'Fungal Disease', labelTa: 'பூஞ்சை நோய்' },
    bacterial: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', emoji: '🔬', label: 'Bacterial Disease', labelTa: 'பாக்டீரியா நோய்' },
    viral: { bg: '#fdf4ff', border: '#e9d5ff', color: '#7e22ce', emoji: '🦠', label: 'Viral Disease', labelTa: 'வைரஸ் நோய்' },
    pest: { bg: '#fff1f2', border: '#fecdd3', color: '#be123c', emoji: '🐛', label: 'Pest / Insect', labelTa: 'பூச்சி / புழு' },
    physiological: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', emoji: '⚡', label: 'Physiological', labelTa: 'உடலியல் நோய்' },
};

export const DISEASE_TYPE: Record<string, DiseaseType> = {
    'Seed Rot': 'fungal', 'Smut': 'fungal', 'Pythium': 'fungal', 'Damping Off': 'fungal',
    'Leaf Spot': 'fungal', 'Blight': 'fungal', 'Sheath Blight': 'fungal',
    'Bacterial Wilt': 'bacterial', 'Neck Blast': 'fungal', 'Powdery Mildew': 'fungal',
    'Brown Spot': 'fungal', 'False Smut': 'fungal', 'Grain Discoloration': 'physiological',
    'Aspergillus (Storage Mold)': 'fungal', 'Downy Mildew': 'fungal', 'Rust': 'fungal',
    'Anthracnose': 'fungal', 'Charcoal Rot': 'fungal', 'Ear Rot': 'fungal',
    'Gray Mold': 'fungal', 'Aspergillus (Aflatoxin)': 'fungal', 'Fusarium Wilt': 'fungal',
    'Panama Disease': 'fungal', 'Sigatoka': 'fungal', 'Crown Rot': 'fungal',
    'Cigar End Rot': 'fungal', 'Early Blight': 'fungal', 'Mosaic Virus': 'viral',
    'Late Blight': 'fungal', 'Blossom End Rot': 'physiological', 'Root Rot': 'fungal',
    'Alternaria': 'fungal', 'Bacterial Blight': 'bacterial', 'Boll Rot': 'fungal',
    'Bollworm': 'pest', 'Cercospora Leaf Spot': 'fungal', 'Stem Rust': 'fungal',
    'Leaf Curl': 'viral', 'Collar Rot': 'fungal', 'Botrytis': 'fungal',
    'Chilli Veinal Mosaic': 'viral', 'Fruit Borer': 'pest',
};

export interface DiseaseTa {
    name: string;
    symptoms: string;
    prevention: string;
    treatment: string;
}

export const DISEASE_TA: Record<string, DiseaseTa> = {
    'Seed Rot': {
        name: 'விதை அழுகல்',
        symptoms: 'விதைகள் முளைக்காமல் அழுகும்; துர்நாற்றம் வீசும்.',
        prevention: 'சான்றிதழ் பெற்ற விதை; Thiram கலவையில் ஊறவையுங்கள்.',
        treatment: 'Thiram / Captan விதை நேர்த்தி செய்யவும்.',
    },
    'Smut': {
        name: 'கரும்புகார் நோய்',
        symptoms: 'தானியங்கள் கருப்பு தூளாக மாறும்; அறுவடையில் வெடிக்கும்.',
        prevention: 'எதிர்ப்பு வகை விதைகள்; நோய்த்த புலங்கள் தவிர்க்கவும்.',
        treatment: 'Carboxin அல்லது Vitavax விதை நேர்த்தி செய்யவும்.',
    },
    'Pythium': {
        name: 'பைத்தியம் வேர் அழுகல்',
        symptoms: 'மண் மட்டத்தில் நீர் ஊறிய அழுகல்; நாற்றுகள் சாய்ந்துவிடும்.',
        prevention: 'நல்ல வடிகால்; அதிக நீர்ப்பாசனம் தவிர்க்கவும்.',
        treatment: 'Metalaxyl அல்லது Fosetyl-Al தெளிப்பு.',
    },
    'Damping Off': {
        name: 'நாற்று வாடல் நோய்',
        symptoms: 'நாற்றுகள் திடீரென வாடி மண் மட்டத்தில் வீழும்.',
        prevention: 'Trichoderma உயிரிய விதை நேர்த்தி; மண் கிருமி நீக்கம்.',
        treatment: 'செம்பு ஆக்ஸிகுளோரைடு (3 கி/லி) தெளிப்பு.',
    },
    'Leaf Spot': {
        name: 'இலைப் புள்ளி நோய்',
        symptoms: 'இலையில் மஞ்சள் வட்டத்துடன் பழுப்பு புள்ளிகள் தோன்றும்.',
        prevention: 'சீரான நைட்ரஜன் உரம்; நீர் அழுத்தம் தவிர்க்கவும்.',
        treatment: 'Mancozeb அல்லது Iprodione 750 கி/ஹெக். தெளிக்கவும்.',
    },
    'Blight': {
        name: 'கருகல் நோய்',
        symptoms: 'நீர் ஊறிய சாம்பல் புள்ளிகள்; இலை விரைவில் இறக்கும்.',
        prevention: 'எதிர்ப்பு வகை; தேங்கும் நீரை வடிக்கவும்.',
        treatment: 'Validamycin அல்லது Hexaconazole தெளிக்கவும்.',
    },
    'Sheath Blight': {
        name: 'தண்டு உறை அழுகல்',
        symptoms: 'இலை உறையில் சாம்பல்-பச்சை நீள் புண்கள் தோன்றும்.',
        prevention: 'செடி அடர்த்தி குறைக்கவும்; நைட்ரஜன் கட்டுப்படுத்தவும்.',
        treatment: 'Propiconazole 25 EC 1 மி.லி/லி தெளிக்கவும்.',
    },
    'Bacterial Wilt': {
        name: 'பாக்டீரியா வாடல்',
        symptoms: 'இலைகள் மஞ்சளாகி வாடும்; வெட்டினால் வெண்மை திரவம் வரும்.',
        prevention: 'வேர் காயம் தவிர்க்கவும்; சான்று விதை பயன்படுத்தவும்.',
        treatment: 'வேதி மருந்து இல்லை; பாதித்த செடியை உடனே அகற்றவும்.',
    },
    'Neck Blast': {
        name: 'கழுத்து வெடிப்பு நோய்',
        symptoms: 'கதிர் அடி பழுப்பாகும்; முழு கதிரும் வெளுத்துவிடும் (வெள்ளைக் கதிர்).',
        prevention: 'சீரான உரமிடல்; வெடிப்பு எதிர்ப்பு வகை பயன்படுத்தவும்.',
        treatment: 'Tricyclazole அல்லது Isoprothiolane கதிர் வெளிப்படும்போது தெளிக்கவும்.',
    },
    'Powdery Mildew': {
        name: 'மாவுப் பூஞ்சை நோய்',
        symptoms: 'இலையில் வெள்ளை மாவு போன்ற பூச்சு படரும்.',
        prevention: 'நல்ல காற்றோட்டம்; அதிக நைட்ரஜன் தவிர்க்கவும்.',
        treatment: 'Sulfur 80WP அல்லது Propiconazole தெளிக்கவும்.',
    },
    'Brown Spot': {
        name: 'பழுப்பு புள்ளி நோய்',
        symptoms: 'தானியம் மற்றும் இலையில் பழுப்பு நீள் புள்ளிகள் தோன்றும்.',
        prevention: 'கொட்டாசியம் உரமிடல்; வறட்சி தவிர்க்கவும்.',
        treatment: 'Edifenphos அல்லது Mancozeb 2.5 கி/லி தெளிக்கவும்.',
    },
    'False Smut': {
        name: 'பொய் கரும்புகார்',
        symptoms: 'தானியங்கள் ஆரஞ்சு-மஞ்சள் உருண்டைகளாக மாறும்.',
        prevention: 'அதிக நைட்ரஜன் தவிர்க்கவும்; சுத்தமான விதை பயன்படுத்தவும்.',
        treatment: 'பூக்கும் நிலையில் செம்பு ஆக்ஸிகுளோரைடு தெளிக்கவும்.',
    },
    'Grain Discoloration': {
        name: 'தானிய நிறமாற்றம்',
        symptoms: 'உமி கருப்பாகும்; தரம் குறைந்த தானியங்கள் உருவாகும்.',
        prevention: 'சரியான நேரத்தில் அறுவடை; அதிக ஈரம் தவிர்க்கவும்.',
        treatment: 'தேவைப்பட்டால் Carbendazim தெளிக்கவும்.',
    },
    'Aspergillus (Storage Mold)': {
        name: 'சேமிப்பகப் பூஞ்சை',
        symptoms: 'சேமித்த தானியத்தில் பச்சை / கருப்பு பூஞ்சை; நச்சுத்தன்மை.',
        prevention: '14% க்கும் குறைவான ஈரப்பதத்தில் உலர்த்தி சேமிக்கவும்.',
        treatment: 'நல்ல காற்றோட்டம்; ஹெர்மெட்டிக் சேமிப்பு பைகள்.',
    },
    'Downy Mildew': {
        name: 'இறக்கைப் பூஞ்சை நோய்',
        symptoms: 'இலையில் மஞ்சள் கோடுகள்; அடிப்பில் வெண்மை பூஞ்சை.',
        prevention: 'எதிர்ப்பு வகை; நோய்த்தடுப்பு Metalaxyl தெளிப்பு.',
        treatment: 'Metalaxyl அல்லது Mancozeb தெளிக்கவும்.',
    },
    'Rust': {
        name: 'துரு நோய்',
        symptoms: 'இலையின் இரு புறத்திலும் சிறு பழுப்பு கொப்புளங்கள்.',
        prevention: 'ஆரம்பகால நடவு; எதிர்ப்பு வகை படிர் பயன்படுத்தவும்.',
        treatment: 'Azoxystrobin அல்லது Propiconazole இலை தெளிக்கவும்.',
    },
    'Anthracnose': {
        name: 'கருகல் / கரி புண் நோய்',
        symptoms: 'தண்டில் / காயில் கரிய சுருங்கிய புண்கள் உருவாகும்.',
        prevention: 'பயிர் சுழற்சி; அதிக நைட்ரஜன் தவிர்க்கவும்.',
        treatment: 'Carbendazim அல்லது Mancozeb தெளிக்கவும்.',
    },
    'Charcoal Rot': {
        name: 'கரி அழுகல் நோய்',
        symptoms: 'தண்டு கரி கோடுகளுடன் பிளக்கும்; பயிர் முன்கூட்டி முதிரும்.',
        prevention: 'மண் ஈரம் பராமரி; கொட்டாசியம் உரமிடு.',
        treatment: 'வடிகால் மேம்படுத்தவும்; நேரடி மருந்து இல்லை.',
    },
    'Ear Rot': {
        name: 'கதிர் அழுகல்',
        symptoms: 'கதிர் இடையில் இளஞ்சிவப்பு / சிவப்பு பூஞ்சை தோன்றும்.',
        prevention: 'சரியான நேரத்தில் அறுவடை; எதிர்ப்பு வகை பயன்படுத்தவும்.',
        treatment: '13% க்கு கீழ் வேகமாக உலர்த்தவும்.',
    },
    'Gray Mold': {
        name: 'சாம்பல் பூஞ்சை நோய்',
        symptoms: 'தண்டு மற்றும் உறையில் சாம்பல் இறகு போன்ற வளர்ச்சி.',
        prevention: 'குறைந்த ஈரப்பதம்; நல்ல காற்றோட்டம்.',
        treatment: 'Iprodione அல்லது Fenhexamid தெளிக்கவும்.',
    },
    'Aspergillus (Aflatoxin)': {
        name: 'அஃபடாக்சின் பூஞ்சை',
        symptoms: 'கதிரில் பச்சை பூஞ்சை; தானியத்தில் நச்சுத்தன்மை.',
        prevention: '13% க்கும் குறைவான வரண்ட சேமிப்பு.',
        treatment: 'நச்சு தானியம் நிராகரி; உரிய வடிகட்டல்.',
    },
    'Fusarium Wilt': {
        name: 'பூசண வாடல் நோய்',
        symptoms: 'இளமஞ்சள் வாடல்; தண்டு வெட்டினால் பழுப்பு நரம்புகள் தெரியும்.',
        prevention: 'எதிர்ப்பு வகை; மண் வெப்பமாக்கல் (Solarization).',
        treatment: 'Carbendazim வேர் வட்ட தெளிப்பு.',
    },
    'Panama Disease': {
        name: 'பனாமா நோய் (TR4)',
        symptoms: 'வெளி இலையிலிருந்து உள்ளே மஞ்சள் படரும்; தண்டு கறுக்கும்.',
        prevention: 'TR4 எதிர்ப்பு வாழை வகை நடவு; மண் கிருமி நீக்கம்.',
        treatment: 'தீர்வில்லை; தனிமைப்படுத்தி அழிக்கவும்.',
    },
    'Sigatoka': {
        name: 'சிகடோகா இலை நோய்',
        symptoms: 'இலையில் மஞ்சள் கோடுகள்; பழுப்பாகி உதிரும்.',
        prevention: 'இறந்த இலை அகற்றல்; எண்ணெய் தெளிப்பு.',
        treatment: 'Propiconazole / Mancozeb 21 நாட்களுக்கு ஒருமுறை தெளிக்கவும்.',
    },
    'Crown Rot': {
        name: 'கிரீட அழுகல்',
        symptoms: 'பழ மொட்டில் கரிய நீர் ஊறிய அழுகல்; போக்குவரத்தில் நோய்.',
        prevention: 'சுத்தமான வெட்டு; Fungicide முக்கல்.',
        treatment: 'Thiabendazole / Imazalil முக்கல்.',
    },
    'Cigar End Rot': {
        name: 'சுருட்டு முனை அழுகல்',
        symptoms: 'வாழைப்பழ நுனி கரிய கோட்டித்துப் போகும்.',
        prevention: 'பழைய பூச்சுகள் அகற்றல்; தோட்ட சுத்தம்.',
        treatment: 'Carbendazim தெளிப்பு.',
    },
    'Early Blight': {
        name: 'ஆரம்பகால தீக்கடி நோய்',
        symptoms: 'கீழ் இலைகளில் வட்ட வரிசை Bull\'s-eye புண்கள்.',
        prevention: 'மேல் நீர்ப்பாசனம் தவிர்; பயிர் சுழற்சி.',
        treatment: 'Mancozeb / Chlorothalonil 7 நாட்களுக்கு ஒருமுறை தெளிக்கவும்.',
    },
    'Mosaic Virus': {
        name: 'மொசைக் வைரஸ் நோய்',
        symptoms: 'இலையில் மஞ்சள்-பச்சை கலவை நிறம்; சிதைந்த இலைகள்.',
        prevention: 'அசுவினி (Aphid) கட்டுப்படுத்தவும்; நோய்த்த செடி அகற்றவும்.',
        treatment: 'தீர்வில்லை; வாகன பூச்சியை அழிக்கவும்.',
    },
    'Late Blight': {
        name: 'தாமதகால தீக்கடி நோய்',
        symptoms: 'இலை மற்றும் காயில் இருண்ட நீர் ஊறிய புண்கள்.',
        prevention: 'அடர் நடவு தவிர்; பயிர் கழிவு அகற்றவும்.',
        treatment: 'Cymoxanil + Mancozeb 5-7 நாட்களுக்கு ஒருமுறை தெளிக்கவும்.',
    },
    'Blossom End Rot': {
        name: 'பூ முனை அழுகல்',
        symptoms: 'காய் நுனியில் கரிய தோல் போன்ற அழிவு; கால்சியம் குறைபாடு.',
        prevention: 'சீரான நீர்ப்பாசனம்; கால்சியம் தெளிப்பு.',
        treatment: 'CaNO3 இலை தெளிப்பு; நீர் நிலைத்தன்மை பராமரி.',
    },
    'Root Rot': {
        name: 'வேர் அழுகல்',
        symptoms: 'வேர் கருப்பாகி மென்மையாகும்; செடி வளர்ச்சி குறையும்.',
        prevention: 'நல்ல வடிகால்; Trichoderma மண் கலவை.',
        treatment: 'Metalaxyl தெளிப்பு.',
    },
    'Alternaria': {
        name: 'ஆல்ட்டர்னேரியா புள்ளி நோய்',
        symptoms: 'இலை / காயில் வட்ட வரிசை பழுப்பு புள்ளிகள்.',
        prevention: 'செம்பு நோய்த்தடுப்பு தெளிப்பு.',
        treatment: 'Mancozeb + Carbendazim தெளிக்கவும்.',
    },
    'Bacterial Blight': {
        name: 'பாக்டீரியா கருகல் நோய்',
        symptoms: 'இலையில் கோண வடிவ நீர் ஊறிய புண்கள்; தண்டு கருகும்.',
        prevention: 'எதிர்ப்பு வகை; விதை நேர்த்தி.',
        treatment: 'Streptocycline + Copper கலவை தெளிக்கவும்.',
    },
    'Boll Rot': {
        name: 'காய் அழுகல் நோய்',
        symptoms: 'பருத்தி காயில் நீர் ஊறிய புண்கள்; உள்ளே அழுகும்.',
        prevention: 'அதிக ஈரம் தவிர்; நல்ல இடைவெளி வைக்கவும்.',
        treatment: 'Copper கலவை தெளிக்கவும்.',
    },
    'Bollworm': {
        name: 'காய்ப்புழு',
        symptoms: 'புழுக்கள் காயில் துளையிடும்; முன்கூட்டி காய் திறக்கும்.',
        prevention: 'Bt பருத்தி; பெரோமோன் கண்ணி; NPV தெளிப்பு.',
        treatment: 'Spinosad / Emamectin benzoate தெளிக்கவும்.',
    },
    'Cercospora Leaf Spot': {
        name: 'செர்கோஸ்போரா இலைப் புள்ளி',
        symptoms: 'சிவப்பு-பழுப்பு புள்ளிகள்; முன்கூட்டி இலை உதிரும்.',
        prevention: 'ஆரம்பகால தெளிப்பு; நைட்ரஜன் கட்டுப்படுத்தவும்.',
        treatment: 'Carbendazim / Mancozeb தெளிக்கவும்.',
    },
    'Stem Rust': {
        name: 'தண்டு துரு நோய்',
        symptoms: 'தண்டில் ஆரஞ்சு-சிவப்பு துரு கொப்புளங்கள் தோன்றும்.',
        prevention: 'சரியான நேரத்தில் அறுவடை செய்யவும்.',
        treatment: 'Propiconazole தெளிக்கவும்.',
    },
    'Leaf Curl': {
        name: 'இலை சுரிதல் நோய்',
        symptoms: 'இலைகள் மேல் / கீழாக சுருண்டு; செடி குள்ளமாகும்.',
        prevention: 'வெள்ளை ஈ கட்டுப்படுத்தவும்; பிரதிபலிப்பு மல்ச்.',
        treatment: 'Imidacloprid தெளிப்பு; நோய் பரவல் தடுக்கவும்.',
    },
    'Collar Rot': {
        name: 'கழுத்து அழுகல் நோய்',
        symptoms: 'மண் மட்டத்தில் தண்டு கரிய நீர் ஊறிய அழுகல்.',
        prevention: 'ஆழமான நடவு தவிர்; Trichoderma மண் தெளிப்பு.',
        treatment: 'Carbendazim 1 கி/லி வேர் வட்ட தெளிப்பு.',
    },
    'Botrytis': {
        name: 'போட்ரிட்டிஸ் பூஞ்சை',
        symptoms: 'பூவில் சாம்பல் இறகு போன்ற வளர்ச்சி; பூ உதிரும்.',
        prevention: 'நல்ல காற்றோட்டம்; நோய்த்த பூக்கள் அகற்றவும்.',
        treatment: 'Iprodione / Fenhexamid தெளிக்கவும்.',
    },
    'Chilli Veinal Mosaic': {
        name: 'மிளகாய் நரம்பு மொசைக் நோய்',
        symptoms: 'இலை நரம்பு மஞ்சளாகும்; பூக்கள் சிதைவடையும்.',
        prevention: 'பூச்சி (Mite / Aphid) கட்டுப்படுத்தவும்.',
        treatment: 'தீர்வில்லை; நோய்த்த செடி அகற்று; பூச்சிக்கொல்லி தெளி.',
    },
    'Fruit Borer': {
        name: 'காய்த் துளைப்பான்',
        symptoms: 'புழு காயில் துளையிட்டு சாப்பிடும்; காய் முன்கூட்டி உதிரும்.',
        prevention: 'பெரோமோன் கண்ணி; NPV உயிரிய மருந்து.',
        treatment: 'Emamectin benzoate 0.5 கி/லி தெளிக்கவும்.',
    },
};
