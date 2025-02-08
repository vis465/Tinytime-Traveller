import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';

const StockCandlestickChart = () => {
  const [series, setSeries] = useState([]);
  const [symbol, setSymbol] = useState('IBM');
  const [interval, setInterval] = useState('1week');

  const fetchStockData = async () => {
    try {
      console.log("fetching")
      const response = await axios.get(`http://localhost:5000/api/top-stocks?symbol=${symbol}&interval=${interval}`);
      console.log("fetched",response.data)
      // Check if data exists and has the expected structure
      if (response.data && response.data.data) {
        // Transform data for candlestick chart
        const transformedData = response.data.data.map(item => ({
          x: new Date(item.date),
          y: [
            parseFloat(item.open || item.last),
            parseFloat(item.high || item.last),
            parseFloat(item.low || item.last),
            parseFloat(item.close || item.last)
          ]
        }));

        setSeries([{ data: transformedData }]);
      }
    } catch (error) {
      console.error('Error fetching stock data', error);
    }
  };

  const chartOptions = {
    chart: { 
      type: 'candlestick', 
      height: 350 
    },
    title: { 
      text: `${symbol} Stock Price`, 
      align: 'left' 
    },
    xaxis: { 
      type: 'datetime',
      title: { text: 'Date' }
    },
    yaxis: { 
      tooltip: { enabled: true },
      labels: { 
        formatter: (val) => `$${val.toFixed(2)}` 
      },
      title: { text: 'Price' }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#3C90EB',
          downward: '#DF7D46'
        }
      }
    }
  };

 

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <select 
          value={symbol} 
          onChange={(e) => setSymbol(e.target.value)}
          className="border p-2"
        >
          <option value="IBM">IBM</option>
          <option value="AAPL">Apple</option>
          <option value="GOOGL">Google</option>
        </select>
        
        <select 
          value={interval} 
          onChange={(e) => setInterval(e.target.value)}
          className="border p-2"
        >
          <option value="1week">1 Week</option>
          <option value="1month">1 Month</option>
          <option value="1year">1 Year</option>
          <option value="overall">All Time</option>
        </select>
      </div>
<button onClick={fetchStockData}>ftch</button>
      <Chart 
        options={chartOptions} 
        series={series} 
        type="candlestick" 
        height={350} 
      />
    </div>
  );
};

export default StockCandlestickChart;