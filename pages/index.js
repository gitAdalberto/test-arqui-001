import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

import SensorCard from './src/componentes/SensorCard';
import TopSection from './src/componentes/TopSection';
import Table from './src/componentes/Table';
import AlertCard from './src/componentes/AlertCard';
import CriticalDataButton from './src/componentes/CriticalDataButton';

const TEMP_CRITICA = 35; // temperatura crítica en °C
const HUM_CRITICA = 80;  // humedad crítica en %

// Registrar los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

// Crear el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [], // Eje X: Tiempos o fechas
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: [], // Eje Y: Temperaturas
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
      {
        label: 'Humedad (%)',
        data: [], // Eje Y: Humedad
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
      }
    ]
  });

  // Función para obtener los datos desde la tabla
  const fetchData = async () => {
    const { data, error } = await supabase.rpc('get_sensor_data_local').limit(100);

    if (error) {
      console.error('Error fetching data hola mundo: ', error);
    } else {
      setData(data);
    }
  };

  // Función para actualizar el gráfico
  const updateChart = (newData) => {
    const latestData = newData.slice(0, 100); // Solo los últimos 30 datos
  
    setChartData((prevChartData) => {
      const newLabels = latestData.map(item => getGuatemalaTimeString(item.created_at_local));
      const newTemperatures = latestData.map(item => item.temperatura);
      const newHumidity = latestData.map(item => item.humedad);
  
      return {
        labels: newLabels,
        datasets: [
          { ...prevChartData.datasets[0], data: newTemperatures },
          { ...prevChartData.datasets[1], data: newHumidity }
        ]
      };
    });
  };
  

  // Efecto para suscribirse a los cambios en la tabla `sensor_data`
  useEffect(() => {
    // Llamar a fetchData para obtener los datos iniciales
    fetchData();

    // Crear un canal de tiempo real para suscribirse a cambios en la tabla
    const channel = supabase
      .channel('realtime:sensor_data')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Solo nos interesan las inserciones
          schema: 'public',
          table: 'sensor_data',
        },
        (payload) => {
          // Cuando hay un nuevo dato, agregarlo al estado
          console.log('Nuevo dato recibido:', payload.new);
          setData((prev) => [payload.new, ...prev]);
          updateChart([payload.new, ...data]); // Actualizar el gráfico con los nuevos datos
        }
      )
      .subscribe();

    // Cleanup para eliminar el canal cuando el componente se desmonte
    return () => {
      supabase.removeChannel(channel);
    };
  },);

  useEffect(() => {
    // Solo actualizar el gráfico si los datos han cambiado
    if (data.length > 0) {
      updateChart(data); // Actualiza el gráfico con los datos actuales
    }
  }, [data]); // Este effect se ejecutará cada vez que `data` cambie

  const latest = data[0];

  const getGuatemalaTimeString = (utcString) => {
    const dateUTC = new Date(utcString);
    const guatemalaDate = new Date(dateUTC.getTime() - 6 * 60 * 60 * 1000);
    return guatemalaDate.toLocaleString('es-GT');
  };
  
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#fff'
        }
      },
      tooltip: {
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div>

      <TopSection></TopSection>

      {/* Mostrar el gráfico */}
      <div className='chart'>
        <Line data={chartData} options={chartOptions}/>
      </div>

      {/* Tabla de datos */}
      <div className='sensor-table'>
        <div className='leftSection'>
          {latest && (
            <SensorCard 
            latest={latest}
            getGuatemalaTimeString={getGuatemalaTimeString}>
            </SensorCard>
          )}
          
          {
            latest && (latest.temperatura > TEMP_CRITICA || latest.humedad > HUM_CRITICA) && (
              <AlertCard latest={latest}></AlertCard>
            )
          }
          <CriticalDataButton></CriticalDataButton>
        </div>
        <Table 
        data={data} 
        getGuatemalaTimeString={getGuatemalaTimeString}></Table>
      </div>
    </div>
  );
}
