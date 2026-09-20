import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto min-h-screen w-full max-w-lg pb-24">
                <Outlet />
            </main>

            <BottomNav />
        </div>
    );
}