import React from "react";
import styles from './AlertCard.module.css'

export default function AlertCard ({latest}) {
    return (
        <div className={styles.alertCard}>
            <p>⚠️ Alerta: Valores</p>
            <p>críticos en el sensor</p>
            <p><strong>Temperatura:</strong> {latest.temperatura} °C</p>
            <p><strong>Humedad:</strong> {latest.humedad} %</p>
        </div>
    )
}