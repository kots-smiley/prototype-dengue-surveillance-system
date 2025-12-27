import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts'
import { kmeans } from 'ml-kmeans'
import { mean, standardDeviation } from 'simple-statistics'

interface BarangayData {
  id: string
  name: string
  code: string
  municipality: string
  province: string
  caseCount: number
  population: number
}

interface TimeSeriesData {
  date: string
  month: number
  year: number
  cases: number
}

export default function Analytics() {
  const [barangayData, setBarangayData] = useState<BarangayData[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [clusters, setClusters] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<string[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [riskScores, setRiskScores] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [barangayRes, timeSeriesRes] = await Promise.all([
        api.get('/dashboard/barangay-cases'),
        api.get('/dashboard/time-series?months=12')
      ])
      setBarangayData(barangayRes.data.data)
      setTimeSeriesData(timeSeriesRes.data.timeSeries)
      
      // Run all ML analyses
      performAnalyses(barangayRes.data.data, timeSeriesRes.data.timeSeries)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const performAnalyses = (data: BarangayData[], timeSeries: TimeSeriesData[]) => {
    // 1. Clustering (K-means)
    performClustering(data)
    
    // 2. Anomaly Detection
    performAnomalyDetection(data)
    
    // 3. Predictive Modeling
    performPredictiveModeling(timeSeries)
    
    // 4. Risk Assessment
    performRiskAssessment(data)
  }

  // 1. K-means Clustering
  const performClustering = (data: BarangayData[]) => {
    if (data.length < 3) return

    const k = Math.min(3, Math.floor(data.length / 2) || 1)
    const points = data.map(d => [d.caseCount])
    
    try {
      const result = kmeans(points, k, { initialization: 'kmeans++' })
      
      const clustered = data.map((item, index) => ({
        ...item,
        cluster: result.clusters[index],
        clusterName: `Cluster ${result.clusters[index] + 1}`
      }))
      
      setClusters(clustered)
    } catch (error) {
      console.error('Clustering error:', error)
    }
  }

  // 2. Anomaly Detection (Isolation Forest-like using Z-score)
  const performAnomalyDetection = (data: BarangayData[]) => {
    if (data.length < 3) return

    const caseCounts = data.map(d => d.caseCount)
    const meanCases = mean(caseCounts)
    const stdCases = standardDeviation(caseCounts)
    
    const threshold = 2 // Z-score threshold for anomalies
    const anomalous = data
      .filter(d => {
        if (stdCases === 0) return d.caseCount > meanCases
        const zScore = Math.abs((d.caseCount - meanCases) / stdCases)
        return zScore > threshold
      })
      .map(d => d.name)
    
    setAnomalies(anomalous)
  }

  // 3. Predictive Modeling (Simple Linear Regression)
  const performPredictiveModeling = (timeSeries: TimeSeriesData[]) => {
    if (timeSeries.length < 3) return

    const n = timeSeries.length
    const x = timeSeries.map((_, i) => i)
    const y = timeSeries.map(d => d.cases)
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Predict next 3 months
    const predictions = []
    for (let i = 0; i < 3; i++) {
      const futureX = n + i
      const predicted = Math.max(0, Math.round(slope * futureX + intercept))
      const lastDate = new Date(timeSeries[timeSeries.length - 1].date)
      const futureDate = new Date(lastDate)
      futureDate.setMonth(futureDate.getMonth() + i + 1)
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        month: futureDate.getMonth() + 1,
        year: futureDate.getFullYear(),
        cases: predicted,
        isPrediction: true
      })
    }
    
    setPredictions(predictions)
  }

  // 4. Risk Assessment (Based on case count and trends)
  const performRiskAssessment = (data: BarangayData[]) => {
    if (data.length === 0) return

    const maxCases = Math.max(...data.map(d => d.caseCount), 1)
    const meanCases = mean(data.map(d => d.caseCount))
    
    const riskData = data.map(item => {
      let riskScore = 0
      
      // Case count factor (0-50 points)
      if (item.caseCount > maxCases * 0.7) riskScore += 50
      else if (item.caseCount > maxCases * 0.4) riskScore += 30
      else if (item.caseCount > meanCases) riskScore += 15
      else if (item.caseCount > 0) riskScore += 5
      
      // Population density factor (if available)
      if (item.population > 0) {
        const density = item.caseCount / item.population
        if (density > 0.1) riskScore += 30
        else if (density > 0.05) riskScore += 20
        else if (density > 0.01) riskScore += 10
      }
      
      let riskLevel = 'LOW'
      if (riskScore >= 60) riskLevel = 'HIGH'
      else if (riskScore >= 30) riskLevel = 'MEDIUM'
      
      return {
        ...item,
        riskScore,
        riskLevel
      }
    }).sort((a, b) => b.riskScore - a.riskScore)
    
    setRiskScores(riskData)
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  // Prepare data for visualizations
  const clusterChartData = clusters.length > 0 
    ? clusters.reduce((acc: any, item) => {
        const cluster = item.clusterName
        if (!acc[cluster]) acc[cluster] = []
        acc[cluster].push(item)
        return acc
      }, {})
    : {}

  const clusterGroups = Object.keys(clusterChartData).map(cluster => ({
    name: cluster,
    count: clusterChartData[cluster].length,
    avgCases: mean(clusterChartData[cluster].map((d: BarangayData) => d.caseCount))
  }))

  const anomalyData = barangayData.map(item => ({
    name: item.name,
    cases: item.caseCount,
    isAnomaly: anomalies.includes(item.name)
  }))

  const historicalWithPredictions = [
    ...timeSeriesData.map(d => ({ ...d, isPrediction: false })),
    ...predictions
  ]

  const riskDistribution = riskScores.reduce((acc: any, item) => {
    acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1
    return acc
  }, {})

  const riskPieData = Object.keys(riskDistribution).map(level => ({
    name: level,
    value: riskDistribution[level],
    fill: level === 'HIGH' ? '#ef4444' : level === 'MEDIUM' ? '#f59e0b' : '#10b981'
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">ML Analytics Dashboard</h1>

      {/* 1. Clustering Visualization */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">1. Clustering Analysis (K-means)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Barangays grouped by similar case numbers to identify potential hotspots
        </p>
        {clusters.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clusterGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Barangays" fill="#0284c7" />
                <Bar dataKey="avgCases" name="Average Cases" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {Object.keys(clusterChartData).map(cluster => (
                <div key={cluster} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{cluster}</h3>
                  <p className="text-sm text-gray-600">
                    {clusterChartData[cluster].length} barangays
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg Cases: {clusterChartData[cluster].reduce((sum: number, d: BarangayData) => sum + d.caseCount, 0) / clusterChartData[cluster].length}
                  </p>
                  <div className="mt-2 text-xs">
                    {clusterChartData[cluster].slice(0, 3).map((d: BarangayData) => (
                      <div key={d.id}>{d.name} ({d.caseCount})</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Insufficient data for clustering</p>
        )}
      </div>

      {/* 2. Anomaly Detection */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">2. Anomaly Detection</h2>
        <p className="text-sm text-gray-600 mb-4">
          Barangays with unusual spikes in case numbers (Z-score &gt; 2)
        </p>
        {anomalies.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-800 mb-2">
                {anomalies.length} Anomalous Barangay{anomalies.length > 1 ? 's' : ''} Detected:
              </p>
              <div className="flex flex-wrap gap-2">
                {anomalies.map(name => {
                  const item = barangayData.find(d => d.name === name)
                  return (
                    <span key={name} className="badge badge-warning">
                      {name} ({item?.caseCount} cases)
                    </span>
                  )
                })}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis dataKey="cases" name="Cases" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Normal" data={anomalyData.filter(d => !d.isAnomaly)} fill="#10b981">
                  {anomalyData.filter(d => !d.isAnomaly).map((entry, index) => (
                    <Cell key={`cell-normal-${index}`} fill="#10b981" />
                  ))}
                </Scatter>
                <Scatter name="Anomaly" data={anomalyData.filter(d => d.isAnomaly)} fill="#ef4444">
                  {anomalyData.filter(d => d.isAnomaly).map((entry, index) => (
                    <Cell key={`cell-anomaly-${index}`} fill="#ef4444" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500">No anomalies detected</p>
        )}
      </div>

      {/* 3. Predictive Modeling */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">3. Predictive Modeling (Linear Regression)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Forecast of future dengue cases based on historical trends
        </p>
        {predictions.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalWithPredictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cases" 
                  stroke="#0284c7" 
                  strokeWidth={2}
                  name="Cases"
                  dot={{ fill: '#0284c7' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold text-blue-800 mb-2">Next 3 Months Forecast:</p>
              <div className="space-y-1">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="text-sm">
                    {new Date(pred.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: 
                    <span className="font-semibold ml-2">{pred.cases} cases (predicted)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Insufficient data for predictions</p>
        )}
      </div>

      {/* 4. Risk Assessment */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">4. Risk Assessment</h2>
        <p className="text-sm text-gray-600 mb-4">
          Risk scoring based on case count and population density
        </p>
        {riskScores.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                <h3 className="font-semibold">Top Risk Barangays:</h3>
                {riskScores.slice(0, 5).map((item, idx) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{idx + 1}. {item.name}</span>
                    <span className={`badge ${
                      item.riskLevel === 'HIGH' ? 'badge-danger' :
                      item.riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {item.riskLevel} ({item.riskScore} pts)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No risk data available</p>
        )}
      </div>

      {/* 5. Time Series Forecasting */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">5. Time Series Forecasting</h2>
        <p className="text-sm text-gray-600 mb-4">
          Historical trends and future projections
        </p>
        {timeSeriesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalWithPredictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  if (props.payload.isPrediction) {
                    return [`${value} (predicted)`, 'Cases']
                  }
                  return [value, 'Cases']
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cases" 
                stroke="#0284c7" 
                strokeWidth={2}
                name="Cases"
                dot={(props: any) => {
                  if (props.payload?.isPrediction) {
                    return <circle cx={props.cx} cy={props.cy} r={4} fill="#ef4444" strokeDasharray="5 5" />
                  }
                  return <circle cx={props.cx} cy={props.cy} r={4} fill="#0284c7" />
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No time series data available</p>
        )}
      </div>

      {/* 6. Geospatial Analysis (Barangay Distribution) */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">6. Geospatial Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Case distribution across municipalities and provinces
        </p>
        {barangayData.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barangayData.sort((a, b) => b.caseCount - a.caseCount)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="caseCount" name="Cases" fill="#0284c7" radius={[8, 8, 0, 0]}>
                  {barangayData.map((entry, index) => {
                    const maxCases = Math.max(...barangayData.map(d => d.caseCount), 1)
                    const color = entry.caseCount > maxCases * 0.7 ? '#ef4444' :
                                  entry.caseCount > maxCases * 0.4 ? '#f59e0b' : '#10b981'
                    return <Cell key={`cell-${index}`} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>

      {/* 7. Classification Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">7. Classification Summary</h2>
        <p className="text-sm text-gray-600 mb-4">
          Overview of all classifications and patterns
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Clusters</h3>
            <p className="text-2xl font-bold text-blue-600">{Object.keys(clusterChartData).length}</p>
            <p className="text-sm text-blue-600">Groups identified</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Anomalies</h3>
            <p className="text-2xl font-bold text-yellow-600">{anomalies.length}</p>
            <p className="text-sm text-yellow-600">Outliers detected</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">High Risk</h3>
            <p className="text-2xl font-bold text-green-600">
              {riskScores.filter(r => r.riskLevel === 'HIGH').length}
            </p>
            <p className="text-sm text-green-600">Barangays</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Predictions</h3>
            <p className="text-2xl font-bold text-purple-600">{predictions.length}</p>
            <p className="text-sm text-purple-600">Months forecasted</p>
          </div>
        </div>
      </div>
    </div>
  )
}
