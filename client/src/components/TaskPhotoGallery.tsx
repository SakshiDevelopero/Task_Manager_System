
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask, TaskPhoto } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Plus, X, Camera, Download, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface TaskPhotoGalleryProps {
  taskId: string;
}

const TaskPhotoGallery: React.FC<TaskPhotoGalleryProps> = ({ taskId }) => {
  const { currentUser } = useAuth();
  const { getTaskPhotos, addTaskPhoto, deleteTaskPhoto } = useTask();
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<TaskPhoto | null>(null);
  
  const photos = getTaskPhotos(taskId);
  
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) {
      toast({
        title: "Image URL required",
        description: "Please enter a valid image URL.",
        variant: "destructive"
      });
      return;
    }
    
    addTaskPhoto(taskId, {
      imageUrl: newPhotoUrl,
      caption: newPhotoCaption.trim() || undefined
    });
    
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    
    toast({
      title: "Photo added",
      description: "Your photo has been added to the task."
    });
  };
  
  const handleDeletePhoto = (photoId: string) => {
    deleteTaskPhoto(taskId, photoId);
    setSelectedPhoto(null);
    
    toast({
      title: "Photo deleted",
      description: "The photo has been removed from the task."
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="w-full dark:bg-gray-800 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Image className="h-5 w-5 mr-2 text-taskPurple" />
            Photos ({photos.length})
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Photo to Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="text-sm font-medium">Image URL</label>
                  <Input
                    id="imageUrl"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="caption" className="text-sm font-medium">Caption (optional)</label>
                  <Textarea
                    id="caption"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Enter caption for the photo"
                    className="resize-none"
                  />
                </div>
                
                {newPhotoUrl && (
                  <div className="mt-4 border rounded overflow-hidden">
                    <AspectRatio ratio={16 / 9}>
                      <img 
                        src={newPhotoUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x225?text=Image+Preview+Error';
                        }}
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>
              <CardFooter className="justify-between px-0">
                <Button variant="ghost" onClick={() => {
                  setNewPhotoUrl('');
                  setNewPhotoCaption('');
                }}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleAddPhoto}>
                  <Camera className="h-4 w-4 mr-1" />
                  Add Photo
                </Button>
              </CardFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative border rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-taskPurple transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <AspectRatio ratio={1}>
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.caption || 'Task photo'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Error';
                    }}
                  />
                </AspectRatio>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-xs text-white truncate">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No photos added yet</p>
            <p className="text-sm mt-1">Add photos to document task progress</p>
          </div>
        )}
      </CardContent>
      
      {/* Photo detail dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="border rounded overflow-hidden">
                <img 
                  src={selectedPhoto.imageUrl} 
                  alt={selectedPhoto.caption || 'Task photo'} 
                  className="w-full h-full object-contain max-h-[60vh]"
                />
              </div>
              
              <div className="space-y-2">
                {selectedPhoto.caption && (
                  <p className="text-sm font-medium">{selectedPhoto.caption}</p>
                )}
                <p className="text-xs text-gray-500">Added on {formatDate(selectedPhoto.createdAt)}</p>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(selectedPhoto.imageUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Open Original
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Photo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskPhotoGallery;
