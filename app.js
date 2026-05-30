document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. ULTRA AKICI PARÇACIK MOTORU (Geliştirildi)
    // ==========================================
    const pContainer = document.getElementById('particles-container');
    if (pContainer) {
        for (let i = 0; i < 40; i++) { createAdvancedParticle(pContainer); }
    }

    function createAdvancedParticle(container) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        const size = Math.random() * 3 + 2; 
        p.style.width = size + "px";
        p.style.height = size + "px";
        
        let posX = Math.random() * 100; 
        let posY = Math.random() * 100; 
        p.style.left = posX + "vw";
        p.style.top = posY + "vh";
        
        const speedY = Math.random() * 0.3 + 0.15; 
        const driftX = (Math.random() - 0.5) * 0.2; 
        let opacity = Math.random() * 0.6 + 0.3;
        p.style.opacity = opacity;

        container.appendChild(p);

        function animate() {
            posY -= speedY;
            posX += driftX;
            
            // Ekrandan çıkınca döngüye sokma
            if (posY < -5) {
                posY = 105;
                posX = Math.random() * 100;
            }
            if (posX < -5) posX = 105;
            if (posX > 105) posX = -5;

            p.style.top = posY + "vh";
            p.style.left = posX + "vw";
            
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ==========================================
    // 2. GLOBAL SOHBET PENCERESİ
    // ==========================================
    const chatToggle = document.getElementById('chat-toggle-btn');
    const chatBody = document.getElementById('chat-body');
    const chevron = document.getElementById('chat-chevron');
    let isChatOpen = false;

    if (chatToggle && chatBody) {
        chatToggle.addEventListener('click', () => {
            if (!isChatOpen) {
                chatBody.style.height = '340px';
                if (chevron) chevron.className = 'fa-solid fa-chevron-down';
                isChatOpen = true;
                setTimeout(() => {
                    const cl = document.getElementById('chat-logs');
                    if (cl) cl.scrollTop = cl.scrollHeight;
                }, 100);
            } else {
                chatBody.style.height = '0';
                if (chevron) chevron.className = 'fa-solid fa-chevron-up';
                isChatOpen = false;
            }
        });
    }

    // ==========================================
    // 3. VERİ DEPOLAMA VE YÖNETİM HAVUZU
    // ==========================================
    let savedFeatures = JSON.parse(localStorage.getItem('cilek_features')) || [];
    let savedBots = JSON.parse(localStorage.getItem('cilek_bots')) || [];
    let savedUpdates = JSON.parse(localStorage.getItem('cilek_updates')) || [];
    let savedMessages = JSON.parse(localStorage.getItem('cilek_chat_msgs')) || [];
    let savedReports = JSON.parse(localStorage.getItem('cilek_admin_reports')) || [];
    let registeredUsers = JSON.parse(localStorage.getItem('cilek_users')) || [];

    let currentUser = localStorage.getItem('cilek_active_user') || null;

    function escapeHTML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;');
    }

    function handleFileSelect(fileInput, urlInputId, callback) {
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) { callback(e.target.result); };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            const urlInput = document.getElementById(urlInputId);
            callback(urlInput ? urlInput.value.trim() : '');
        }
    }

    // Özellikleri Listeleme
    function renderFeatures() {
        const container = document.getElementById('dynamic-features-container');
        if (!container) return;
        container.innerHTML = '';

        if (savedFeatures.length === 0) {
            let tipHtml = '<div class="no-data-msg"><i class="fa-solid fa-cubes"></i> Sistem özelliği eklenmedi.';
            if (currentUser === "KEREM") {
                tipHtml += ' <button class="admin-tip-btn" id="tip-feat-btn">Şimdi Ekle</button>';
            }
            tipHtml += '</div>';
            container.innerHTML = tipHtml;
            
            document.getElementById('tip-feat-btn')?.addEventListener('click', () => {
                document.getElementById('admin-feature-modal').style.display = 'flex';
            });
            return;
        }

        savedFeatures.forEach((feat, idx) => {
            const card = document.createElement('div');
            card.className = 'feature-card';
            const iconClass = escapeHTML(feat.icon) || 'fa-solid fa-star';
            const removeBtn = (currentUser === "KEREM") ? `<button class="btn-remove-item remove-feat" data-idx="${idx}"><i class="fa-solid fa-trash"></i> Kaldır</button>` : '';

            card.innerHTML = `
                ${removeBtn}
                <div class="card-icon"><i class="${iconClass}"></i></div>
                <h3>${escapeHTML(feat.title)}</h3>
                <p>${escapeHTML(feat.desc)}</p>
            `;
            
            card.querySelector('.remove-feat')?.addEventListener('click', function(e) {
                e.stopPropagation();
                savedFeatures.splice(this.getAttribute('data-idx'), 1);
                localStorage.setItem('cilek_features', JSON.stringify(savedFeatures));
                renderFeatures();
            });
            container.appendChild(card);
        });
    }

    // Botları Listeleme
    function renderBots(filterText = "") {
        const container = document.getElementById('dynamic-bots-container');
        const botCountStat = document.getElementById('stat-bot-count');
        if (!container) return;
        container.innerHTML = '';
        
        if (botCountStat) botCountStat.innerText = savedBots.length;

        const filteredBots = savedBots.filter(bot => 
            bot.name.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredBots.length === 0) {
            let tipHtml = '<div class="no-data-msg"><i class="fa-solid fa-box-open"></i> Sistemde aktif bot bulunmuyor.';
            if (currentUser === "KEREM") {
                tipHtml += ' <button class="admin-tip-btn" id="tip-bot-btn">Yeni Bot Yayınla</button>';
            }
            tipHtml += '</div>';
            container.innerHTML = tipHtml;

            document.getElementById('tip-bot-btn')?.addEventListener('click', () => {
                document.getElementById('admin-bot-modal').style.display = 'flex';
            });
            return;
        }

        filteredBots.forEach((bot, index) => {
            const firstLetter = bot.name ? bot.name.charAt(0) : 'B';
            const avatarHtml = bot.avatar 
                ? `<img src="${bot.avatar}" alt="Bot Avatar">` 
                : `<div class="bot-kare-avatar-text">${escapeHTML(firstLetter)}</div>`;
                
            const bannerStyle = bot.banner 
                ? `style="background-image: url('${bot.banner}'); background-size: cover; background-position: center;"` 
                : '';

            const removeBtn = (currentUser === "KEREM") ? `<button class="btn-remove-item remove-bot" data-idx="${index}"><i class="fa-solid fa-trash"></i> Kaldır</button>` : '';

            const isDisabled = currentUser ? '' : 'disabled';
            const placeholderText = currentUser ? 'Bug veya önerinizi iletin...' : 'Giriş yapıldığında aktifleşir...';

            const card = document.createElement('div');
            card.className = 'bot-kare-card';
            card.innerHTML = `
                ${removeBtn}
                <div class="bot-kare-banner" ${bannerStyle}>
                    <div class="bot-kare-avatar-holder">
                        ${avatarHtml}
                    </div>
                </div>
                <div class="bot-kare-body">
                    <div class="bot-kare-info">
                        <h3>${escapeHTML(bot.name)}</h3>
                        <p>${escapeHTML(bot.desc)}</p>
                    </div>
                    <a href="${bot.link}" target="_blank" class="btn-card-add-bot"><i class="fa-solid fa-circle-plus"></i> Sunucuya Ekle</a>
                    <div class="bot-kare-feedback">
                        <div class="fb-input-wrapper">
                            <input type="text" id="fb-input-${index}" placeholder="${placeholderText}" ${isDisabled}>
                            <button class="btn-send-glow send-fb-btn" data-index="${index}" data-name="${escapeHTML(bot.name)}" ${isDisabled}><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            `;
            
            card.querySelector('.bot-kare-banner').addEventListener('click', () => { window.open(bot.link, '_blank'); });
            
            // Eğer giriş yapılmadıysa inputa basınca Giriş yapma modalını aç (Geliştirme)
            if(!currentUser) {
                card.querySelector(`#fb-input-${index}`).addEventListener('click', () => {
                    document.getElementById('auth-modal').style.display = 'flex';
                });
            }

            card.querySelector('.remove-bot')?.addEventListener('click', function(e) {
                e.stopPropagation();
                savedBots.splice(this.getAttribute('data-idx'), 1);
                localStorage.setItem('cilek_bots', JSON.stringify(savedBots));
                renderBots();
            });

            card.querySelector('.send-fb-btn').addEventListener('click', function() {
                const idx = this.getAttribute('data-index');
                const bName = this.getAttribute('data-name');
                sendBotFeedback(idx, bName);
            });

            container.appendChild(card);
        });
    }

    const searchInput = document.getElementById('bot-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderBots(e.target.value.trim());
        });
    }

    // Güncellemeleri Listeleme
    function renderUpdates() {
        const container = document.getElementById('updates-live-container');
        if (!container) return;
        container.innerHTML = '';

        if (savedUpdates.length === 0) {
            container.innerHTML = '<div class="no-data-msg"><i class="fa-solid fa-scroll"></i> Herhangi bir güncelleme notu girilmemiş.</div>';
            return;
        }

        [...savedUpdates].reverse().forEach((up, realIdx) => {
            const upBox = document.createElement('div');
            upBox.className = 'update-box';
            const lines = up.details.split('\n').filter(l => l.trim() !== '').map(line => `<li>${escapeHTML(line)}</li>`).join('');
            const removeBtn = (currentUser === "KEREM") ? `<button class="btn-remove-item remove-up" data-idx="${savedUpdates.length - 1 - realIdx}"><i class="fa-solid fa-trash"></i> Sil</button>` : '';

            upBox.innerHTML = `
                ${removeBtn}
                <div class="update-header">
                    <span class="version">${escapeHTML(up.version)}</span>
                    <span class="date">${escapeHTML(up.date)}</span>
                </div>
                <h3>${escapeHTML(up.title)}</h3>
                <ul>${lines}</ul>
            `;
            
            upBox.querySelector('.remove-up')?.addEventListener('click', function() {
                savedUpdates.splice(this.getAttribute('data-idx'), 1);
                localStorage.setItem('cilek_updates', JSON.stringify(savedUpdates));
                renderUpdates();
            });
            container.appendChild(upBox);
        });
    }

    // Admin Raporları
    function renderAdminReports() {
        const wrapper = document.getElementById('admin-reports-wrapper');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        if (savedReports.length === 0) {
            wrapper.innerHTML = '<div class="no-data-msg"><i class="fa-solid fa-envelope-circle-check"></i> Havuz temiz! Bildirilen sorun yok.</div>';
            return;
        }

        savedReports.forEach((rep, id) => {
            const div = document.createElement('div');
            div.className = 'report-item-card';
            div.innerHTML = `
                <div class="report-meta">
                    <span><i class="fa-solid fa-user"></i> Gönderen: ${escapeHTML(rep.user)}</span>
                    <span class="bot-tag">🤖 Hedef: ${escapeHTML(rep.botName)}</span>
                </div>
                <p class="report-text">${escapeHTML(rep.text)}</p>
                <button class="btn-delete-report-single del-rep-btn" data-id="${id}" title="Raporu Sil"><i class="fa-solid fa-trash"></i></button>
            `;
            
            div.querySelector('.del-rep-btn').addEventListener('click', function() {
                savedReports.splice(this.getAttribute('data-id'), 1);
                localStorage.setItem('cilek_admin_reports', JSON.stringify(savedReports));
                renderAdminReports();
            });
            wrapper.appendChild(div);
        });
    }

    // Global Sohbet Odası
    function renderChatMessages() {
        const chatLogs = document.getElementById('chat-logs');
        if (!chatLogs) return;
        chatLogs.innerHTML = '';

        savedMessages.forEach((msg, idx) => {
            const row = document.createElement('div');
            row.className = 'user-msg-row';
            const isMyMsg = (currentUser && msg.author === currentUser);
            const deleteBtnHtml = isMyMsg ? `<button class="btn-msg-delete del-chat-msg" data-idx="${idx}">&times;</button>` : '';
            const authorStyle = msg.author === 'KEREM' ? 'color:#ff4d6d; font-weight:800;' : '';

            row.innerHTML = `
                <div class="msg-header-info">
                    <span class="msg-author" style="${authorStyle}">${escapeHTML(msg.author)}</span>
                    <span class="msg-time">${escapeHTML(msg.time)}</span>
                </div>
                <p class="msg-text-content">${escapeHTML(msg.text)}</p>
                ${deleteBtnHtml}
            `;
            
            row.querySelector('.del-chat-msg')?.addEventListener('click', function() {
                savedMessages.splice(this.getAttribute('data-idx'), 1);
                localStorage.setItem('cilek_chat_msgs', JSON.stringify(savedMessages));
                renderChatMessages();
            });
            chatLogs.appendChild(row);
        });
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }

    // ==========================================
    // 4. OTURUM DURUM KONTROL MOTORU (Hatalar Giderildi)
    // ==========================================
    const authTrigger = document.getElementById('auth-trigger-btn');
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('auth-close');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const logoutBtn = document.getElementById('logout-btn');
    
    const addFeatureTrigger = document.getElementById('admin-add-feature-trigger');
    const addBotTrigger = document.getElementById('admin-add-bot-trigger');
    const addUpdateTrigger = document.getElementById('admin-add-update-trigger');
    const reportsTrigger = document.getElementById('admin-reports-trigger');
    
    const featureModal = document.getElementById('admin-feature-modal');
    const botModal = document.getElementById('admin-bot-modal');
    const updateModal = document.getElementById('admin-update-modal');
    const reportsModal = document.getElementById('admin-reports-modal');

    // Giriş yap butonu tıklama olayı düzeltildi
    if (authTrigger && authModal) {
        authTrigger.addEventListener('click', () => {
            authModal.style.display = 'flex';
        });
    }
    if (authClose && authModal) {
        authClose.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active'); tabRegister.classList.remove('active');
            formLogin.style.display = 'flex'; formRegister.style.display = 'none';
        });
        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active'); tabLogin.classList.remove('active');
            formRegister.style.display = 'flex'; formLogin.style.display = 'none';
        });
    }

    function checkLoginStatusForElements() {
        const userBadge = document.getElementById('user-badge');
        const userTag = document.getElementById('user-tag');
        const userIcon = document.getElementById('user-badge-icon');
        const chatInput = document.getElementById('widget-input');
        const chatSend = document.getElementById('widget-send');

        // Önce tüm admin butonlarını gizle
        if (addFeatureTrigger) addFeatureTrigger.style.display = 'none';
        if (addBotTrigger) addBotTrigger.style.display = 'none';
        if (addUpdateTrigger) addUpdateTrigger.style.display = 'none';
        if (reportsTrigger) reportsTrigger.style.display = 'none';

        if (currentUser) {
            if (authTrigger) authTrigger.style.display = 'none';
            if (userBadge && userTag) {
                userTag.innerText = currentUser;
                userIcon.innerText = currentUser === "KEREM" ? "👑" : "👤";
                userBadge.style.display = 'flex';
            }
            if (chatInput && chatSend) {
                chatInput.removeAttribute('disabled');
                chatInput.placeholder = 'Mesajınızı yazın...';
                chatSend.removeAttribute('disabled');
            }
            if (currentUser === "KEREM") {
                if (addFeatureTrigger) addFeatureTrigger.style.display = 'flex';
                if (addBotTrigger) addBotTrigger.style.display = 'flex';
                if (addUpdateTrigger) addUpdateTrigger.style.display = 'flex';
                if (reportsTrigger) reportsTrigger.style.display = 'inline-flex';
            }
        } else {
            if (authTrigger) authTrigger.style.display = 'block';
            if (userBadge) userBadge.style.display = 'none';
            if (chatInput && chatSend) {
                chatInput.setAttribute('disabled', 'true');
                chatInput.placeholder = 'Sohbete katılmak için giriş yapın...';
                chatSend.setAttribute('disabled', 'true');
            }
        }
    }

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const uName = document.getElementById('login-username').value.trim();
            const uPass = document.getElementById('login-password').value;

            if (uName === "KEREM" && uPass === "1234QWER0987") {
                currentUser = "KEREM";
            } else {
                const userExists = registeredUsers.find(u => u.username === uName && u.password === uPass);
                if (userExists) {
                    currentUser = uName;
                } else if (registeredUsers.some(u => u.username === uName)) {
                    alert("Hatalı şifre girdiniz.");
                    return;
                } else {
                    currentUser = uName; // Otomatik kayıt mantığı
                }
            }
            
            localStorage.setItem('cilek_active_user', currentUser);
            authModal.style.display = 'none';
            checkLoginStatusForElements();
            renderFeatures();
            renderBots();
            renderUpdates();
            renderChatMessages();
        });
    }

    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const uName = document.getElementById('reg-username').value.trim();
            const uPass = document.getElementById('reg-password').value;
            const uPassConfirm = document.getElementById('reg-password-confirm').value;

            if (uName === "KEREM") {
                alert("Bu kullanıcı adı rezerve edilmiştir.");
                return;
            }
            if (uPass !== uPassConfirm) {
                alert("Şifreler uyuşmuyor!");
                return;
            }
            if (registeredUsers.some(u => u.username === uName)) {
                alert("Bu kullanıcı adı zaten alınmış.");
                return;
            }

            registeredUsers.push({ username: uName, password: uPass });
            localStorage.setItem('cilek_users', JSON.stringify(registeredUsers));
            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
            tabLogin.click();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('cilek_active_user');
            currentUser = null;
            checkLoginStatusForElements();
            renderFeatures();
            renderBots();
            renderUpdates();
            renderChatMessages();
        });
    }

    // ==========================================
    // 5. YAN MODAL FORMLARI VE AKSİYONLARI
    // ==========================================
    if (addFeatureTrigger && featureModal) {
        addFeatureTrigger.addEventListener('click', () => featureModal.style.display = 'flex');
        document.getElementById('admin-feature-close')?.addEventListener('click', () => featureModal.style.display = 'none');
    }
    if (addBotTrigger && botModal) {
        addBotTrigger.addEventListener('click', () => botModal.style.display = 'flex');
        document.getElementById('admin-bot-close')?.addEventListener('click', () => botModal.style.display = 'none');
    }
    if (addUpdateTrigger && updateModal) {
        addUpdateTrigger.addEventListener('click', () => updateModal.style.display = 'flex');
        document.getElementById('admin-update-close')?.addEventListener('click', () => updateModal.style.display = 'none');
    }
    if (reportsTrigger && reportsModal) {
        reportsTrigger.addEventListener('click', () => { renderAdminReports(); reportsModal.style.display = 'flex'; });
        document.getElementById('admin-reports-close')?.addEventListener('click', () => reportsModal.style.display = 'none');
    }

    document.getElementById('btn-save-feature')?.addEventListener('click', () => {
        const fIcon = document.getElementById('adm-feat-icon').value.trim();
        const fTitle = document.getElementById('adm-feat-title').value.trim();
        const fDesc = document.getElementById('adm-feat-desc').value.trim();

        if (!fTitle || !fDesc) return;
        savedFeatures.push({ icon: fIcon, title: fTitle, desc: fDesc });
        localStorage.setItem('cilek_features', JSON.stringify(savedFeatures));
        featureModal.style.display = 'none';
        renderFeatures();
    });

    document.getElementById('btn-save-bot')?.addEventListener('click', () => {
        const bName = document.getElementById('adm-bot-name').value.trim();
        const bLink = document.getElementById('adm-bot-link').value.trim();
        const bDesc = document.getElementById('adm-bot-desc').value.trim();
        const avatarFile = document.getElementById('adm-bot-avatar-file');
        const bannerFile = document.getElementById('adm-bot-banner-file');

        if (!bName || !bDesc) return;

        handleFileSelect(avatarFile, 'adm-bot-avatar-url', (avatarData) => {
            handleFileSelect(bannerFile, 'adm-bot-banner-url', (bannerData) => {
                savedBots.push({ name: bName, desc: bDesc, link: bLink, avatar: avatarData, banner: bannerData });
                localStorage.setItem('cilek_bots', JSON.stringify(savedBots));
                botModal.style.display = 'none';
                renderBots();
            });
        });
    });

    document.getElementById('btn-save-update')?.addEventListener('click', () => {
        const uVer = document.getElementById('adm-update-version').value.trim();
        const uTitle = document.getElementById('adm-update-title').value.trim();
        const uDet = document.getElementById('adm-update-details').value.trim();

        if (!uVer || !uTitle || !uDet) return;
        const now = new Date();
        const dateStr = now.getDate() + " Mayıs 2026";

        savedUpdates.push({ version: uVer, title: uTitle, details: uDet, date: dateStr });
        localStorage.setItem('cilek_updates', JSON.stringify(savedUpdates));
        updateModal.style.display = 'none';
        renderUpdates();
    });

    document.getElementById('btn-clear-all-reports')?.addEventListener('click', () => {
        if (confirm("Tüm havuzu temizlemek istediğinize emin misiniz?")) {
            savedReports = [];
            localStorage.setItem('cilek_admin_reports', JSON.stringify(savedReports));
            renderAdminReports();
        }
    });

    function sendBotFeedback(index, botName) {
        const inp = document.getElementById(`fb-input-${index}`);
        if (!inp || inp.value.trim() === '') return;

        const newReport = {
            user: currentUser || "Anonim",
            botName: botName,
            text: inp.value.trim()
        };

        savedReports.push(newReport);
        localStorage.setItem('cilek_admin_reports', JSON.stringify(savedReports));
        alert("Rapor başarıyla admin havuzuna iletildi!");
        inp.value = '';
    }

    // Global Sohbet Mesaj Gönderme
    const widgetInput = document.getElementById('widget-input');
    const widgetSend = document.getElementById('widget-send');

    if (widgetSend && widgetInput) {
        const sendMsg = () => {
            if (widgetInput.value.trim() === '') return;
            const now = new Date();
            const timeStr = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');
            savedMessages.push({ author: currentUser || "Misafir", time: timeStr, text: widgetInput.value.trim() });
            localStorage.setItem('cilek_chat_msgs', JSON.stringify(savedMessages));
            widgetInput.value = '';
            renderChatMessages();
        };
        widgetSend.addEventListener('click', sendMsg);
        widgetInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });
    }

    // İlk Kurulum Başlatıcıları
    renderFeatures();
    renderBots();
    renderUpdates();
    renderChatMessages();
    checkLoginStatusForElements();
});