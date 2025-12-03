// ==UserScript==
// @name         Clashle Solver
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Solves Clashle. Includes auto-typer and auto-correction.
// @author       mintlover12
// @match        https://objectivitix.github.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const SAVE_KEY = 'clashle_settings';

    // Default settings
    let settings = {
        auto: false,
        speed: 50,
        delay: 2000,
        minimized: false,
        x: 20,
        y: 20
    };

    // Load saved settings
    if(localStorage.getItem(SAVE_KEY)){
        try {
            let saved = JSON.parse(localStorage.getItem(SAVE_KEY));
            settings = {...settings, ...saved};
        } catch(e) {
            console.log('Error loading settings');
        }
    }

    const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(settings));

    // Full card list
    const words = [
        "KNIGHT", "ARCHERS", "GOBLINS", "GIANT", "PEKKA", "MINIONS", "BALLOON", "WITCH", "BARBARIANS", "GOLEM", "SKELETONS", "VALKYRIE", "SKELETONARMY", "BOMBER", "MUSKETEER", "BABYDRAGON", "PRINCE", "WIZARD", "MINIPEKKA", "SPEARGOBLINS", "GIANTSKELETON", "HOGRIDER", "MINIONHORDE", "ICEWIZARD", "ROYALGIANT", "GUARDS", "PRINCESS", "DARKPRINCE", "THREEMUSKETEERS", "LAVAHOUND", "ICESPIRIT", "FIRESPIRIT", "MINER", "SPARKY", "BOWLER", "LUMBERJACK", "BATTLERAM", "INFERNODRAGON", "ICEGOLEM", "MEGAMINION", "DARTGOBLIN", "GOBLINGANG", "ELECTROWIZARD", "ELITEBARBARIANS", "HUNTER", "EXECUTIONER", "BANDIT", "ROYALRECRUITS", "NIGHTWITCH", "BATS", "ROYALGHOST", "RAMRIDER", "ZAPPIES", "RASCALS", "CANNONCART", "MEGAKNIGHT", "SKELETONBARREL", "FLYINGMACHINE", "WALLBREAKERS", "ROYALHOGS", "GOBLINGIANT", "FISHERMAN", "MAGICARCHER", "ELECTRODRAGON", "FIRECRACKER", "MIGHTYMINER", "ELIXIRGOLEM", "BATTLEHEALER", "SKELETONKING", "ARCHERQUEEN", "GOLDENKNIGHT", "MONK", "SKELETONDRAGONS", "MOTHERWITCH", "ELECTROSPIRIT", "ELECTROGIANT", "PHOENIX", "LITTLEPRINCE", "GOBLINDEMOLISHER", "GOBLINMACHINE", "SUSPICIOUSBUSH", "GOBLINSTEIN", "RUNEGIANT", "BERSERKER", "BOSSBANDIT", "CANNON", "GOBLINHUT", "MORTAR", "INFERNOTOWER", "BOMBTOWER", "BARBARIANHUT", "TESLA", "ELIXIRCOLLECTOR", "XBOW", "TOMBSTONE", "FURNACE", "GOBLINCAGE", "GOBLINDRILL", "FIREBALL", "ARROWS", "RAGE", "ROCKET", "GOBLINBARREL", "FREEZE", "MIRROR", "LIGHTNING", "ZAP", "POISON", "GRAVEYARD", "THELOG", "TORNADO", "CLONE", "EARTHQUAKE", "BARBARIANBARREL", "HEALSPIRIT", "GIANTSNOWBALL", "ROYALDELIVERY", "VOID", "GOBLINCURSE", "SPIRITEMPRESS", "VINES"
    ];


    // insert CSS for the panel
    const style = document.createElement('style');
    style.innerHTML = `
        #clashle-panel {
            position: fixed;
            z-index: 99999;
            width: 280px;
            background: rgba(20, 20, 25, 0.95);
            color: #fff;
            border: 1px solid #4caf50;
            border-radius: 8px;
            font-family: sans-serif;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            font-size: 13px;
        }
        #clashle-header {
            padding: 10px;
            background: #4caf50;
            color: #000;
            font-weight: bold;
            cursor: move;
            display: flex;
            justify-content: space-between;
        }
        #clashle-body {
            padding: 15px;
        }
        .c-row { margin-bottom: 12px; }
        .c-flex { display: flex; justify-content: space-between; align-items: center; }
        .c-label { color: #aaa; font-size: 11px; margin-bottom: 4px; }
        input[type=range] { width: 100%; accent-color: #4caf50; }
        #word-list {
            height: 150px;
            overflow-y: auto;
            background: rgba(0,0,0,0.3);
            border: 1px solid #333;
            margin-top: 10px;
            padding: 5px;
        }
        .word-item { padding: 3px; border-bottom: 1px solid #333; cursor: pointer; }
        .word-item:hover { background: #333; }
        button#toggle-view { background:none; border:none; cursor:pointer; font-weight:bold; }
    `;
    document.head.appendChild(style);

    // make panel
    const panel = document.createElement('div');
    panel.id = 'clashle-panel';
    panel.style.top = settings.y + 'px';
    panel.style.left = settings.x + 'px';

    panel.innerHTML = `
        <div id="clashle-header">
            <span>Clashle Bot v5</span>
            <button id="toggle-view">${settings.minimized ? '▼' : '▲'}</button>
        </div>
        <div id="clashle-body" style="display: ${settings.minimized ? 'none' : 'block'}">
            <div class="c-row c-flex" style="background:rgba(255,255,255,0.1); padding:5px; border-radius:4px;">
                <label for="chk-auto" style="font-weight:bold; cursor:pointer">🤖 Enable Bot</label>
                <input type="checkbox" id="chk-auto" ${settings.auto ? 'checked' : ''}>
            </div>

            <div class="c-row">
                <div class="c-flex c-label">
                    <span>Typing Speed</span>
                    <span id="lbl-speed">${settings.speed}ms</span>
                </div>
                <input type="range" id="rng-speed" min="1" max="500" value="${settings.speed}">
            </div>

            <div class="c-row">
                <div class="c-flex c-label">
                    <span>Next Turn Delay</span>
                    <span id="lbl-delay">${settings.delay}ms</span>
                </div>
                <input type="range" id="rng-delay" min="1" max="5000" step="50" value="${settings.delay}">
            </div>

            <div id="status-msg" style="text-align:center; color:#4caf50; font-weight:bold; margin-bottom:5px;">Ready</div>
            <div id="word-list"></div>
        </div>
    `;
    document.body.appendChild(panel);

    // stuff
    const bodyDiv = document.getElementById('clashle-body');
    const toggleBtn = document.getElementById('toggle-view');
    const chkAuto = document.getElementById('chk-auto');
    const rngSpeed = document.getElementById('rng-speed');
    const rngDelay = document.getElementById('rng-delay');
    const statusMsg = document.getElementById('status-msg');
    const wordListDiv = document.getElementById('word-list');


    toggleBtn.onclick = () => {
        settings.minimized = !settings.minimized;
        bodyDiv.style.display = settings.minimized ? 'none' : 'block';
        toggleBtn.innerText = settings.minimized ? '▼' : '▲';
        save();
    };

    chkAuto.onchange = (e) => {
        settings.auto = e.target.checked;
        save();
        if(settings.auto) solve();
    };

    rngSpeed.oninput = (e) => {
        settings.speed = parseInt(e.target.value);
        document.getElementById('lbl-speed').innerText = settings.speed + 'ms';
        save();
    };

    rngDelay.oninput = (e) => {
        settings.delay = parseInt(e.target.value);
        document.getElementById('lbl-delay').innerText = settings.delay + 'ms';
        save();
    };

    // draggy
    let isDragging = false, offX, offY;
    const header = document.getElementById('clashle-header');

    header.onmousedown = (e) => {
        if(e.target === toggleBtn) return;
        isDragging = true;
        offX = e.clientX - panel.offsetLeft;
        offY = e.clientY - panel.offsetTop;
    };

    document.onmousemove = (e) => {
        if(!isDragging) return;
        e.preventDefault();
        const nx = e.clientX - offX;
        const ny = e.clientY - offY;
        panel.style.left = nx + 'px';
        panel.style.top = ny + 'px';
        settings.x = nx;
        settings.y = ny;
    };

    document.onmouseup = () => {
        if(isDragging) {
            isDragging = false;
            save();
        }
    };


    let botBusy = false;

    // find text context (that rhymes)
    function getBtn(text) {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.innerText.toUpperCase() === text.toUpperCase());
    }

    function scanBoard() {
        // get rows
        const rows = document.querySelectorAll('.flex.justify-center.mb-1');
        if(!rows.length) return null;

        // get word length
        const row1 = rows[0].querySelectorAll('.w-14');
        const len = row1.length;

        // get data to solve
        let greens = new Array(len).fill(null);
        let yellows = new Set();
        let deadChars = new Set();
        let filledRows = -1;

        // lopp through all tiles
        const allTiles = document.querySelectorAll('.w-14');

        allTiles.forEach((tile, index) => {
            const letterEl = tile.querySelector('.letter-container');
            const letter = letterEl ? letterEl.innerText.toUpperCase() : '';
            const r = Math.floor(index / len);
            const c = index % len;

            // get colors
            const isGreen = tile.classList.contains('correct');
            const isYellow = tile.classList.contains('present');
            const isGray = tile.classList.contains('absent');

            if(isGreen || isYellow || isGray) {
                if(r > filledRows) filledRows = r;

                if(isGreen) {
                    greens[c] = letter;
                    yellows.add(letter); // is present
                } else if(isYellow) {
                    yellows.add(letter);
                } else if(isGray) {
                    deadChars.add(letter);
                }
            }
        });

        // remember stuff
        let finalDead = new Set();
        deadChars.forEach(char => {
            if(!yellows.has(char)) finalDead.add(char);
        });

        return { len, greens, yellows, dead: finalDead, filledRows, tiles: allTiles };
    }

    // remove stupid human error ;)
    async function clearTrash() {
        const tiles = document.querySelectorAll('.w-14');
        let junkCount = 0;

        // count non-colored
        tiles.forEach(t => {
            const l = t.querySelector('.letter-container');
            const hasColor = t.classList.contains('correct') || t.classList.contains('present') || t.classList.contains('absent');
            if(l && l.innerText && !hasColor) junkCount++;
        });

        if(junkCount > 0) {
            statusMsg.innerHTML = `<span style="color:orange">Cleaning ${junkCount} chars...</span>`;
            const del = getBtn('Delete');
            if(del) {
                for(let i=0; i<junkCount; i++) {
                    del.click();
                    await new Promise(r => setTimeout(r, 20)); // fast delete
                }
            }
        }
    }

    function solve() {
        if(botBusy) return;

        const board = scanBoard();
        if(!board) return;

        // tada
        if(board.filledRows >= 0) {
            let correct = 0;
            const startIdx = board.filledRows * board.len;
            for(let i=0; i<board.len; i++) {
                if(board.tiles[startIdx + i].classList.contains('correct')) correct++;
            }
            if(correct === board.len) {
                statusMsg.innerHTML = "<span style='color:lime'>done</span>";
                settings.auto = false;
                chkAuto.checked = false;
                save();
                return;
            }
        }

        // Filter words
        const candidates = words.filter(w => {
            if(w.length !== board.len) return false;

            // check grays
            for(let d of board.dead) {
                if(w.includes(d)) return false;
            }

            // ceck yellows (must contain)
            for(let y of board.yellows) {
                if(!w.includes(y)) return false;
            }

            // check greens (exact position)
            for(let i=0; i<board.len; i++) {
                if(board.greens[i] && w[i] !== board.greens[i]) return false;
            }

            return true;
        });

        // update gui
        if(candidates.length === 0) {
            statusMsg.innerText = "No words found :(";
            wordListDiv.innerHTML = "";
        } else {
            statusMsg.innerText = `Found ${candidates.length} possible`;
            wordListDiv.innerHTML = candidates.map(w =>
                `<div class="word-item" onclick="navigator.clipboard.writeText('${w}')">${w}</div>`
            ).join('');
        }

        // bot doey stuffies
        if(settings.auto && candidates.length > 0) {
            runBot(candidates[0]);
        }
    }

    async function runBot(word) {
        botBusy = true;

        await clearTrash(); // remove for faster times

        statusMsg.innerHTML = `Typing: <b style="color:#fff">${word}</b>`;

        // keyboard press go wowie
        for(let char of word) {
            const b = getBtn(char);
            if(b) b.click();
            await new Promise(r => setTimeout(r, settings.speed));
        }

        // enter stuff
        await new Promise(r => setTimeout(r, settings.speed));
        const ent = getBtn('Enter');
        if(ent) ent.click();

        statusMsg.innerText = "Waiting...";

        // wait for animation if needed
        setTimeout(() => {
            botBusy = false;
            solve();
        }, settings.delay);
    }

    // monitor for when game updates
    const observer = new MutationObserver(() => {
        if(!botBusy) setTimeout(solve, 500); // slight debounce
    });

    const checkRoot = setInterval(() => {
        const root = document.querySelector('.flex.flex-col.grow');
        if(root) {
            clearInterval(checkRoot);
            observer.observe(root, {subtree: true, attributes: true});
            // console.log("Hooked into game");
            solve();
        }
    }, 1000);

})();
