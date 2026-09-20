import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        password_confirm: "",
        display_name: "",
    });

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            form.password !==
            form.password_confirm
        ) {
            toast.error(
                "Passwords do not match."
            );
            return;
        }

        setLoading(true);

        try {
            await api.post(
                "auth/register/",
                form
            );

            toast.success(
                "Account created successfully."
            );

            navigate("/login");
        } catch (error) {
            const data =
                error.response?.data;

            const message =
                data?.username?.[0] ||
                data?.email?.[0] ||
                data?.password?.[0] ||
                data?.detail ||
                "Registration failed.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-5 py-10">
            <div className="mx-auto w-full max-w-sm">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                        Create account
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Set up your housing fund account.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {[
                        [
                            "Display name",
                            "display_name",
                            "text",
                        ],
                        [
                            "Username",
                            "username",
                            "text",
                        ],
                        [
                            "Email",
                            "email",
                            "email",
                        ],
                        [
                            "Password",
                            "password",
                            "password",
                        ],
                        [
                            "Confirm password",
                            "password_confirm",
                            "password",
                        ],
                    ].map(
                        ([
                            label,
                            name,
                            type,
                        ]) => (
                            <div key={name}>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {label}
                                </label>

                                <input
                                    type={type}
                                    value={
                                        form[name]
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            [name]:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-900"
                                    required={
                                        name !==
                                        "display_name"
                                    }
                                />
                            </div>
                        )
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gray-950 px-4 py-3.5 font-medium text-white disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-gray-950"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}