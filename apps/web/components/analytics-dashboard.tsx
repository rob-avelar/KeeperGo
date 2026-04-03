
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Activity, 
  Star,
  Download,
  Loader2,
  BarChart3,
  Clock,
  Trophy,
  MapPin
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface AnalyticsData {
  summary: {
    totalMatches: number
    totalHoursPlayed: number
    avgMatchDuration: number
    avgRatingGiven: number
    currentMonthMatches: number
    activityTrend: number
  }
  charts: {
    monthlyData: Array<{ month: string; matches: number; totalHours: number }>
    topGoalkeepers: Array<{ id: string; name: string; matches: number; avgRating: number }>
    peakHours: Array<{ hour: number; matches: number }>
    fieldTypes: Array<{ type: string; count: number }>
  }
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'all'>('12m')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/organizer')
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = (format: 'csv' | 'json') => {
    if (!data) return

    let content = ''
    let filename = `keepergo-analytics-${new Date().toISOString().split('T')[0]}`
    
    if (format === 'csv') {
      // CSV format
      content = 'Month,Matches,Total Hours\n'
      data.charts.monthlyData.forEach(row => {
        content += `${row.month},${row.matches},${row.totalHours}\n`
      })
      filename += '.csv'
    } else {
      // JSON format
      content = JSON.stringify(data, null, 2)
      filename += '.json'
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-400">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  const { summary, charts } = data

  // Monthly activity chart data
  const monthlyChartData = {
    labels: charts.monthlyData.map(d => {
      const [year, month] = d.month.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    datasets: [
      {
        label: 'Matches Organized',
        data: charts.monthlyData.map(d => d.matches),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Peak hours chart data
  const peakHoursData = {
    labels: charts.peakHours.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'Number of Matches',
        data: charts.peakHours.map(h => h.matches),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  }

  // Field types chart data
  const fieldTypesData = {
    labels: charts.fieldTypes.map(f => f.type),
    datasets: [
      {
        data: charts.fieldTypes.map(f => f.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Analytics Dashboard</h2>
          <p className="text-gray-400">Insights into your match activity and performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{summary.totalMatches}</div>
                <p className="text-xs text-gray-400 mt-1">Completed</p>
              </div>
              <Activity className="h-8 w-8 text-lime-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Hours Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{summary.totalHoursPlayed}h</div>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <Clock className="h-8 w-8 text-lime-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Avg Match Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{summary.avgMatchDuration}h</div>
                <p className="text-xs text-gray-400 mt-1">Per match</p>
              </div>
              <BarChart3 className="h-8 w-8 text-lime-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{summary.currentMonthMatches} matches</div>
                {summary.activityTrend !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {summary.activityTrend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-orange-600" />
                    )}
                    <span className={`text-xs ${summary.activityTrend > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {Math.abs(summary.activityTrend).toFixed(1)}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <Trophy className="h-8 w-8 text-lime-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity Trend</CardTitle>
            <CardDescription>Matches organized in the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={monthlyChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-lime-400" />
              Peak Match Hours
            </CardTitle>
            <CardDescription>Most common match times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={peakHoursData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Field Types */}
        {charts.fieldTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-lime-400" />
                Field Type Distribution
              </CardTitle>
              <CardDescription>Preferred field types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="w-full max-w-xs">
                  <Doughnut data={fieldTypesData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Goalkeepers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-lime-400" />
              Most Booked Goalkeepers
            </CardTitle>
            <CardDescription>Your go-to goalkeepers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {charts.topGoalkeepers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No data available yet
                </p>
              ) : (
                charts.topGoalkeepers.map((gk, index) => (
                  <div key={gk.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lime-400/10 text-lime-400 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{gk.name}</p>
                        <p className="text-sm text-gray-400">{gk.matches} matches</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <p className="font-semibold text-gray-100">{gk.avgRating > 0 ? gk.avgRating.toFixed(1) : 'N/A'}</p>
                      </div>
                      <p className="text-xs text-gray-400">avg rating</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
