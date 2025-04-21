import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import style from './CriticalDataButton.module.css';

// Crear cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CriticalDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendCriticalData = async () => {
    setLoading(true);
    setMessage('');

    // Valores críticos de ejemplo
    const criticalData = {
      temperatura: 45.5,
      humedad: 90,
    };

    // Insertar en Supabase
    const { error } = await supabase
      .from('sensor_data')
      .insert([criticalData]);

    if (error) {
      console.error('Error al insertar datos:', error);
      setMessage('❌ Error al enviar los datos.');
      setLoading(false);
      return;
    }

    // Enviar notificación por WhatsApp
    try {
      const res = await fetch('/api/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(criticalData)
      });

      if (res.ok) {
        setMessage('✅ Datos críticos enviados y alerta de WhatsApp enviada.');
      } else {
        const errorData = await res.json();
        console.error('Error en API de WhatsApp:', errorData);
        setMessage('⚠️ Datos guardados, pero no se pudo enviar la alerta.');
      }
    } catch (apiError) {
      console.error('Error llamando al API:', apiError);
      setMessage('⚠️ Datos guardados, pero hubo un error en la alerta.');
    }

    setLoading(false);
  };

  return (
    <div className={style.container}>
      <button
        onClick={sendCriticalData}
        disabled={loading}
        className={style.button}
      >
        {loading ? 'Enviando...' : 'Enviar Datos Críticos'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
