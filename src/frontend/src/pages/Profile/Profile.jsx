import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import CapibaraIcon from '../../assets/icon.png';

const Profile = () => {
    const { user, logout, login } = useContext(AuthContext); // login usado para atualizar contexto
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        daily_goal: 5000,
        total_km: 0,
        streak_count: 0,
        balance: 0
    });

    // Carregar dados
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Se não tiver user, volta pro login
                if (!user?.user_id) return;
                
                const res = await api.get(`/users/${user.user_id}/profile`);
                setProfileData(res.data);
            } catch (error) {
                toast.error("Erro ao carregar perfil.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    // Salvar alterações
    const handleSave = async () => {
        try {
            const res = await api.put(`/users/${user.user_id}`, {
                name: profileData.name,
                daily_goal: profileData.daily_goal
            });
            
            // Atualiza o contexto global com o novo nome
            const updatedUser = { ...user, name: res.data.name };
            login(updatedUser); 
            
            toast.success("Perfil atualizado com sucesso! ✅");
        } catch (error) {
            toast.error("Erro ao atualizar.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        toast.info("Até logo! 👋");
    };

    if (loading) return <div style={{padding: 20}}>Carregando...</div>;

    // Lógica simples de Nível baseada em KMs
    const getLevel = (km) => {
        if (km > 100) return { title: "Lenda da Capivara 👑", color: "#FFD700" }; // Ouro
        if (km > 50) return { title: "Maratonista 🏃", color: "#C0C0C0" }; // Prata
        if (km > 20) return { title: "Explorador 🧭", color: "#CD7F32" }; // Bronze
        return { title: "Iniciante 🌱", color: "#81C784" };
    };

    const level = getLevel(parseFloat(profileData.total_km));

    return (
        <div style={styles.container}>
            {/* Cabeçalho com Voltar */}
            <div style={styles.header}>
                <button onClick={() => navigate('/home')} style={styles.backBtn}>⬅ Voltar</button>
                <h2 style={{margin:0, color: '#E65100'}}>Meu Perfil</h2>
                <div style={{width: 60}}></div> {/* Espaçador para centralizar */}
            </div>

            {/* Cartão de Identidade */}
            <div style={styles.card}>
                <div style={styles.avatarContainer}>
                    <img src={CapibaraIcon} alt="Avatar" style={styles.avatar} />
                    <span style={{...styles.badge, background: level.color}}>{level.title}</span>
                </div>
                
                <h3 style={styles.name}>{profileData.name}</h3>
                <p style={styles.email}>{profileData.email}</p>

                {/* Estatísticas Rápidas */}
                <div style={styles.statsGrid}>
                    <div style={styles.statItem}>
                        <span style={styles.statValue}>{profileData.streak_count} 🔥</span>
                        <span style={styles.statLabel}>Streak Máx</span>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statValue}>{parseFloat(profileData.total_km).toFixed(1)} km</span>
                        <span style={styles.statLabel}>Total Percorrido</span>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statValue}>{profileData.balance} 🪙</span>
                        <span style={styles.statLabel}>Saldo Atual</span>
                    </div>
                </div>
            </div>

            {/* Formulário de Edição */}
            <div style={styles.formSection}>
                <h4 style={styles.sectionTitle}>Editar Informações</h4>
                
                <label style={styles.label}>Nome de Exibição</label>
                <input 
                    style={styles.input}
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                />

                <label style={styles.label}>Meta Diária (Capibas)</label>
                <input 
                    type="number"
                    style={styles.input}
                    value={profileData.daily_goal}
                    onChange={(e) => setProfileData({...profileData, daily_goal: e.target.value})}
                />

                <button onClick={handleSave} style={styles.saveBtn}>Salvar Alterações 💾</button>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtn}>Sair da Conta 🚪</button>
        </div>
    );
};

const styles = {
    container: { padding: '20px', paddingBottom: '100px', background: '#FAFAFA', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    backBtn: { background: 'none', border: 'none', fontSize: '1rem', color: '#666', cursor: 'pointer' },
    
    card: { background: 'white', borderRadius: '20px', padding: '25px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px' },
    avatarContainer: { position: 'relative', display: 'inline-block', marginBottom: '10px' },
    avatar: { width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #E65100', padding: '3px' },
    badge: { position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' },
    name: { margin: '10px 0 5px 0', fontSize: '1.4rem', color: '#333' },
    email: { margin: 0, color: '#999', fontSize: '0.9rem' },
    
    statsGrid: { display: 'flex', justifyContent: 'space-around', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' },
    statItem: { display: 'flex', flexDirection: 'column' },
    statValue: { fontWeight: 'bold', fontSize: '1.1rem', color: '#E65100' },
    statLabel: { fontSize: '0.75rem', color: '#888' },

    formSection: { background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '20px' },
    sectionTitle: { marginTop: 0, marginBottom: '15px', color: '#444' },
    label: { display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '15px', boxSizing: 'border-box', fontSize: '1rem' },
    
    saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
    logoutBtn: { width: '100%', padding: '15px', background: 'none', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Profile;