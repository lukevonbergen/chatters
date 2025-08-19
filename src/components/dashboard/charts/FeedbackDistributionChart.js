import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FeedbackDistributionChart = ({ feedback }) => {
  // Count feedback by rating (1 to 5)
  const ratingCounts = [0, 0, 0, 0, 0];
  feedback.forEach((f) => {
    if (f.rating >= 1 && f.rating <= 5) {
      ratingCounts[Math.floor(f.rating) - 1]++;
    }
  });

  const chartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Feedback Count',
        data: ratingCounts,
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Feedback Distribution by Rating',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default FeedbackDistributionChart;