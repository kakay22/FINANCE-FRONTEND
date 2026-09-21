import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

function formatCurrency(value) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(number);
}

function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatMoneyInput(value) {
    if (value === "") return "";

    // Remove commas and anything except numbers and decimal point
    const clean = value.replace(/,/g, "").replace(/[^\d.]/g, "");

    // Allow only one decimal point
    const parts = clean.split(".");
    const integerPart = parts[0] || "";
    const decimalPart = parts[1];

    // Add commas
    const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
    );

    if (decimalPart !== undefined) {
        return `${formattedInteger}.${decimalPart.slice(0, 2)}`;
    }

    return formattedInteger;
}

export default function AddMoney() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        amount: "",
        transaction_type: "DEPOSIT",
        transaction_date: getToday(),
        bank_reference: "",
        notes: "",
    });

    const [proofFile, setProofFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "amount") {
            setForm((prev) => ({
                ...prev,
                amount: formatMoneyInput(value),
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                "Only JPG, PNG, WEBP, and PDF files are allowed."
            );

            event.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Proof file must not exceed 10 MB.");

            event.target.value = "";
            return;
        }

        setProofFile(file);
    };

    const removeProof = () => {
        setProofFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Remove display formatting before sending to backend
        const rawAmount = form.amount
            .replace(/,/g, "")
            .trim();

        const amount = Number(rawAmount);

        if (!rawAmount || Number.isNaN(amount)) {
            toast.error("Please enter an amount.");
            return;
        }

        if (amount <= 0) {
            toast.error("Amount must be greater than zero.");
            return;
        }

        if (!form.transaction_date) {
            toast.error("Please select a transaction date.");
            return;
        }

        try {
            setSubmitting(true);

            const transactionResponse = await api.post(
                "savings/transactions/",
                {
                    transaction_type:
                        form.transaction_type,

                    // Send the clean numeric value
                    amount: amount,

                    transaction_date:
                        form.transaction_date,

                    bank_reference:
                        form.bank_reference.trim(),

                    notes:
                        form.notes.trim(),
                }
            );

            const transaction =
                transactionResponse.data;

            /*
             * Upload proof separately after the
             * transaction has been successfully created.
             */
            if (proofFile) {
                const proofData = new FormData();

                proofData.append(
                    "file",
                    proofFile
                );

                await api.post(
                    `savings/transactions/${transaction.id}/proof/`,
                    proofData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );
            }

            toast.success(
                `${formatCurrency(amount)} added to your housing fund.`
            );

            navigate("/");
        } catch (error) {
            console.error(
                "Add money error:",
                error
            );

            const data = error.response?.data;

            if (data?.amount) {
                toast.error(
                    Array.isArray(data.amount)
                        ? data.amount[0]
                        : data.amount
                );
            } else if (data?.detail) {
                toast.error(data.detail);
            } else {
                toast.error(
                    "Unable to add the transaction. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-rounded">
                            arrow_back
                        </span>
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-semibold text-slate-900">
                            Add Money
                        </h1>

                        <p className="text-xs text-slate-500">
                            Record a housing fund contribution
                        </p>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:py-8">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Amount */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-500">
                                Contribution amount
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                How much are you adding?
                            </p>
                        </div>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-400">
                                ₱
                            </span>

                            <input
                                type="text"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                inputMode="decimal"
                                className="h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-3xl font-bold tracking-tight text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                                autoFocus
                            />
                        </div>
                    </section>

                    {/* Details */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="font-semibold text-slate-900">
                                Transaction details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Add the basic information for this contribution.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Type */}
                            <div>
                                <label
                                    htmlFor="transaction_type"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Transaction type
                                </label>

                                <select
                                    id="transaction_type"
                                    name="transaction_type"
                                    value={
                                        form.transaction_type
                                    }
                                    onChange={handleChange}
                                    className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                >
                                    <option value="DEPOSIT">
                                        Deposit
                                    </option>

                                    <option value="TRANSFER">
                                        Transfer
                                    </option>
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label
                                    htmlFor="transaction_date"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Transaction date
                                </label>

                                <input
                                    id="transaction_date"
                                    type="date"
                                    name="transaction_date"
                                    value={
                                        form.transaction_date
                                    }
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                />
                            </div>

                            {/* Bank reference */}
                            <div>
                                <label
                                    htmlFor="bank_reference"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Bank reference
                                    <span className="ml-1 font-normal text-slate-400">
                                        Optional
                                    </span>
                                </label>

                                <input
                                    id="bank_reference"
                                    type="text"
                                    name="bank_reference"
                                    value={
                                        form.bank_reference
                                    }
                                    onChange={handleChange}
                                    placeholder="e.g. GCash reference number"
                                    maxLength={150}
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label
                                    htmlFor="notes"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Notes
                                    <span className="ml-1 font-normal text-slate-400">
                                        Optional
                                    </span>
                                </label>

                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Add a note about this contribution..."
                                    rows={4}
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Proof */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-4">
                            <h2 className="font-semibold text-slate-900">
                                Proof of payment
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Upload a screenshot or PDF if you want to keep a record.
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {!proofFile ? (
                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-300 hover:bg-slate-100"
                            >
                                <span className="material-symbols-rounded mb-2 text-3xl text-slate-400">
                                    upload_file
                                </span>

                                <span className="text-sm font-medium text-slate-700">
                                    Upload proof
                                </span>

                                <span className="mt-1 text-xs text-slate-400">
                                    JPG, PNG, WEBP or PDF · Max 10 MB
                                </span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
                                    <span className="material-symbols-rounded">
                                        {proofFile.type ===
                                            "application/pdf"
                                            ? "picture_as_pdf"
                                            : "image"}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-800">
                                        {proofFile.name}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {(
                                            proofFile.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={removeProof}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                                    aria-label="Remove proof"
                                >
                                    <span className="material-symbols-rounded">
                                        close
                                    </span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Submit */}
                    <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <span className="material-symbols-rounded animate-spin text-xl">
                                        progress_activity
                                    </span>

                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-rounded text-xl">
                                        add
                                    </span>

                                    Add{" "}
                                    {form.amount
                                        ? formatCurrency(
                                            form.amount
                                        )
                                        : "Money"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}