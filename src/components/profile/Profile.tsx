import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { User, Building2, CreditCard, Camera, MapPin, Clock, Shield, AlertTriangle, Save, X, Edit2, Eye, EyeOff, Settings, FileText, Trash2, Globe, Bell, ToggleLeft, ToggleRight } from 'lucide-react'
import { blink } from '../../blink/client'

interface PartnerProfile {
  id: string
  user_id: string
  full_name: string
  role: string
  profile_photo_url?: string
  email: string
  phone_number: string
  preferred_language?: string
  notification_preferences?: string
  booking_auto_accept?: boolean
  cancellation_policy?: string
  cancellation_penalty?: number
  terms_accepted?: boolean
  terms_accepted_at?: string
  account_deletion_requested?: boolean
  account_deletion_requested_at?: string
}

interface FacilityProfile {
  id: string
  user_id: string
  facility_name: string
  legal_business_name?: string
  address: string
  google_maps_link?: string
  sports_offered: string[]
  operating_hours: Record<string, { open: string; close: string }>
  club_description: string
}

interface PayoutInfo {
  id: string
  user_id: string
  account_holder_name: string
  bank_account_number: string
  swift_bic_code: string
  bank_name: string
  billing_email: string
  vat_tax_id?: string
  payout_frequency: string
}

