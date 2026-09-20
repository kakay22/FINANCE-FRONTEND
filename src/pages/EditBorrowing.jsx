import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
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

export default function EditBorrowing() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [borrowing, setBorrowing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        amount: "",
        borrowed_date: "",
        due_date: "",
        reason: "",
        notes: "",
    });

    useEffect(() => {
        const loadBorrowing = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    `borrowings/${id}/`
                );

                const data = response.data;

                setBorrowing(data);

                setForm({
                    amount: data.amount || "",
                    borrowed_date:
                        data.borrowed_date || "",
                    due_date:
                        data.due_date || "",
                    reason: data.reason || "",
                    notes: data.notes || "",
                });
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

        loadBorrowing();
    }, [id, navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.amount || Number(form.amount) <= 0) {
            toast.error(
                "Enter a valid borrowing amount."
            );
            return;
        }

        if (!form.borrowed_date) {
            toast.error(
                "Select the borrowed date."
            );
            return;
        }

        if (!form.due_date) {
            toast.error(
                "Select the due date."
            );
            return;
        }

        if (
            new Date(form.due_date) <
            new Date(form.borrowed_date)
        ) {
            toast.error(
                "Due date cannot be before the borrowed date."
            );
            return;
        }

        try {
            setSaving(true);

            await api.put(
                `borrowings/${id}/`,
                {
                    amount: form.amount,
                    borrowed_date:
                        form.borrowed_date,
                    due_date:
                        form.due_date,
                    reason: form.reason,
                    notes: form.notes,
                }
            );

            toast.success(
                "Borrowing updated."
            );

            navigate(`/borrowings/${id}`);
        } catch (error) {
            console.error(error);

            const data = error.response?.data;

            if (data?.amount) {
                toast.error(
                    Array.isArray(data.amount)
                        ? data.amount[0]
                        : data.amount
                );
            } else {
                toast.error(
                    data?.detail ||
                        "Unable to update borrowing."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!borrowing) {
        return null;
    }

    return (
        <div className="mx-auto w-full max-w-2xl px-4 py-5 pb-24 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/borrowings/${id}`
                        )
                    }
                    className="mb-3 flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        arrow_back
                    </span>
                    Borrowing details
                </button>

                <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                    Edit borrowing
                </h1>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                    Update the borrowing information.
                </p>
            </div>

            {/* Fund notice */}
            <div className="mb-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <span className="material-symbols-outlined shrink-0 text-[21px] text-amber-600">
                    account_balance
                </span>

                <div>
                    <p className="text-sm font-semibold text-amber-900">
                        Shared fund borrowing
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                        This amount is taken from the shared housing
                        savings. Increasing the outstanding amount
                        reduces the available fund.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                    {/* Participants */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                Borrower
                            </label>

                            <div className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                                <span className="material-symbols-outlined text-[19px] text-gray-400">
                                    person
                                </span>

                                {borrowing.borrower?.username ||
                                    "—"}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                Fund
                            </label>

                            <div className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                                <span className="material-symbols-outlined text-[19px] text-gray-400">
                                    account_balance
                                </span>

                                Shared housing fund
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="mb-5">
                        <label
                            htmlFor="amount"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Borrowed amount
                        </label>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                                ₱
                            </span>

                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.amount}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-base font-semibold text-gray-950 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                            />
                        </div>

                        {borrowing.remaining_amount && (
                            <p className="mt-2 text-xs text-gray-500">
                                Current outstanding amount:{" "}
                                <span className="font-semibold text-gray-700">
                                    {formatCurrency(
                                        borrowing.remaining_amount
                                    )}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="borrowed_date"
                                className="mb-2 block text-sm font-semibold text-gray-800"
                            >
                                Borrowed date
                            </label>

                            <input
                                id="borrowed_date"
                                name="borrowed_date"
                                type="date"
                                value={
                                    form.borrowed_date
                                }
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="due_date"
                                className="mb-2 block text-sm font-semibold text-gray-800"
                            >
                                Due date
                            </label>

                            <input
                                id="due_date"
                                name="due_date"
                                type="date"
                                value={form.due_date}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-5">
                        <label
                            htmlFor="reason"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Reason
                        </label>

                        <textarea
                            id="reason"
                            name="reason"
                            rows={4}
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Why was money taken from the shared fund?"
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                        />
                    </div>

                    {/* Notes */}
                    <div className="mt-5">
                        <label
                            htmlFor="notes"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Notes
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Optional notes"
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                        />
                    </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/borrowings/${id}`
                            )
                        }
                        disabled={saving}
                        className="h-12 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[19px]">
                                    progress_activity
                                </span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[19px]">
                                    save
                                </span>
                                Save changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}