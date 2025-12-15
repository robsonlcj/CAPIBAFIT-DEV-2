import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CapibaraIcon from '../../assets/icon.png';
import { toast } from 'react-toastify';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [isRegister, setIsRegister] = useState(false); // Alternar telas
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const endpoint = isRegister ? '/auth/register' : '/auth/login';

        try {
            const response = await api.post(endpoint, formData);
            
            // Salva no contexto
            login(response.data);
            
            toast.success(isRegister ? "Bem-vindo ao bando! 🌿" : "Login realizado! 🔥");
            
            // Redireciona
            if (response.data.first_login) {
                navigate('/intro');
            } else {
                navigate('/home');
            }

        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao conectar.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <img src={CapibaraIcon} alt="Capiba" style={styles.logo} />
                <h1 style={styles.title}>CapibaFit</h1>
                <p style={styles.subtitle}>
                    {isRegister ? "Crie sua conta e comece a pontuar!" : "Entre para continuar seu streak."}
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {isRegister && (
                        <input 
                            name="name" placeholder="Seu Nome" 
                            style={styles.input} onChange={handleChange} required 
                        />
                    )}
                    <input 
                        name="email" type="email" placeholder="E-mail" 
                        style={styles.input} onChange={handleChange} required 
                    />
                    <input 
                        name="password" type="password" placeholder="Senha" 
                        style={styles.input} onChange={handleChange} required 
                    />

                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? "Carregando..." : (isRegister ? "Cadastrar" : "Entrar")}
                    </button>
                </form>

                <p style={styles.switchText}>
                    {isRegister ? "Já tem conta?" : "Ainda não tem conta?"}
                    <span 
                        style={styles.link} 
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? " Fazer Login" : " Cadastre-se"}
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFCCBC 100%)', padding: '20px'
    },
    card: {
        background: 'white', padding: '30px', borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px',
        textAlign: 'center'
    },
    logo: { width: '80px', marginBottom: '10px' },
    title: { color: '#E65100', margin: '0', fontSize: '1.8rem' },
    subtitle: { color: '#666', fontSize: '0.9rem', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: {
        padding: '12px', borderRadius: '10px', border: '1px solid #ddd',
        fontSize: '1rem', outline: 'none'
    },
    button: {
        padding: '12px', borderRadius: '10px', border: 'none',
        background: '#E65100', color: 'white', fontSize: '1rem',
        fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
    },
    switchText: { marginTop: '20px', fontSize: '0.9rem', color: '#666' },
    link: { color: '#E65100', fontWeight: 'bold', cursor: 'pointer' }
};

export default Login;