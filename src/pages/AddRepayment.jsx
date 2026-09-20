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

export default function AddRepayment() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [borrowing, setBorrowing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        repayment_date:
            new Date().toISOString().split("T")[0],
        bank_reference: "",
        notes: "",
    });

    useEffect(() => {
        const loadBorrowing = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    `borrowings/${id}/`
                );

                setBorrowing(response.data);

                // Pre-fill the maximum possible repayment.
                setForm((current) => ({
                    ...current,
                    amount:
                        response.data.remaining_amount ||
                        "",
                }));
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

    const remainingAmount = Number(
        borrowing?.remaining_amount || 0
    );

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleUseRemaining = () => {
        setForm((current) => ({
            ...current,
            amount: String(
                remainingAmount.toFixed(2)
            ),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const amount = Number(form.amount);

        if (!amount || amount <= 0) {
            toast.error(
                "Enter a valid repayment amount."
            );
            return;
        }

        if (amount > remainingAmount) {
            toast.error(
                `Repayment cannot exceed ${formatCurrency(
                    remainingAmount
                )}.`
            );
            return;
        }

        if (!form.repayment_date) {
            toast.error(
                "Select the repayment date."
            );
            return;
        }

        try {
            setSaving(true);

            await api.post(
                `borrowings/${id}/repayments/`,
                {
                    amount: form.amount,
                    repayment_date:
                        form.repayment_date,
                    bank_reference:
                        form.bank_reference,
                    notes: form.notes,
                }
            );

            toast.success(
                "Repayment recorded. The shared fund has been restored."
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
                        "Unable to record repayment."
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

    if (remainingAmount <= 0) {
        return (
            <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/borrowings/${id}`
                        )
                    }
                    className="mb-5 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        arrow_back
                    </span>

                    Borrowing details
                </button>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                        <span className="material-symbols-outlined text-[28px] text-emerald-600">
                            check_circle
                        </span>
                    </div>

                    <h1 className="mt-4 text-xl font-bold text-emerald-950">
                        Borrowing fully repaid
                    </h1>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-800">
                        This borrowing has no remaining balance.
                        The full amount has already returned to
                        the shared savings fund.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/borrowings/${id}`
                            )
                        }
                        className="mt-6 h-11 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                        Back to details
                    </button>
                </div>
            </div>
        );
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
                    Record repayment
                </h1>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                    Record money returned to the shared housing fund.
                </p>
            </div>

            {/* Balance card */}
            <section className="mb-4 overflow-hidden rounded-3xl bg-gray-950 p-5 text-white shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-400">
                            Still out of shared fund
                        </p>

                        <p className="mt-2 text-3xl font-bold tracking-tight">
                            {formatCurrency(
                                remainingAmount
                            )}
                        </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <span className="material-symbols-outlined text-[24px]">
                            account_balance
                        </span>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-xs text-gray-400">
                            Original
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                            {formatCurrency(
                                borrowing.amount
                            )}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-xs text-gray-400">
                            Already repaid
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                            {formatCurrency(
                                borrowing.total_repaid
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* Fund notice */}
            <div className="mb-4 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <span className="material-symbols-outlined shrink-0 text-[21px] text-emerald-600">
                    trending_up
                </span>

                <div>
                    <p className="text-sm font-semibold text-emerald-900">
                        Repayment restores the shared fund
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                        The amount you record here will increase the
                        available shared savings by the same amount.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                    {/* Amount */}
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label
                                htmlFor="amount"
                                className="block text-sm font-semibold text-gray-800"
                            >
                                Repayment amount
                            </label>

                            <button
                                type="button"
                                onClick={
                                    handleUseRemaining
                                }
                                className="text-xs font-semibold text-gray-600 transition hover:text-gray-950"
                            >
                                Pay remaining
                            </button>
                        </div>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                                ₱
                            </span>

                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                min="0.01"
                                max={remainingAmount}
                                step="0.01"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                                className="h-13 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-lg font-semibold text-gray-950 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                            />
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                            Maximum repayment:{" "}
                            <span className="font-semibold text-gray-700">
                                {formatCurrency(
                                    remainingAmount
                                )}
                            </span>
                        </p>
                    </div>

                    {/* Date */}
                    <div className="mt-5">
                        <label
                            htmlFor="repayment_date"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Repayment date
                        </label>

                        <input
                            id="repayment_date"
                            name="repayment_date"
                            type="date"
                            value={
                                form.repayment_date
                            }
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                        />
                    </div>

                    {/* Bank reference */}
                    <div className="mt-5">
                        <label
                            htmlFor="bank_reference"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Bank reference
                            <span className="ml-1 font-normal text-gray-400">
                                (optional)
                            </span>
                        </label>

                        <input
                            id="bank_reference"
                            name="bank_reference"
                            type="text"
                            value={
                                form.bank_reference
                            }
                            onChange={handleChange}
                            placeholder="e.g. GCash reference number"
                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                        />
                    </div>

                    {/* Notes */}
                    <div className="mt-5">
                        <label
                            htmlFor="notes"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Notes
                            <span className="ml-1 font-normal text-gray-400">
                                (optional)
                            </span>
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            rows={4}
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Add any additional details..."
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                        />
                    </div>
                </section>

                {/* Preview */}
                {Number(form.amount) > 0 && (
                    <section className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-500">
                                After this repayment
                            </span>

                            <span className="text-sm font-bold text-gray-950">
                                {formatCurrency(
                                    Math.max(
                                        remainingAmount -
                                            Number(
                                                form.amount
                                            ),
                                        0
                                    )
                                )}{" "}
                                remaining
                            </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
                            <span className="material-symbols-outlined text-[17px]">
                                add_circle
                            </span>

                            {formatCurrency(
                                form.amount
                            )}{" "}
                            will return to available savings
                        </div>
                    </section>
                )}

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
                                    payments
                                </span>

                                Record repayment
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}