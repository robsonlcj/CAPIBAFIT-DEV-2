import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Info, CheckCircle } from 'lucide-react';
import BottomMenu from "../../components/BottomMenu/BottomMenu";

// Função para escolher imagens (Mock enquanto não temos upload real)
const getSpotImage = (name) => {
    if (name && name.includes('Marco Zero')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Marco_Zero_-_Recife.jpg/800px-Marco_Zero_-_Recife.jpg';
    if (name && name.includes('Jaqueira')) return 'https://visit.recife.br/wp-content/uploads/2021/10/parque-da-jaqueira-1.jpg';
    return 'https://placehold.co/600x400/e2e8f0/1e293b?text=Ponto+Turistico';
};

export default function TouristSpotsScreen() {
    const navigate = useNavigate();
    const [spots, setSpots] = useState([]);
    const [userCoords, setUserCoords] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Carregar Pontos do Backend e Localização
    useEffect(() => {
        console.log("🔄 Iniciando busca de pontos...");

        fetch('http://localhost:3001/api/tourist-spots')
            .then(res => {
                console.log("📡 Resposta recebida. Status:", res.status);
                if (!res.ok) throw new Error('Erro na rede ou servidor');
                return res.json();
            })
            .then(data => {
                console.log("📦 DADOS CHEGARAM:", data); // <--- OLHE AQUI NO CONSOLE
                
                // Verificação de segurança: É um array?
                if (Array.isArray(data)) {
                    console.log(`✅ É um array com ${data.length} itens.`);
                    setSpots(data);
                } else {
                    console.error("⚠️ ERRO: O backend não retornou uma lista!", data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("❌ Erro fatal no fetch:", err);
                setLoading(false);
            });

        // Pega GPS atual do navegador
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => console.error("Erro GPS:", err)
            );
        }
    }, []);

    // Função visual para mostrar distância aproximada
    const getDistance = (lat1, lon1) => {
        if (!userCoords) return "-- km";
        const R = 6371; // Raio da terra
        const dLat = (lat1 - userCoords.lat) * (Math.PI / 180);
        const dLon = (lon1 - userCoords.lon) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(userCoords.lat * (Math.PI / 180)) * Math.cos(lat1 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1) + " km";
    };

    // Ação: Botão Check-in (leva para a atividade)
    const handleCheckIn = (spot) => {
        navigate('/activity', { 
            state: { 
                targetSpot: spot, 
                mode: 'tourist_mission' 
            } 
        });
    };

    // Ação: Botão Navegar (abre Google Maps)
    const handleNavigate = (lat, lon) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">
            {/* --- HEADER COM GRADIENTE --- */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 pt-10 pb-16 rounded-b-[40px] shadow-xl relative z-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-white text-3xl font-bold">Pontos Turísticos</h1>
                        <p className="text-orange-100 text-sm mt-2 max-w-[250px]">
                            Visite locais incríveis de Recife e ganhe Capibas extras!
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-10 space-y-6">
                
                {/* --- CARD INFORMATIVO --- */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-full shrink-0">
                        <Info size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Como Funciona?</h3>
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                            Vá até o local, inicie a atividade e ganhe 
                            <span className="font-bold text-orange-600"> bônus 3x! </span>
                        </p>
                    </div>
                </div>

                {/* --- LISTA DE PONTOS (LOADING OU CARDS) --- */}
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Carregando pontos...</div>
                ) : (
                    spots.map(spot => (
                        <div key={spot.id} className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 mb-4">
                            
                            {/* Imagem */}
                            <div className="h-48 relative">
                                <img 
                                    src={getSpotImage(spot.name)} 
                                    alt={spot.name} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <CheckCircle size={12} /> Disponível
                                </div>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                                    <h2 className="text-white text-2xl font-bold">{spot.name}</h2>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin size={16} />
                                        <span>{getDistance(spot.latitude, spot.longitude)} de você</span>
                                    </div>
                                    <div className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                        💰 Multiplicador {spot.multiplier}x
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => handleNavigate(spot.latitude, spot.longitude)}
                                        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                                    >
                                        <Navigation size={18} /> Navegar
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleCheckIn(spot)}
                                        className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600"
                                    >
                                        <MapPin size={18} /> Check-in
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Menu Inferior */}
            <BottomMenu />
        </div>
    );
}