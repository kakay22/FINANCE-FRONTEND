import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

const items = [
    {
        to: "/",
        label: "Home",
        icon: "home",
    },
    {
        to: "/transactions",
        label: "Transactions",
        icon: "receipt_long",
    },
];

function NavItem({ item }) {
    return (
        <NavLink
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
                `
                flex
                min-w-0
                flex-1
                flex-col
                items-center
                justify-center
                gap-1
                px-1
                py-2
                text-center
                transition
                active:scale-95
                ${
                    isActive
                        ? "text-slate-950"
                        : "text-slate-400 hover:text-slate-700"
                }
                `
            }
        >
            {({ isActive }) => (
                <>
                    <span
                        className={`
                            material-symbols-rounded
                            text-[23px]
                            ${
                                isActive
                                    ? "font-semibold"
                                    : ""
                            }
                        `}
                    >
                        {item.icon}
                    </span>

                    <span className="max-w-full truncate text-[9px] font-semibold sm:text-[10px]">
                        {item.label}
                    </span>
                </>
            )}
        </NavLink>
    );
}

function NotificationNavItem({ onNavigate }) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let mounted = true;

        const loadUnreadCount = async () => {
            try {
                const response =
                    await api.get("notifications/");

                if (mounted) {
                    setUnreadCount(
                        Number(
                            response.data?.unread_count || 0
                        )
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load notification count:",
                    error
                );
            }
        };

        loadUnreadCount();

        const interval = setInterval(
            loadUnreadCount,
            30000
        );

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <NavLink
            to="/notifications"
            onClick={onNavigate}
            className={({ isActive }) =>
                `
                flex
                min-w-0
                flex-1
                flex-col
                items-center
                justify-center
                gap-1
                px-1
                py-2
                text-center
                transition
                active:scale-95
                ${
                    isActive
                        ? "text-slate-950"
                        : "text-slate-400 hover:text-slate-700"
                }
                `
            }
        >
            {({ isActive }) => (
                <>
                    <div className="relative">
                        <span
                            className={`
                                material-symbols-rounded
                                text-[23px]
                                ${
                                    isActive
                                        ? "font-semibold"
                                        : ""
                                }
                            `}
                        >
                            notifications
                        </span>

                        {unreadCount > 0 && (
                            <span className="absolute -right-2 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">
                                {unreadCount > 99
                                    ? "99+"
                                    : unreadCount}
                            </span>
                        )}
                    </div>

                    <span className="max-w-full truncate text-[9px] font-semibold sm:text-[10px]">
                        Alerts
                    </span>
                </>
            )}
        </NavLink>
    );
}

function AddMoneyButton() {
    const navigate = useNavigate();

    return (
        <div className="relative flex h-full w-[76px] shrink-0 items-center justify-center">
            <button
                type="button"
                onClick={() => navigate("/add-money")}
                aria-label="Add money"
                className="
                    absolute
                    -top-6
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border-[4px]
                    border-white
                    bg-slate-950
                    text-white
                    shadow-xl
                    shadow-slate-950/20
                    transition
                    hover:bg-slate-800
                    active:scale-90
                "
            >
                <span className="material-symbols-rounded text-[28px]">
                    add
                </span>
            </button>

            <span className="mt-9 text-[10px] font-semibold text-slate-500">
                Add
            </span>
        </div>
    );
}

function MoreButton({ open, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="More"
            aria-expanded={open}
            className={`
                flex
                min-w-0
                flex-1
                flex-col
                items-center
                justify-center
                gap-1
                px-1
                py-2
                text-center
                transition
                active:scale-95
                ${
                    open
                        ? "text-slate-950"
                        : "text-slate-400 hover:text-slate-700"
                }
            `}
        >
            <span className="material-symbols-rounded text-[23px]">
                {open ? "close" : "more_horiz"}
            </span>

            <span className="text-[9px] font-semibold sm:text-[10px]">
                More
            </span>
        </button>
    );
}

function MoreMenu({ onClose }) {
    const navigate = useNavigate();

    const menuItems = [
        {
            to: "/borrowings",
            label: "Borrowing",
            description: "Manage your borrowed money",
            icon: "account_balance_wallet",
        },
        {
            to: "/statistics",
            label: "Statistics",
            description: "View your savings and spending",
            icon: "bar_chart",
        },
        {
            to: "/settings",
            label: "Settings",
            description: "Manage your app preferences",
            icon: "settings",
        },
    ];

    const handleNavigate = (to) => {
        onClose();
        navigate(to);
    };

    return (
        <div className="fixed inset-x-0 bottom-[76px] z-40 px-4 pb-3">
            <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">
                {menuItems.map((item) => (
                    <button
                        key={item.to}
                        type="button"
                        onClick={() =>
                            handleNavigate(item.to)
                        }
                        className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-2xl
                            px-3
                            py-3
                            text-left
                            transition
                            hover:bg-slate-50
                            active:bg-slate-100
                        "
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <span className="material-symbols-rounded text-[21px]">
                                {item.icon}
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                                {item.label}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                                {item.description}
                            </p>
                        </div>

                        <span className="material-symbols-rounded text-slate-300">
                            chevron_right
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function BottomNav() {
    const [moreOpen, setMoreOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMoreOpen(false);
            }
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () =>
            window.removeEventListener(
                "resize",
                handleResize
            );
    }, []);

    return (
        <>
            {moreOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close more menu"
                        onClick={() =>
                            setMoreOpen(false)
                        }
                        className="fixed inset-0 z-30 bg-slate-950/10 backdrop-blur-[2px]"
                    />

                    <MoreMenu
                        onClose={() =>
                            setMoreOpen(false)
                        }
                    />
                </>
            )}

            <nav
                className="
                    fixed
                    bottom-0
                    left-0
                    right-0
                    z-50
                    border-t
                    border-slate-200/80
                    bg-white/95
                    shadow-[0_-8px_30px_rgba(15,23,42,0.06)]
                    backdrop-blur-xl
                    safe-bottom
                "
            >
                <div className="mx-auto flex h-[76px] w-full max-w-xl items-center px-1 sm:px-4">
                    {/* Left */}
                    <div className="flex min-w-0 flex-1 items-center">
                        <NavItem item={items[0]} />
                        <NavItem item={items[1]} />
                    </div>

                    {/* Center */}
                    <AddMoneyButton />

                    {/* Right */}
                    <div className="flex min-w-0 flex-1 items-center">
                        <NotificationNavItem
                            onNavigate={() =>
                                setMoreOpen(false)
                            }
                        />

                        <MoreButton
                            open={moreOpen}
                            onClick={() =>
                                setMoreOpen(
                                    (current) =>
                                        !current
                                )
                            }
                        />
                    </div>
                </div>
            </nav>
        </>
    );
}