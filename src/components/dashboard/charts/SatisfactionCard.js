import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SatisfactionCard = ({ title, rating, trend, difference }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
    <h3 className="text-gray-500 text-sm font-medium mb-4">{title}</h3>
    <div className="flex items-center justify-between">
      <div className="flex items-baseline">
        <span className="text-4xl font-bold text-gray-900">{rating}</span>
        <span className="text-xl text-gray-400 ml-1">/5</span>
      </div>
      <div className={`flex items-center ${parseFloat(rating) > 4.0 ? 'text-green-600' : 'text-red-600'}`}>
        {parseFloat(rating) > 4.0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="ml-1 text-sm font-medium">{difference} from last hour</span>
      </div>
    </div>
  </div>
);

export default SatisfactionCard;