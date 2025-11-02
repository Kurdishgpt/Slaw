const mockUsers = [
    { id: '1', username: 'AlexCoder', points: 245, lastPointEarned: Date.now() - 3600000, dailyLinksPosted: 10, dailyLinkResetTime: Date.now() + 82800000 },
    { id: '2', username: 'SarahDev', points: 198, lastPointEarned: Date.now() - 7200000, dailyLinksPosted: 10, dailyLinkResetTime: Date.now() + 75600000 },
    { id: '3', username: 'MikeTech', points: 176, lastPointEarned: Date.now() - 10800000, dailyLinksPosted: 7, dailyLinkResetTime: Date.now() + 68400000 },
    { id: '4', username: 'JennyPro', points: 154, lastPointEarned: Date.now() - 14400000, dailyLinksPosted: 5, dailyLinkResetTime: Date.now() + 61200000 },
    { id: '5', username: 'ChrisWeb', points: 132, lastPointEarned: Date.now() - 18000000, dailyLinksPosted: 10, dailyLinkResetTime: Date.now() + 54000000 },
    { id: '6', username: 'EmilyCode', points: 98, lastPointEarned: Date.now() - 86400000, dailyLinksPosted: 3, dailyLinkResetTime: Date.now() + 3600000 },
    { id: '7', username: 'DaveScript', points: 87, lastPointEarned: Date.now() - 172800000, dailyLinksPosted: 8, dailyLinkResetTime: Date.now() + 7200000 },
    { id: '8', username: 'LisaApp', points: 76, lastPointEarned: Date.now() - 259200000, dailyLinksPosted: 2, dailyLinkResetTime: Date.now() + 10800000 },
    { id: '9', username: 'TomBuild', points: 65, lastPointEarned: Date.now() - 345600000, dailyLinksPosted: 0, dailyLinkResetTime: Date.now() + 14400000 },
    { id: '10', username: 'AnnaStack', points: 54, lastPointEarned: Date.now() - 432000000, dailyLinksPosted: 1, dailyLinkResetTime: Date.now() + 18000000 },
];

const mockActivities = [
    { userId: '1', username: 'AlexCoder', link: 'pastebin.com/abc123', pointsEarned: 1, timestamp: Date.now() - 3600000, type: 'paste', serverId: '1284606042780729426' },
    { userId: '2', username: 'SarahDev', link: 'discord.gg/example', pointsEarned: 1, timestamp: Date.now() - 7200000, type: 'invite', serverId: '380717426414977026' },
    { userId: '3', username: 'MikeTech', link: 'Voice in Server 1284606042780729426', pointsEarned: 1, timestamp: Date.now() - 10800000, type: 'voice', serverId: '1284606042780729426' },
    { userId: '1', username: 'AlexCoder', link: 'paste.ee/xyz789', pointsEarned: 1, timestamp: Date.now() - 14400000, type: 'paste', serverId: '380717426414977026' },
    { userId: '4', username: 'JennyPro', link: 'Voice in Server 380717426414977026', pointsEarned: 1, timestamp: Date.now() - 18000000, type: 'voice', serverId: '380717426414977026' },
    { userId: '5', username: 'ChrisWeb', link: 'discord.gg/server', pointsEarned: 1, timestamp: Date.now() - 21600000, type: 'invite', serverId: '1284606042780729426' },
    { userId: '2', username: 'SarahDev', link: 'Voice in Server 1284606042780729426', pointsEarned: 1, timestamp: Date.now() - 25200000, type: 'voice', serverId: '1284606042780729426' },
    { userId: '6', username: 'EmilyCode', link: 'pastebin.com/code123', pointsEarned: 1, timestamp: Date.now() - 28800000, type: 'paste', serverId: '380717426414977026' },
    { userId: '7', username: 'DaveScript', link: 'Voice in Server 380717426414977026', pointsEarned: 1, timestamp: Date.now() - 32400000, type: 'voice', serverId: '380717426414977026' },
    { userId: '3', username: 'MikeTech', link: 'hastebin.com/test789', pointsEarned: 1, timestamp: Date.now() - 36000000, type: 'paste', serverId: '1284606042780729426' },
    { userId: '8', username: 'LisaApp', link: 'Voice in Server 380717426414977026', pointsEarned: 1, timestamp: Date.now() - 39600000, type: 'voice', serverId: '380717426414977026' },
    { userId: '9', username: 'TomBuild', link: 'rentry.co/demo456', pointsEarned: 1, timestamp: Date.now() - 43200000, type: 'paste', serverId: '380717426414977026' },
];

