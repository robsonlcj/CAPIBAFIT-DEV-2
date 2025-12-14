import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Profile from './pages/Profile/Profile';
import 'react-toastify/dist/ReactToastify.css';

// Contexto
import { AuthProvider, AuthContext } from './context/AuthContext';

// Páginas
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Desafios from './pages/Desafios/desafios'; // Verifique se o nome do arquivo é minúsculo ou maiúsculo
import Extrato from './pages/Extrato/extrato';
import BottomMenu from './components/BottomMenu/BottomMenu.jsx';
import IntroScreen from './pages/Onboarding/IntroScreen';
import WelcomeChallengeScreen from './pages/Onboarding/WelcomeChallengerScreen';

// Componente para Proteger Rotas (Só entra se estiver logado)
const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div>Carregando...</div>;
    
    if (!user) {
        return <Navigate to="/" />;
    }
    
    return children;
};

// Layout com Menu Condicional
function Layout() {
    const location = useLocation();
    const rotasSemMenu = ['/', '/intro', '/welcome-challenge'];
    const mostrarMenu = !rotasSemMenu.includes(location.pathname);

    return (
        <div className="app-content" style={{ paddingBottom: mostrarMenu ? '80px' : '0' }}>
            <Routes>
                {/* Rota Pública */}
                <Route path="/" element={<Login />} />

                {/* Rotas Privadas */}
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/intro" element={<PrivateRoute><IntroScreen /></PrivateRoute>} />
                <Route path="/welcome-challenge" element={<PrivateRoute><WelcomeChallengeScreen /></PrivateRoute>} />
                <Route path="/desafios" element={<PrivateRoute><Desafios /></PrivateRoute>} />
                <Route path="/extrato" element={<PrivateRoute><Extrato /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>

            {mostrarMenu && <BottomMenu />}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout />
                <ToastContainer position="top-center" theme="colored" />
            </BrowserRouter>
        </AuthProvider>
    );
}