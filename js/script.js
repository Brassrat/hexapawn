const upperLeft = 'A'.codePointAt(0);
const human = 0;
const computer = 1;
const computerRow = [];
const humanRow = [];
const allCells = [];
const pos = ["", ""]
const rootElement = document.documentElement;
document.onmouseup = drop
document.ontouchend = drop
const badIdeas = {};
const points = [0,0];
let turn = 0;
let width = 3;
rootElement.style.setProperty('--width', width.toString());
let height = 3;
rootElement.style.setProperty('--height', height.toString());
let dragEl;
let snapshot = "";
let needInit = true;
initDocument()
initialize()
draw();
let useSW = true;

if (useSW && ('serviceWorker' in navigator)) {
    navigator.serviceWorker.register('sw.js', {
        scope: '/hexapawn/'
    }).then(function (reg) {

        if (reg.installing) {
            console.log('Service worker installing');
        } else if (reg.waiting) {
            console.log('Service worker installed');
        } else if (reg.active) {
            console.log('Service worker active');
        }

    }).catch(function (error) {
        // registration failed
        console.log('Registration failed with ' + error);
    });
}

function positionPawn(ii) {
    let pawn = String.fromCodePoint(upperLeft + ii);
    let styleElement = document.getElementById(pawn + '-style');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = pawn + '-style';
        document.head.appendChild(styleElement);
    }
    let styleSheet = styleElement.sheet;
    while (styleSheet.cssRules.length > 0) {
        styleSheet.deleteRule(0);
    }
    const row = Math.trunc(ii / width);
    const col = ii % width;
    const top = `calc((100% / var(--height)) * ${row}.15)`;
    const left = `calc((100% / var(--width)) * ${col}.15)`;
    let cssRule = `
#winnerspot.${pawn}:before,
.allow.${pawn},
.notallow.${pawn},
#${pawn}.pawn {
  width: calc((100% / var(--width)) * .7);
  height: calc((100% / var(--height)) * .7);
  left: ${left};
  top: ${top};
}
`
    styleSheet.insertRule(cssRule, styleSheet.cssRules.length); // Adds to the end
    cssRule = `
.allow.${pawn},
.notallow.${pawn} {
  width: calc((100% / var(--width)) - 4px);
  height: calc((100% / var(--height)) - 4px);
}
`
    styleSheet.insertRule(cssRule, styleSheet.cssRules.length); // Adds to the end
}

function initDocument() {

    const wPct = 100.000 / width; //'33.333'
    const hPct = 100.000 / height; //'33.333'
    let back = `body {
        background-image: `;
    let vert = 'linear-gradient(90deg,';
    /* vertical lines */
    for (let pct = wPct ; pct < 99; pct += wPct) {
        vert += '\n    ' + `transparent calc(${pct}% - 2px),`;
        vert += '\n    ' + `var(--c1) ${pct}%,`;
        vert += '\n    ' + `transparent calc(${pct}% + 2px)`;
        vert += (pct + wPct < 99) ? ',' : ')';
    }
    back += vert;
    /* horizontal lines */
    back += ',\n';
    let horz = 'linear-gradient(0deg,';
    for (pct = hPct ; pct < 99; pct += hPct) {
        horz += '\n    ' + `transparent calc(${pct}% - 2px),`;
        horz += '\n    ' + `var(--c1) ${pct}%,`;
        horz += '\n    ' + `transparent calc(${pct}% + 2px)`;
        horz += ((pct + hPct) < 99) ? ',' : ')';
    }
    back += horz;
    back += `;
    }
    `
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    styleSheet = styleElement.sheet;
    styleSheet.insertRule(back, styleSheet.cssRules.length); // Adds to the end
    for ( let ii = 0; ii < height * width; ii++ ) {
        positionPawn(ii)
    }
}
function initialize() {
    turn = 0;
    computerRow.length = 0;
    humanRow.length = 0;
    allCells.length = 0;
    for ( let i = 0; i < height * width; i++ ) {
        allCells.push(String.fromCodePoint(upperLeft + i))
    }
    pos[0] = "";
    pos[1] = "";
    for ( let i = 0; i < width; i++ ) {
        let computerPawn = String.fromCodePoint(upperLeft + i); // ABC
        computerRow.push(computerPawn);
        pos[computer] = pos[computer] + computerPawn;
        let humanPawn = String.fromCodePoint(upperLeft + ((height -1) * width) + i);
        humanRow.push(humanPawn);
        pos[human] = pos[human] + humanPawn;
    }
}

