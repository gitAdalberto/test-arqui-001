import React from 'react';
import styles from './SensorCard.module.css';

export default function SensorCard({latest, getGuatemalaTimeString}){
    return (
        <div className={styles.sensor}>
        <h2>Último Registro</h2>
        <p><strong>Temperatura:</strong> {latest.temperatura} °C</p>
        <p><strong>Humedad:</strong> {latest.humedad} %</p>
        <p><strong>Fecha:</strong> {getGuatemalaTimeString(latest.created_at_local)}</p>
    </div>
    )
}