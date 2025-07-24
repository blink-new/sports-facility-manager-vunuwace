import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, DollarSign, User, Filter, Search, CheckCircle, XCircle, RotateCcw, AlertCircle, Edit3, MessageSquare, Eye } from 'lucide-react'
import { blink } from '../../blink/client'

interface Booking {
  id: string
  user_id: string
  facility_id: string
  instructor_id?: string
  sport: string
  participants: string
  start_time: string
  end_time: string
  status: string
  equipment_included: number
  payment_status: string
  total_amount: number
  price: number
  notes?: string
  internal_notes?: string
  created_at: string
  updated_at: string
}

interface BookingParticipant {
  id: string
  booking_id: string
  participant_name: string
  participant_email?: string
  participant_phone?: string
}

interface Facility {
  id: string
  name: string
  address: string
  city: string
}

interface Instructor {
  id: string
  name: string
  email: string
}

interface BookingWithDetails extends Booking {
  facility_name: string
  facility_address: string
  facility_city: string
  instructor_name?: string
  participant_list: BookingParticipant[]
}

const SPORT_COLORS = {
  padel: 'bg-purple-500',
  tennis: 'bg-green-500',
  squash: 'bg-yellow-500',
  golf: 'bg-emerald-500',
  basketball: 'bg-orange-500',
  football: 'bg-blue-500',
  volleyball: 'bg-pink-500'
}

const SPORT_ICONS = {
  padel: '🏓',
  tennis: '🎾',
  squash: '🏸',
  golf: '⛳',
  basketball: '🏀',
  football: '⚽',
  volleyball: '🏐'
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
  canceled: 'bg-red-500/20 text-red-300 border-red-500/30',
  rescheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'no-show': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
}

const getSampleBookings = (): BookingWithDetails[] => [
  {
    id: 'booking_1',
    user_id: 'user_1',
    facility_id: 'facility_1',
    instructor_id: 'instructor_1',
    sport: 'padel',
    participants: 'Maria Rodriguez, Carlos Silva',
    start_time: '2025-01-25T10:00:00',
    end_time: '2025-01-25T11:30:00',
    status: 'confirmed',
    equipment_included: 1,
    payment_status: 'paid',
    total_amount: 45,
    price: 45,
    notes: 'First time playing together',
    internal_notes: 'Regular customers, prefer Court A',
    created_at: '2025-01-20T09:00:00',
    updated_at: '2025-01-20T09:00:00',
    facility_name: 'Elite Sports Center',
    facility_address: '123 Sports Ave',
    facility_city: 'Madrid',
    instructor_name: 'Carlos Rodriguez',
    participant_list: [
      { id: 'part_1', booking_id: 'booking_1', participant_name: 'Maria Rodriguez', participant_email: 'maria@email.com' },
      { id: 'part_2', booking_id: 'booking_1', participant_name: 'Carlos Silva', participant_email: 'carlos@email.com' }
    ]
  },
  {
    id: 'booking_2',
    user_id: 'user_2',
    facility_id: 'facility_2',
    instructor_id: null,
    sport: 'tennis',
    participants: 'Ana Garcia, Luis Martinez',
    start_time: '2025-01-26T14:00:00',
    end_time: '2025-01-26T15:00:00',
    status: 'pending',
    equipment_included: 0,
    payment_status: 'pending',
    total_amount: 35,
    price: 35,
    notes: 'Need confirmation for court availability',
    internal_notes: null,
    created_at: '2025-01-21T10:00:00',
    updated_at: '2025-01-21T10:00:00',
    facility_name: 'Tennis Club Pro',
    facility_address: '456 Tennis Rd',
    facility_city: 'Barcelona',
    instructor_name: undefined,
    participant_list: [
      { id: 'part_3', booking_id: 'booking_2', participant_name: 'Ana Garcia', participant_email: 'ana@email.com' },
      { id: 'part_4', booking_id: 'booking_2', participant_name: 'Luis Martinez', participant_email: 'luis@email.com' }
    ]
  }
]

const getSampleFacilities = (): Facility[] => [
  { id: 'facility_1', name: 'Elite Sports Center', address: '123 Sports Ave', city: 'Madrid' },
  { id: 'facility_2', name: 'Tennis Club Pro', address: '456 Tennis Rd', city: 'Barcelona' }
]

const getSampleInstructors = (): Instructor[] => [
  { id: 'instructor_1', name: 'Carlos Rodriguez', email: 'carlos@instructor.com' },
  { id: 'instructor_2', name: 'Maria Lopez', email: 'maria@instructor.com' }
]

