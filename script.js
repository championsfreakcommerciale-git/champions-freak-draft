const teams = [
    "Origin Story", 
    "Runbacks", 
    "Legend Makers", 
    "New Era", 
    "Dream Chasers", 
    "Show Stoppers", 
    "Chrononauts", 
    "Infinity Guardians"
];

const tierLabels = ["Capitani", "Fascia 1", "Fascia 2", "Fascia 3", "Fascia 4", "Fascia 5", "Fascia 6"];
const tierLabelsShort = ["CAP", "1°", "2°", "3°", "4°", "5°", "6°"];

const extractionSequence = [1, 7, 6, 5, 4, 3, 2];
let currentSequenceIndex = 0;

let currentTeamIndex = 0;
let pendingPlayers = [];

const datasetFasce = [
    ["Davide Cattaneo", "Andrea Frigerio", "Matteo Barlusconi", "Nicolò Piccinelli", "Lorenzo Caronni", "Simone Corrado", "Davide Caronni", "Andrea Frangi"],
    ["Marco Vago", "Riccardo Salafica", "Mario Salerno", "Alberto Pizzi", "Alessandro Alboretto", "Nicolas Caroniti", "Giuseppe Rinaldi", "Alessandro Aguzzi"],
    ["Davide Azzini", "Matteo Dubini", "Riccardo Cattaneo", "Christian Torin", "Francesco Colombo", "Matteo Pecin", "Edoardo Beretta", "Matteo Zezza"],
    ["Matteo Lucini", "Valerio Pizzi", "Luca Lodini", "Simone Monti", "Francesco Greco", "Michele Tallarico", "Nicolò Poloni", "Simone Mastro"],
    ["Jacopo Azzini", "Alberto Iozzo", "Nicholas Bergna", "Andrea Castelli", "Marco Lucon", "Alessandro Girelli", "Haitem Mrassi", "Luca Caldarelli"],
    ["Luigi Ferrara", "Francesco Iozzo", "Dennis Re", "Simone Labanca", "Diego Consonni", "Marco Corrado", "Giuseppe Rossetti", "Lorenzo Stucchi"],
    ["Andrea Frison", "Davide Sangion", "Marco Garbagnati", "Christian Zorza", "Gabriele Tettamanzi", "Mattia Barcella", "Andrea Biacchessi", "Andrea Vago"]
];

const teamsBoard = document.getElementById('teams-board');
const urnaBoard = document.getElementById('urna-board');
const extractBtn = document.getElementById('extract-btn');
const exportBtn = document.getElementById('export-btn');

// 1. Inizializzazione Tabellone con Loghi
let boardHTML = `<div class="empty-cell"></div>`;

teams.forEach((teamName, teamIndex) => {
    const logoSrc = `${teamName}.png`; 
    boardHTML += `
        <div class="team-header">
            <img class="team-logo" id="logo-${teamIndex}" src="${logoSrc}" alt="${teamName}">
            <div class="team-name">${teamName}</div>
        </div>`;
});

for(let i = 1; i <= 7; i++) {
    boardHTML += `<div class="row-label">${tierLabelsShort[i-1]}</div>`;
    for(let teamIndex = 0; teamIndex < 8; teamIndex++) {
        boardHTML += `
            <div class="roster-slot" id="team-${teamIndex}-tier-${i}">
                <div class="name-reveal-container">
                    <span class="player-name-slot"></span>
                </div>
            </div>`;
    }
}
teamsBoard.innerHTML = boardHTML;

// 2. Inizializzazione Urna
datasetFasce.forEach((fascia, index) => {
    const tierNum = index + 1;
    const fasciaDiv = document.createElement('div');
    fasciaDiv.className = 'fascia';
    fasciaDiv.id = `tier-container-${tierNum}`;
    fasciaDiv.innerHTML = `<div class="fascia-header"><span>Urna ${tierLabels[index]}</span><span class="status-label">In attesa</span></div><div class="fascia-grid" id="grid-${tierNum}"></div>`;
    urnaBoard.appendChild(fasciaDiv);

    const grid = fasciaDiv.querySelector('.fascia-grid');
    fascia.forEach((nome) => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.draggable = true;
        card.innerHTML = `<span class="secret-name">???</span><span class="real-name">${nome}</span>`;
        grid.appendChild(card);
    });
});

function updateBtnText() {
    if (currentSequenceIndex >= extractionSequence.length) {
        extractBtn.innerText = "Draft Completato!";
        extractBtn.disabled = true;
        
        // RIVELA IL PULSANTE EXPORT
        exportBtn.style.display = "inline-block";
        return;
    }
    const nextTier = extractionSequence[currentSequenceIndex];
    if (nextTier === 3 || nextTier === 2) {
        extractBtn.innerText = currentTeamIndex === 0 ? `Inizia Estrazione ${tierLabels[nextTier-1]}` : `Estrai per ${teams[currentTeamIndex]}`;
    } else {
        extractBtn.innerText = `Estrai ${tierLabels[nextTier-1]}`;
    }
}

