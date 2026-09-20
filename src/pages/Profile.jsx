import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Profile() {
    const navigate = useNavigate();

    // --------------------------------------------------
    // Profile
    // --------------------------------------------------

    const [form, setForm] = useState({
        username: "",
        email: "",
        profile_picture: null,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --------------------------------------------------
    // Profile picture
    // --------------------------------------------------

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --------------------------------------------------
    // Password
    // --------------------------------------------------

    const [showPasswordForm, setShowPasswordForm] =
        useState(false);

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [changingPassword, setChangingPassword] =
        useState(false);

    // --------------------------------------------------
    // Convert backend media URL to a browser URL
    // --------------------------------------------------

    const getMediaUrl = (url) => {
        if (!url) {
            return null;
        }

        // Blob URL from a newly selected image
        if (url.startsWith("blob:")) {
            return url;
        }

        // Already an absolute URL
        if (
            url.startsWith("http://") ||
            url.startsWith("https://")
        ) {
            return url;
        }

        // Get the API base URL from axios
        const baseURL = api.defaults.baseURL || "";

        try {
            const apiURL = new URL(
                baseURL,
                window.location.origin
            );

            return new URL(url, apiURL.origin).href;
        } catch {
            return url;
        }
    };

    // --------------------------------------------------
    // Load profile
    // --------------------------------------------------

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                const response = await api.get(
                    "auth/profile/"
                );

                const data = response.data;

                console.log("PROFILE DATA:", data);

                if (!mounted) {
                    return;
                }

                setForm({
                    username:
                        data?.username ||
                        data?.user?.username ||
                        "",

                    email:
                        data?.email ||
                        data?.user?.email ||
                        "",

                    profile_picture:
                        data?.profile_picture || null,
                });
            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error
                );

                if (!mounted) {
                    return;
                }

                toast.error(
                    error?.response?.data?.detail ||
                        "Unable to load your profile."
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, []);

    // --------------------------------------------------
    // Cleanup temporary image preview
    // --------------------------------------------------

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // --------------------------------------------------
    // Profile field changes
    // --------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // Profile picture selection
    // --------------------------------------------------

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(
                "Profile picture must be 5 MB or smaller."
            );
            event.target.value = "";
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        const previewURL = URL.createObjectURL(file);

        setImageFile(file);
        setImagePreview(previewURL);
    };

    // --------------------------------------------------
    // Save profile
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        const username = form.username.trim();
        const email = form.email.trim();

        if (!username) {
            toast.error("Username is required.");
            return;
        }

        if (username.length < 3) {
            toast.error(
                "Username must be at least 3 characters."
            );
            return;
        }

        // Fixed email regex
        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            toast.error(
                "Please enter a valid email address."
            );
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append("username", username);
            formData.append("email", email);

            if (imageFile) {
                formData.append(
                    "profile_picture",
                    imageFile
                );
            }

            const response = await api.patch(
                "auth/profile/",
                formData
            );

            const data = response.data;

            console.log(
                "UPDATED PROFILE:",
                data
            );

            const updatedUsername =
                data?.username ||
                data?.user?.username ||
                username;

            const updatedEmail =
                data?.email ||
                data?.user?.email ||
                email;

            const updatedProfilePicture =
                data?.profile_picture ||
                form.profile_picture ||
                null;

            setForm({
                username: updatedUsername,
                email: updatedEmail,
                profile_picture:
                    updatedProfilePicture,
            });

            // Clear selected file
            setImageFile(null);

            // Clear temporary preview
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            setImagePreview(null);

            // --------------------------------------------------
            // Keep local account information synchronized
            // --------------------------------------------------

            localStorage.setItem(
                "username",
                updatedUsername
            );

            const storedUser =
                localStorage.getItem("user");

            if (storedUser) {
                try {
                    const user =
                        JSON.parse(storedUser);

                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            ...user,
                            username:
                                updatedUsername,
                            email: updatedEmail,
                            profile_picture:
                                updatedProfilePicture,
                        })
                    );
                } catch {
                    // Ignore invalid local storage data.
                }
            }

            toast.success(
                "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "Failed to update profile:",
                error
            );

            const data =
                error?.response?.data;

            const message =
                data?.detail ||
                data?.username?.[0] ||
                data?.email?.[0] ||
                data?.profile_picture?.[0] ||
                "Unable to update your profile.";

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Password field changes
    // --------------------------------------------------

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // Change password
    // --------------------------------------------------

    const handleChangePassword = async (event) => {
        event.preventDefault();

        const currentPassword =
            passwordForm.current_password.trim();

        const newPassword =
            passwordForm.new_password;

        const confirmPassword =
            passwordForm.confirm_password;

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

            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            setShowPasswordForm(false);

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

    // --------------------------------------------------
    // Close password form
    // --------------------------------------------------

    const closePasswordForm = () => {
        setShowPasswordForm(false);

        setPasswordForm({
            current_password: "",
            new_password: "",
            confirm_password: "",
        });
    };

    // --------------------------------------------------
    // Loading state
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                            aria-label="Go back"
                        >
                            <span className="material-symbols-rounded">
                                arrow_back
                            </span>
                        </button>

                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                                Profile
                            </h1>

                            <p className="text-xs text-slate-500">
                                Manage your account
                                information
                            </p>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
                    <div className="animate-pulse">
                        <div className="h-24 rounded-3xl bg-slate-200" />

                        <div className="mt-5 h-72 rounded-3xl bg-slate-200" />
                    </div>
                </main>
            </div>
        );
    }

    // --------------------------------------------------
    // Avatar initial
    // --------------------------------------------------

    const initial =
        form.username
            ?.charAt(0)
            ?.toUpperCase() || "?";

    const profileImageUrl = getMediaUrl(
        form.profile_picture
    );

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

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
                            Profile
                        </h1>

                        <p className="truncate text-xs text-slate-500">
                            Manage your account
                            information
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
                {/* Profile preview */}

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-4 p-5 sm:p-6">
                        <div className="relative shrink-0">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-2xl font-bold text-white">
                                {imagePreview ? (
                                    <img
                                        src={
                                            imagePreview
                                        }
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : profileImageUrl ? (
                                    <img
                                        src={
                                            profileImageUrl
                                        }
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(
                                            event
                                        ) => {
                                            console.error(
                                                "Failed to load profile picture:",
                                                profileImageUrl
                                            );

                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                ) : (
                                    initial
                                )}
                            </div>

                            <label
                                htmlFor="profile_picture"
                                className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-slate-900 text-white shadow-sm transition hover:bg-slate-800"
                                aria-label="Change profile picture"
                            >
                                <span className="material-symbols-rounded text-[18px]">
                                    photo_camera
                                </span>
                            </label>

                            <input
                                id="profile_picture"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={
                                    handleImageChange
                                }
                                className="hidden"
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-slate-900">
                                {form.username ||
                                    "Account"}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                                {form.email ||
                                    "No email address"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Account information */}

                <section className="mt-5">
                    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Account information
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="p-5 sm:p-6">
                            {/* Username */}

                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Username
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        person
                                    </span>

                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={
                                            form.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="username"
                                        maxLength={150}
                                        disabled={saving}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            {/* Email */}

                            <div className="mt-5">
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                                        mail
                                    </span>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="email"
                                        disabled={saving}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Your email can be used
                                    for account
                                    communication and
                                    notifications.
                                </p>
                            </div>

                            {/* Save */}

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <span className="material-symbols-rounded animate-spin text-[19px]">
                                            progress_activity
                                        </span>

                                        Saving changes...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded text-[19px]">
                                            save
                                        </span>

                                        Save changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Security */}

                <section className="mt-5">
                    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Security
                    </p>

                    {!showPasswordForm ? (
                        <button
                            type="button"
                            onClick={() =>
                                setShowPasswordForm(
                                    true
                                )
                            }
                            className="flex min-h-[68px] w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50 active:bg-slate-100"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                <span className="material-symbols-rounded text-[21px] text-slate-600">
                                    lock
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Change password
                                </p>

                                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                    Update your account
                                    password
                                </p>
                            </div>

                            <span className="material-symbols-rounded text-slate-400">
                                chevron_right
                            </span>
                        </button>
                    ) : (
                        <form
                            onSubmit={
                                handleChangePassword
                            }
                            className="rounded-3xl border border-slate-200 bg-white shadow-sm"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Change password
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Choose a strong
                                            password for
                                            your account.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closePasswordForm
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                        aria-label="Close"
                                    >
                                        <span className="material-symbols-rounded">
                                            close
                                        </span>
                                    </button>
                                </div>

                                {/* Current password */}

                                <div>
                                    <label
                                        htmlFor="current_password"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Current password
                                    </label>

                                    <input
                                        id="current_password"
                                        name="current_password"
                                        type="password"
                                        value={
                                            passwordForm.current_password
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        autoComplete="current-password"
                                        disabled={
                                            changingPassword
                                        }
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                {/* New password */}

                                <div className="mt-5">
                                    <label
                                        htmlFor="new_password"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        New password
                                    </label>

                                    <input
                                        id="new_password"
                                        name="new_password"
                                        type="password"
                                        value={
                                            passwordForm.new_password
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        autoComplete="new-password"
                                        disabled={
                                            changingPassword
                                        }
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                                        placeholder="Enter new password"
                                    />
                                </div>

                                {/* Confirm password */}

                                <div className="mt-5">
                                    <label
                                        htmlFor="confirm_password"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Confirm new password
                                    </label>

                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        value={
                                            passwordForm.confirm_password
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        autoComplete="new-password"
                                        disabled={
                                            changingPassword
                                        }
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                {/* Password info */}

                                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-rounded text-[20px] text-slate-500">
                                            info
                                        </span>

                                        <p className="text-xs leading-5 text-slate-500">
                                            Your new password
                                            must satisfy the
                                            password
                                            requirements
                                            configured for
                                            your account.
                                        </p>
                                    </div>
                                </div>

                                {/* Password buttons */}

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={
                                            closePasswordForm
                                        }
                                        disabled={
                                            changingPassword
                                        }
                                        className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            changingPassword
                                        }
                                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {changingPassword ? (
                                            <>
                                                <span className="material-symbols-rounded animate-spin text-[19px]">
                                                    progress_activity
                                                </span>

                                                Updating...
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
                            </div>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
}