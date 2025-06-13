// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import SocketService from '../utils/socket';

export const useSocket = () => {
  const socketService = useRef(SocketService);
  
  useEffect(() => {
    socketService.current.connect();
    
    return () => {
      // Don't disconnect on unmount as it's a singleton
      // Only disconnect when the app closes
    };
  }, []);

  return socketService.current;
};
