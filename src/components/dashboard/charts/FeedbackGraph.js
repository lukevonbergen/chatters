import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FeedbackGraph = ({ feedback, questions }) => {
  // Transform feedback data into a format suitable for the chart
  const formatDataForChart = () => {
    const dataByTimestamp = {};

    feedback.forEach((f) => {
      const timestamp = new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!dataByTimestamp[timestamp]) {
        dataByTimestamp[timestamp] = { timestamp };
      }
      dataByTimestamp[timestamp][`Q${f.question_id}`] = f.rating;
    });

    return Object.values(dataByTimestamp);
  };

  const chartData = formatDataForChart();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Feedback Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          {questions.map((q) => (
            <Line
              key={q.id}
              type="monotone"
              dataKey={`Q${q.id}`}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color for each line
              name={q.question}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeedbackGraph;