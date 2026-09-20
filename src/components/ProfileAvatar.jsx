import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProfileAvatar({
    size = "md",
    className = "",
    showBorder = false,
}) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                const response = await api.get(
                    "auth/profile/"
                );

                if (mounted) {
                    setProfile(response.data);
                }
            } catch (error) {
                console.error(
                    "Failed to load profile avatar:",
                    error
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, []);

    const getMediaUrl = (url) => {
        if (!url) return null;

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        const baseURL =
            api.defaults.baseURL ||
            "http://127.0.0.1:8000/api/";

        try {
            const apiURL = new URL(
                baseURL,
                window.location.origin
            );

            return new URL(
                url,
                apiURL.origin
            ).href;
        } catch {
            return url;
        }
    };

    const sizeClasses = {
        xs: "h-8 w-8 text-xs",
        sm: "h-9 w-9 text-sm",
        md: "h-11 w-11 text-base",
        lg: "h-14 w-14 text-lg",
        xl: "h-20 w-20 text-2xl",
    };

    const sizeClass =
        sizeClasses[size] ||
        sizeClasses.md;

    const username =
        profile?.username || "User";

    const initial =
        username.charAt(0).toUpperCase();

    const imageUrl = getMediaUrl(
        profile?.profile_picture
    );

    if (loading) {
        return (
            <div
                className={`${sizeClass} ${className} animate-pulse rounded-full bg-slate-200`}
            />
        );
    }

    return (
        <div
            className={`
                ${sizeClass}
                ${className}
                overflow-hidden
                rounded-full
                bg-slate-900
                flex
                items-center
                justify-center
                font-semibold
                text-white
                shrink-0
                ${showBorder ? "ring-2 ring-white" : ""}
            `}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={`${username}'s profile`}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.style.display =
                            "none";
                    }}
                />
            ) : (
                initial
            )}
        </div>
    );
}