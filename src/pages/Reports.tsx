import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, TrendingUp, FileText, Calendar, Users } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  // Empty data arrays - Connect to your backend
  const participationData: any[] = [];
  const healthTrendsData: any[] = [];
  const monthlyData: any[] = [];

  const downloadReport = (reportType: string) => {
    // Empty CSV generation - Connect to your backend
    const csvData = '';
    
    const header = 'Month,Camps,Beneficiaries,Schemes\n';
    const blob = new Blob([header + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">रिपोर्ट और विश्लेषण</h1>
          <p className="text-gray-600">स्वास्थ्य शिविर और योजनाओं की व्यापक जानकारी</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-auto"
          >
            <option value="3months">पिछले 3 महीने</option>
            <option value="6months">पिछले 6 महीने</option>
            <option value="1year">पिछला एक वर्ष</option>
          </select>
          <button
            onClick={() => downloadReport('comprehensive')}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>रिपोर्ट निर्यात करें</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">कुल शिविर</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-400">डेटा लोड हो रहा है...</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">लाभार्थी</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-400">डेटा लोड हो रहा है...</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">स्वीकृत योजनाएं</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-400">डेटा लोड हो रहा है...</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">सफलता दर</p>
              <p className="text-2xl font-bold text-gray-900">0%</p>
              <p className="text-xs text-gray-400">डेटा लोड हो रहा है...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheme Participation Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">योजनावार भागीदारी</h3>
            <button
              onClick={() => downloadReport('participation')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>निर्यात करें</span>
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={participationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {participationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'भागीदारी']}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Issues Trends Bar Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">स्वास्थ्य समस्या प्रवृत्तियाँ</h3>
            <button
              onClick={() => downloadReport('health-trends')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>निर्यात करें</span>
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="issue" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {healthTrendsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">मासिक अवलोकन</h3>
          <button
            onClick={() => downloadReport('monthly')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="camps" fill="#0E7DFF" name="शिविर" radius={[2, 2, 0, 0]} />
              <Bar dataKey="beneficiaries" fill="#10B981" name="लाभार्थी" radius={[2, 2, 0, 0]} />
              <Bar dataKey="schemes" fill="#F59E0B" name="योजनाएं" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">शिविर प्रदर्शन</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">औसत उपस्थिति</span>
              <span className="text-sm font-medium text-gray-900">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">पूर्णता दर</span>
              <span className="text-sm font-medium text-gray-900">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">संतुष्टि स्कोर</span>
              <span className="text-sm font-medium text-gray-900">0/5</span>
            </div>
          </div>
          <button
            onClick={() => downloadReport('camp-performance')}
            className="w-full mt-4 btn-secondary text-sm"
          >
            पूरी रिपोर्ट डाउनलोड करें
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">योजना विश्लेषण</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">स्वीकृति दर</span>
              <span className="text-sm font-medium text-gray-900">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">औसत प्रसंस्करण समय</span>
              <span className="text-sm font-medium text-gray-900">0 दिन</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">कुल वितरित राशि</span>
              <span className="text-sm font-medium text-gray-900">₹0</span>
            </div>
          </div>
          <button
            onClick={() => downloadReport('scheme-analytics')}
            className="w-full mt-4 btn-secondary text-sm"
          >
            पूरी रिपोर्ट डाउनलोड करें
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">स्वास्थ्य मापदंड</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">स्वास्थ्य जांच</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">फॉलो-अप दर</span>
              <span className="text-sm font-medium text-gray-900">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">जोखिम वाले मामले</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
          </div>
          <button
            onClick={() => downloadReport('health-metrics')}
            className="w-full mt-4 btn-secondary text-sm"
          >
            पूरी रिपोर्ट डाउनलोड करें
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