// 3. Logica Estrazione
extractBtn.addEventListener('click', () => {
    if (currentSequenceIndex >= extractionSequence.length) return;

    const currentTier = extractionSequence[currentSequenceIndex];
    const isEpicTier = (currentTier === 3 || currentTier === 2);
    const grid = document.getElementById(`grid-${currentTier}`);

    if (isEpicTier) {
        if (currentTeamIndex === 0) {
            const cards = Array.from(grid.querySelectorAll('.player-card:not(.assigned-card)'));
            if (cards.length !== 8) { alert(`Devono esserci 8 giocatori nell'Urna!`); return; }
            
            pendingPlayers = cards.map(c => c.querySelector('.real-name').innerText);
            for (let i = pendingPlayers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pendingPlayers[i], pendingPlayers[j]] = [pendingPlayers[j], pendingPlayers[i]];
            }
        }

        const slot = document.getElementById(`team-${currentTeamIndex}-tier-${currentTier}`);
        const container = slot.querySelector('.name-reveal-container');
        
        slot.classList.remove('epic-filled');
        container.innerHTML = `
            <span class="player-name-slot">${pendingPlayers.pop()}</span>
            <div class="burn-cover">
                <div class="sparks"></div>
            </div>
            <div class="firework-explosion"></div>
        `;
        
        void slot.offsetWidth; 
        slot.classList.add('epic-filled');

        const cardToRemove = grid.querySelector('.player-card:not(.assigned-card)');
        if(cardToRemove) cardToRemove.classList.add('assigned-card');

        currentTeamIndex++;

        if (currentTeamIndex >= 8) {
            document.getElementById(`tier-container-${currentTier}`).classList.add('extracted');
            document.getElementById(`tier-container-${currentTier}`).querySelector('.status-label').innerText = "Estratta";
            currentTeamIndex = 0;
            currentSequenceIndex++;
        }
    } else {
        const cards = Array.from(grid.querySelectorAll('.player-card'));
        if (cards.length !== 8) { alert(`Devono esserci 8 giocatori nell'Urna!`); return; }

        let playerNames = cards.map(card => card.querySelector('.real-name').innerText);
        for (let i = playerNames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerNames[i], playerNames[j]] = [playerNames[j], playerNames[i]];
        }

        teams.forEach((team, teamIndex) => {
            const slot = document.getElementById(`team-${teamIndex}-tier-${currentTier}`);
            const container = slot.querySelector('.name-reveal-container');
            setTimeout(() => {
                container.innerHTML = `<span class="player-name-slot">${playerNames[teamIndex]}</span>`;
                slot.classList.add('filled');
            }, 100 * teamIndex);
        });

        document.getElementById(`tier-container-${currentTier}`).classList.add('extracted');
        document.getElementById(`tier-container-${currentTier}`).querySelector('.status-label').innerText = "Estratta";
        currentSequenceIndex++;
    }

    updateBtnText();
});

// 4. Logica di Esportazione CSV
exportBtn.addEventListener('click', () => {
    // \uFEFF forza l'UTF-8 BOM, necessario per mostrare gli accenti in Excel
    let csvContent = "\uFEFF"; 
    
    // Header
    const headers = ["Squadra", "Capitani", "Fascia 1", "Fascia 2", "Fascia 3", "Fascia 4", "Fascia 5", "Fascia 6"];
    csvContent += headers.join(";") + "\n"; // Usa il ; per compatibilità con l'Excel italiano

    // Raccoglie i dati riga per riga dal tabellone per ogni squadra
    teams.forEach((teamName, teamIndex) => {
        let row = [teamName];
        
        // I tier vanno dall'1 al 7
        for(let i = 1; i <= 7; i++) {
            const slot = document.getElementById(`team-${teamIndex}-tier-${i}`);
            let playerName = slot.querySelector('.player-name-slot').innerText;
            // Pulisce il testo da eventuali ritorni a capo se si verificassero
            playerName = playerName.replace(/\n/g, ' ').trim();
            row.push(playerName);
        }
        
        csvContent += row.join(";") + "\n";
    });

    // Innesca il download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Roster_Champions_Freak_2026.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Modalità Modifica
document.getElementById('admin-toggle').addEventListener('change', (e) => {
    if (e.target.checked) document.body.classList.add('admin-mode');
    else document.body.classList.remove('admin-mode');
});

// Drag & Drop Magnetico
let draggedCard = null;

document.addEventListener("dragstart", (e) => {
    const card = e.target.closest('.player-card');
    if (card && !card.closest('.extracted') && !card.classList.contains('assigned-card')) {
        draggedCard = card;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => card.classList.add('dragging'), 0); 
    }
});

document.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!draggedCard) return;

    const grid = e.target.closest('.fascia-grid');
    if (!grid || grid.closest('.extracted')) return;

    const targetCard = e.target.closest('.player-card:not(.dragging)');
    
    if (targetCard && targetCard.parentNode === grid) {
        const rect = targetCard.getBoundingClientRect();
        const isAfter = (e.clientX - rect.left) > (rect.width / 2);
        
        if (isAfter) {
            grid.insertBefore(draggedCard, targetCard.nextSibling);
        } else {
            grid.insertBefore(draggedCard, targetCard);
        }
    } else if (e.target === grid && !grid.contains(draggedCard)) {
        grid.appendChild(draggedCard);
    }
});

document.addEventListener("dragend", () => {
    if (draggedCard) {
        draggedCard.classList.remove('dragging');
        draggedCard = null;
    }
});