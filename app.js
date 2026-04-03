// NightWhispers Application Logic (Desktop)

// Initialize Icons
lucide.createIcons();

// --- Spooky Audio System ---
let audioCtx = null;
let startedAudio = false;

function initSpookyAudio() {
    if (startedAudio) return;
    startedAudio = true;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        
        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = 45; // Deep dark ambient rumble
        
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow breathing modulation
        
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        
        lfo.connect(filter.frequency);
        lfo.frequency.value = 0.05;
        
        gainNode.gain.value = 0.2; 
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        lfo.start();
    } catch (e) { console.warn("Web audio not supported", e); }
}

function playJumpScareSound() {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); // High screech
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.5); // Rapid drop
        
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {}
}

document.addEventListener('click', () => {
    if (!document.getElementById('auth-overlay').classList.contains('hidden')) {
        initSpookyAudio();
    }
}, { once: true });
document.addEventListener('keydown', () => {
    if (!document.getElementById('auth-overlay').classList.contains('hidden')) {
        initSpookyAudio();
    }
}, { once: true });

// --- Authentication UI Logic ---
const authOverlay = document.getElementById('auth-overlay');
const btnLoginTab = document.getElementById('btn-tab-login');
const btnSignupTab = document.getElementById('btn-tab-signup');
const groupUsername = document.getElementById('group-username');
const authForm = document.getElementById('auth-form');
const btnAuthSubmit = document.getElementById('btn-auth-submit');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authUsername = document.getElementById('auth-username');
const authError = document.getElementById('auth-error');

let currentUser = JSON.parse(localStorage.getItem('NightWhispers_current_user') || 'null');

if (currentUser) {
    authOverlay.classList.remove('fadeOut');
    authOverlay.classList.add('hidden');
    updateUIWithUser();
}

function updateUIWithUser() {
    if(!currentUser) return;
    document.querySelectorAll('.username').forEach(el => el.textContent = currentUser.name);
    const avatars = document.querySelectorAll('.profile-avatar-lg, .composer-top .avatar');
    avatars.forEach(el => el.src = currentUser.avatar);
}

btnLoginTab.addEventListener('click', () => {
    btnLoginTab.classList.add('active');
    btnSignupTab.classList.remove('active');
    groupUsername.classList.add('hidden');
    authUsername.removeAttribute('required');
    document.getElementById('label-email-username').textContent = 'Email or Username';
    document.getElementById('auth-email').placeholder = 'agent@bureau.gov or alias';
});

btnSignupTab.addEventListener('click', () => {
    btnSignupTab.classList.add('active');
    btnLoginTab.classList.remove('active');
    groupUsername.classList.remove('hidden');
    authUsername.setAttribute('required', 'true');
    document.getElementById('label-email-username').textContent = 'Email';
    document.getElementById('auth-email').placeholder = 'agent@bureau.gov';
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(authError) authError.classList.add('hidden');
    
    const isSignup = btnSignupTab.classList.contains('active');
    const email = authEmail.value;
    const password = authPassword.value;
    const username = authUsername.value;
    
    let users = JSON.parse(localStorage.getItem('NightWhispers_users') || '{}');
    
    if (isSignup) {
        const usernameExists = Object.values(users).some(u => u.name.toLowerCase() === username.toLowerCase());
        if (users[email]) {
            if(authError) { authError.textContent = "Email already registered across the network."; authError.classList.remove('hidden'); }
            return;
        }
        if (usernameExists) {
            if(authError) { authError.textContent = "Username already taken."; authError.classList.remove('hidden'); }
            return;
        }
        users[email] = {
            email, password, name: username,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        };
        localStorage.setItem('NightWhispers_users', JSON.stringify(users));
        currentUser = users[email];
    } else {
        const input = email.toLowerCase();
        let foundUser = users[input] || Object.values(users).find(u => u.name.toLowerCase() === input);
        if (!foundUser || foundUser.password !== password) {
            if(authError) { authError.textContent = "Invalid transmission coordinates (wrong username/email or password)."; authError.classList.remove('hidden'); }
            playJumpScareSound();
            return;
        }
        currentUser = foundUser;
    }
    
    localStorage.setItem('NightWhispers_current_user', JSON.stringify(currentUser));
    updateUIWithUser();

    btnAuthSubmit.textContent = isSignup ? 'Registering...' : 'Authenticating...';
    btnAuthSubmit.style.opacity = '0.7';
    if (!isSignup) { playJumpScareSound(); }
    
    setTimeout(() => {
        btnAuthSubmit.textContent = `Welcome, ${currentUser.name}`;
        btnAuthSubmit.style.background = 'var(--success-green)';
        btnAuthSubmit.style.boxShadow = '0 0 15px var(--success-green)';
        
        setTimeout(() => {
            authOverlay.classList.add('fadeOut');
            setTimeout(() => { authOverlay.classList.add('hidden'); }, 600);
        }, 800);
    }, 1500);
});

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('NightWhispers_current_user');
    location.reload();
});

