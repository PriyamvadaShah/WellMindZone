class PeerService {
  constructor() {
    this.peer = null;
    this.isNegotiating = false;
    this.initializePeer();
  }

  initializePeer() {
    console.log("Creating new peer connection...");
    
    try {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302"
            ]
          }
        ]
      });

      // Simple state logging
      this.peer.addEventListener('connectionstatechange', () => {
        console.log(`Connection state: ${this.peer.connectionState}`);
      });

      this.peer.addEventListener('iceconnectionstatechange', () => {
        console.log(`ICE state: ${this.peer.iceConnectionState}`);
      });

      return this.peer;
    } catch (err) {
      console.error("Peer creation failed:", err);
      throw err;
    }
  }

  async getOffer() {
    if (!this.peer) this.initializePeer();
    
    try {
      // Add transceivers first
      this.peer.addTransceiver('video', {direction: 'sendrecv'});
      this.peer.addTransceiver('audio', {direction: 'sendrecv'});
      
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
    } catch (err) {
      console.error("Offer creation failed:", err);
      throw err;
    }
  }

  async getAnswer(offer) {
    if (!this.peer) this.initializePeer();
    
    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return answer;
    } catch (err) {
      console.error("Answer creation failed:", err);
      throw err;
    }
  }

  async setRemoteDescription(ans) {
    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    } catch (err) {
      console.error("Setting remote description failed:", err);
      throw err;
    }
  }

  cleanup() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
  }
}

const peerService = new PeerService();
export default peerService;