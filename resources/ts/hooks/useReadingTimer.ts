import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

interface TimerState {
    remainingSeconds: number;
    isActive: boolean;
    canClaimReward: boolean;
    hasClaimedToday: boolean;
    sessionId: number | null;
}

interface ClaimRewardResponse {
    success: boolean;
    points?: number;
    total_points?: number;
    message?: string;
}

export function useReadingTimer(bookId: number | string) {
    const [timerState, setTimerState] = useState<TimerState>({
        remainingSeconds: 0,
        isActive: false,
        canClaimReward: false,
        hasClaimedToday: false,
        sessionId: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isPageActive = useRef(true);
    const lastUpdateRef = useRef<number>(Date.now());
    const hasAutoClaimedRef = useRef<boolean>(false);
    const finalUpdateSentRef = useRef<boolean>(false);

    // Fetch initial session
    const fetchSession = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/reading/session/${bookId}`);
            setTimerState({
                remainingSeconds: response.data.remaining_seconds,
                isActive: response.data.is_active,
                canClaimReward: response.data.can_claim_reward,
                hasClaimedToday: response.data.has_claimed_today,
                sessionId: response.data.session_id,
            });

            // Reset flags
            hasAutoClaimedRef.current = false;
            finalUpdateSentRef.current = false;

            // If already can claim, trigger claim
            if (
                response.data.can_claim_reward &&
                !response.data.has_claimed_today
            ) {
                claimReward().catch(console.error);
            }
        } catch (error) {
            console.error("Error fetching session:", error);
        } finally {
            setIsLoading(false);
        }
    }, [bookId]);

    // Update session to server
    const updateSession = useCallback(
        async (seconds: number) => {
            try {
                await axios.put(`/reading/session/${bookId}`, {
                    remaining_seconds: seconds,
                });
            } catch (error) {
                console.error("Error updating session:", error);
            }
        },
        [bookId]
    );

    // Claim reward
    const claimReward = useCallback(async (): Promise<ClaimRewardResponse> => {
        // Prevent multiple claims
        if (isClaiming || hasAutoClaimedRef.current) {
            return { success: false, message: "Already claiming" };
        }

        setIsClaiming(true);
        hasAutoClaimedRef.current = true;

        try {
            // Send final update to ensure server has 0
            await updateSession(0);

            // Small delay to ensure server processes the update
            await new Promise((resolve) => setTimeout(resolve, 500));

            const response = await axios.post(`/reading/claim/${bookId}`);

            console.log(response.data);
            //  { success: true, points: 10, total_points: 10 }
            toast.success(
                `Selamat! Anda mendapatkan ${response.data.points} poin!`
            );
            if (response.data.success) {
                setTimerState((prev) => ({
                    ...prev,
                    remainingSeconds: 0,
                    canClaimReward: false,
                    hasClaimedToday: true,
                    isActive: false,
                }));

                // Stop the interval if running
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }

                return response.data;
            }
            return response.data;
        } catch (error: any) {
            console.error("Error claiming reward:", error);
            hasAutoClaimedRef.current = false;
            throw new Error(
                error.response?.data?.message || "Gagal mengklaim poin"
            );
        } finally {
            setIsClaiming(false);
        }
    }, [bookId, updateSession, isClaiming]);

    // Start countdown
    const startCountdown = useCallback(() => {
        if (
            timerState.remainingSeconds > 0 &&
            !timerState.hasClaimedToday &&
            !isClaiming
        ) {
            setTimerState((prev) => ({ ...prev, isActive: true }));
        }
    }, [timerState.remainingSeconds, timerState.hasClaimedToday, isClaiming]);

    // Pause countdown
    const pauseCountdown = useCallback(() => {
        if (timerState.isActive) {
            setTimerState((prev) => ({ ...prev, isActive: false }));
            // Update server immediately when pausing
            updateSession(timerState.remainingSeconds);
        }
    }, [timerState.isActive, timerState.remainingSeconds, updateSession]);

    // Timer logic
    useEffect(() => {
        if (
            timerState.isActive &&
            timerState.remainingSeconds > 0 &&
            !timerState.hasClaimedToday &&
            !isClaiming
        ) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(() => {
                setTimerState((prev) => {
                    // Don't decrement if already 0 or claiming
                    if (prev.remainingSeconds <= 0 || isClaiming) {
                        return prev;
                    }

                    const newSeconds = prev.remainingSeconds - 1;
                    const now = Date.now();
                    const timeSinceLastUpdate = now - lastUpdateRef.current;

                    // Update server periodically
                    if (
                        newSeconds % 5 === 0 || // Update lebih sering (every 5 seconds)
                        newSeconds === 0 ||
                        timeSinceLastUpdate >= 5000
                    ) {
                        updateSession(newSeconds);
                        lastUpdateRef.current = now;
                    }

                    // Check if timer just finished
                    const justFinished = newSeconds === 0;

                    // Auto claim when timer finishes
                    if (
                        justFinished &&
                        !prev.hasClaimedToday &&
                        !hasAutoClaimedRef.current &&
                        !isClaiming
                    ) {
                        // Use setTimeout to avoid state update during render
                        setTimeout(() => {
                            claimReward().catch(console.error);
                        }, 100);
                    }

                    return {
                        ...prev,
                        remainingSeconds: newSeconds,
                        canClaimReward: newSeconds === 0,
                        isActive: newSeconds > 0,
                    };
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [
        timerState.isActive,
        timerState.hasClaimedToday,
        updateSession,
        claimReward,
        isClaiming,
    ]);

    // Handle page visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isVisible = !document.hidden;
            isPageActive.current = isVisible;

            if (!isVisible && timerState.isActive && !isClaiming) {
                pauseCountdown();
            } else if (
                isVisible &&
                timerState.remainingSeconds > 0 &&
                !timerState.hasClaimedToday &&
                !timerState.isActive &&
                !timerState.canClaimReward &&
                !isClaiming
            ) {
                startCountdown();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [
        timerState.isActive,
        timerState.remainingSeconds,
        timerState.hasClaimedToday,
        timerState.canClaimReward,
        pauseCountdown,
        startCountdown,
        isClaiming,
    ]);

    // Handle before unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (timerState.isActive && !isClaiming) {
                updateSession(timerState.remainingSeconds);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [
        timerState.isActive,
        timerState.remainingSeconds,
        updateSession,
        isClaiming,
    ]);

    // Initial fetch
    useEffect(() => {
        fetchSession();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timerState.isActive && !isClaiming) {
                updateSession(timerState.remainingSeconds);
            }
        };
    }, [fetchSession]);

    // Format time helper
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes === 0) {
            return `${remainingSeconds} detik`;
        }

        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return {
        timerState,
        isLoading,
        isClaiming,
        startCountdown,
        pauseCountdown,
        claimReward,
        resetTimer: fetchSession,
        formatTime,
    };
}
