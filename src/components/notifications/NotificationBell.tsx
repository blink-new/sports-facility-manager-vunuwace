import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Bell, Calendar, Clock, X, User, Package } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { blink } from '../../blink/client'

interface NotificationData {
  sport: string
  facility: string
  location: string
  participants: string[]
  equipment: string
  instructor: string
  date: string
  time: string
}

interface Notification {
  id: string
  user_id: string
  booking_id: string
  type: string
  title: string
  message: string
  data: string
  is_read: number
  created_at: string
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Sample data fallback
  const sampleNotifications = useMemo<Notification[]>(() => [
    {
      id: 'notif_001',
      user_id: 'user123',
      booking_id: 'book_001',
      type: 'new_booking',
      title: 'New Booking Received',
      message: 'A new padel session has been booked for Court A',
      data: '{"sport": "Padel", "facility": "Court A", "location": "123 Sports Center Ave", "participants": ["John Doe", "Jane Smith"], "equipment": "Included", "instructor": "Carlos Rodriguez", "date": "2024-01-25", "time": "14:00"}',
      is_read: 0,
      created_at: '2024-01-24T10:30:00Z'
    },
    {
      id: 'notif_002',
      user_id: 'user123',
      booking_id: 'book_002',
      type: 'rescheduled',
      title: 'Booking Rescheduled',
      message: 'Tennis session has been rescheduled to a new time',
      data: '{"sport": "Tennis", "facility": "Tennis Court B", "location": "456 Tennis Club Rd", "participants": ["Mike Johnson", "Sarah Wilson"], "equipment": "Not Included", "instructor": "Maria Garcia", "date": "2024-01-26", "time": "16:00"}',
      is_read: 0,
      created_at: '2024-01-24T09:15:00Z'
    },
    {
      id: 'notif_003',
      user_id: 'user123',
      booking_id: 'book_003',
      type: 'canceled',
      title: 'Booking Canceled',
      message: 'Golf lesson has been canceled by the participants',
      data: '{"sport": "Golf", "facility": "Golf Course", "location": "789 Golf Club Dr", "participants": ["Alex Brown", "Lisa Davis"], "equipment": "Included", "instructor": "Tom Anderson", "date": "2024-01-27", "time": "10:00"}',
      is_read: 0,
      created_at: '2024-01-24T08:45:00Z'
    }
  ], [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return <Calendar className="h-3 w-3 text-green-400" />
      case 'rescheduled':
        return <Clock className="h-3 w-3 text-yellow-400" />
      case 'canceled':
        return <X className="h-3 w-3 text-red-400" />
      case 'instructor_assigned':
        return <User className="h-3 w-3 text-blue-400" />
      case 'equipment_changed':
        return <Package className="h-3 w-3 text-purple-400" />
      default:
        return <Bell className="h-3 w-3 text-gray-400" />
    }
  }

  const getSportIcon = (sport: string) => {
    const sportIcons: { [key: string]: string } = {
      'Padel': '🏓',
      'Tennis': '🎾',
      'Golf': '⛳',
      'Squash': '🏸',
      'Basketball': '🏀',
      'Football': '⚽',
      'Volleyball': '🏐'
    }
    return sportIcons[sport] || '🏃'
  }

  const loadNotifications = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      const notificationsData = await blink.db.notifications.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        limit: 10
      })
      
      const recentNotifications = notificationsData || sampleNotifications
      setNotifications(recentNotifications)
      setUnreadCount(recentNotifications.filter(n => Number(n.is_read) === 0).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotifications(sampleNotifications)
      setUnreadCount(sampleNotifications.filter(n => Number(n.is_read) === 0).length)
    }
  }, [sampleNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      await blink.db.notifications.update(notificationId, { is_read: "1" })
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const now = new Date()
    const notificationTime = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const renderNotificationPreview = (notification: Notification) => {
    try {
      const data: NotificationData = JSON.parse(notification.data)
      
      return (
        <Card 
          key={notification.id}
          className={`bg-white/5 border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/10 ${
            Number(notification.is_read) === 0 ? 'ring-1 ring-purple-500/50' : ''
          }`}
          onClick={() => markAsRead(notification.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{getSportIcon(data.sport)}</span>
                  <h4 className="font-medium text-white text-sm truncate">{notification.title}</h4>
                  {Number(notification.is_read) === 0 && (
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                <p className="text-xs text-gray-300 truncate mb-1">{notification.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{data.facility}</span>
                  <span className="text-xs text-gray-400">{formatTime(notification.created_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    } catch (error) {
      return null
    }
  }

  useEffect(() => {
    loadNotifications()
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-purple-600 to-pink-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 bg-black/95 border-white/20 backdrop-blur-sm" 
        align="end"
        sideOffset={5}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-pink-500">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-80">
          <div className="p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(renderNotificationPreview)
            )}
          </div>
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t border-white/10">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell