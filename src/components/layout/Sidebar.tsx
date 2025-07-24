import { useState } from 'react'
import { 
  Calendar, 
  Home, 
  Building2, 
  Users, 
  BookOpen, 
  Bell,
  Menu,
  X,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotificationBell from '../notifications/NotificationBell'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'calendar', name: 'Calendar', icon: Calendar },
  { id: 'facilities', name: 'Facilities', icon: Building2 },
  { id: 'instructors', name: 'Instructors', icon: Users },
  { id: 'bookings', name: 'Bookings', icon: BookOpen },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'profile', name: 'Profile', icon: User },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-black/95 backdrop-blur-sm border-r border-white/10 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  Autsai Partners
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  Sports Facility Management
                </p>
              </div>
              <NotificationBell />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setIsMobileOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                    transition-all duration-200 group
                    ${isActive 
                      ? 'gradient-bg text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Manager</p>
                <p className="text-xs text-white/60 truncate">Sports Facility</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}