export default function BookingManagement() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [newNotes, setNewNotes] = useState('')
  
  // Filters
  const [filters, setFilters] = useState({
    sport: '',
    facility: '',
    instructor: '',
    status: '',
    dateRange: 'all', // all, today, week, month
    search: ''
  })

  const [view, setView] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load bookings
      const bookingsData = await blink.db.bookings.list({
        orderBy: { start_time: 'desc' },
        limit: 100
      })

      // Load participants
      const participantsData = await blink.db.booking_participants.list({
        limit: 1000
      })

      // Load facilities
      const facilitiesData = await blink.db.facilities.list({
        limit: 100
      })

      // Load instructors
      const instructorsData = await blink.db.instructors.list({
        limit: 100
      })

      // Combine data
      const bookingsWithDetails: BookingWithDetails[] = bookingsData.map(booking => {
        const facility = facilitiesData.find(f => f.id === booking.facility_id)
        const instructor = instructorsData.find(i => i.id === booking.instructor_id)
        const participants = participantsData.filter(p => p.booking_id === booking.id)

        return {
          ...booking,
          facility_name: facility?.name || 'Unknown Facility',
          facility_address: facility?.address || '',
          facility_city: facility?.city || '',
          instructor_name: instructor?.name,
          participant_list: participants
        }
      })

      setBookings(bookingsWithDetails)
      setFacilities(facilitiesData)
      setInstructors(instructorsData)
    } catch (error) {
      console.error('Error loading booking data:', error)
      // Fallback to sample data
      setBookings(getSampleBookings())
      setFacilities(getSampleFacilities())
      setInstructors(getSampleInstructors())
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await blink.db.bookings.update(bookingId, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
          : booking
      ))
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const updateInternalNotes = async (bookingId: string, notes: string) => {
    try {
      await blink.db.bookings.update(bookingId, { 
        internal_notes: notes,
        updated_at: new Date().toISOString()
      })
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, internal_notes: notes, updated_at: new Date().toISOString() }
          : booking
      ))
      
      setEditingNotes(null)
      setNewNotes('')
    } catch (error) {
      console.error('Error updating internal notes:', error)
    }
  }

  const assignInstructor = async (bookingId: string, instructorId: string) => {
    try {
      await blink.db.bookings.update(bookingId, { 
        instructor_id: instructorId,
        updated_at: new Date().toISOString()
      })
      
      const instructor = instructors.find(i => i.id === instructorId)
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              instructor_id: instructorId,
              instructor_name: instructor?.name,
              updated_at: new Date().toISOString()
            }
          : booking
      ))
    } catch (error) {
      console.error('Error assigning instructor:', error)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const now = new Date()
    const bookingDate = new Date(booking.start_time)
    
    // View filter
    if (view === 'upcoming' && bookingDate < now) return false
    if (view === 'past' && bookingDate >= now) return false
    
    // Other filters
    if (filters.sport && booking.sport !== filters.sport) return false
    if (filters.facility && booking.facility_id !== filters.facility) return false
    if (filters.instructor && booking.instructor_id !== filters.instructor) return false
    if (filters.status && booking.status !== filters.status) return false
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const searchableText = `
        ${booking.facility_name} 
        ${booking.sport} 
        ${booking.participant_list.map(p => p.participant_name).join(' ')}
        ${booking.instructor_name || ''}
      `.toLowerCase()
      
      if (!searchableText.includes(searchLower)) return false
    }
    
    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Management</h1>
          <p className="text-gray-400">Manage all user bookings from the Autsai app</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'upcoming'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setView('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'past'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sport Filter */}
          <select
            value={filters.sport}
            onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Sports</option>
            <option value="padel">Padel</option>
            <option value="tennis">Tennis</option>
            <option value="squash">Squash</option>
            <option value="golf">Golf</option>
            <option value="basketball">Basketball</option>
          </select>

          {/* Facility Filter */}
          <select
            value={filters.facility}
            onChange={(e) => setFilters(prev => ({ ...prev, facility: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Facilities</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>

          {/* Instructor Filter */}
          <select
            value={filters.instructor}
            onChange={(e) => setFilters(prev => ({ ...prev, instructor: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Instructors</option>
            {instructors.map(instructor => (
              <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="canceled">Canceled</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="no-show">No Show</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({
              sport: '',
              facility: '',
              instructor: '',
              status: '',
              dateRange: 'all',
              search: ''
            })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-white">{filteredBookings.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {filteredBookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Confirmed</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredBookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-white">
                €{filteredBookings.reduce((sum, b) => sum + (b.price || 0), 0).toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Sport & Facility
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-white">
                        {formatDate(booking.start_time)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg ${SPORT_COLORS[booking.sport as keyof typeof SPORT_COLORS] || 'bg-gray-500'} flex items-center justify-center text-white text-sm`}>
                        {SPORT_ICONS[booking.sport as keyof typeof SPORT_ICONS] || '🏃'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white capitalize">
                          {booking.sport}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.facility_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.facility_address}, {booking.facility_city}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {booking.participant_list.map((participant, index) => (
                        <div key={participant.id} className="flex items-center space-x-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-white">{participant.participant_name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-white">€{booking.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.equipment_included 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {booking.equipment_included ? 'Equipment Included' : 'No Equipment'}
                        </span>
                      </div>
                      {booking.instructor_name && (
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-300">{booking.instructor_name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowDetails(true)
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'canceled')}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                            title="Mark Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'no-show')}
                            className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                            title="Mark No-Show"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'rescheduled')}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Reschedule"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your filters or check back later for new bookings.
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-sm rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Booking Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Date & Time</label>
                    <p className="text-white font-medium">
                      {formatDate(selectedBooking.start_time)} at {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Sport</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{SPORT_ICONS[selectedBooking.sport as keyof typeof SPORT_ICONS] || '🏃'}</span>
                      <p className="text-white font-medium capitalize">{selectedBooking.sport}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Facility</label>
                    <p className="text-white font-medium">{selectedBooking.facility_name}</p>
                    <p className="text-gray-400 text-sm">{selectedBooking.facility_address}, {selectedBooking.facility_city}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Price</label>
                    <p className="text-white font-medium">€{selectedBooking.price}</p>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="text-sm text-gray-400">Participants</label>
                  <div className="mt-2 space-y-2">
                    {selectedBooking.participant_list.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{participant.participant_name}</p>
                          {participant.participant_email && (
                            <p className="text-gray-400 text-sm">{participant.participant_email}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment & Instructor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Equipment</label>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${
                      selectedBooking.equipment_included 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {selectedBooking.equipment_included ? 'Included' : 'Not Included'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Instructor</label>
                    <div className="mt-1">
                      {selectedBooking.instructor_name ? (
                        <p className="text-white font-medium">{selectedBooking.instructor_name}</p>
                      ) : (
                        <select
                          onChange={(e) => e.target.value && assignInstructor(selectedBooking.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Assign Instructor</option>
                          {instructors.map(instructor => (
                            <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      STATUS_COLORS[selectedBooking.status as keyof typeof STATUS_COLORS] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {selectedBooking.status}
                    </span>
                    
                    <div className="flex space-x-2">
                      {selectedBooking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              updateBookingStatus(selectedBooking.id, 'confirmed')
                              setSelectedBooking(prev => prev ? { ...prev, status: 'confirmed' } : null)
                            }}
                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              updateBookingStatus(selectedBooking.id, 'canceled')
                              setSelectedBooking(prev => prev ? { ...prev, status: 'canceled' } : null)
                            }}
                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              updateBookingStatus(selectedBooking.id, 'completed')
                              setSelectedBooking(prev => prev ? { ...prev, status: 'completed' } : null)
                            }}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              updateBookingStatus(selectedBooking.id, 'no-show')
                              setSelectedBooking(prev => prev ? { ...prev, status: 'no-show' } : null)
                            }}
                            className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-lg text-sm hover:bg-gray-500/30 transition-colors"
                          >
                            No Show
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Customer Notes</label>
                    <p className="mt-1 text-white bg-white/5 p-3 rounded-lg">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Internal Notes */}
                <div>
                  <label className="text-sm text-gray-400">Internal Notes (Partner Only)</label>
                  {editingNotes === selectedBooking.id ? (
                    <div className="mt-1 space-y-2">
                      <textarea
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Add internal notes..."
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateInternalNotes(selectedBooking.id, newNotes)}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(null)
                            setNewNotes('')
                          }}
                          className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-lg text-sm hover:bg-gray-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-start space-x-2">
                      <div className="flex-1">
                        {selectedBooking.internal_notes ? (
                          <p className="text-white bg-white/5 p-3 rounded-lg">{selectedBooking.internal_notes}</p>
                        ) : (
                          <p className="text-gray-400 italic">No internal notes</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingNotes(selectedBooking.id)
                          setNewNotes(selectedBooking.internal_notes || '')
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Edit Notes"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}