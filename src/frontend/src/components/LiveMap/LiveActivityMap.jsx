import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, 18); // Zoom 18 para ver ruas de perto
    }, [position, map]);
    return null;
};

const LiveActivityMap = ({ isActive, onDistanceUpdate }) => {
    const [positions, setPositions] = useState([]);
    const [currentPos, setCurrentPos] = useState(null);
    const [totalDistance, setTotalDistance] = useState(0);
    const [gpsAccuracy, setGpsAccuracy] = useState(null);
    
    // Posição padrão
    const defaultPosition = [-8.0016, -35.0163]; 
    const watchId = useRef(null);

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

                    // --- FILTRO DE PRECISÃO ---
                    // Se a precisão for pior que 100 metros, IGNORE este ponto.
                    // Isso elimina as leituras de 2000m (Torres de celular).
                    if (accuracy > 100) {
                        console.warn(`⚠️ GPS impreciso (${accuracy}m). Ignorando ponto.`);
                        return; 
                    }

                    const newPoint = [latitude, longitude];
                    
                    setCurrentPos(prevPos => {
                        if (prevPos) {
                            const dist = calculateDistance(prevPos[0], prevPos[1], latitude, longitude);
                            
                            // Filtro de Movimento: Só registra se andar > 2m E < 100m (teletransporte)
                            if (dist > 2 && dist < 100) {
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
                { 
                    enableHighAccuracy: true, // OBRIGA usar GPS Hardware
                    timeout: 20000, 
                    maximumAge: 0 // Não aceita cache velho
                }
            );
        }

        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        };
    }, [isActive, onDistanceUpdate]);

    // Define cor da precisão
    const accuracyColor = gpsAccuracy && gpsAccuracy <= 20 ? 'green' : 'red';

    return (
        <div style={styles.wrapper}>
            <div style={styles.statsPanel}>
                <span style={styles.statLabel}>Distância</span>
                <span style={styles.statValue}>{(totalDistance / 1000).toFixed(2)} <small>km</small></span>
                
                {/* Mostra a precisão para você debugar */}
                <div style={{marginTop: 5, fontSize: '0.7rem', color: '#555', display: 'flex', alignItems: 'center', gap: 5}}>
                    <div style={{width: 8, height: 8, borderRadius: '50%', background: accuracyColor}}></div>
                    Precisão: {gpsAccuracy ? `±${Math.round(gpsAccuracy)}m` : 'Buscando...'}
                </div>
            </div>

            <MapContainer center={currentPos || defaultPosition} zoom={16} style={styles.mapStyle}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {currentPos && (
                    <>
                        <Marker position={currentPos} />
                        <Polyline positions={positions} color="#2962FF" weight={6} />
                        <RecenterMap position={currentPos} />
                    </>
                )}
            </MapContainer>

            {(!currentPos || (gpsAccuracy && gpsAccuracy > 100)) && (
                <div style={styles.gpsWarning}>
                    {gpsAccuracy > 100 
                        ? `⚠️ Sinal fraco (±${Math.round(gpsAccuracy)}m). Vá para céu aberto.` 
                        : "📡 Calibrando satélites..."}
                </div>
            )}
        </div>
    );
};

const styles = {
    wrapper: { position: 'relative', width: '100%', marginTop: '20px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #ddd' },
    mapStyle: { height: '450px', width: '100%', zIndex: 1 },
    statsPanel: {
        position: 'absolute', top: '10px', right: '10px', zIndex: 999,
        background: 'rgba(255,255,255,0.95)', padding: '10px 15px',
        borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
    },
    statLabel: { fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' },
    statValue: { fontSize: '1.5rem', fontWeight: 'bold', color: '#E65100', lineHeight: 1 },
    gpsWarning: {
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(211, 47, 47, 0.9)', color: 'white', padding: '10px 20px',
        borderRadius: '25px', textAlign: 'center', zIndex: 999, width: '90%', fontSize: '0.9rem', fontWeight: 'bold'
    }
};

export default LiveActivityMap;