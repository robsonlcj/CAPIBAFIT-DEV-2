import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react'; 
import 'leaflet/dist/leaflet.css';

// Ícone Padrão (Azul - Você)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Ícone Vermelho (Destino)
const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Funções Auxiliares
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

// --- CONTROLADOR DO MAPA (Cérebro da Navegação) ---
const MapController = ({ currentPos, autoCenter, setAutoCenter }) => {
    const map = useMap();

    // 1. Seguir o usuário suavemente (apenas se autoCenter estiver ligado)
    useEffect(() => {
        if (currentPos && autoCenter) {
            map.panTo(currentPos, { animate: true, duration: 0.5 });
        }
    }, [currentPos, autoCenter, map]);

    // 2. Detectar se o usuário mexeu no mapa para desligar o "Seguir"
    useMapEvents({
        dragstart: () => {
            setAutoCenter(false);
        }
    });

    return null;
};

// --- COMPONENTE PRINCIPAL ---
const LiveActivityMap = ({ isActive, onDistanceUpdate, targetSpot, height, onLocationUpdate }) => {
    const [positions, setPositions] = useState([]);
    const [currentPos, setCurrentPos] = useState(null);
    const [totalDistance, setTotalDistance] = useState(0);
    const [gpsAccuracy, setGpsAccuracy] = useState(null);
    const [autoCenter, setAutoCenter] = useState(true); // Começa seguindo

    // Referência para o Mapa (para chamar o flyTo diretamente)
    const mapRef = useRef(null);
    const watchId = useRef(null);
    const defaultPosition = [-8.0631, -34.8711]; 

    // Debug: Verificar se o destino chegou
    useEffect(() => {
        if (targetSpot) {
            console.log("📍 LiveActivityMap recebeu destino:", targetSpot);
        }
    }, [targetSpot]);

    // Lógica do GPS
    useEffect(() => {
        if (!isActive) {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            return;
        }

        if ('geolocation' in navigator) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    setGpsAccuracy(accuracy);
                    if (accuracy > 100) return; 

                    const newPoint = [latitude, longitude];
                    
                    setCurrentPos(prevPos => {
                        // Envia para a tela Pai (ActivityScreen)
                        if (onLocationUpdate) onLocationUpdate(newPoint);

                        if (prevPos) {
                            const dist = calculateDistance(prevPos[0], prevPos[1], latitude, longitude);
                            if (dist > 2 && dist < 200) {
                                setTotalDistance(oldTotal => {
                                    const newTotal = oldTotal + dist;
                                    onDistanceUpdate(newTotal);
                                    return newTotal;
                                });
                                setPositions(prevRoute => [...prevRoute, newPoint]);
                            }
                        } else {
                            setPositions([newPoint]);
                        }
                        return newPoint;
                    });
                },
                (error) => console.error("Erro GPS:", error),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
            );
        }
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        };
    }, [isActive, onDistanceUpdate, onLocationUpdate]);

    const accuracyColor = gpsAccuracy && gpsAccuracy <= 20 ? 'green' : 'red';
    
    // Tratamento seguro das coordenadas do destino
    const targetCoords = targetSpot && targetSpot.latitude && targetSpot.longitude
        ? [parseFloat(targetSpot.latitude), parseFloat(targetSpot.longitude)] 
        : null;

    // Ação do Botão "Focar em Mim"
    const handleRecenter = () => {
        if (currentPos && mapRef.current) {
            setAutoCenter(true);
            mapRef.current.flyTo(currentPos, 16, { duration: 1.5 }); // Voa para o usuário
        }
    };

    return (
        <div style={{ ...styles.wrapper, height: height || '100%' }}>
            
            {/* Painel de Status */}
            <div style={styles.statsPanel}>
                <span style={styles.statLabel}>Distância</span>
                <span style={styles.statValue}>{(totalDistance / 1000).toFixed(2)} <small>km</small></span>
                <div style={{marginTop: 5, fontSize: '0.7rem', color: '#555', display: 'flex', alignItems: 'center', gap: 5}}>
                    <div style={{width: 8, height: 8, borderRadius: '50%', background: accuracyColor}}></div>
                    GPS: {gpsAccuracy ? `±${Math.round(gpsAccuracy)}m` : 'Buscando...'}
                </div>
            </div>

            {/* Botão Recentralizar (Aparece se autoCenter for false E tivermos GPS) */}
            {!autoCenter && currentPos && (
                <button onClick={handleRecenter} style={styles.recenterButton}>
                    <LocateFixed size={20} /> <span style={{fontSize: '0.8rem'}}>Focar</span>
                </button>
            )}

            <MapContainer 
                center={currentPos || defaultPosition} 
                zoom={16} 
                style={styles.mapStyle} 
                zoomControl={false}
                ref={mapRef} // Referência para controlar o mapa
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <MapController currentPos={currentPos} autoCenter={autoCenter} setAutoCenter={setAutoCenter} />

                {/* Marcador do Usuário */}
                {currentPos && (
                    <>
                        <Marker position={currentPos}><Popup>Você!</Popup></Marker>
                        <Polyline positions={positions} color="#2962FF" weight={5} />
                    </>
                )}

                {/* Marcador do Destino (Pino Vermelho) */}
                {targetCoords && (
                    <>
                        <Marker position={targetCoords} icon={RedIcon}>
                            <Popup>🎯 {targetSpot.name}</Popup>
                        </Marker>
                        
                        {/* Linha Guia */}
                        {currentPos && (
                            <Polyline 
                                positions={[currentPos, targetCoords]} 
                                color="red" 
                                dashArray="10, 10" 
                                opacity={0.6} 
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
};

const styles = {
    wrapper: { position: 'relative', width: '100%' }, 
    mapStyle: { height: '100%', width: '100%', zIndex: 1 },
    statsPanel: {
        position: 'absolute', top: '80px', right: '10px', zIndex: 999,
        background: 'rgba(255,255,255,0.9)', padding: '10px 15px',
        borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', backdropFilter: 'blur(5px)'
    },
    statLabel: { fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' },
    statValue: { fontSize: '1.4rem', fontWeight: '800', color: '#E65100', lineHeight: 1 },
    recenterButton: {
        position: 'absolute', bottom: '130px', right: '10px', zIndex: 999,
        background: 'white', color: '#333', border: 'none', borderRadius: '50px',
        padding: '10px 15px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold'
    }
};

export default LiveActivityMap;