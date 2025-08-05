'use client';

import { MainLayout, Sidebar } from '../../components/layout';
import { ChatContainer } from '../../components/chat';
import ChatContainerApi from '../../components/chat/ChatContainerApi';
import { VisualizationContainer } from '../../components/3d-visualization';
import { useChat } from '../../hooks/use-chat';
import { useChatApi } from '../../hooks/use-chat-api';
import { useState } from 'react';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export default function EmotionalSupportPage() {
  const chatHook = USE_MOCK_API ? useChat() : useChatApi();
  const { 
    sessions, 
    currentSession, 
    createNewSession, 
    selectSession, 
    deleteSession,
    downloadBackup,
    importFromFile
  } = chatHook;
  
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const handleViewAnalysis = (message: any) => {
    setSelectedAnalysis(message);
    console.log('View analysis:', message);
  };

  const handleExportChat = () => {
    downloadBackup();
  };

  const handleImportData = async () => {
    const result = await importFromFile();
    if (result.success) {
      alert(result.message);
    } else {
      alert('导入失败: ' + result.message);
    }
  };

  const handleClearChat = () => {
    if (typeof window !== 'undefined' && currentSession && window.confirm('确定要清空当前对话吗？')) {
      deleteSession(currentSession.id);
    }
  };

  const sidebar = (
    <Sidebar
      sessions={sessions}
      currentSession={currentSession}
      onNewSession={createNewSession}
      onSelectSession={selectSession}
      onDeleteSession={deleteSession}
      onExportData={handleExportChat}
      onImportData={handleImportData}
    />
  );

  const ChatComponent = USE_MOCK_API ? ChatContainer : ChatContainerApi;
  
  const chatPanel = (
    <ChatComponent
      onViewAnalysis={handleViewAnalysis}
      onExportChat={handleExportChat}
      onClearChat={handleClearChat}
    />
  );

  const visualizationPanel = (
    <VisualizationContainer
      onItemClick={(item) => console.log('3D item clicked:', item)}
    />
  );

  return (
    <MainLayout
      sidebar={sidebar}
      chatPanel={chatPanel}
      visualizationPanel={visualizationPanel}
    />
  );
}