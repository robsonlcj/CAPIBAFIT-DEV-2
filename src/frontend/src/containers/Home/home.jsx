import CapibaraIcon from '../../assets/icon.png';
import StartButton from '../../components/StartButton/Start'
import CardDesafio from '../../components/CardsDesafio/CardDesafio';

function Home(){
    const totalAcumulado = 820; 

    return(
    <div className="home-container">
        <div className="extrato-container">
            <h2 className="extrato-titulo">Extrato de Capibas</h2>

            <div className="total-acumulado-box">
                
                <div className="icone-capibara-wrapper">
                    <img 
                        src={CapibaraIcon}
                        alt="Ícone de Capibara" 
                        className="icone-capibara" 
                    />
                </div>
                
                <div className="texto-valor-wrapper">
                    <p className="texto-acumulado">Total Acumulado</p>
                    <span className="valor-acumulado">{totalAcumulado}</span>
                </div>
                
                <div className="icones-moeda-wrapper">
                    <span className="icone-moeda um" aria-hidden="true"></span>
                    <span className="icone-moeda dois" aria-hidden="true"></span>
                </div>
            </div>
        </div>
        <div className='StartButton'>
            <StartButton onClick={() => alert('Atividade Iniciada!')} />
        </div>
        <div className='CardsDesafios'>
           
        </div>
    </div>
    );
}

export default Home;