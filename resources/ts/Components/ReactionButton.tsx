// resources/js/Components/ReactionButton.tsx
import { useState } from "react";
import { Heart, ThumbsUp, Laugh, Angry, Frown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { route } from "ziggy-js";

interface ReactionButtonProps {
    bookId: number;
    initialReactionsCount: {
        like: number;
        love: number;
        haha: number;
        angry: number;
        sad: number;
        total: number;
    };
    initialUserReaction: string | null;
    onReactionChange?: (reactions: any, userReaction: string | null) => void;
}

type ReactionType = "like" | "love" | "haha" | "angry" | "sad";

const reactionConfig = {
    like: {
        icon: ThumbsUp,
        label: "Suka",
        color: "text-blue-500",
        activeBgColor: "bg-blue-50 dark:bg-blue-950",
        hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-900",
        borderColor: "border-blue-200 dark:border-blue-800",
        gif: "/assets/gifs/like.gif",
    },
    love: {
        icon: Heart,
        label: "Cinta",
        color: "text-red-500",
        activeBgColor: "bg-red-50 dark:bg-red-950",
        hoverColor: "hover:bg-red-100 dark:hover:bg-red-900",
        borderColor: "border-red-200 dark:border-red-800",
        gif: "/assets/gifs/love.gif",
    },
    haha: {
        icon: Laugh,
        label: "Tertawa",
        color: "text-yellow-500",
        activeBgColor: "bg-yellow-50 dark:bg-yellow-950",
        hoverColor: "hover:bg-yellow-100 dark:hover:bg-yellow-900",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        gif: "/assets/gifs/haha.gif",
    },
    angry: {
        icon: Angry,
        label: "Marah",
        color: "text-orange-500",
        activeBgColor: "bg-orange-50 dark:bg-orange-950",
        hoverColor: "hover:bg-orange-100 dark:hover:bg-orange-900",
        borderColor: "border-orange-200 dark:border-orange-800",
        gif: "/assets/gifs/angry.gif",
    },
    sad: {
        icon: Frown,
        label: "Sedih",
        color: "text-purple-500",
        activeBgColor: "bg-purple-50 dark:bg-purple-950",
        hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-900",
        borderColor: "border-purple-200 dark:border-purple-800",
        gif: "/assets/gifs/sad.gif",
    },
};

export default function ReactionButton({
    bookId,
    initialReactionsCount,
    initialUserReaction,
    onReactionChange,
}: ReactionButtonProps) {
    const [reactionsCount, setReactionsCount] = useState(initialReactionsCount);
    const [userReaction, setUserReaction] = useState(initialUserReaction);
    const [isLoading, setIsLoading] = useState(false);
    const [showGif, setShowGif] = useState<string | null>(null);

    const handleReaction = async (type: ReactionType) => {
        if (isLoading) return;

        // Optimistic update - update UI immediately
        const previousReaction = userReaction;
        const previousCounts = { ...reactionsCount };

        // Optimistically update UI
        if (previousReaction === type) {
            // Removing reaction
            setUserReaction(null);
            setReactionsCount((prev) => ({
                ...prev,
                [type]: Math.max(0, prev[type] - 1),
                total: Math.max(0, prev.total - 1),
            }));
        } else {
            // Adding or changing reaction
            setUserReaction(type);
            setReactionsCount((prev) => {
                const newCounts = { ...prev };

                // If there was a previous reaction, decrement that count
                if (previousReaction) {
                    newCounts[previousReaction as ReactionType] = Math.max(
                        0,
                        newCounts[previousReaction as ReactionType] - 1
                    );
                } else {
                    // Only increment total if it's a new reaction (not changing)
                    newCounts.total = prev.total + 1;
                }

                // Increment the new reaction count
                newCounts[type] = (newCounts[type] || 0) + 1;

                return newCounts;
            });
        }

        setIsLoading(true);

        // Show GIF animation
        setShowGif(type);
        setTimeout(() => setShowGif(null), 1500);

        try {
            const url = route("reaction.toggle", { book: bookId });
            const response = await axios.post(url, { type });

            // Update with actual data from server
            if (response.data.reactions_count) {
                setReactionsCount(response.data.reactions_count);
            }
            if (response.data.user_reaction !== undefined) {
                setUserReaction(response.data.user_reaction);
            }

            if (onReactionChange) {
                onReactionChange(
                    response.data.reactions_count,
                    response.data.user_reaction
                );
            }
        } catch (error) {
            // Rollback on error
            console.error("Error submitting reaction:", error);
            setUserReaction(previousReaction);
            setReactionsCount(previousCounts);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="mb-2">
                <h3 className="text-sm font-medium text-primary">
                    Reaksi untuk buku ini
                </h3>
            </div>

            <div className="flex flex-wrap gap-2">
                {(Object.keys(reactionConfig) as ReactionType[]).map((type) => {
                    const {
                        icon: Icon,
                        label,
                        color,
                        activeBgColor,
                        hoverColor,
                        borderColor,
                    } = reactionConfig[type];
                    const isActive = userReaction === type;
                    const count = reactionsCount[type];

                    return (
                        <motion.button
                            key={type}
                            onClick={() => handleReaction(type)}
                            disabled={isLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative flex items-center gap-2 rounded-full px-4 py-2
                                transition-all duration-200 border
                                ${
                                    isActive
                                        ? `${activeBgColor} ${borderColor} border-2 shadow-sm`
                                        : `bg-background border-border ${hoverColor}`
                                }
                                ${
                                    isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                }
                            `}
                        >
                            <Icon
                                className={`h-5 w-5 transition-all ${color} ${
                                    isActive ? "scale-110" : ""
                                }`}
                            />

                            {count > 0 && (
                                <motion.span
                                    key={count}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    className={`text-xs font-semibold ${
                                        isActive
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {count}
                                </motion.span>
                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="activeReactionBackground"
                                    className="absolute inset-0 rounded-full -z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* GIF Animation Overlay */}
            <AnimatePresence>
                {showGif && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="relative"
                        >
                            <img
                                src={
                                    reactionConfig[showGif as ReactionType].gif
                                }
                                alt={
                                    reactionConfig[showGif as ReactionType]
                                        .label
                                }
                                className="h-44 w-4h-44 object-contain rounded-full"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
