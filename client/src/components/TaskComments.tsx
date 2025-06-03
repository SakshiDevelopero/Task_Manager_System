
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask, TaskComment } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const { currentUser } = useAuth();
  const { getTaskComments, addTaskComment, deleteTaskComment } = useTask();
  const [commentText, setCommentText] = useState('');
  
  const comments = getTaskComments(taskId);
  
  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Cannot submit empty comment",
        description: "Please enter some text for your comment.",
        variant: "destructive"
      });
      return;
    }
    
    addTaskComment(taskId, commentText);
    setCommentText('');
    
    toast({
      title: "Comment added",
      description: "Your comment has been added successfully."
    });
  };
  
  const handleDeleteComment = (commentId: string) => {
    deleteTaskComment(taskId, commentId);
    
    toast({
      title: "Comment deleted",
      description: "The comment has been removed."
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const canDeleteComment = (comment: TaskComment) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || comment.createdBy === currentUser.id;
  };
  
  return (
    <Card className="w-full dark:bg-gray-800 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-taskPurple" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-0">
        {comments.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-4">
                <div className="flex items-start">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-taskPurple text-white text-xs">
                      {comment.createdByName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{comment.createdByName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      
                      {canDeleteComment(comment) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm mt-1">Be the first to add a comment</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-start space-x-2 pt-4">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[80px] resize-none"
        />
        <Button
          onClick={handleAddComment}
          className="bg-taskPurple hover:bg-taskPurple-light"
          disabled={!currentUser}
        >
          <Send className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskComments;
