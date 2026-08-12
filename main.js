import GUI from 'lil-gui';
import QuadTree from './quadtree';

const locale = new URLSearchParams(window.location.search).get('lang') === 'es' ? 'es' : 'en';
const t = (english, spanish) => locale === 'es' ? spanish : english;
window.pnLocale = locale;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const stats = document.getElementById('stats');

let mouse = { x: 0, y: 0, width: 100, height: 100 };
let queried = [];
const points = [];

let totalBodies = 0;

let quad, gui, frame;
let controlsReady = false;

const settings = {
	showStats: true,
	queryShape: 'square',
};

const drawPoints = () => {
	points.forEach((point) => {
		ctx.fillStyle = '#1849c6';
		ctx.fillRect(point.x, point.y, point.width || 5, point.height || 5);
	});

	if (queried) {
		queried.forEach((point) => {
			ctx.fillStyle = '#d6f05f';
			ctx.fillRect(point.x, point.y, point.width || 5, point.height || 5);
		});
	}
};

const setup = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	if (!controlsReady) {
		gui.add(settings, 'showStats')
			.onChange((e) => {
				stats.hidden = !e;
			})
			.name(t('Show Stats', 'Mostrar estadísticas'));

		gui.add(settings, 'queryShape', locale === 'es'
			? { Cuadrado: 'square', Círculo: 'circle', Cono: 'cone' }
			: { Square: 'square', Circle: 'circle', Cone: 'cone' }).name(
			t('Query Shape', 'Forma de consulta')
		);

		QuadTree.debugger(gui, points);
		controlsReady = true;
	}

	quad = new QuadTree({
		x: 0,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	});

	if (!points.length) {
		for (let i = 0; i < 92; i++) {
			points.push({
				x: 30 + Math.random() * Math.max(20, canvas.width - 60),
				y: 80 + Math.random() * Math.max(20, canvas.height - 120),
				width: 8,
				height: 8,
			});
		}
	}
	quad.insert(points);
	totalBodies = points.length;
	document.getElementById('items-count').innerHTML = totalBodies;

	// start animation
	cancelAnimationFrame(frame);
	frame = requestAnimationFrame(animate);
};

const animate = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// start main loop
	quad.draw(ctx);

	drawPoints();

	// end main loop
	frame = requestAnimationFrame(animate);
};

/* ---------------------------
   ----- EVENT LISTENERS -----
   --------------------------- */

// run setup function
window.onload = () => {
	gui = new GUI({ title: t('Controls', 'Controles') });
	setup();

	// ? add event listeners after setup

	// query bodies in mouse area
	canvas.addEventListener('mousemove', (e) => {
		mouse.x = e.x - mouse.width / 2;
		mouse.y = e.y - mouse.height / 2;

		queried = quad.query(mouse, settings.queryShape);

		document.getElementById('items-selected').innerHTML = queried.length;
	});

	// add body to clicked coordinate
	canvas.addEventListener('click', () => {
		const body = {
			x: mouse.x + mouse.width / 2 - 10,
			y: mouse.y + mouse.height / 2 - 10,
			width: 20,
			height: 20,
		};
		quad.insert(body);
		points.push(body);

		totalBodies++;

		document.getElementById('items-count').innerHTML = totalBodies;
	});
};

// change canvas size as browser window resizes
window.addEventListener('resize', () => {
	setup();
});
