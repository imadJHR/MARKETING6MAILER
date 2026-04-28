'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Save, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Inner component that uses useSearchParams
function NewCampaignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    recipients: [],
  });

  useEffect(() => {
    fetchClients();
    fetchTemplates();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch clients');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data.data || []);
      
      const templateId = searchParams.get('template');
      if (templateId) {
        setSelectedTemplateId(templateId);
        const template = response.data.data.find(t => t._id === templateId);
        if (template) {
          setFormData(prev => ({
            ...prev,
            name: template.name,
            subject: template.subject,
            htmlContent: template.htmlContent
          }));
          toast.info(`Loaded template: ${template.name}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent
      });
      toast.success(`Template "${template.name}" loaded`);
    }
  };

  const handleSubmit = async (e, shouldSend = false) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.recipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    
    setLoading(true);
    
    try {
      const campaignData = {
        name: formData.name,
        subject: formData.subject,
        htmlContent: formData.htmlContent,
        recipients: formData.recipients,
      };
      
      const campaignRes = await api.post('/campaigns', campaignData);
      const campaignId = campaignRes.data.data._id;
      
      if (shouldSend) {
        await api.post(`/campaigns/${campaignId}/send`);
        toast.success('Campaign created and sent successfully!');
      } else {
        toast.success('Campaign saved as draft');
      }
      
      router.push('/campaigns');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipient = (clientId) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(clientId)
        ? prev.recipients.filter(id => id !== clientId)
        : [...prev.recipients, clientId]
    }));
  };

  const toggleAllRecipients = () => {
    if (formData.recipients.length === clients.length) {
      setFormData(prev => ({ ...prev, recipients: [] }));
    } else {
      setFormData(prev => ({ ...prev, recipients: clients.map(c => c._id) }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/campaigns">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Create New Campaign</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                  <CardDescription>Enter your email campaign information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Summer Sale 2024"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Don't miss our summer sale!"
                      required
                    />
                  </div>
                  
                  {/* Template Selector */}
                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Load from Template (Optional)</Label>
                      <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template to load" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template._id} value={template._id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Selecting a template will overwrite the current name, subject, and content.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="htmlContent">Email Content (HTML) *</Label>
                    <Textarea
                      id="htmlContent"
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                      placeholder="<h1>Hello!</h1><p>Your HTML content here...</p>"
                      className="font-mono min-h-[400px]"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      You can use HTML tags. Links will be automatically tracked.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recipients</CardTitle>
                  <CardDescription>Select who will receive this email</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.recipients.length === clients.length && clients.length > 0}
                          onCheckedChange={toggleAllRecipients}
                        />
                        Select All ({clients.length})
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {formData.recipients.length} selected
                      </span>
                    </div>
                    <div className="border rounded-md max-h-80 overflow-y-auto">
                      {clients.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No clients found. <Link href="/clients" className="text-primary underline">Add clients</Link>
                        </div>
                      ) : (
                        clients.map((client) => (
                          <label
                            key={client._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <Checkbox
                              checked={formData.recipients.includes(client._id)}
                              onCheckedChange={() => toggleRecipient(client._id)}
                            />
                            <div>
                              <p className="text-sm font-medium">{client.email}</p>
                              {client.name && <p className="text-xs text-muted-foreground">{client.name}</p>}
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Save or send your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                  >
                    <Send className="h-4 w-4" />
                    Send Now
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

// Default export with Suspense wrapper
export default function NewCampaignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading....</div>
      </div>
    }>
      <NewCampaignForm />
    </Suspense>
  );
}