function draw() {
    if (needInit) {
        needInit = false;
        initDocument();
        initialize();
    }
    pos[human] = pos[human].split('').sort().join('');
    pos[computer] = pos[computer].split('').sort().join('');
    const humanPawns = pos[human].split('');
    const cumputerPawns = pos[computer].split('');
    document.body.innerHTML = "";
    cumputerPawns.forEach(pawn => {
        document.body.insertAdjacentHTML("beforeend", `<div id="${pawn}" class="pawn computer"></div>`);
    })
    humanPawns.forEach(pawn => {
        document.body.insertAdjacentHTML("beforeend", `<div id="${pawn}" class="pawn human" onmousedown="drag(this)" ontouchstart="drag(this)"></div>`);
    })

    document.body.insertAdjacentHTML('beforeend', `
        <div id="size">
          <ul id="sizes">
            <li>
              <label for="width">W:</label>
              <input type="number" id="width" name="width" value="${width}" min="3" max="7"/>
            </li>
            <li>
              <label for="height">H:</label>
              <input type="number" id="height" name="height" value="${height}" min="3" max="7"/>
            </li>
          </ul>
        </div>
    `);
    document.getElementById('width').addEventListener('input', (event) => {
        const input = document.getElementById("width");
        if (input !== null) {
            const oldWidth = width;
            width = +input.value;
            if (width * height > 26) {
                // only 26 pawns are allowed due to naming scheme
                width = Math.trunc(26 / height);
                input.value = width.toString();
            }
            document.documentElement.style.setProperty('--width', width.toString());
            needInit = (width !== oldWidth);
            if (needInit) {
                draw();
            }
        }
    });
    document.getElementById('height').addEventListener('input', (event) => {
        const input = document.getElementById("height");
        if (input !== null) {
            const oldHeight = height;
            height = +input.value;
            if (width * height > 26) {
                // only 26 pawns are allowed due to naming scheme
                height = Math.trunc(26 / width);
                input.value = height.toString();
            }
            document.documentElement.style.setProperty('--height', height.toString());
            needInit = (height !== oldHeight);
            if (needInit) {
                draw();
            }
        }
    });
    document.body.insertAdjacentHTML("beforeend", `<div id="points"><span>${points[0]}</span><span>${points[1]}</span></div>`);
    document.body.insertAdjacentHTML("beforeend", `
        <ul class="links">
        <li><a target="_blank" href="https://youtu.be/sw7UAZNgGg8">WTF?</a></li>
        <li><a target="_blank" href="https://en.wikipedia.org/wiki/Hexapawn">More About</a></li>
        <li><a target="_blank" href="https://github.com/behnamazizi/hexapawn">Github</a></li>
    </ul>
    `);

    turn++
    document.body.classList.remove('human', 'computer')
    document.body.classList.add(`${turn % 2 ? 'human' : 'computer'}`)
    setTimeout(() => {
        isWon();
    }, 500);
}

function drag(el) {
    dragEl = el;
    document.body.onmousemove = sticker;
    document.body.ontouchmove = sticker;
    el.classList.add('drag')
    function sticker(e) {
        const elAllowed = isAllow(el.id, findTarget(el.id));
        elAllowed[0] ?
            (document.querySelectorAll(`.allow.${elAllowed[1]}`).length > 0 ? '' :
                (document.querySelectorAll('.allow').forEach(el => el.remove()), document.body.insertAdjacentHTML('beforeend', `<div class="allow ${elAllowed[1]}"></div>`))) :
            document.querySelectorAll('.allow').forEach(el => el.remove());

        movePos = e.type === "touchmove" ? [e.changedTouches[0].clientY, e.changedTouches[0].clientX] : [e.pageY, e.pageX];
        el.style.top = movePos[0] - ((window.innerHeight - document.body.offsetHeight) / 2) - (el.offsetWidth / 2)
        el.style.left = movePos[1] - ((window.innerWidth - document.body.offsetWidth) / 2) - (el.offsetWidth / 2)
    }
}

function drop(e) {
    if (dragEl) {
        dragEl.classList.remove('drag')
        document.body.onmousemove = null;
        document.body.ontouchmove = null;
        if (needInit) {
           draw();
        }
        alw = isAllow(dragEl.id, findTarget(dragEl.id));
        if (alw[0]) {
            winnerpos = alw[1];
            pos[computer] = pos[computer].replace(alw[1], '');
            pos[human] = pos[human].replace(dragEl.id, alw[1]);
            draw();
        } else {
            document.querySelectorAll('.pawn').forEach(el => el.style = '')
        }
    }
    dragEl = '';
}

