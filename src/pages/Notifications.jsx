import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const notificationIcons = {
    TRANSACTION: "receipt_long",
    BORROWING: "account_balance_wallet",
    REPAYMENT: "payments",
    REMINDER: "notifications_active",
    SYSTEM: "info",
};

const notificationLabels = {
    TRANSACTION: "Transaction",
    BORROWING: "Borrowing",
    REPAYMENT: "Repayment",
    REMINDER: "Reminder",
    SYSTEM: "System",
};

function formatTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
        return "Just now";
    }

    if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return `${minutes}m ago`;
    }

    if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `${hours}h ago`;
    }

    if (diff < 2 * day) {
        return "Yesterday";
    }

    if (diff < 7 * day) {
        const days = Math.floor(diff / day);
        return `${days}d ago`;
    }

    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year:
                date.getFullYear() !==
                now.getFullYear()
                    ? "numeric"
                    : undefined,
        }
    );
}

function getDateGroup(dateString) {
    if (!dateString) {
        return "Earlier";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Earlier";
    }

    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const notificationDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const difference =
        today.getTime() -
        notificationDate.getTime();

    const day = 24 * 60 * 60 * 1000;

    if (difference === 0) {
        return "Today";
    }

    if (difference === day) {
        return "Yesterday";
    }

    if (difference < 7 * day) {
        return "This week";
    }

    return "Earlier";
}

