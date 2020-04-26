jQuery(function() {
	initCarousel();
	initMobileNav();
	initAnchors();
	initDropDownClasses();
});


// scroll gallery init
function initCarousel() {
	jQuery('.carousel').scrollGallery({
		mask: '.mask',
		slider: '.slideset',
		slides: '.slide',
		stretchSlideToMask: true
	});
}

// mobile menu init
function initMobileNav() {
	jQuery('body').mobileNav({
		menuActiveClass: 'nav-active',
		menuOpener: '.nav-trigger'
	});
}

// initialize smooth anchor links
function initAnchors() {
	new SmoothScroll({
		anchorLinks: 'a[href^="#"]:not([href="#"])',
		extraOffset: 0,
		wheelBehavior: 'none'
	});
}

// add classes if item has dropdown
function initDropDownClasses() {
	jQuery('#nav li').each(function() {
		var item = jQuery(this);
		var drop = item.find('ul');
		var link = item.find('a').eq(0);
		if (drop.length) {
			item.addClass('has-drop-down');
			if (link.length) link.addClass('has-drop-down-a');
		}
	});
}


/*

 * jQuery Carousel plugin

 */

;(function($) {

	'use strict';

	// detect device type

	var isTouchDevice = /Windows Phone/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;



	function ScrollGallery(options) {

		this.options = $.extend({

			mask: 'div.mask',

			slider: '>*',

			slides: '>*',

			activeClass: 'active',

			disabledClass: 'disabled',

			btnPrev: 'a.btn-prev',

			btnNext: 'a.btn-next',

			generatePagination: false,

			pagerList: '<ul>',

			pagerListItem: '<li><a href="#"></a></li>',

			pagerListItemText: 'a',

			pagerLinks: '.pagination li',

			currentNumber: 'span.current-num',

			totalNumber: 'span.total-num',

			btnPlay: '.btn-play',

			btnPause: '.btn-pause',

			btnPlayPause: '.btn-play-pause',

			galleryReadyClass: 'gallery-js-ready',

			autorotationActiveClass: 'autorotation-active',

			autorotationDisabledClass: 'autorotation-disabled',

			stretchSlideToMask: false,

			circularRotation: true,

			disableWhileAnimating: false,

			autoRotation: false,

			pauseOnHover: isTouchDevice ? false : true,

			maskAutoSize: false,

			switchTime: 4000,

			animSpeed: 600,

			event: 'click',

			swipeThreshold: 15,

			handleTouch: true,

			vertical: false,

			useTranslate3D: false,

			step: false

		}, options);

		this.init();

	}

	ScrollGallery.prototype = {

		init: function() {

			if (this.options.holder) {

				this.findElements();

				this.attachEvents();

				this.refreshPosition();

				this.refreshState(true);

				this.resumeRotation();

				this.makeCallback('onInit', this);

			}

		},

		findElements: function() {

			// define dimensions proporties

			this.fullSizeFunction = this.options.vertical ? 'outerHeight' : 'outerWidth';

			this.innerSizeFunction = this.options.vertical ? 'height' : 'width';

			this.slideSizeFunction = 'outerHeight';

			this.maskSizeProperty = 'height';

			this.animProperty = this.options.vertical ? 'marginTop' : 'marginLeft';



			// control elements

			this.gallery = $(this.options.holder).addClass(this.options.galleryReadyClass);

			this.mask = this.gallery.find(this.options.mask);

			this.slider = this.mask.find(this.options.slider);

			this.slides = this.slider.find(this.options.slides);

			this.btnPrev = this.gallery.find(this.options.btnPrev);

			this.btnNext = this.gallery.find(this.options.btnNext);

			this.currentStep = 0;

			this.stepsCount = 0;



			// get start index

			if (this.options.step === false) {

				var activeSlide = this.slides.filter('.' + this.options.activeClass);

				if (activeSlide.length) {

					this.currentStep = this.slides.index(activeSlide);

				}

			}



			// calculate offsets

			this.calculateOffsets();



			// create gallery pagination

			if (typeof this.options.generatePagination === 'string') {

				this.pagerLinks = $();

				this.buildPagination();

			} else {

				this.pagerLinks = this.gallery.find(this.options.pagerLinks);

				this.attachPaginationEvents();

			}



			// autorotation control buttons

			this.btnPlay = this.gallery.find(this.options.btnPlay);

			this.btnPause = this.gallery.find(this.options.btnPause);

			this.btnPlayPause = this.gallery.find(this.options.btnPlayPause);



			// misc elements

			this.curNum = this.gallery.find(this.options.currentNumber);

			this.allNum = this.gallery.find(this.options.totalNumber);

			this.isInit = true;

		},

		attachEvents: function() {

			// bind handlers scope

			var self = this;

			this.bindHandlers(['onWindowResize']);

			$(window).bind('load resize orientationchange', this.onWindowResize);



			// previous and next button handlers

			if (this.btnPrev.length) {

				this.prevSlideHandler = function(e) {

					e.preventDefault();

					self.prevSlide();

				};

				this.btnPrev.bind(this.options.event, this.prevSlideHandler);

			}

			if (this.btnNext.length) {

				this.nextSlideHandler = function(e) {

					e.preventDefault();

					self.nextSlide();

				};

				this.btnNext.bind(this.options.event, this.nextSlideHandler);

			}



			// pause on hover handling

			if (this.options.pauseOnHover && !isTouchDevice) {

				this.hoverHandler = function() {

					if (self.options.autoRotation) {

						self.galleryHover = true;

						self.pauseRotation();

					}

				};

				this.leaveHandler = function() {

					if (self.options.autoRotation) {

						self.galleryHover = false;

						self.resumeRotation();

					}

				};

				this.gallery.bind({

					mouseenter: this.hoverHandler,

					mouseleave: this.leaveHandler

				});

			}



			// autorotation buttons handler

			if (this.btnPlay.length) {

				this.btnPlayHandler = function(e) {

					e.preventDefault();

					self.startRotation();

				};

				this.btnPlay.bind(this.options.event, this.btnPlayHandler);

			}

			if (this.btnPause.length) {

				this.btnPauseHandler = function(e) {

					e.preventDefault();

					self.stopRotation();

				};

				this.btnPause.bind(this.options.event, this.btnPauseHandler);

			}

			if (this.btnPlayPause.length) {

				this.btnPlayPauseHandler = function(e) {

					e.preventDefault();

					if (!self.gallery.hasClass(self.options.autorotationActiveClass)) {

						self.startRotation();

					} else {

						self.stopRotation();

					}

				};

				this.btnPlayPause.bind(this.options.event, this.btnPlayPauseHandler);

			}



			// enable hardware acceleration

			if (isTouchDevice && this.options.useTranslate3D) {

				this.slider.css({

					'-webkit-transform': 'translate3d(0px, 0px, 0px)'

				});

			}



			// swipe event handling

			if (isTouchDevice && this.options.handleTouch && window.Hammer && this.mask.length) {

				this.swipeHandler = new Hammer.Manager(this.mask[0]);

				this.swipeHandler.add(new Hammer.Pan({

					direction: self.options.vertical ? Hammer.DIRECTION_VERTICAL : Hammer.DIRECTION_HORIZONTAL,

					threshold: self.options.swipeThreshold

				}));



				this.swipeHandler.on('panstart', function() {

					if (self.galleryAnimating) {

						self.swipeHandler.stop();

					} else {

						self.pauseRotation();

						self.originalOffset = parseFloat(self.slider.css(self.animProperty));

					}

				}).on('panmove', function(e) {

					var tmpOffset = self.originalOffset + e[self.options.vertical ? 'deltaY' : 'deltaX'];

					tmpOffset = Math.max(Math.min(0, tmpOffset), self.maxOffset);

					self.slider.css(self.animProperty, tmpOffset);

				}).on('panend', function(e) {

					self.resumeRotation();

					if (e.distance > self.options.swipeThreshold) {

						if (e.offsetDirection === Hammer.DIRECTION_RIGHT || e.offsetDirection === Hammer.DIRECTION_DOWN) {

							self.prevSlide();

						} else {

							self.nextSlide();

						}

					} else {

						self.switchSlide();

					}

				});

			}

		},

		onWindowResize: function() {

			if (!this.isInit) return;

			if (!this.galleryAnimating) {

				this.calculateOffsets();

				this.refreshPosition();

				this.buildPagination();

				this.refreshState();

				this.resizeQueue = false;

			} else {

				this.resizeQueue = true;

			}

		},

		refreshPosition: function() {

			this.currentStep = Math.min(this.currentStep, this.stepsCount - 1);

			this.tmpProps = {};

			this.tmpProps[this.animProperty] = this.getStepOffset();

			this.slider.stop().css(this.tmpProps);

		},

		calculateOffsets: function() {

			var self = this,

				tmpOffset, tmpStep;

			if (this.options.stretchSlideToMask) {

				var tmpObj = {};

				tmpObj[this.innerSizeFunction] = this.mask[this.innerSizeFunction]();

				this.slides.css(tmpObj);

			}



			this.maskSize = this.mask[this.innerSizeFunction]();

			this.sumSize = this.getSumSize();

			this.maxOffset = this.maskSize - this.sumSize;



			// vertical gallery with single size step custom behavior

			if (this.options.vertical && this.options.maskAutoSize) {

				this.options.step = 1;

				this.stepsCount = this.slides.length;

				this.stepOffsets = [0];

				tmpOffset = 0;

				for (var i = 0; i < this.slides.length; i++) {

					tmpOffset -= $(this.slides[i])[this.fullSizeFunction](true);

					this.stepOffsets.push(tmpOffset);

				}

				this.maxOffset = tmpOffset;

				return;

			}



			// scroll by slide size

			if (typeof this.options.step === 'number' && this.options.step > 0) {

				this.slideDimensions = [];

				this.slides.each($.proxy(function(ind, obj) {

					self.slideDimensions.push($(obj)[self.fullSizeFunction](true));

				}, this));



				// calculate steps count

				this.stepOffsets = [0];

				this.stepsCount = 1;

				tmpOffset = tmpStep = 0;

				while (tmpOffset > this.maxOffset) {

					tmpOffset -= this.getSlideSize(tmpStep, tmpStep + this.options.step);

					tmpStep += this.options.step;

					this.stepOffsets.push(Math.max(tmpOffset, this.maxOffset));

					this.stepsCount++;

				}

			}

			// scroll by mask size

			else {

				// define step size

				this.stepSize = this.maskSize;



				// calculate steps count

				this.stepsCount = 1;

				tmpOffset = 0;

				while (tmpOffset > this.maxOffset) {

					tmpOffset -= this.stepSize;

					this.stepsCount++;

				}

			}

		},

		getSumSize: function() {

			var sum = 0;

			this.slides.each($.proxy(function(ind, obj) {

				sum += $(obj)[this.fullSizeFunction](true);

			}, this));

			this.slider.css(this.innerSizeFunction, sum);

			return sum;

		},

		getStepOffset: function(step) {

			step = step || this.currentStep;

			if (typeof this.options.step === 'number') {

				return this.stepOffsets[this.currentStep];

			} else {

				return Math.min(0, Math.max(-this.currentStep * this.stepSize, this.maxOffset));

			}

		},

		getSlideSize: function(i1, i2) {

			var sum = 0;

			for (var i = i1; i < Math.min(i2, this.slideDimensions.length); i++) {

				sum += this.slideDimensions[i];

			}

			return sum;

		},

		buildPagination: function() {

			if (typeof this.options.generatePagination === 'string') {

				if (!this.pagerHolder) {

					this.pagerHolder = this.gallery.find(this.options.generatePagination);

				}

				if (this.pagerHolder.length && this.oldStepsCount != this.stepsCount) {

					this.oldStepsCount = this.stepsCount;

					this.pagerHolder.empty();

					this.pagerList = $(this.options.pagerList).appendTo(this.pagerHolder);

					for (var i = 0; i < this.stepsCount; i++) {

						$(this.options.pagerListItem).appendTo(this.pagerList).find(this.options.pagerListItemText).text(i + 1);

					}

					this.pagerLinks = this.pagerList.children();

					this.attachPaginationEvents();

				}

			}

		},

		attachPaginationEvents: function() {

			var self = this;

			this.pagerLinksHandler = function(e) {

				e.preventDefault();

				self.numSlide(self.pagerLinks.index(e.currentTarget));

			};

			this.pagerLinks.bind(this.options.event, this.pagerLinksHandler);

		},

		prevSlide: function() {

			if (!(this.options.disableWhileAnimating && this.galleryAnimating)) {

				if (this.currentStep > 0) {

					this.currentStep--;

					this.switchSlide();

				} else if (this.options.circularRotation) {

					this.currentStep = this.stepsCount - 1;

					this.switchSlide();

				}

			}

		},

		nextSlide: function(fromAutoRotation) {

			if (!(this.options.disableWhileAnimating && this.galleryAnimating)) {

				if (this.currentStep < this.stepsCount - 1) {

					this.currentStep++;

					this.switchSlide();

				} else if (this.options.circularRotation || fromAutoRotation === true) {

					this.currentStep = 0;

					this.switchSlide();

				}

			}

		},

		numSlide: function(c) {

			if (this.currentStep != c) {

				this.currentStep = c;

				this.switchSlide();

			}

		},

		switchSlide: function() {

			var self = this;

			this.galleryAnimating = true;

			this.tmpProps = {};

			this.tmpProps[this.animProperty] = this.getStepOffset();

			this.slider.stop().animate(this.tmpProps, {

				duration: this.options.animSpeed,

				complete: function() {

					// animation complete

					self.galleryAnimating = false;

					if (self.resizeQueue) {

						self.onWindowResize();

					}



					// onchange callback

					self.makeCallback('onChange', self);

					self.autoRotate();

				}

			});

			this.refreshState();



			// onchange callback

			this.makeCallback('onBeforeChange', this);

		},

		refreshState: function(initial) {

			if (this.options.step === 1 || this.stepsCount === this.slides.length) {

				this.slides.removeClass(this.options.activeClass).eq(this.currentStep).addClass(this.options.activeClass);

			}

			this.pagerLinks.removeClass(this.options.activeClass).eq(this.currentStep).addClass(this.options.activeClass);

			this.curNum.html(this.currentStep + 1);

			this.allNum.html(this.stepsCount);



			// initial refresh

			if (this.options.maskAutoSize && typeof this.options.step === 'number') {

				this.tmpProps = {};

				this.tmpProps[this.maskSizeProperty] = this.slides.eq(Math.min(this.currentStep, this.slides.length - 1))[this.slideSizeFunction](true);

				this.mask.stop()[initial ? 'css' : 'animate'](this.tmpProps);

			}



			// disabled state

			if (!this.options.circularRotation) {

				this.btnPrev.add(this.btnNext).removeClass(this.options.disabledClass);

				if (this.currentStep === 0) this.btnPrev.addClass(this.options.disabledClass);

				if (this.currentStep === this.stepsCount - 1) this.btnNext.addClass(this.options.disabledClass);

			}



			// add class if not enough slides

			this.gallery.toggleClass('not-enough-slides', this.sumSize <= this.maskSize);

		},

		startRotation: function() {

			this.options.autoRotation = true;

			this.galleryHover = false;

			this.autoRotationStopped = false;

			this.resumeRotation();

		},

		stopRotation: function() {

			this.galleryHover = true;

			this.autoRotationStopped = true;

			this.pauseRotation();

		},

		pauseRotation: function() {

			this.gallery.addClass(this.options.autorotationDisabledClass);

			this.gallery.removeClass(this.options.autorotationActiveClass);

			clearTimeout(this.timer);

		},

		resumeRotation: function() {

			if (!this.autoRotationStopped) {

				this.gallery.addClass(this.options.autorotationActiveClass);

				this.gallery.removeClass(this.options.autorotationDisabledClass);

				this.autoRotate();

			}

		},

		autoRotate: function() {

			var self = this;

			clearTimeout(this.timer);

			if (this.options.autoRotation && !this.galleryHover && !this.autoRotationStopped) {

				this.timer = setTimeout(function() {

					self.nextSlide(true);

				}, this.options.switchTime);

			} else {

				this.pauseRotation();

			}

		},

		bindHandlers: function(handlersList) {

			var self = this;

			$.each(handlersList, function(index, handler) {

				var origHandler = self[handler];

				self[handler] = function() {

					return origHandler.apply(self, arguments);

				};

			});

		},

		makeCallback: function(name) {

			if (typeof this.options[name] === 'function') {

				var args = Array.prototype.slice.call(arguments);

				args.shift();

				this.options[name].apply(this, args);

			}

		},

		destroy: function() {

			// destroy handler

			this.isInit = false;

			$(window).unbind('load resize orientationchange', this.onWindowResize);

			this.btnPrev.unbind(this.options.event, this.prevSlideHandler);

			this.btnNext.unbind(this.options.event, this.nextSlideHandler);

			this.pagerLinks.unbind(this.options.event, this.pagerLinksHandler);

			this.gallery.unbind('mouseenter', this.hoverHandler);

			this.gallery.unbind('mouseleave', this.leaveHandler);



			// autorotation buttons handlers

			this.stopRotation();

			this.btnPlay.unbind(this.options.event, this.btnPlayHandler);

			this.btnPause.unbind(this.options.event, this.btnPauseHandler);

			this.btnPlayPause.unbind(this.options.event, this.btnPlayPauseHandler);



			// destroy swipe handler

			if (this.swipeHandler) {

				this.swipeHandler.destroy();

			}



			// remove inline styles, classes and pagination

			var unneededClasses = [this.options.galleryReadyClass, this.options.autorotationActiveClass, this.options.autorotationDisabledClass];

			this.gallery.removeClass(unneededClasses.join(' ')).removeData('ScrollGallery');

			this.slider.add(this.slides).add(this.mask).removeAttr('style');

			this.slides.removeClass(this.options.activeClass);

			if (typeof this.options.generatePagination === 'string') {

				this.pagerHolder.empty();

			}

		}

	};



	// jquery plugin

	$.fn.scrollGallery = function(opt) {

		var args = Array.prototype.slice.call(arguments);

		var method = args[0];



		return this.each(function() {

			var $holder = jQuery(this);

			var instance = $holder.data('ScrollGallery');



			if (typeof opt === 'object' || typeof opt === 'undefined') {

				$holder.data('ScrollGallery', new ScrollGallery($.extend({

					holder: this

				}, opt)));

			} else if (typeof method === 'string' && instance) {

				if (typeof instance[method] === 'function') {

					args.shift();

					instance[method].apply(instance, args);

				}

			}

		});

	};

}(jQuery));

