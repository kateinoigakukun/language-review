/// <reference path="../../typings/atom/atom.d.ts" />

/// <reference path="../../node_modules/review.js/dist/review.js.d.ts" />

import _atom = require("atom");

var $$ = _atom.$$;

import ReVIEW = require("review.js");

// import V = require("../util/const");
import logger = require("../util/logger");
import ReVIEWRunner = require("../util/review-runner");

class ReVIEWOutlineView extends _atom.SelectListView {
	static activate() {
		new ReVIEWOutlineView();
	}

	constructor() {
		super();
		this.jq.addClass("review-outline overlay from-top");
	}

	get jq():JQuery {
		// dirty hack
		return <any>this;
	}

	getFilterKey() {
		return "labelName";
	}

	toggle() {
		if (this.jq.hasParent()) {
			this.cancel();
		} else {
			this.attach();
		}
	}

	attach() {
		this.storeFocusedElement();

		var symbols:ReVIEW.ISymbol[] = [];

		let editor = atom.workspace.getActiveEditor();
		let runner = new ReVIEWRunner({ editor: editor });
		runner.on("report", reports => {
			logger.log("Re:VIEW linter ReVIEWRunner compile");
			if (runner.lastSymbols) {
				let symbols = runner.lastSymbols.filter(symbol => symbol.symbolName === "hd");
				this.setItems(symbols);
			} else {
				logger.log("not compiled...");
				atom.beep();
			}
		});
		runner.doCompile();

		(<any>atom.workspaceView).append(this.jq);
		this.focusFilterEditor();
	}

	viewForItem(symbol:ReVIEW.ISymbol):JQuery {
		var repeatString = (times:number, str:string, result = ""):string => {
			if (times === 0) {
				return result;
			} else {
				return repeatString(times - 1, str, result + str);
			}
		};

		var header:ReVIEW.Parse.HeadlineSyntaxTree = <any>symbol.node;
		var prefix = repeatString(header.level, "=");
		var text = prefix + " " + symbol.labelName;

		return $$(function () {
			// this eq View(class)
			this.li(()=> {
				this.span(text);
			});
		});
	}

	confirmed(symbol:ReVIEW.ISymbol) {
		// onSelected的な
		this.cancel();
		// emit したい…
		var view:any = atom.workspaceView.getActiveView();
		if (!view || typeof view.getEditor !== "function") {
			atom.beep();
			return;
		}
		var editor:AtomCore.IEditor = view.getEditor();
		var point = _atom.Point.fromObject({row: symbol.node.line - 1, column: 0});
		editor.setCursorScreenPosition(point);
	}
}

export = ReVIEWOutlineView;
