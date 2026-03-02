
export type Language = 'English' | 'Malayalam' | 'Tamil';

export interface FarmerProfile {
  id: string;
  name: string;
  age: string;
  address: string;
  primaryCrop: string;
  landSize: string;
  soilType: string;
  irrigationMethod: string;
  experience: string;
  onboardingDate: string;
  state: string;
  district: string;
  trustScore: number;
  onboardingComplete: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  benefits: string;
  eligibility: string;
  category: 'Subsidy' | 'Insurance' | 'Loan' | 'Irrigation' | 'Training';
  authority: 'Central' | 'State';
  state?: string;
  officialUrl: string;
  status: 'Active' | 'Upcoming' | 'Closing Soon';
  validUntil: string;
}

export interface CommunityReply {
  id: string;
  queryId: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerExp: string;
  content: string;
  helpfulCount: number;
  timestamp: string;
  votedBy: string[]; // Array of farmer IDs who voted
}

export interface CommunityQuery {
  id: string;
  farmerId: string;
  farmerName: string;
  location: string;
  state: string;
  district: string;
  cropType: string;
  category: 'Disease' | 'Pest' | 'Fertilizer' | 'Weather' | 'Market' | 'General';
  content: string;
  imageUrl?: string;
  timestamp: string;
  replies: CommunityReply[];
  status: 'Open' | 'Resolved';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'Fertilizer' | 'Pesticide' | 'Seeds' | 'Farming Tools';
  dosage?: string;
  bioAvailable?: boolean;
  /**
   * Optional prompt used for AI image generation in the store.
   */
  prompt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FarmerQuery {
  id: string;
  farmerId?: string;
  farmerName: string;
  location: string;
  cropType: string;
  question: string;
  aiResponse: string;
  timestamp: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Solved' | 'Escalated' | 'Pending';
  feedback?: string;
  rating?: number;
  confidence?: number;
  futurePrevention?: string;
  nearbyProtection?: string;
  callRequested?: boolean;
  suggestedProducts?: Product[];
  audioData?: string;
  officerAudioData?: string;
}

export interface TableData {
  tableName: string;
  columns: string[];
  rows: any[];
  sqlExample: string;
}
