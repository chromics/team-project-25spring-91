import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitionCard } from "./competition-card";
import { CompetitionDetails } from "./competition-details";
import { Competition, UserCompetition } from "@/types/competition";
import api from "@/lib/api";
import { toast } from "sonner";

export const CompetitionsPage: React.FC = () => {
  const [ongoingCompetitions, setOngoingCompetitions] = useState<
    UserCompetition[]
  >([]);
  const [availableCompetitions, setAvailableCompetitions] = useState<
    Competition[]
  >([]);
  const [completedCompetitions, setCompletedCompetitions] = useState<
    UserCompetition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<
    Competition | UserCompetition | null
  >(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsType, setDetailsType] = useState<
    "available" | "ongoing" | "completed"
  >("ongoing");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      // Fetch user competitions
      const userCompetitionsResponse = await api.get(
        "/competitions/user/competitions"
      );
      const userCompetitions = userCompetitionsResponse.data.data || [];

      // Get competition IDs that user has joined
      const joinedCompetitionIds = new Set(
        userCompetitions.map((comp: UserCompetition) => comp.competitionId)
      );

      const now = new Date();
      const ongoing = userCompetitions.filter(
        (comp: UserCompetition) => new Date(comp.competition.endDate) >= now
      );
      const completed = userCompetitions.filter(
        (comp: UserCompetition) => new Date(comp.competition.endDate) < now
      );

      setOngoingCompetitions(ongoing);
      setCompletedCompetitions(completed);

      // Fetch available competitions (placeholder - will be replaced with proper API)
      // For now, using gym ID 1 as example
      // TODO: Update the API 
      const availableResponse = await api.get("/competitions?gymId=1");
      const allCompetitions = availableResponse.data.data || [];
      
      // Filter out competitions that user has already joined
      const availableOnly = allCompetitions.filter(
        (comp: Competition) => !joinedCompetitionIds.has(comp.id)
      );
      
      setAvailableCompetitions(availableOnly);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      toast.error("Failed to load competitions");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompetition = async (competitionId: number) => {
    try {
      await api.post(`/competitions/${competitionId}/join`);
      toast.success("Successfully joined competition!");
      fetchCompetitions(); // Refresh the data
      setDetailsOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to join competition"
      );
    }
  };

  const handleViewDetails = (
    competition: Competition | UserCompetition,
    type: "available" | "ongoing" | "completed"
  ) => {
    setSelectedCompetition(competition);
    setDetailsType(type);
    setDetailsOpen(true);
  };

  // Helper function to get competition ID safely
  const getCompetitionId = (competition: Competition | UserCompetition): number => {
    return "competition" in competition ? competition.competition.id : competition.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Competitions</h1>
        <p className="text-muted-foreground">
          Join competitions, track your progress, and compete with others!
        </p>
      </div>

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ongoing">
            Ongoing ({ongoingCompetitions.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableCompetitions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCompetitions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-6">
          {ongoingCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You're not participating in any ongoing competitions.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check the Available tab to join new competitions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  type="ongoing"
                  onViewDetails={() =>
                    handleViewDetails(competition, "ongoing")
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {availableCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No competitions available at the moment.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for new competitions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  type="available"
                  onViewDetails={() =>
                    handleViewDetails(competition, "available")
                  }
                  onJoin={() => handleJoinCompetition(competition.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You haven't completed any competitions yet.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Join some competitions to start building your history!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  type="completed"
                  onViewDetails={() =>
                    handleViewDetails(competition, "completed")
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedCompetition && (
        <CompetitionDetails
          competition={selectedCompetition}
          type={detailsType}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onJoin={
            detailsType === "available"
              ? () => handleJoinCompetition(getCompetitionId(selectedCompetition))
              : undefined
          }
        />
      )}
    </div>
  );
};
