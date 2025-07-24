import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Bell, Check, X, Clock, User, Package, Calendar, MapPin, Users } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
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
  old_date?: string
  old_time?: string
  old_instructor?: string
  old_equipment?: string
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

interface NotificationSettings {
  id: string
  user_id: string
  email_enabled: number
  sms_enabled: number
  push_enabled: number
  new_booking_enabled: number
  rescheduled_enabled: number
  canceled_enabled: number
  instructor_assigned_enabled: number
  equipment_changed_enabled: number
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

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
      data: '{"sport": "Tennis", "facility": "Tennis Court B", "location": "456 Tennis Club Rd", "participants": ["Mike Johnson", "Sarah Wilson"], "equipment": "Not Included", "instructor": "Maria Garcia", "date": "2024-01-26", "time": "16:00", "old_date": "2024-01-25", "old_time": "15:00"}',
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
    },
    {
      id: 'notif_004',
      user_id: 'user123',
      booking_id: 'book_004',
      type: 'instructor_assigned',
      title: 'Instructor Assigned',
      message: 'New instructor assigned to squash session',
      data: '{"sport": "Squash", "facility": "Squash Court 1", "location": "321 Squash Center", "participants": ["David Lee", "Emma Taylor"], "equipment": "Not Included", "instructor": "Pedro Martinez", "date": "2024-01-28", "time": "18:00", "old_instructor": "None"}',
      is_read: 0,
      created_at: '2024-01-24T07:20:00Z'
    }
  ], [])

  const sampleSettings = useMemo<NotificationSettings>(() => ({
    id: 'settings_001',
    user_id: 'user123',
    email_enabled: 1,
    sms_enabled: 0,
    push_enabled: 1,
    new_booking_enabled: 1,
    rescheduled_enabled: 1,
    canceled_enabled: 1,
    instructor_assigned_enabled: 1,
    equipment_changed_enabled: 1
  }), [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return <Calendar className="h-4 w-4 text-green-400" />
      case 'rescheduled':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'canceled':
        return <X className="h-4 w-4 text-red-400" />
      case 'instructor_assigned':
        return <User className="h-4 w-4 text-blue-400" />
      case 'equipment_changed':
        return <Package className="h-4 w-4 text-purple-400" />
      default:
        return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_booking':
        return 'bg-green-500/10 border-green-500/20'
      case 'rescheduled':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'canceled':
        return 'bg-red-500/10 border-red-500/20'
      case 'instructor_assigned':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'equipment_changed':
        return 'bg-purple-500/10 border-purple-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
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
        limit: 50
      })
      
      setNotifications(notificationsData || sampleNotifications)
      setUnreadCount(notificationsData?.filter(n => Number(n.is_read) === 0).length || 4)
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotifications(sampleNotifications)
      setUnreadCount(4)
    }
  }, [sampleNotifications])

  const loadSettings = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      const settingsData = await blink.db.notification_settings.list({
        where: { user_id: user.id },
        limit: 1
      })
      
      if (settingsData && settingsData.length > 0) {
        setSettings(settingsData[0])
      } else {
        setSettings(sampleSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSettings(sampleSettings)
    }
  }, [sampleSettings])

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

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => Number(n.is_read) === 0)
      for (const notification of unreadNotifications) {
        await blink.db.notifications.update(notification.id, { is_read: "1" })
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const updateSettings = async (key: string, value: boolean) => {
    if (!settings) return
    
    try {
      const updatedSettings = { ...settings, [key]: value ? 1 : 0 }
      await blink.db.notification_settings.update(settings.id, { [key]: value ? 1 : 0 })
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const renderNotificationDetails = (notification: Notification) => {
    try {
      const data: NotificationData = JSON.parse(notification.data)
      
      return (
        <div className="space-y-3 mt-3 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getSportIcon(data.sport)}</span>
            <span className="font-medium text-white">{data.sport}</span>
            <Badge variant="outline" className="text-xs">
              {data.facility}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{data.date} at {data.time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>{data.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span>{data.participants.join(', ')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Package className="h-4 w-4" />
              <span>Equipment: {data.equipment}</span>
            </div>
            
            {data.instructor && data.instructor !== 'None' && (
              <div className="flex items-center gap-2 text-gray-300">
                <User className="h-4 w-4" />
                <span>Instructor: {data.instructor}</span>
              </div>
            )}
          </div>
          
          {/* Show changes for rescheduled/updated notifications */}
          {notification.type === 'rescheduled' && data.old_date && (
            <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded">
              Changed from: {data.old_date} at {data.old_time}
            </div>
          )}
          
          {notification.type === 'instructor_assigned' && data.old_instructor && (
            <div className="text-xs text-blue-400 bg-blue-500/10 p-2 rounded">
              Previous instructor: {data.old_instructor}
            </div>
          )}
          
          {notification.type === 'equipment_changed' && data.old_equipment && (
            <div className="text-xs text-purple-400 bg-purple-500/10 p-2 rounded">
              Changed from: {data.old_equipment}
            </div>
          )}
        </div>
      )
    } catch (error) {
      return null
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([loadNotifications(), loadSettings()])
      setLoading(false)
    }
    
    initializeData()
  }, [loadNotifications, loadSettings])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-white" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-purple-600 to-pink-500">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400">Stay updated with all booking activity</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead}
            variant="outline" 
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500">
            Notifications ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notifications yet</h3>
                <p className="text-gray-400">You'll see booking activity notifications here</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`${getNotificationColor(notification.type)} ${
                      Number(notification.is_read) === 0 ? 'ring-1 ring-white/20' : ''
                    } transition-all duration-200 hover:bg-white/10`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white">{notification.title}</h3>
                              {Number(notification.is_read) === 0 && (
                                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-600 to-pink-500">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-400">{formatTime(notification.created_at)}</p>
                            
                            {renderNotificationDetails(notification)}
                          </div>
                        </div>
                        
                        {Number(notification.is_read) === 0 && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {settings && (
            <>
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Delivery Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications" className="text-white">
                      Push Notifications
                    </Label>
                    <Switch
                      id="push-notifications"
                      checked={Number(settings.push_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('push_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="text-white">
                      Email Notifications
                    </Label>
                    <Switch
                      id="email-notifications"
                      checked={Number(settings.email_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('email_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications" className="text-white">
                      SMS Notifications
                    </Label>
                    <Switch
                      id="sms-notifications"
                      checked={Number(settings.sms_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('sms_enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Notification Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <Label htmlFor="new-booking" className="text-white">
                        New Bookings
                      </Label>
                    </div>
                    <Switch
                      id="new-booking"
                      checked={Number(settings.new_booking_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('new_booking_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <Label htmlFor="rescheduled" className="text-white">
                        Rescheduled Bookings
                      </Label>
                    </div>
                    <Switch
                      id="rescheduled"
                      checked={Number(settings.rescheduled_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('rescheduled_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-400" />
                      <Label htmlFor="canceled" className="text-white">
                        Canceled Bookings
                      </Label>
                    </div>
                    <Switch
                      id="canceled"
                      checked={Number(settings.canceled_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('canceled_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <Label htmlFor="instructor-assigned" className="text-white">
                        Instructor Changes
                      </Label>
                    </div>
                    <Switch
                      id="instructor-assigned"
                      checked={Number(settings.instructor_assigned_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('instructor_assigned_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-400" />
                      <Label htmlFor="equipment-changed" className="text-white">
                        Equipment Changes
                      </Label>
                    </div>
                    <Switch
                      id="equipment-changed"
                      checked={Number(settings.equipment_changed_enabled) > 0}
                      onCheckedChange={(checked) => updateSettings('equipment_changed_enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotificationCenter