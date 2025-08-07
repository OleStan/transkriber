import { useEffect, useState, useCallback } from 'react';
import { cable } from '../lib/cable';

export interface TranscriptionMessage {
  transcription_json?: any;
  status?: 'pending' | 'uploading' | 'processing' | 'in_progress' | 'transcribing' | 'post_processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  error?: string;
  message?: string;
  id?: number | string;
  [key: string]: any;
}

interface UseActionCableResult {
  messages: TranscriptionMessage[];
  latestMessage: TranscriptionMessage | null;
  cancelTranscription: () => void;
  clearMessages: () => void;
  subscription: any;
}

function useActionCable(channelName: string, room?: string): UseActionCableResult {
  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  
  // Get the latest message
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Clear messages function
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cancel function that can be called from the component
  const cancelTranscription = useCallback(() => {
    if (subscription && room) {
      subscription.perform('cancel');
    }
  }, [subscription, room]);

  useEffect(() => {
    const params = room ? { channel: channelName, room } : { channel: channelName };
    const newSubscription = cable.subscriptions.create(params, {
      connected() {
        console.log(`Connected to ${channelName} for room ${room}`);
      },
      disconnected() {
        console.log(`Disconnected from ${channelName} for room ${room}`);
      },
      received(data: TranscriptionMessage) {
        // For error handling, log errors
        if (data.error) {
          console.error(`Error in transcription: ${data.error}`);
        }

        // Always add the message to our state
        setMessages((prevMessages) => {
          // If the received message has the same status as the latest message, 
          // and it just updates progress, replace the last message
          if (prevMessages.length > 0 && 
              data.status === prevMessages[prevMessages.length - 1].status && 
              data.progress !== undefined && 
              !data.error) {
            return [...prevMessages.slice(0, -1), data];
          }
          
          // Otherwise add as a new message
          return [...prevMessages, data];
        });
      },
    });
    
    setSubscription(newSubscription);

    return () => {
      newSubscription.unsubscribe();
    };
  }, [channelName, room]);

  return { 
    messages, 
    latestMessage, 
    cancelTranscription, 
    clearMessages,
    subscription 
  };
}

export default useActionCable;
