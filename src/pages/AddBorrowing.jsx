import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

const initialForm = {
    borrower_id: "",
    lender_id: "",
    amount: "",
    borrowed_date: new Date().toISOString().split("T")[0],
    due_date: "",
    reason: "",
    notes: "",
};

export default function AddBorrowing() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const response = await api.get("savings/goal/");

            const goal = response.data;

            setMembers(goal.members || []);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                    "Unable to load shared members."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.borrower_id) {
            toast.error("Please select the borrower.");
            return;
        }

        if (!form.lender_id) {
            toast.error("Please select the lender.");
            return;
        }

        if (
            Number(form.borrower_id) ===
            Number(form.lender_id)
        ) {
            toast.error(
                "Borrower and lender must be different."
            );
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            toast.error(
                "Please enter a valid borrowing amount."
            );
            return;
        }

        if (!form.borrowed_date) {
            toast.error(
                "Please select the borrowing date."
            );
            return;
        }

        if (!form.due_date) {
            toast.error("Please select the due date.");
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

        setSaving(true);

        try {
            await api.post("borrowings/", {
                borrower_id: Number(form.borrower_id),
                lender_id: Number(form.lender_id),
                amount: Number(form.amount),
                borrowed_date: form.borrowed_date,
                due_date: form.due_date,
                reason: form.reason.trim(),
                notes: form.notes.trim(),
            });

            toast.success("Borrowing added successfully.");

            navigate("/borrowings");
        } catch (error) {
            console.error(error);

            const data = error.response?.data;

            if (data && typeof data === "object") {
                const firstError = Object.values(data)
                    .flat()
                    .find(Boolean);

                toast.error(
                    firstError ||
                        "Unable to create borrowing."
                );
            } else {
                toast.error(
                    "Unable to create borrowing."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-5">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8">

                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/borrowings")}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-rounded">
                            arrow_back
                        </span>
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Add Borrowing
                        </h1>

                        <p className="mt-0.5 text-sm text-slate-500">
                            Record money borrowed between you.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* People */}
                    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-slate-900">
                                People
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Choose who received the money and
                                who provided it.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="borrower_id"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Borrower
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        person
                                    </span>

                                    <select
                                        id="borrower_id"
                                        name="borrower_id"
                                        value={form.borrower_id}
                                        onChange={handleChange}
                                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                    >
                                        <option value="">
                                            Select borrower
                                        </option>

                                        {members.map((member) => (
                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.username}
                                            </option>
                                        ))}
                                    </select>

                                    <span className="material-symbols-rounded pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        expand_more
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                    <span className="material-symbols-rounded text-[18px]">
                                        swap_vert
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="lender_id"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Lender
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        account_balance_wallet
                                    </span>

                                    <select
                                        id="lender_id"
                                        name="lender_id"
                                        value={form.lender_id}
                                        onChange={handleChange}
                                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                    >
                                        <option value="">
                                            Select lender
                                        </option>

                                        {members.map((member) => (
                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.username}
                                            </option>
                                        ))}
                                    </select>

                                    <span className="material-symbols-rounded pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        expand_more
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Amount */}
                    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-slate-900">
                                Borrowing details
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Enter the amount and repayment timeline.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="amount"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Amount
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                                        ₱
                                    </span>

                                    <input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        inputMode="decimal"
                                        value={form.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-lg font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="borrowed_date"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Borrowed date
                                    </label>

                                    <input
                                        id="borrowed_date"
                                        name="borrowed_date"
                                        type="date"
                                        value={form.borrowed_date}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="due_date"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Due date
                                    </label>

                                    <input
                                        id="due_date"
                                        name="due_date"
                                        type="date"
                                        min={form.borrowed_date}
                                        value={form.due_date}
                                        onChange={handleChange}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Reason */}
                    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-slate-900">
                                Additional information
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Add context so the borrowing is easy
                                to understand later.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="reason"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Reason
                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>

                                <textarea
                                    id="reason"
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="e.g. Groceries, transportation, emergency..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="notes"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Notes
                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>

                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Add any additional details..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Info */}
                    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-100/70 p-4">
                        <span className="material-symbols-rounded mt-0.5 shrink-0 text-[20px] text-slate-500">
                            info
                        </span>

                        <p className="text-xs leading-5 text-slate-600">
                            Borrowings are tracked separately from
                            your housing savings. Adding a borrowing
                            will not increase or decrease your savings
                            balance.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/borrowings")
                            }
                            disabled={saving}
                            className="h-12 rounded-xl px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-rounded text-[19px]">
                                        add
                                    </span>
                                    Add Borrowing
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}