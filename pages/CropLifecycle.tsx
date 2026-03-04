import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { UI_TA, CROP_NAME_TA, STAGE_TA, DISEASE_TA, DISEASE_TYPE, TYPE_CONFIG } from './cropDataTa.ts';

const DISEASE_ICONS: Record<string, string> = {
    'Seed Rot': '🦠', 'Smut': '🍄', 'Root Rot': '🌿', 'Pythium': '🧫',
    'Damping Off': '💧', 'Downy Mildew': '🍃', 'Leaf Spot': '🔴', 'Blight': '🔥',
    'Rust': '🟤', 'Wilt': '🥀', 'Mosaic Virus': '🦟', 'Anthracnose': '⚫',
    'Powdery Mildew': '⬜', 'Neck Blast': '💥', 'Brown Spot': '🟫', 'Sheath Blight': '🌾',
    'Late Blight': '🌑', 'Early Blight': '🌕', 'Fusarium Wilt': '🧪', 'Panama Disease': '🍌',
    'Cercospora': '🔵', 'Alternaria': '🟡', 'Botrytis': '🩶', 'Sigatoka': '🍂',
    'Bacterial Wilt': '🫧', 'Fruit Borer': '🐛', 'Charcoal Rot': '⚫', 'Stem Rust': '🟥',
    'Bollworm': '🐛', 'Gray Mold': '🩶', 'Collar Rot': '🟠', 'Chilli Veinal Mosaic': '🦠',
};

interface Disease {
    name: string;
    symptoms: string;
    prevention: string;
    treatment: string;
}
interface Stage {
    stage: string;
    icon: string;
    duration: string;
    description: string;
    diseases: Disease[];
}
interface CropData {
    [crop: string]: Stage[];
}

