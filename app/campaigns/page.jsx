'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, MousePointerClick, Send, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Définir fetchCampaigns AVANT useEffect
  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Maintenant useEffect peut appeler fetchCampaigns
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (id) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.delete(`/campaigns/${id}`);
        toast.success('Campaign deleted successfully');
        fetchCampaigns(); // recharger après suppression
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleResendCampaign = async (id) => {
    if (confirm('Resend this campaign to all recipients? This will send again even if they already received it.')) {
      try {
        await api.post(`/campaigns/${id}/send`);
        toast.success('Resend started. Check status shortly.');
        fetchCampaigns();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to resend campaign');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">Sent</Badge>;
      case 'sending':
        return <Badge className="bg-yellow-500">Sending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'partial':
        return <Badge className="bg-orange-500">Partial</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">← Back</Button>
            </Link>
            <h1 className="text-xl font-bold">Email Campaigns</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>View and manage your email campaigns</CardDescription>
              </div>
              <Link href="/campaigns/new">
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns yet. Create your first campaign!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign._id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{campaign.subject}</TableCell>
                      <TableCell>{campaign.recipients?.length || 0}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {campaign.openCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {campaign.clickCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/campaigns/${campaign._id}`}>
                            <Button variant="ghost" size="sm">
                              View Stats
                            </Button>
                          </Link>
                          {campaign.status !== 'sent' && campaign.status !== 'sending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendCampaign(campaign._id)}
                              className="gap-1"
                            >
                              <Send className="h-3 w-3" />
                              Resend
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}