import { useState, useEffect } from 'react'
import { blink } from '@/blink/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/dashboard/Dashboard'
import Calendar from '@/components/calendar/Calendar'
import FacilityEditor from '@/components/facilities/FacilityEditor'
import BookingManagement from '@/components/bookings/BookingManagement'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import Profile from '@/components/profile/Profile'
import { Toaster } from '@/components/ui/toaster'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading Autsai Partners...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Autsai Partners
          </h1>
          <p className="text-white/60 mb-8">
            Comprehensive facility management platform for sports clubs, courts, fields, and gyms.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="gradient-bg text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'calendar':
        return <Calendar />
      case 'facilities':
        return <FacilityEditor />
      case 'instructors':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Instructors</h2>
            <p className="text-white/60">Instructor management coming soon...</p>
          </div>
        )
      case 'bookings':
        return <BookingManagement />
      case 'notifications':
        return <NotificationCenter />
      case 'profile':
        return <Profile />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  )
}

export default App