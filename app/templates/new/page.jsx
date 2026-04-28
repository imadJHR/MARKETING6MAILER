'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';

export default function TemplateFormPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id;
  const isEditing = !!templateId;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    description: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchTemplate();
    }
  }, [isEditing]);

  const fetchTemplate = async () => {
    try {
      const response = await api.get(`/templates/${templateId}`);
      const template = response.data.data;
      setFormData({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        description: template.description || ''
      });
    } catch (error) {
      toast.error('Failed to load template');
      router.push('/templates');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/templates/${templateId}`, formData);
        toast.success('Template updated');
      } else {
        await api.post('/templates', formData);
        toast.success('Template created');
      }
      router.push('/templates');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/templates">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                  <CardDescription>Create a reusable email template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Weekly Newsletter"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Default Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Your weekly update"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Used for internal reference"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="htmlContent">HTML Content *</Label>
                    <Textarea
                      id="htmlContent"
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                      placeholder="<h1>Hello!</h1><p>Your HTML here...</p>"
                      className="font-mono min-h-[400px]"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Update Template' : 'Save Template'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}