import React from 'react';
import styles from './TopSection.module.css';

export default function TopSection(){
    return (
        <section className={styles.top}>
            <img src="/img/logo-cunor.png" alt="Descripción de la imagen" />
            <h1>Sensor de Temperatura y humedad DHT11</h1>
        </section>
    )
}
