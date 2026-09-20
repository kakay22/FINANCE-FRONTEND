import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    if (!value) {
        return "—";
    }

    return new Date(
        `${value}T00:00:00`
    ).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getStatusLabel(status) {
    switch (status) {
        case "PAID":
            return "Paid";

        case "OVERDUE":
            return "Overdue";

        default:
            return "Active";
    }
}

function getStatusClasses(status) {
    switch (status) {
        case "PAID":
            return "bg-emerald-50 text-emerald-700";

        case "OVERDUE":
            return "bg-red-50 text-red-700";

        default:
            return "bg-amber-50 text-amber-700";
    }
}

export default function Borrowings() {
    const navigate = useNavigate();

    const [borrowings, setBorrowings] =
        useState([]);

    const [summary, setSummary] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState("ALL");

    const [deleteId, setDeleteId] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);

    const fetchData = async (
        showRefresh = false
    ) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [
                borrowingsResponse,
                summaryResponse,
            ] = await Promise.all([
                api.get("borrowings/"),
                api.get("borrowings/summary/"),
            ]);

            const borrowingData =
                borrowingsResponse.data;

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
                "Failed to load borrowings:",
                error
            );

            toast.error(
                "Unable to load borrowings."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredBorrowings = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return borrowings.filter(
            (borrowing) => {
                const matchesFilter =
                    filter === "ALL" ||
                    borrowing.status === filter;

                if (!matchesFilter) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                return [
                    borrowing.borrower?.username,
                    borrowing.lender?.username,
                    borrowing.reason,
                    borrowing.notes,
                    borrowing.status,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(query)
                    );
            }
        );
    }, [
        borrowings,
        search,
        filter,
    ]);

    const handleDelete = async () => {
        if (!deleteId) {
            return;
        }

        try {
            setDeleting(true);

            await api.delete(
                `borrowings/${deleteId}/`
            );

            setBorrowings((current) =>
                current.filter(
                    (borrowing) =>
                        borrowing.id !==
                        deleteId
                )
            );

            toast.success(
                "Borrowing deleted."
            );

            setDeleteId(null);

            fetchData(true);
        } catch (error) {
            console.error(
                "Delete borrowing error:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Unable to delete borrowing."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                            Borrowing
                        </h1>

                        <p className="text-xs text-slate-500">
                            Track money borrowed between you
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                fetchData(true)
                            }
                            disabled={refreshing}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                            aria-label="Refresh"
                        >
                            <span
                                className={`material-symbols-rounded ${refreshing
                                    ? "animate-spin"
                                    : ""
                                    }`}
                            >
                                refresh
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/borrowings/new"
                                )
                            }
                            className="flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <span className="material-symbols-rounded text-lg">
                                add
                            </span>

                            <span className="hidden sm:inline">
                                Add
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">

                {/* Savings impact */}
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">
                            Borrowed from savings
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatCurrency(
                                summary?.total_borrowed
                            )}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                            Total recorded
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">
                            Still outside savings
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatCurrency(
                                summary?.remaining_amount
                            )}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                            Not yet repaid
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">
                            Active
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                            {summary?.active_count || 0}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                            Open borrowings
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">
                            Overdue
                        </p>

                        <p className="mt-1 text-lg font-bold text-red-600">
                            {summary?.overdue_count || 0}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                            Past due date
                        </p>
                    </div>
                </section>

                {/* Search */}
                <section className="mt-5 space-y-3">
                    <div className="relative">
                        <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                            search
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search borrowings..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            ["ALL", "All"],
                            ["ACTIVE", "Active"],
                            ["OVERDUE", "Overdue"],
                            ["PAID", "Paid"],
                        ].map(
                            ([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        setFilter(
                                            value
                                        )
                                    }
                                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${filter ===
                                        value
                                        ? "bg-slate-900 text-white"
                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    {label}
                                </button>
                            )
                        )}
                    </div>
                </section>

                {/* Loading */}
                {loading && (
                    <div className="flex min-h-64 items-center justify-center">
                        <span className="material-symbols-rounded animate-spin text-3xl text-slate-400">
                            progress_activity
                        </span>
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    filteredBorrowings.length ===
                    0 && (
                        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                <span className="material-symbols-rounded text-2xl text-slate-400">
                                    account_balance_wallet
                                </span>
                            </div>

                            <h2 className="mt-4 font-semibold text-slate-900">
                                No borrowings found
                            </h2>

                            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                                Record money borrowed or lent between your shared accounts.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/borrowings/new"
                                    )
                                }
                                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <span className="material-symbols-rounded text-lg">
                                    add
                                </span>

                                Add Borrowing
                            </button>
                        </div>
                    )}

                {/* Mobile */}
                {!loading &&
                    filteredBorrowings.length >
                    0 && (
                        <div className="mt-5 space-y-3 md:hidden">
                            {filteredBorrowings.map(
                                (borrowing) => {
                                    const currentUser =
                                        JSON.parse(
                                            localStorage.getItem("user")
                                        ) || null;

                                    const isBorrower =
                                        borrowing.borrower?.id ===
                                        currentUser?.id;

                                    return (
                                        <div
                                            key={
                                                borrowing.id
                                            }
                                            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                                            <span className="material-symbols-rounded text-slate-600">
                                                                account_balance_wallet
                                                            </span>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-slate-900">
                                                                {isBorrower
                                                                    ? `Borrowed from ${borrowing
                                                                        .lender
                                                                        ?.username ||
                                                                    "Unknown"
                                                                    }`
                                                                    : `Lent to ${borrowing
                                                                        .borrower
                                                                        ?.username ||
                                                                    "Unknown"
                                                                    }`}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                {formatDate(
                                                                    borrowing.borrowed_date
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                        borrowing.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        borrowing.status
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-2xl font-bold tracking-tight text-slate-900">
                                                    {formatCurrency(
                                                        borrowing.amount
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Due{" "}
                                                    {formatDate(
                                                        borrowing.due_date
                                                    )}
                                                </p>
                                            </div>

                                            {/* Progress */}
                                            <div className="mt-4">
                                                <div className="mb-1.5 flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">
                                                        Repaid
                                                    </span>

                                                    <span className="font-medium text-slate-700">
                                                        {Number(
                                                            borrowing.repayment_percentage ||
                                                            0
                                                        ).toFixed(
                                                            0
                                                        )}
                                                        %
                                                    </span>
                                                </div>

                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-slate-900 transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                Number(
                                                                    borrowing.repayment_percentage ||
                                                                    0
                                                                ),
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>

                                                <div className="mt-2 flex justify-between text-xs text-slate-400">
                                                    <span>
                                                        Repaid{" "}
                                                        {formatCurrency(
                                                            borrowing.total_repaid
                                                        )}
                                                    </span>

                                                    <span>
                                                        Remaining{" "}
                                                        {formatCurrency(
                                                            borrowing.remaining_amount
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {borrowing.reason && (
                                                <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                                                    {
                                                        borrowing.reason
                                                    }
                                                </p>
                                            )}

                                            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/borrowings/${borrowing.id}`
                                                        )
                                                    }
                                                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                                                >
                                                    <span className="material-symbols-rounded text-lg">
                                                        visibility
                                                    </span>

                                                    Details
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/borrowings/${borrowing.id}/edit`
                                                        )
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                                                    aria-label="Edit"
                                                >
                                                    <span className="material-symbols-rounded">
                                                        edit
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteId(
                                                            borrowing.id
                                                        )
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                                                    aria-label="Delete"
                                                >
                                                    <span className="material-symbols-rounded">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}

                {/* Desktop */}
                {!loading &&
                    filteredBorrowings.length >
                    0 && (
                        <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Borrowing
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Amount
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Due
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Progress
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredBorrowings.map(
                                            (
                                                borrowing
                                            ) => (
                                                <tr
                                                    key={
                                                        borrowing.id
                                                    }
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-slate-900">
                                                            {
                                                                borrowing
                                                                    .borrower
                                                                    ?.username
                                                            }{" "}
                                                            →{" "}
                                                            {
                                                                borrowing
                                                                    .lender
                                                                    ?.username
                                                            }
                                                        </p>

                                                        {borrowing.reason && (
                                                            <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                                                {
                                                                    borrowing.reason
                                                                }
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-slate-900">
                                                        {formatCurrency(
                                                            borrowing.amount
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-500">
                                                        {formatDate(
                                                            borrowing.due_date
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="w-32">
                                                            <div className="mb-1 flex justify-between text-xs">
                                                                <span className="text-slate-400">
                                                                    {
                                                                        borrowing.repayment_percentage
                                                                    }
                                                                    %
                                                                </span>

                                                                <span className="text-slate-500">
                                                                    {formatCurrency(
                                                                        borrowing.remaining_amount
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className="h-full rounded-full bg-slate-900"
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            Number(
                                                                                borrowing.repayment_percentage ||
                                                                                0
                                                                            ),
                                                                            100
                                                                        )}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                                borrowing.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                borrowing.status
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/borrowings/${borrowing.id}`
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                                                            >
                                                                <span className="material-symbols-rounded text-lg">
                                                                    visibility
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/borrowings/${borrowing.id}/edit`
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                                                            >
                                                                <span className="material-symbols-rounded text-lg">
                                                                    edit
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteId(
                                                                        borrowing.id
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
                                                            >
                                                                <span className="material-symbols-rounded text-lg">
                                                                    delete
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
            </main>

            {/* Delete drawer / modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Close delete confirmation"
                        onClick={() => setDeleteId(null)}
                        disabled={deleting}
                        className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Mobile bottom drawer / Desktop centered modal */}
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
                        {/* Drawer handle - mobile only */}
                        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

                        {/* Icon */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                            <span className="material-symbols-rounded text-[24px] text-red-500">
                                delete
                            </span>
                        </div>

                        {/* Content */}
                        <h2 className="mt-4 text-lg font-semibold text-slate-900">
                            Delete borrowing?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            This borrowing and its repayment records will be
                            permanently removed.
                        </p>

                        {/* Actions */}
                        <div className="mt-6 space-y-2.5 sm:flex sm:gap-3 sm:space-y-0">
                            <button
                                type="button"
                                onClick={() => setDeleteId(null)}
                                disabled={deleting}
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
                                onClick={handleDelete}
                                disabled={deleting}
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
                                {deleting ? (
                                    <>
                                        <span className="material-symbols-rounded animate-spin text-[19px]">
                                            progress_activity
                                        </span>

                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded text-[19px]">
                                            delete
                                        </span>

                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}