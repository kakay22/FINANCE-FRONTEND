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

function getTransactionIcon(type) {
    return type === "TRANSFER"
        ? "swap_horiz"
        : "savings";
}

function getTransactionLabel(type) {
    return type === "TRANSFER"
        ? "Transfer"
        : "Deposit";
}

export default function Transactions() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchTransactions = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await api.get(
                "savings/transactions/"
            );

            const data = response.data;

            setTransactions(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (error) {
            console.error(
                "Failed to load transactions:",
                error
            );

            toast.error(
                "Unable to load transactions."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return transactions.filter((transaction) => {
            const matchesFilter =
                filter === "ALL" ||
                transaction.transaction_type === filter;

            if (!matchesFilter) {
                return false;
            }

            if (!query) {
                return true;
            }

            return [
                transaction.user?.username,
                transaction.transaction_type,
                transaction.bank_reference,
                transaction.notes,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value)
                        .toLowerCase()
                        .includes(query)
                );
        });
    }, [transactions, search, filter]);

    const handleDelete = async () => {
        if (!deleteId) {
            return;
        }

        try {
            setDeleting(true);

            await api.delete(
                `savings/transactions/${deleteId}/`
            );

            setTransactions((current) =>
                current.filter(
                    (transaction) =>
                        transaction.id !== deleteId
                )
            );

            toast.success(
                "Transaction deleted."
            );

            setDeleteId(null);
        } catch (error) {
            console.error(
                "Delete transaction error:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Unable to delete transaction."
            );
        } finally {
            setDeleting(false);
        }
    };

    const totalFiltered = filteredTransactions.reduce(
        (total, transaction) =>
            total + Number(transaction.amount || 0),
        0
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                            Transactions
                        </h1>

                        <p className="text-xs text-slate-500">
                            Your housing fund activity
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchTransactions(true)
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
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">
                {/* Summary */}
                <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        {filter === "ALL"
                            ? "All transactions"
                            : `${getTransactionLabel(
                                filter
                            )}s`}
                    </p>

                    <div className="mt-1 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-2xl font-bold tracking-tight text-slate-900">
                                {filteredTransactions.length}
                            </p>

                            <p className="text-xs text-slate-400">
                                transaction
                                {filteredTransactions.length !==
                                    1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    totalFiltered
                                )}
                            </p>

                            <p className="text-xs text-slate-400">
                                displayed total
                            </p>
                        </div>
                    </div>
                </section>

                {/* Search + filters */}
                <section className="mb-5 space-y-3">
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
                            placeholder="Search transactions..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            ["ALL", "All"],
                            ["DEPOSIT", "Deposits"],
                            ["TRANSFER", "Transfers"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    setFilter(value)
                                }
                                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${filter === value
                                        ? "bg-slate-900 text-white"
                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
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
                    filteredTransactions.length ===
                    0 && (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                <span className="material-symbols-rounded text-2xl text-slate-400">
                                    receipt_long
                                </span>
                            </div>

                            <h2 className="mt-4 font-semibold text-slate-900">
                                No transactions found
                            </h2>

                            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                                {search
                                    ? "Try a different search."
                                    : "Add your first housing fund contribution to see it here."}
                            </p>

                            {!search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/add-money"
                                        )
                                    }
                                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    <span className="material-symbols-rounded text-lg">
                                        add
                                    </span>

                                    Add Money
                                </button>
                            )}
                        </div>
                    )}

                {/* Mobile cards */}
                {!loading &&
                    filteredTransactions.length >
                    0 && (
                        <div className="space-y-3 md:hidden">
                            {filteredTransactions.map(
                                (transaction) => (
                                    <div
                                        key={
                                            transaction.id
                                        }
                                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                                                <span className="material-symbols-rounded text-slate-600">
                                                    {getTransactionIcon(
                                                        transaction.transaction_type
                                                    )}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {getTransactionLabel(
                                                                transaction.transaction_type
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            {formatDate(
                                                                transaction.transaction_date
                                                            )}
                                                        </p>
                                                    </div>

                                                    <p className="shrink-0 font-semibold text-slate-900">
                                                        +
                                                        {formatCurrency(
                                                            transaction.amount
                                                        )}
                                                    </p>
                                                </div>

                                                {transaction.user
                                                    ?.username && (
                                                        <p className="mt-3 text-xs text-slate-500">
                                                            Added by{" "}
                                                            <span className="font-medium text-slate-700">
                                                                {
                                                                    transaction
                                                                        .user
                                                                        .username
                                                                }
                                                            </span>
                                                        </p>
                                                    )}

                                                {transaction.bank_reference && (
                                                    <p className="mt-1 truncate text-xs text-slate-400">
                                                        Ref:{" "}
                                                        {
                                                            transaction.bank_reference
                                                        }
                                                    </p>
                                                )}

                                                {transaction.notes && (
                                                    <p className="mt-2 text-sm text-slate-600">
                                                        {
                                                            transaction.notes
                                                        }
                                                    </p>
                                                )}

                                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        {transaction.proof && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-rounded text-base">
                                                                    attach_file
                                                                </span>
                                                                Proof attached
                                                            </span>
                                                        )}
                                                    </div>

                                                    {transaction.user && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/transactions/${transaction.id}/edit`
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                                                                aria-label="Edit transaction"
                                                            >
                                                                <span className="material-symbols-rounded text-lg">
                                                                    edit
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteId(
                                                                        transaction.id
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                                                                aria-label="Delete transaction"
                                                            >
                                                                <span className="material-symbols-rounded text-lg">
                                                                    delete
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                {/* Desktop table */}
                {!loading &&
                    filteredTransactions.length >
                    0 && (
                        <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Transaction
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                User
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Date
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Amount
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTransactions.map(
                                            (
                                                transaction
                                            ) => (
                                                <tr
                                                    key={
                                                        transaction.id
                                                    }
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                                                <span className="material-symbols-rounded text-slate-600">
                                                                    {getTransactionIcon(
                                                                        transaction.transaction_type
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <p className="font-medium text-slate-900">
                                                                    {getTransactionLabel(
                                                                        transaction.transaction_type
                                                                    )}
                                                                </p>

                                                                {transaction.bank_reference && (
                                                                    <p className="text-xs text-slate-400">
                                                                        Ref:{" "}
                                                                        {
                                                                            transaction.bank_reference
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {transaction
                                                            .user
                                                            ?.username ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-500">
                                                        {formatDate(
                                                            transaction.transaction_date
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                                                        +
                                                        {formatCurrency(
                                                            transaction.amount
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/transactions/${transaction.id}/edit`
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
                                                                        transaction.id
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
                            Delete transaction?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            This transaction and its proof will be
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