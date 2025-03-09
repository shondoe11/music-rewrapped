import { useEffect, useState } from "react"
import { io } from 'socket.io-client'


const useSocket = (serverUrl) => {
    const [socket, setSocket] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const socketIo = io(serverUrl);
        setSocket(socketIo);

        //& listener for server-side notifications
        socketIo.on('notification', (data) => {
            setNotification(data.message);
        });

        return () => {
            socketIo.disconnect();
        };
    }, [serverUrl]);

    return {socket, notification};
};

export default useSocket;