import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3x3, Tag } from 'lucide-react';
import PatternSetupContent from '@/components/PatternSetupContent';
import TypeManagementContent from '@/components/TypeManagementContent';

export default function SettingsModal({ types, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('types');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="settings-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl">系統設定</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              類型設定
            </TabsTrigger>
            <TabsTrigger value="pattern" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              圖案設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="mt-0">
            <TypeManagementContent types={types} onSave={onSave} />
          </TabsContent>

          <TabsContent value="pattern" className="mt-0">
            <PatternSetupContent />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