/*

 * Simple Mobile Navigation

 */

;(function($) {

	function MobileNav(options) {

		this.options = $.extend({

			container: null,

			hideOnClickOutside: false,

			menuActiveClass: 'nav-active',

			menuOpener: '.nav-opener',

			menuDrop: '.nav-drop',

			toggleEvent: 'click',

			outsideClickEvent: 'click touchstart pointerdown MSPointerDown'

		}, options);

		this.initStructure();

		this.attachEvents();

	}

	MobileNav.prototype = {

		initStructure: function() {

			this.page = $('html');

			this.container = $(this.options.container);

			this.opener = this.container.find(this.options.menuOpener);

			this.drop = this.container.find(this.options.menuDrop);

		},

		attachEvents: function() {

			var self = this;



			if(activateResizeHandler) {

				activateResizeHandler();

				activateResizeHandler = null;

			}



			this.outsideClickHandler = function(e) {

				if(self.isOpened()) {

					var target = $(e.target);

					if(!target.closest(self.opener).length && !target.closest(self.drop).length) {

						self.hide();

					}

				}

			};



			this.openerClickHandler = function(e) {

				e.preventDefault();

				self.toggle();

			};



			this.opener.on(this.options.toggleEvent, this.openerClickHandler);

		},

		isOpened: function() {

			return this.container.hasClass(this.options.menuActiveClass);

		},

		show: function() {

			this.container.addClass(this.options.menuActiveClass);

			if(this.options.hideOnClickOutside) {

				this.page.on(this.options.outsideClickEvent, this.outsideClickHandler);

			}

		},

		hide: function() {

			this.container.removeClass(this.options.menuActiveClass);

			if(this.options.hideOnClickOutside) {

				this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);

			}

		},

		toggle: function() {

			if(this.isOpened()) {

				this.hide();

			} else {

				this.show();

			}

		},

		destroy: function() {

			this.container.removeClass(this.options.menuActiveClass);

			this.opener.off(this.options.toggleEvent, this.clickHandler);

			this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);

		}

	};



	var activateResizeHandler = function() {

		var win = $(window),

			doc = $('html'),

			resizeClass = 'resize-active',

			flag, timer;

		var removeClassHandler = function() {

			flag = false;

			doc.removeClass(resizeClass);

		};

		var resizeHandler = function() {

			if(!flag) {

				flag = true;

				doc.addClass(resizeClass);

			}

			clearTimeout(timer);

			timer = setTimeout(removeClassHandler, 500);

		};

		win.on('resize orientationchange', resizeHandler);

	};



	$.fn.mobileNav = function(opt) {

		var args = Array.prototype.slice.call(arguments);

		var method = args[0];



		return this.each(function() {

			var $container = jQuery(this);

			var instance = $container.data('MobileNav');



			if (typeof opt === 'object' || typeof opt === 'undefined') {

				$container.data('MobileNav', new MobileNav($.extend({

					container: this

				}, opt)));

			} else if (typeof method === 'string' && instance) {

				if (typeof instance[method] === 'function') {

					args.shift();

					instance[method].apply(instance, args);

				}

			}

		});

	};

}(jQuery));

