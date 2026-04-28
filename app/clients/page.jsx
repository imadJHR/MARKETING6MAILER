'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    try {
      await api.post('/clients', formData);
      toast.success('Client added successfully');
      setIsAddDialogOpen(false);
      setFormData({ email: '', name: '' });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add client');
    }
  };

  const handleUpdateClient = async () => {
    try {
      await api.put(`/clients/${editingClient._id}`, formData);
      toast.success('Client updated successfully');
      setIsAddDialogOpen(false);
      setEditingClient(null);
      setFormData({ email: '', name: '' });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update client');
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const handleBulkImport = async () => {
    try {
      const lines = bulkData.split('\n').filter(line => line.trim());
      const clients = lines.map(line => {
        const [email, name] = line.split(',').map(s => s.trim());
        return { email, name: name || '' };
      }).filter(c => c.email);
      
      await api.post('/clients/bulk', { clients });
      toast.success(`${clients.length} clients imported successfully`);
      setIsBulkDialogOpen(false);
      setBulkData('');
      fetchClients();
    } catch (error) {
      toast.error('Failed to import clients');
    }
  };

  const openEditDialog = (client) => {
    setEditingClient(client);
    setFormData({ email: client.email, name: client.name || '' });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">← Back</Button>
            </Link>
            <h1 className="text-xl font-bold">Manage Clients</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Email List</CardTitle>
                <CardDescription>Manage your subscribers and recipients</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Bulk Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Import Clients</DialogTitle>
                      <DialogDescription>
                        Enter one email per line, or use format: email,name
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <textarea
                        className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                        placeholder="john@example.com, John Doe&#10;jane@example.com, Jane Smith&#10;bob@example.com"
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleBulkImport}>Import</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  if (!open) {
                    setEditingClient(null);
                    setFormData({ email: '', name: '' });
                  }
                  setIsAddDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                      <DialogDescription>
                        Enter the client's email address and optional name
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="client@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name (Optional)</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Client Name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingClient(null);
                      }}>Cancel</Button>
                      <Button onClick={editingClient ? handleUpdateClient : handleAddClient}>
                        {editingClient ? 'Update' : 'Add'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading clients...</div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No clients yet. Click "Add Client" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client._id}>
                      <TableCell className="font-medium">{client.email}</TableCell>
                      <TableCell>{client.name || '-'}</TableCell>
                      <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(client)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client._id)}
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