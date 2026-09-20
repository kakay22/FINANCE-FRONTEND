import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) return "—";

    return new Date(`${value}T00:00:00`).toLocaleDateString(
        "en-PH",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}

function getMonthLabel(value) {
    if (!value) return "";

    const date = new Date(`${value}-01T00:00:00`);

    return date.toLocaleDateString("en-PH", {
        month: "short",
        year: "numeric",
    });
}

function StatCard({
    icon,
    label,
    value,
    description,
    iconClass = "bg-slate-100 text-slate-600",
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
                >
                    <span className="material-symbols-rounded text-[22px]">
                        {icon}
                    </span>
                </div>
            </div>

            <p className="mt-5 text-sm text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-xs text-slate-400">
                    {description}
                </p>
            )}
        </div>
    );
}

function EmptyChart({
    icon,
    title,
    description,
}) {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <span className="material-symbols-rounded text-slate-400">
                    {icon}
                </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
                {title}
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default function Statistics() {
    const [dashboard, setDashboard] = useState(null);
    const [borrowings, setBorrowings] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatistics = async (
        showRefresh = false
    ) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [
                dashboardResponse,
                borrowingsResponse,
                summaryResponse,
            ] = await Promise.all([
                api.get("savings/dashboard/"),
                api.get("borrowings/"),
                api.get("borrowings/summary/"),
            ]);

            const borrowingData =
                borrowingsResponse.data;

            setDashboard(
                dashboardResponse.data
            );

            setBorrowings(
                Array.isArray(borrowingData)
                    ? borrowingData
                    : borrowingData.results || []
            );

            setSummary(
                summaryResponse.data
            );
        } catch (error) {
            console.error(
                "Failed to load statistics:",
                error
            );

            toast.error(
                "Unable to load statistics."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    const monthlyData = useMemo(() => {
        const contributions =
            dashboard?.contributions || [];

        const grouped = {};

        contributions.forEach((item) => {
            const date =
                item.transaction_date ||
                item.date;

            if (!date) {
                return;
            }

            const month = date.slice(0, 7);

            if (!grouped[month]) {
                grouped[month] = 0;
            }

            grouped[month] += Number(
                item.amount || 0
            );
        });

        return Object.entries(grouped)
            .sort(([a], [b]) =>
                a.localeCompare(b)
            )
            .slice(-6)
            .map(([month, amount]) => ({
                month,
                label: getMonthLabel(month),
                amount,
            }));
    }, [dashboard]);

    const maxMonthlyAmount = Math.max(
        ...monthlyData.map(
            (item) => item.amount
        ),
        1
    );

    const transactionBreakdown = useMemo(() => {
        const contributions =
            dashboard?.contributions || [];

        let deposits = 0;
        let transfers = 0;

        contributions.forEach((item) => {
            const amount = Number(
                item.amount || 0
            );

            if (
                item.transaction_type ===
                "TRANSFER"
            ) {
                transfers += amount;
            } else {
                deposits += amount;
            }
        });

        return {
            deposits,
            transfers,
            total: deposits + transfers,
        };
    }, [dashboard]);

    const progress = Number(
        dashboard?.progress_percentage || 0
    );

    const availableSavings = Number(
        dashboard?.available_savings ??
            dashboard?.total_saved ??
            0
    );

    const totalContributed = Number(
        dashboard?.total_contributed ??
            dashboard?.total_saved ??
            0
    );

    const borrowedFromFund = Number(
        dashboard?.borrowed_from_fund ??
            summary?.remaining_amount ??
            0
    );

    const totalRepaid = Number(
        summary?.total_repaid || 0
    );

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="material-symbols-rounded animate-spin text-[22px]">
                        progress_activity
                    </span>

                    Loading statistics...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                            Statistics
                        </h1>

                        <p className="text-xs text-slate-500">
                            Your shared housing fund overview
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchStatistics(true)
                        }
                        disabled={refreshing}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                        aria-label="Refresh statistics"
                    >
                        <span
                            className={`material-symbols-rounded ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        >
                            refresh
                        </span>
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
                {/* Main fund overview */}
                <section className="overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-7">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Available housing fund
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                                {formatCurrency(
                                    availableSavings
                                )}
                            </p>

                            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                                The amount currently available
                                after accounting for outstanding
                                borrowings from the shared fund.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 px-4 py-3">
                            <p className="text-xs text-slate-400">
                                Fund progress
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {progress.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-white transition-all"
                            style={{
                                width: `${Math.min(
                                    progress,
                                    100
                                )}%`,
                            }}
                        />
                    </div>
                </section>

                {/* Stat cards */}
                <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                    <StatCard
                        icon="account_balance_wallet"
                        label="Available"
                        value={formatCurrency(
                            availableSavings
                        )}
                        description="Currently usable fund"
                    />

                    <StatCard
                        icon="savings"
                        label="Contributed"
                        value={formatCurrency(
                            totalContributed
                        )}
                        description="Total money added"
                    />

                    <StatCard
                        icon="payments"
                        label="Borrowed"
                        value={formatCurrency(
                            borrowedFromFund
                        )}
                        description="Still out of the fund"
                        iconClass="bg-amber-50 text-amber-600"
                    />

                    <StatCard
                        icon="check_circle"
                        label="Repaid"
                        value={formatCurrency(
                            totalRepaid
                        )}
                        description="Returned to the fund"
                        iconClass="bg-emerald-50 text-emerald-600"
                    />
                </section>

                {/* Monthly contributions */}
                <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Contribution activity
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Contributions over the latest
                                months
                            </p>
                        </div>

                        <span className="material-symbols-rounded text-slate-400">
                            monitoring
                        </span>
                    </div>

                    {monthlyData.length === 0 ? (
                        <div className="mt-5">
                            <EmptyChart
                                icon="bar_chart"
                                title="No contribution data yet"
                                description="Add housing fund contributions to see your monthly activity."
                            />
                        </div>
                    ) : (
                        <div className="mt-6">
                            <div className="flex h-52 items-end gap-3 overflow-x-auto pb-7">
                                {monthlyData.map(
                                    (item) => {
                                        const height =
                                            Math.max(
                                                (item.amount /
                                                    maxMonthlyAmount) *
                                                    100,
                                                6
                                            );

                                        return (
                                            <div
                                                key={
                                                    item.month
                                                }
                                                className="flex h-full min-w-[52px] flex-1 flex-col items-center justify-end gap-2"
                                            >
                                                <div className="flex w-full flex-1 items-end justify-center">
                                                    <div
                                                        className="w-full max-w-12 rounded-t-xl bg-slate-900 transition-all"
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                        title={`${item.label}: ${formatCurrency(
                                                            item.amount
                                                        )}`}
                                                    />
                                                </div>

                                                <span className="text-[10px] text-slate-400">
                                                    {
                                                        item.label
                                                    }
                                                </span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Fund composition */}
                <section className="mt-5 grid gap-5 lg:grid-cols-2">
                    {/* Transaction breakdown */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Contribution breakdown
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Money added to the fund
                                </p>
                            </div>

                            <span className="material-symbols-rounded text-slate-400">
                                pie_chart
                            </span>
                        </div>

                        {transactionBreakdown.total <=
                        0 ? (
                            <div className="mt-5">
                                <EmptyChart
                                    icon="pie_chart"
                                    title="No contribution data"
                                    description="Your deposit and transfer breakdown will appear here."
                                />
                            </div>
                        ) : (
                            <div className="mt-6 space-y-5">
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            Deposits
                                        </span>

                                        <span className="font-semibold text-slate-900">
                                            {formatCurrency(
                                                transactionBreakdown.deposits
                                            )}
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-slate-900"
                                            style={{
                                                width: `${
                                                    transactionBreakdown.total
                                                        ? (transactionBreakdown.deposits /
                                                              transactionBreakdown.total) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            Transfers
                                        </span>

                                        <span className="font-semibold text-slate-900">
                                            {formatCurrency(
                                                transactionBreakdown.transfers
                                            )}
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-slate-500"
                                            style={{
                                                width: `${
                                                    transactionBreakdown.total
                                                        ? (transactionBreakdown.transfers /
                                                              transactionBreakdown.total) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Borrowing overview */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Borrowing overview
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Money currently outside the fund
                                </p>
                            </div>

                            <span className="material-symbols-rounded text-slate-400">
                                account_balance
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-2">
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                    Active
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-900">
                                    {summary?.active_count ||
                                        0}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-amber-50 p-3">
                                <p className="text-xs text-amber-700">
                                    Overdue
                                </p>

                                <p className="mt-1 text-xl font-bold text-amber-900">
                                    {summary?.overdue_count ||
                                        0}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-3">
                                <p className="text-xs text-emerald-700">
                                    Paid
                                </p>

                                <p className="mt-1 text-xl font-bold text-emerald-900">
                                    {summary?.paid_count ||
                                        0}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-500">
                                    Still out of fund
                                </span>

                                <span className="font-semibold text-slate-900">
                                    {formatCurrency(
                                        summary?.remaining_amount
                                    )}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-500">
                                    Total repaid
                                </span>

                                <span className="font-semibold text-emerald-700">
                                    {formatCurrency(
                                        totalRepaid
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Borrowing list */}
                <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Borrowing activity
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Current and recent shared-fund
                                borrowings
                            </p>
                        </div>

                        <span className="material-symbols-rounded text-slate-400">
                            receipt_long
                        </span>
                    </div>

                    {borrowings.length === 0 ? (
                        <div className="mt-5">
                            <EmptyChart
                                icon="account_balance"
                                title="No borrowings yet"
                                description="Borrowing activity will appear here when money is taken from the shared fund."
                            />
                        </div>
                    ) : (
                        <div className="mt-5 divide-y divide-slate-100">
                            {borrowings
                                .slice(0, 6)
                                .map(
                                    (borrowing) => {
                                        const remaining =
                                            Number(
                                                borrowing.remaining_amount ||
                                                    0
                                            );

                                        const amount =
                                            Number(
                                                borrowing.amount ||
                                                    0
                                            );

                                        const percentage =
                                            amount >
                                            0
                                                ? Math.min(
                                                      (Number(
                                                          borrowing.total_repaid ||
                                                              0
                                                      ) /
                                                          amount) *
                                                          100,
                                                      100
                                                  )
                                                : 0;

                                        return (
                                            <div
                                                key={
                                                    borrowing.id
                                                }
                                                className="py-4 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-900">
                                                            {borrowing
                                                                .borrower
                                                                ?.username ||
                                                                "Borrowing"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {formatDate(
                                                                borrowing.borrowed_date
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-semibold text-slate-900">
                                                            {formatCurrency(
                                                                remaining
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            remaining
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-slate-900"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}