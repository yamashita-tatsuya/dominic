import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../main';

export default function RequireAuth({ children }) {
    const { token, loadingAuth } = useContext(AuthContext);
    const location = useLocation();

    if (loadingAuth) return null;

    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}
