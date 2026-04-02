// NightWhispers Application Logic

// Initialize Icons
lucide.createIcons();

// --- Navigation Logic ---
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Prevent default in case it's a form or link
        e.preventDefault();
        
        // Remove active class from all navs
        navItems.forEach(nav => nav.classList.remove('active'));
        // Add active to clicked nav
        item.classList.add('active');
        
        // Find target view
        const targetId = item.getAttribute('data-target');
        
        // Hide all views
        views.forEach(view => {
            view.classList.remove('active-view');
        });
        
        // Show target view
        document.getElementById(targetId).classList.add('active-view');
        
        // Initialize Map if map view is selected
        if(targetId === 'view-map') {
            renderMapPins();
        }
    });
});


// --- Data: Encounters Table ---
const currentUserId = "USR_X9021"; // Agent_Mulder99

const encountersData = [
    {
        id: "ENC_001",
        title: "Shadow Entity in the Pines",
        location: "Blackwood Forest",
        type: "Demon",
        votes: 1204,
        date: "2h ago",
        user: { name: "WraithHunter", rank: "Master Tracker", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wraith" },
        imageUrl: "assets/encounter.png",
        story: "Was setting up trail cams and caught this anomaly. It drained my camera battery instantly.",
    },
    {
        id: "ENC_002",
        title: "Unexplained Lights hovering",
        location: "Route 66, Desert",
        type: "UFO",
        votes: 842,
        date: "5h ago",
        user: { name: "SkyWatcher", rank: "Investigator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sky" },
        imageUrl: "https://images.unsplash.com/photo-1519864239-688a29a2862b?auto=format&fit=crop&q=80&w=400", // Stock dark woods/sky placeholder
        story: "Three silent orbs forming a triangle formation. Hovered for 20 minutes before shooting straight up.",
    },
    {
        id: "ENC_003",
        title: "EVP recording in basement",
        location: "Abandoned Asylum",
        type: "Ghost",
        votes: 532,
        date: "1d ago",
        user: { name: "EchoEars", rank: "Witness", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Echo" },
        imageUrl: "https://images.unsplash.com/photo-1542159837-29dcb0f90cba?auto=format&fit=crop&q=80&w=400", // Dark stairwell placeholder
        story: "Audio strictly. When I asked 'who's there', you can clearly hear a rasping voice say 'Get out'.",
    }
];

// --- Render Feed ---
const feedList = document.getElementById('feed-list');

function renderFeed() {
    feedList.innerHTML = '';
    encountersData.forEach(enc => {
        const card = document.createElement('div');
        card.className = 'encounter-card';
        card.innerHTML = `
            <div class="card-header">
                <img src="${enc.user.avatar}" alt="user" class="avatar">
                <div class="user-info">
                    <h4>${enc.user.name} • <span class="text-xs text-gold">${enc.user.rank}</span></h4>
                    <p>${enc.location} • ${enc.date}</p>
                </div>
            </div>
            <img src="${enc.imageUrl}" alt="Encounter Image" class="encounter-image">
            <h3 class="mt-2 text-md">${enc.title}</h3>
            <p class="story-text mt-2">${enc.story}</p>
            <div class="card-footer">
                <span class="tag"><i data-lucide="tag" style="width:12px; height:12px;"></i> ${enc.type}</span>
                <div style="display:flex; gap: 15px;">
                    <button class="action-btn"><i data-lucide="message-square" style="width:16px; height:16px;"></i> 12</button>
                    <button class="action-btn"><i data-lucide="triangle" style="width:16px; height:16px; transform: rotate(180deg)"></i> ${enc.votes}</button>
                </div>
            </div>
        `;
        feedList.appendChild(card);
    });
    // Re-init newly added icons
    lucide.createIcons();
}

// Initial render
renderFeed();

// --- Media Vault Logic ---
const mediaGrid = document.getElementById('media-grid');
const feedListEl = document.getElementById('feed-list'); // Renamed variable locally, wait, I shouldn't rename globals.
const feedTabs = document.querySelectorAll('.feed-tab');

function renderMediaGrid() {
    mediaGrid.innerHTML = '';
    
    // Create an array of mock media elements based on encounters
    const mediaItems = [
        { url: 'assets/encounter.png', type: 'video', views: '1.2k' },
        { url: 'https://images.unsplash.com/photo-1519864239-688a29a2862b?auto=format&fit=crop&q=80&w=400', type: 'image', views: '842' },
        { url: 'https://images.unsplash.com/photo-1542159837-29dcb0f90cba?auto=format&fit=crop&q=80&w=400', type: 'image', views: '532' },
        { url: 'assets/bg.png', type: 'video', views: '3k' },
        { url: 'assets/map.png', type: 'image', views: '120' },
        { url: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&q=80&w=400', type: 'image', views: '9k' } // dark woods
    ];
    
    mediaItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'media-item';
        const icon = item.type === 'video' ? '<i data-lucide="video" style="width:14px;height:14px"></i>' : '<i data-lucide="image" style="width:14px;height:14px"></i>';
        
        div.innerHTML = `
            <img src="${item.url}" class="media-thumbnail">
            <div class="media-overlay">
                <span class="icon">${icon} ${item.views}</span>
            </div>
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
        } else {
            feedList.classList.add('hidden');
            mediaGrid.classList.remove('hidden');
            renderMediaGrid();
        }
    });
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

let mapRendered = false;

function renderMapPins() {
    if(mapRendered) return;
    
    hauntedLocationsData.forEach(loc => {
        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.style.left = `${loc.x}%`;
        pin.style.top = `${loc.y}%`;
        
        pin.addEventListener('click', () => {
            panelTitle.textContent = loc.name;
            panelStory.textContent = loc.story;
            panelRisk.classList.remove('hidden');
            panelRisk.innerHTML = `Risk: <span class="risk-level" style="color:var(--danger-red)">${loc.risk}</span>`;
            
            // Add slight flash effect to panel
            const panel = document.getElementById('map-info-panel');
            panel.style.background = 'rgba(255, 42, 42, 0.1)';
            setTimeout(() => { panel.style.background = 'var(--glass-bg)'; }, 300);
        });
        
        mapPinsContainer.appendChild(pin);
    });
    mapRendered = true;
}

// --- Upload Form Handler ---
const form = document.getElementById('encounter-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = "Uploading Evidence...";
    btn.style.opacity = '0.7';
    
    // Simulate upload
    setTimeout(() => {
        btn.textContent = "Submitted Successfully!";
        btn.style.background = "var(--primary-glow)";
        form.reset();
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "";
            btn.style.opacity = '1';
            // Switch to home view to see new post (simulated)
            document.querySelector('[data-target="view-home"]').click();
        }, 1500);
    }, 2000);
});

// Premium button alert
document.getElementById('btn-premium').addEventListener('click', () => {
    alert("Unlock NightWhispers+ for $3.99/mo to access advanced radar and exclusive paranormal hotspots.");
});

// --- Friends & Live Chat Logic ---
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
const messageHistory = {}; // Store mock history per friend ID

function renderFriends() {
    friendsListEl.innerHTML = '';
    friendsData.forEach(friend => {
        const fDiv = document.createElement('div');
        fDiv.className = 'friend-item';
        fDiv.innerHTML = `
            <div class="friend-avatar-wrapper">
                <img src="${friend.avatar}" class="avatar" alt="${friend.name}">
                ${friend.isOnline ? '<div class="online-badge dot-green"></div>' : '<div class="online-badge" style="background:#444;"></div>'}
            </div>
            <div class="friend-info">
                <h4>${friend.name}</h4>
                <p class="text-xs text-dim">${friend.status}</p>
            </div>
            <button class="icon-btn text-dim"><i data-lucide="message-square"></i></button>
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
    
    // Load history or initialize empty
    if(!messageHistory[friend.id]) {
        messageHistory[friend.id] = [
            { text: `Hey, did you check the coordinates from the latest drop?`, sender: 'them', time: '10:02 PM' }
        ];
    }
    
    renderMessages(friend.id);
    
    // Slide in Chat
    chatDialog.classList.remove('hidden');
    // slight delay for animation trigger
    setTimeout(() => {
        chatDialog.classList.add('active');
    }, 10);
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
    scrollToBottom();
}

function scrollToBottom() {
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

closeChatBtn.addEventListener('click', () => {
    chatDialog.classList.remove('active');
    setTimeout(() => {
        chatDialog.classList.add('hidden');
        currentActiveFriend = null;
    }, 300);
});

// Chat Send Logic
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!currentActiveFriend) return;
    const text = chatInput.value.trim();
    if(!text) return;
    
    // Add My Message
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageHistory[currentActiveFriend.id].push({ text, sender: 'mine', time: timeStr });
    chatInput.value = '';
    renderMessages(currentActiveFriend.id);
    
    // Simulated mock reply if friend is online
    if (currentActiveFriend.isOnline) {
        // Show typing indicator mentally...
        setTimeout(() => {
            const replies = [
                "I'm heading there now. Keep your radio on.",
                "Wait, did you hear that? I just caught an EVP.",
                "Stay away from Sector 4. It's not safe tonight.",
                "I see them. They're watching.",
                "Whoa... my compass is spinning wildly."
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            const timeStrNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            messageHistory[currentActiveFriend.id].push({ text: randomReply, sender: 'them', time: timeStrNow });
            // re-render if still in this chat
            if (currentActiveFriend && currentActiveFriend.id === currentActiveFriend.id) {
                renderMessages(currentActiveFriend.id);
            }
        }, 2000 + Math.random() * 2000); // 2-4 seconds delay
    }
});

// Initialize Friends on load
renderFriends();
