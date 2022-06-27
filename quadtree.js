export default class QuadTree {
	constructor(bounds, itemBounds = false, maxDepth = 4, maxCapacity = 4) {
		let node;

		if (!itemBounds) {
			node = new Node(bounds, 0, maxDepth, maxCapacity);
		} else {
			node = new BoundedNode(bounds, 0, maxDepth, maxCapacity);
		}

		this.root = node;
	}

	insert(item) {
		if (item instanceof Array) {
			for (let i = 0; i < item.length; i++) {
				this.root.insert(item[i]);
			}
		} else {
			this.root.insert(item);
		}
	}

	query(bounds) {
		return this.root.query(bounds);
	}

	clear() {
		this.root.clear();
	}
}

class Node {
	constructor(bounds, depth = 0, maxDepth = 4, maxCapacity = 4) {
		// bounds of the canvas
		this.bounds = bounds;

		// max capacity per container befor splitting
		this.maxCapacity = maxCapacity;

		// Up to how many levels to split the quadtree
		this.maxDepth = maxDepth;

		// Current depth of the node
		this.depth = depth;

		// Array of children bodies on canvas
		this.children = [];
		// Array of children of node objects caused by this.split()
		this.nodes = [];

		this.TL = 0;
		this.TR = 1;
		this.BL = 2;
		this.BR = 3;

		this.drawQuery = true;
		this.queryBounds = {};
	}

	query(coordinates) {
		this.queryBounds = coordinates;

		// Will return an array regardless of level of quadtree
		let bodies = this.children;
		const indexes = this.getIndexes(coordinates);

		// If there are child nodes, query them as well (will get plenty duplicate bodies)
		if (this.nodes.length) {
			for (const index of indexes) {
				bodies = bodies.concat(this.nodes[index].query(coordinates));
			}
		}

		// filter out duplicates

		bodies = bodies.filter((item, index) => {
			return bodies.indexOf(item) >= index;
		});

		return bodies;
	}

	insert(item) {
		// ? If there are child nodes, skip to adding item to them

		let indexes = this.getIndexes(item);

		if (this.nodes.length) {
			for (const index of indexes) {
				this.nodes[index].insert(item);
			}
			return;
		}

		// Once deepest node is reached (or if none exist), add item to current node
		// Add item to root node
		this.children.push(item);

		// Execute if after adding item, the exceeds maxChildren and is within depth limit
		if (
			this.depth < this.maxDepth &&
			this.children.length > this.maxCapacity
		) {
			// Split node
			this.split();

			// redistribute children to nodes
			for (let i = 0; i < this.children.length; i++) {
				this.insert(this.children[i]);
			}

			// Clear children of current node after children nodes are populated so we don't have duplicates in tree (only child nodes contain bodies)
			this.children = [];
		}
	}

	getItemCorners(item) {
		const x = item.x || 0;
		const y = item.y || 0;
		const width = item.width;
		const height = item.height;

		const corners = [{ x, y }];

		if (width && height) {
			corners.push(
				{ x: x + width, y },
				{ x, y: y + height },
				{
					x: x + width,
					y: y + height,
				}
			);
		}

		return corners;
	}

	getIndexes(item) {
		const indexes = [];
		const corners = this.getItemCorners(item);

		for (let i = 0; i < corners.length; i++) {
			indexes.push(this.getQuadrant(corners[i]));
		}

		return new Set(indexes);
	}

	getQuadrant(item) {
		const bounds = this.bounds;

		const horizontalMidpoint = bounds.y + bounds.height / 2;
		const verticalMidpoint = bounds.x + bounds.width / 2;

		const TB = item.y > horizontalMidpoint ? 'B' : 'T';
		const LR = item.x > verticalMidpoint ? 'R' : 'L';

		let index = this[`${TB}${LR}`];

		return index;
	}

	split() {
		const depth = this.depth + 1;

		// Origin of current Node (original node has 0,0)
		let originX = this.bounds.x;
		let originY = this.bounds.y;

		// Split current node halfway horizontally and vertically
		let halfWidth = Math.floor(this.bounds.width / 2);
		let halfHeight = Math.floor(this.bounds.height / 2);

		// Place on canvas (origin + halfLengths)
		const halfWidthCoord = originX + halfWidth;
		const halfHeightCoord = originY + halfHeight;

		// ? Why so many location variables?
		// Rectangles take an x, y coordinate and a width and height
		// Coordinate variables are for x and y values
		// halfLengths are for width and height values (distance from each origin)

		this.nodes[this.TL] = new Node(
			{ x: originX, y: originY, width: halfWidth, height: halfHeight },
			depth,
			this.maxDepth,
			this.maxCapacity
		);
		this.nodes[this.TR] = new Node(
			{
				x: halfWidthCoord,
				y: originY,
				width: halfWidth,
				height: halfHeight,
			},
			depth,
			this.maxDepth,
			this.maxCapacity
		);
		this.nodes[this.BL] = new Node(
			{
				x: originX,
				y: halfHeightCoord,
				width: halfWidth,
				height: halfHeight,
			},
			depth,
			this.maxDepth,
			this.maxCapacity
		);
		this.nodes[this.BR] = new Node(
			{
				x: halfWidthCoord,
				y: halfHeightCoord,
				width: halfWidth,
				height: halfHeight,
			},
			depth,
			this.maxDepth,
			this.maxCapacity
		);
	}

	draw(ctx) {
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#ff00ff';

		ctx.strokeRect(
			this.bounds.x,
			this.bounds.y,
			this.bounds.width,
			this.bounds.height
		);

		if (this.drawQuery) {
			ctx.strokeStyle = '#00ff00';
			ctx.strokeRect(
				this.queryBounds.x,
				this.queryBounds.y,
				this.queryBounds.width,
				this.queryBounds.height
			);
		}

		if (this.nodes.length > 0) {
			for (let i = 0; i < this.nodes.length; i++) {
				this.nodes[i].draw(ctx);
			}
		}

		ctx.stroke();
	}

	clear() {
		this.children = [];
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].clear();
		}
	}
}

class BoundedNode extends Node {
	constructor(bounds, depth, maxDepth = 4, maxCapacity = 4) {
		super(bounds, depth, maxDepth, maxCapacity);
	}
}
