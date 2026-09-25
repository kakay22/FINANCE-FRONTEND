import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "../components/ProfileAvatar";

import api from "../api/axios";
import Loading from "../components/Loading";

function formatCurrency(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function ProgressRing({ percentage }) {
    const value = Math.min(
        Math.max(Number(percentage || 0), 0),
        100
    );

    const radius = 46;
    const circumference = 2 * Math.PI * radius;

    const offset =
        circumference -
        (value / 100) * circumference;

    return (
        <div className="relative h-32 w-32 shrink-0">
            <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 112 112"
            >
                <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-800"
                />

                <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-white transition-all duration-700"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tracking-tight text-white">
                    {value < 1 && value > 0
                            ? value.toFixed(2)
                            : value.toFixed(0)}%
                </span>

                <span className="text-[11px] text-gray-400">
                    complete
                </span>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    description,
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <span className="material-symbols-rounded text-[20px]">
                    {icon}
                </span>
            </div>

            <p className="text-xs font-medium text-gray-400">
                {label}
            </p>

            <p className="mt-1 truncate text-lg font-bold tracking-tight text-gray-950">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-xs text-gray-400">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setError("");

            const response = await api.get(
                "savings/dashboard/"
            );

            setDashboard(response.data);
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.detail ||
                "Unable to load your dashboard.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const recentTransactions =
        dashboard?.recent_transactions || [];

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center px-5">
                <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                        <span className="material-symbols-rounded text-gray-700">
                            cloud_off
                        </span>
                    </div>

                    <h1 className="text-lg font-bold text-gray-950">
                        Something went wrong
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            loadDashboard();
                        }}
                        className="mt-5 rounded-xl bg-gray-950 px-5 py-3 text-sm font-medium text-white"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return null;
    }

    const goal = dashboard.goal;

    const totalContributions = Number(
        dashboard.total_contributions ??
        dashboard.total_saved ??
        0
    );

    const totalBorrowed = Number(
        dashboard.total_borrowed || 0
    );

    const outstandingBorrowings = Number(
        dashboard.outstanding_borrowings || 0
    );

    const availableSavings = Number(
        dashboard.available_savings ??
        dashboard.total_saved ??
        0
    );

    const remaining = Number(
        dashboard.remaining_amount || 0
    );

    const target = Number(
        goal?.target_amount || 0
    );

    const progress =
        target > 0
            ? Math.min(
                (availableSavings / target) * 100,
                100
            )
            : 0;

    const isGoalCompleted =
        progress >= 100 || remaining <= 0;

    const averageMonthly = Number(
        dashboard.average_monthly_savings || 0
    );

    const estimatedMonths =
        dashboard.estimated_months_remaining !== null
            ? Number(
                dashboard.estimated_months_remaining
            )
            : null;

    const goalMembers = goal?.members || [];

    const contributions =
        dashboard.contributions || [];

    console.log("DASHBOARD:", dashboard);
    console.log("GOAL:", goal);
    console.log("TARGET:", target);
    console.log("AVAILABLE:", availableSavings);
    console.log("PROGRESS:", progress);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white">
                <div className="px-5 pb-5 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                Shared finances
                            </p>

                            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-gray-950">
                                {goal?.name ||
                                    "My Goal"}
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/settings"
                                )
                            }
                            className="rounded-full"
                            aria-label="Open profile"
                        >
                            <ProfileAvatar
                                size="md"
                                showBorder
                            />
                        </button>
                    </div>
                </div>
            </header>

            <main className="space-y-4 px-4 py-4">
                {/* Housing goal */}
                <section className="rounded-3xl bg-gray-950 p-5 text-white shadow-sm">
                    {isGoalCompleted ? (
                        <>
                            {/* Completed goal */}
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                                    <span className="material-symbols-rounded text-[34px]">
                                        celebration
                                    </span>
                                </div>

                                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-400">
                                    Goal completed
                                </p>

                                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                                    Congratulations! 🎉
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                                    Your shared goal{" "}
                                    <span className="font-semibold text-white">
                                        {goal?.name ||
                                            "housing goal"}
                                    </span>{" "}
                                    has reached its target.
                                </p>

                                {/* ALL SHARED GOAL MEMBERS */}
                                {goalMembers.length > 0 && (
                                    <>
                                        <div className="mt-6 flex items-center justify-center">
                                            {goalMembers.map(
                                                (
                                                    member,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            member.id
                                                        }
                                                        className={`relative ${index >
                                                            0
                                                            ? "-ml-3"
                                                            : ""
                                                            }`}
                                                    >
                                                        <div className="rounded-full bg-gray-950 p-1">
                                                            <ProfileAvatar
                                                                size="lg"
                                                                showBorder
                                                                user={
                                                                    member
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <p className="mt-3 text-xs text-gray-400">
                                            {goalMembers
                                                .map(
                                                    (
                                                        member
                                                    ) =>
                                                        member.display_name ||
                                                        member.username
                                                )
                                                .join(
                                                    " & "
                                                )}
                                        </p>
                                    </>
                                )}

                                <div className="mt-5 w-full rounded-2xl bg-white/10 p-4">
                                    <p className="text-xs text-gray-400">
                                        Goal amount
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {formatCurrency(
                                            target
                                        )}
                                    </p>

                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                                        <div className="h-full w-full rounded-full bg-white" />
                                    </div>

                                    <div className="mt-2 flex items-center justify-between text-xs">
                                        <span className="text-gray-400">
                                            Fully funded
                                        </span>

                                        <span className="font-semibold text-white">
                                            100%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Create another goal */}
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/goals/create"
                                    )
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-gray-950 transition active:scale-[0.98]"
                            >
                                <span className="material-symbols-rounded text-[20px]">
                                    add
                                </span>

                                Create another goal
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/goals"
                                    )
                                }
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition hover:text-white"
                            >
                                <span className="material-symbols-rounded text-[18px]">
                                    history
                                </span>

                                View goal history
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Active goal */}
                            <div className="flex items-center gap-5">
                                <ProgressRing
                                    percentage={
                                        progress
                                    }
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-400">
                                        Available savings
                                    </p>

                                    <p className="mt-1 text-2xl font-bold tracking-tight">
                                        {formatCurrency(
                                            availableSavings
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        of{" "}
                                        {formatCurrency(target)}{" "}
                                        {goal?.name || "savings goal"}
                                    </p>

                                    <div className="mt-4">
                                        <p className="text-xs text-gray-400">
                                            Still needed
                                        </p>

                                        <p className="mt-0.5 text-sm font-semibold text-white">
                                            {formatCurrency(
                                                remaining
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/add-money"
                                    )
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-gray-950 transition active:scale-[0.98]"
                            >
                                <span className="material-symbols-rounded text-[20px]">
                                    add
                                </span>

                                Add money
                            </button>
                        </>
                    )}
                </section>

                {/* Savings breakdown */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard
                        icon="savings"
                        label="Total contributions"
                        value={formatCurrency(
                            totalContributions
                        )}
                        description="Money added to housing fund"
                    />

                    <StatCard
                        icon="account_balance_wallet"
                        label="Borrowed from savings"
                        value={formatCurrency(
                            outstandingBorrowings
                        )}
                        description="Currently outside the fund"
                    />

                    <StatCard
                        icon="account_balance"
                        label="Available savings"
                        value={formatCurrency(
                            availableSavings
                        )}
                        description="Currently available"
                    />
                </section>

                {/* Statistics */}
                <section className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon="calendar_month"
                        label="Monthly average"
                        value={formatCurrency(
                            averageMonthly
                        )}
                        description="Based on contributions"
                    />

                    <StatCard
                        icon="schedule"
                        label="Estimated time"
                        value={
                            estimatedMonths !==
                                null
                                ? `${estimatedMonths.toFixed(
                                    1
                                )} months`
                                : "Not available"
                        }
                        description="At current pace"
                    />

                    <StatCard
                        icon="receipt_long"
                        label="Transactions"
                        value={
                            dashboard.total_transactions
                        }
                        description="Total recorded"
                    />

                    <StatCard
                        icon="flag"
                        label="Target"
                        value={formatCurrency(
                            target
                        )}
                        description="Housing goal"
                    />
                </section>

                {/* Borrowing notice */}
                {outstandingBorrowings > 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/borrowings"
                            )
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <span className="material-symbols-rounded text-gray-700">
                                    account_balance_wallet
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-950">
                                    Money currently borrowed
                                </p>

                                <p className="mt-0.5 text-xs leading-5 text-gray-500">
                                    {formatCurrency(
                                        outstandingBorrowings
                                    )}{" "}
                                    is currently outside the
                                    housing fund.
                                </p>
                            </div>

                            <span className="material-symbols-rounded shrink-0 text-gray-400">
                                chevron_right
                            </span>
                        </div>
                    </button>
                )}

                {/* Contributions */}
                <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                        <div>
                            <h2 className="font-semibold text-gray-950">
                                Contributions
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-400">
                                Total money added by each member
                            </p>
                        </div>

                        <span className="material-symbols-rounded text-gray-400">
                            group
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {contributions.length >
                            0 ? (
                            contributions.map(
                                (person) => {
                                    const amount =
                                        Number(
                                            person.amount ||
                                            0
                                        );

                                    const percentage =
                                        totalContributions >
                                            0
                                            ? (amount /
                                                totalContributions) *
                                            100
                                            : 0;

                                    return (
                                        <div
                                            key={
                                                person.user_id
                                            }
                                            className="px-4 py-4"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-950">
                                                        {person.display_name ||
                                                            person.username}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-gray-400">
                                                        {percentage.toFixed(
                                                            0
                                                        )}
                                                        % of contributions
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-sm font-bold text-gray-950">
                                                    {formatCurrency(
                                                        amount
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className="h-full rounded-full bg-gray-950 transition-all"
                                                    style={{
                                                        width: `${Math.min(
                                                            percentage,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-gray-400">
                                    No contributions yet.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent transactions */}
                <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                        <div>
                            <h2 className="font-semibold text-gray-950">
                                Recent transactions
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-400">
                                Latest housing fund activity
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/transactions"
                                )
                            }
                            className="text-xs font-semibold text-gray-950"
                        >
                            See all
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {recentTransactions.length >
                            0 ? (
                            recentTransactions.map(
                                (transaction) => (
                                    <button
                                        type="button"
                                        key={
                                            transaction.id
                                        }
                                        onClick={() =>
                                            navigate(
                                                "/transactions"
                                            )
                                        }
                                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition active:bg-gray-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                            <span className="material-symbols-rounded text-[20px] text-gray-700">
                                                {transaction.transaction_type ===
                                                    "TRANSFER"
                                                    ? "swap_horiz"
                                                    : "payments"}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-950">
                                                {transaction
                                                    .user
                                                    ?.username ||
                                                    "Member"}
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {
                                                    transaction.transaction_type
                                                }{" "}
                                                ·{" "}
                                                {formatDate(
                                                    transaction.transaction_date
                                                )}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-950">
                                                +
                                                {formatCurrency(
                                                    transaction.amount
                                                )}
                                            </p>

                                            <span className="material-symbols-rounded mt-1 text-[17px] text-gray-300">
                                                chevron_right
                                            </span>
                                        </div>
                                    </button>
                                )
                            )
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <span className="material-symbols-rounded text-gray-500">
                                        receipt_long
                                    </span>
                                </div>

                                <p className="text-sm font-medium text-gray-700">
                                    No transactions yet
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Add your first contribution
                                    to get started.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Borrowing */}
                <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <span className="material-symbols-rounded text-gray-700">
                                account_balance_wallet
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-gray-950">
                                Borrowing from savings
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                Money borrowed from the housing
                                fund reduces your available savings
                                until it is repaid.
                            </p>

                            {outstandingBorrowings >
                                0 && (
                                    <p className="mt-2 text-sm font-semibold text-gray-950">
                                        {formatCurrency(
                                            outstandingBorrowings
                                        )}{" "}
                                        outstanding
                                    </p>
                                )}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/borrowings"
                                )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white"
                            aria-label="Open borrowing"
                        >
                            <span className="material-symbols-rounded text-[19px]">
                                arrow_forward
                            </span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}