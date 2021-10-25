//
// Helpers
//
function $(selector, context) {
	return (context || document).querySelector(selector);
}

function $All(selector, context) {
	var arr = [];
	arr.push.apply(arr, (context || document).querySelectorAll(selector));
	return arr;
}



//
// forEach Polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
//
if (window.NodeList && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = function (callback, thisArg) {
		thisArg = thisArg || window;
		for (var i = 0; i < this.length; i++) {
			callback.call(thisArg, this[i], i, this);
		}
	};
}



//
// Element.closest() Polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
//
if (!Element.prototype.matches) {
	Element.prototype.matches =
	Element.prototype.msMatchesSelector ||
	Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
	var el = this;

	do {
		if (Element.prototype.matches.call(el, s)) return el;
		el = el.parentElement || el.parentNode;
	} while (el !== null && el.nodeType === 1);
	return null;
	};
}



//
// Element.remove() Polyfill
// https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
//
(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('remove')) {
			return;
		}
		Object.defineProperty(item, 'remove', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function remove() {
			if (this.parentNode !== null)
				this.parentNode.removeChild(this);
			}
		});
	});
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);



//
// Get CSS Breakpoints Value
//
var breakpoint = {};
breakpoint.refreshValue = function () {
	this.value = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
};
window.addEventListener('resize', function(){
	breakpoint.refreshValue();
});
breakpoint.refreshValue();



//
// IE detection
// returns version of IE or false, if browser is not Internet Explorer
//
function detectIE() {
	var ua = window.navigator.userAgent;

	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
		// IE 10 or older => return version number
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	}

	var trident = ua.indexOf('Trident/');
	if (trident > 0) {
		// IE 11 => return version number
		var rv = ua.indexOf('rv:');
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	}

	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
		// Edge (IE 12+) => return version number
		return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	}

	// other browser
	return false;
}

if (detectIE() != false){
	if( detectIE() == 16 ) {
		document.documentElement.classList.add('msie edge-16');
	}
	else if( detectIE() >= 17 ) {
		document.documentElement.classList.add('no-msie edge-17+');
	}
	else {
		document.documentElement.classList.add('msie');
	}
} else{
	document.documentElement.classList.add('no-msie');
}



//
// Remove .no-js class from html element if javascript is enabled
//
document.documentElement.className = document.documentElement.className.replace('no-js','js');



//
// Test for touchevent support and if not supported, attach .no-touch class to the HTML tag.
// https://www.prowebdesign.ro/how-to-deal-with-hover-on-touch-screen-devices/
//
if (!('ontouchstart' in document.documentElement)) {
	document.documentElement.className += ' no-touch';
}



//
// SVG Bugfix for IE 11
//
const svgItems = $All('.image__item svg');

function fixSvgSize(el) {
	const elAttrWidth  = el.getAttribute('width');
	const elAttrHeight = el.getAttribute('height');
	const elAttrRation = elAttrHeight / elAttrWidth;
	const elWidth  = el.getBoundingClientRect().width;
	const newHeight = Math.round(elWidth * elAttrRation) + 'px';
	el.style.height = newHeight;
}

if(document.documentElement.classList.contains('msie') && svgItems.length > 0) {
	svgItems.forEach(function(el){
		fixSvgSize(el);
	});

	window.addEventListener('resize', function(){
		svgItems.forEach(function(el){
			fixSvgSize(el);
		});
	});
}
