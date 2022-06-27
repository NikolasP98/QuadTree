import QuadTree from './quadtree';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let quad;
const points = [];

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

canvas.addEventListener('click', (e) => {
	const mouseX = e.clientX;
	const mouseY = e.clientY;
	quad.insert({ x: mouseX, y: mouseY });
	points.push({ x: mouseX, y: mouseY });
});

const setup = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	quad = new QuadTree({
		x: 0,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	});

	// start animation
	requestAnimationFrame(animate);
};

const drawPoints = () => {
	points.forEach((point) => {
		ctx.fillStyle = '#ff0000';
		ctx.fillRect(point.x, point.y, 10, 10);
	});
};

const animate = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	quad.root.draw(ctx);
	drawPoints();

	requestAnimationFrame(animate);
};

setup();
