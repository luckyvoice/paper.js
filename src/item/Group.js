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
 * @name Group
 *
 * @class A Group is a collection of items. When you transform a Group, its
 * children are treated as a single unit without changing their relative
 * positions.
 *
 * @extends Item
 */
var Group = this.Group = Item.extend(/** @lends Group# */{
	// DOCS: document new Group(item, item...);
	/**
	 * Creates a new Group item and places it at the top of the active layer.
	 *
	 * @param {Item[]} [children] An array of children that will be added to the
	 * newly created group.
	 *
	 * @example {@paperscript split=true height=200}
	 * // Create a group containing two paths:
	 * var path = new Path(new Point(100, 100), new Point(100, 200));
	 * var path2 = new Path(new Point(50, 150), new Point(150, 150));
	 *
	 * // Create a group from the two paths:
	 * var group = new Group([path, path2]);
	 *
	 * // Set the stroke color of all items in the group:
	 * group.strokeColor = 'black';
	 *
	 * // Move the group to the center of the view:
	 * group.position = view.center;
	 *
	 * @example {@paperscript split=true height=320}
	 * // Click in the view to add a path to the group, which in turn is rotated
	 * // every frame:
	 * var group = new Group();
	 *
	 * function onMouseDown(event) {
	 * 	// Create a new circle shaped path at the position
	 * 	// of the mouse:
	 * 	var path = new Path.Circle(event.point, 5);
	 * 	path.fillColor = 'black';
	 *
	 * 	// Add the path to the group's children list:
	 * 	group.addChild(path);
	 * }
	 *
	 * function onFrame(event) {
	 * 	// Rotate the group by 1 degree from
	 * 	// the centerpoint of the view:
	 * 	group.rotate(1, view.center);
	 * }
	 */
	initialize: function(items) {
		this.base();
		this._clippingCompositionOperation = 'source-in';
		// Allow Group to have children and named children
		this._children = [];
		this._namedChildren = {};
		this.addChildren(!items || !Array.isArray(items)
				|| typeof items[0] !== 'object' ? arguments : items);
	},

	_changed: function(flags) {
		// Don't use base() for reasons of performance.
		Item.prototype._changed.call(this, flags);
		if (flags & (ChangeFlag.HIERARCHY | ChangeFlag.CLIPPING)) {
			// Clear cached clip items whenever hierarchy changes
			delete this._clipItems;
		}
	},

	_getClipItems: function() {
		// Only re-calculate if _clipItems is undefined (if there are no items this will
		// instead be an empty array)
		if (this._clipItems === undefined){
			this._clipItems = [];
			for (var i = 0, l = this._children.length; i < l; i++) {
				var child = this._children[i];
				if (child._clipMask)
					this._clipItems.push(child);
			}
		}
		return this._clipItems;
	},

	/**
	 * Specifies whether the group item is to be clipped.
	 * When setting to {@code true}, the first child in the group is
	 * automatically defined as the clipping mask.
	 *
	 * @type Boolean
	 * @bean
	 */
	isClipped: function() {
		return this._getClipItems().length !== 0;
	},

	setClipped: function(clipped) {
		var child = this.getFirstChild();
		if (child)
			child.setClipMask(clipped);
		return this;
	}
}, new function(){
	var context = null;
	
	return {
		draw: function(ctx, param) {
		    var bounds, clipItems, context, item, originalCtx, _i, _j, _len, _len2, _ref;
		    clipItems = this._getClipItems();
		    // If the group is to be clipped, draw to an in-memory canvas
		    if (clipItems.length !== 0) {
		        originalCtx = ctx;
		        bounds = this.getBounds();
		        if (!context) {
		            ctx = context = CanvasProvider.getCanvas(bounds.getSize()).getContext('2d');
		        } else {
		            ctx = context;
		        }
		        ctx.save();
		        // Draw the items which form the mask
		        ctx.translate(-bounds.x, -bounds.y);
		        for (_i = 0, _len = clipItems.length; _i < _len; _i++) {
		            item = clipItems[_i];
		            Item.draw(item, ctx, param);
		        }
		        // Clip
		        ctx.globalCompositeOperation = this._clippingCompositionOperation;
		    }
		    // Draw the regular items
		    _ref = this._children;
		    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
		        item = _ref[_j];
		        if (!item._clipMark) Item.draw(item, ctx, param);
		    }
		    // Draw the clipped items back to the original canvas
		    if (clipItems.length !== 0) {
		        originalCtx.drawImage(ctx.canvas, bounds.x, bounds.y);
		        ctx.restore();
		        return ctx.clearRect(0, 0, ctx.canvas.width + 1, ctx.canvas.height + 1);
		    }
		}
	}
});
