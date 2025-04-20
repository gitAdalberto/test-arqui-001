import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

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
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data: ', error);
    } else {
      setData(data);
    }
  };

  // Función para actualizar el gráfico
  const updateChart = (newData) => {
    setChartData((prevChartData) => {
      const newLabels = newData.map(item => new Date(item.created_at).toLocaleTimeString());
      const newTemperatures = newData.map(item => item.temperatura);
      const newHumidity = newData.map(item => item.humedad);

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
  }, [data]);

  return (
    <div>
      <h1>Datos del Sensor</h1>
      
    

      {/* Mostrar el gráfico */}
      <div>
        <Line data={chartData} />
      </div>

      {/* Tabla de datos */}
      <table>
        <thead>
          <tr>
            <th>Temperatura (°C)</th>
            <th>Humedad (%)</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.temperatura}</td>
              <td>{item.humedad}</td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
