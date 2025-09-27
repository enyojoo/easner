"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Download,
  Filter,
  Eye,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  UserPlus,
  TrendingUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EarlyAccessRequest {
  id: string
  email: string
  full_name: string
  whatsapp_telegram: string
  primary_use_case: string
  located_in: string
  sending_to: string
  ip_address?: string
  user_agent?: string
  status: 'pending' | 'approved' | 'rejected' | 'contacted'
  notes?: string
  created_at: string
  updated_at: string
}

interface Stats {
  total: number
  pending: number
  approved: number
  contacted: number
}

export default function AdminEarlyAccessPage() {
  const [requests, setRequests] = useState<EarlyAccessRequest[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, contacted: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [selectedRequest, setSelectedRequest] = useState<EarlyAccessRequest | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/early-access?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests)
        setStats(data.stats)
      } else {
        console.error("Error fetching requests:", data.error)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch("/api/admin/early-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes })
      })

      if (response.ok) {
        await fetchRequests() // Refresh the list
        setSelectedRequest(null)
      } else {
        console.error("Error updating request")
      }
    } catch (error) {
      console.error("Error updating request:", error)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, searchTerm])

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      contacted: "outline",
      rejected: "destructive"
    } as const

    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      contacted: <MessageCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    )
  }

  const getUseCaseName = (useCase: string) => {
    const useCases: { [key: string]: string } = {
      'family-remittances': 'Family remittances',
      'business-payments': 'Business payments',
      'education-payments': 'Education payments',
      'ecommerce': 'E-commerce',
      'investment-portfolio': 'Investment/Portfolio management',
      'api-integration': 'API integration'
    }
    return useCases[useCase] || useCase
  }

  const getCountryName = (code: string) => {
    // This would ideally come from a countries service
    const countries: { [key: string]: string } = {
      'US': 'United States',
      'NG': 'Nigeria',
      'GB': 'United Kingdom',
      'EE': 'Estonia',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'IE': 'Ireland',
      'PT': 'Portugal',
      'GR': 'Greece',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'SI': 'Slovenia',
      'SK': 'Slovakia',
      'LT': 'Lithuania',
      'LV': 'Latvia',
      'MT': 'Malta',
      'CY': 'Cyprus',
      'LU': 'Luxembourg',
      'IS': 'Iceland',
      'LI': 'Liechtenstein',
      'MC': 'Monaco',
      'SM': 'San Marino',
      'VA': 'Vatican City',
      'AD': 'Andorra',
      'JP': 'Japan',
      'KR': 'South Korea',
      'SG': 'Singapore',
      'HK': 'Hong Kong',
      'TW': 'Taiwan',
      'TH': 'Thailand',
      'MY': 'Malaysia',
      'ID': 'Indonesia',
      'PH': 'Philippines',
      'VN': 'Vietnam',
      'IN': 'India',
      'PK': 'Pakistan',
      'BD': 'Bangladesh',
      'LK': 'Sri Lanka',
      'NP': 'Nepal',
      'BT': 'Bhutan',
      'MV': 'Maldives',
      'AF': 'Afghanistan',
      'IR': 'Iran',
      'IQ': 'Iraq',
      'IL': 'Israel',
      'JO': 'Jordan',
      'LB': 'Lebanon',
      'SY': 'Syria',
      'TR': 'Turkey',
      'SA': 'Saudi Arabia',
      'AE': 'United Arab Emirates',
      'QA': 'Qatar',
      'KW': 'Kuwait',
      'BH': 'Bahrain',
      'OM': 'Oman',
      'YE': 'Yemen',
      'EG': 'Egypt',
      'LY': 'Libya',
      'TN': 'Tunisia',
      'DZ': 'Algeria',
      'MA': 'Morocco',
      'SD': 'Sudan',
      'ET': 'Ethiopia',
      'KE': 'Kenya',
      'UG': 'Uganda',
      'TZ': 'Tanzania',
      'RW': 'Rwanda',
      'BI': 'Burundi',
      'DJ': 'Djibouti',
      'SO': 'Somalia',
      'ER': 'Eritrea',
      'SS': 'South Sudan',
      'CF': 'Central African Republic',
      'TD': 'Chad',
      'NE': 'Niger',
      'ML': 'Mali',
      'BF': 'Burkina Faso',
      'CI': 'Côte d\'Ivoire',
      'GH': 'Ghana',
      'TG': 'Togo',
      'BJ': 'Benin',
      'SN': 'Senegal',
      'GM': 'Gambia',
      'GN': 'Guinea',
      'GW': 'Guinea-Bissau',
      'SL': 'Sierra Leone',
      'LR': 'Liberia',
      'CV': 'Cape Verde',
      'ST': 'São Tomé and Príncipe',
      'GQ': 'Equatorial Guinea',
      'GA': 'Gabon',
      'CG': 'Republic of the Congo',
      'CD': 'Democratic Republic of the Congo',
      'AO': 'Angola',
      'ZM': 'Zambia',
      'ZW': 'Zimbabwe',
      'BW': 'Botswana',
      'NA': 'Namibia',
      'ZA': 'South Africa',
      'LS': 'Lesotho',
      'SZ': 'Eswatini',
      'MW': 'Malawi',
      'MZ': 'Mozambique',
      'MG': 'Madagascar',
      'MU': 'Mauritius',
      'SC': 'Seychelles',
      'KM': 'Comoros',
      'YT': 'Mayotte',
      'RE': 'Réunion',
      'SH': 'Saint Helena',
      'BR': 'Brazil',
      'AR': 'Argentina',
      'CL': 'Chile',
      'UY': 'Uruguay',
      'PY': 'Paraguay',
      'BO': 'Bolivia',
      'PE': 'Peru',
      'EC': 'Ecuador',
      'CO': 'Colombia',
      'VE': 'Venezuela',
      'GY': 'Guyana',
      'SR': 'Suriname',
      'GF': 'French Guiana',
      'FK': 'Falkland Islands',
      'GS': 'South Georgia and the South Sandwich Islands',
      'MX': 'Mexico',
      'GT': 'Guatemala',
      'BZ': 'Belize',
      'SV': 'El Salvador',
      'HN': 'Honduras',
      'NI': 'Nicaragua',
      'CR': 'Costa Rica',
      'PA': 'Panama',
      'CU': 'Cuba',
      'JM': 'Jamaica',
      'HT': 'Haiti',
      'DO': 'Dominican Republic',
      'PR': 'Puerto Rico',
      'VI': 'U.S. Virgin Islands',
      'AG': 'Antigua and Barbuda',
      'BB': 'Barbados',
      'DM': 'Dominica',
      'GD': 'Grenada',
      'KN': 'Saint Kitts and Nevis',
      'LC': 'Saint Lucia',
      'VC': 'Saint Vincent and the Grenadines',
      'TT': 'Trinidad and Tobago',
      'BS': 'Bahamas',
      'RU': 'Russia',
      'CN': 'China',
      'MN': 'Mongolia',
      'KZ': 'Kazakhstan',
      'UZ': 'Uzbekistan',
      'TM': 'Turkmenistan',
      'TJ': 'Tajikistan',
      'KG': 'Kyrgyzstan',
      'AZ': 'Azerbaijan',
      'AM': 'Armenia',
      'GE': 'Georgia',
      'BY': 'Belarus',
      'UA': 'Ukraine',
      'MD': 'Moldova',
      'AL': 'Albania',
      'MK': 'North Macedonia',
      'ME': 'Montenegro',
      'RS': 'Serbia',
      'BA': 'Bosnia and Herzegovina',
      'XK': 'Kosovo',
      'NZ': 'New Zealand',
      'FJ': 'Fiji',
      'PG': 'Papua New Guinea',
      'SB': 'Solomon Islands',
      'VU': 'Vanuatu',
      'NC': 'New Caledonia',
      'PF': 'French Polynesia',
      'WS': 'Samoa',
      'TO': 'Tonga',
      'KI': 'Kiribati',
      'TV': 'Tuvalu',
      'NR': 'Nauru',
      'PW': 'Palau',
      'FM': 'Micronesia',
      'MH': 'Marshall Islands',
      'CK': 'Cook Islands',
      'NU': 'Niue',
      'TK': 'Tokelau',
      'WF': 'Wallis and Futuna',
      'AS': 'American Samoa',
      'GU': 'Guam',
      'MP': 'Northern Mariana Islands'
    }
    return countries[code] || code
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Early Access Requests</h1>
            <p className="text-gray-600">Manage and review early access applications</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requests</CardTitle>
                <CardDescription>
                  {loading ? "Loading..." : `${requests.length} request(s) found`}
                </CardDescription>
              </div>
              {selectedRequests.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Bulk Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    Bulk Reject
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No early access requests found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRequests.length === requests.length && requests.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRequests(requests.map(r => r.id))
                            } else {
                              setSelectedRequests([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Use Case</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRequests.includes(request.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRequests([...selectedRequests, request.id])
                              } else {
                                setSelectedRequests(selectedRequests.filter(id => id !== request.id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{request.full_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {request.email}
                          </div>
                        </TableCell>
                        <TableCell>{getUseCaseName(request.primary_use_case)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {getCountryName(request.located_in)} → {getCountryName(request.sending_to)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {request.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => updateRequestStatus(request.id, 'approved')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateRequestStatus(request.id, 'contacted')}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Mark as Contacted
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateRequestStatus(request.id, 'rejected')}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <p className="text-sm text-gray-600">Full information for {selectedRequest?.full_name}</p>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">WhatsApp/Telegram</label>
                    <p className="text-lg">{selectedRequest.whatsapp_telegram}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Primary Use Case</label>
                    <p className="text-lg">{getUseCaseName(selectedRequest.primary_use_case)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Located In</label>
                    <p className="text-lg">{getCountryName(selectedRequest.located_in)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sending To</label>
                    <p className="text-lg">{getCountryName(selectedRequest.sending_to)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-lg">{selectedRequest.ip_address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
                
                {selectedRequest.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-lg">{selectedRequest.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setSelectedRequest(null)}>Close</Button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateRequestStatus(selectedRequest.id, 'contacted')}
                      >
                        Mark as Contacted
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}
