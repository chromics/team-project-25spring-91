export interface Gym {
    name: string;
    location: string;
    address?: string;
    imageUrl?: string;
    description?: string;
    openingHours: string;
    websiteUrl?: string;
    equipments?: string;
    memberships: Membership[];
    classes: GymClass[];
  }
  
  export interface GymClass {
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

  export interface Schedule {
    startTime: string;
    endTime: string;
    instructor: string;
  }
  
  export interface Membership {
    name: string;
    price: string;
    description: string;
  }
  