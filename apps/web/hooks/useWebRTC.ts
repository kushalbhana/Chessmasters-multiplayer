import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { PlayerType } from "@repo/lib/types";
import { useSession } from "next-auth/react";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { useRecoilValue } from "recoil";

export const useWebRTC = (playerType: PlayerType) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const { data: session } = useSession();
  const room = useRecoilValue(roomInfo);
  const ws = useMemo(() => WebSocketClient.getInstance(), []);

  // Send ICE candidate to remote peer
  const handleIceCandidate = useCallback((event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      ws.sendMessage(JSON.stringify({
        type: WebSocketMessageType.ICE_CANDIDATE,
        JWT_token: session?.user.jwt,
        data: {
          roomId: room?.roomId,
          candidate: event.candidate
        }
      }));
    }
  }, [room?.roomId, session?.user.jwt, ws]);

  // Track handler
  const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
    if (remoteVideoRef.current && event.streams && event.streams[0]) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  }, []);

  const handleNegotiation = useCallback(async () => {
    const peer = peerConnectionRef.current;
    if (!peer) return;
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      ws.sendMessage(JSON.stringify({
        type: WebSocketMessageType.WEBRTCOFFER,
        JWT_token: session?.user.jwt,
        data: {
          roomId: room?.roomId,
          offer
        }
      }));
    } catch (err) {
      console.error("Negotiation failed:", err);
    }
  }, [room?.roomId, session?.user.jwt, ws]);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const peer = peerConnectionRef.current;
    if (!peer) return;

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    ws.sendMessage(JSON.stringify({
      type: WebSocketMessageType.WEBRTCOFFERANSWER,
      JWT_token: session?.user.jwt,
      data: {
        roomId: room?.roomId,
        answer
      }
    }));
  }, [room?.roomId, session?.user.jwt, ws]);

  const handleOfferAccepted = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const peer = peerConnectionRef.current;
    if (!peer) return;
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const handleRemoteIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      const peer = peerConnectionRef.current;
      if (!peer) return;
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("Error adding received ICE candidate", err);
    }
  }, []);

  // Setup PeerConnection
  useEffect(() => {
    if (!room) return;

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: ["stun:stun.l.google.com:19302"] },
        // Optionally add TURN server here for production
      ]
    });

    peerConnectionRef.current = peer;
    peer.onicecandidate = handleIceCandidate;
    peer.ontrack = handleTrackEvent;

    if (playerType === PlayerType.WHITE) {
      peer.onnegotiationneeded = handleNegotiation;
    }

    return () => {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onnegotiationneeded = null;
      peer.close();
      peerConnectionRef.current = null;
    };
  }, [room?.roomId, playerType, handleIceCandidate, handleTrackEvent, handleNegotiation]);

  // Get local stream and add to peer
  useEffect(() => {
    const initMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = peerConnectionRef.current;
      if (!peer) return;

      stream.getTracks().forEach(track => peer.addTrack(track, stream));
    };
    initMedia();
  }, []);

  // WebSocket handler
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case WebSocketMessageType.WEBRTCOFFER:
          await createAnswer(data.data.offer);
          break;
        case WebSocketMessageType.WEBRTCOFFERANSWER:
          await handleOfferAccepted(data.data.answer);
          break;
        case WebSocketMessageType.ICE_CANDIDATE:
          await handleRemoteIceCandidate(data.data.candidate);
          break;
      }
    };

    ws.onMessage(handleMessage);
    return () => ws.removeMessageListener(handleMessage);
  }, [createAnswer, handleOfferAccepted, handleRemoteIceCandidate]);

  return { localVideoRef, remoteVideoRef };
};
