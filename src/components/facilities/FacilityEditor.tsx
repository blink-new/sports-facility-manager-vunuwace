import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Camera, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  ExternalLink,
  Euro,
  Users,
  Clock,
  Zap,
  Home,
  Sun,
  Moon
} from 'lucide-react'
import { blink } from '@/blink/client'

interface Facility {
  id: string
  user_id: string
  name: string
  description: string
  address: string
  city: string
  country: string
  google_maps_link: string
  phone: string
  email: string
  website: string
}

interface FacilitySport {
  id: string
  facility_id: string
  sport_name: string
  sport_icon: string
  description: string
  price_with_equipment: number
  price_without_equipment: number
  equipment_included: number
  equipment_list: string
  surface_type: string
  indoor_outdoor: string
  lighting: string
  court_count: number
  max_players: number
}

interface FacilityAmenity {
  id: string
  facility_id: string
  amenity_name: string
  amenity_icon: string
  description: string
  is_available: number
}

interface FacilityPhoto {
  id: string
  facility_id: string
  photo_url: string
  caption: string
  sport_type: string
  is_primary: number
}

const SPORT_OPTIONS = [
  { name: 'Padel', icon: '🏓' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Squash', icon: '🏸' },
  { name: 'Golf', icon: '⛳' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Football', icon: '⚽' },
  { name: 'Volleyball', icon: '🏐' },
  { name: 'Swimming', icon: '🏊' },
  { name: 'Fitness', icon: '💪' },
  { name: 'Yoga', icon: '🧘' }
]

const AMENITY_OPTIONS = [
  { name: 'Parking', icon: '🅿️' },
  { name: 'Showers', icon: '🚿' },
  { name: 'Lockers', icon: '🔒' },
  { name: 'Cafeteria', icon: '☕' },
  { name: 'Pro Shop', icon: '🛍️' },
  { name: 'Fitness Center', icon: '💪' },
  { name: 'Pool', icon: '🏊' },
  { name: 'Sauna', icon: '🧖' },
  { name: 'Lounge', icon: '🛋️' },
  { name: 'WiFi', icon: '📶' },
  { name: 'Air Conditioning', icon: '❄️' },
  { name: 'Heating', icon: '🔥' }
]

export default function FacilityEditor() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [sports, setSports] = useState<FacilitySport[]>([])
  const [amenities, setAmenities] = useState<FacilityAmenity[]>([])
  const [photos, setPhotos] = useState<FacilityPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [editingSport, setEditingSport] = useState<FacilitySport | null>(null)
  const [showAddSport, setShowAddSport] = useState(false)
  const [showAddAmenity, setShowAddAmenity] = useState(false)

  const loadFacilities = async () => {
    try {
      const user = await blink.auth.me()
      const facilitiesData = await blink.db.facilities.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      
      setFacilities(facilitiesData || [])
      if (facilitiesData && facilitiesData.length > 0) {
        setSelectedFacility(facilitiesData[0])
      }
    } catch (error) {
      console.error('Error loading facilities:', error)
      // Fallback to sample data
      const sampleFacilities = [
        {
          id: 'fac_001',
          user_id: 'user_001',
          name: 'Elite Sports Complex Madrid',
          description: 'Premier multi-sport facility in the heart of Madrid offering world-class courts and training facilities.',
          address: 'Calle de Alcalá 123',
          city: 'Madrid',
          country: 'Spain',
          google_maps_link: 'https://maps.google.com/?q=Calle+de+Alcalá+123+Madrid',
          phone: '+34 91 123 4567',
          email: 'info@elitesports.es',
          website: 'www.elitesports.es'
        }
      ]
      setFacilities(sampleFacilities)
      setSelectedFacility(sampleFacilities[0])
    } finally {
      setLoading(false)
    }
  }

  const loadFacilityData = async (facilityId: string) => {
    try {
      const [sportsData, amenitiesData, photosData] = await Promise.all([
        blink.db.facility_sports.list({ where: { facility_id: facilityId } }),
        blink.db.facility_amenities.list({ where: { facility_id: facilityId } }),
        blink.db.facility_photos.list({ where: { facility_id: facilityId } })
      ])
      
      setSports(sportsData || [])
      setAmenities(amenitiesData || [])
      setPhotos(photosData || [])
    } catch (error) {
      console.error('Error loading facility data:', error)
      // Fallback to sample data
      setSports([
        {
          id: 'spt_001',
          facility_id: facilityId,
          sport_name: 'Padel',
          sport_icon: '🏓',
          description: 'Professional padel courts with premium glass walls and artificial turf surface.',
          price_with_equipment: 45.00,
          price_without_equipment: 35.00,
          equipment_included: 1,
          equipment_list: '["Padel rackets", "Balls", "Court shoes"]',
          surface_type: 'Artificial Turf',
          indoor_outdoor: 'Indoor',
          lighting: 'LED Professional',
          court_count: 4,
          max_players: 4
        }
      ])
      setAmenities([
        {
          id: 'amn_001',
          facility_id: facilityId,
          amenity_name: 'Parking',
          amenity_icon: '🅿️',
          description: 'Free parking for 50 cars',
          is_available: 1
        }
      ])
    }
  }

  const saveFacility = async (facility: Facility) => {
    try {
      if (facility.id.startsWith('new_')) {
        const newId = `fac_${Date.now()}`
        await blink.db.facilities.create({
          ...facility,
          id: newId,
          user_id: (await blink.auth.me()).id
        })
      } else {
        await blink.db.facilities.update(facility.id, facility)
      }
      loadFacilities()
      setEditingFacility(null)
    } catch (error) {
      console.error('Error saving facility:', error)
    }
  }

  const saveSport = async (sport: FacilitySport) => {
    try {
      if (sport.id.startsWith('new_')) {
        const newId = `spt_${Date.now()}`
        await blink.db.facility_sports.create({
          ...sport,
          id: newId,
          facility_id: selectedFacility?.id || ''
        })
      } else {
        await blink.db.facility_sports.update(sport.id, sport)
      }
      loadFacilityData(selectedFacility?.id || '')
      setEditingSport(null)
      setShowAddSport(false)
    } catch (error) {
      console.error('Error saving sport:', error)
    }
  }

  const uploadPhoto = async (file: File, sportType?: string) => {
    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `facilities/${selectedFacility?.id}/${file.name}`,
        { upsert: true }
      )
      
      const newPhoto = {
        id: `photo_${Date.now()}`,
        facility_id: selectedFacility?.id || '',
        photo_url: publicUrl,
        caption: file.name,
        sport_type: sportType || '',
        is_primary: photos.length === 0 ? 1 : 0
      }
      
      await blink.db.facility_photos.create(newPhoto)
      loadFacilityData(selectedFacility?.id || '')
    } catch (error) {
      console.error('Error uploading photo:', error)
    }
  }

  useEffect(() => {
    loadFacilities()
  }, [])

  useEffect(() => {
    if (selectedFacility) {
      loadFacilityData(selectedFacility.id)
    }
  }, [selectedFacility])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading facilities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Facility Management</h1>
          <p className="text-gray-400 mt-2">Manage your sports facilities, sports offered, and amenities</p>
        </div>
        <Button 
          onClick={() => setEditingFacility({
            id: `new_${Date.now()}`,
            user_id: '',
            name: '',
            description: '',
            address: '',
            city: '',
            country: 'Spain',
            google_maps_link: '',
            phone: '',
            email: '',
            website: ''
          })}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Facility Selector */}
      {facilities.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Select Facility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((facility) => (
                <Card 
                  key={facility.id}
                  className={`cursor-pointer transition-all ${
                    selectedFacility?.id === facility.id 
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 border-purple-500' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedFacility(facility)}
                >
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold">{facility.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{facility.city}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {facility.address}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Editor */}
      {selectedFacility && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500">
              Sports Offered
            </TabsTrigger>
            <TabsTrigger value="amenities" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500">
              Amenities
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500">
              Photos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Facility Information</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingFacility(selectedFacility)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Facility Name</Label>
                      <p className="text-white text-lg font-semibold mt-1">{selectedFacility.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Description</Label>
                      <p className="text-gray-400 mt-1">{selectedFacility.description}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Address</Label>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <p className="text-white">{selectedFacility.address}, {selectedFacility.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Contact Information</Label>
                      <div className="space-y-2 mt-1">
                        {selectedFacility.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            <p className="text-white">{selectedFacility.phone}</p>
                          </div>
                        )}
                        {selectedFacility.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            <p className="text-white">{selectedFacility.email}</p>
                          </div>
                        )}
                        {selectedFacility.website && (
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-gray-500" />
                            <p className="text-white">{selectedFacility.website}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedFacility.google_maps_link && (
                      <div>
                        <Label className="text-gray-300">Location</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                          onClick={() => window.open(selectedFacility.google_maps_link, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Google Maps
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sports Tab */}
          <TabsContent value="sports">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Sports Offered</CardTitle>
                <Button 
                  onClick={() => setShowAddSport(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sport
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sports.map((sport) => (
                    <Card key={sport.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{sport.sport_icon}</span>
                            <h3 className="text-white font-semibold">{sport.sport_name}</h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingSport(sport)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{sport.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">With Equipment:</span>
                            <span className="text-white font-semibold">€{sport.price_with_equipment}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Without Equipment:</span>
                            <span className="text-white font-semibold">€{sport.price_without_equipment}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Courts:</span>
                            <span className="text-white">{sport.court_count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Max Players:</span>
                            <span className="text-white">{sport.max_players}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {sport.surface_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {sport.indoor_outdoor}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {sport.lighting}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Facility Amenities</CardTitle>
                <Button 
                  onClick={() => setShowAddAmenity(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Amenity
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {amenities.map((amenity) => (
                    <Card key={amenity.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-xl mr-3">{amenity.amenity_icon}</span>
                            <h3 className="text-white font-semibold">{amenity.amenity_name}</h3>
                          </div>
                          <Switch 
                            checked={Number(amenity.is_available) > 0}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-pink-500"
                          />
                        </div>
                        {amenity.description && (
                          <p className="text-gray-400 text-sm">{amenity.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Facility Photos</CardTitle>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      files.forEach(file => uploadPhoto(file))
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button 
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="bg-gray-800/50 border-gray-700 overflow-hidden">
                      <div className="aspect-video bg-gray-700 relative">
                        <img 
                          src={photo.photo_url} 
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                        {Number(photo.is_primary) > 0 && (
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-500">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-white text-sm font-medium">{photo.caption}</p>
                        {photo.sport_type && (
                          <p className="text-gray-400 text-xs mt-1">{photo.sport_type}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No photos uploaded yet</p>
                      <p className="text-gray-500 text-sm">Upload photos to showcase your facility</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Facility Dialog */}
      {editingFacility && (
        <Dialog open={!!editingFacility} onOpenChange={() => setEditingFacility(null)}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingFacility.id.startsWith('new_') ? 'Add New Facility' : 'Edit Facility'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Facility Name</Label>
                  <Input 
                    value={editingFacility.name}
                    onChange={(e) => setEditingFacility({...editingFacility, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">City</Label>
                  <Input 
                    value={editingFacility.city}
                    onChange={(e) => setEditingFacility({...editingFacility, city: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <Textarea 
                  value={editingFacility.description}
                  onChange={(e) => setEditingFacility({...editingFacility, description: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-gray-300">Address</Label>
                <Input 
                  value={editingFacility.address}
                  onChange={(e) => setEditingFacility({...editingFacility, address: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <Input 
                    value={editingFacility.phone}
                    onChange={(e) => setEditingFacility({...editingFacility, phone: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input 
                    value={editingFacility.email}
                    onChange={(e) => setEditingFacility({...editingFacility, email: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Website</Label>
                  <Input 
                    value={editingFacility.website}
                    onChange={(e) => setEditingFacility({...editingFacility, website: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Google Maps Link</Label>
                  <Input 
                    value={editingFacility.google_maps_link}
                    onChange={(e) => setEditingFacility({...editingFacility, google_maps_link: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setEditingFacility(null)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => saveFacility(editingFacility)}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Sport Dialog */}
      {(showAddSport || editingSport) && (
        <Dialog open={showAddSport || !!editingSport} onOpenChange={() => {
          setShowAddSport(false)
          setEditingSport(null)
        }}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingSport ? 'Edit Sport' : 'Add New Sport'}
              </DialogTitle>
            </DialogHeader>
            <SportEditor 
              sport={editingSport || {
                id: `new_${Date.now()}`,
                facility_id: selectedFacility?.id || '',
                sport_name: '',
                sport_icon: '🏓',
                description: '',
                price_with_equipment: 0,
                price_without_equipment: 0,
                equipment_included: 0,
                equipment_list: '[]',
                surface_type: '',
                indoor_outdoor: 'Indoor',
                lighting: '',
                court_count: 1,
                max_players: 4
              }}
              onSave={saveSport}
              onCancel={() => {
                setShowAddSport(false)
                setEditingSport(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Sport Editor Component
function SportEditor({ 
  sport, 
  onSave, 
  onCancel 
}: { 
  sport: FacilitySport
  onSave: (sport: FacilitySport) => void
  onCancel: () => void 
}) {
  const [editingSport, setEditingSport] = useState(sport)

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-300">Sport</Label>
          <Select 
            value={editingSport.sport_name}
            onValueChange={(value) => {
              const selectedSport = SPORT_OPTIONS.find(s => s.name === value)
              setEditingSport({
                ...editingSport, 
                sport_name: value,
                sport_icon: selectedSport?.icon || '🏓'
              })
            }}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {SPORT_OPTIONS.map((option) => (
                <SelectItem key={option.name} value={option.name} className="text-white">
                  {option.icon} {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-300">Court Count</Label>
          <Input 
            type="number"
            value={editingSport.court_count}
            onChange={(e) => setEditingSport({...editingSport, court_count: parseInt(e.target.value) || 1})}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Description</Label>
        <Textarea 
          value={editingSport.description}
          onChange={(e) => setEditingSport({...editingSport, description: e.target.value})}
          className="bg-gray-800 border-gray-700 text-white"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-300">Price with Equipment (€)</Label>
          <Input 
            type="number"
            step="0.01"
            value={editingSport.price_with_equipment}
            onChange={(e) => setEditingSport({...editingSport, price_with_equipment: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div>
          <Label className="text-gray-300">Price without Equipment (€)</Label>
          <Input 
            type="number"
            step="0.01"
            value={editingSport.price_without_equipment}
            onChange={(e) => setEditingSport({...editingSport, price_without_equipment: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-gray-300">Surface Type</Label>
          <Input 
            value={editingSport.surface_type}
            onChange={(e) => setEditingSport({...editingSport, surface_type: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="e.g., Clay, Artificial Turf"
          />
        </div>
        <div>
          <Label className="text-gray-300">Indoor/Outdoor</Label>
          <Select 
            value={editingSport.indoor_outdoor}
            onValueChange={(value) => setEditingSport({...editingSport, indoor_outdoor: value})}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="Indoor" className="text-white">
                <Home className="w-4 h-4 mr-2 inline" />
                Indoor
              </SelectItem>
              <SelectItem value="Outdoor" className="text-white">
                <Sun className="w-4 h-4 mr-2 inline" />
                Outdoor
              </SelectItem>
              <SelectItem value="Both" className="text-white">
                Both
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-300">Max Players</Label>
          <Input 
            type="number"
            value={editingSport.max_players}
            onChange={(e) => setEditingSport({...editingSport, max_players: parseInt(e.target.value) || 4})}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Lighting</Label>
        <Input 
          value={editingSport.lighting}
          onChange={(e) => setEditingSport({...editingSport, lighting: e.target.value})}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="e.g., LED Professional, Floodlights"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(editingSport)}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Sport
        </Button>
      </div>
    </div>
  )
}