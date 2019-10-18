const canvas = document.querySelector('#canvas');
const width = 1900;
const height = 800;
canvas.width = width;
canvas.height = height;
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

function multiply(a, s) {
    return [s * a[0], s * a[1]];
}

function length(a) {
    return Math.sqrt((a[0] * a[0]) + (a[1] * a[1]));
}

function normalize(a) {
    const len = length(a);
    return [a[0] / len, a[1] / len];
}

function dot(a, b) {
    return (a[0] * b[0]) + (a[1] * b[1]);
}

function drawLine(a, b) {
    ctx.beginPath();

    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
}

function drawPoint(a, r) {
    ctx.beginPath();

    ctx.arc(a[0], a[1], r, 0, Math.PI * 2);
    ctx.fill();

}

function drawOffsetLine(a, b, w) {
    const v = subtract(b, a);
    const perp = normalize([-v[1], v[0]]);
    const width = multiply(perp, w);
    const aW = add(a, width);
    const bW = add(b, width);
    drawLine(aW, bW);
}

function drawThickLine(a, b, w) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    drawLine(a, b);
    drawOffsetLine(a, b, w);
    drawOffsetLine(a, b, -w);
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 1;
    drawOffsetLine(b, add(b, multiply(subtract(b, a), 4)), w);
    drawOffsetLine(b, add(b, multiply(subtract(b, a), 4)), -w);
}

function drawVector(vec, at, col) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = col;
    const end = add(at, multiply(vec, 60));
    drawLine(at, end);
}

function drawCanvasLine(a, b, c) {
    ctx.lineWidth = lineWidth * 2;
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#0000ff';
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.lineTo(...c);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}

let pointA = [150, 150];
let pointB = [700, 350];
let pointC = [1000, 600];
const lineWidth = 32;
const miterLimit = 5;

let clicked = false;

canvas.addEventListener('mousedown', () => {
    clicked = true;
});
canvas.addEventListener('mouseup', () => {
    clicked = false;
});
canvas.addEventListener('mousemove', (e) => {
    if (clicked) {
        pointA = [e.offsetX, e.offsetY];
        requestAnimationFrame(render);
    }
})

function render() {
    ctx.miterLimit = miterLimit;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    drawThickLine(pointA, pointB, lineWidth);
    drawThickLine(pointC, pointB, lineWidth);
    const vecA = normalize(subtract(pointB, pointA));
    drawVector(vecA, pointB, '#65dd65');
    const vecB = normalize(subtract(pointC, pointB));
    drawVector(vecB, pointB, '#65dd65');
    const tangent = normalize(add(vecA, vecB));
    drawVector(tangent, pointB, '#23bbdd');
    const miter = [-tangent[1], tangent[0]];
    drawVector(miter, pointB, '#23bbdd');
    const normalA = [-vecA[1], vecA[0]];
    const normalB = [-vecB[1], vecB[0]];
    const miterLength = 1 / dot(miter, normalA);

    const miterA = add(pointB, multiply(miter, miterLength * lineWidth));
    const miterB = add(pointB, multiply(miter, -miterLength * lineWidth));

    if (miterLength < miterLimit || Math.sign(dot(normalA, tangent)) > 0) {
        drawPoint(miterA, 5);
    }
    if (miterLength < miterLimit || Math.sign(dot(normalB, tangent)) > 0) {
        drawPoint(miterB, 5);
    }

    if (miterLength > ctx.miterLimit) {
        const side = Math.sign(dot(vecA, miter));
        const clipPointA = add(pointB, multiply(normalize(normalA), side * lineWidth));
        const clipPointB = add(pointB, multiply(normalize(normalB), side * lineWidth));
        drawPoint(clipPointA, 5);
        drawPoint(clipPointB, 5);
    }

    drawCanvasLine(pointA, pointB, pointC);
}

render();