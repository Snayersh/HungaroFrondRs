import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const getRandomColor = (index) => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f1c40f',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
    '#7f8c8d', '#ff6b6b', '#6c5ce7', '#00b894',
    '#fd79a8', '#dfe6e9', '#00cec9', '#fdcb6e',
  ];
  return colors[index % colors.length];
};

const MatrixChart = ({ assignments, matrix, rowLabels }) => {
  if (
    !assignments ||
    !matrix ||
    matrix.length === 0 ||
    assignments.length === 0
  ) {
    return <p style={{ textAlign: 'center' }}>No hay datos para mostrar el gráfico.</p>;
  }

  const labels = assignments.map((col, row) =>
    rowLabels?.[row] || `Empleado ${row + 1}`
  );

  const values = assignments.map((col, row) => {
    const fila = matrix[row];
    if (!fila || col === null || col === undefined) return 0;
    return fila[col] ?? 0;
  });

  const backgroundColors = assignments.map((_, i) => getRandomColor(i));

  const data = {
    labels,
    datasets: [
      {
        label: 'Costo de Asignación',
        data: values,
        backgroundColor: backgroundColors,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Q (Quetzales)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Empleados',
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
        Gráfico de Asignaciones
      </h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default MatrixChart;
