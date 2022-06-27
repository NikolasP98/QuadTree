import QuadTree from './quadtree';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let quad;
let mouse = { x: 0, y: 0, width: 100, height: 100 };
let queried = [];
const points = [];

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

canvas.addEventListener('click', (e) => {
	const body = {
		x: mouse.x + mouse.width / 2 - 10,
		y: mouse.y + mouse.height / 2 - 10,
		width: 20,
		height: 20,
	};
	quad.insert(body);
	points.push(body);
});

canvas.addEventListener('mousemove', (e) => {
	mouse.x = e.x - mouse.width / 2;
	mouse.y = e.y - mouse.height / 2;

	queried = quad.query(mouse);
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
		ctx.fillRect(point.x, point.y, point.width || 5, point.height || 5);
	});

	if (queried) {
		queried.forEach((point) => {
			ctx.fillStyle = '#00ff00';
			ctx.fillRect(point.x, point.y, point.width || 5, point.height || 5);
		});
	}
};

const animate = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// start main loop
	quad.root.draw(ctx);

	drawPoints();

	// end main loop
	requestAnimationFrame(animate);
};

setup();