function findTarget(curentId) {
    const page = event.type.search("touch") >= 0 ? [event.changedTouches[0].pageY, event.changedTouches[0].pageX] : [event.pageY, event.pageX];
    dropOffset = [
        page[0] - ((window.innerHeight - document.body.offsetHeight) / 2),
        page[1] - ((window.innerWidth - document.body.offsetWidth) / 2)
    ];
    const hh = document.body.offsetHeight / height;
    const ww = document.body.offsetWidth / width;
    const dropPos = [
        Math.trunc(dropOffset[0] / hh),
        Math.trunc(dropOffset[1] / ww)
    ];
    const xxx = dropPos[0] * width + dropPos[1];
    const dropTarget = String.fromCodePoint(upperLeft + xxx);
    //console.log('%s => %s', curentId, dropTarget)
    return dropTarget;
}

function isAllow(curentId, dropTarget) {
    const tgt = dropTarget.codePointAt(0);
    const mover = (turn % 2) ? human : computer; // odd turn is human
    const other = (mover === human) ? computer : human;
    const from = curentId.codePointAt(0);
    const tgtRow = from + ((mover === human) ? -width : width);
    if (tgt === tgtRow) {
        const occupied = pos[human].includes(dropTarget) || pos[computer].includes(dropTarget)
        return [!occupied, dropTarget]; // up/down move
    }
    const rr = (from - upperLeft) / width;
    const cc = (from - upperLeft) % width + 1;
    if (((cc !== 1) && (tgt === (tgtRow - 1))) ||
        ((cc !== width) && (tgt === (tgtRow + 1)))) {
        return [pos[other].includes(dropTarget), dropTarget];
    }
    return [false, dropTarget];

}

function computerMove() {
    setTimeout(() => {
        pMoves = posiblemoves('computer')
        const possibilities = {};
        pMoves.forEach(move => {
            //humanRow.forEach(w => move[1] === w ? p += 2 : '');
            const p = (humanRow.includes(move[1]) ? 2 :
                 badIdeas[pos.join('') + move] ? -1 : 0).toString()
            possibilities[p] !== undefined ? possibilities[p].push(move) :                                                possibilities[p] = [move];
        })
        max = -100;
        Object.keys(possibilities).forEach(p => {
            max = Math.max(max, parseInt(p));
        })
        rnd = Math.floor(Math.random() * possibilities[max].length);
        choosen = possibilities[max][rnd]       
        snapshot = pos.join('') + choosen;
        pos[human] = pos[human].replace(choosen.split('')[1], '');
        pos[computer] = pos[computer].replace(choosen.split('')[0], choosen.split('')[1]);

        draw();
    }, 500);
}

function isWon() {
    humanPosibleMoves = posiblemoves('human');
    computerPosibleMoves = posiblemoves('computer');
    winner =
        turn % 2 === 0 && computerPosibleMoves.length === 0 ? 'human' :
        turn % 2 !== 0 && humanPosibleMoves.length === 0 ? 'computer' :
        computerRow.some(i => pos[human].includes(i)) ? 'human' :
        humanRow.some(i => pos[computer].includes(i)) ? 'computer' : '';
    if (winner.length > 0) {
        winner === 'computer' ?
        (winnerpos = snapshot[snapshot.length - 1], snapshot = '', points[0]++):
        (badIdeas[snapshot] = true, snapshot = '', points[1]++);

        alerter(winner.toUpperCase() + ' WON!')
        document.body.insertAdjacentHTML('afterBegin', `<div id="winnerspot" class="${winner} ${winnerpos}"></div>`)
        initialize()
    }
    else {
       if (turn % 2 === 0) computerMove()
    }
}

function posiblemoves(player) {
    const positions = player === 'human' ? pos[human] : pos[computer];
    pms = [];
    pm = positions.split('').map(m => {
        const d = [];
        allCells.forEach(p => {
            if (isAllow(m, p)[0]) {
                d.push((m + isAllow(m, p)[1]))
            }
        })
        return d
    })
    .filter(c => {
        return c.length > 0
    })
    pm.forEach(p => {
        p.forEach(i => {
            pms.push(i)
        })
    })
    return pms
}

function alerter(text) {
    document.body.insertAdjacentHTML('beforeend', `<div id="alert">${text}<button onclick="document.querySelector('#alert').remove(); draw();">OK</button></div>`)
}
