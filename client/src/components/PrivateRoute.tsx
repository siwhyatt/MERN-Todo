import { Navigate, Outlet } from 'react-router-dom';

interface PrivateRouteProps {
  token: string | null;
}

const PrivateRoute = ({ token }: PrivateRouteProps) => {
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

