'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ChatWithData from '@/components/ChatWithData';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="chat">Chat with Data</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-0">
              <Dashboard />
            </TabsContent>
            <TabsContent value="chat" className="mt-0">
              <ChatWithData />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
