import React from 'react';

export default function Table ({data, getGuatemalaTimeString}){
    return (
        <table >
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
              <td>{getGuatemalaTimeString(item.created_at_local)}</td>

            </tr>
          ))}
        </tbody>
      </table>
    )
}