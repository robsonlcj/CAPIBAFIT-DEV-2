import React from 'react';
import ChallengeList from '../../components/Challenges/ChallengeList.jsx';

function Desafios() {
    return (
        <div style={styles.pageContainer}>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Meus Desafios 🏆</h1>
                <p style={styles.subtitle}>Complete missões para ganhar Capibas!</p>
            </div>

            {/* Aqui usamos o modo 'grid' para listar verticalmente */}
            <ChallengeList viewMode="grid" />
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#FAFAFA',
        paddingTop: '20px',
    },
    header: {
        padding: '0 20px',
        marginBottom: '10px'
    },
    pageTitle: {
        margin: 0,
        color: '#E65100',
        fontSize: '1.8rem'
    },
    subtitle: {
        margin: '5px 0 0 0',
        color: '#666',
        fontSize: '0.9rem'
    }
};

export default Desafios;