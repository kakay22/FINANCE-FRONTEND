import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import Loading from "../components/Loading";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleDateString(
        "en-PH",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}

function getProgress(goal) {
    const progress = Number(
        goal?.progress_percentage || 0
    );

    return Math.min(
        Math.max(progress, 0),
        100
    );
}

function GoalCard({ goal }) {
    const progress = getProgress(goal);

    const completed =
        progress >= 100 ||
        Number(goal.remaining_amount || 0) <= 0;

    return (
        <div
            className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-sm
                sm:p-5
            "
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                            {goal.name}
                        </h2>

                        {goal.is_active ? (
                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                Active
                            </span>
                        ) : completed ? (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                Completed
                            </span>
                        ) : (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                Inactive
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                        Started {formatDate(goal.start_date)}
                    </p>
                </div>

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${
                            goal.is_active
                                ? "bg-green-50 text-green-600"
                                : completed
                                ? "bg-blue-50 text-blue-600"
                                : "bg-gray-100 text-gray-500"
                        }
                    `}
                >
                    <span className="material-symbols-rounded">
                        {completed
                            ? "check_circle"
                            : "savings"}
                    </span>
                </div>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-gray-500">
                        Progress
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                        {progress.toFixed(0)}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className={`
                            h-full
                            rounded-full
                            transition-all
                            ${
                                completed
                                    ? "bg-green-500"
                                    : "bg-gray-900"
                            }
                        `}
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                        Saved
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                        {formatCurrency(
                            goal.total_saved
                        )}
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                        Target
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                        {formatCurrency(
                            goal.target_amount
                        )}
                    </p>
                </div>
            </div>

            {Array.isArray(goal.members) &&
                goal.members.length > 0 && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                        <p className="mb-3 text-xs font-medium text-gray-500">
                            Members
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {goal.members.map(
                                (member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-3"
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white">
                                            {member.profile_picture ? (
                                                <img
                                                    src={
                                                        member.profile_picture
                                                    }
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="material-symbols-rounded text-[17px] text-gray-500">
                                                    person
                                                </span>
                                            )}
                                        </div>

                                        <span className="max-w-[130px] truncate text-xs font-medium text-gray-700">
                                            {member.display_name ||
                                                member.username}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

export default function GoalHistory() {
    const navigate = useNavigate();

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "savings/goals/"
            );

            setGoals(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load goal history:",
                error
            );

            setError(
                "Unable to load your goal history."
            );
        } finally {
            setLoading(false);
        }
    };

    const activeGoals = useMemo(
        () =>
            goals.filter(
                (goal) => goal.is_active
            ),
        [goals]
    );

    const previousGoals = useMemo(
        () =>
            goals.filter(
                (goal) => !goal.is_active
            ),
        [goals]
    );

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4 sm:px-6 sm:pt-6">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-rounded">
                            arrow_back
                        </span>
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            Goal History
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Current and previous savings
                            goals
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-rounded text-red-500">
                                error
                            </span>

                            <div className="flex-1">
                                <p className="text-sm text-red-700">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        fetchGoals
                                    }
                                    className="mt-2 text-sm font-semibold text-red-700"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty */}
                {!error &&
                    goals.length === 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                                <span className="material-symbols-rounded text-3xl text-gray-500">
                                    savings
                                </span>
                            </div>

                            <h2 className="mt-4 font-semibold text-gray-900">
                                No savings goals yet
                            </h2>

                            <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
                                Create your first goal
                                to start tracking your
                                savings.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/goals/create"
                                    )
                                }
                                className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Create goal
                            </button>
                        </div>
                    )}

                {/* Current */}
                {activeGoals.length > 0 && (
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Current goal
                            </h2>

                            <span className="text-xs text-gray-400">
                                {
                                    activeGoals.length
                                }{" "}
                                active
                            </span>
                        </div>

                        <div className="space-y-3">
                            {activeGoals.map(
                                (goal) => (
                                    <GoalCard
                                        key={
                                            goal.id
                                        }
                                        goal={
                                            goal
                                        }
                                    />
                                )
                            )}
                        </div>
                    </section>
                )}

                {/* Previous */}
                {previousGoals.length > 0 && (
                    <section
                        className={
                            activeGoals.length > 0
                                ? "mt-8"
                                : ""
                        }
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Previous goals
                            </h2>

                            <span className="text-xs text-gray-400">
                                {
                                    previousGoals.length
                                }{" "}
                                total
                            </span>
                        </div>

                        <div className="space-y-3">
                            {previousGoals.map(
                                (goal) => (
                                    <GoalCard
                                        key={
                                            goal.id
                                        }
                                        goal={
                                            goal
                                        }
                                    />
                                )
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}