let apiKeys = [
    { id: '1', key: 'sk_live_1234567890abcdefghijklmnopqrstuvwxyz1234567890', createdAt: Date.now() - 86400000 * 7 }
];

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function getCooldownStatus(lastPointEarned, dailyLinksPosted) {
    // Only show cooldown if user has posted 10 links
    if (dailyLinksPosted < 10) {
        return { active: true, remainingHours: 0 };
    }
    
    if (!lastPointEarned) return { active: true, remainingHours: 0 };
    const hoursSince = (Date.now() - lastPointEarned) / (1000 * 60 * 60);
    const active = hoursSince >= 14;
    const remainingHours = active ? 0 : Math.ceil(14 - hoursSince);
    return { active, remainingHours };
}

function getDailyLinkStatus(dailyLinksPosted, dailyLinkResetTime) {
    if (dailyLinksPosted >= 10) {
        const timeRemaining = dailyLinkResetTime - Date.now();
        const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
        return {
            atLimit: true,
            linksRemaining: 0,
            hoursUntilReset: hoursRemaining > 0 ? hoursRemaining : 0
        };
    }
    return {
        atLimit: false,
        linksRemaining: 10 - dailyLinksPosted,
        hoursUntilReset: 0
    };
}

function getInitials(username) {
    return username.charAt(0).toUpperCase();
}

function getRandomColor(username) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
}

