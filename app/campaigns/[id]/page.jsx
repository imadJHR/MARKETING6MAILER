'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Eye,
  MousePointerClick,
  ArrowLeft,
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Link as LinkIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignDetails();
  }, [params.id]);

  const fetchCampaignDetails = async () => {
    try {
      const [campaignRes, statsRes] = await Promise.all([
        api.get(`/campaigns/${params.id}`),
        api.get(`/campaigns/${params.id}/stats`),
      ]);
      setCampaign(campaignRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load campaign details');
      router.push('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading campaign data...</div>
      </div>
    );
  }

  if (!campaign) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const pieData = [
    { name: 'Opens', value: stats?.opens?.unique || 0 },
    { name: 'Clicks', value: stats?.clicks?.unique || 0 },
    {
      name: 'No Action',
      value: (campaign.recipients?.length || 0) - (stats?.opens?.unique || 0),
    },
  ];

  const urlData = stats?.clicks?.byUrl
    ? Object.entries(stats.clicks.byUrl).map(([url, count]) => ({
        url: url.length > 50 ? url.substring(0, 50) + '...' : url,
        fullUrl: url,
        clicks: count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/campaigns">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold">{campaign.name}</h1>
              <Badge
                variant={
                  campaign.status === 'sent'
                    ? 'default'
                    : campaign.status === 'sending'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {campaign.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recipients</p>
                  <p className="text-2xl font-bold">
                    {campaign.recipients?.length || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Rate</p>
                  <p className="text-2xl font-bold">{stats?.openRate || 0}%</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Click Rate</p>
                  <p className="text-2xl font-bold">{stats?.clickRate || 0}%</p>
                </div>
                <MousePointerClick className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sent Date</p>
                  <p className="text-sm font-medium">
                    {campaign.sentAt
                      ? new Date(campaign.sentAt).toLocaleDateString()
                      : 'Not sent'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Open Timeline (Last 7 days)</CardTitle>
              <CardDescription>Daily open events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.openTimeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Engagement Breakdown</CardTitle>
              <CardDescription>Opens vs Clicks vs No Action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Clicked Links */}
        {urlData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Top Clicked Links
              </CardTitle>
              <CardDescription>
                Most popular links in this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urlData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm break-all">
                        <a
                          href={item.fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">{item.clicks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Individual Opens & Clicks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Opens by Recipient
              </CardTitle>
              <CardDescription>
                Who opened this email (unique opens)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Opened At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.opens?.events?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No opens recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                    {stats?.opens?.events?.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>{event.clientId?.email || 'Unknown'}</TableCell>
                        <TableCell>{event.clientId?.name || '-'}</TableCell>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5" />
                Clicks by Recipient
              </CardTitle>
              <CardDescription>Who clicked links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Clicked URL</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.clicks?.events?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No clicks recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                    {stats?.clicks?.events?.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>{event.clientId?.email || 'Unknown'}</TableCell>
                        <TableCell>{event.clientId?.name || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {event.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}