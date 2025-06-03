// frontend/src/pages/success.tsx or frontend/src/app/success/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { UserRole } from '@/components/auth/sign-up-form';
import ButterflyLoader from '@/components/butterfly-loader';

const SuccessPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);
    const { isAuthorized, isLoading, user } = useRoleProtection({
        allowedRoles: [UserRole.REGULAR_USER]
    });


    useEffect(() => {
        if (sessionId) {
            verifySession();
        }
    }, [sessionId]);

    const verifySession = async () => {
        try {
            // Optional: Verify the session on your backend
            const { data } = await api.get(`/stripe/verify-session/${sessionId}`);
            setSessionData(data);
        } catch (error) {
            console.error('Error verifying session:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <ButterflyLoader />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <ButterflyLoader />
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">
                        Payment Successful!
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Thank you for your subscription! Your membership has been activated.
                    </p>
                    <div className="space-y-2">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/gyms">Browse Gyms</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuccessPage;