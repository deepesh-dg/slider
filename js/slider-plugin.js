(function ( $ ) {
 
    $.fn.deepSlider = function( options ) {
 
        // Default options
        var args = $.extend({
            loop: false,
            dots: true,
            center: false,
            autoplay: true,
            autoplayTimeout: 4000,
            autoplayHoverPause: true,
        }, options );

        var thisSlider = this;
        var sliderItems = [];
        var sliderItemsCount = thisSlider.find(".slider-item").length;
        var sliderIndexAddUp = 0;
        var screen = {
            xs: {
                itemCounts: getResponsiveClass(`xs`),
                screenSize: 0,
            },
            sm: {
                itemCounts: getResponsiveClass(`sm`),
                screenSize: 576,
            },
            md: {
                itemCounts: getResponsiveClass(`md`),
                screenSize: 768,
            },
            lg: {
                itemCounts: getResponsiveClass(`lg`),
                screenSize: 992,
            },
            xl: {
                itemCounts: getResponsiveClass(`xl`),
                screenSize: 1200,
            },
        };
        var screenSegment = [];
        var itemWidth = undefined;
        var transform;
        var currentIndex = 0;
        var lastIndex = 0;
        var btnClicked = false;

        for (var key in screen) {
            screenSegment.push(screen[key]);
        }
        if (args.loop === true) {
            var sliderClone = [[],[],[]];
            sliderIndexAddUp = sliderItemsCount;
        }
        if (args.autoplay === true) {
            var autoplay;
        }
        if (args.center === true) {
            var centerIndex = 0;
        }

        // Necessary Functions Definition
        function getResponsiveClass(screen) {

            var rtn;

            if (thisSlider.hasClass("slider-column")) {

                if (thisSlider.is(`[class*="slider-column-${screen}-"]`)) {

                    var clsName = [];

                    $(thisSlider.attr(`class`).split(` `)).each( (i, element) => {
                        var match = `slider-column-${screen}-\\d+`;
                        match = new RegExp(match);

                        if (element.match(match)) {
                            clsName.push(element.match(match));
                        }

                    });
                    
                    if (clsName) {
                        $(clsName).each( (i, element) => {
                            if (i == clsName.length - 1) {
                                $(element).each( (i, element1) => {

                                    if (parseInt(element1.slice(17)) > sliderItemsCount) {
                                        rtn = sliderItemsCount;
                                    } else {
                                        rtn = element1.slice(17);
                                    }
                                    
                                });
                            }
                            
                        });
                    } else {
                        rtn = 1;
                    }
                    
                } else {
                    if (screen == 'xs') {
                        rtn = 1;
                    } else if (screen == 'sm') {
                        rtn = getResponsiveClass('xs');
                    } else if (screen == 'md') {
                        rtn = getResponsiveClass('sm');
                    } else if (screen == 'lg') {
                        rtn = getResponsiveClass('md');
                    } else if (screen == 'xl') {
                        rtn = getResponsiveClass('lg');
                    } 
                }
            } else {
                rtn = 1;
            }

            return rtn;
        }

        function currentScreenSegment() {
            var currentScreen = $(window).width();
            var screenSegmentSize = [{min: screen.xs.screenSize, max: screen.sm.screenSize}, {min: screen.sm.screenSize, max: screen.md.screenSize}, {min: screen.md.screenSize, max: screen.lg.screenSize}, {min: screen.lg.screenSize, max: screen.xl.screenSize}, {min: screen.xl.screenSize, max: 4500},];
            var ret;

            $(screenSegmentSize).each((i, element) => {

                if (currentScreen >= element.min && currentScreen < element.max) {
                    ret = screenSegment[i];
                } 

            });

            return ret;
        }

        function resetSliders() {
            currentIndex = parseInt(sliderIndexAddUp);
            lastIndex = parseInt(currentIndex) + parseInt(currentScreenSegment().itemCounts) - 1;
            centerIndex = Math.floor(( parseInt(currentIndex) + parseInt(lastIndex) ) / 2);
            if (args.loop === true) {
                transform = -(itemWidth * sliderIndexAddUp);
            }
            setActive(true);
            setTimeout(() => {
                setSliderTrack();
            }, 400);
        }

        // Loop On - Making Clones
        if (args.loop === true) {
            thisSlider.find(".slider-item").each( (i, element) => {

                sliderClone[0].push($(element).clone().addClass('slider-cloned').removeClass('slider-active'));
                sliderClone[1].push($(element).clone().removeClass('slider-active'));
                sliderClone[2].push($(element).clone().addClass('slider-cloned').removeClass('slider-active'));
    
                sliderItems.push($(element).clone().removeClass('slider-active'));
    
            });

            thisSlider.find(".slider-inner").html("").append(`<div class="slider-track"></div>`);

            $(sliderClone).each( (i, element) => {
                $(element).each( (i, element1) => {
    
                    thisSlider.find(".slider-track").append($(element1));
                    
                });
    
            });

        } else { // Loop Off - Not Make Clones

            thisSlider.find(".slider-item").each( (i, element) => {
    
                sliderItems.push($(element).clone().removeClass('slider-active'));
    
            });

            thisSlider.find(".slider-inner").html("").append(`<div class="slider-track"></div>`);

            $(sliderItems).each( (i, element) => {

                thisSlider.find(".slider-track").append($(element));
    
            });

        }

        // Setting up Variables
        currentIndex = parseInt(sliderIndexAddUp);
        lastIndex = parseInt(currentIndex) + parseInt(currentScreenSegment().itemCounts) - 1;
        centerIndex = Math.floor(( parseInt(currentIndex) + parseInt(lastIndex) ) / 2);
        
        // Set Width of Single Slider Item
        function setSliderWidth(){
            thisSlider.find(".slider-item").each( (i, element) => {

                var scrSegment = currentScreenSegment();

                itemWidth = thisSlider.width()/scrSegment.itemCounts;
                $(element).css('max-width', itemWidth+"px");
    
            });
            transform = -(itemWidth * sliderIndexAddUp);

            setTrackWidth();
            if (args.dots === true) {
                setSliderDots();
            }
            setActive();
        }

        // Set Total Width of Slider Item Container - .slider-track
        function setTrackWidth() {
            
            var sliderTrackWidth = thisSlider.find(".slider-item").outerWidth() * thisSlider.find(".slider-item").length;
            
            thisSlider.find(".slider-track").css("width", sliderTrackWidth + 2 +"px");

        }

        // Set Translate3d of .slider-track
        function setSliderTrack(btn = false, sliding = -(itemWidth * sliderIndexAddUp)) {

            thisSlider.find(".slider-track").css({"transform": "translate3d("+sliding+"px, 0, 0)", "transition": "0s"});

            if (btn) {
                thisSlider.find(".slider-track").css({"transition": "400ms ease 0s"});
            }

        }

        // Set Dots if Dots in enabled
        function setSliderDots(){

            var scrActiveItems = parseInt(currentScreenSegment().itemCounts);
            var noOfDots = Math.ceil(sliderItemsCount/scrActiveItems);
            var sliderIndicator = [];
            
            for (let i = 0; i < sliderItemsCount; i = i + scrActiveItems) {
                
                sliderIndicator.push(i);
                
            }

            if (thisSlider.find(".slider-dots").length < 1) {

                thisSlider.append(`<div class="slider-dots"></div>`);

            }

            thisSlider.find(".slider-dots").each( (i, element) => {
            
                $(element).html("");

                for (let i = 0; i < noOfDots; i++) {
                    
                    $(element).append(`<div class="slider-dot" slider-indicator="${sliderIndicator[i]}"></div>`);
                    
                }
                    
            });

        }

        // Set Active class in slider-items and slider-dots
        function setActive(reset = false) {

            // Slider Item Active
            thisSlider.find(`.slider-item`).each( (i, element) => {

                if (i != centerIndex) {
                    $(element).removeClass("slider-active");
                }
    
                if (args.center === true) {
                    
                    $(element).removeClass("slider-center");
    
                }
    
                if(i >= currentIndex && i <= lastIndex) { 
    
                    $(element).addClass("slider-active");
    
                }

                if (args.center === true) {

                    if (i == centerIndex) {

                        if (reset == true) {
                            setTimeout(() => {
                                $(element).addClass("slider-center");
                            }, 400);
                        } else {
                            $(element).addClass("slider-center");
                        }

                    }
                    
                }
            
            });

            // Set Active on Dots
            if (args.dots === true) {
                
                var scrActiveItems = parseInt(currentScreenSegment().itemCounts);
            
                thisSlider.find(".slider-dots").each( (i, element) => {
                    var active = false;

                    $(element).find(".slider-dot").each( (i, element1) => {

                        var sliderIndicator = parseInt($(element1).attr("slider-indicator"));
                    
                        if (currentIndex >= sliderIndicator + sliderIndexAddUp && currentIndex < sliderIndicator + sliderIndexAddUp + scrActiveItems) {
                            if (!active) {
                                $(element1).addClass("active");
                                active = true;
                            }
                        } else
                            if (currentIndex >= sliderIndicator && currentIndex < sliderIndicator + scrActiveItems && currentIndex < sliderIndexAddUp) {
                                if (!active) {
                                    $(element1).addClass("active");
                                    active = true;
                                }
                            }
                        else {
                            $(element1).removeClass("active");
                            active = false;
                        }

                        if (args.loop !== true) {
                            if (lastIndex == sliderItemsCount - 1 && currentIndex > 0) {
                                $(element).find(".slider-dot").each( (i, element2) => {
                                    $(element2).removeClass("active");
                                });
                                $(element1).addClass("active");
                            }
                        }

                    });
                        
                });

            }

        }

        // Autoplay Function Definition
        var autoplayFunc = () => {
            if (parseInt(args.autoplayTimeout)) {

                if (!btnClicked) {

                    btnClicked = true;
                    setTimeout(() => {
                        btnClicked = false;
                    }, 400);

                    if (args.loop === true) {
                        currentIndex++;
                        centerIndex++;
                        lastIndex++;
                        transform -= itemWidth;
                        setSliderTrack(true, transform);
                        if (currentIndex == (sliderIndexAddUp * 2)) {
                            resetSliders();
                        } else {
                            setActive();
                        }
                    } else {
                        if (lastIndex < sliderItemsCount - 1) {
                            currentIndex++;
                            centerIndex++;
                            lastIndex++;
                            transform -= itemWidth;
                            setSliderTrack(true, transform);
                            setActive();
                        } else {
                            transform = -(itemWidth * sliderIndexAddUp);
                            setSliderTrack(true, transform);
                            resetSliders();
                        }
                    }
                    
                }

            }
        }
        // Autoplay pause when hover with mouse
        if (args.autoplayHoverPause === true) {
            if (args.autoplay === true) {

                // Stop on Mouse Enter
                thisSlider.on("mouseenter", () => {
                    clearTimeout(autoplay);
                });
    
                // Resume on Mouse Exit
                thisSlider.on("mouseleave", () => {
                    autoplay = setInterval(autoplayFunc, args.autoplayTimeout);
                });    
                
            }
        }

        // Next and Previous Button Event
        thisSlider.find(".slider-nav").each( (i, element) => {

            $(element).on("click", (event) => {
                event.preventDefault();
                
                if (args.autoplay === true) {
                    clearTimeout(autoplay);
                }
                
                if (!btnClicked) {
    
                    btnClicked = true;
                    setTimeout(() => {
                        btnClicked = false;
                    }, 400);
    
                    if ($(element).hasClass('prev')) {

                        if (args.loop === true) {
                            currentIndex--;
                            centerIndex--;
                            lastIndex--;
                            transform += itemWidth;
                            setSliderTrack(true, transform);
                            if (currentIndex == 0) {
                                resetSliders();
                            } else {
                                setActive();
                            }
                        } else {
                            if (currentIndex > 0) {
                                currentIndex--;
                                centerIndex--;
                                lastIndex--;
                                transform += itemWidth;
                                setSliderTrack(true, transform);
                                setActive();
                            }
                        }
    
                    } else if ($(element).hasClass('next')) {

                        if (args.loop === true) {
                            currentIndex++;
                            centerIndex++;
                            lastIndex++;
                            transform -= itemWidth;
                            setSliderTrack(true, transform);
                            if (currentIndex == (sliderIndexAddUp * 2)) {
                                resetSliders();
                            } else {
                                setActive();
                            }
                        } else {
                            if (lastIndex < sliderItemsCount - 1) {
                                currentIndex++;
                                centerIndex++;
                                lastIndex++;
                                transform -= itemWidth;
                                setSliderTrack(true, transform);
                                setActive();
                            }
                        }
                        
                    }
    
                }
                if (args.autoplay === true) {
                    autoplay = setInterval(autoplayFunc, args.autoplayTimeout);
                }
    
            });

        });

        // Call Functions for start
        setSliderWidth();
        setSliderTrack();

        $(window).resize( () => {
            
            setSliderWidth();
            setSliderTrack();

        });

        if (args.autoplay === true) {
            autoplay = setInterval(autoplayFunc, args.autoplayTimeout);
        }

        // Slider Dot Click Event
        if (args.dots === true) {

            thisSlider.find(".slider-dots").each( (i, dots) => {

                $(dots).find(".slider-dot").each( (j, dot) => {
    
                    $(dot).on("click", (event) => {
    
                        event.preventDefault();
                        if (args.autoplay === true) {
                            clearTimeout(autoplay);
                        }
    
                        var sliderIndicatorIndex = parseInt($(dot).attr("slider-indicator"));

                        if (!btnClicked) {
                        
                            transform += itemWidth * (currentIndex - (sliderIndicatorIndex + sliderIndexAddUp));
        
                            currentIndex = sliderIndicatorIndex + sliderIndexAddUp;
                            lastIndex = parseInt(currentIndex) + parseInt(currentScreenSegment().itemCounts) - 1;
                            centerIndex = Math.floor(( parseInt(currentIndex) + parseInt(lastIndex) ) / 2);
            
                            btnClicked = true;
                            setTimeout(() => {
                                btnClicked = false;
                            }, 400);

                            if (args.loop === true) {
    
                                if (currentIndex == (sliderIndexAddUp * 2) || currentIndex == 0) {
                                    setSliderTrack(true, transform);
                                    resetSliders();
                                } else {

                                    // if (sliderIndicatorIndex > ($(dots).find(".slider-dot").length / 2)) {
                                        
                                    // }

                                    setSliderTrack(true, transform);
                                    setActive();
                                }
                                
                            } else { 

                                if (j == $(dots).find(".slider-dot").length - 1) {

                                    transform += itemWidth * (sliderItemsCount - 1 - (sliderIndicatorIndex + sliderIndexAddUp));

                                    lastIndex = sliderItemsCount - 1;
                                    currentIndex = lastIndex - parseInt(currentScreenSegment().itemCounts) + 1;
                                    centerIndex = Math.floor(( parseInt(currentIndex) + parseInt(lastIndex) ) / 2);
                                    
                                }
                                setSliderTrack(true, transform);
                                setActive();
                            }
                            
                            if (args.autoplay === true) {
                                autoplay = setInterval(autoplayFunc, args.autoplayTimeout);
                            }
                        }

                    });
    
                });
    
            });

        }

    };
 
}( jQuery ));