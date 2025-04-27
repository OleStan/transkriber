import { useEffect, useState } from 'react';
import { cable } from '../lib/cable';

interface Message {
  transcription_json?: any;
  status?: string;
  [key: string]: any;
}

function useActionCable(channelName: string, room?: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const params = room ? { channel: channelName, room } : { channel: channelName };
    const subscription = cable.subscriptions.create(params, {
      received(data: Message) {
        setMessages((prevMessages) => [...prevMessages, data]);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [channelName, room]);

  return messages;
}

export default useActionCable;
