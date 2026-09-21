import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileAvatar from "../components/ProfileAvatar";

import api from "../api/axios";

function SettingRow({
    icon,
    title,
    description,
    children,
    onClick,
}) {
    const content = (
        <div className="flex min-h-[68px] items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <span className="material-symbols-rounded text-[21px] text-slate-600">
                    {icon}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                    {title}
                </p>

                {description && (
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                )}
            </div>

            {children}
        </div>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="w-full text-left transition hover:bg-slate-50 active:bg-slate-100"
            >
                {content}
            </button>
        );
    }

    return content;
}

export default function Settings() {
    const navigate = useNavigate();

    const [showAvatar, setShowAvatar] = useState(false);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogout, setShowLogout] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get(
                    "auth/profile/"
                );

                setProfile(response.data);
            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error
                );

                /*
                 * Profile information is not required for
                 * the settings page to work.
                 */
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const username =
        profile?.username ||
        profile?.user?.username ||
        localStorage.getItem("username") ||
        localStorage.getItem("user") ||
        "Account";

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            /*
             * If your backend has a logout endpoint,
             * you can call it here.
             *
             * JWT authentication does not require this
             * for the browser session to end.
             */

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");
            localStorage.removeItem("username");

            toast.success("You have been logged out.");

            navigate("/login", {
                replace: true,
            });
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );

            toast.error(
                "Unable to log out."
            );
        } finally {
            setLoggingOut(false);
            setShowLogout(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                            Settings
                        </h1>

                        <p className="text-xs text-slate-500">
                            Manage your account and app
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
                {/* Profile */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-5 sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Account
                        </p>

                        <div className="mt-4 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setShowAvatar(true)}
                                className="shrink-0 rounded-full outline-none transition active:scale-95"
                                aria-label="View profile avatar"
                            >
                                <ProfileAvatar
                                    size="lg"
                                    showBorder
                                />
                            </button>

                            <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-slate-900">
                                    {loading
                                        ? "Loading..."
                                        : username}
                                </p>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Shared housing fund member
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account settings */}
                <section className="mt-5">
                    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Account settings
                    </p>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <SettingRow
                            icon="person"
                            title="Profile"
                            description="Manage your account information"
                            onClick={() => navigate("/profile")}
                        >
                            <span className="material-symbols-rounded text-slate-400">
                                chevron_right
                            </span>
                        </SettingRow>

                        <div className="mx-4 border-t border-slate-100" />

                        <SettingRow
                            icon="lock"
                            title="Security"
                            description="Manage your password and account security"
                            onClick={() => navigate("/security")}
                        >
                            <span className="material-symbols-rounded text-slate-400">
                                chevron_right
                            </span>
                        </SettingRow>
                    </div>
                </section>

                {/* App settings */}
                <section className="mt-5">
                    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        App
                    </p>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <SettingRow
                            icon="notifications"
                            title="Notifications"
                            description="View and manage your notifications"
                            onClick={() => navigate("/notifications")}
                        >
                            <span className="material-symbols-rounded text-slate-400">
                                chevron_right
                            </span>
                        </SettingRow>

                        <div className="mx-4 border-t border-slate-100" />

                        <SettingRow
                            icon="info"
                            title="About"
                            description="Shared Housing Finance Tracker"
                            onClick={() =>
                                toast(
                                    "Shared Housing Finance Tracker"
                                )
                            }
                        >
                            <span className="material-symbols-rounded text-slate-400">
                                chevron_right
                            </span>
                        </SettingRow>
                    </div>
                </section>

                {/* Logout */}
                <section className="mt-5">
                    <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() =>
                                setShowLogout(true)
                            }
                            className="flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-red-50 active:bg-red-50"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                                <span className="material-symbols-rounded text-[21px] text-red-600">
                                    logout
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-red-600">
                                    Log out
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Sign out of this account
                                </p>
                            </div>

                            <span className="material-symbols-rounded text-red-300">
                                chevron_right
                            </span>
                        </button>
                    </div>
                </section>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Shared Housing Finance Tracker
                </p>
            </main>

            {/* Logout drawer / modal */}
            {showLogout && (
                <div className="fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Close logout confirmation"
                        onClick={() =>
                            setShowLogout(false)
                        }
                        disabled={loggingOut}
                        className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Mobile bottom drawer / Desktop modal */}
                    <div
                        className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            rounded-t-[28px]
                            bg-white
                            p-5
                            pb-[calc(1.25rem+env(safe-area-inset-bottom))]
                            shadow-2xl

                            sm:bottom-auto
                            sm:left-1/2
                            sm:right-auto
                            sm:top-1/2
                            sm:w-full
                            sm:max-w-md
                            sm:-translate-x-1/2
                            sm:-translate-y-1/2
                            sm:rounded-3xl
                            sm:p-6
                            sm:pb-6
                        "
                    >
                        {/* Drawer handle */}
                        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                            <span className="material-symbols-rounded text-[24px] text-red-600">
                                logout
                            </span>
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-slate-900">
                            Log out?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            You will need to sign in again
                            to access your housing fund.
                        </p>

                        <div className="mt-6 space-y-2.5 sm:flex sm:gap-3 sm:space-y-0">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowLogout(
                                        false
                                    )
                                }
                                disabled={loggingOut}
                                className="
                                    h-12
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    font-medium
                                    text-slate-700
                                    transition
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                    sm:flex-1
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="
                                    flex
                                    h-12
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-red-600
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    sm:flex-1
                                "
                            >
                                {loggingOut ? (
                                    <>
                                        <span className="material-symbols-rounded animate-spin text-[19px]">
                                            progress_activity
                                        </span>

                                        Logging out...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded text-[19px]">
                                            logout
                                        </span>

                                        Log out
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAvatar && (
                <div className="fixed inset-0 z-[200]">
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Close profile avatar"
                        onClick={() => setShowAvatar(false)}
                        className="absolute inset-0 h-full w-full cursor-default bg-black/80 backdrop-blur-md"
                    />

                    {/* Close button */}
                    <button
                        type="button"
                        aria-label="Close avatar preview"
                        onClick={() => setShowAvatar(false)}
                        className="absolute right-4 top-4 z-210 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                    >
                        <span className="material-symbols-rounded text-[24px]">
                            close
                        </span>
                    </button>

                    {/* Avatar */}
                    <div className="pointer-events-none relative z-205 flex h-full w-full items-center justify-center p-6">
                        <div className="scale-[2.5] sm:scale-[3.5]">
                            <ProfileAvatar size="lg" showBorder />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}