const SPORTS_OPTIONS = [
  { value: 'padel', label: 'Padel', icon: '🏓' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'squash', label: 'Squash', icon: '🏸' },
  { value: 'golf', label: 'Golf', icon: '⛳' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'football', label: 'Football', icon: '⚽' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' }
]

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function Profile() {
  const [activeSection, setActiveSection] = useState<'account' | 'facility' | 'payout' | 'settings' | 'legal'>('account')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Profile data states
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null)
  const [facilityProfile, setFacilityProfile] = useState<FacilityProfile | null>(null)
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo | null>(null)

  // Form states
  const [formData, setFormData] = useState<any>({})
  const [originalData, setOriginalData] = useState<any>({})

  // Sample data for demonstration
  const samplePartnerProfile = useMemo(() => ({
    id: 'profile_1',
    user_id: 'user_1',
    full_name: 'Carlos Rodriguez',
    role: 'Owner',
    profile_photo_url: '',
    email: 'carlos@sportsclub.com',
    phone_number: '+34 612 345 678',
    preferred_language: 'English',
    notification_preferences: 'Both',
    booking_auto_accept: false,
    cancellation_policy: '24h',
    cancellation_penalty: 25,
    terms_accepted: true,
    terms_accepted_at: '2024-01-15T10:30:00Z',
    account_deletion_requested: false
  }), [])

  const sampleFacilityProfile = useMemo(() => ({
    id: 'facility_1',
    user_id: 'user_1',
    facility_name: 'Elite Sports Center',
    legal_business_name: 'Elite Sports Center S.L.',
    address: 'Calle del Deporte 123, Madrid, Spain',
    google_maps_link: 'https://maps.google.com/?q=Calle+del+Deporte+123+Madrid+Spain',
    sports_offered: ['padel', 'tennis', 'squash', 'fitness'],
    operating_hours: {
      monday: { open: '07:00', close: '23:00' },
      tuesday: { open: '07:00', close: '23:00' },
      wednesday: { open: '07:00', close: '23:00' },
      thursday: { open: '07:00', close: '23:00' },
      friday: { open: '07:00', close: '23:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '22:00' }
    },
    club_description: 'Premier sports facility offering world-class courts and professional instruction for padel, tennis, and squash. Modern facilities with top-tier equipment and experienced coaches.'
  }), [])

  const samplePayoutInfo = useMemo(() => ({
    id: 'payout_1',
    user_id: 'user_1',
    account_holder_name: 'Carlos Rodriguez',
    bank_account_number: '****1234',
    swift_bic_code: 'BBVAESMM',
    bank_name: 'BBVA España',
    billing_email: 'billing@sportsclub.com',
    vat_tax_id: 'ESB12345678',
    payout_frequency: 'Monthly'
  }), [])

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Try to load from database, fallback to sample data
      try {
        const [partnerResult, facilityResult, payoutResult] = await Promise.all([
          blink.db.partner_profiles.list({ where: { user_id: 'user_1' }, limit: 1 }),
          blink.db.facility_profiles.list({ where: { user_id: 'user_1' }, limit: 1 }),
          blink.db.payout_information.list({ where: { user_id: 'user_1' }, limit: 1 })
        ])

        setPartnerProfile(partnerResult[0] || samplePartnerProfile)
        setFacilityProfile(facilityResult[0] ? {
          ...facilityResult[0],
          sports_offered: JSON.parse(facilityResult[0].sports_offered || '[]'),
          operating_hours: JSON.parse(facilityResult[0].operating_hours || '{}')
        } : sampleFacilityProfile)
        setPayoutInfo(payoutResult[0] || samplePayoutInfo)
      } catch (error) {
        console.error('Database error, using sample data:', error)
        setPartnerProfile(samplePartnerProfile)
        setFacilityProfile(sampleFacilityProfile)
        setPayoutInfo(samplePayoutInfo)
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }, [samplePartnerProfile, sampleFacilityProfile, samplePayoutInfo])

  const getCurrentSectionData = () => {
    switch (activeSection) {
      case 'account':
      case 'settings':
      case 'legal':
        return partnerProfile || {}
      case 'facility':
        return facilityProfile || {}
      case 'payout':
        return payoutInfo || {}
      default:
        return {}
    }
  }

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  const handleEdit = () => {
    const currentData = getCurrentSectionData()
    setFormData({ ...currentData })
    setOriginalData({ ...currentData })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData({})
    setOriginalData({})
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      // Save to database based on active section
      if ((activeSection === 'account' || activeSection === 'settings' || activeSection === 'legal') && partnerProfile) {
        await blink.db.partner_profiles.update(partnerProfile.id, formData)
        setPartnerProfile({ ...partnerProfile, ...formData })
      } else if (activeSection === 'facility' && facilityProfile) {
        const updateData = {
          ...formData,
          sports_offered: JSON.stringify(formData.sports_offered || []),
          operating_hours: JSON.stringify(formData.operating_hours || {})
        }
        await blink.db.facility_profiles.update(facilityProfile.id, updateData)
        setFacilityProfile({ ...facilityProfile, ...formData })
      } else if (activeSection === 'payout' && payoutInfo) {
        await blink.db.payout_information.update(payoutInfo.id, formData)
        setPayoutInfo({ ...payoutInfo, ...formData })
      }

      setIsEditing(false)
      setFormData({})
      setOriginalData({})
    } catch (error) {
      console.error('Error saving profile data:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSportsChange = (sport: string, checked: boolean) => {
    const currentSports = formData.sports_offered || []
    if (checked) {
      setFormData((prev: any) => ({
        ...prev,
        sports_offered: [...currentSports, sport]
      }))
    } else {
      setFormData((prev: any) => ({
        ...prev,
        sports_offered: currentSports.filter((s: string) => s !== sport)
      }))
    }
  }

  const handleOperatingHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours?.[day],
          [type]: value
        }
      }
    }))
  }

  const generateGoogleMapsLink = (address: string) => {
    if (!address) return ''
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`
  }

  const handleTermsAcceptance = (accepted: boolean) => {
    const timestamp = accepted ? new Date().toISOString() : null
    setFormData((prev: any) => ({
      ...prev,
      terms_accepted: accepted,
      terms_accepted_at: timestamp
    }))
  }

  const handleAccountDeletion = async () => {
    try {
      const timestamp = new Date().toISOString()
      await blink.db.partner_profiles.update(partnerProfile!.id, {
        account_deletion_requested: true,
        account_deletion_requested_at: timestamp
      })
      setPartnerProfile(prev => prev ? {
        ...prev,
        account_deletion_requested: true,
        account_deletion_requested_at: timestamp
      } : null)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error requesting account deletion:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-purple-600 to-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account, facility, and payout information</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
        {[
          { key: 'account', label: 'Account Info', icon: User },
          { key: 'facility', label: 'Facility Info', icon: Building2 },
          { key: 'payout', label: 'Payout Info', icon: CreditCard },
          { key: 'settings', label: 'Platform Settings', icon: Settings },
          { key: 'legal', label: 'Legal & Privacy', icon: FileText }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all flex-1 justify-center whitespace-nowrap ${
              activeSection === key
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        {/* Account Info Section */}
        {activeSection === 'account' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Account Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(isEditing ? formData.full_name : partnerProfile?.full_name)?.charAt(0) || 'U'}
                  </div>
                  {isEditing && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                      <Camera className="w-4 h-4" />
                      Upload Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{partnerProfile?.full_name}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                {isEditing ? (
                  <select
                    value={formData.role || ''}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{partnerProfile?.role}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <p className="text-gray-400 bg-gray-700/30 px-3 py-2 rounded-lg">{partnerProfile?.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number / WhatsApp</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+34 612 345 678"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{partnerProfile?.phone_number}</p>
                )}
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Platform Settings Section */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Platform Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Language */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Preferred Language
                </label>
                {isEditing ? (
                  <select
                    value={formData.preferred_language || ''}
                    onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{partnerProfile?.preferred_language || 'English'}</p>
                )}
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  Notifications
                </label>
                {isEditing ? (
                  <select
                    value={formData.notification_preferences || ''}
                    onChange={(e) => handleInputChange('notification_preferences', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Email">Email Only</option>
                    <option value="Push">Push Only</option>
                    <option value="Both">Both Email & Push</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{partnerProfile?.notification_preferences || 'Both'}</p>
                )}
              </div>

              {/* Booking Auto-Accept */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Booking Auto-Accept</label>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <button
                      onClick={() => handleInputChange('booking_auto_accept', !formData.booking_auto_accept)}
                      className="flex items-center gap-2"
                    >
                      {formData.booking_auto_accept ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                      <span className="text-white">
                        {formData.booking_auto_accept ? 'Enabled' : 'Disabled'}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                      {partnerProfile?.booking_auto_accept ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-white">
                        {partnerProfile?.booking_auto_accept ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically accept bookings without manual confirmation
                </p>
              </div>

              {/* Cancellation Policy */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cancellation Policy</label>
                {isEditing ? (
                  <div className="space-y-3">
                    <select
                      value={formData.cancellation_policy || ''}
                      onChange={(e) => handleInputChange('cancellation_policy', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="12h">12 hours before</option>
                      <option value="24h">24 hours before</option>
                      <option value="48h">48 hours before</option>
                    </select>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Penalty % (Optional)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.cancellation_penalty || 0}
                        onChange={(e) => handleInputChange('cancellation_penalty', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700/50 px-3 py-2 rounded-lg">
                    <p className="text-white">
                      {partnerProfile?.cancellation_policy === '12h' && '12 hours before'}
                      {partnerProfile?.cancellation_policy === '24h' && '24 hours before'}
                      {partnerProfile?.cancellation_policy === '48h' && '48 hours before'}
                    </p>
                    {partnerProfile?.cancellation_penalty && partnerProfile.cancellation_penalty > 0 && (
                      <p className="text-sm text-gray-300 mt-1">
                        Penalty: {partnerProfile.cancellation_penalty}%
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legal & Privacy Section */}
        {activeSection === 'legal' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Legal & Privacy</h2>
            </div>

            <div className="space-y-6">
              {/* Terms and Conditions */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.terms_accepted || false}
                      onChange={(e) => handleTermsAcceptance(e.target.checked)}
                      className="mt-1 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                  ) : (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                      partnerProfile?.terms_accepted 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-600'
                    }`}>
                      {partnerProfile?.terms_accepted && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">I accept the Terms and Conditions</p>
                    {partnerProfile?.terms_accepted_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Accepted on: {new Date(partnerProfile.terms_accepted_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Policy Link */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Privacy Policy</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Learn how we collect, use, and protect your data
                    </p>
                  </div>
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all text-sm"
                  >
                    View Policy
                  </a>
                </div>
              </div>

              {/* Account Deletion */}
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-red-200 font-medium">Account Deletion</h3>
                    <p className="text-red-300 text-sm mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    {partnerProfile?.account_deletion_requested ? (
                      <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/30 rounded">
                        <p className="text-yellow-200 text-sm">
                          Account deletion requested on {new Date(partnerProfile.account_deletion_requested_at!).toLocaleDateString()}. 
                          Our team will process your request within 30 days.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Request Account Deletion
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facility Info Section */}
        {activeSection === 'facility' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Facility Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facility Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Facility Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.facility_name || ''}
                    onChange={(e) => handleInputChange('facility_name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{facilityProfile?.facility_name}</p>
                )}
              </div>

              {/* Legal Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Legal Business Name <span className="text-gray-500">(Optional)</span></label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.legal_business_name || ''}
                    onChange={(e) => handleInputChange('legal_business_name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{facilityProfile?.legal_business_name || 'Not specified'}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => {
                        handleInputChange('address', e.target.value)
                        handleInputChange('google_maps_link', generateGoogleMapsLink(e.target.value))
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Street address, city, country"
                    />
                    {formData.address && (
                      <p className="text-xs text-gray-400">
                        Google Maps link will be auto-generated: {generateGoogleMapsLink(formData.address)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{facilityProfile?.address}</p>
                    {facilityProfile?.google_maps_link && (
                      <a
                        href={facilityProfile.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm underline"
                      >
                        View on Google Maps
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Sports Offered */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Sports Offered</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SPORTS_OPTIONS.map((sport) => (
                      <label key={sport.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.sports_offered || []).includes(sport.value)}
                          onChange={(e) => handleSportsChange(sport.value, e.target.checked)}
                          className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-white text-sm">
                          {sport.icon} {sport.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {facilityProfile?.sports_offered?.map((sport) => {
                      const sportOption = SPORTS_OPTIONS.find(s => s.value === sport)
                      return (
                        <span
                          key={sport}
                          className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-sm"
                        >
                          {sportOption?.icon} {sportOption?.label}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Operating Hours */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Operating Hours
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {WEEKDAYS.map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <span className="text-white capitalize w-20 text-sm">{day}:</span>
                        <input
                          type="time"
                          value={formData.operating_hours?.[day]?.open || ''}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={formData.operating_hours?.[day]?.close || ''}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {WEEKDAYS.map((day) => {
                      const hours = facilityProfile?.operating_hours?.[day]
                      return (
                        <div key={day} className="flex justify-between items-center bg-gray-700/50 px-3 py-2 rounded">
                          <span className="text-white capitalize">{day}</span>
                          <span className="text-gray-300 text-sm">
                            {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Club Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Club Description</label>
                {isEditing ? (
                  <textarea
                    value={formData.club_description || ''}
                    onChange={(e) => handleInputChange('club_description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your facility for users in the Autsai app..."
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{facilityProfile?.club_description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payout Info Section */}
        {activeSection === 'payout' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Payout Information</h2>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-200 font-medium">Important Notice</p>
                  <p className="text-yellow-300 text-sm mt-1">
                    All payouts are processed through the Autsai app. Please ensure your information is accurate to receive earnings.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Holder Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.account_holder_name || ''}
                    onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{payoutInfo?.account_holder_name}</p>
                )}
              </div>

              {/* Bank Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bank Account Number / IBAN</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.bank_account_number || ''}
                    onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="ES91 2100 0418 4502 0005 1332"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg flex-1">
                      {showBankDetails ? payoutInfo?.bank_account_number : '****1234'}
                    </p>
                    <button
                      onClick={() => setShowBankDetails(!showBankDetails)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showBankDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* SWIFT/BIC Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SWIFT/BIC Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.swift_bic_code || ''}
                    onChange={(e) => handleInputChange('swift_bic_code', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="BBVAESMM"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{payoutInfo?.swift_bic_code}</p>
                )}
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.bank_name || ''}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{payoutInfo?.bank_name}</p>
                )}
              </div>

              {/* Billing Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Billing Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.billing_email || ''}
                    onChange={(e) => handleInputChange('billing_email', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{payoutInfo?.billing_email}</p>
                )}
              </div>

              {/* VAT/Tax ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">VAT or Tax ID <span className="text-gray-500">(Optional)</span></label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.vat_tax_id || ''}
                    onChange={(e) => handleInputChange('vat_tax_id', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="ESB12345678"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{payoutInfo?.vat_tax_id || 'Not specified'}</p>
                )}
              </div>

              {/* Payout Frequency */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Payout Frequency</label>
                {isEditing ? (
                  <select
                    value={formData.payout_frequency || ''}
                    onChange={(e) => handleInputChange('payout_frequency', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700/50 px-3 py-2 rounded-lg">{payoutInfo?.payout_frequency}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center gap-4 pt-6 border-t border-gray-700">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all">
                Update Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-red-600/50 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Request Account Deletion</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to request account deletion? This will:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Delete all your facility and booking data</li>
                <li>• Remove your profile and settings</li>
                <li>• Cancel all future bookings</li>
                <li>• Process final payouts within 30 days</li>
              </ul>
              <p className="text-red-300 text-sm font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleAccountDeletion}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Request Deletion
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}