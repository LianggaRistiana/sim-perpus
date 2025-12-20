import React from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import type { User } from '../types';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user } = useOutletContext<{ user: User }>();

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
