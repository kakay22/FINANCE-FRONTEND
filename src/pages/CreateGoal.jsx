import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

export default function CreateGoal() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        target_amount: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = form.name.trim();
        const targetAmount = Number(form.target_amount);

        if (!name) {
            toast.error("Please enter a goal name.");
            return;
        }

        if (!form.target_amount || targetAmount <= 0) {
            toast.error("Target amount must be greater than ₱0.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("savings/goal/", {
                name,
                target_amount: targetAmount.toFixed(2),
            });

            toast.success("Savings goal created successfully.");

            navigate(`/goals/${response.data.id}`);
        } catch (error) {
            console.error("Failed to create savings goal:", error);

            const detail =
                error.response?.data?.detail ||
                error.response?.data?.name?.[0] ||
                error.response?.data?.target_amount?.[0] ||
                "Failed to create savings goal.";

            toast.error(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8">

                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                    </button>

                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                            Create a savings goal
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Set a target and start building towards it.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

                    {/* Goal Icon */}
                    <div className="mb-7 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                            <span className="material-symbols-outlined text-[32px] text-gray-700">
                                savings
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Goal Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-gray-800"
                            >
                                Goal name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. New Laptop"
                                maxLength={150}
                                autoComplete="off"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                            />

                            <p className="mt-1.5 text-xs text-gray-400">
                                Choose a name that clearly describes what
                                you're saving for.
                            </p>
                        </div>

                        {/* Target Amount */}
                        <div>
                            <label
                                htmlFor="target_amount"
                                className="mb-2 block text-sm font-medium text-gray-800"
                            >
                                Target amount
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                                    ₱
                                </span>

                                <input
                                    id="target_amount"
                                    name="target_amount"
                                    type="number"
                                    value={form.target_amount}
                                    onChange={handleChange}
                                    placeholder="50,000.00"
                                    min="0.01"
                                    step="0.01"
                                    inputMode="decimal"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                                />
                            </div>

                            <p className="mt-1.5 text-xs text-gray-400">
                                This is the total amount you want to save.
                            </p>
                        </div>

                        {/* Preview */}
                        <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Goal preview
                            </p>

                            <div className="mt-3 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {form.name.trim() || "Your savings goal"}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Starting balance: ₱0.00
                                    </p>
                                </div>

                                <p className="shrink-0 text-base font-semibold text-gray-900">
                                    ₱
                                    {Number(form.target_amount || 0).toLocaleString(
                                        "en-PH",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">
                                        progress_activity
                                    </span>

                                    Creating goal...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">
                                        add
                                    </span>

                                    Create goal
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info */}
                <div className="mt-4 flex gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <span className="material-symbols-outlined shrink-0 text-[20px] text-gray-500">
                        info
                    </span>

                    <p className="text-xs leading-5 text-gray-500">
                        You can start adding money to this goal after it has
                        been created. Your progress will automatically update
                        as transactions are recorded.
                    </p>
                </div>
            </div>
        </div>
    );
}
