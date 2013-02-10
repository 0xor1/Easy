Easy animations
================

Easy is a small animation utility, it includes `requestAnimationFrame` and `cancelAnimationFrame` polyfills.

+ [Basics](#basics)
+ [Parallel Animations](#parallel-animations)
+ [Chaining Animations](#chaining-animations)
+ [Ease + Performance](#ease--performance)
+ [Cancelling + Overriding Animations](#cancelling--overriding-animations)
+ [Animation Master + Scaling Factor](#animation-master--scaling-factor)
+ [Frame Rate Monitor + Low Frame Rate Smoothing](#frame-rate-monitor--low-frame-rate-smoothing)
+ [Advanced Methods](#advanced-methods)
    + [Parasitic Animations](#parasitic-animations)
    + [Stowaway Animations](#stowaway-animations)
    + [Non-Numerical Animations](#non-numerical-animations)

---

##Basics

Include Easy.js in your page and animate like so:

All the following examples are done on the object:
```javascript
    var myObj = {
        position:{x:0,y:0,z:0},
        rotation:{x:0,y:0,z:0}
    };
```

The most basic animation; all animations must include the following properties:
```javascript
    Easy.animate({
        obj:myObj.position,     //reference containing property to animate
        prop:'x',               //property that will be animated
        end:10,                 //the end value that obj[prop] will be at the end of the animation
        len:1000                //the length of that animation in millisecs
    });
```

Animations can also be relative:
```javascript
    Easy.animate({
        obj:myObj.position,
        prop:'x',
        end:'+=10',  //animate to x + 10
        len:1000
    });
```

in either direction:
```javascript
    Easy.animate({
        obj:myObj.position,
        prop:'x',
        end:'-=10',  //animate to x - 10
        len:1000
    });
```

##Parallel Animations

Multiple properties can be animated simultaneously, simply make multiple calls to animate:
```javascript
    //make object rise and spin at the same time!
    function riseAndSpin(myObj){

        Easy.animate({
            obj:myObj.position,
            prop:'z',
            end:'+=100',             //rise to 100 units above current position
            len:1000
        });

        Easy.animate({
            obj:myObj.rotation,
            prop:'z',
            end:'+=' + Math.PI * 4,  //spin around z axis twice
            len:1000
        });
    }
```

##Chaining Animations

Animations can be chained together by using the `clbk` property:
```javascript
    //make object rise and then spin at the top!
    function riseThenSpin(myObj){

        Easy.animate({
            obj:myObj.position,
            prop:'z',
            end:'+=100',
            len:1000
            clbk:function(obj, prop, start, end, len, ease){
                Easy.animate({
                    obj:myObj.rotation,
                    prop:'z',
                    end:'+=' + Math.PI * 4,
                    len:1000
                });
            }
        });
    }
```

As the above example revealed, the `clbk` property can be called with six arguments, the obj reference, the property
name, the properties starting value from the animation which just completed, the end value which the property is
now at, the length of the animation and the easing function.
This allows for animations to be easily chained using the same properties.
```javascript
    //make obj do something
    function riseThenFallAlternate(myObj){

        Easy.animate({
            obj:myObj.position,
            prop:'z',
            end:'+=100',
            len:1000
            clbk:function(obj, prop, start, end, len, ease){
                Easy.animate({
                    obj:obj,
                    prop:prop,
                    end:start,
                    len:len,
                    ease:ease
                    clbk:function(){
                        riseThenFallAlternate(myObj);
                    }
                });
            }
        });
    }
```

##Ease + Performance

So far, easing functions have not been discussed, all of the above use the default ease, ease-in-out. Always consider the performance of the easing function.

Up to this point all the examples have not called animate with an ease property, that is because animate has a default
ease. All of the above examples are equivalent to:
```javascript
    Easy.animate({
        obj:myObj.position,
        prop:'z',
        end:'+=100',
        len:1000,
        ease:function(obj, prop, start, end, progress) {
            obj[prop] = (start - end) * 0.5 * (Math.cos(progress * Math.PI) + 1) + end;
        }
    });
```

Where *start* and *end* are the properties values at the beginning and the end of the animation respectively, *progress*
is a value which is updated each frame and runs from **0** to **1** denoting the current progress of the animation. The
default ease provides a smooth acceleration followed by a smooth deceleration, which should be fine for many generic
tasks.

###Performance

The previous example is not a true representation of how the default ease is really implemented. To save on
calculation expense all constant terms should be pre calculated to save on efficiency, the following is closer to how
the default ease is implemented, frequently used constants and functions are also wrapped in the closure to increase performance:
```javascript
    function(obj, prop, end, len){

        //constant coefficient pre-calculated
        var cc = (obj[prop] - end) * 0.5
            , cos = Math.cos
            , pi = Math.PI
            ;

        Easy.animate({
            obj:obj,
            prop:prop,
            end:end,
            len:1000,
            ease:function(obj, prop, start, end, progress) {
                obj[prop] = cc * (cos(progress * pi) + 1) + end;  //a little bit less expensive
            }
        });

    }
```

As a final example in the performance section, consider a linear ease:
```javascript
    Easy.animate({
        obj:myObj.position,
        prop:'z',
        end:100,
        len:1000,
        ease:function(obj, prop, start, end, progress) {
            obj[prop] = (end - start) * progress + start;
        }
    });
```

Improved:
```javascript
    function linearAltitudeToOneHundred(obj) {

        var ems = 100 - obj.position.z;

        Easy.animate({
            obj:obj.position,
            prop:'z',
            target:100,
            length:1000,
            ease:function(obj, prop, start, end, progress) {
                obj[prop] = ems * progress + start;
            }
        });
    }
```

It only saves one subtraction calculation per frame, but if it is running on many properties over many frames the savings
could be significant.

##Cancelling + Overriding animations

To cancel an animation simply call:
```javascript
    Easy.animate({
        obj:myObj.position,
        prop:'z',
        cancel:true
    });
```

This will immediately stop any animation running on `myObj.position.z`.

###Overriding

**Easy** supports the ability to immediately override already running animations, meaning they can easily adapt to unpredictable
situations like user input.
```javascript
    Easy.animate({
        obj:myObj.position,
        prop:'z',
        target:100,
        length:5000         //animate over 5 seconds
    });

    setTimeout(
        function(){
            Easy.animate({
                obj:myObj.position,
                prop:'z',
                target:0,
                length:2500
            });
        },
        2500                //automatically override the previous animation halfway through
    );
```

It should be noted that **cancelling** or **overriding** animations that had callback functions passed into them will result in those
callbacks **NOT** being called.

##Animation Master + Scaling Factor

**Easy** comes with an **animationMaster** object which can be used to **pause**, **play**, and adjust the
**speed** of all currently active animations.

**PAUSE** all animations:
```javascript
    Easy.animationMaster.pause();
```

**PLAY** all animations:
```javascript
    Easy.animationMaster.play();
```

**SPEED** adjustment:
```javascript
    //Run at normal speed
    Easy.animationMaster.setAnimationScalingFactor(1);

    //Run at half speed
    Easy.animationMaster.setAnimationScalingFactor(0.5);

    //Run at double speed
    Easy.animationMaster.setAnimationScalingFactor(2);
```

##Frame Rate Monitor + Low Frame Rate Smoothing

**Easy** animations also contains a `frameRateMonitor` object which can be used to do several things:

Just monitor the frame rate:
```javascript
    //start the frameRateMonitor
    Easy.frameRateMonitor.start();
    //print the frame rate to the console
    Easy.frameRateMonitor.enableLogging();

    //... continuous monitoring and logging

    //stop logging to the console
    Easy.frameRateMonitor.disableLogging();
    //stop frameRateMonitor
    Easy.frameRateMonitor.stop();
```

The `frameRateMonitor` can be used to smooth animations when the frame rate drops below a critical limit:
```javascript
    //set the critical fps - default is 20 fps - must be between 0 and 60
    Easy.frameRateMonitor.setCriticalFps(35);
    //enable smoothing
    Easy.frameRateMonitor.enableLowFrameSmoothing();

    // ... animations will be smoothed when fps drops below 35

    //disable smoothing
    Easy.frameRateMonitor.disableLowFrameRateSmoothing();
```

Currently the smoothing just halves the animation `scalingFactor` from its current value. A less naive response
is intended to be implemented in the near future.

##Advanced Methods

**Easy** animations can take on more advanced forms to increase performance and animate non-numerical properties.

###Parasitic Animations

Parasitic animations are when other animations feed off of a host animation by wrapping shared values in a closure, the
following example shows animating a collection of objects using the default ease. Only the first animation performs
any calculations, this is the host animation all of the rest are parasite animations.
```javascript
    //This particular example only makes sense if all objects already have the same z value
    function moveAllObjectsToAltitudeOneHundred(arrayOfObjects){

        //pre-calculations
        var cc = (arrayOfObjects[0].z - 100) * 0.5
            , cos = Math.cos
            , pi = Math.PI
            , val
            , hostEaseFn = function(obj, prop, s, e, p){
                obj[prop] = val = cc * (cos(p * pi) + 1) + e;   //host does all the work

            }
            , paraEaseFn = function(obj, prop, s, t, e){
                obj[prop] = val;                                //so the parasites don't have to
            }
            , tmpEaseFn = hostEaseFn
            ;

        for(var i = 0, l = arrayOfObjects.length; i < l; i++){
            Easy.animate({
                obj:arrayOfObjects[i].position,
                prop:'z',
                end:100,
                ease:tmpEaseFn
            });
            tmpEaseFn = paraEaseFn;
        }
    }
```

A few important things to note about using **parasite** animations:

+   If the host dies the parasites linger on - **this is bad**

    If the host animation is cancelled or overridden the associated parasite animations will continue running using CPU cycles
    but they won't actually animate properly, considering the above example if the host animation was cancelled the rest would
    freeze at the point where the host left off until in their last frames their **z** values would snap to 100.

+   Parasite animations can still be cancelled / overridden just like normal animations - **this is good**

    If one of the parasite object properties being animated has another animation called on it, this will cancel the parasite
    animation on that object property so no processing power is wasted running the old animation.

###Stowaway Animations

Very similar in effect to parasite animations, only inversely implemented:

```javascript
    //This particular example only makes sense if all objects already have the same z value
    function moveAllObjectsToAltitudeOneHundred(arrayOfObjects){

        //pre-calculations
        var cc = (arrayOfObjects[0].z - 100) * 0.5
            , cos = Math.cos
            , pi = Math.PI
            , easeFn = function(obj, prop, s, t, p){
                obj[prop] = cc * (cos(p * pi) + 1) + t;     //the main object performs the calculation
                arrayOfObjects.forEach(                     //and then assigns the value to all the stowaways inside its own easing function
                    function(el, idx, arr){
                        el.position.z = obj[prop];
                    }
                );
            }
            ;

        Easy.animate({
            obj:arrayOfObjects[0].position,
            prop:'z',
            end:100,
            ease:easeFn
        });
    }
```

A few important things to note about using **stowaway** animations:

+   If the main dies so do the stowaways - **this is good**

    If the main animation is cancelled or overridden the associated stowaway animations will stop immediately so no processing
    power is wasted on them.

+   Stowaway animations cannot be cancelled / overridden individually - **this is bad**

    If another animation is called on a property which is currently also a stowaway, the new animation is the one which
    will be shown but the old animation will still be running in the background, wasting processing power.

###Non-Numerical Animations

//TODO

