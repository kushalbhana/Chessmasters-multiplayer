import WebSocketClient from "../websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { PlayerType } from "@repo/lib/types";

export default class WebRTCConnection {
  private static instance: WebRTCConnection;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: ReturnType<typeof WebSocketClient.getInstance>;
  private roomId: string;
  private playerType: PlayerType;

  private constructor(roomId: string, playerType: PlayerType) {
    this.roomId = roomId;
    this.playerType = playerType;
    this.socket = WebSocketClient.getInstance();
    this.setupSocketListeners();
  }

  public static getInstance(roomId: string, playerType: PlayerType): WebRTCConnection {
    if (!WebRTCConnection.instance) {
      WebRTCConnection.instance = new WebRTCConnection(roomId, playerType);
    }
    return WebRTCConnection.instance;
  }

  public async initMedia(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public async startConnection(): Promise<void> {
    if (!this.localStream) throw new Error("Local stream not initialized");

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.remoteStream = new MediaStream();

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection?.addTrack(track, this.localStream!);
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.sendMessage(
          JSON.stringify({
            type: WebSocketMessageType.WEBRTC,
            data: {
              roomId: this.roomId,
              candidate: event.candidate,
              sender: this.playerType,
            },
          })
        );
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream?.addTrack(event.track);
    };

    // Send join message
    this.socket.sendMessage(
      JSON.stringify({
        type: WebSocketMessageType.JOIN_CALL,
        data: {
          roomId: this.roomId,
          sender: this.playerType,
        },
      })
    );
  }

  private setupSocketListeners() {
    this.socket.onMessage(async (event: MessageEvent) => {
      const raw = event.data;
      const msg = JSON.parse(raw);

      // Another peer joined the room
      if (msg.type === WebSocketMessageType.NEW_PEER) {
        if (!this.peerConnection) return;

        // Only white initiates the offer
        if (this.playerType === "white") {
          const offer = await this.peerConnection.createOffer();
          await this.peerConnection.setLocalDescription(offer);
          this.socket.sendMessage(
            JSON.stringify({
              type: WebSocketMessageType.WEBRTC,
              data: {
                roomId: this.roomId,
                sdp: offer,
                sender: this.playerType,
              },
            })
          );
        }
      }

      // Handle SDP and ICE
      if (
        msg.type === WebSocketMessageType.WEBRTC &&
        msg.data?.roomId === this.roomId
      ) {
        const { sdp, candidate } = msg.data;
        if (!this.peerConnection) return;

        if (sdp) {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
          if (sdp.type === "offer") {
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socket.sendMessage(
              JSON.stringify({
                type: WebSocketMessageType.WEBRTC,
                data: {
                  roomId: this.roomId,
                  sdp: answer,
                  sender: this.playerType,
                },
              })
            );
          }
        } else if (candidate) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    });
  }

  public closeConnection() {
    this.peerConnection?.close();
    this.peerConnection = null;
    WebRTCConnection.instance = undefined as any;
  }
}
