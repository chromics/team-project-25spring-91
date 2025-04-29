import type { Gym } from "../types/gym";

export async function getGyms(): Promise<Gym[]> {
  // TODO: replace with real DB/API call
  return [
    {
      id: "1",
      name: "Iron Paradise",
      location: "New York, NY",
      imageUrl: "https://picsum.photos/400",
      description: "State-of-the-art equipment and trainers.",
    },
    {
      id: "2",
      name: "The Muscle Factory",
      location: "Los Angeles, CA",
      imageUrl: "https://picsum.photos/400",
      description: "Your go-to spot for serious gains.",
    },
    {
      id: "3",
      name: "The Muscle Factory",
      location: "Los Angeles, CA",
      imageUrl: "https://picsum.photos/400",
      description: "Your go-to spot for serious gains.",
    },
    {
      id: "4",
      name: "The Muscle Factory",
      location: "Los Angeles, CA",
      imageUrl: "https://picsum.photos/400",
      description: "Your go-to spot for serious gains.",
    },
  ];
}
