'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, BarChart3, TrendingUp, ArrowRight, Send, Eye, MousePointerClick, FileText } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCampaigns: 0,
    sentCampaigns: 0,
    totalOpens: 0,
    totalClicks: 0,
    totalTemplates: 0,
    recentCampaigns: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, campaignsRes, templatesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/campaigns'),
        api.get('/templates').catch(() => ({ data: { data: [] } })) // fallback if templates not yet implemented
      ]);
      
      const campaigns = campaignsRes.data.data || [];
      const sentCampaigns = campaigns.filter(c => c.status === 'sent');
      const templates = templatesRes.data.data || [];
      
      let totalOpens = 0;
      let totalClicks = 0;
      sentCampaigns.forEach(c => {
        totalOpens += c.openCount || 0;
        totalClicks += c.clickCount || 0;
      });
      
      setStats({
        totalClients: (clientsRes.data.data || []).length,
        totalCampaigns: campaigns.length,
        sentCampaigns: sentCampaigns.length,
        totalOpens,
        totalClicks,
        totalTemplates: templates.length,
        recentCampaigns: campaigns.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-500', href: '/clients' },
    { title: 'Total Campaigns', value: stats.totalCampaigns, icon: Mail, color: 'bg-green-500', href: '/campaigns' },
    { title: 'Templates', value: stats.totalTemplates, icon: FileText, color: 'bg-indigo-500', href: '/templates' },
    { title: 'Sent Campaigns', value: stats.sentCampaigns, icon: Send, color: 'bg-purple-500', href: '/campaigns' },
    { title: 'Total Opens', value: stats.totalOpens, icon: Eye, color: 'bg-yellow-500', href: '/campaigns' },
    { title: 'Total Clicks', value: stats.totalClicks, icon: MousePointerClick, color: 'bg-red-500', href: '/campaigns' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Email Marketing System</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/campaigns/new">
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid - Now 6 cards, responsive grid adjusts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <Link href={stat.href} key={index}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-2 rounded-full text-white`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your email marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/clients">
                <Button variant="outline" className="w-full justify-between">
                  Manage Clients
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" className="w-full justify-between">
                  Manage Templates
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/campaigns/new">
                <Button variant="outline" className="w-full justify-between">
                  Create New Campaign
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="outline" className="w-full justify-between">
                  View All Campaigns
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Open Rate</span>
                    <span>
                      {stats.sentCampaigns > 0 && stats.totalOpens > 0
                        ? Math.round((stats.totalOpens / (stats.sentCampaigns * 100)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${stats.sentCampaigns > 0 ? Math.min(100, (stats.totalOpens / (stats.sentCampaigns * 100)) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Click Rate</span>
                    <span>
                      {stats.sentCampaigns > 0 && stats.totalClicks > 0
                        ? Math.round((stats.totalClicks / (stats.sentCampaigns * 100)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${stats.sentCampaigns > 0 ? Math.min(100, (stats.totalClicks / (stats.sentCampaigns * 100)) * 100) : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest email campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCampaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns yet. Create your first campaign!
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentCampaigns.map((campaign) => (
                  <Link href={`/campaigns/${campaign._id}`} key={campaign._id}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.recipients?.length || 0} recipients • 
                          Status: <span className={campaign.status === 'sent' ? 'text-green-600' : 'text-yellow-600'}>
                            {campaign.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {campaign.openCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" /> {campaign.clickCount || 0}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}