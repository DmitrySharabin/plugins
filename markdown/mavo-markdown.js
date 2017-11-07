(function($, $$) {

Mavo.Plugins.register("markdown", {
	ready: $.include(self.showdown, "https://cdnjs.cloudflare.com/ajax/libs/showdown/1.6.4/showdown.min.js"),
	init: function() {
		showdown.setFlavor("github");
		self.Showdown = new showdown.Converter();
	},
	hooks: {
		"init-start": function() {
			// Disable expressions on Markdown properties, before expressions are parsed
			var selector = Mavo.selectors.and(Mavo.selectors.primitive, ".markdown");

			for (var element of $$(selector, this.element)) {
				element.setAttribute("mv-expressions", element.getAttribute("mv-expressions") || "none");
			}
		}
	}
});

Mavo.Elements.register("markdown", {
	default: true,
	selector: ".markdown",
	init: function() {
		this.element.setAttribute("mv-expressions", "none");

		requestAnimationFrame(function() {
			this.done();
		}.bind(this));
	},
	editor: function() {
		var editor = $.create("textarea");

		var width = this.element.offsetWidth;

		if (width) {
			editor.width = width;
		}

		return editor;
	},
	done: function() {
		this.element.innerHTML = Showdown.makeHtml(this.value);
		$.fire(this.element, "mv-markdown-render");
	},
	setValue: function(element, value) {
		if (this.editor) {
			this.editor.value = value;
		}
		else {
			this.element.innerHTML = Showdown.makeHtml(value);
			$.fire(this.element, "mv-markdown-render");
		}
	},
	// We don't need an observer and it actually causes problems as it tries to feed HTML changes back to MD
	observer: false
});

Mavo.Formats.Markdown = $.Class({
	extends: Mavo.Formats.Base,
	constructor: function(backend) {
		this.property = this.mavo.root.getNames("Primitive")[0];
		var primitive = this.mavo.root.children[this.property];
		primitive.config = Mavo.Elements.markdown;
		primitive.observer.destroy();
	},

	static: {
		extensions: [".md", ".markdown"],
		parse: Mavo.Formats.Text.parse,
		stringify: Mavo.Formats.Text.stringify
	}
});

})(Bliss, Bliss.$);
