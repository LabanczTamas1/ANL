// src/services/mockApi.ts

// Interfaces matching what your API would return
export interface InboxItem {
    id: string;
    fromEmail: string;
    fromName: string;
    recipient: string;
    subject: string;
    body: string;
    timeSended: string;
  }
  
  // Mock data for inbox messages
  const mockInboxData: InboxItem[] = [
    {
      id: "msg1",
      fromEmail: "jane.doe@example.com",
      fromName: "Jane Doe",
      recipient: "user@example.com",
      subject: "Project Update Meeting",
      body: "# Project Update\n\nHi there,\n\nI wanted to share some updates about our ongoing project:\n\n- Frontend development is **85%** complete\n- Backend API is ready for integration\n- QA testing will begin next week\n\nCould we schedule a meeting to discuss next steps?\n\nThanks,\nJane",
      timeSended: Date.now().toString()
    },
    {
      id: "msg2",
      fromEmail: "marketing@company.com",
      fromName: "Marketing Team",
      recipient: "user@example.com",
      subject: "New Campaign Ideas",
      body: "# Marketing Campaign Ideas\n\n## Social Media\n\n1. Instagram Stories campaign\n2. LinkedIn article series\n3. Twitter polls\n\n## Email Marketing\n\n* Monthly newsletter redesign\n* Customer segmentation strategy\n\nPlease review these ideas and let me know your thoughts!\n\n![Campaign Mockup](/api/placeholder/600/300)\n\nRegards,\nMarketing Team",
      timeSended: (Date.now() - 86400000).toString() // 1 day ago
    },
    {
      id: "msg3",
      fromEmail: "support@saasplatform.com",
      fromName: "SaaS Support",
      recipient: "user@example.com",
      subject: "Your Subscription Status",
      body: "Dear User,\n\nYour subscription will renew automatically on **May 15, 2025**.\n\nCurrent Plan: **Premium**\n\nMonthly Cost: **$24.99**\n\nVisit our [billing portal](https://upload.wikimedia.org/wikipedia/commons/d/d2/CSC_Logo-2_20210215.png)![alt text](https://upload.wikimedia.org/wikipedia/commons/d/d2/CSC_Logo-2_20210215.png) to make any changes.\n\nThank you for your continued support!\n\nSaaS Support Team",
      timeSended: (Date.now() - 172800000).toString() // 2 days ago
    },
    {
      id: "msg4",
      fromEmail: "tech@newsletter.dev",
      fromName: "Tech Weekly",
      recipient: "user@example.com",
      subject: "This Week in JavaScript",
      body: "# This Week in JavaScript\n\n## Top Stories\n\n### New React Framework Released\n\nA new React framework has been released with improved performance and developer experience.\n\n```javascript\n// Example of the new API\nimport { createApp } from 'new-framework';\n\nconst app = createApp({\n  state: { count: 0 },\n  actions: {\n    increment: (state) => ({ count: state.count + 1 })\n  }\n});\n```\n\n### TypeScript 6.0 Announced\n\nThe TypeScript team has announced version 6.0 with exciting new features.\n\n## Upcoming Events\n\n* ReactConf - May 20, 2025\n* JSNation - June 3, 2025\n\n[Unsubscribe](https://example.com/unsubscribe)",
      timeSended: (Date.now() - 259200000).toString() // 3 days ago
    },
    {
      id: "msg5",
      fromEmail: "john.smith@client.org",
      fromName: "John Smith",
      recipient: "user@example.com",
      subject: "Feedback on Proposal",
      body: "Hello,\n\nI've reviewed your proposal and have some feedback:\n\n> The pricing structure is competitive, but I'd like to see more details about implementation timelines.\n\nCould you provide a more detailed roadmap?\n\nAlso, here's a quick summary of what I liked:\n\n* Clear objectives\n* Innovative approach\n* Comprehensive budget breakdown\n\nLet's discuss this further in our call tomorrow.\n\nBest regards,\nJohn",
      timeSended: (Date.now() - 345600000).toString() // 4 days ago
    }
  ];
  
  // Mock API functions
  export const mockApi = {
    // Get inbox messages for a user
    getInbox: async (username: string): Promise<InboxItem[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`Fetching inbox for user: ${username}`);
      return mockInboxData;
    },
    
    // Get a specific message by ID
    getMessage: async (messageId: string): Promise<InboxItem | null> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      console.log(`Fetching message with ID: ${messageId}`);
      const message = mockInboxData.find(msg => msg.id === messageId);
      
      if (!message) {
        console.error(`Message with ID ${messageId} not found`);
        return null;
      }
      
      return message;
    }
  };
  
  export default mockApi;