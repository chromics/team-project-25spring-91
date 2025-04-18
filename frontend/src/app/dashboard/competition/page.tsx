"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const yourRank = 1;

const CompetitionPage = () => {
    return (
        <div className="container mx-auto px-4 py-6">
            <Tabs defaultValue="volume" className="w-full">
                <div>
                    <TabsList>
                        <TabsTrigger value="volume">Volume-based</TabsTrigger>
                        <TabsTrigger value="streak">Streak-based</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="volume">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="text-center">Leaderboards</CardTitle>
                            <CardDescription>Your rank: {yourRank}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Volume</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="streak">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="text-center">Leaderboards</CardTitle>
                            <CardDescription>Your rank: {yourRank}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Streak</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CompetitionPage;