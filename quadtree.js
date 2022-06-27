class QuadTree {
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

	clear() {
		this.root.clear();
	}
}

class Node {
	constructor(bounds, depth, maxDepth = 4, maxCapacity = 4) {
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
	}

	insert(item) {
		// ? If there are child nodes, skip to adding item to them

		let index = this.getIndex(item);
		if (this.nodes.length) {
			this.nodes[index].insert(item);
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

	// ? What is this function doing?
	getIndex(item) {
		const bounds = this.bounds;

		const LR = item.x > bounds.x + bounds.width / 2 ? 'R' : 'L';
		const TB = item.y > bounds.y + bounds.height / 2 ? 'B' : 'T';

		// Set default node to Top Left
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
		ctx.strokeStyle = '#ff00ff';
		ctx.strokeWidth = 15;
		ctx.strokeRect(
			this.bounds.x,
			this.bounds.y,
			this.bounds.width,
			this.bounds.height
		);

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

class BoundedNode {}
