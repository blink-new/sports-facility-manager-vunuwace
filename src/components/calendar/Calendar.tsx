import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, Users, MapPin, Clock, Award, Package } from 'lucide-react'
import { blink } from '../../blink/client'

// Sport icons mapping
const sportIcons = {
  padel: '🏓',
  tennis: '🎾', 
  golf: '⛳',
  squash: '🟡',
  basketball: '🏀',
  football: '⚽',
  volleyball: '🏐',
  badminton: '🏸'
}

// Sport colors for calendar events
const sportColors = {
  padel: 'bg-purple-500',
  tennis: 'bg-green-500',
  golf: 'bg-emerald-500', 
  squash: 'bg-yellow-500',
  basketball: 'bg-orange-500',
  football: 'bg-blue-500',
  volleyball: 'bg-red-500',
  badminton: 'bg-pink-500'
}

interface Booking {
  id: string
  date: string
  time: string
  participants: string[]
  facility: string
  location: string
  sport: string
  equipmentIncluded: boolean
  instructor?: string
  duration: number
}

type ViewMode = 'daily' | 'weekly' | 'monthly'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('weekly')
  const [selectedSport, setSelectedSport] = useState<string>('all')
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Load bookings from database
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const user = await blink.auth.me()
        if (user) {
          // Load bookings for this facility manager
          const bookingsData = await blink.db.bookings.list({
            where: { user_id: user.id },
            orderBy: { date: 'asc', time: 'asc' }
          })
          
          // Transform database data to component format
          const transformedBookings: Booking[] = bookingsData.map((booking: any) => ({
            id: booking.id,
            date: booking.date,
            time: booking.time,
            participants: JSON.parse(booking.participants || '[]'),
            facility: booking.facility,
            location: booking.location,
            sport: booking.sport,
            equipmentIncluded: Number(booking.equipment_included) > 0,
            instructor: booking.instructor,
            duration: booking.duration
          }))
          
          setBookings(transformedBookings)
        }
      } catch (error) {
        console.error('Error loading bookings:', error)
        // Fallback to sample data for demo
        const sampleBookings: Booking[] = [
          {
            id: '1',
            date: '2025-01-22',
            time: '09:00',
            participants: ['Sarah Johnson', 'Mike Chen'],
            facility: 'Court A',
            location: '123 Sports Center, Downtown',
            sport: 'tennis',
            equipmentIncluded: true,
            instructor: 'Carlos Rodriguez',
            duration: 60
          },
          {
            id: '2', 
            date: '2025-01-22',
            time: '14:30',
            participants: ['Emma Wilson', 'David Park', 'Lisa Brown'],
            facility: 'Padel Court 1',
            location: '456 Athletic Club, Midtown',
            sport: 'padel',
            equipmentIncluded: false,
            duration: 90
          },
          {
            id: '3',
            date: '2025-01-23',
            time: '11:00',
            participants: ['John Smith', 'Alex Turner'],
            facility: 'Golf Course - Hole 1',
            location: '789 Golf Resort, Suburbs',
            sport: 'golf',
            equipmentIncluded: true,
            instructor: 'Maria Santos',
            duration: 120
          },
          {
            id: '4',
            date: '2025-01-23',
            time: '16:00',
            participants: ['Rachel Green', 'Tom Wilson'],
            facility: 'Squash Court B',
            location: '123 Sports Center, Downtown',
            sport: 'squash',
            equipmentIncluded: false,
            duration: 45
          },
          {
            id: '5',
            date: '2025-01-24',
            time: '10:30',
            participants: ['Kevin Lee', 'Sophie Davis'],
            facility: 'Basketball Court 1',
            location: '321 Community Center, Eastside',
            sport: 'basketball',
            equipmentIncluded: true,
            instructor: 'James Miller',
            duration: 60
          }
        ]
        setBookings(sampleBookings)
      }
    }
    
    loadBookings()
  }, [])

  const filteredBookings = bookings.filter(booking => {
    const sportMatch = selectedSport === 'all' || booking.sport === selectedSport
    const instructorMatch = selectedInstructor === 'all' || booking.instructor === selectedInstructor
    return sportMatch && instructorMatch
  })

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getBookingsForDate = (date: string) => {
    return filteredBookings.filter(booking => booking.date === date)
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'daily') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'weekly') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const uniqueSports = [...new Set(bookings.map(b => b.sport))]
  const uniqueInstructors = [...new Set(bookings.map(b => b.instructor).filter(Boolean))]

  const renderBookingCard = (booking: Booking) => (
    <div
      key={booking.id}
      className={`${sportColors[booking.sport as keyof typeof sportColors]} bg-opacity-20 border-l-4 ${sportColors[booking.sport as keyof typeof sportColors]} p-3 rounded-r-lg mb-2 hover:bg-opacity-30 transition-all cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{sportIcons[booking.sport as keyof typeof sportIcons]}</span>
            <span className="text-white font-medium capitalize">{booking.sport}</span>
            <Clock className="w-4 h-4 text-gray-300" />
            <span className="text-gray-300 text-sm">{booking.time}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">{booking.participants.join(', ')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">{booking.facility}</span>
            </div>
            
            <div className="text-gray-400 text-xs">{booking.location}</div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-300">
                  Equipment: {booking.equipmentIncluded ? 'Included' : 'Not included'}
                </span>
              </div>
              
              {booking.instructor && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-300">{booking.instructor}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDailyView = () => {
    const dateStr = formatDate(currentDate)
    const dayBookings = getBookingsForDate(dateStr)
    
    return (
      <div className="bg-gray-900/50 rounded-lg p-6">
        <h3 className="text-white text-lg font-medium mb-4">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        
        {dayBookings.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No bookings for this day</div>
        ) : (
          <div className="space-y-2">
            {dayBookings.map(renderBookingCard)}
          </div>
        )}
      </div>
    )
  }

  const renderWeeklyView = () => {
    const weekDays = getWeekDays(currentDate)
    
    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dateStr = formatDate(day)
          const dayBookings = getBookingsForDate(dateStr)
          const isToday = dateStr === formatDate(new Date())
          
          return (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4">
              <div className={`text-center mb-3 ${isToday ? 'text-white font-bold' : 'text-gray-300'}`}>
                <div className="text-sm">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-lg ${isToday ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dayBookings.map(renderBookingCard)}
              </div>
              
              {dayBookings.length === 0 && (
                <div className="text-gray-500 text-xs text-center py-4">No bookings</div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderMonthlyView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
      if (days.length >= 42) break
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-gray-400 text-center text-sm font-medium p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dateStr = formatDate(day)
            const dayBookings = getBookingsForDate(dateStr)
            const isCurrentMonth = day.getMonth() === month
            const isToday = dateStr === formatDate(new Date())
            
            return (
              <div
                key={index}
                className={`min-h-24 p-2 border border-gray-800 ${
                  isCurrentMonth ? 'bg-gray-900/50' : 'bg-gray-900/20'
                } hover:bg-gray-800/50 transition-colors cursor-pointer`}
              >
                <div className={`text-sm mb-1 ${
                  isToday ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : 
                  isCurrentMonth ? 'text-white' : 'text-gray-500'
                }`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      className={`${sportColors[booking.sport as keyof typeof sportColors]} bg-opacity-60 text-white text-xs p-1 rounded truncate`}
                    >
                      {booking.time} {sportIcons[booking.sport as keyof typeof sportIcons]}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-gray-400 text-xs">+{dayBookings.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Calendar</h1>
          <p className="text-gray-400">Unified view of all bookings across facilities</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Sport</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Sports</option>
                {uniqueSports.map(sport => (
                  <option key={sport} value={sport}>
                    {sportIcons[sport as keyof typeof sportIcons]} {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Instructor</label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Instructors</option>
                {uniqueInstructors.map(instructor => (
                  <option key={instructor} value={instructor}>{instructor}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateDate('prev')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <h2 className="text-xl font-semibold text-white">
          {viewMode === 'monthly' 
            ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : viewMode === 'weekly'
            ? `Week of ${getWeekDays(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          }
        </h2>
        
        <button
          onClick={() => navigateDate('next')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar View */}
      <div className="min-h-96">
        {viewMode === 'daily' && renderDailyView()}
        {viewMode === 'weekly' && renderWeeklyView()}
        {viewMode === 'monthly' && renderMonthlyView()}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{filteredBookings.length}</div>
          <div className="text-gray-400 text-sm">Total Bookings</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{uniqueSports.length}</div>
          <div className="text-gray-400 text-sm">Sports Offered</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{uniqueInstructors.length}</div>
          <div className="text-gray-400 text-sm">Active Instructors</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">
            {filteredBookings.filter(b => b.equipmentIncluded).length}
          </div>
          <div className="text-gray-400 text-sm">With Equipment</div>
        </div>
      </div>
    </div>
  )
}