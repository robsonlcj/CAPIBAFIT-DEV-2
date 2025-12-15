import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Info, CheckCircle, ArrowRight } from 'lucide-react'; // Adicionei ArrowRight
import BottomMenu from "../../components/BottomMenu/BottomMenu";

// --- IMPORT DAS IMAGENS LOCAIS (Nomes exatos conforme seu print) ---
import marcoZeroImg from '../../assets/tourist/marco-zero-img.jpg';
import jaqueiraImg from '../../assets/tourist/parque-da-jaqueira-img.jpg';
import boaViagemImg from '../../assets/tourist/boa-viagem-img.jpg';

const getSpotImage = (name) => {
    if (!name) return 'https://placehold.co/600x400/e2e8f0/1e293b?text=Sem+Nome';
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('marco zero')) return marcoZeroImg;
    if (lowerName.includes('jaqueira')) return jaqueiraImg;
    if (lowerName.includes('boa viagem')) return boaViagemImg;
    
    return 'https://placehold.co/600x400/e2e8f0/1e293b?text=Ponto+Turistico';
};

export default function TouristSpotsScreen() {
    const navigate = useNavigate();
    const [spots, setSpots] = useState([]);
    const [userCoords, setUserCoords] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/tourist-spots')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSpots(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => console.error(err)
            );
        }
    }, []);

    const getDistance = (lat1, lon1) => {
        if (!userCoords) return "-- km";
        const R = 6371; 
        const dLat = (lat1 - userCoords.lat) * (Math.PI / 180);
        const dLon = (lon1 - userCoords.lon) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(userCoords.lat * (Math.PI / 180)) * Math.cos(lat1 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1) + " km";
    };

    const handleGo = (spot) => {
        // Redireciona para a rota /activity (que vamos criar jájá)
        navigate('/activity', { 
            state: { 
                targetSpot: spot, 
                mode: 'tourist_mission' 
            } 
        });
    };

    const handleNavigate = (lat, lon) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">
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

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Carregando pontos...</div>
                ) : (
                    spots.map(spot => (
                        <div key={spot.id} className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 mb-4">
                            <div className="h-48 relative">
                                <img 
                                    src={getSpotImage(spot.name)} 
                                    alt={spot.name} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <CheckCircle size={12} /> Disponível
                                </div>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                                    <h2 className="text-white text-2xl font-bold">{spot.name}</h2>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin size={16} />
                                        <span>{getDistance(spot.latitude, spot.longitude)} de você</span>
                                    </div>
                                    <div className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                        💰 {spot.multiplier}x Capibas
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => handleNavigate(spot.latitude, spot.longitude)}
                                        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <Navigation size={18} /> Navegar
                                    </button>
                                    
                                    {/* BOTÃO ATUALIZADO PARA 'IR' */}
                                    <button 
                                        onClick={() => handleGo(spot)}
                                        className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-colors active:scale-95"
                                    >
                                        <ArrowRight size={20} /> Ir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <BottomMenu />
        </div>
    );
}