function NotificationIcon({
    type,
    unread,
}) {
    const icon =
        notificationIcons[type] ||
        "notifications";

    return (
        <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                unread
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500"
            }`}
        >
            <span className="material-symbols-rounded text-[21px]">
                {icon}
            </span>
        </div>
    );
}

export default function Notifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [markingAll, setMarkingAll] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const loadNotifications =
        useCallback(async () => {
            try {
                setLoading(true);

                const response =
                    await api.get(
                        "notifications/"
                    );

                const data =
                    response.data;

                setNotifications(
                    Array.isArray(
                        data?.notifications
                    )
                        ? data.notifications
                        : []
                );

                setUnreadCount(
                    Number(
                        data?.unread_count || 0
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to load notifications:",
                    error
                );

                toast.error(
                    error?.response?.data
                        ?.detail ||
                        "Unable to load notifications."
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAsRead = async (
        notification
    ) => {
        if (notification.is_read) {
            return;
        }

        try {
            await api.patch(
                `notifications/${notification.id}/read/`
            );

            setNotifications(
                (current) =>
                    current.map((item) =>
                        item.id ===
                        notification.id
                            ? {
                                  ...item,
                                  is_read: true,
                              }
                            : item
                    )
            );

            setUnreadCount(
                (current) =>
                    Math.max(
                        0,
                        current - 1
                    )
            );
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );

            toast.error(
                "Unable to update notification."
            );
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        try {
            setMarkingAll(true);

            await api.patch(
                "notifications/read-all/"
            );

            setNotifications(
                (current) =>
                    current.map((item) => ({
                        ...item,
                        is_read: true,
                    }))
            );

            setUnreadCount(0);

            toast.success(
                "All notifications marked as read."
            );
        } catch (error) {
            console.error(
                "Failed to mark all notifications:",
                error
            );

            toast.error(
                "Unable to mark all notifications as read."
            );
        } finally {
            setMarkingAll(false);
        }
    };

    const deleteNotification = async (
        notification
    ) => {
        try {
            setDeletingId(
                notification.id
            );

            await api.delete(
                `notifications/${notification.id}/`
            );

            setNotifications(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            notification.id
                    )
            );

            if (!notification.is_read) {
                setUnreadCount(
                    (current) =>
                        Math.max(
                            0,
                            current - 1
                        )
                );
            }
        } catch (error) {
            console.error(
                "Failed to delete notification:",
                error
            );

            toast.error(
                "Unable to delete notification."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const groupedNotifications =
        notifications.reduce(
            (groups, notification) => {
                const group =
                    getDateGroup(
                        notification.created_at
                    );

                if (!groups[group]) {
                    groups[group] = [];
                }

                groups[group].push(
                    notification
                );

                return groups;
            },
            {}
        );

    const groupOrder = [
        "Today",
        "Yesterday",
        "This week",
        "Earlier",
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                            aria-label="Go back"
                        >
                            <span className="material-symbols-rounded">
                                arrow_back
                            </span>
                        </button>

                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                                Notifications
                            </h1>

                            <p className="truncate text-xs text-slate-500">
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : "You're all caught up"}
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={
                                markAllAsRead
                            }
                            disabled={
                                markingAll
                            }
                            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {markingAll
                                ? "Updating..."
                                : "Mark all read"}
                        </button>
                    )}
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
                {/* Loading */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({
                            length: 5,
                        }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex gap-3">
                                        <div className="h-11 w-11 rounded-2xl bg-slate-200" />

                                        <div className="flex-1">
                                            <div className="h-4 w-2/3 rounded bg-slate-200" />

                                            <div className="mt-2 h-3 w-full rounded bg-slate-200" />

                                            <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    notifications.length ===
                        0 && (
                        <div className="flex min-h-[55vh] items-center justify-center">
                            <div className="max-w-sm text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                                    <span className="material-symbols-rounded text-[30px] text-slate-400">
                                        notifications_none
                                    </span>
                                </div>

                                <h2 className="mt-5 text-base font-semibold text-slate-900">
                                    No notifications
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    You're all caught up.
                                    New account activity,
                                    reminders, and updates
                                    will appear here.
                                </p>
                            </div>
                        </div>
                    )}

                {/* Notifications */}
                {!loading &&
                    notifications.length >
                        0 && (
                        <div className="space-y-7">
                            {groupOrder.map(
                                (group) => {
                                    const items =
                                        groupedNotifications[
                                            group
                                        ];

                                    if (
                                        !items?.length
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <section
                                            key={
                                                group
                                            }
                                        >
                                            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                {
                                                    group
                                                }
                                            </p>

                                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                                {items.map(
                                                    (
                                                        notification,
                                                        index
                                                    ) => {
                                                        const unread =
                                                            !notification.is_read;

                                                        return (
                                                            <div
                                                                key={
                                                                    notification.id
                                                                }
                                                                className={`relative flex gap-3 p-4 transition sm:p-5 ${
                                                                    unread
                                                                        ? "bg-slate-50/70"
                                                                        : "bg-white"
                                                                } ${
                                                                    index <
                                                                    items.length -
                                                                        1
                                                                        ? "border-b border-slate-100"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {unread && (
                                                                    <span className="absolute left-0 top-0 h-full w-1 bg-slate-900" />
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        markAsRead(
                                                                            notification
                                                                        )
                                                                    }
                                                                    className="shrink-0 rounded-2xl"
                                                                    aria-label="Mark notification as read"
                                                                >
                                                                    <NotificationIcon
                                                                        type={
                                                                            notification.notification_type
                                                                        }
                                                                        unread={
                                                                            unread
                                                                        }
                                                                    />
                                                                </button>

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0">
                                                                            <p
                                                                                className={`text-sm ${
                                                                                    unread
                                                                                        ? "font-semibold text-slate-900"
                                                                                        : "font-medium text-slate-800"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    notification.title
                                                                                }
                                                                            </p>

                                                                            <p className="mt-1 text-sm leading-5 text-slate-500">
                                                                                {
                                                                                    notification.message
                                                                                }
                                                                            </p>
                                                                        </div>

                                                                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                                                                            {formatTime(
                                                                                notification.created_at
                                                                            )}
                                                                        </span>
                                                                    </div>

                                                                    <div className="mt-3 flex items-center justify-between gap-3">
                                                                        <span className="text-[11px] font-medium text-slate-400">
                                                                            {notificationLabels[
                                                                                notification.notification_type
                                                                            ] ||
                                                                                "Notification"}
                                                                        </span>

                                                                        <div className="flex items-center gap-1">
                                                                            {unread && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        markAsRead(
                                                                                            notification
                                                                                        )
                                                                                    }
                                                                                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
                                                                                >
                                                                                    Mark read
                                                                                </button>
                                                                            )}

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    deleteNotification(
                                                                                        notification
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    deletingId ===
                                                                                    notification.id
                                                                                }
                                                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-red-500 disabled:opacity-40"
                                                                                aria-label="Delete notification"
                                                                            >
                                                                                <span className="material-symbols-rounded text-[17px]">
                                                                                    {deletingId ===
                                                                                    notification.id
                                                                                        ? "progress_activity"
                                                                                        : "delete"}
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </section>
                                    );
                                }
                            )}
                        </div>
                    )}
            </main>
        </div>
    );
}