import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Security() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const currentPassword =
            form.current_password.trim();

        const newPassword =
            form.new_password;

        const confirmPassword =
            form.confirm_password;

        if (!currentPassword) {
            toast.error(
                "Enter your current password."
            );
            return;
        }

        if (!newPassword) {
            toast.error(
                "Enter a new password."
            );
            return;
        }

        if (newPassword.length < 8) {
            toast.error(
                "New password must be at least 8 characters."
            );
            return;
        }

        if (!confirmPassword) {
            toast.error(
                "Confirm your new password."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(
                "New passwords do not match."
            );
            return;
        }

        if (
            currentPassword === newPassword
        ) {
            toast.error(
                "Your new password must be different from your current password."
            );
            return;
        }

        try {
            setChangingPassword(true);

            await api.patch(
                "auth/change-password/",
                {
                    current_password:
                        currentPassword,
                    new_password:
                        newPassword,
                    confirm_password:
                        confirmPassword,
                }
            );

            setForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            toast.success(
                "Password changed successfully."
            );
        } catch (error) {
            console.error(
                "Failed to change password:",
                error
            );

            const data =
                error?.response?.data;

            const message =
                data?.detail ||
                data?.current_password?.[0] ||
                data?.new_password?.[0] ||
                data?.confirm_password?.[0] ||
                "Unable to change your password.";

            toast.error(message);
        } finally {
            setChangingPassword(false);
        }
    };

    const passwordLength =
        form.new_password.length;

    const hasMinimumLength =
        passwordLength >= 8;

    const hasNumber =
        /\d/.test(form.new_password);

    const hasLetter =
        /[A-Za-z]/.test(
            form.new_password
        );

    const passwordsMatch =
        form.new_password.length > 0 &&
        form.new_password ===
            form.confirm_password;

    const PasswordToggle = ({
        visible,
        onClick,
        label,
    }) => (
        <button
            type="button"
            onClick={onClick}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label={label}
        >
            <span className="material-symbols-rounded text-[20px]">
                {visible
                    ? "visibility_off"
                    : "visibility"}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-rounded">
                            arrow_back
                        </span>
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                            Security
                        </h1>

                        <p className="truncate text-xs text-slate-500">
                            Manage your account security
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
                {/* Security overview */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-4 p-5 sm:p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                            <span className="material-symbols-rounded text-[24px] text-slate-700">
                                shield
                            </span>
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-slate-900">
                                Account security
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-slate-500">
                                Keep your account protected
                                with a strong password.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Change password */}
                <section className="mt-5">
                    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Password
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="p-5 sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-base font-semibold text-slate-900">
                                    Change password
                                </h2>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    Use your current password
                                    to create a new one.
                                </p>
                            </div>

                            {/* Current password */}
                            <div>
                                <label
                                    htmlFor="current_password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Current password
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        lock
                                    </span>

                                    <input
                                        id="current_password"
                                        name="current_password"
                                        type={
                                            showCurrentPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            form.current_password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="current-password"
                                        disabled={
                                            changingPassword
                                        }
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        placeholder="Enter current password"
                                    />

                                    <PasswordToggle
                                        visible={
                                            showCurrentPassword
                                        }
                                        onClick={() =>
                                            setShowCurrentPassword(
                                                (value) =>
                                                    !value
                                            )
                                        }
                                        label={
                                            showCurrentPassword
                                                ? "Hide current password"
                                                : "Show current password"
                                        }
                                    />
                                </div>
                            </div>

                            {/* New password */}
                            <div className="mt-5">
                                <label
                                    htmlFor="new_password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    New password
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        lock_reset
                                    </span>

                                    <input
                                        id="new_password"
                                        name="new_password"
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            form.new_password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="new-password"
                                        disabled={
                                            changingPassword
                                        }
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        placeholder="Enter new password"
                                    />

                                    <PasswordToggle
                                        visible={
                                            showNewPassword
                                        }
                                        onClick={() =>
                                            setShowNewPassword(
                                                (value) =>
                                                    !value
                                            )
                                        }
                                        label={
                                            showNewPassword
                                                ? "Hide new password"
                                                : "Show new password"
                                        }
                                    />
                                </div>
                            </div>

                            {/* Password requirements */}
                            <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                                <p className="mb-2 text-xs font-semibold text-slate-700">
                                    Password requirements
                                </p>

                                <div className="space-y-2">
                                    <Requirement
                                        valid={
                                            hasMinimumLength
                                        }
                                    >
                                        At least 8 characters
                                    </Requirement>

                                    <Requirement
                                        valid={hasLetter}
                                    >
                                        Contains a letter
                                    </Requirement>

                                    <Requirement
                                        valid={hasNumber}
                                    >
                                        Contains a number
                                    </Requirement>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div className="mt-5">
                                <label
                                    htmlFor="confirm_password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Confirm new password
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        verified_user
                                    </span>

                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            form.confirm_password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="new-password"
                                        disabled={
                                            changingPassword
                                        }
                                        className={`h-12 w-full rounded-2xl border bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                                            form.confirm_password &&
                                            !passwordsMatch
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                                                : passwordsMatch
                                                ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-50"
                                                : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
                                        }`}
                                        placeholder="Confirm new password"
                                    />

                                    <PasswordToggle
                                        visible={
                                            showConfirmPassword
                                        }
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (value) =>
                                                    !value
                                            )
                                        }
                                        label={
                                            showConfirmPassword
                                                ? "Hide confirmation password"
                                                : "Show confirmation password"
                                        }
                                    />
                                </div>

                                {form.confirm_password &&
                                    !passwordsMatch && (
                                        <p className="mt-2 text-xs text-red-500">
                                            Passwords do not
                                            match.
                                        </p>
                                    )}

                                {passwordsMatch && (
                                    <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                                        <span className="material-symbols-rounded text-[16px]">
                                            check_circle
                                        </span>
                                        Passwords match.
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={
                                    changingPassword
                                }
                                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {changingPassword ? (
                                    <>
                                        <span className="material-symbols-rounded animate-spin text-[19px]">
                                            progress_activity
                                        </span>

                                        Updating password...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded text-[19px]">
                                            lock_reset
                                        </span>

                                        Update password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Security tips */}
                <section className="mt-5">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex gap-3">
                            <span className="material-symbols-rounded shrink-0 text-[21px] text-slate-500">
                                info
                            </span>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Keep your account secure
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Don't reuse your password
                                    on other websites. Avoid
                                    sharing your password with
                                    anyone.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function Requirement({ valid, children }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`material-symbols-rounded text-[16px] ${
                    valid
                        ? "text-emerald-500"
                        : "text-slate-300"
                }`}
            >
                {valid
                    ? "check_circle"
                    : "radio_button_unchecked"}
            </span>

            <span
                className={`text-xs ${
                    valid
                        ? "text-slate-700"
                        : "text-slate-400"
                }`}
            >
                {children}
            </span>
        </div>
    );
}