import { useRef, useState } from 'react'
import './App.css'

const iceservers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

let PeerConnection = new RTCPeerConnection(iceservers)

let remoteStream = new MediaStream()
PeerConnection.ontrack = (event) => {
  event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track))
}

function App() {
  const localVideo = useRef<HTMLVideoElement>(undefined!)
  const remoteVideo = useRef<HTMLVideoElement>(undefined!)
  const remoteOfferorAnswer = useRef<HTMLInputElement>(undefined!)

  const [sdp, setSDP] = useState('')

  PeerConnection.onicecandidate = () => {
    setSDP(JSON.stringify(PeerConnection.localDescription))
  }

  async function StartCall() {
    let localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStream.getTracks().forEach(track => PeerConnection.addTrack(track, localStream))
    
    localVideo.current.srcObject = localStream
    remoteVideo.current.srcObject = remoteStream

    const offer = await PeerConnection.createOffer()
    await PeerConnection.setLocalDescription(offer)
  }

  async function AnswerCall() {
    let localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStream.getTracks().forEach(track => PeerConnection.addTrack(track, localStream))
    
    localVideo.current.srcObject = localStream
    remoteVideo.current.srcObject = remoteStream
    
    let remoteOffer = JSON.parse(remoteOfferorAnswer.current.value)
    PeerConnection.setRemoteDescription(remoteOffer)

    const answer = await PeerConnection.createAnswer()
    await PeerConnection.setLocalDescription(answer)
  }

  async function AddRemote() {
    let remoteAnswer = JSON.parse(remoteOfferorAnswer.current.value)
    await PeerConnection.setRemoteDescription(remoteAnswer)
  }

  async function EndCall() {
    await PeerConnection.close()
  }

  return (
    <div className="App">
      <div className="video-container">
        <video className="video" ref={localVideo} autoPlay playsInline muted></video>
        <video className="video" ref={remoteVideo} autoPlay playsInline></video>
      </div>
      <input type='text' className='SDP-Input' ref={remoteOfferorAnswer} />
      <div className='action-buttons'>
        <button onClick={StartCall}>Start Call</button>
        <button onClick={AnswerCall}>Answer Call</button>
        <button onClick={AddRemote}>Add Remote</button>
        <button onClick={EndCall}>End Call</button>
      </div>
      <p className='sdp-text'>{sdp}</p>
    </div>
  )
}

export default App
