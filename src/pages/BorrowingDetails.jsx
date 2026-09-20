import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
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

function Loading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="material-symbols-outlined animate-spin text-[22px]">
                    progress_activity
                </span>
                Loading borrowing...
            </div>
        </div>
    );
}

export default function BorrowingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [borrowing, setBorrowing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const fetchBorrowing = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                `borrowings/${id}/`
            );

            setBorrowing(response.data);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                    "Unable to load borrowing."
            );

            navigate("/borrowings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrowing();
    }, [id]);

    const progress = useMemo(() => {
        if (!borrowing) return 0;

        return Math.min(
            Number(borrowing.repayment_percentage || 0),
            100
        );
    }, [borrowing]);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Delete this borrowing?\n\nAny repayment records attached to it will also be removed."
        );

        if (!confirmed) return;

        try {
            setDeleting(true);

            await api.delete(
                `borrowings/${id}/`
            );

            toast.success(
                "Borrowing deleted."
            );

            navigate("/borrowings");
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                    "Unable to delete borrowing."
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!borrowing) {
        return null;
    }

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-5 pb-24 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <button
                        type="button"
                        onClick={() => navigate("/borrowings")}
                        className="mb-3 flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_back
                        </span>
                        Borrowings
                    </button>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                        Borrowing details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Money currently taken from the shared housing fund.
                    </p>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                    <Link
                        to={`/borrowings/${id}/edit`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        <span className="material-symbols-outlined text-[19px]">
                            edit
                        </span>
                        Edit
                    </Link>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[19px]">
                            delete
                        </span>
                        Delete
                    </button>
                </div>
            </div>

            {/* Main amount card */}
            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="p-5 sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Borrowed from shared fund
                            </p>

                            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
                                {formatCurrency(
                                    borrowing.amount
                                )}
                            </p>
                        </div>

                        <span
                            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                                borrowing.status
                            )}`}
                        >
                            {borrowing.status}
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="mt-7">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-600">
                                Repayment progress
                            </span>

                            <span className="font-semibold text-gray-900">
                                {progress.toFixed(0)}%
                            </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gray-900 transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Amount stats */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                                Original amount
                            </p>
                            <p className="mt-1 text-lg font-bold text-gray-950">
                                {formatCurrency(
                                    borrowing.amount
                                )}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                                Total repaid
                            </p>
                            <p className="mt-1 text-lg font-bold text-emerald-700">
                                {formatCurrency(
                                    borrowing.total_repaid
                                )}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                                Still out of fund
                            </p>
                            <p className="mt-1 text-lg font-bold text-amber-700">
                                {formatCurrency(
                                    borrowing.remaining_amount
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* People + dates */}
            <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                            <span className="material-symbols-outlined text-gray-700">
                                group
                            </span>
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-950">
                                People
                            </h2>
                            <p className="text-xs text-gray-500">
                                Fund transaction participants
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Borrower
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                                {borrowing.borrower?.username ||
                                    "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Fund account
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                                {borrowing.lender?.username ||
                                    "Shared fund"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                            <span className="material-symbols-outlined text-gray-700">
                                calendar_month
                            </span>
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-950">
                                Schedule
                            </h2>
                            <p className="text-xs text-gray-500">
                                Borrowing dates
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Borrowed date
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                                {formatDate(
                                    borrowing.borrowed_date
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                Due date
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                                {formatDate(
                                    borrowing.due_date
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reason / notes */}
            {(borrowing.reason || borrowing.notes) && (
                <section className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    {borrowing.reason && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Reason
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                {borrowing.reason}
                            </p>
                        </div>
                    )}

                    {borrowing.notes && (
                        <div
                            className={
                                borrowing.reason
                                    ? "mt-5 border-t border-gray-100 pt-5"
                                    : ""
                            }
                        >
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Notes
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                {borrowing.notes}
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* Repayments */}
            <section className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5">
                    <div>
                        <h2 className="font-semibold text-gray-950">
                            Repayments
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Each repayment returns money to the shared fund.
                        </p>
                    </div>

                    {borrowing.status !== "PAID" && (
                        <Link
                            to={`/borrowings/${id}/repay`}
                            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <span className="material-symbols-outlined text-[19px]">
                                add
                            </span>
                            <span className="hidden sm:inline">
                                Add repayment
                            </span>
                            <span className="sm:hidden">
                                Repay
                            </span>
                        </Link>
                    )}
                </div>

                {borrowing.repayments?.length ? (
                    <div className="divide-y divide-gray-100">
                        {borrowing.repayments.map(
                            (repayment) => (
                                <div
                                    key={repayment.id}
                                    className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(
                                                repayment.amount
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(
                                                repayment.repayment_date
                                            )}
                                        </p>

                                        {repayment.bank_reference && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                Ref:{" "}
                                                {
                                                    repayment.bank_reference
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {repayment.notes && (
                                        <p className="text-sm text-gray-500 sm:max-w-xs sm:text-right">
                                            {repayment.notes}
                                        </p>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                            <span className="material-symbols-outlined text-gray-500">
                                payments
                            </span>
                        </div>

                        <p className="mt-3 font-medium text-gray-900">
                            No repayments yet
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            The full amount is still out of the shared fund.
                        </p>
                    </div>
                )}
            </section>

            {/* Mobile actions */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
                <Link
                    to={`/borrowings/${id}/edit`}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm"
                >
                    <span className="material-symbols-outlined text-[19px]">
                        edit
                    </span>
                    Edit
                </Link>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[19px]">
                        delete
                    </span>
                    Delete
                </button>
            </div>
        </div>
    );
}