const CROP_DATA: CropData = {
    Rice: [
        {
            stage: 'Seed Stage', icon: '🌱', duration: '3–5 days', description: 'Seeds are soaked and prepared for germination in nursery beds.', diseases: [
                { name: 'Seed Rot', symptoms: 'Seeds decay before sprouting; foul smell, slimy texture.', prevention: 'Use certified seeds; treat with fungicide before sowing.', treatment: 'Discard infected seeds; apply Thiram or Captan seed treatment.' },
                { name: 'Smut', symptoms: 'Black powdery masses replace grain; spore release at harvest.', prevention: 'Use resistant varieties; avoid infested fields.', treatment: 'Apply Carboxin or Vitavax seed treatment.' }
            ]
        },
        {
            stage: 'Germination Stage', icon: '🌿', duration: '5–10 days', description: 'Seed coat breaks; radicle and plumule emerge.', diseases: [
                { name: 'Pythium', symptoms: 'Water-soaked rotting at soil line; seedlings collapse.', prevention: 'Well-drained seedbed; avoid overwatering.', treatment: 'Drench with Metalaxyl or Fosetyl-Al fungicide.' },
                { name: 'Damping Off', symptoms: 'Seedlings wilt suddenly and fall over at soil surface.', prevention: 'Sterilize seedbed; use bioagent Trichoderma.', treatment: 'Copper oxychloride drench at root zone.' }
            ]
        },
        {
            stage: 'Seedling Stage', icon: '🌾', duration: '25–30 days', description: 'Young plants develop in nursery before transplanting.', diseases: [
                { name: 'Leaf Spot', symptoms: 'Oval brown spots with yellow halo on leaves.', prevention: 'Balanced nitrogen; avoid water stress.', treatment: 'Spray Mancozeb or Iprodione 750 g/ha.' },
                { name: 'Blight', symptoms: 'Water-soaked gray-green lesions; rapid leaf death.', prevention: 'Use resistant varieties; drain stagnant water.', treatment: 'Apply Validamycin or Hexaconazole spray.' }
            ]
        },
        {
            stage: 'Vegetative Stage', icon: '🌿', duration: '40–60 days', description: 'Plant tillering and active stem/leaf growth.', diseases: [
                { name: 'Sheath Blight', symptoms: 'Oval greenish-gray lesions on leaf sheaths; lesions enlarge.', prevention: 'Reduce plant density; avoid excessive nitrogen.', treatment: 'Spray Propiconazole 25 EC at 0.1% concentration.' },
                { name: 'Bacterial Wilt', symptoms: 'Yellowing and wilting of leaves; milky bacterial ooze from cut stems.', prevention: 'Avoid injury to roots; use certified seed.', treatment: 'No chemical cure; remove infected plants promptly.' }
            ]
        },
        {
            stage: 'Flowering Stage', icon: '🌸', duration: '10–15 days', description: 'Panicle emergence and pollination occur.', diseases: [
                { name: 'Neck Blast', symptoms: 'Brown lesion at base of panicle; entire panicle dies (whiteear).', prevention: 'Balanced fertilization; use blast-resistant varieties.', treatment: 'Spray Tricyclazole or Isoprothiolane at heading.' },
                { name: 'Powdery Mildew', symptoms: 'White powdery coating on leaves during humid conditions.', prevention: 'Good air circulation; avoid high nitrogen.', treatment: 'Spray Sulfur 80WP or Propiconazole.' }
            ]
        },
        {
            stage: 'Grain Formation Stage', icon: '🌾', duration: '20–30 days', description: 'Grain filling and starch accumulation in spikelets.', diseases: [
                { name: 'Brown Spot', symptoms: 'Brown oval spots on grains and leaves; chalky grains.', prevention: 'Adequate potassium nutrition; avoid drought stress.', treatment: 'Apply Edifenphos or Mancozeb 2.5 g/L spray.' },
                { name: 'False Smut', symptoms: 'Orange-yellow balls replace grain; powdery on touch.', prevention: 'Avoid excessive nitrogen; use clean seed.', treatment: 'Spray Copper oxychloride at flowering stage.' }
            ]
        },
        {
            stage: 'Maturity Stage', icon: '🟡', duration: '15–25 days', description: 'Grains reach physiological maturity; leaves yellow.', diseases: [
                { name: 'Grain Discoloration', symptoms: 'Dark staining on husks; poor grain quality.', prevention: 'Timely harvest; avoid high humidity at maturity.', treatment: 'Spray Carbendazim before harvest if needed.' }
            ]
        },
        {
            stage: 'Harvest Stage', icon: '🌾', duration: '3–7 days', description: 'Crop is cut, threshed, and stored.', diseases: [
                { name: 'Aspergillus (Storage Mold)', symptoms: 'Green/black mold on stored grains; mycotoxin risk.', prevention: 'Dry grains below 14% moisture before storage.', treatment: 'Proper ventilation; use hermetic bags for storage.' }
            ]
        },
    ],
    Maize: [
        {
            stage: 'Seed Stage', icon: '🌱', duration: '3–7 days', description: 'Maize kernels imbibe water and trigger germination enzymes.', diseases: [
                { name: 'Seed Rot', symptoms: 'Soft, discolored seeds with foul odor before emergence.', prevention: 'Use fungicide-treated certified seed; good seed-bed prep.', treatment: 'Apply Thiram or Carboxin-Thiram seed treatment.' },
                { name: 'Pythium', symptoms: 'Pre-emergence damping off; seedlings rot at soil level.', prevention: 'Ensure well-drained soil; avoid waterlogging.', treatment: 'Metalaxyl drench at seed-bed stage.' }
            ]
        },
        {
            stage: 'Germination Stage', icon: '🌿', duration: '5–10 days', description: 'Coleoptile pushes through soil; first leaves appear.', diseases: [
                { name: 'Damping Off', symptoms: 'Seedlings wilt and fall; brown water-soaked stem base.', prevention: 'Seed treatment with Trichoderma viride.', treatment: 'Drench with Copper oxychloride 3 g/L water.' }
            ]
        },
        {
            stage: 'Seedling Stage', icon: '🌾', duration: '14–21 days', description: 'Leaf collar development; V3–V6 stages.', diseases: [
                { name: 'Downy Mildew', symptoms: 'Chlorotic streaks on leaves; white downy growth on underside.', prevention: 'Use resistant hybrids; avoid infected fields.', treatment: 'Spray Metalaxyl or Mancozeb at early symptoms.' },
                { name: 'Leaf Spot', symptoms: 'Elongated tan lesions with brown borders on leaves.', prevention: 'Rotate crop; choose resistant varieties.', treatment: 'Propiconazole or Tebuconazole foliar spray.' }
            ]
        },
        {
            stage: 'Vegetative Stage', icon: '🌿', duration: '30–45 days', description: 'Rapid stalk elongation; V6–VT stages.', diseases: [
                { name: 'Blight', symptoms: 'Large pale-green water-soaked lesions; stalk rot.', prevention: 'Avoid excess moisture; balanced nutrition.', treatment: 'Spray Mancozeb 2.5 g/L at 10-day intervals.' },
                { name: 'Rust', symptoms: 'Small cinnamon-brown pustules on both leaf surfaces.', prevention: 'Plant early-season; use resistant hybrids.', treatment: 'Azoxystrobin or Propiconazole foliar application.' }
            ]
        },
        {
            stage: 'Flowering Stage', icon: '🌸', duration: '5–10 days', description: 'Tassel emergence and silk appearance (VT–R1).', diseases: [
                { name: 'Smut', symptoms: 'Large galls on ears; silver skin bursts to release black spores.', prevention: 'Balanced nutrition; avoid mechanical damage.', treatment: 'Remove and destroy galls before they burst.' },
                { name: 'Anthracnose', symptoms: 'Stalk rot; bleached stalk with black streaking inside.', prevention: 'Crop rotation; avoid high nitrogen.', treatment: 'No curative spray; focus on prevention.' }
            ]
        },
        {
            stage: 'Grain Formation Stage', icon: '🌽', duration: '20–30 days', description: 'Kernel fill from R2 (blister) to R5 (dent) stage.', diseases: [
                { name: 'Charcoal Rot', symptoms: 'Premature ripening; black streaks inside lower stalk.', prevention: 'Maintain soil moisture during grain fill.', treatment: 'Foliar potassium and irrigation management.' },
                { name: 'Ear Rot', symptoms: 'Pink/red mold between kernels; mycotoxin contamination.', prevention: 'Harvest timely; use resistant varieties.', treatment: 'Dry grain below 13% moisture quickly after harvest.' }
            ]
        },
        {
            stage: 'Maturity Stage', icon: '🟡', duration: '10–15 days', description: 'Black layer formation at kernel base indicates physiological maturity.', diseases: [
                { name: 'Gray Mold', symptoms: 'Gray fuzzy growth on sheath and outer husks.', prevention: 'Low humidity at maturity; good airflow.', treatment: 'Spray Iprodione or Fenhexamid if severe.' }
            ]
        },
        {
            stage: 'Harvest Stage', icon: '🌽', duration: '3–5 days', description: 'Mechanical or manual harvesting and shelling.', diseases: [
                { name: 'Aspergillus (Aflatoxin)', symptoms: 'Green mold on cobs; invisible mycotoxin in grain.', prevention: 'Dry to <13% moisture; hermetic storage.', treatment: 'Aflatoxin binders in feed; discard heavily infected grain.' }
            ]
        },
    ],
    Banana: [
        {
            stage: 'Seed Stage', icon: '🌱', duration: 'N/A (suckers used)', description: 'Propagation via suckers or tissue culture plantlets.', diseases: [
                { name: 'Fusarium Wilt', symptoms: 'Yellowing of lower leaves; brown internal vascular discoloration.', prevention: 'Use disease-free suckers or TC plants; avoid infested soil.', treatment: 'No chemical cure; destroy infected plants and fumigate soil.' },
                { name: 'Pythium', symptoms: 'Soft rot at planting base; collapse of young suckers.', prevention: 'Treat planting material with Metalaxyl.', treatment: 'Drench root zone with Metalaxyl 2 g/L.' }
            ]
        },
        {
            stage: 'Germination Stage', icon: '🌿', duration: '10–20 days', description: 'Sucker shoots from corm; sword-leaf emergence.', diseases: [
                { name: 'Damping Off', symptoms: 'Young shoots wilt and collapse near soil.', prevention: 'Good drainage; Trichoderma soil treatment.', treatment: 'Copper oxychloride drench at base.' }
            ]
        },
        {
            stage: 'Seedling Stage', icon: '🍃', duration: '1–2 months', description: 'First true leaves expand; pseudostem development.', diseases: [
                { name: 'Sigatoka', symptoms: 'Yellow streaks on leaves; turn brown and die.', prevention: 'Remove dead leaves; oil-based sprays.', treatment: 'Spray Propiconazole or Mancozeb every 21 days.' },
                { name: 'Leaf Spot', symptoms: 'Small yellowish spots enlarge to brown oval lesions.', prevention: 'Good plantation hygiene; spacing for airflow.', treatment: 'Chlorothalonil or Copper-based fungicide spray.' }
            ]
        },
        {
            stage: 'Vegetative Stage', icon: '🌿', duration: '3–6 months', description: 'Rapid growth of pseudostem and leaves.', diseases: [
                { name: 'Panama Disease', symptoms: 'Yellowing from outer leaves inward; brown vascular bundles in pseudostem.', prevention: 'Use TR4-resistant varieties; soil solarization.', treatment: 'No cure; quarantine infected fields.' },
                { name: 'Bacterial Wilt', symptoms: 'Sudden wilt; yellowish-brown internal discoloration.', prevention: 'Disinfect tools; destroy infected plants.', treatment: 'Copper-based spray as protective measure.' }
            ]
        },
        {
            stage: 'Flowering Stage', icon: '🌸', duration: '2–4 weeks', description: 'Inflorescence emergence; bracts open to reveal fingers.', diseases: [
                { name: 'Anthracnose', symptoms: 'Dark sunken lesions on flower bracts and young fruit.', prevention: 'Bag bunches at emergence; copper spray.', treatment: 'Spray Carbendazim or Mancozeb on inflorescence.' },
                { name: 'Botrytis', symptoms: 'Gray mold on flowers; fruit tip rotting.', prevention: 'Good airflow; remove old flower parts.', treatment: 'Apply Iprodione or Fenhexamid spray.' }
            ]
        },
        {
            stage: 'Fruiting Stage', icon: '🍌', duration: '2–3 months', description: 'Finger development and bunch filling.', diseases: [
                { name: 'Crown Rot', symptoms: 'Black water-soaked rot at fruit crown; transit disease.', prevention: 'Clean cut; fungicide dip post-harvest.', treatment: 'Thiabendazole or Imazalil dip at packing.' },
                { name: 'Cigar End Rot', symptoms: 'Shriveled, brown, dry tip of fingers.', prevention: 'Good field sanitation; desiccation of old flower parts.', treatment: 'Carbendazim spray during bunch development.' }
            ]
        },
        {
            stage: 'Maturity Stage', icon: '🟡', duration: '2–4 weeks', description: 'Fingers fill out; skin color lightens.', diseases: [
                { name: 'Fusarium Wilt', symptoms: 'Fruit ripening uneven; peel discoloration.', prevention: 'Monitor weekly; quarantine infected mats.', treatment: 'Destroy infected mats; replant with resistant variety.' }
            ]
        },
        {
            stage: 'Harvest Stage', icon: '🍌', duration: '1–3 days', description: 'Bunches cut at 75–80% maturity for market.', diseases: [
                { name: 'Anthracnose (Post-harvest)', symptoms: 'Black sunken spots on ripe fruit skin.', prevention: 'Handle carefully to avoid wounds; hot water treatment.', treatment: 'Fungicide dip: Prochloraz or Thiabendazole.' }
            ]
        },
    ],
    Tomato: [
        {
            stage: 'Seed Stage', icon: '🌱', duration: '5–7 days', description: 'Seeds sown in seedling trays or nursery beds.', diseases: [
                { name: 'Seed Rot', symptoms: 'Seeds fail to germinate; soft and discolored.', prevention: 'Seed treatment with Thiram; use certified seed.', treatment: 'Apply bio-agent Trichoderma to seed-bed.' },
                { name: 'Pythium', symptoms: 'Radicle rots before emergence; poor germination.', prevention: 'Sterilize growing medium; avoid overwatering.', treatment: 'Metalaxyl drench at sowing.' }
            ]
        },
        {
            stage: 'Germination Stage', icon: '🌿', duration: '5–10 days', description: 'Hypocotyl emergence; cotyledons unfold.', diseases: [
                { name: 'Damping Off', symptoms: 'Seedlings collapse at soil level; stem becomes water-soaked.', prevention: 'Reduce irrigation; use Trichoderma bioagent.', treatment: 'Drench with Copper oxychloride 0.3%.' }
            ]
        },
        {
            stage: 'Seedling Stage', icon: '🌿', duration: '25–30 days', description: 'True leaf development in nursery.', diseases: [
                { name: 'Early Blight', symptoms: 'Brown bull\'s-eye rings on lower leaves.', prevention: 'Avoid overhead irrigation; crop rotation.', treatment: 'Spray Mancozeb or Chlorothalonil every 7 days.' },
                { name: 'Mosaic Virus', symptoms: 'Yellow-green mosaic pattern; distorted leaves.', prevention: 'Control aphid vectors; remove infected plants.', treatment: 'No cure; use mineral oil spray to reduce aphids.' }
            ]
        },
        {
            stage: 'Vegetative Stage', icon: '🌿', duration: '30–40 days', description: 'Rapid shoot and root growth after transplanting.', diseases: [
                { name: 'Fusarium Wilt', symptoms: 'One-sided yellowing; brown vascular tissue in stem.', prevention: 'Use resistant varieties; soil solarization.', treatment: 'Drench with Carbendazim or Thiophanate-methyl.' },
                { name: 'Bacterial Wilt', symptoms: 'Sudden wilting in hot weather; milky bacterial ooze from stem.', prevention: 'Avoid waterlogged soil; rotate with non-host crops.', treatment: 'Copper hydroxide drench; no complete cure available.' }
            ]
        },
        {
            stage: 'Flowering Stage', icon: '🌸', duration: '15–20 days', description: 'Yellow flowers open; pollination by insects/wind.', diseases: [
                { name: 'Powdery Mildew', symptoms: 'White floury patches on leaves; flower drop.', prevention: 'Adequate spacing; avoid excess nitrogen.', treatment: 'Spray Sulphur 80WP or Hexaconazole at onset.' },
                { name: 'Blight', symptoms: 'Dark brown lesions on leaves; flower blight.', prevention: 'Protective copper sprays at flowering onset.', treatment: 'Cymoxanil + Mancozeb combination spray.' }
            ]
        },
        {
            stage: 'Fruiting Stage', icon: '🍅', duration: '30–50 days', description: 'Fruit set, development and expansion.', diseases: [
                { name: 'Late Blight', symptoms: 'Dark water-soaked lesions on fruits; white mold in humid weather.', prevention: 'Remove crop debris; avoid dense planting.', treatment: 'Spray Cymoxanil or Fosetyl-Al every 5–7 days.' },
                { name: 'Anthracnose', symptoms: 'Sunken circular black lesions on ripe fruit.', prevention: 'Avoid overhead irrigation; copper-based preventive spray.', treatment: 'Spray Mancozeb or Carbendazim at fruit development stage.' }
            ]
        },
        {
            stage: 'Maturity Stage', icon: '🟡', duration: '10–20 days', description: 'Fruit color breaks from green to red.', diseases: [
                { name: 'Blossom End Rot', symptoms: 'Dark leathery area at blossom end; calcium deficiency symptom.', prevention: 'Consistent irrigation; calcium foliar spray.', treatment: 'Apply CaNO3 foliar spray; improve irrigation frequency.' }
            ]
        },
        {
            stage: 'Harvest Stage', icon: '🍅', duration: '3–5 days', description: 'Fruits harvested at breaker or ripe stage for market.', diseases: [
                { name: 'Gray Mold (Botrytis)', symptoms: 'Fluffy gray mold on stored fruits; rapid rot.', prevention: 'Dry fruits before storage; avoid bruising.', treatment: 'Iprodione or Thiabendazole post-harvest treatment.' }
            ]
        },
    ],
    Cotton: [
        {
            stage: 'Seed Stage', icon: '🌱', duration: '3–7 days', description: 'Cotton seeds (delinted) sown in prepared ridges.', diseases: [
                { name: 'Seed Rot', symptoms: 'Seeds decay; poor stand establishment.', prevention: 'Use acid-delinted certified seed with fungicide treatment.', treatment: 'Thiram or Carboxin-Thiram seed dressing.' },
                { name: 'Root Rot', symptoms: 'Root discoloration; seedling death before emergence.', prevention: 'Good drainage; Trichoderma biopriming.', treatment: 'Metalaxyl drench at sowing.' }
            ]
        },
        {
            stage: 'Germination Stage', icon: '🌿', duration: '7–10 days', description: 'Cotyledons push through soil surface.', diseases: [
                { name: 'Damping Off', symptoms: 'Seedling collapse at soil line; cotton wool appearance.', prevention: 'Avoid heavy clay soil; moderate irrigation.', treatment: 'Copper oxychloride drench 3 g/L.' }
            ]
        },
        {
            stage: 'Seedling Stage', icon: '🌿', duration: '20–30 days', description: 'True leaf development and lateral root establishment.', diseases: [
                { name: 'Alternaria', symptoms: 'Brown spots with concentric rings on cotyledon leaves.', prevention: 'Use treated seeds; avoid water stress.', treatment: 'Spray Mancozeb or Iprodione 2.5 g/L.' },
                { name: 'Leaf Spot', symptoms: 'Angular reddish-brown spots on leaves; defoliation.', prevention: 'Balanced fertilization; wider plant spacing.', treatment: 'Copper hydroxide or Methyl bromide spray.' }
            ]
        },
        {
            stage: 'Vegetative Stage', icon: '🌿', duration: '40–60 days', description: 'Branching and square (bud) formation.', diseases: [
                { name: 'Fusarium Wilt', symptoms: 'Vascular browning; yellowing and wilting of top leaves.', prevention: 'Use Fusarium-resistant Bt-cotton varieties.', treatment: 'Drench Carbendazim; no complete cure available.' },
                { name: 'Bacterial Blight', symptoms: 'Angular water-soaked spots; black arm symptoms on stem.', prevention: 'Use blight-resistant varieties; seed treatment.', treatment: 'Spray Streptocycline + Copper oxychloride mixture.' }
            ]
        },
        {
            stage: 'Flowering Stage', icon: '🌸', duration: '15–20 days', description: 'Flower bud (square) opening; white/cream colored flowers.', diseases: [
                { name: 'Boll Rot', symptoms: 'Water-soaked lesions on bolls; internal rot.', prevention: 'Avoid excess moisture; good plant spacing.', treatment: 'Copper oxychloride or Mancozeb spray on bolls.' },
                { name: 'Powdery Mildew', symptoms: 'White powdery coating on leaves at high humidity.', prevention: 'Good air circulation; sulfur dust application.', treatment: 'Spray Tridemorph or Hexaconazole.' }
            ]
        },
        {
            stage: 'Fruiting Stage', icon: '🌿', duration: '30–40 days', description: 'Boll development and lint filling.', diseases: [
                { name: 'Bollworm', symptoms: 'Larvae bore into bolls; premature boll opening; frass.', prevention: 'Use Bt-Cotton; pheromone traps; NPV spray.', treatment: 'Spinosad or Emamectin benzoate spray.' },
                { name: 'Charcoal Rot', symptoms: 'Stalk splits; gray powdery growth inside; plant death.', prevention: 'Avoid late planting; balanced potassium.', treatment: 'No effective curative; improve drainage.' }
            ]
        },
        {
            stage: 'Maturity Stage', icon: '🟡', duration: '15–20 days', description: 'Bolls open and white fibres expose.', diseases: [
                { name: 'Cercospora Leaf Spot', symptoms: 'Red-brown lesions; premature defoliation before harvest.', prevention: 'Early defoliant in wet years; avoid excess N.', treatment: 'Spray Carbendazim or Mancozeb before boll opening.' }
            ]
        },
        {
            stage: 'Harvest Stage', icon: '🌿', duration: '3–7 days', description: 'Cotton picked by hand or machine.', diseases: [
                { name: 'Stem Rust', symptoms: 'Orange rust-colored spores on stem; weakening.', prevention: 'Harvest timely to avoid late-season disease.', treatment: 'Propiconazole spray if severe before picking.' }
            ]
        },
    ],
    Chilli: [
        {
            stage: 'Seed Stage', icon: '🌱', duration: '5–10 days', description: 'Seeds sown in nursery trays with soilless medium.', diseases: [
                { name: 'Seed Rot', symptoms: 'Seeds fail to germinate; black decay visible.', prevention: 'Treat seeds with Thiram + Carbendazim (1:1).', treatment: 'Replace infected nursery medium; apply Captan drench.' },
                { name: 'Pythium', symptoms: 'Root rot before seedling emergence.', prevention: 'Use sterilized growing medium; moderate irrigation.', treatment: 'Metalaxyl 2 g/L drench at seed sowing.' }
            ]
        },
        {
            stage: 'Germination Stage', icon: '🌿', duration: '7–15 days', description: 'Radicle and shoot emerge; cotyledons open.', diseases: [
                { name: 'Damping Off', symptoms: 'Browning at stem base; seedlings topple over.', prevention: 'Trichoderma harzianum seed treatment.', treatment: 'Drench seedbed with Copper oxychloride.' }
            ]
        },
        {
            stage: 'Seedling Stage', icon: '🌶️', duration: '30–40 days', description: 'True leaves form in nursery; hardening before transplant.', diseases: [
                { name: 'Leaf Curl', symptoms: 'Upward/downward curling of leaves; stunted plant.', prevention: 'Control whitefly vectors; reflective mulch.', treatment: 'Imidacloprid spray to control vector insects.' },
                { name: 'Collar Rot', symptoms: 'Brown watery rot at stem base; plant wilts and dies.', prevention: 'Avoid deep planting; Trichoderma soil application.', treatment: 'Drench with Carbendazim 1g/L around root zone.' }
            ]
        },
        {
            stage: 'Vegetative Stage', icon: '🌿', duration: '30–45 days', description: 'Rapid shoot branching and canopy development.', diseases: [
                { name: 'Powdery Mildew', symptoms: 'White talcum-like coating on leaves; leaf drop.', prevention: 'Neem-based oil spray preventively.', treatment: 'Spray Tridemorph 1 mL/L or Wettable sulfur 3 g/L.' },
                { name: 'Anthracnose', symptoms: 'Water-soaked spots on leaves that dry out; defoliation.', prevention: 'Avoid excessive moisture; copper spray program.', treatment: 'Spray Carbendazim or Chlorothalonil every 10 days.' }
            ]
        },
        {
            stage: 'Flowering Stage', icon: '🌸', duration: '15–25 days', description: 'White flowers open; pollination by bees.', diseases: [
                { name: 'Botrytis', symptoms: 'Gray mold on flowers; flower drop; stem lesions.', prevention: 'Good spacing; remove infected flowers.', treatment: 'Iprodione or Fenhexamid spray at flowering.' },
                { name: 'Chilli Veinal Mosaic', symptoms: 'Yellow vein clearing and mosaic; malformed flowers.', prevention: 'Eliminate mite and aphid vectors promptly.', treatment: 'No cure; uproot infected plants; spray acaricide.' }
            ]
        },
        {
            stage: 'Fruiting Stage', icon: '🌶️', duration: '30–45 days', description: 'Fruit set, development and coloring.', diseases: [
                { name: 'Fruit Borer', symptoms: 'Larvae enter fruit; premature fruit drop; frass at hole.', prevention: 'Install pheromone traps; use NPV biopesticide.', treatment: 'Spray Emamectin benzoate 0.5 g/L on fruits.' },
                { name: 'Alternaria', symptoms: 'Dark brown concentric ring spots on fruits; fruit rot.', prevention: 'Copper spray program from early fruiting.', treatment: 'Spray Mancozeb 2.5 g/L + Carbendazim 1 g/L.' }
            ]
        },
        {
            stage: 'Maturity Stage', icon: '🟡', duration: '15–20 days', description: 'Fruits transition from green to red.', diseases: [
                { name: 'Mosaic Virus', symptoms: 'Patchy yellow and green ripening; misshapen fruits.', prevention: 'Remove infected plants; no vector transmission.', treatment: 'No curative treatment; focus on vector management.' }
            ]
        },
        {
            stage: 'Harvest Stage', icon: '🌶️', duration: '3–5 days per round', description: 'Multiple harvesting rounds of green or red chilli.', diseases: [
                { name: 'Anthracnose (Post-harvest)', symptoms: 'Sunken dark lesions on ripe chilli in storage.', prevention: 'Avoid wounds during harvest; dry properly.', treatment: 'Prochloraz or hot water dip (52°C for 3 min) before storage.' }
            ]
        },
    ],
};

