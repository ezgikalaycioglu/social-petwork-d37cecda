import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  Reply, 
  Users, 
  Check, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday, isSameDay } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

interface PackChatProps {
  packId: string;
  packName: string;
  packCoverUrl?: string;
}

interface Message {
  id: string;
  pack_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  media_url?: string;
  replied_to_message_id?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sender?: {
    display_name: string;
    email: string;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  read_receipts?: Array<{
    user_id: string;
    read_at: string;
  }>;
  replied_to_message?: Message;
}

interface PackMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user_profiles?: {
    display_name: string;
    email: string;
  };
}

interface TypingUser {
  user_id: string;
  display_name: string;
}

const EMOJI_QUICK_REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '😡'];

const PackChat: React.FC<PackChatProps> = ({ packId, packName, packCoverUrl }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [packMembers, setPackMembers] = useState<PackMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load pack members
  const loadPackMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('pack_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('pack_id', packId);

      if (error) throw error;

      // Load user profiles separately
      const userIds = data?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', userIds);

      const membersWithProfiles = data?.map(member => ({
        ...member,
        user_profiles: profiles?.find(p => p.id === member.user_id) || {
          display_name: 'Unknown',
          email: ''
        }
      })) || [];

      setPackMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error loading pack members:', error);
    }
  };

  // Load messages with sender info and reactions
  const loadMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('pack_messages')
        .select('*')
        .eq('pack_id', packId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Load sender profiles separately
      const senderIds = messagesData?.map(m => m.sender_id) || [];
      const { data: senderProfiles } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', senderIds);

      // Load reactions for each message
      const messageIds = messagesData?.map(m => m.id) || [];
      const { data: reactionsData } = await supabase
        .from('pack_message_reactions')
        .select('*')
        .in('message_id', messageIds);

      // Load read receipts
      const { data: readsData } = await supabase
        .from('pack_message_reads')
        .select('*')
        .in('message_id', messageIds);

      // Process messages with reactions and read receipts
      const processedMessages = messagesData?.map(message => {
        const messageReactions = reactionsData?.filter(r => r.message_id === message.id) || [];
        const messageReads = readsData?.filter(r => r.message_id === message.id) || [];
        
        // Group reactions by emoji
        const groupedReactions = messageReactions.reduce((acc, reaction) => {
          const existing = acc.find(r => r.emoji === reaction.emoji);
          if (existing) {
            existing.count++;
            existing.users.push(reaction.user_id);
          } else {
            acc.push({
              emoji: reaction.emoji,
              count: 1,
              users: [reaction.user_id]
            });
          }
          return acc;
        }, [] as Array<{ emoji: string; count: number; users: string[] }>);

        return {
          ...message,
          sender: senderProfiles?.find(p => p.id === message.sender_id) || {
            display_name: 'Unknown',
            email: ''
          },
          reactions: groupedReactions,
          read_receipts: messageReads
        };
      }) || [];

      setMessages(processedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const messageData = {
        pack_id: packId,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text',
        replied_to_message_id: replyingTo?.id || null
      };

      const { error } = await supabase
        .from('pack_messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      
      // Clear typing status
      await updateTypingStatus(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    }
  };

  // Update typing status
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!user) return;

    try {
      if (isTyping) {
        await supabase
          .from('pack_typing_indicators')
          .upsert({
            pack_id: packId,
            user_id: user.id,
            is_typing: true
          });
      } else {
        await supabase
          .from('pack_typing_indicators')
          .delete()
          .eq('pack_id', packId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  // Handle typing
  const handleTyping = (value: string) => {
    setNewMessage(value);

    // Check for mentions
    const mentionMatch = value.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }

    // Update typing status
    if (value.trim()) {
      updateTypingStatus(true);
      
      // Clear typing after 3 seconds of no typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 3000);
    } else {
      updateTypingStatus(false);
    }
  };

  // Add reaction to message
  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this emoji
      const existingReaction = messages
        .find(m => m.id === messageId)
        ?.reactions?.find(r => r.emoji === emoji && r.users.includes(user.id));

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('pack_message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
      } else {
        // Add reaction
        await supabase
          .from('pack_message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji
          });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('pack_message_reads')
        .upsert({
          message_id: messageId,
          user_id: user.id
        });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: Array<{ date: string; messages: Message[] }> = [];
    let currentGroup: { date: string; messages: Message[] } | null = null;

    messages.forEach(message => {
      const messageDate = format(new Date(message.created_at), 'yyyy-MM-dd');
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [message] };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  // Format date divider
  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!packId || !user) return;

    loadPackMembers();
    loadMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`pack-messages-${packId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pack_messages',
          filter: `pack_id=eq.${packId}`
        },
        () => {
          loadMessages();
          scrollToBottom();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pack_message_reactions',
        },
        () => {
          loadMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'pack_message_reactions',
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`pack-typing-${packId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pack_typing_indicators',
          filter: `pack_id=eq.${packId}`
        },
        async () => {
          // Load current typing users
          const { data: typingData } = await supabase
            .from('pack_typing_indicators')
            .select('user_id, is_typing')
            .eq('pack_id', packId)
            .eq('is_typing', true)
            .neq('user_id', user.id);

          if (typingData) {
            const typingUserIds = typingData.map(t => t.user_id);
            const { data: userProfiles } = await supabase
              .from('user_profiles')
              .select('id, display_name')
              .in('id', typingUserIds);

            const typingUsersData = typingData.map(typing => ({
              user_id: typing.user_id,
              display_name: userProfiles?.find(p => p.id === typing.user_id)?.display_name || 'Unknown'
            }));

            setTypingUsers(typingUsersData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
      updateTypingStatus(false);
    };
  }, [packId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 font-dm-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-white rounded-xl shadow-lg font-dm-sans">
        {/* Chat Header */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={packCoverUrl} alt={packName} />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {packName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{packName}</h3>
                <p className="text-sm text-gray-500">{packMembers.length} members</p>
              </div>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          </SheetTrigger>

          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="font-dm-sans">Pack Members</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              {packMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                      {member.user_profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.user_profiles?.display_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {messageGroups.map((group) => (
            <div key={group.date}>
              {/* Date Divider */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-600 font-medium">
                    {formatDateDivider(group.date)}
                  </span>
                </div>
              </div>

              {/* Messages in this date group */}
              {group.messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                const senderName = message.sender?.display_name || 'Unknown';
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar for incoming messages */}
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                            {senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`relative ${isOwnMessage ? 'mr-2' : ''}`}>
                        {/* Reply context */}
                        {message.replied_to_message && (
                          <div className="mb-1 p-2 bg-gray-50 rounded-lg border-l-2 border-purple-300">
                            <p className="text-xs text-gray-500">
                              Replying to {message.replied_to_message.sender?.display_name}
                            </p>
                            <p className="text-xs text-gray-700 truncate">
                              {message.replied_to_message.content}
                            </p>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div className="relative group">
                          <div
                            className={`px-4 py-2 rounded-xl ${
                              isOwnMessage
                                ? 'bg-purple-50 text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs text-purple-600 font-medium mb-1">
                                {senderName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>

                          {/* Quick reactions on hover */}
                          {hoveredMessageId === message.id && (
                            <div className="absolute -top-8 left-0 flex space-x-1 bg-white rounded-full shadow-lg border p-1 z-10">
                              {EMOJI_QUICK_REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(message.id, emoji)}
                                  className="hover:bg-gray-100 rounded-full p-1 transition-colors"
                                >
                                  <span className="text-sm">{emoji}</span>
                                </button>
                              ))}
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="hover:bg-gray-100 rounded-full p-1 transition-colors"
                              >
                                <Reply className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          )}

                          {/* Message reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.reactions.map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => addReaction(message.id, reaction.emoji)}
                                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                                    reaction.users.includes(user?.id || '')
                                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message timestamp and read receipts */}
                        <div className={`flex items-center mt-1 space-x-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-gray-400 cursor-help">
                                {formatMessageTime(message.created_at)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {format(new Date(message.created_at), 'MMM d, yyyy HH:mm:ss')}
                            </TooltipContent>
                          </Tooltip>

                          {/* Read receipts for own messages */}
                          {isOwnMessage && (
                            <div className="flex items-center">
                              {message.read_receipts && message.read_receipts.length > 0 ? (
                                <CheckCheck className="w-3 h-3 text-purple-500" />
                              ) : (
                                <Check className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">
                {typingUsers.length === 1
                  ? `${typingUsers[0].display_name} is typing...`
                  : `${typingUsers.map(u => u.display_name).join(', ')} are typing...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply context */}
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  Replying to {replyingTo.sender?.display_name}
                </p>
                <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="ml-2"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Message Composer */}
        <div className="p-4 border-t border-gray-200">
          {/* Mention suggestions */}
          {showMentions && (
            <div className="mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
              {packMembers
                .filter(member => 
                  member.user_profiles?.display_name?.toLowerCase().includes(mentionQuery.toLowerCase())
                )
                .map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      const mention = `@${member.user_profiles?.display_name} `;
                      const newText = newMessage.replace(/@\w*$/, mention);
                      setNewMessage(newText);
                      setShowMentions(false);
                      inputRef.current?.focus();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {member.user_profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.user_profiles?.display_name}</span>
                  </button>
                ))}
            </div>
          )}

          <div className="flex items-end space-x-2">
            {/* Emoji picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2"
              >
                <Smile className="w-5 h-5 text-gray-400" />
              </Button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setNewMessage(prev => prev + emojiObject.emoji);
                      setShowEmojiPicker(false);
                      inputRef.current?.focus();
                    }}
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="resize-none rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>

            {/* Media attachment */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              disabled
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
            </Button>

            {/* Voice note */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              disabled
            >
              <Mic className="w-5 h-5 text-gray-400" />
            </Button>

            {/* Send button */}
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="rounded-full w-10 h-10 p-0 transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: '#7A5FFF' }}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PackChat;