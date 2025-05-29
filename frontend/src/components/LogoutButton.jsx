import { useAuthStore } from "../store/useAuthStore";

const LogoutButton = ({ children }) => {
  const { logout } = useAuthStore();
  const onLogout = async () => {
    await logout();
  };

  return <button className="btn btn-primary" onClick={onLogout}></button>;
};

export default LogoutButton;