// --- Smooth Scrolling for Navigation ---
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 80, // offset for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Active nav link highlight on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href').substring(1) === current) {
            a.classList.add('active');
        }
    });
});

// --- Stories Carousel Logic ---
const storiesData = [
    { name: "EchoEars", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Echo", isLive: true },
    { name: "SkyWatcher", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sky", isLive: false },
    { name: "GhostBoi", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GhostBoi", isLive: false },
    { name: "JaneDoe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", isLive: false },
    { name: "MothmanFan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Moth", isLive: false }
];

const storiesTrack = document.getElementById('stories-track');
function renderStories() {
    storiesData.forEach(story => {
        const div = document.createElement('div');
        div.className = `story-circle ${story.isLive ? 'live' : ''}`;
        div.innerHTML = `
            <img src="${story.avatar}" alt="${story.name}">
            ${story.isLive ? '<div class="story-badge-live">LIVE</div>' : ''}
            <span class="story-name">${story.name}</span>
        `;
        storiesTrack.appendChild(div);
    });
}
renderStories();

// --- Data: Encounters Table ---
const encountersData = [
    {
        id: "ENC_001", title: "Shadow Entity in the Pines", location: "Blackwood Forest", type: "Demon", votes: 1204, date: "2h ago",
        user: { name: "WraithHunter", rank: "Master Tracker", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wraith" },
        imageUrl: "assets/encounter.png", story: "Was setting up trail cams and caught this anomaly. It drained my camera battery instantly.",
    },
    {
        id: "ENC_002", title: "Unexplained Lights hovering", location: "Route 66, Desert", type: "UFO", votes: 842, date: "5h ago",
        user: { name: "SkyWatcher", rank: "Investigator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sky" },
        imageUrl: "https://images.unsplash.com/photo-1519864239-688a29a2862b?auto=format&fit=crop&q=80&w=400",
        story: "Three silent orbs forming a triangle formation. Hovered for 20 minutes before shooting straight up.",
    },
    {
        id: "ENC_003", title: "EVP recording in basement", location: "Abandoned Asylum", type: "Ghost", votes: 532, date: "1d ago",
        user: { name: "EchoEars", rank: "Witness", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Echo" },
        imageUrl: "https://images.unsplash.com/photo-1542159837-29dcb0f90cba?auto=format&fit=crop&q=80&w=400",
        story: "Audio strictly. When I asked 'who's there', you can clearly hear a rasping voice say 'Get out'.",
    }
];

const feedList = document.getElementById('feed-list');
function renderFeed() {
    feedList.innerHTML = '';
    encountersData.forEach(enc => {
        const card = document.createElement('div');
        card.className = 'encounter-card';
        card.innerHTML = `
            <div class="card-header" style="justify-content: space-between;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <img src="${enc.user.avatar}" alt="user" class="avatar">
                    <div class="user-info">
                        <h4 style="margin:0">${enc.user.name} • <span class="text-xs text-gold">${enc.user.rank}</span></h4>
                        <p class="text-xs text-dim">${enc.location} • ${enc.date}</p>
                    </div>
                </div>
                <button class="btn-connect" onclick="this.classList.add('connected'); this.innerHTML='<i data-lucide=\\'check\\'></i> Connected'; lucide.createIcons();"><i data-lucide="user-plus" style="width:14px;height:14px"></i> Connect</button>
            </div>
            <img src="${enc.imageUrl}" alt="Encounter Image" class="encounter-image mt-2">
            <h3 class="mt-2" style="font-size:1.1rem">${enc.title}</h3>
            <p class="story-text">${enc.story}</p>
            <div class="card-footer">
                <span class="tag"><i data-lucide="tag" style="width:12px; height:12px;"></i> ${enc.type}</span>
                <div style="display:flex; gap: 15px;">
                    <button class="icon-btn text-xs"><i data-lucide="message-square" style="width:14px; height:14px;"></i> 12</button>
                    <button class="icon-btn text-xs"><i data-lucide="triangle" style="width:14px; height:14px; transform: rotate(180deg)"></i> ${enc.votes}</button>
                </div>
            </div>
        `;
        feedList.appendChild(card);
    });
    lucide.createIcons();
}

// --- Media Vault Logic ---
const mediaGrid = document.getElementById('media-grid');
const feedTabs = document.querySelectorAll('.feed-tab[data-tab]');

function renderMediaGrid() {
    mediaGrid.innerHTML = '';
    const mediaItems = [
        { url: 'assets/encounter.png', type: 'video', views: '1.2k' },
        { url: 'https://images.unsplash.com/photo-1519864239-688a29a2862b?auto=format&fit=crop&q=80&w=400', type: 'image', views: '842' },
        { url: 'https://images.unsplash.com/photo-1542159837-29dcb0f90cba?auto=format&fit=crop&q=80&w=400', type: 'image', views: '532' },
        { url: 'assets/bg.png', type: 'video', views: '3k' },
        { url: 'assets/map.png', type: 'image', views: '120' },
        { url: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&q=80&w=400', type: 'image', views: '9k' }
    ];
    
    mediaItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'media-item';
        const icon = item.type === 'video' ? '<i data-lucide="video" style="width:14px;height:14px"></i>' : '<i data-lucide="image" style="width:14px;height:14px"></i>';
        div.innerHTML = `
            <img src="${item.url}" class="media-thumbnail">
            <div class="media-overlay"><span class="icon" style="display:flex;gap:5px;color:#fff;font-size:0.8rem">${icon} ${item.views}</span></div>
        `;
        mediaGrid.appendChild(div);
    });
    lucide.createIcons();
}

feedTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        feedTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');
        if(target === 'list') {
            feedList.classList.remove('hidden');
            mediaGrid.classList.add('hidden');
        } else if (target === 'media') {
            feedList.classList.add('hidden');
            mediaGrid.classList.remove('hidden');
            renderMediaGrid();
        }
    });
});

