// Basic ID type
export type ID = string | number;

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// GymClass interface
export interface GymClass {
  id: ID;
  name: string;
  description: string;
  maxCapacity: number | null;
  durationMinutes: number;
  imageUrl: string;
  membersOnly: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  gym?: {
    id: ID;
    name: string;
    address?: string;
    contactInfo?: string;
  };
  schedules?: Schedule[];
  // Additional fields for frontend use
  isSelected?: boolean;
  temporaryData?: any;
  metadata?: Record<string, any>;
}

// Schedule interface
export interface Schedule {
  id: ID;
  classId: ID;
  startTime: string;
  endTime: string;
  instructor: string;
  currentBookings: number;
  isCancelled: boolean;
  cancellationReason: string | null;
  createdAt: string;
  gymClass?: {
    name: string;
    maxCapacity: number | null;
    durationMinutes: number;
    membersOnly: boolean;
    description?: string;
    imageUrl?: string;
  };
  _count?: {
    userBookings: number;
  };
  spotsAvailable: number;
  isFull: boolean;
  // Additional fields for frontend use
  isBooked?: boolean;
  isWaitlisted?: boolean;
  userNote?: string;
  temporaryData?: any;
}

// Gym interface
export interface Gym {
  id: ID;
  name: string;
  address: string;
  description: string;
  contactInfo: string;
  imageUrl: string;
  createdAt: string;
  // Optional fields that might be useful
  location?: string;
  openingHours?: string;
  websiteUrl?: string;
  equipments?: string[];
  amenities?: string[];
  _count?: {
    classes: number;
    membershipPlans: number;
  };
  // Related data
  classes?: GymClass[];
  memberships?: Membership[];
  // Additional fields for frontend use
  isFavorite?: boolean;
  lastVisited?: string;
  userNotes?: string;
  temporaryData?: any;
}

// Membership interface
export interface Membership {
  id: ID;
  gymId: ID;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  maxBookingsPerWeek: number;
  isActive: boolean;
  // Additional fields
  benefits?: string[];
  restrictions?: string[];
  discounts?: {
    amount: number;
    description: string;
  }[];
  startDate?: string;
  endDate?: string;
  // Frontend specific
  isSelected?: boolean;
  temporaryData?: any;
}

// API Response interfaces
export interface ApiResponse<T> {
  status: string;
  results: number;
  pagination?: Pagination;
  data: T;
}

export interface GymsApiResponse extends ApiResponse<Gym[]> {}
export interface ClassesApiResponse extends ApiResponse<GymClass[]> {}
export interface SchedulesApiResponse extends ApiResponse<Schedule[]> {}