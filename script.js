/* global performance FPSMeter */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;;

const getTime = typeof performance === 'function' ? performance.now : Date.now;
const FRAME_DURATION = 1000 / 58;
let then = getTime();
let acc = 0;
FPSMeter.theme.colorful.container.height = '40px';
const meter = new FPSMeter({
    left: canvas.width - 130 + 'px',
    top: 'auto',
    bottom: '12px',
    theme: 'colorful',
    heat: 1,
    graph: 1
  });

let score = 0;
let lives = 10;
let caseSensitive = true;

const center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: '#FF0000'
};

let letter = {
    font: '20px Arial',
    color: '#0095DD',
    size: 30,
    highestSpeed: 1.6,
    lowestSpeed: 0.6,
    probability: 0.02
};

const particle = {
    decrease: 0.05,
    highestAlpha: 0.8,
    highestRadius: 5,
    highestSpeedX: 5,
    highestSpeedY: 5,
    lowestAlpha: 0.4,
    lowestRadius: 2,
    lowestSpeedX: -5,
    lowestSpeedY: -5,
    total: 50
};

const label = {
    font: '24px Arial',
    color: '#0095DD',
    margin: 20,
    left: 10,
    right: canvas.width - 110
};

let letters = [];
let particles = [];

draw();
document.addEventListener('keydown', keyDownHandler);
window.addEventListener('resize', resizeHandler);

function draw() {
    let now = getTime();
    let ms = now - then;
    let frames = 0;
    then = now;
    if (ms < 1000) {
        acc += ms;
        while (acc >= FRAME_DURATION) {
            frames++;
            acc -= FRAME_DURATION;
        }
    } else {
        ms = 0;
    }
    meter.tick();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle(center);
    ctx.font = letter.font;
    ctx.fillStyle = letter.color;
    for (const l of letters) {
        ctx.fillText(String.fromCharCode(l.code), l.x, l.y);
    }
    for (const p of particles) {
        drawCircle(p);
    }
    ctx.font = label.font;
    ctx.fillStyle = label.color;
    ctx.fillText('Score: ' + score, label.left, label.margin);
    ctx.fillText('Lives: ' + lives, label.right, label.margin);
    processParticles(frames);
    createLetters();
    removeLetters(frames);
    window.requestAnimationFrame(draw);
}

function drawCircle(c) {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function processParticles(frames) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX * frames;
        p.y += p.speedY * frames;
        p.radius -= particle.decrease;
        if (p.radius <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            particles.splice(i, 1);
        }
    }
}

function createLetters() {
    if (Math.random() < letter.probability) {
        const x = Math.random() < 0.5 ? 0 : canvas.width;
        const y = Math.random() * canvas.height;
        const dX = center.x - x;
        const dY = center.y - y;
        const norm = Math.sqrt(dX ** 2 + dY ** 2);
        const speed = letter.lowestSpeed + Math.random() * (letter.highestSpeed - letter.lowestSpeed);
        letters.push({
            x,
            y,
            code: Math.random() < 0.5 ? Math.floor(Math.random() * 25 + 65) : Math.floor(Math.random() * 25 + 97),
            speedX: dX / norm * speed,
            speedY: dY / norm * speed
        });
    }
}

function removeLetters(frames) {
    for (const l of letters) {
        if (intersects(l.x, l.y, letter.size, letter.size, center.x, center.y, center.radius, center.radius)) {
            if (--lives === 0) {
                window.alert('GAME OVER!');
                window.location.reload(false);
            } else if (lives > 0) {
                window.alert('START AGAIN!');
                letters = [];
                particles = [];
            }
            break;
        } else {
            l.x += l.speedX * frames;
            l.y += l.speedY * frames;
        }
    }
}

function generateRandomRgbColor() {
    return [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
}

function intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

function type(i, l) {
    letters.splice(i, 1);
    score++;
    for (let j = 0; j < particle.total; j++) {
        const c = generateRandomRgbColor();
        const alpha = particle.lowestAlpha + Math.random() * (particle.highestAlpha - particle.lowestAlpha);
        particles.push({
            x: l.x,
            y: l.y,
            radius: particle.lowestRadius + Math.random() * (particle.highestRadius - particle.lowestRadius),
            color: `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`,
            speedX: particle.lowestSpeedX + Math.random() * (particle.highestSpeedX - particle.lowestSpeedX),
            speedY: particle.lowestSpeedY + Math.random() * (particle.highestSpeedY - particle.lowestSpeedY)
        });
    }
}

window.changeCase = function () {
    caseSensitive = !caseSensitive;
    if (caseSensitive) {
        document.getElementById('change-case-text').innerHTML = '';
    } else {
        document.getElementById('change-case-text').innerHTML = 'in';
    }
};

function keyDownHandler(e) {
    for (let i = letters.length - 1; i >= 0; i--) {
        const l = letters[i];
        if (caseSensitive) {
            if (e.shiftKey) {
                if (e.keyCode === l.code) {
                    type(i, l);
                    return;
                }
            } else {
                if (e.keyCode + 32 === l.code) {
                    type(i, l);
                    return;
                }
            }
        } else {
            if (e.keyCode === l.code || e.keyCode + 32 === l.code) {
                type(i, l);
                return;
            }
        }
    }
    if (!e.shiftKey) {
        score--;
    }
}

function resizeHandler() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    center.x = canvas.width / 2;
    center.y = canvas.height / 2;
}
