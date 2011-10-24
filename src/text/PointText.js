/*
 * Paper.js
 *
 * This file is part of Paper.js, a JavaScript Vector Graphics Library,
 * based on Scriptographer.org and designed to be largely API compatible.
 * http://paperjs.org/
 * http://scriptographer.org/
 *
 * Copyright (c) 2011, Juerg Lehni & Jonathan Puckey
 * http://lehni.org/ & http://jonathanpuckey.com/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

/**
 * @name PointText
 *
 * @class A PointText item represents a piece of typography in your Paper.js
 * project which starts from a certain point and extends by the amount of
 * characters contained in it.
 *
 * @extends TextItem
 */
var PointText = this.PointText = TextItem.extend(/** @lends PointText# */{
	/**
	 * Creates a point text item
	 *
	 * @param {Point} point the position where the text will start
	 *
	 * @example
	 * var text = new PointText(new Point(50, 100));
	 * text.justification = 'center';
	 * text.fillColor = 'black';
	 * text.content = 'The contents of the point text';
	 */
	initialize: function(point) {
		this.base();
		this._point = Point.read(arguments).clone();
		this._matrix = new Matrix().translate(this._point);
	},

	clone: function() {
		var copy = this._clone(new PointText(this._point));
		// Use Matrix#initialize to easily copy over values.
		copy._matrix.initialize(this._matrix);
		return copy;
	},

	/**
	 * The PointText's anchor point
	 *
	 * @type Point
	 * @bean
	 */
	getPoint: function() {
		// Se Item#getPosition for an explanation why we create new LinkedPoint
		// objects each time.
		return LinkedPoint.create(this, 'setPoint',
				this._point.x, this._point.y);
	},

	setPoint: function(point) {
		this.translate(Point.read(arguments).subtract(this._point));
	},

	// TODO: Position should be the center point of the bounds but we currently
	// don't support bounds for PointText, so let's return the same as #point
	// for the time being.
	getPosition: function() {
		return this.getPoint();
	},

	setPosition: function(point) {
		this.setPoint.apply(this, arguments);
	},
	
	_getBounds: function(getter, cacheName, args){
		if (!this._content){
			return new Rectangle();
		}
		// Create an in-memory canvas on which to do the measuring
		var x = this._point.x,
		    y = this._point.y,
		    canvas = this.project._scope.view.canvas,
		    ctx = canvas.getContext('2d'),
		    justification = this.getJustification();
		// Measure the real width of the text, but the height still must be undefined
		// (since there is no sane way to measure text height with canvas)
		ctx.save();
		ctx.font = this._getFontString();
		this._matrix.applyToContext(ctx);
		var width = ctx.measureText(this._content).width;
		// Adjust for different justifications
		if (justification === 'right') {
			x = Math.round(x - width);
		} else if (justification === 'center') {
			x = Math.round(x - (width / 2));
		}
		var bounds = Rectangle.create(x, y, width, undefined);
		ctx.restore();
		return getter == 'getBounds' ? this._createBounds(bounds) : bounds;
	},

	_transform: function(matrix, flags) {
		this._matrix.preConcatenate(matrix);
		// Also transform _point:
		matrix._transformPoint(this._point, this._point);
	},

	draw: function(ctx) {
		if (!this._content)
			return;
		ctx.save();
		ctx.font = this._getFontString();
		ctx.textAlign = this.getJustification();
		ctx.textBaseline = 'middle';
		this._matrix.applyToContext(ctx);

		var fillColor = this.getFillColor();
		var strokeColor = this.getStrokeColor();
		if (!fillColor || !strokeColor)
			ctx.globalAlpha = this._opacity;
		if (fillColor) {
			ctx.fillStyle = fillColor.getCanvasStyle(ctx);
			ctx.fillText(this._content, 0, 0);
		}
		if (strokeColor) {
			ctx.strokeStyle = strokeColor.getCanvasStyle(ctx);
			ctx.strokeText(this._content, 0, 0);
		}
		ctx.restore();
	}
});
