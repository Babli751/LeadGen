"use client";
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string;
  status: string;
};

type LeadDetailModalProps = {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onSendEmail: (leadId: number) => void;
};

export function LeadDetailModal({ lead, isOpen, onClose, onUpdateLead, onSendEmail }: LeadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen || !lead) return null;

  const handleEditStart = () => {
    setEditedLead({ ...lead });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditedLead(null);
    setIsEditing(false);
  };

  const handleEditSave = () => {
    if (editedLead) {
      onUpdateLead(editedLead);
      setIsEditing(false);
      setEditedLead(null);
    }
  };

  const handleInputChange = (field: keyof Lead, value: string) => {
    if (editedLead) {
      setEditedLead({ ...editedLead, [field]: value });
    }
  };

  const currentLead = isEditing ? editedLead : lead;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Lead Detayları</h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEditStart}>
                Düzenle
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleEditCancel}>
                  İptal
                </Button>
                <Button size="sm" onClick={handleEditSave}>
                  Kaydet
                </Button>
              </>
            )}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">İşletme Adı</label>
              {isEditing ? (
                <Input
                  value={currentLead?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              ) : (
                <p className="text-gray-900 py-2">{currentLead?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Durum</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                currentLead?.status === "email_sent" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {currentLead?.status === "email_sent" ? "E-posta Gönderildi" : "Yeni"}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={currentLead?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="E-posta adresi"
                />
              ) : (
                <div className="py-2">
                  {currentLead?.email ? (
                    <a 
                      href={`mailto:${currentLead.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {currentLead.email}
                    </a>
                  ) : (
                    <span className="text-gray-500">E-posta yok</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={currentLead?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Telefon numarası"
                />
              ) : (
                <div className="py-2">
                  {currentLead?.phone ? (
                    <a 
                      href={`tel:${currentLead.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {currentLead.phone}
                    </a>
                  ) : (
                    <span className="text-gray-500">Telefon yok</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            {isEditing ? (
              <Input
                type="url"
                value={currentLead?.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="Website adresi"
              />
            ) : (
              <div className="py-2">
                {currentLead?.website ? (
                  <a 
                    href={currentLead.website.startsWith('http') ? currentLead.website : `https://${currentLead.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {currentLead.website}
                  </a>
                ) : (
                  <span className="text-gray-500">Website yok</span>
                )}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Adres</label>
            {isEditing ? (
              <textarea
                value={currentLead?.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                rows={3}
                placeholder="Adres bilgisi"
              />
            ) : (
              <p className="text-gray-900 py-2 bg-gray-50 px-3 rounded border">
                {currentLead?.address || 'Adres bilgisi yok'}
              </p>
            )}
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={4}
              placeholder="Bu lead hakkında notlarınızı buraya yazabilirsiniz..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={() => onSendEmail(lead.id)}
              disabled={!currentLead?.email || currentLead?.status === 'email_sent'}
              className="flex-1"
            >
              {currentLead?.status === 'email_sent' ? 'E-posta Gönderildi' : 'E-posta Gönder'}
            </Button>
            
            {currentLead?.website && (
              <Button 
                variant="outline"
                onClick={() => window.open(
                  currentLead.website?.startsWith('http') ? currentLead.website : `https://${currentLead.website}`,
                  '_blank'
                )}
                className="flex-1"
              >
                Website'yi Ziyaret Et
              </Button>
            )}
            
            {currentLead?.phone && (
              <Button 
                variant="outline"
                onClick={() => window.open(`tel:${currentLead.phone}`, '_self')}
                className="flex-1"
              >
                Ara
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