/*!

 * SmoothScroll module

 */

;(function($, exports) {

	// private variables

	var page,

		win = $(window),

		activeBlock, activeWheelHandler,

		wheelEvents = ('onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel DOMMouseScroll');



	// animation handlers

	function scrollTo(offset, options, callback) {

		// initialize variables

		var scrollBlock;

		if (document.body) {

			if (typeof options === 'number') {

				options = {

					duration: options

				};

			} else {

				options = options || {};

			}

			page = page || $('html, body');

			scrollBlock = options.container || page;

		} else {

			return;

		}



		// treat single number as scrollTop

		if (typeof offset === 'number') {

			offset = {

				top: offset

			};

		}



		// handle mousewheel/trackpad while animation is active

		if (activeBlock && activeWheelHandler) {

			activeBlock.off(wheelEvents, activeWheelHandler);

		}

		if (options.wheelBehavior && options.wheelBehavior !== 'none') {

			activeWheelHandler = function(e) {

				if (options.wheelBehavior === 'stop') {

					scrollBlock.off(wheelEvents, activeWheelHandler);

					scrollBlock.stop();

				} else if (options.wheelBehavior === 'ignore') {

					e.preventDefault();

				}

			};

			activeBlock = scrollBlock.on(wheelEvents, activeWheelHandler);

		}



		// start scrolling animation

		scrollBlock.stop().animate({

			scrollLeft: offset.left,

			scrollTop: offset.top

		}, options.duration, function() {

			if (activeWheelHandler) {

				scrollBlock.off(wheelEvents, activeWheelHandler);

			}

			if ($.isFunction(callback)) {

				callback();

			}

		});

	}



	// smooth scroll contstructor

	function SmoothScroll(options) {

		this.options = $.extend({

			anchorLinks: 'a[href^="#"]', // selector or jQuery object

			container: null, // specify container for scrolling (default - whole page)

			extraOffset: null, // function or fixed number

			activeClasses: null, // null, "link", "parent"

			easing: 'swing', // easing of scrolling

			animMode: 'duration', // or "speed" mode

			animDuration: 800, // total duration for scroll (any distance)

			animSpeed: 1500, // pixels per second

			anchorActiveClass: 'anchor-active',

			sectionActiveClass: 'section-active',

			wheelBehavior: 'stop', // "stop", "ignore" or "none"

			useNativeAnchorScrolling: false // do not handle click in devices with native smooth scrolling

		}, options);

		this.init();

	}

	SmoothScroll.prototype = {

		init: function() {

			this.initStructure();

			this.attachEvents();

			this.isInit = true;

		},

		initStructure: function() {

			var self = this;



			this.container = this.options.container ? $(this.options.container) : $('html,body');

			this.scrollContainer = this.options.container ? this.container : win;

			this.anchorLinks = jQuery(this.options.anchorLinks).filter(function() {

				return jQuery(self.getAnchorTarget(jQuery(this))).length;

			});

		},

		getId: function(str) {

			try {

				return '#' + str.replace(/^.*?(#|$)/, '');

			} catch (err) {

				return null;

			}

		},

		getAnchorTarget: function(link) {

			// get target block from link href

			var targetId = this.getId($(link).attr('href'));

			return $(targetId.length > 1 ? targetId : 'html');

		},

		getTargetOffset: function(block) {

			// get target offset

			var blockOffset = block.offset().top;

			if (this.options.container) {

				blockOffset -= this.container.offset().top - this.container.prop('scrollTop');

			}



			// handle extra offset

			if (typeof this.options.extraOffset === 'number') {

				blockOffset -= this.options.extraOffset;

			} else if (typeof this.options.extraOffset === 'function') {

				blockOffset -= this.options.extraOffset(block);

			}

			return {

				top: blockOffset

			};

		},

		attachEvents: function() {

			var self = this;



			// handle active classes

			if (this.options.activeClasses && this.anchorLinks.length) {

				// cache structure

				this.anchorData = [];



				for (var i = 0; i < this.anchorLinks.length; i++) {

					var link = jQuery(this.anchorLinks[i]),

						targetBlock = self.getAnchorTarget(link),

						anchorDataItem = null;



					$.each(self.anchorData, function(index, item) {

						if (item.block[0] === targetBlock[0]) {

							anchorDataItem = item;

						}

					});



					if (anchorDataItem) {

						anchorDataItem.link = anchorDataItem.link.add(link);

					} else {

						self.anchorData.push({

							link: link,

							block: targetBlock

						});

					}

				};



				// add additional event handlers

				this.resizeHandler = function() {

					if (!self.isInit) return;

					self.recalculateOffsets();

				};

				this.scrollHandler = function() {

					self.refreshActiveClass();

				};



				this.recalculateOffsets();

				this.scrollContainer.on('scroll', this.scrollHandler);

				win.on('resize.SmoothScroll load.SmoothScroll orientationchange.SmoothScroll refreshAnchor.SmoothScroll', this.resizeHandler);

			}



			// handle click event

			this.clickHandler = function(e) {

				self.onClick(e);

			};

			if (!this.options.useNativeAnchorScrolling) {

				this.anchorLinks.on('click', this.clickHandler);

			}

		},

		recalculateOffsets: function() {

			var self = this;

			$.each(this.anchorData, function(index, data) {

				data.offset = self.getTargetOffset(data.block);

				data.height = data.block.outerHeight();

			});

			this.refreshActiveClass();

		},

		toggleActiveClass: function(anchor, block, state) {

			anchor.toggleClass(this.options.anchorActiveClass, state);

			block.toggleClass(this.options.sectionActiveClass, state);

		},

		refreshActiveClass: function() {

			var self = this,

				foundFlag = false,

				containerHeight = this.container.prop('scrollHeight'),

				viewPortHeight = this.scrollContainer.height(),

				scrollTop = this.options.container ? this.container.prop('scrollTop') : win.scrollTop();



			// user function instead of default handler

			if (this.options.customScrollHandler) {

				this.options.customScrollHandler.call(this, scrollTop, this.anchorData);

				return;

			}



			// sort anchor data by offsets

			this.anchorData.sort(function(a, b) {

				return a.offset.top - b.offset.top;

			});



			// default active class handler

			$.each(this.anchorData, function(index) {

				var reverseIndex = self.anchorData.length - index - 1,

					data = self.anchorData[reverseIndex],

					anchorElement = (self.options.activeClasses === 'parent' ? data.link.parent() : data.link);



				if (scrollTop >= containerHeight - viewPortHeight) {

					// handle last section

					if (reverseIndex === self.anchorData.length - 1) {

						self.toggleActiveClass(anchorElement, data.block, true);

					} else {

						self.toggleActiveClass(anchorElement, data.block, false);

					}

				} else {

					// handle other sections

					if (!foundFlag && (scrollTop >= data.offset.top - 1 || reverseIndex === 0)) {

						foundFlag = true;

						self.toggleActiveClass(anchorElement, data.block, true);

					} else {

						self.toggleActiveClass(anchorElement, data.block, false);

					}

				}

			});

		},

		calculateScrollDuration: function(offset) {

			var distance;

			if (this.options.animMode === 'speed') {

				distance = Math.abs(this.scrollContainer.scrollTop() - offset.top);

				return (distance / this.options.animSpeed) * 1000;

			} else {

				return this.options.animDuration;

			}

		},

		onClick: function(e) {

			var targetBlock = this.getAnchorTarget(e.currentTarget),

				targetOffset = this.getTargetOffset(targetBlock);



			e.preventDefault();

			scrollTo(targetOffset, {

				container: this.container,

				wheelBehavior: this.options.wheelBehavior,

				duration: this.calculateScrollDuration(targetOffset)

			});

			this.makeCallback('onBeforeScroll', e.currentTarget);

		},

		makeCallback: function(name) {

			if (typeof this.options[name] === 'function') {

				var args = Array.prototype.slice.call(arguments);

				args.shift();

				this.options[name].apply(this, args);

			}

		},

		destroy: function() {

			var self = this;



			this.isInit = false;

			if (this.options.activeClasses) {

				win.off('resize.SmoothScroll load.SmoothScroll orientationchange.SmoothScroll refreshAnchor.SmoothScroll', this.resizeHandler);

				this.scrollContainer.off('scroll', this.scrollHandler);

				$.each(this.anchorData, function(index) {

					var reverseIndex = self.anchorData.length - index - 1,

						data = self.anchorData[reverseIndex],

						anchorElement = (self.options.activeClasses === 'parent' ? data.link.parent() : data.link);



					self.toggleActiveClass(anchorElement, data.block, false);

				});

			}

			this.anchorLinks.off('click', this.clickHandler);

		}

	};



	// public API

	$.extend(SmoothScroll, {

		scrollTo: function(blockOrOffset, durationOrOptions, callback) {

			scrollTo(blockOrOffset, durationOrOptions, callback);

		}

	});



	// export module

	exports.SmoothScroll = SmoothScroll;

}(jQuery, this));

/*! Hammer.JS - v2.0.8 - 2016-04-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(j(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(b,c,d){var e="DEPRECATED METHOD: "+c+"\n"+d+" AT \n";return function(){var c=new Error("get-stack-trace"),d=c&&c.stack?c.stack.replace(/^[^\(]+?[\n$]/gm,"").replace(/^\s+at\s+/gm,"").replace(/^Object.<anonymous>\s*\(/gm,"{anonymous}()@"):"Unknown Stack Trace",f=a.console&&(a.console.warn||a.console.log);return f&&f.call(a.console,e,d),b.apply(this,arguments)}}function i(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&la(d,c)}function j(a,b){return function(){return a.apply(b,arguments)}}function k(a,b){return typeof a==oa?a.apply(b?b[0]||d:d,b):a}function l(a,b){return a===d?b:a}function m(a,b,c){g(q(b),function(b){a.addEventListener(b,c,!1)})}function n(a,b,c){g(q(b),function(b){a.removeEventListener(b,c,!1)})}function o(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function p(a,b){return a.indexOf(b)>-1}function q(a){return a.trim().split(/\s+/g)}function r(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function s(a){return Array.prototype.slice.call(a,0)}function t(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];r(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function u(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ma.length;){if(c=ma[g],e=c?c+f:b,e in a)return e;g++}return d}function v(){return ua++}function w(b){var c=b.ownerDocument||b;return c.defaultView||c.parentWindow||a}function x(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){k(a.options.enable,[a])&&c.handler(b)},this.init()}function y(a){var b,c=a.options.inputClass;return new(b=c?c:xa?M:ya?P:wa?R:L)(a,z)}function z(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&Ea&&d-e===0,g=b&(Ga|Ha)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,A(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function A(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=D(b)),e>1&&!c.firstMultiple?c.firstMultiple=D(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=E(d);b.timeStamp=ra(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=I(h,i),b.distance=H(h,i),B(c,b),b.offsetDirection=G(b.deltaX,b.deltaY);var j=F(b.deltaTime,b.deltaX,b.deltaY);b.overallVelocityX=j.x,b.overallVelocityY=j.y,b.overallVelocity=qa(j.x)>qa(j.y)?j.x:j.y,b.scale=g?K(g.pointers,d):1,b.rotation=g?J(g.pointers,d):0,b.maxPointers=c.prevInput?b.pointers.length>c.prevInput.maxPointers?b.pointers.length:c.prevInput.maxPointers:b.pointers.length,C(c,b);var k=a.element;o(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k}function B(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};b.eventType!==Ea&&f.eventType!==Ga||(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function C(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Ha&&(i>Da||h.velocity===d)){var j=b.deltaX-h.deltaX,k=b.deltaY-h.deltaY,l=F(i,j,k);e=l.x,f=l.y,c=qa(l.x)>qa(l.y)?l.x:l.y,g=G(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function D(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:pa(a.pointers[c].clientX),clientY:pa(a.pointers[c].clientY)},c++;return{timeStamp:ra(),pointers:b,center:E(b),deltaX:a.deltaX,deltaY:a.deltaY}}function E(a){var b=a.length;if(1===b)return{x:pa(a[0].clientX),y:pa(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:pa(c/b),y:pa(d/b)}}function F(a,b,c){return{x:b/a||0,y:c/a||0}}function G(a,b){return a===b?Ia:qa(a)>=qa(b)?0>a?Ja:Ka:0>b?La:Ma}function H(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function I(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function J(a,b){return I(b[1],b[0],Ra)+I(a[1],a[0],Ra)}function K(a,b){return H(b[0],b[1],Ra)/H(a[0],a[1],Ra)}function L(){this.evEl=Ta,this.evWin=Ua,this.pressed=!1,x.apply(this,arguments)}function M(){this.evEl=Xa,this.evWin=Ya,x.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function N(){this.evTarget=$a,this.evWin=_a,this.started=!1,x.apply(this,arguments)}function O(a,b){var c=s(a.touches),d=s(a.changedTouches);return b&(Ga|Ha)&&(c=t(c.concat(d),"identifier",!0)),[c,d]}function P(){this.evTarget=bb,this.targetIds={},x.apply(this,arguments)}function Q(a,b){var c=s(a.touches),d=this.targetIds;if(b&(Ea|Fa)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=s(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return o(a.target,i)}),b===Ea)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ga|Ha)&&delete d[g[e].identifier],e++;return h.length?[t(f.concat(h),"identifier",!0),h]:void 0}function R(){x.apply(this,arguments);var a=j(this.handler,this);this.touch=new P(this.manager,a),this.mouse=new L(this.manager,a),this.primaryTouch=null,this.lastTouches=[]}function S(a,b){a&Ea?(this.primaryTouch=b.changedPointers[0].identifier,T.call(this,b)):a&(Ga|Ha)&&T.call(this,b)}function T(a){var b=a.changedPointers[0];if(b.identifier===this.primaryTouch){var c={x:b.clientX,y:b.clientY};this.lastTouches.push(c);var d=this.lastTouches,e=function(){var a=d.indexOf(c);a>-1&&d.splice(a,1)};setTimeout(e,cb)}}function U(a){for(var b=a.srcEvent.clientX,c=a.srcEvent.clientY,d=0;d<this.lastTouches.length;d++){var e=this.lastTouches[d],f=Math.abs(b-e.x),g=Math.abs(c-e.y);if(db>=f&&db>=g)return!0}return!1}function V(a,b){this.manager=a,this.set(b)}function W(a){if(p(a,jb))return jb;var b=p(a,kb),c=p(a,lb);return b&&c?jb:b||c?b?kb:lb:p(a,ib)?ib:hb}function X(){if(!fb)return!1;var b={},c=a.CSS&&a.CSS.supports;return["auto","manipulation","pan-y","pan-x","pan-x pan-y","none"].forEach(function(d){b[d]=c?a.CSS.supports("touch-action",d):!0}),b}function Y(a){this.options=la({},this.defaults,a||{}),this.id=v(),this.manager=null,this.options.enable=l(this.options.enable,!0),this.state=nb,this.simultaneous={},this.requireFail=[]}function Z(a){return a&sb?"cancel":a&qb?"end":a&pb?"move":a&ob?"start":""}function $(a){return a==Ma?"down":a==La?"up":a==Ja?"left":a==Ka?"right":""}function _(a,b){var c=b.manager;return c?c.get(a):a}function aa(){Y.apply(this,arguments)}function ba(){aa.apply(this,arguments),this.pX=null,this.pY=null}function ca(){aa.apply(this,arguments)}function da(){Y.apply(this,arguments),this._timer=null,this._input=null}function ea(){aa.apply(this,arguments)}function fa(){aa.apply(this,arguments)}function ga(){Y.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function ha(a,b){return b=b||{},b.recognizers=l(b.recognizers,ha.defaults.preset),new ia(a,b)}function ia(a,b){this.options=la({},ha.defaults,b||{}),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=a,this.input=y(this),this.touchAction=new V(this,this.options.touchAction),ja(this,!0),g(this.options.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function ja(a,b){var c=a.element;if(c.style){var d;g(a.options.cssProps,function(e,f){d=u(c.style,f),b?(a.oldCssProps[d]=c.style[d],c.style[d]=e):c.style[d]=a.oldCssProps[d]||""}),b||(a.oldCssProps={})}}function ka(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var la,ma=["","webkit","Moz","MS","ms","o"],na=b.createElement("div"),oa="function",pa=Math.round,qa=Math.abs,ra=Date.now;la="function"!=typeof Object.assign?function(a){if(a===d||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var b=Object(a),c=1;c<arguments.length;c++){var e=arguments[c];if(e!==d&&null!==e)for(var f in e)e.hasOwnProperty(f)&&(b[f]=e[f])}return b}:Object.assign;var sa=h(function(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a},"extend","Use `assign`."),ta=h(function(a,b){return sa(a,b,!0)},"merge","Use `assign`."),ua=1,va=/mobile|tablet|ip(ad|hone|od)|android/i,wa="ontouchstart"in a,xa=u(a,"PointerEvent")!==d,ya=wa&&va.test(navigator.userAgent),za="touch",Aa="pen",Ba="mouse",Ca="kinect",Da=25,Ea=1,Fa=2,Ga=4,Ha=8,Ia=1,Ja=2,Ka=4,La=8,Ma=16,Na=Ja|Ka,Oa=La|Ma,Pa=Na|Oa,Qa=["x","y"],Ra=["clientX","clientY"];x.prototype={handler:function(){},init:function(){this.evEl&&m(this.element,this.evEl,this.domHandler),this.evTarget&&m(this.target,this.evTarget,this.domHandler),this.evWin&&m(w(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(w(this.element),this.evWin,this.domHandler)}};var Sa={mousedown:Ea,mousemove:Fa,mouseup:Ga},Ta="mousedown",Ua="mousemove mouseup";i(L,x,{handler:function(a){var b=Sa[a.type];b&Ea&&0===a.button&&(this.pressed=!0),b&Fa&&1!==a.which&&(b=Ga),this.pressed&&(b&Ga&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:Ba,srcEvent:a}))}});var Va={pointerdown:Ea,pointermove:Fa,pointerup:Ga,pointercancel:Ha,pointerout:Ha},Wa={2:za,3:Aa,4:Ba,5:Ca},Xa="pointerdown",Ya="pointermove pointerup pointercancel";a.MSPointerEvent&&!a.PointerEvent&&(Xa="MSPointerDown",Ya="MSPointerMove MSPointerUp MSPointerCancel"),i(M,x,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Va[d],f=Wa[a.pointerType]||a.pointerType,g=f==za,h=r(b,a.pointerId,"pointerId");e&Ea&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ga|Ha)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Za={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},$a="touchstart",_a="touchstart touchmove touchend touchcancel";i(N,x,{handler:function(a){var b=Za[a.type];if(b===Ea&&(this.started=!0),this.started){var c=O.call(this,a,b);b&(Ga|Ha)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}}});var ab={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},bb="touchstart touchmove touchend touchcancel";i(P,x,{handler:function(a){var b=ab[a.type],c=Q.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}});var cb=2500,db=25;i(R,x,{handler:function(a,b,c){var d=c.pointerType==za,e=c.pointerType==Ba;if(!(e&&c.sourceCapabilities&&c.sourceCapabilities.firesTouchEvents)){if(d)S.call(this,b,c);else if(e&&U.call(this,c))return;this.callback(a,b,c)}},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var eb=u(na.style,"touchAction"),fb=eb!==d,gb="compute",hb="auto",ib="manipulation",jb="none",kb="pan-x",lb="pan-y",mb=X();V.prototype={set:function(a){a==gb&&(a=this.compute()),fb&&this.manager.element.style&&mb[a]&&(this.manager.element.style[eb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){k(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),W(a.join(" "))},preventDefaults:function(a){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=p(d,jb)&&!mb[jb],f=p(d,lb)&&!mb[lb],g=p(d,kb)&&!mb[kb];if(e){var h=1===a.pointers.length,i=a.distance<2,j=a.deltaTime<250;if(h&&i&&j)return}return g&&f?void 0:e||f&&c&Na||g&&c&Oa?this.preventSrc(b):void 0},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var nb=1,ob=2,pb=4,qb=8,rb=qb,sb=16,tb=32;Y.prototype={defaults:{},set:function(a){return la(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=_(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=_(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=_(a,this),-1===r(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=_(a,this);var b=r(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(b,a)}var c=this,d=this.state;qb>d&&b(c.options.event+Z(d)),b(c.options.event),a.additionalEvent&&b(a.additionalEvent),d>=qb&&b(c.options.event+Z(d))},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=tb)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(tb|nb)))return!1;a++}return!0},recognize:function(a){var b=la({},a);return k(this.options.enable,[this,b])?(this.state&(rb|sb|tb)&&(this.state=nb),this.state=this.process(b),void(this.state&(ob|pb|qb|sb)&&this.tryEmit(b))):(this.reset(),void(this.state=tb))},process:function(a){},getTouchAction:function(){},reset:function(){}},i(aa,Y,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(ob|pb),e=this.attrTest(a);return d&&(c&Ha||!e)?b|sb:d||e?c&Ga?b|qb:b&ob?b|pb:ob:tb}}),i(ba,aa,{defaults:{event:"pan",threshold:10,pointers:1,direction:Pa},getTouchAction:function(){var a=this.options.direction,b=[];return a&Na&&b.push(lb),a&Oa&&b.push(kb),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Na?(e=0===f?Ia:0>f?Ja:Ka,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Ia:0>g?La:Ma,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return aa.prototype.attrTest.call(this,a)&&(this.state&ob||!(this.state&ob)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=$(a.direction);b&&(a.additionalEvent=this.options.event+b),this._super.emit.call(this,a)}}),i(ca,aa,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&ob)},emit:function(a){if(1!==a.scale){var b=a.scale<1?"in":"out";a.additionalEvent=this.options.event+b}this._super.emit.call(this,a)}}),i(da,Y,{defaults:{event:"press",pointers:1,time:251,threshold:9},getTouchAction:function(){return[hb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ga|Ha)&&!f)this.reset();else if(a.eventType&Ea)this.reset(),this._timer=e(function(){this.state=rb,this.tryEmit()},b.time,this);else if(a.eventType&Ga)return rb;return tb},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===rb&&(a&&a.eventType&Ga?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=ra(),this.manager.emit(this.options.event,this._input)))}}),i(ea,aa,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&ob)}}),i(fa,aa,{defaults:{event:"swipe",threshold:10,velocity:.3,direction:Na|Oa,pointers:1},getTouchAction:function(){return ba.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Na|Oa)?b=a.overallVelocity:c&Na?b=a.overallVelocityX:c&Oa&&(b=a.overallVelocityY),this._super.attrTest.call(this,a)&&c&a.offsetDirection&&a.distance>this.options.threshold&&a.maxPointers==this.options.pointers&&qa(b)>this.options.velocity&&a.eventType&Ga},emit:function(a){var b=$(a.offsetDirection);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),i(ga,Y,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10},getTouchAction:function(){return[ib]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&Ea&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ga)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||H(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=rb,this.tryEmit()},b.interval,this),ob):rb}return tb},failTimeout:function(){return this._timer=e(function(){this.state=tb},this.options.interval,this),tb},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==rb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),ha.VERSION="2.0.8",ha.defaults={domEvents:!1,touchAction:gb,enable:!0,inputTarget:null,inputClass:null,preset:[[ea,{enable:!1}],[ca,{enable:!1},["rotate"]],[fa,{direction:Na}],[ba,{direction:Na},["swipe"]],[ga],[ga,{event:"doubletap",taps:2},["tap"]],[da]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var ub=1,vb=2;ia.prototype={set:function(a){return la(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?vb:ub},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&rb)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===vb||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(ob|pb|qb)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof Y)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;if(a=this.get(a)){var b=this.recognizers,c=r(b,a);-1!==c&&(b.splice(c,1),this.touchAction.update())}return this},on:function(a,b){if(a!==d&&b!==d){var c=this.handlers;return g(q(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this}},off:function(a,b){if(a!==d){var c=this.handlers;return g(q(a),function(a){b?c[a]&&c[a].splice(r(c[a],b),1):delete c[a]}),this}},emit:function(a,b){this.options.domEvents&&ka(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&ja(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},la(ha,{INPUT_START:Ea,INPUT_MOVE:Fa,INPUT_END:Ga,INPUT_CANCEL:Ha,STATE_POSSIBLE:nb,STATE_BEGAN:ob,STATE_CHANGED:pb,STATE_ENDED:qb,STATE_RECOGNIZED:rb,STATE_CANCELLED:sb,STATE_FAILED:tb,DIRECTION_NONE:Ia,DIRECTION_LEFT:Ja,DIRECTION_RIGHT:Ka,DIRECTION_UP:La,DIRECTION_DOWN:Ma,DIRECTION_HORIZONTAL:Na,DIRECTION_VERTICAL:Oa,DIRECTION_ALL:Pa,Manager:ia,Input:x,TouchAction:V,TouchInput:P,MouseInput:L,PointerEventInput:M,TouchMouseInput:R,SingleTouchInput:N,Recognizer:Y,AttrRecognizer:aa,Tap:ga,Pan:ba,Swipe:fa,Pinch:ca,Rotate:ea,Press:da,on:m,off:n,each:g,merge:ta,extend:sa,assign:la,inherit:i,bindFn:j,prefixed:u});var wb="undefined"!=typeof a?a:"undefined"!=typeof self?self:{};wb.Hammer=ha,"function"==typeof define&&define.amd?define(function(){return ha}):"undefined"!=typeof module&&module.exports?module.exports=ha:a[c]=ha}(window,document,"Hammer");