import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FeedbackTrendsChart = ({ feedback }) => {
  // Helper function to format dates as "MM/DD"
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Get today's date and the date 30 days ago
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Filter feedback to the last 30 days
  const last30DaysFeedback = feedback.filter(
    (f) => new Date(f.timestamp) >= thirtyDaysAgo
  );

  // Generate labels and data for the last 30 days
  const labels = [];
  const data = [];
  let cumulativeTotalRating = 0;
  let cumulativeCount = 0;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const formattedDate = date.toLocaleDateString();
    labels.push(formatDate(formattedDate)); // Format as "MM/DD"

    // Find all feedback for this specific date
    const feedbackForDate = last30DaysFeedback.filter(
      (f) => new Date(f.timestamp).toLocaleDateString() === formattedDate
    );

    // Update cumulative totals
    feedbackForDate.forEach((f) => {
      cumulativeTotalRating += f.rating;
      cumulativeCount += 1;
    });

    // Calculate cumulative average rating
    const cumulativeAverage = cumulativeCount > 0 ? (cumulativeTotalRating / cumulativeCount).toFixed(2) : null;
    data.push(cumulativeAverage);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cumulative Average Rating',
        data,
        borderColor: 'rgba(99, 102, 241, 1)', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true, // Fill the area under the line
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: 'Cumulative Average Feedback Rating Over the Last 30 Days',
        font: {
          size: 18,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
        color: '#1F2937', // Gray-800
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1F2937', // Gray-800
        titleColor: '#F9FAFB', // Gray-50
        bodyColor: '#F9FAFB', // Gray-50
        bodyFont: {
          size: 14,
          family: 'Inter, sans-serif',
        },
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif',
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: false, // Hide the color box in tooltip
        callbacks: {
          title: (context) => {
            const date = context[0].label;
            return `Date: ${date}`;
          },
          label: (context) => {
            const value = context.raw;
            return `Cumulative Average Rating: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide x-axis grid lines
        },
        ticks: {
          color: '#6B7280', // Gray-500
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
      },
      y: {
        min: 0,
        max: 5,
        grid: {
          color: '#E5E7EB', // Gray-200
        },
        ticks: {
          color: '#6B7280', // Gray-500
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default FeedbackTrendsChart;