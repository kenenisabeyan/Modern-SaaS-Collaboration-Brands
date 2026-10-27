  if (joinDenied) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-rose-600/10 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <X size={40} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Entry Denied</h2>
            <p className="text-[#94A3B8] light:text-slate-500">The host declined your request to join.</p>
          </div>
          <button type="button" onClick={onLeave} className="w-full py-4 px-6 rounded-full font-semibold text-white light:text-slate-900 bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 transition-all hover:-translate-y-0.5">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (roomNotFound) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-rose-600/10 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <X size={40} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Room Not Found</h2>
            <p className="text-[#94A3B8] light:text-slate-500">This meeting link is invalid or the meeting has ended.</p>
          </div>
          <button type="button" onClick={onLeave} className="w-full py-4 px-6 rounded-full font-semibold text-white light:text-slate-900 bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 transition-all hover:-translate-y-0.5">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-indigo-600/15 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            <Users size={32} className="text-indigo-400 light:text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Waiting for Host</h2>
            <p className="text-[#94A3B8] light:text-slate-500">Please wait, the meeting host will let you in soon.</p>
          </div>
          <button type="button" onClick={onLeave} className="text-rose-400 hover:text-rose-300 mt-2 block mx-auto text-sm font-medium transition-colors hover:underline">
            Cancel & Return
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 relative overflow-hidden font-sans">
        <div className="absolute bg-blue-600/15 blur-[120px] w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="text-center space-y-6 z-10 max-w-md w-full mx-4 p-10 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-l-2 border-indigo-500 rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
            <Video size={32} className="text-blue-400 light:text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-2 tracking-tight">Opening Meeting</h2>
            <p className="text-[#94A3B8] light:text-slate-500">Checking the room and connecting securely.</p>
          </div>
        </div>
      </div>
    );
  }

  const allParticipantsCount = participants.length + 1;
  const getGridClass = () => {
    if (allParticipantsCount === 1) return 'flex items-center justify-center';
    if (allParticipantsCount === 2) return 'grid grid-cols-1 md:grid-cols-2';
    if (allParticipantsCount <= 4) return 'grid grid-cols-1 md:grid-cols-2';
    if (allParticipantsCount <= 6) return 'grid grid-cols-1 md:grid-cols-3';
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#050816] light:bg-slate-50 text-white light:text-slate-900 font-sans relative">
      {/* Background Blobs for main room */}
      <div className="absolute bg-purple-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-20%] left-[-10%] pointer-events-none"></div>
      <div className="absolute bg-blue-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"></div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${isChatOpen ? 'pr-0 md:pr-80' : 'pr-0'}`}>
        
        {/* Top Bar - Premium Glassmorphism */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-[#050816] light:from-slate-50 to-transparent">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            {/* Left: Time */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <span className="text-sm sm:text-base font-semibold tracking-wide text-white light:text-slate-900 drop-shadow-md">{currentTime}</span>
            </div>

            {/* Right: Participant Count */}
            <div className="flex items-center space-x-2 bg-[#0A0F24] light:bg-white shadow-xl dark:shadow-none/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 light:border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <User size={16} className="text-indigo-400 light:text-indigo-600" />
              <span className="text-sm font-semibold text-white light:text-slate-900">{allParticipantsCount}</span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pt-20 sm:pt-24 md:pt-28 pb-32 sm:pb-28 md:pb-24 overflow-y-auto w-full h-full flex items-center justify-center">
          <div className={`${getGridClass()} gap-3 sm:gap-4 md:gap-6 w-full h-full max-w-7xl mx-auto`}>
            {/* Local Video */}
            <div className={`bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-md rounded-full md:rounded-3xl relative overflow-hidden flex items-center justify-center min-h-[160px] sm:min-h-[200px] md:min-h-[220px] border border-indigo-300 dark:border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.15)] group ${allParticipantsCount === 1 ? 'max-w-4xl w-full aspect-video shadow-[0_0_50px_rgba(99,102,241,0.2)]' : ''}`}>
              {isInitializing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-sm">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" />
                    <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">Initializing camera...</span>
                  </div>
                </div>
              )}

              {!isInitializing && mediaError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 p-6 bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <VideoOff size={32} className="text-rose-400" />
                  </div>
                  <span className="text-rose-300 text-sm text-center font-medium max-w-[200px]">{mediaError}</span>
                  <button type="button" onClick={handleRetryCamera} className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 border border-indigo-500/50 rounded-full text-sm font-semibold transition-all">
                    Retry
                  </button>
                </div>
              )}

              {localStream && !mediaError && !isInitializing && (
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full min-h-[200px] object-cover ${isVideoOff ? 'opacity-0 absolute inset-0 pointer-events-none' : ''}`}
                    style={{ transform: 'scaleX(-1)' }}
                    onError={() => setMediaError('Camera failed to load. Please check permissions.')}
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-md">
                      <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 light:border-indigo-200 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        <User size={40} className="text-indigo-400 light:text-indigo-600" />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="absolute bottom-4 left-4 bg-[#050816]/80 light:bg-slate-50/80 backdrop-blur-xl text-white light:text-slate-900 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-white/10 light:border-slate-200 shadow-lg">
                {isMuted && <MicOff size={14} className="text-rose-400" />}
                <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">You{isHost ? ' (Host)' : ''}</span>
              </div>
            </div>

            {/* Remote Videos */}
            {participants.map((participant) => {
              const remoteStream = remoteStreams[participant.socketId];
              return (
                <div
                  key={participant.socketId}
                  className="bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-md rounded-full md:rounded-3xl relative overflow-hidden flex items-center justify-center group border border-white/10 light:border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)] aspect-video min-h-[160px] sm:min-h-[200px] md:min-h-[220px]"
                >
                  {remoteStream && participant.videoEnabled !== false ? (
                    <RemoteVideoPlayer stream={remoteStream} className="w-full h-full min-h-[160px] sm:min-h-[200px] object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-md">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <span className="text-3xl md:text-4xl text-purple-600 dark:text-purple-400 font-bold">
                          {participant.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-[#050816]/80 light:bg-slate-50/80 backdrop-blur-xl text-white light:text-slate-900 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-white/10 light:border-slate-200 shadow-lg">
                    {participant.audioEnabled === false && <MicOff size={14} className="text-rose-400" />}
                    <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{participant.username || 'User'}{participant.isHost ? ' (Host)' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiting Room Panel (Host Only) */}
        {isHost && waitingUsers.length > 0 && (
          <div className="absolute top-20 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-[calc(100vw-2rem)] bg-[#0A0F24] light:bg-white shadow-none/95 light:shadow-xl backdrop-blur-2xl border border-indigo-500/30 light:border-indigo-200 rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.2)] p-5">
            <h3 className="text-white light:text-slate-900 font-bold mb-4 flex items-center text-sm sm:text-base tracking-wide">
              <span className="bg-indigo-500 text-xs px-2.5 py-1 rounded-full mr-3 shadow-[0_0_10px_rgba(99,102,241,0.4)]">{waitingUsers.length}</span>
              Waiting to join
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {waitingUsers.map((user) => (
                <div key={user.socketId} className="flex items-center justify-between bg-[#160B2A]/50 light:bg-slate-100 border border-white/5 light:border-slate-100 p-3 rounded-full hover:border-white/10 light:border-slate-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-200 light:text-slate-700 truncate pr-2">{user.username}</span>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => handleDeny(user.socketId)} className="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20" title="Reject">
                      <X size={16} />
                    </button>
                    <button type="button" onClick={() => handleAdmit(user.socketId)} className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20" title="Admit">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Control Bar - Premium Glassmorphism */}
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#0A0F24] light:bg-white shadow-none/80 light:shadow-xl backdrop-blur-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-[2rem] flex items-center space-x-3 sm:space-x-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(124,58,237,0.15)] border border-white/10 light:border-slate-200">
            {/* Meeting Code & Copy Link (Host Only) */}
            {isHost && (
              <div className="flex items-center space-x-3 sm:space-x-4 pr-3 sm:pr-4 border-r border-white/10 light:border-slate-200">
                <div className="hidden sm:block">
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-semibold uppercase tracking-wider mb-0.5">Meeting Code</p>
                  <p className="text-xs font-mono font-bold text-white light:text-slate-900">{roomId}</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleCopyLink} 
                  className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 light:border-indigo-200 rounded-full text-indigo-600 dark:text-indigo-300 text-sm font-semibold transition-all hover:scale-105 flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="hidden sm:inline">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Microphone */}
            <button 
              type="button" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-500/30' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200'
              }`} 
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Camera */}
            <button 
              type="button" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${
                isVideoOff 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-500/30' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200'
              }`} 
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            {/* Leave Call */}
            <button 
              type="button" 
              className="px-6 h-12 sm:h-14 rounded-full flex items-center justify-center bg-purple-500 text-white light:text-slate-900 hover:from-rose-500 hover:to-rose-400 transition-all duration-300 shadow-[0_0_20px_rgba(225,29,72,0.4)] ml-2 hover:scale-105" 
              onClick={onLeave}
              title="Leave call"
            >
              <PhoneOff size={20} />
            </button>

            {/* Chat Toggle */}
            <button 
              type="button" 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border relative ml-2 ${
                isChatOpen 
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 light:border-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'bg-white/5 light:bg-slate-100 text-white light:text-slate-900 border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200'
              }`} 
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Toggle chat"
            >
              <MessageSquare size={20} />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500 rounded-full text-[10px] sm:text-[11px] font-bold flex items-center justify-center border-2 border-[#0A0F24] shadow-lg">
                  {messages.length > 9 ? '9+' : messages.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar - Premium Glassmorphism */}
      <div
        className={`
        fixed md:absolute right-0 top-0 bottom-0 w-full md:w-[350px] bg-[#0A0F24] light:bg-white shadow-none/95 light:shadow-xl backdrop-blur-3xl md:border-l border-white/10 light:border-slate-200 flex flex-col z-40 transition-transform duration-500 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        {/* Chat Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 light:border-slate-200 bg-transparent">
          <span className="text-lg font-bold text-white light:text-slate-900 tracking-wide">Meeting Chat</span>
          <button 
            type="button" 
            className="text-slate-400 light:text-slate-500 hover:text-white light:text-slate-900 transition-colors p-2 rounded-full hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 border border-transparent hover:border-white/10 light:border-slate-200" 
            onClick={() => setIsChatOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Info Banner */}
        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 text-[13px] text-indigo-200 border-b border-indigo-200 dark:border-indigo-500/20 leading-relaxed font-medium">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <MessageSquare size={48} className="text-indigo-400 light:text-indigo-600" />
              <p className="text-slate-700 dark:text-slate-300 light:text-slate-600 text-sm font-medium">No messages yet.<br/>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`flex flex-col space-y-1.5 w-full ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline space-x-2 px-1">
                  <span className="text-sm font-bold text-white light:text-slate-900">{msg.username}</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`text-[14px] p-3.5 shadow-md max-w-[85%] break-words leading-relaxed ${
                  msg.isOwn 
                    ? 'bg-indigo-500 text-white light:text-slate-900 rounded-full rounded-tr-sm shadow-[0_5px_15px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 text-slate-200 light:text-slate-700 rounded-full rounded-tl-sm backdrop-blur-md'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-5 border-t border-white/10 light:border-slate-200 bg-transparent">
          <div className="relative flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-[#050816] light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full pl-5 pr-14 py-4 text-sm text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) handleSendMessage();
              }}
            />
            <button 
              type="button" 
              className={`absolute right-2 p-2.5 rounded-full transition-all ${
                message.length > 0 
                  ? 'bg-indigo-500 text-white light:text-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-400 hover:scale-105' 
                  : 'text-slate-600 cursor-not-allowed bg-transparent'
              }`} 
              onClick={handleSendMessage} 
              disabled={message.length === 0}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


