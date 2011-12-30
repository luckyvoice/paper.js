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
 * @name CharacterStyle
 *
 * @class The CharacterStyle object represents the character style of a text
 * item ({@link TextItem#characterStyle})
 *
 * @extends PathStyle
 *
 * @classexample
 * var text = new PointText(new Point(50, 50));
 * text.content = 'Hello world.';
 * text.characterStyle = {
 * 	fontSize: 50,
 * 	fillColor: 'black',
 * };
 */
// Note that CharacterStyle extends PathStyle and thus injects the same
// accessors into its _owner TextItem, overriding those previously defined by
// PathStyle for Item. It is also returned from TextItem#getStyle instead of
// PathStyle. TextItem#characterStyle is now simply a pointer to #style.
var CharacterStyle = this.CharacterStyle = PathStyle.extend(/** @lends CharacterStyle# */{
	_owner: TextItem,
	_style: 'style',
	_defaults: Base.merge(PathStyle.prototype._defaults, {
		// Override default fillColor of CharacterStyle
		fillColor: 'black',
		fontSize: 12,
        fontWeight: 'normal',
		leading: null,
		font: 'sans-serif'
	}),
	_flags: {
		fontSize: Change.GEOMETRY,
		leading: Change.GEOMETRY,
		font: Change.GEOMETRY
	}

	/**
	 * CharacterStyle objects don't need to be created directly. Just pass an
	 * object to {@link TextItem#characterStyle}, it will be converted to a
	 * CharacterStyle object internally.
	 *
	 * @name CharacterStyle#initialize
	 * @param {object} style
	 */

	/**
	 * The font of the character style.
	 *
	 * @name CharacterStyle#font
	 * @default 'sans-serif'
	 * @type String
	 */

	/**
	 * The font size of the character style in points.
	 *
	 * @name CharacterStyle#fontSize
	 * @default 10
	 * @type Number
	 */
}, {
	getLeading: function() {
		// Override leading to return fontSize * 1.2 by default, when undefined
		var leading = this.base();
		return leading != null ? leading : this.getFontSize() * 1.2;
	},

	getFontStyle: function() {
		return this._fontSize + 'px ' + this._font;
	}
});
