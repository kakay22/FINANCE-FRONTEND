import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await api.post(
                "auth/login/",
                form
            );

            localStorage.setItem(
                "access_token",
                response.data.access
            );

            localStorage.setItem(
                "refresh_token",
                response.data.refresh
            );

            toast.success("Welcome back!");

            navigate("/");
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                "Invalid username or password.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
            <div className="w-full max-w-sm">
                <div className="mb-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
                        <span className="material-symbols-rounded">
                            savings
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                        Housing Fund
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Sign in to manage your shared
                        savings.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Username
                        </label>

                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    username:
                                        e.target.value,
                                })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password:
                                        e.target.value,
                                })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-900"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gray-950 px-4 py-3.5 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-gray-950"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}