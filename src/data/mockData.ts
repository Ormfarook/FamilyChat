// src/data/mockData.ts
// Temporary in-memory data so screens render something meaningful during
// frontend development. Swap these out for real API calls / socket data
// once the backend is wired up.

import { Message, User } from '../types';

export const mockCurrentUser: User = {
  id: 'me',
  name: 'You',
  email: 'you@example.com',
  phone: '+1 555 010 2020',
  bio: 'Building something cool with React Native ✨',
  avatar: null,
};

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Sarah Malik',
    avatar: null,
    online: true,
    lastMessage: 'Sounds good, see you then!',
    lastMessageTime: '09:41',
    unreadCount: 2,
  },
  {
    id: 'u2',
    name: 'Omar Al-Farsi',
    avatar: null,
    online: true,
    lastMessage: 'Sent the files, check your email',
    lastMessageTime: '09:12',
    unreadCount: 0,
  },
  {
    id: 'u3',
    name: 'Lina Chen',
    avatar: null,
    online: false,
    lastMessage: 'Haha that is hilarious 😂',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'u4',
    name: 'David Kim',
    avatar: null,
    online: false,
    lastMessage: 'Can we reschedule the call?',
    lastMessageTime: 'Yesterday',
    unreadCount: 5,
  },
  {
    id: 'u5',
    name: 'Amina Yusuf',
    avatar: null,
    online: true,
    lastMessage: 'Thank you so much!',
    lastMessageTime: 'Mon',
    unreadCount: 0,
  },
];

export const mockConversations: Record<string, Message[]> = {
  u1: [
    { id: 'm1', senderId: 'u1', text: 'Hey! Are we still on for tomorrow?', timestamp: '09:30', status: 'read' },
    { id: 'm2', senderId: 'me', text: 'Yes, 10am works for me.', timestamp: '09:33', status: 'read' },
    { id: 'm3', senderId: 'u1', text: 'Perfect, I will send the location shortly.', timestamp: '09:35', status: 'read' },
    { id: 'm4', senderId: 'u1', text: 'Sounds good, see you then!', timestamp: '09:41', status: 'delivered' },
  ],
  u2: [
    { id: 'm1', senderId: 'me', text: 'Did you get a chance to review the doc?', timestamp: '08:50', status: 'read' },
    { id: 'm2', senderId: 'u2', text: 'Yes, looks great overall.', timestamp: '09:01', status: 'read' },
    { id: 'm3', senderId: 'u2', text: 'Sent the files, check your email', timestamp: '09:12', status: 'delivered' },
  ],
  u3: [
    { id: 'm1', senderId: 'u3', text: 'Did you see that meme I sent?', timestamp: 'Yesterday', status: 'read' },
    { id: 'm2', senderId: 'me', text: 'Haha yes, dying 💀', timestamp: 'Yesterday', status: 'read' },
    { id: 'm3', senderId: 'u3', text: 'Haha that is hilarious 😂', timestamp: 'Yesterday', status: 'read' },
  ],
  u4: [
    { id: 'm1', senderId: 'u4', text: 'Something came up on my end.', timestamp: 'Yesterday', status: 'delivered' },
    { id: 'm2', senderId: 'u4', text: 'Can we reschedule the call?', timestamp: 'Yesterday', status: 'delivered' },
  ],
  u5: [
    { id: 'm1', senderId: 'me', text: 'Sent you the invite, let me know if it works.', timestamp: 'Mon', status: 'read' },
    { id: 'm2', senderId: 'u5', text: 'Thank you so much!', timestamp: 'Mon', status: 'read' },
  ],
};
