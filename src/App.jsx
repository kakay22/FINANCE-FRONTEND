import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import AddMoney from "./pages/AddMoney";
import Transactions from "./pages/Transactions";
import EditTransaction from "./pages/EditTransaction";

import Borrowings from "./pages/Borrowings";
import AddBorrowing from "./pages/AddBorrowing";
import BorrowingDetails from "./pages/BorrowingDetails";
import EditBorrowing from "./pages/EditBorrowing";
import AddRepayment from "./pages/AddRepayment";

import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Profile from "./pages/Profile";

import Security from "./pages/Security";

import Notifications from "./pages/Notifications";

function Placeholder({ title }) {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">
        {title}
      </h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Public Routes
        ========================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            Protected Routes
        ========================== */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* Transactions */}
          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/transactions/:id/edit"
            element={<EditTransaction />}
          />

          {/* Add Money */}
          <Route
            path="/add-money"
            element={<AddMoney />}
          />

          {/* Statistics */}
          <Route
            path="/statistics"
            element={<Statistics />}
          />

          {/* =========================
              Borrowings
          ========================== */}

          {/* Borrowing list */}
          <Route
            path="/borrowings"
            element={<Borrowings />}
          />

          {/* Add borrowing */}
          <Route
            path="/borrowings/new"
            element={<AddBorrowing />}
          />

          {/* Borrowing details */}
          <Route
            path="/borrowings/:id"
            element={<BorrowingDetails />}
          />

          {/* Edit borrowing */}
          <Route
            path="/borrowings/:id/edit"
            element={<EditBorrowing />}
          />

          {/* Add repayment */}
          <Route
            path="/borrowings/:id/repay"
            element={<AddRepayment />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/security"
            element={<Security />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}