// Initialize Feed Views
renderFeed();

// --- Composer Logic ---
const composerInput = document.getElementById('composer-input');
composerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && composerInput.value.trim() !== '') {
        const newEnc = {
            id: "ENC_" + Date.now(),
            title: "Field Report",
            location: "Current Location",
            type: "Update",
            votes: 0,
            date: "Just now",
            user: currentUser || { name: "Agent_Mulder99", rank: "Investigator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NightWhispers" },
            imageUrl: "https://images.unsplash.com/photo-1542159837-29dcb0f90cba?auto=format&fit=crop&q=80&w=400", // Generic dark image placeholder
            story: composerInput.value.trim()
        };
        encountersData.unshift(newEnc);
        renderFeed();
        composerInput.value = '';
    }
});

// --- Go Live Logic ---
const btnComposerLive = document.getElementById('btn-composer-live');
const liveModal = document.getElementById('live-modal');
const btnEndLive = document.getElementById('btn-end-live');
const liveVideo = document.getElementById('live-video');
const liveFallback = document.getElementById('live-fallback');
const liveViewCount = document.getElementById('live-view-count');

let localStream = null;
let liveInterval = null;

btnComposerLive.addEventListener('click', async () => {
    liveModal.classList.remove('hidden');
    liveViewCount.textContent = "0";
    
    // Simulate viewers
    let viewers = 0;
    liveInterval = setInterval(() => {
        viewers += Math.floor(Math.random() * 5) + 1;
        liveViewCount.textContent = viewers;
    }, 2000);

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        liveVideo.srcObject = localStream;
        liveVideo.classList.remove('hidden');
        liveFallback.classList.add('hidden');
    } catch (err) {
        console.warn("Camera access denied or unavailable", err);
        liveVideo.classList.add('hidden');
        liveFallback.classList.remove('hidden');
    }
});

btnEndLive.addEventListener('click', () => {
    liveModal.classList.add('hidden');
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    clearInterval(liveInterval);
});


// --- Map Logic ---
const hauntedLocationsData = [
    { id: "LOC_1", name: "The Hollows", risk: "High", x: 20, y: 40, story: "Multiple reports of a tall pale entity tracking hikers." },
    { id: "LOC_2", name: "Sector 4 Site", risk: "Extreme", x: 70, y: 25, story: "High EM interference. Compass spins wildly in this area." },
    { id: "LOC_3", name: "Old Waterworks", risk: "Medium", x: 50, y: 70, story: "EVP hotspot. Water sometimes runs red." }
];

const mapPinsContainer = document.getElementById('map-pins-container');
const panelTitle = document.getElementById('panel-title');
const panelStory = document.getElementById('panel-story');
const panelRisk = document.getElementById('panel-risk');

function renderMapPins() {
    hauntedLocationsData.forEach(loc => {
        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.style.left = `${loc.x}%`; pin.style.top = `${loc.y}%`;
        
        pin.addEventListener('click', () => {
            panelTitle.textContent = loc.name;
            panelStory.textContent = loc.story;
            panelRisk.classList.remove('hidden');
            panelRisk.innerHTML = `Risk: <span class="risk-level" style="color:var(--danger-red)">${loc.risk}</span>`;
            
            const panel = document.querySelector('.map-side-panel');
            panel.style.background = 'rgba(255, 42, 42, 0.1)';
            setTimeout(() => { panel.style.background = 'rgba(10,10,15, 0.5)'; }, 300);
        });
        mapPinsContainer.appendChild(pin);
    });
}
renderMapPins();


// --- Friends & Live Chat Logic (Sidebar) ---
const friendsData = [
    { id: 'FR_1', name: 'WraithHunter', status: 'Tracking in Blackwood', isOnline: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wraith' },
    { id: 'FR_2', name: 'EchoEars', status: 'Analyzing EVP audio', isOnline: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Echo' },
    { id: 'FR_3', name: 'MothmanFan99', status: 'Last seen 2h ago', isOnline: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moth' },
    { id: 'FR_4', name: 'Seeker', status: 'Last seen 1d ago', isOnline: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seeker' }
];

const friendsListEl = document.getElementById('friends-list');
const chatDialog = document.getElementById('chat-dialog');
const chatFriendName = document.getElementById('chat-friend-name');
const chatFriendStatus = document.getElementById('chat-friend-status');
const chatMessagesEl = document.getElementById('chat-messages');
const closeChatBtn = document.getElementById('btn-close-chat');
const chatForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');

let currentActiveFriend = null;
const messageHistory = {}; 

function renderFriends() {
    friendsListEl.innerHTML = '';
    friendsData.forEach(friend => {
        const fDiv = document.createElement('div');
        fDiv.className = 'friend-item';
        fDiv.innerHTML = `
            <div class="friend-avatar-wrapper">
                <img src="${friend.avatar}" style="width:40px;height:40px;border-radius:50%">
                ${friend.isOnline ? '<div class="online-badge dot-green"></div>' : '<div class="online-badge" style="background:#444;"></div>'}
            </div>
            <div class="friend-info" style="flex:1">
                <h4 style="margin:0">${friend.name}</h4>
                <p class="text-xs text-dim">${friend.status}</p>
            </div>
            <button class="icon-btn text-dim"><i data-lucide="message-square" style="width:16px;height:16px"></i></button>
        `;
        fDiv.addEventListener('click', () => openChat(friend));
        friendsListEl.appendChild(fDiv);
    });
    lucide.createIcons();
}

function openChat(friend) {
    currentActiveFriend = friend;
    chatFriendName.textContent = friend.name;
    chatFriendStatus.textContent = friend.isOnline ? 'Online' : 'Offline';
    chatFriendStatus.className = friend.isOnline ? 'text-xs text-green' : 'text-xs text-dim';
    
    if(!messageHistory[friend.id]) {
        messageHistory[friend.id] = [
            { text: `Hey, did you check the coordinates from the latest drop?`, sender: 'them', time: '10:02 PM' }
        ];
    }
    
    renderMessages(friend.id);
    chatDialog.classList.remove('hidden');
    setTimeout(() => { chatDialog.classList.add('active'); }, 10);
}

function renderMessages(friendId) {
    chatMessagesEl.innerHTML = '';
    const msgs = messageHistory[friendId] || [];
    msgs.forEach(m => {
        const b = document.createElement('div');
        b.className = `chat-bubble ${m.sender === 'mine' ? 'msg-mine' : 'msg-them'}`;
        b.innerHTML = `${m.text} <span class="msg-time">${m.time}</span>`;
        chatMessagesEl.appendChild(b);
    });
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

closeChatBtn.addEventListener('click', () => {
    chatDialog.classList.remove('active');
    setTimeout(() => { chatDialog.classList.add('hidden'); currentActiveFriend = null; }, 300);
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!currentActiveFriend) return;
    const text = chatInput.value.trim();
    if(!text) return;
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messageHistory[currentActiveFriend.id].push({ text, sender: 'mine', time: timeStr });
    chatInput.value = '';
    renderMessages(currentActiveFriend.id);
    
    if (currentActiveFriend.isOnline) {
        setTimeout(() => {
            const replies = ["I'm heading there now.", "Wait, did you hear that?", "Stay away from Sector 4.", "I see them."];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            const timeStrNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            messageHistory[currentActiveFriend.id].push({ text: randomReply, sender: 'them', time: timeStrNow });
            if (currentActiveFriend && currentActiveFriend.id === currentActiveFriend.id) {
                renderMessages(currentActiveFriend.id);
            }
        }, 1500 + Math.random() * 2000);
    }
});
renderFriends();

// --- Upload Form Handler ---
const form = document.getElementById('encounter-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = "Transmitting...";
    btn.style.opacity = '0.7';
    
    setTimeout(() => {
        btn.textContent = "Data Uploaded!";
        btn.style.background = "var(--primary-glow)";
        form.reset();
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "";
            btn.style.opacity = '1';
        }, 3000);
    }, 2000);
});

document.getElementById('btn-premium').addEventListener('click', () => {
    alert("Unlock NightWhispers+ to access advanced features.");
});
