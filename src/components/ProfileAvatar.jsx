import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProfileAvatar({
    user = null,
    size = "md",
    className = "",
    showBorder = false,
}) {
    const [profile, setProfile] = useState(user);
    const [loading, setLoading] = useState(!user);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        let mounted = true;

        setImageError(false);

        const loadProfile = async () => {
            try {
                /*
                 * No user supplied:
                 * Load the currently logged-in user's profile.
                 */
                if (!user) {
                    const response = await api.get(
                        "auth/profile/"
                    );

                    if (mounted) {
                        setProfile(response.data);
                    }

                    return;
                }

                /*
                 * If the supplied user already has a profile picture,
                 * use it immediately.
                 */
                if (
                    user.profile_picture ||
                    user.avatar ||
                    user.photo
                ) {
                    if (mounted) {
                        setProfile(user);
                    }

                    return;
                }

                /*
                 * We only have something like:
                 *
                 * {
                 *     id: 1,
                 *     username: "kyle"
                 * }
                 *
                 * Fetch the complete public profile.
                 */
                if (user.id) {
                    const response = await api.get(
                        `auth/users/${user.id}/`
                    );

                    console.log(
                        "PUBLIC PROFILE RESPONSE:",
                        response.data
                    );

                    if (mounted) {
                        setProfile(response.data);
                    }
                } else {
                    if (mounted) {
                        setProfile(user);
                    }
                }
            } catch (error) {
                console.error(
                    "Failed to load profile avatar:",
                    error
                );

                /*
                 * Keep the supplied user so the avatar can
                 * still show the user's initial.
                 */
                if (mounted) {
                    setProfile(user);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        setLoading(true);
        loadProfile();

        return () => {
            mounted = false;
        };
    }, [user]);

    const getMediaUrl = (url) => {
        if (!url) {
            return null;
        }

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        try {
            const baseURL =
                api.defaults.baseURL ||
                "http://127.0.0.1:8000/api/";

            const apiURL = new URL(
                baseURL,
                window.location.origin
            );

            if (url.startsWith("/")) {
                return `${apiURL.origin}${url}`;
            }

            const backendRoot =
                apiURL.pathname
                    .replace(/\/api\/?$/, "")
                    .replace(/\/$/, "");

            return `${apiURL.origin}${backendRoot}/${url.replace(
                /^\/+/,
                ""
            )}`;
        } catch (error) {
            console.error(
                "Failed to build profile picture URL:",
                error
            );

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
        sizeClasses[size] || sizeClasses.md;

    const username =
        profile?.display_name ||
        profile?.username ||
        profile?.name ||
        profile?.full_name ||
        "User";

    const initial =
        username.charAt(0).toUpperCase();

    const rawImageUrl =
        profile?.profile_picture ||
        profile?.avatar ||
        profile?.photo ||
        null;

    const imageUrl = getMediaUrl(
        rawImageUrl
    );

    if (loading) {
        return (
            <div
                className={`
                    ${sizeClass}
                    ${className}
                    flex
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    bg-slate-200
                    animate-pulse
                `}
            />
        );
    }

    return (
        <div
            className={`
                ${sizeClass}
                ${className}
                flex
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-slate-900
                font-semibold
                text-white
                ${showBorder ? "ring-2 ring-white" : ""}
            `}
        >
            {imageUrl && !imageError ? (
                <img
                    src={imageUrl}
                    alt={`${username}'s profile`}
                    className="h-full w-full object-cover"
                    onError={() => {
                        console.error(
                            "Failed to load profile image:",
                            imageUrl
                        );

                        setImageError(true);
                    }}
                />
            ) : (
                initial
            )}
        </div>
    );
}