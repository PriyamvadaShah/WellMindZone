let peerService = null;

if (typeof window !== "undefined") {
  class PeerService {
    constructor() {
      this.peer = null;
      this.initializePeer();
    }

    initializePeer() {
      console.log("🔄 Creating new RTCPeerConnection...");

      this.peer = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302"] }
        ]
      });

      this.peer.addEventListener("connectionstatechange", () => {
        console.log(`📡 Connection State: ${this.peer.connectionState}`);
      });

      this.peer.addEventListener("iceconnectionstatechange", () => {
        console.log(`❄️ ICE State: ${this.peer.iceConnectionState}`);
      });
    }

    resetConnection() {
      console.log("🧹 Resetting peer connection...");
      if (this.peer) {
        this.peer.ontrack = null;
        this.peer.onicecandidate = null;
        this.peer.close();
        this.peer = null;
      }
      this.initializePeer();
    }

    async getOffer() {
      if (!this.peer || this.peer.connectionState === "closed") {
        this.resetConnection();
      }

      // getOffer() should be called AFTER tracks have been added.
      // addTrack implicitly creates the necessary transceivers.
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
    }

    async getAnswer(offer) {
      if (!this.peer || this.peer.connectionState === "closed") {
        this.resetConnection();
      }

      // getAnswer() should be called AFTER tracks have been added.
      // addTrack implicitly creates the necessary transceivers.
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return answer;
    }

    async setRemoteDescription(answer) {
      if (!this.peer || this.peer.connectionState === "closed") {
        this.resetConnection();
      }

      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    }

    cleanup() {
      console.log("🧹 Cleaning up peer connection...");
      if (this.peer) {
        this.peer.ontrack = null;
        this.peer.onicecandidate = null;
        this.peer.close();
        this.peer = null;
      }
    }
  }

  peerService = new PeerService();
}

export default peerService;