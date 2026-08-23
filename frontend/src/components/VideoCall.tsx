'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconClose } from '@/src/components/Icons';

interface VideoCallProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
  remoteUserName?: string;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  ticketId,
  isOpen,
  onClose,
  remoteUserName = 'Technicien Support AM Info',
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setConnectionStatus('connecting');
      setCallDuration(0);

      // Start duration counter
      const connectTimeout = setTimeout(() => {
        setConnectionStatus('connected');
        timer = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }, 1500);

      // Request camera if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((stream) => {
            streamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            // Camera not granted or not available (e.g. simulated)
          });
      }

      return () => {
        clearTimeout(connectTimeout);
        if (timer) clearInterval(timer);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [isOpen]);

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900/80 border-b border-gray-800 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              <h3 className="text-white font-bold text-sm md:text-base">
                Assistance Vidéo en Direct — Ticket #{ticketId}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Avec {remoteUserName} {connectionStatus === 'connected' ? `• ${formatTime(callDuration)}` : '• Connexion en cours...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
          {/* Main (Remote) View */}
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-2xl mb-4 shadow-lg shadow-blue-500/20">
              AM
            </div>
            <h4 className="text-white font-bold text-lg">{remoteUserName}</h4>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              {connectionStatus === 'connecting'
                ? 'Établissement du flux chiffré de diagnostic vidéo...'
                : 'Partage d’écran & caméra actif. Décrivez la panne au technicien.'}
            </p>
          </div>

          {/* Picture-in-picture (Local) View */}
          <div className="absolute bottom-4 right-4 w-36 md:w-48 aspect-video bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-700 shadow-xl">
            {!isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs font-semibold">
                Caméra coupée
              </div>
            )}
            <span className="absolute bottom-1.5 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
              Vous
            </span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title={isMuted ? 'Activer micro' : 'Couper micro'}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition ${
              isVideoOff ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title={isVideoOff ? 'Activer caméra' : 'Couper caméra'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.053 15.053 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
            </svg>
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
