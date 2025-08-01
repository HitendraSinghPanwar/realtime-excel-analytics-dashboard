import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

import PeriodCharts from './PeriodCharts'; 
import BarChart from './BarChart';
import PieChart from './PieChart'; 

const socket = io('http://localhost:8000', { transports: ['websocket'] });

const StatusDisplay = ({ message, isError = false }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className={`p-6 rounded-lg shadow-md text-center text-lg ${
            isError ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600'
        }`}>
            {message}
        </div>
    </div>
);


const Dashboard = () => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        socket.on('data_updated', (data) => {
            console.log("Received data from backend:", data); 
            if (data.error) {
                setError(data.error);
                setChartData(null);
            } else {
                setChartData(data);
                setError(null);
            }
            setIsLoading(false); 
        });

        return () => {
            socket.off('data_updated');
            socket.disconnect();
        };
    }, []);

    // 1. Loading State
    if (isLoading) {
        return <StatusDisplay message="Dashboard load ho raha hai..." />;
    }

    // 2. Error State
    if (error) {
        return <StatusDisplay message={`Error: ${error}`} isError={true} />;
    }

    // 3. Data Loaded State
    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">Team Performance Dashboard</h1>
            </header>
            
            <main>
                {chartData?.tables && Object.keys(chartData.tables).length > 0 ? (
                    Object.entries(chartData.tables).map(([periodTitle, periodData]) => (
                        <PeriodCharts key={periodTitle} title={periodTitle} data={periodData} />
                    ))
                ) : (
                    <div className="mb-10 bg-white p-6 rounded-xl shadow-lg text-center text-gray-500">
                        Period-specific data not found.
                    </div>
                )}
                
                {/* Optional: Overall Summary Section */}
                {chartData?.summary && (
                    <div className="mt-12">
                         <div className="mb-10 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-semibold mb-6 text-indigo-800 border-b border-indigo-200 pb-2">Overall Summary</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded-lg shadow-inner">
                                    <BarChart data={chartData.summary.barChart} />
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-inner">
                                    <PieChart data={chartData.summary.pieChart} />
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;