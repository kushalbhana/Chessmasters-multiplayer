import WebSocket from "ws";
import { WebSocketMessageType} from "@repo/lib/status";
import { addToLobby } from "../controllers/addToLobby";
import { checkRoomExist } from "../controllers/checkRoomExist";
import { makeMove } from "../controllers/makeMove";
import { handleTextMessage } from "../controllers/textMessage";
import { handleJoinCall } from "../controllers/webrtc";
import { handleICECandidate, handleWebRTCAnswer, handleWebRTCOffer } from "../controllers/webRTCHandler";
import { createInviteCode, JoinFriendRoom } from "../controllers/joinGameFriend";


export async function handleMessage(ws: WebSocket, data: string) {
    const message = JSON.parse(data);

    if (message.type === WebSocketMessageType.JOINLOBBY) {
        await addToLobby(ws, message);
        return;
    }
    else if(message.type === WebSocketMessageType.ROOMEXIST){
        checkRoomExist(ws, message);
        return;
    }else if(message.type === WebSocketMessageType.INGAMEMOVE){
        makeMove(ws, message);
        return;
    }else if(message.type === WebSocketMessageType.TEXTMESSAGE){
        handleTextMessage(ws, message);
        return;
    }else if(message.type === WebSocketMessageType.JOIN_CALL){
        handleJoinCall(ws, message);
        return;
    }else if(message.type === WebSocketMessageType.WEBRTCOFFER){
        handleWebRTCOffer(ws, message);
        return;
    }
    else if(message.type === WebSocketMessageType.WEBRTCOFFERANSWER){
        handleWebRTCAnswer(ws, message);
        return;
    }else if(message.type === WebSocketMessageType.ICE_CANDIDATE){
        handleICECandidate(ws, message);
        return;
    }else if(message.type === WebSocketMessageType.CREATE_INVITE_LINK){
        createInviteCode(ws, message);
        return;
    }else if(message.type === WebSocketMessageType.JOIN_FRIEND_ROOM){
        JoinFriendRoom(ws, message);
        return;
    }
    
    
}