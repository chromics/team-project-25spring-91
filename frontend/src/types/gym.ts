// Basic ID type
export type ID = string | number;

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// // GymClass interface
// export interface GymClass {
//   id: ID;
//   name: string;
//   description: string;
//   maxCapacity: number | null;
//   durationMinutes: number;
//   imageUrl: string;
//   membersOnly: boolean;
//   difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
//   createdAt: string;
//   gym?: {
//     id: ID;
//     name: string;
//     address?: string;
//     contactInfo?: string;
//   };
//   schedules?: Schedule[];
//   // Additional fields for frontend use
//   isSelected?: boolean;
//   temporaryData?: any;
//   metadata?: Record<string, any>;
// }

export interface GymClass {
  id: number;
  gymId: number;
  name: string;
  description: string;
  maxCapacity: number;
  durationMinutes: number;
  imageUrl: string;
  membersOnly: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
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
  memberships?: UserMembership[];
  // Additional fields for frontend use
  isFavorite?: boolean;
  lastVisited?: string;
  userNotes?: string;
  temporaryData?: any;
}
export interface GymInfo {
  id: ID;
  name: string;
  address: string;
  imageUrl: string | null;
}
export type MembershipStatus = "active" | "cancelled" | "expired" | string; // Added string for potential future statuses

// Membership interface
export interface MembershipPlan {
  id: ID;
  gymId: ID;
  name: string;
  description: string;
  durationDays: number;
  price: string; // API response shows price as a string (e.g., "47")
  maxBookingsPerWeek: number | null; // API response shows this can be null
  isActive: boolean;
  createdAt: string; // ISO date string
  // Note: Fields like `benefits`, `restrictions`, `discounts` from your
  // original `Membership` interface are not present in this specific API's
  // `membershipPlan` object. If they are part of a plan's definition
  // in other contexts (e.g., a detailed plan view), they could be added here
  // (possibly as optional) or in a separate, more detailed interface.
}

export interface UserMembership {
  id: ID;
  userId: ID;
  gymId: ID; // Corresponds to gym.id
  planId: ID; // Corresponds to membershipPlan.id
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: MembershipStatus;
  autoRenew: boolean;
  bookingsUsedThisWeek: number;
  lastBookingCountReset: string; // ISO date string
  createdAt: string; // ISO date string
  gym: GymInfo;
  membershipPlan: MembershipPlan;

  // Frontend-specific fields from your original `Membership` interface
  // could be added here if you intend to augment this data on the client:
  // isSelected?: boolean;
  // temporaryData?: any;
}

// API Response interfaces
export interface ApiResponse<T> {
  status: string;
  results: number;
  pagination?: Pagination;
  data: T;
}


export type BookingStatus = 'confirmed' | 'cancelled' | 'attended';





export interface Booking {
  id: number;
  userId: number;
  membershipId: number;
  scheduleId: number;
  bookingTime: string;
  bookingStatus: BookingStatus;
  cancellationReason: string | null;
  attended: boolean;
  createdAt: string;
  schedule: {
    id: number;
    classId: number;
    startTime: string;
    endTime: string;
    instructor: string;
    currentBookings: number;
    isCancelled: boolean;
    cancellationReason: string | null;
    createdAt: string;
    gymClass: {
      id: number;
      gymId: number;
      name: string;
      description: string;
      maxCapacity: number | null;
      durationMinutes: number;
      imageUrl: string | null;
      membersOnly: boolean;
      difficultyLevel: string;
      isActive: boolean;
      createdAt: string;
      gym: {
        id: number;
        name: string;
      };
    };
  };
  userMembership: {
    id: number;
    status: string;
  };
}

export interface GymsApiResponse extends ApiResponse<Gym[]> {}
export interface ClassesApiResponse extends ApiResponse<GymClass[]> {}
export interface SchedulesApiResponse extends ApiResponse<Schedule[]> {}