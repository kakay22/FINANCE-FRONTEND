import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

export default function EditTransaction() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingProof, setUploadingProof] = useState(false);

    const [transaction, setTransaction] =
        useState(null);

    const [form, setForm] = useState({
        amount: "",
        transaction_type: "DEPOSIT",
        transaction_date: "",
        bank_reference: "",
        notes: "",
    });

    const [proofFile, setProofFile] = useState(null);

    useEffect(() => {
        fetchTransaction();
    }, [id]);

    const fetchTransaction = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                `savings/transactions/${id}/`
            );

            const data = response.data;

            setTransaction(data);

            setForm({
                amount: data.amount || "",
                transaction_type:
                    data.transaction_type ||
                    "DEPOSIT",
                transaction_date:
                    data.transaction_date || "",
                bank_reference:
                    data.bank_reference || "",
                notes: data.notes || "",
            });
        } catch (error) {
            console.error(
                "Failed to load transaction:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                    "Unable to load transaction."
            );

            navigate("/transactions");
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
            toast.error(
                "Proof file must not exceed 10 MB."
            );

            event.target.value = "";
            return;
        }

        setProofFile(file);
    };

    const removeSelectedFile = () => {
        setProofFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const amount = Number(form.amount);

        if (!form.amount || Number.isNaN(amount)) {
            toast.error("Please enter an amount.");
            return;
        }

        if (amount <= 0) {
            toast.error(
                "Amount must be greater than zero."
            );
            return;
        }

        if (!form.transaction_date) {
            toast.error(
                "Please select a transaction date."
            );
            return;
        }

        try {
            setSaving(true);

            await api.patch(
                `savings/transactions/${id}/`,
                {
                    transaction_type:
                        form.transaction_type,
                    amount: form.amount,
                    transaction_date:
                        form.transaction_date,
                    bank_reference:
                        form.bank_reference.trim(),
                    notes: form.notes.trim(),
                }
            );

            /*
             * The backend currently allows one proof
             * per transaction.
             *
             * If there is already proof, don't attempt
             * to upload another one.
             */
            if (
                proofFile &&
                !transaction?.proof
            ) {
                setUploadingProof(true);

                const proofData = new FormData();

                proofData.append(
                    "file",
                    proofFile
                );

                await api.post(
                    `savings/transactions/${id}/proof/`,
                    proofData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                setUploadingProof(false);
            }

            toast.success(
                "Transaction updated successfully."
            );

            navigate("/transactions");
        } catch (error) {
            console.error(
                "Update transaction error:",
                error
            );

            setUploadingProof(false);

            const data = error.response?.data;

            if (data?.amount) {
                toast.error(
                    Array.isArray(data.amount)
                        ? data.amount[0]
                        : data.amount
                );
            } else if (data?.transaction_date) {
                toast.error(
                    Array.isArray(
                        data.transaction_date
                    )
                        ? data.transaction_date[0]
                        : data.transaction_date
                );
            } else if (data?.detail) {
                toast.error(data.detail);
            } else {
                toast.error(
                    "Unable to update transaction."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <span className="material-symbols-rounded animate-spin text-3xl text-slate-400">
                    progress_activity
                </span>
            </div>
        );
    }

    if (!transaction) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/transactions")
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-rounded">
                            arrow_back
                        </span>
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-semibold text-slate-900">
                            Edit Transaction
                        </h1>

                        <p className="text-xs text-slate-500">
                            Update your contribution details
                        </p>
                    </div>
                </div>
            </header>

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
                                Update the amount saved.
                            </p>
                        </div>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-400">
                                ₱
                            </span>

                            <input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                inputMode="decimal"
                                className="h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-3xl font-semibold tracking-tight text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
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
                                Update the information for this contribution.
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
                                    maxLength={150}
                                    placeholder="e.g. GCash reference number"
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
                                    rows={4}
                                    placeholder="Add a note..."
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
                                Keep a record of your payment proof.
                            </p>
                        </div>

                        {transaction.proof ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
                                    <span className="material-symbols-rounded">
                                        attach_file
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800">
                                        Proof attached
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        This transaction already has a proof file.
                                    </p>
                                </div>

                                <a
                                    href={
                                        transaction.proof
                                            .file
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    <span className="material-symbols-rounded text-lg">
                                        open_in_new
                                    </span>

                                    View
                                </a>
                            </div>
                        ) : (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={
                                        handleFileChange
                                    }
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
                                            Add proof
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
                                                {
                                                    proofFile.name
                                                }
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {(
                                                    proofFile.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(
                                                    2
                                                )}{" "}
                                                MB
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                removeSelectedFile
                                            }
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                                        >
                                            <span className="material-symbols-rounded">
                                                close
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* Save */}
                    <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                        <button
                            type="submit"
                            disabled={
                                saving ||
                                uploadingProof
                            }
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ||
                            uploadingProof ? (
                                <>
                                    <span className="material-symbols-rounded animate-spin text-xl">
                                        progress_activity
                                    </span>

                                    {uploadingProof
                                        ? "Uploading proof..."
                                        : "Saving..."}
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-rounded text-xl">
                                        check
                                    </span>

                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}