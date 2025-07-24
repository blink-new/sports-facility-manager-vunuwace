import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  Building2, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Bell
} from 'lucide-react'

interface Booking {
  id: string
  facilityName: string
  instructorName: string
  clientName: string
  time: string
  date: string
  status: 'confirmed' | 'pending' | 'cancelled'
  type: 'individual' | 'group'
  participants: number
}

export function Dashboard() {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([
    {
      id: '1',
      facilityName: 'Tennis Court A',
      instructorName: 'Sarah Johnson',
      clientName: 'John Smith',
      time: '10:00 AM',
      date: 'Today',
      status: 'confirmed',
      type: 'individual',
      participants: 1
    },
    {
      id: '2',
      facilityName: 'Padel Court 1',
      instructorName: 'Mike Rodriguez',
      clientName: 'Team Alpha',
      time: '2:00 PM',
      date: 'Today',
      status: 'pending',
      type: 'group',
      participants: 4
    },
    {
      id: '3',
      facilityName: 'Gym Studio',
      instructorName: 'Lisa Chen',
      clientName: 'Fitness Group',
      time: '6:00 PM',
      date: 'Tomorrow',
      status: 'confirmed',
      type: 'group',
      participants: 8
    }
  ])

  const stats = [
    {
      title: 'Today\'s Bookings',
      value: '12',
      change: '+3 from yesterday',
      icon: Calendar,
      color: 'text-blue-400'
    },
    {
      title: 'Active Instructors',
      value: '8',
      change: '2 available now',
      icon: Users,
      color: 'text-green-400'
    },
    {
      title: 'Facilities',
      value: '15',
      change: '3 courts, 2 fields, 10 others',
      icon: Building2,
      color: 'text-purple-400'
    },
    {
      title: 'Revenue Today',
      value: '$2,450',
      change: '+15% from yesterday',
      icon: TrendingUp,
      color: 'text-coral-400'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Button className="gradient-bg text-white hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                    <p className="text-white/40 text-xs mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{booking.facilityName}</h4>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60">
                    {booking.instructorName} • {booking.clientName}
                  </p>
                  <p className="text-sm text-white/40">
                    {booking.date} at {booking.time} • {booking.participants} {booking.type === 'group' ? 'participants' : 'participant'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-white border-white/20 hover:bg-white/5">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Session
            </Button>
            <Button variant="outline" className="w-full justify-start text-white border-white/20 hover:bg-white/5">
              <Users className="h-4 w-4 mr-2" />
              Add New Instructor
            </Button>
            <Button variant="outline" className="w-full justify-start text-white border-white/20 hover:bg-white/5">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Facilities
            </Button>
            <Button variant="outline" className="w-full justify-start text-white border-white/20 hover:bg-white/5">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
              <div>
                <p className="text-white font-medium">New booking request</p>
                <p className="text-white/60 text-sm">Tennis Court B requested for tomorrow 3:00 PM</p>
                <p className="text-white/40 text-xs mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
              <div>
                <p className="text-white font-medium">Booking confirmed</p>
                <p className="text-white/60 text-sm">Padel Court 1 session with Mike Rodriguez confirmed</p>
                <p className="text-white/40 text-xs mt-1">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
              <div>
                <p className="text-white font-medium">Instructor availability updated</p>
                <p className="text-white/60 text-sm">Sarah Johnson updated her schedule for next week</p>
                <p className="text-white/40 text-xs mt-1">10 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}