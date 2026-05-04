// --- START OF FILE engine.js ---
import { clubData } from './data.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- HOME PAGE GENERATION ---
    const homeHero = document.getElementById('home-hero-inject');
    if (homeHero) {
        let statsHtml = clubData.home.hero.stats.map(s => `
            <div class="hero__stat">
                <span class="hero__stat-value u-tabular-nums ${s.color}">${s.value}</span>
                <span class="hero__stat-label">${s.label}</span>
            </div>
        `).join('');

        homeHero.innerHTML = `
            <span class="hero__overline">${clubData.home.hero.overline}</span>
            <h1 class="hero__headline">${clubData.home.hero.headline}</h1>
            <p class="hero__sub text-lg">${clubData.home.hero.subheadline}</p>
            <div class="hero__meta">
                ${statsHtml}
                <a href="#register" class="btn btn--primary u-ml-auto">Initialize Registration</a>
            </div>
        `;
    }

    const homeConstraints = document.getElementById('home-constraints-inject');
    if (homeConstraints) {
        homeConstraints.innerHTML = clubData.home.constraints.map(c => `
            <div class="panel readout">
                <span class="label label--${c.color}">${c.id}: ${c.title}</span>
                <p class="text-sm mt-2 text-secondary">${c.desc}</p>
            </div>
        `).join('');
    }

    const homePhilosophy = document.getElementById('home-philosophy-inject');
    if (homePhilosophy) {
        homePhilosophy.innerHTML = clubData.home.philosophy.map(p => `
            <div class="panel readout">
                <span class="label label--${p.color}">${p.title}</span>
                <p class="text-sm mt-2 text-secondary">${p.desc}</p>
            </div>
        `).join('');
    }

    const homeTelemetry = document.getElementById('home-telemetry-inject');
    if (homeTelemetry) {
        homeTelemetry.innerHTML = clubData.home.telemetry.map(t => `
            <div class="telemetry-line"><span class="telemetry-line__key">${t.key}</span><span class="telemetry-line__value">${t.val}</span></div>
        `).join('');
    }


    // --- MEMBERS PAGE GENERATION ---
    const opsContainer = document.getElementById('operators-grid');
    if (opsContainer) {
        opsContainer.innerHTML = clubData.operators.map((op, i) => `
            <div class="card operator-card">
                <div class="operator-card__header">
                    <span class="badge badge--data"><span class="badge__dot"></span>OP_${String(i + 1).padStart(2, '0')}</span>
                    <div class="operator-barcode"></div>
                </div>
                <div class="operator-profile">
                    <div class="operator-avatar"></div>
                    <div class="operator-info">
                        <h3 class="display-sm text-primary">${op.name}</h3>
                        <p class="text-xs text-secondary mono mt-1">// ${op.role}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const crewContainer = document.getElementById('crew-grid');
    if (crewContainer) {
        crewContainer.innerHTML = clubData.crew.map(member => `
            <div class="crew-item">
                <div class="crew-status"></div>
                <span class="mono text-sm text-primary">${member}</span>
            </div>
        `).join('');
    }

    // --- SESSIONS TIMELINE (List View) ---
    const sessionsContainer = document.getElementById('sessions-timeline');
    if (sessionsContainer) {
        sessionsContainer.innerHTML = clubData.sessions.map((s) => {
            let badgeClass = s.status === "COMPLETED" ? "badge--survived" : (s.status === "ACTIVE" ? "badge--data" : "badge--pending");
            // Determine if the node should pulse
            let nodeClass = s.status === "ACTIVE" ? "mission-log__node--pulse" : "";

            return `
            <div class="mission-log">
                <div class="mission-log__node ${nodeClass}"></div>
                <!-- Wrap the card in a hyperlink passing the ID -->
                <a href="session-detail.html?id=${s.id}" class="card mission-card mission-card--interactive u-block" style="text-decoration:none;">
                    <div class="u-flex u-justify-between u-items-start mb-4">
                        <span class="badge ${badgeClass}"><span class="badge__dot"></span>SESSION_${s.id} // ${s.status}</span>
                        <span class="mono text-xs text-tertiary">${s.date}</span>
                    </div>
                    <h2 class="display-md text-primary mb-2">${s.title}</h2>
                    <div class="inset mt-4">
                        <span class="label label--blue mb-2 u-block">MISSION.AGENDA</span>
                        <p class="text-secondary text-sm">${s.agenda}</p>
                    </div>
                    <div class="card__action mt-4 mono text-xs text-orange u-text-right">
                        ACCESS ARCHIVE DATA_ [ENTER]
                    </div>
                </a>
            </div>`;
        }).join('');
    }

    // --- SESSION DETAIL PAGE (Single View) ---
    const detailContainer = document.getElementById('session-detail-inject');
    if (detailContainer) {
        // 1. Get the ID from the URL (e.g., ?id=01)
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        
        // 2. Find the matching session in data.js
        const session = clubData.sessions.find(s => s.id === targetId);

        if (session) {
            // 3. Build Presentation Iframe (if it exists)
            let presentationHtml = '';
            if (session.presentationUrl) {
                presentationHtml = `
                    <div class="presentation-wrapper mt-8">
                        <iframe src="${session.presentationUrl}" frameborder="0" width="100%" height="100%" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
                    </div>
                `;
            }

            // 4. Build Team Logs (Images & Videos)
            let logsHtml = session.logs.map(log => {
                let assetsHtml = log.assets.map(asset => {
                    if (asset.type === "video") {
                        // For raw local video files (e.g., assets/vid.mp4)
                        return `<div class="media-item"><video src="${asset.url}" controls muted></video></div>`;
                    } else if (asset.type === "gdrive-video") {
                        // FIX: For Google Drive preview links
                        return `
                        <div class="media-item gdrive-wrapper">
                            <iframe src="${asset.url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                        </div>`;
                    } else {
                        // For standard images
                        return `<div class="media-item"><img src="${asset.url}" alt="${log.team} asset"></div>`;
                    }
                }).join('');

                return `
                    <div class="team-log mt-8">
                        <h3 class="display-sm text-primary mb-2 border-b border-subtle pb-2">${log.team}</h3>
                        <p class="text-secondary text-sm mb-4">${log.description}</p>
                        <div class="media-grid">
                            ${assetsHtml}
                        </div>
                    </div>
                `;
            }).join('');

            // 5. Inject everything into the page
            detailContainer.innerHTML = `
                <div class="u-flex u-justify-between u-items-center mb-6">
                    <a href="sessions.html" class="btn btn--ghost">< BACK TO LOGS</a>
                    <span class="mono text-sm text-tertiary">REC_DATE: ${session.date}</span>
                </div>
                <h1 class="display-lg text-orange u-text-center">${session.title}</h1>
                <div class="divider divider--glyph"></div>
                <div class="inset">
                    <span class="label label--blue mb-2 u-block">MISSION.AGENDA</span>
                    <p class="text-primary text-sm">${session.agenda}</p>
                </div>
                ${presentationHtml}
                ${logsHtml}
            `;
        } else {
            detailContainer.innerHTML = `<h1 class="display-md text-red u-text-center">ERROR: ARCHIVE NOT FOUND</h1>`;
        }
    }

    window.dispatchEvent(new Event('EngineDOMReady'));
});