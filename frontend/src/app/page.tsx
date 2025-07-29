"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const searchSchema = z.object({
  query: z.string().min(2, "Minimum 2 karakter girin"),
  location: z.string().min(2, "Minimum 2 karakter girin"),
  maxResults: z.number().min(5).max(100),
});

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  status: string;
};

export default function LeadGenerationPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
      location: '',
      maxResults: 20,
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setLeads(result.leads);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const sendEmails = async () => {
    if (selectedLeads.length === 0) return;
    
    const subject = "İşbirliği Teklifi";
    const body = `Merhaba,\n\nSizinle işbirliği yapmak istiyoruz.\n\nSaygılarımızla,\n[Şirket Adı]`;
    
    try {
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_ids: selectedLeads,
          subject,
          body,
          sender_email: "your-email@example.com",
        }),
      });
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Lead Generation Tool</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="İşletme türü (örn: plumber)"
              {...register("query")}
            />
            {errors.query && <p className="text-red-500 text-sm">{errors.query.message}</p>}
          </div>
          <div>
            <Input
              placeholder="Konum (örn: Berlin)"
              {...register("location")}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Maksimum sonuç"
              {...register("maxResults", { valueAsNumber: true })}
            />
            {errors.maxResults && <p className="text-red-500 text-sm">{errors.maxResults.message}</p>}
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Aranıyor..." : "Ara"}
        </Button>
      </form>
      
      {leads.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bulunan Leadler ({leads.length})</h2>
            <Button onClick={sendEmails} disabled={selectedLeads.length === 0}>
              Seçilenlere E-posta Gönder ({selectedLeads.length})
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seç</TableHead>
                  <TableHead>İsim</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.email || "-"}</TableCell>
                    <TableCell>{lead.phone || "-"}</TableCell>
                    <TableCell>
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer">
                          Siteyi Gör
                        </a>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{lead.address}</TableCell>
                    <TableCell>{lead.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}