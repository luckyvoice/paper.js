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
	initialize: function(pointOrMatrix) {
		this.base(pointOrMatrix);
		this._point = this._matrix.getTranslation();
	},

	clone: function() {
		return this._clone(new PointText(this._matrix));
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

	_transform: function(matrix) {
		// Transform _point:
		matrix._transformPoint(this._point, this._point);
	},

	draw: function(ctx) {
		if (!this._content)
			return;
		this._setStyles(ctx);
		var style = this._style,
			leading = this.getLeading(),
			lines = this._lines;
		ctx.save();
		ctx.font = style.getFontStyle();
		ctx.textAlign = this.getJustification();
		ctx.textBaseline = 'top';
		for (var i = 0, l = lines.length; i < l; i++) {
			var line = lines[i];
			if (style._fillColor)
				ctx.fillText(line, 0, 0);
			if (style._strokeColor)
				ctx.strokeText(line, 0, 0);
			ctx.translate(0, leading);
		}
		ctx.restore();
	}
}, new function() {
	var context = null;

	return {
		_getBounds: function(type, matrix) {
			if (!this._lines.length) return Rectangle.create(0, 0, 0, 0);
			// Create an in-memory canvas on which to do the measuring
			if (!context)
				context = CanvasProvider.getCanvas(
						Size.create(1, 1)).getContext('2d');
			var justification = this.getJustification(),
				x = 0;
			// Measure the real width of the text. Unfortunately, there is no
			// sane way to measure text height with canvas
			context.font = this._style.getFontStyle();
			var width = 0;
			for (var i = 0, l = this._lines.length; i < l; i++)
				width = Math.max(width, context.measureText(
					this._lines[i]).width);
			// Adjust for different justifications
			if (justification !== 'left')
				x -= width / (justification === 'center' ? 2: 1);
			var bounds = Rectangle.create(
					x,
					0,
					width,
					// Since we don't know the em height, and have no reasonable way of figuring it out, we have to
					// make the assumption that the text is a third larger than it should be (a reasonable assumption,
					// all things considered)
					this._lines.length * this.getLeading() * 1.3
				);
			return matrix ? matrix._transformBounds(bounds, bounds) : bounds;
		}
	};
});