function renderDashboard() {
    const totalUsers = mockUsers.length;
    const totalPoints = mockUsers.reduce((sum, user) => sum + user.points, 0);
    const activeUsers = mockUsers.filter(user => {
        const hoursSince = (Date.now() - user.lastPointEarned) / (1000 * 60 * 60);
        return hoursSince < 24;
    }).length;
    const linksPosted = mockActivities.filter(a => a.link !== 'Voice Channel').length;

    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-points').textContent = totalPoints.toLocaleString();
    document.getElementById('active-users').textContent = activeUsers;
    document.getElementById('links-posted').textContent = linksPosted;

    const topUsersHtml = mockUsers.slice(0, 5).map(user => {
        const dailyLinkStatus = getDailyLinkStatus(user.dailyLinksPosted, user.dailyLinkResetTime);
        return `
            <div class="user-item">
                <div class="user-avatar" style="background: ${getRandomColor(user.username)}">
                    ${getInitials(user.username)}
                </div>
                <div class="user-info">
                    <div class="user-name">${user.username}</div>
                    <div class="user-points">${user.points} points • ${user.dailyLinksPosted}/10 links today</div>
                    ${dailyLinkStatus.atLimit 
                        ? `<div class="user-status"><span class="badge badge-danger">Daily limit reached - Reset in ${dailyLinkStatus.hoursUntilReset}h</span></div>`
                        : ''
                    }
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('top-users').innerHTML = topUsersHtml;

    const recentActivityHtml = mockActivities.slice(0, 8).map(activity => {
        let activityIcon = '🔗';
        if (activity.type === 'voice') activityIcon = '🎤';
        else if (activity.type === 'invite') activityIcon = '📨';
        else if (activity.type === 'paste') activityIcon = '📋';
        
        return `
            <div class="activity-item">
                <div class="user-avatar" style="background: ${getRandomColor(activity.username)}">
                    ${getInitials(activity.username)}
                </div>
                <div class="activity-info">
                    <div class="activity-user">${activity.username}</div>
                    <div class="activity-details">${activityIcon} +${activity.pointsEarned} point • ${activity.link}</div>
                </div>
                <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
            </div>
        `;
    }).join('');
    document.getElementById('recent-activity').innerHTML = recentActivityHtml;
}

function renderLeaderboard() {
    const leaderboardHtml = mockUsers.map((user, index) => {
        const rank = index + 1;
        const cooldown = getCooldownStatus(user.lastPointEarned, user.dailyLinksPosted);
        const dailyLinkStatus = getDailyLinkStatus(user.dailyLinksPosted, user.dailyLinkResetTime);
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        
        return `
            <div class="leaderboard-item">
                <div class="rank ${rankClass}">#${rank}</div>
                <div class="leaderboard-avatar" style="background: ${getRandomColor(user.username)}">
                    ${getInitials(user.username)}
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${user.username}</div>
                    <div class="leaderboard-stats">
                        <span>Last active: ${formatTimeAgo(user.lastPointEarned)}</span>
                        ${!cooldown.active 
                            ? `<span class="badge badge-warning">Cooldown: ${cooldown.remainingHours}h</span>`
                            : dailyLinkStatus.atLimit 
                                ? `<span class="badge badge-danger">10 Links Posted - Reset in ${dailyLinkStatus.hoursUntilReset}h</span>`
                                : `<span class="badge badge-info">${dailyLinkStatus.linksRemaining}/10 links left</span>`
                        }
                    </div>
                </div>
                <div class="leaderboard-points">${user.points}</div>
            </div>
        `;
    }).join('');

    document.getElementById('leaderboard-list').innerHTML = leaderboardHtml || `
        <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <p>No users yet</p>
        </div>
    `;
}

function renderApiKeys() {
    const apiKeysHtml = apiKeys.map(key => {
        const maskedKey = key.key.slice(0, 12) + '•'.repeat(32) + key.key.slice(-8);
        const date = new Date(key.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return `
            <div class="api-key-item" data-key-id="${key.id}">
                <div class="api-key-info">
                    <div class="api-key-value">${maskedKey}</div>
                    <div class="api-key-meta">Created on ${date}</div>
                </div>
                <div class="api-key-actions">
                    <button class="btn btn-secondary btn-copy" onclick="copyApiKey('${key.key}')">
                        Copy
                    </button>
                    <button class="btn btn-secondary" onclick="toggleKeyVisibility('${key.id}', '${key.key}')">
                        Show
                    </button>
                    <button class="btn btn-danger" onclick="revokeApiKey('${key.id}')">
                        Revoke
                    </button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('api-keys-list').innerHTML = apiKeysHtml || `
        <div class="empty-state">
            <div class="empty-state-icon">🔑</div>
            <p>No API keys yet. Generate one to get started.</p>
        </div>
    `;
}

function generateApiKey() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk_live_';
    for (let i = 0; i < 48; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const newKey = {
        id: Date.now().toString(),
        key: key,
        createdAt: Date.now()
    };
    
    apiKeys.push(newKey);
    renderApiKeys();
    showNotification('API Key Generated', 'Your new API key has been created successfully.');
}

function copyApiKey(key) {
    navigator.clipboard.writeText(key).then(() => {
        showNotification('Copied!', 'API key copied to clipboard.');
    }).catch(() => {
        showNotification('Error', 'Failed to copy API key.', 'error');
    });
}

function toggleKeyVisibility(keyId, fullKey) {
    const keyItem = document.querySelector(`[data-key-id="${keyId}"]`);
    const keyValueEl = keyItem.querySelector('.api-key-value');
    const btn = keyItem.querySelector('.api-key-actions button:nth-child(2)');
    
    if (btn.textContent === 'Show') {
        keyValueEl.textContent = fullKey;
        btn.textContent = 'Hide';
    } else {
        const maskedKey = fullKey.slice(0, 12) + '•'.repeat(32) + fullKey.slice(-8);
        keyValueEl.textContent = maskedKey;
        btn.textContent = 'Show';
    }
}

function revokeApiKey(keyId) {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
        apiKeys = apiKeys.filter(key => key.id !== keyId);
        renderApiKeys();
        showNotification('API Key Revoked', 'The API key has been deleted successfully.');
    }
}

function showNotification(title, message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--danger)' : 'var(--success)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 1000;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 0.25rem;">${title}</div>
        <div style="font-size: 0.875rem;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function renderActivityChart() {
    // Server 1: 1284606042780729426
    const ctx1 = document.getElementById('activity-chart-1');
    if (ctx1) {
        const server1Activities = mockActivities.filter(a => a.serverId === '1284606042780729426');
        const paste1 = server1Activities.filter(a => a.type === 'paste').length;
        const invite1 = server1Activities.filter(a => a.type === 'invite').length;
        const voice1 = server1Activities.filter(a => a.type === 'voice').length;
        
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Paste Links', 'Server Invites', 'Voice Activity'],
                datasets: [{
                    label: 'Activity Count',
                    data: [paste1, invite1, voice1],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(16, 185, 129, 0.6)',
                        'rgba(245, 158, 11, 0.6)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
    
    // Server 2: 380717426414977026
    const ctx2 = document.getElementById('activity-chart-2');
    if (ctx2) {
        const server2Activities = mockActivities.filter(a => a.serverId === '380717426414977026');
        const paste2 = server2Activities.filter(a => a.type === 'paste').length;
        const invite2 = server2Activities.filter(a => a.type === 'invite').length;
        const voice2 = server2Activities.filter(a => a.type === 'voice').length;
        
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Paste Links', 'Server Invites', 'Voice Activity'],
                datasets: [{
                    label: 'Activity Count',
                    data: [paste2, invite2, voice2],
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.6)',
                        'rgba(236, 72, 153, 0.6)',
                        'rgba(234, 179, 8, 0.6)'
                    ],
                    borderColor: [
                        'rgba(139, 92, 246, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(234, 179, 8, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTabs();
    renderDashboard();
    renderLeaderboard();
    renderApiKeys();
    renderActivityChart();
    
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('generate-key-btn').addEventListener('click', generateApiKey);
    
    setInterval(() => {
        if (document.querySelector('.tab-content.active').id === 'dashboard-tab') {
            document.querySelectorAll('.activity-time').forEach((el, index) => {
                el.textContent = formatTimeAgo(mockActivities[index].timestamp);
            });
        }
    }, 10000);
});
