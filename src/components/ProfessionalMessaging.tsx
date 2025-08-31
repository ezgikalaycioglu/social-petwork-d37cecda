import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Image, 
  Phone, 
  Video, 
  MoreVertical,
  Star,
  MapPin,
  Calendar,
  CheckCheck,
  Check,
  AlertCircle,
  Smile,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  photo: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  type: 'pet-owner' | 'sitter' | 'host';
  rating?: number;
  location?: string;
  bookingId?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }[];
}

const ProfessionalMessaging = () => {
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Mock data
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      photo: '/placeholder.svg',
      status: 'online',
      lastMessage: 'Hi! Just wanted to confirm the pickup time for Luna...',
      lastMessageTime: '2m ago',
      unreadCount: 2,
      type: 'pet-owner',
      rating: 5.0,
      location: 'Manhattan, NY',
      bookingId: 'booking-1'
    },
    {
      id: '2',
      name: 'Michael Chen',
      photo: '/placeholder.svg',
      status: 'away',
      lastMessage: 'Thanks for accepting! I have a few questions about the house...',
      lastMessageTime: '1h ago',
      unreadCount: 1,
      type: 'host',
      rating: 4.9,
      location: 'Brooklyn, NY',
      bookingId: 'booking-2'
    },
    {
      id: '3',
      name: 'Emma Davis',
      photo: '/placeholder.svg',
      status: 'offline',
      lastMessage: 'Thank you so much for taking great care of Max and Bella!',
      lastMessageTime: '2d ago',
      unreadCount: 0,
      type: 'pet-owner',
      rating: 5.0,
      location: 'Queens, NY',
      bookingId: 'booking-3'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '1',
      content: 'Hi! I hope you\'re doing well. I wanted to confirm the pickup time for Luna tomorrow.',
      timestamp: '2024-03-15T10:30:00Z',
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: 'me',
      content: 'Hello Sarah! Yes, I can pick up Luna at 9 AM as we discussed. She\'ll be in great hands!',
      timestamp: '2024-03-15T10:35:00Z',
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: '1',
      content: 'Perfect! Here are some recent photos of Luna for you to see.',
      timestamp: '2024-03-15T10:40:00Z',
      type: 'image',
      status: 'read',
      attachments: [
        {
          type: 'image',
          url: '/placeholder.svg',
          name: 'luna-1.jpg'
        },
        {
          type: 'image',
          url: '/placeholder.svg',
          name: 'luna-2.jpg'
        }
      ]
    },
    {
      id: '4',
      senderId: 'me',
      content: 'She\'s adorable! I can\'t wait to meet her. I\'ll bring some treats and toys.',
      timestamp: '2024-03-15T10:45:00Z',
      type: 'text',
      status: 'delivered'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pet-owner': return '🐕';
      case 'sitter': return '👤';
      case 'host': return '🏠';
      default: return '👤';
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: messageText,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    toast({
      title: "Message sent",
      description: `Your message to ${selectedContact.name} has been sent.`,
    });
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 border rounded-xl",
        selectedContact?.id === contact.id 
          ? "border-primary bg-primary/5" 
          : "hover:bg-muted/50"
      )}
      onClick={() => setSelectedContact(contact)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={contact.photo} alt={contact.name} />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
              getStatusColor(contact.status)
            )}></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-foreground truncate">
                  {contact.name}
                </h3>
                <span className="text-sm">{getTypeIcon(contact.type)}</span>
                {contact.rating && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {contact.rating}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {contact.lastMessageTime}
                </span>
                {contact.unreadCount > 0 && (
                  <Badge className="h-5 min-w-[20px] px-1.5 text-xs bg-primary">
                    {contact.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
              {contact.lastMessage}
            </p>
            
            {contact.location && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {contact.location}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-3 space-y-2",
        isOwn 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground"
      )}>
        <p className="text-sm break-words">{message.content}</p>
        
        {message.attachments && (
          <div className="space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                {attachment.type === 'image' ? (
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-full h-auto max-w-xs rounded-lg"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-background/20 rounded-lg">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-xs">{attachment.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className={cn(
          "flex items-center justify-between text-xs",
          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
          {isOwn && (
            <div className="flex items-center space-x-1">
              {message.status === 'sent' && <Check className="w-3 h-3" />}
              {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  return (
    <div className="h-screen bg-background flex">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-border bg-background flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg mb-4">Messages</h2>
          <Input 
            placeholder="Search conversations..." 
            className="bg-muted/50 border-0"
          />
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedContact.photo} alt={selectedContact.name} />
                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                    getStatusColor(selectedContact.status)
                  )}></div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground">{selectedContact.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="capitalize">{selectedContact.status}</span>
                    {selectedContact.bookingId && (
                      <>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>Active booking</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {/* Booking context card */}
                {selectedContact.bookingId && (
                  <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">Booking Context</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pet sitting for Luna • March 15-18, 2024
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isOwn={message.senderId === 'me'} 
                  />
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-end space-x-2">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-10 rounded-2xl border-0 bg-muted/50"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="rounded-2xl px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-2">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default ProfessionalMessaging;