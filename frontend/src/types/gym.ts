// Using union type for ID to handle both string and number
export type ID = string | number;

// Basic pagination interface
export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// Schedule interface for gym classes
export interface Schedule {
  id: ID;
  startTime: string;
  endTime: string;
  instructor: string;
}

// GymClass interface
export interface GymClass {
  id: ID;
  name: string;
  description: string;
  price: string;
  maxCapacity: string;
  image: string;
  duration: string;
  membersOnly: boolean;
  difficulty: string;
  schedules: Schedule[];
}

// Membership interface
export interface Membership {
  id: ID;
  name: string;
  price: string;
  description: string;
}

// Gym interface updated to match API response
export interface Gym {
  id: ID;
  name: string;
  address?: string;
  location?: string;  // Added but marked optional since it's in your model but not API
  description?: string;
  contactInfo?: string; // From API
  imageUrl?: string;
  openingHours?: string; // Added but marked optional
  websiteUrl?: string;
  equipments?: string;
  createdAt?: string; // From API
  _count?: {
    classes: number;
    membershipPlans: number;
  };
  // These would likely be populated separately or through relationship queries
  memberships?: Membership[];
  classes?: GymClass[];
}

// API Response interface
export interface GymsApiResponse {
  status: string;
  results: number;
  pagination: Pagination;
  data: Gym[];
}