const STAGE_COLORS = [
    'from-amber-800 to-amber-600',
    'from-green-800 to-green-600',
    'from-emerald-800 to-emerald-600',
    'from-teal-800 to-teal-600',
    'from-pink-800 to-pink-600',
    'from-yellow-700 to-yellow-500',
    'from-orange-700 to-orange-500',
    'from-lime-700 to-lime-500',
];

const STAGE_BG = [
    'bg-amber-50 border-amber-200',
    'bg-green-50 border-green-200',
    'bg-emerald-50 border-emerald-200',
    'bg-teal-50 border-teal-200',
    'bg-pink-50 border-pink-200',
    'bg-yellow-50 border-yellow-200',
    'bg-orange-50 border-orange-200',
    'bg-lime-50 border-lime-200',
];

const CropLifecycle: React.FC = () => {
    const { language } = useLanguage();
    const isTa = language === 'Tamil';
    const ui = isTa ? UI_TA : {
        title: 'Crop Lifecycle Intelligence',
        subtitle: 'Understand every stage — from seed to harvest — and guard against diseases',
        placeholder: 'Search a crop (e.g. Rice, Tomato…)',
        searchBtn: 'Search',
        recent: 'RECENT:',
        stagesLabel: 'Total Stages',
        diseasesLabel: 'Diseases Covered',
        treatmentsLabel: 'Treatments Listed',
        possibleDiseases: 'Possible Diseases',
        clickHint: 'Click to view symptoms, prevention & treatment',
        symptoms: '🔴 Symptoms',
        prevention: '🛡️ Prevention',
        treatment: '💊 Treatment',
        noResult: 'Crop not found. Try: Rice, Maize, Banana, Tomato, Cotton, Chilli.',
        beginSearch: 'Search a Crop to Begin',
        beginDesc: 'Enter any crop name above to explore its complete lifecycle and disease management guide.',
        lifecycle: 'Lifecycle Intelligence',
        stageLabel: 'Stage',
        durationLabel: '⏱',
    };
    const [query, setQuery] = useState('');
    const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set([0]));
    const [expandedDiseases, setExpandedDiseases] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<Record<string, 'symptoms' | 'prevention' | 'treatment'>>({});

    const EXAMPLE_CROPS = ['Rice', 'Maize', 'Banana', 'Tomato', 'Cotton', 'Chilli'];

    useEffect(() => {
        const saved = localStorage.getItem('cropIntelligence_recent');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const handleSearch = (crop: string) => {
        const normalized = crop.trim();
        if (!normalized) return;
        const match = Object.keys(CROP_DATA).find(k => k.toLowerCase() === normalized.toLowerCase());
        if (match) {
            setSelectedCrop(match);
            setExpandedStages(new Set([0]));
            setExpandedDiseases(new Set());
            const updated = [match, ...recentSearches.filter(r => r !== match)].slice(0, 6);
            setRecentSearches(updated);
            localStorage.setItem('cropIntelligence_recent', JSON.stringify(updated));
        }
        setQuery('');
    };

    const toggleStage = (idx: number) => {
        setExpandedStages(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const toggleDisease = (key: string) => {
        setExpandedDiseases(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const setDiseaseTab = (key: string, tab: 'symptoms' | 'prevention' | 'treatment') => {
        setActiveTab(prev => ({ ...prev, [key]: tab }));
    };

    const stages = selectedCrop ? CROP_DATA[selectedCrop] : null;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2d13 0%, #1a4a1f 30%, #2d5a22 60%, #4a7c35 100%)', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '40px 20px 30px' }}>
                <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <span style={{ fontSize: 40 }}>🌾</span>
                        <div>
                            <h1 style={{ color: '#fff', fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
                                {ui.title}
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '4px 0 0', fontWeight: 500 }}>
                                {ui.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ maxWidth: 560, margin: '24px auto 0', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
                                    placeholder={ui.placeholder}
                                    style={{
                                        width: '100%', padding: '14px 16px 14px 48px', borderRadius: 14,
                                        border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)',
                                        color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => handleSearch(query)}
                                style={{
                                    padding: '14px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                                    fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap'
                                }}
                            >
                                {ui.searchBtn}
                            </button>
                        </div>

                        {/* Example chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 14 }}>
                            {EXAMPLE_CROPS.map(crop => (
                                <button
                                    key={crop}
                                    onClick={() => handleSearch(crop)}
                                    style={{
                                        padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.25)',
                                        background: selectedCrop === crop ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)',
                                        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {crop}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700 }}>{ui.recent}</span>
                            {recentSearches.map(r => (
                                <button
                                    key={r}
                                    onClick={() => handleSearch(r)}
                                    style={{
                                        padding: '4px 12px', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                        color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    🕐 {r}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
                {!selectedCrop ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ fontSize: 80, marginBottom: 20 }}>🌱</div>
                        <h2 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 24, fontWeight: 800, margin: '0 0 12px' }}>
                            {ui.beginSearch}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
                            {ui.beginDesc}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 40, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                            {EXAMPLE_CROPS.map(crop => (
                                <button
                                    key={crop}
                                    onClick={() => handleSearch(crop)}
                                    style={{
                                        padding: '20px 10px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)',
                                        background: 'rgba(255,255,255,0.07)', color: '#fff', cursor: 'pointer',
                                        fontWeight: 700, fontSize: 15, transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                                >
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                                        {crop === 'Rice' ? '🌾' : crop === 'Maize' ? '🌽' : crop === 'Banana' ? '🍌' : crop === 'Tomato' ? '🍅' : crop === 'Cotton' ? '🌿' : '🌶️'}
                                    </div>
                                    {isTa && CROP_NAME_TA[crop] ? `${CROP_NAME_TA[crop]} (${crop})` : crop}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Crop Title */}
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '12px 28px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <span style={{ fontSize: 32 }}>
                                    {selectedCrop === 'Rice' ? '🌾' : selectedCrop === 'Maize' ? '🌽' : selectedCrop === 'Banana' ? '🍌' : selectedCrop === 'Tomato' ? '🍅' : selectedCrop === 'Cotton' ? '🌿' : '🌶️'}
                                </span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>{ui.lifecycle}</div>
                                    <div style={{ color: '#fff', fontSize: 26, fontWeight: 900 }}>{isTa && CROP_NAME_TA[selectedCrop] ? CROP_NAME_TA[selectedCrop] : selectedCrop}</div>
                                </div>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 12 }}>
                                {stages?.length} {isTa ? 'நிலைகள்' : 'growth stages'} · {stages?.reduce((a, s) => a + s.diseases.length, 0)} {isTa ? 'நோய்கள்' : 'diseases documented'}
                            </p>
                        </div>

                        {/* Timeline Progress */}
                        <div style={{ display: 'flex', overflowX: 'auto', gap: 4, marginBottom: 28, padding: '8px 4px' }}>
                            {stages?.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => { toggleStage(i); setTimeout(() => document.getElementById(`stage-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }}
                                    style={{
                                        flex: '1 0 auto', minWidth: 90, padding: '10px 8px', borderRadius: 10,
                                        border: expandedStages.has(i) ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.15)',
                                        background: expandedStages.has(i) ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)',
                                        color: '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.3 }}>{isTa && STAGE_TA[s.stage] ? STAGE_TA[s.stage].name.replace(' நிலை', '') : s.stage.replace(' Stage', '')}</div>
                                </button>
                            ))}
                        </div>

                        {/* Stage Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {stages?.map((stg, si) => (
                                <div key={si} id={`stage-${si}`} style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {/* Stage Header */}
                                    <button
                                        onClick={() => toggleStage(si)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px',
                                            background: `linear-gradient(135deg, ${STAGE_COLORS[si % 8].replace('from-', '').replace(' to-', ',').replace(/-\d+/g, m => m)})`,
                                            border: 'none', cursor: 'pointer', textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                                            {stg.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>{ui.stageLabel} {si + 1}</span>
                                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>⏱ {stg.duration}</span>
                                            </div>
                                            <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginTop: 4 }}>{isTa && STAGE_TA[stg.stage] ? STAGE_TA[stg.stage].name : stg.stage}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>{isTa && STAGE_TA[stg.stage] ? STAGE_TA[stg.stage].desc : stg.description}</div>
                                        </div>
                                        <div style={{ color: '#fff', fontSize: 20, opacity: 0.8 }}>
                                            {expandedStages.has(si) ? '▲' : '▼'}
                                        </div>
                                    </button>

                                    {/* Stage Body */}
                                    {expandedStages.has(si) && (
                                        <div style={{ background: '#f8fdf8', padding: 20 }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span>⚠️</span> {ui.possibleDiseases} ({stg.diseases.length})
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                {stg.diseases.map((dis, di) => {
                                                    const key = `${si}-${di}`;
                                                    const tab = activeTab[key] || 'symptoms';
                                                    const isExpanded = expandedDiseases.has(key);
                                                    return (
                                                        <div key={di} style={{ borderRadius: 14, border: '1px solid #d1fae5', background: '#fff', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                                            <button
                                                                onClick={() => toggleDisease(key)}
                                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                            >
                                                                {/* Disease Type Image Card */}
                                                                {(() => {
                                                                    const dtype = DISEASE_TYPE[dis.name] || 'fungal';
                                                                    const cfg = TYPE_CONFIG[dtype];
                                                                    return (
                                                                        <div style={{ flexShrink: 0, width: 68, height: 68, borderRadius: 12, background: cfg.bg, border: `2px solid ${cfg.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                                                            <span style={{ fontSize: 26 }}>{cfg.emoji}</span>
                                                                            <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, textAlign: 'center', lineHeight: 1.1, maxWidth: 60 }}>{isTa ? cfg.labelTa : cfg.label}</span>
                                                                        </div>
                                                                    );
                                                                })()}
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: 800, fontSize: 15, color: '#14532d' }}>{isTa && DISEASE_TA[dis.name] ? DISEASE_TA[dis.name].name : dis.name}</div>
                                                                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                                                        {ui.clickHint}
                                                                    </div>
                                                                </div>
                                                                <span style={{ color: '#166534', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
                                                            </button>

                                                            {isExpanded && (
                                                                <div style={{ borderTop: '1px solid #d1fae5', padding: '16px 18px' }}>
                                                                    {/* Tabs */}
                                                                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                                                                        {(['symptoms', 'prevention', 'treatment'] as const).map(t => (
                                                                            <button
                                                                                key={t}
                                                                                onClick={() => setDiseaseTab(key, t)}
                                                                                style={{
                                                                                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                                                                    background: tab === t ? '#16a34a' : '#f0fdf4',
                                                                                    color: tab === t ? '#fff' : '#166534', transition: 'all 0.15s'
                                                                                }}
                                                                            >
                                                                                {t === 'symptoms' ? (isTa ? '🔴 ' + UI_TA.symptoms : '🔴 Symptoms') : t === 'prevention' ? (isTa ? '🛡️ ' + UI_TA.prevention : '🛡️ Prevention') : (isTa ? '💊 ' + UI_TA.treatment : '💊 Treatment')}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '14px 16px', fontSize: 14, color: '#1a4a1f', lineHeight: 1.6, fontWeight: 500 }}>
                                                                        {tab === 'symptoms' && (isTa && DISEASE_TA[dis.name] ? DISEASE_TA[dis.name].symptoms : dis.symptoms)}
                                                                        {tab === 'prevention' && (isTa && DISEASE_TA[dis.name] ? DISEASE_TA[dis.name].prevention : dis.prevention)}
                                                                        {tab === 'treatment' && (isTa && DISEASE_TA[dis.name] ? DISEASE_TA[dis.name].treatment : dis.treatment)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 28 }}>
                            {[
                                { label: ui.stagesLabel, value: stages?.length, icon: '📋' },
                                { label: ui.diseasesLabel, value: stages?.reduce((a, s) => a + s.diseases.length, 0), icon: '🦠' },
                                { label: ui.treatmentsLabel, value: stages?.reduce((a, s) => a + s.diseases.length, 0), icon: '💊' },
                            ].map((stat, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <div style={{ fontSize: 24 }}>{stat.icon}</div>
                                    <div style={{ color: '#4ade80', fontSize: 28, fontWeight: 900, margin: '4px 0' }}>{stat.value}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CropLifecycle;
