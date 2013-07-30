/**
 * 0xor1    http://github.com/0xor1
 */

(function () {

    var interactableIdx = 0;
    
    THREE.FullScreenWebGLPanel = function (dom) {

        var isRendering = false
            , shouldBeRendering = false
            , interactors = {}
            , resizeTimer = null
            , lastTimeMouseMoved = 0
            , blankObj = {dispatchEvent:function(){}}
            , currentMouseOverObj = blankObj
            , blankControls = {
                update:function () {},
                resize:function () {}
            }
            , resizeNow = function () {

                var w = window.innerWidth
                    , h = window.innerHeight
                    ;

                this.renderer.setSize(w, h);
                this.camera.aspect = w / h;
                this.controls.resize();
                this.camera.updateProjectionMatrix();

            }.bind(this)
            , userInteraction = function(event) {

                var projector = new THREE.Projector()
                    , rect = this.dom.getBoundingClientRect()
                    , vector = new THREE.Vector3(((event.clientX - rect.left) / rect.width ) * 2 - 1, -((event.clientY - rect.top) / rect.height ) * 2 + 1, 0.5)
                    , rayCaster
                    , intersects
                    , hitObj = blankObj
                    ;

                projector.unprojectVector(vector, this.camera);

                rayCaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

                intersects = rayCaster.intersectObjects(interactors);

                if (intersects.length > 0) {

                    hitObj = intersects[0].object;

                }

                if(event.type === "mousemove") {

                    //process over and out events
                    if(hitObj !== currentMouseOverObj){

                        event.type = 'mouseout';

                        currentMouseOverObj.dispatchEvent(event);

                        currentMouseOverObj = hitObj;

                        event.type = 'mouseover';

                        currentMouseOverObj.dispatchEvent(event);

                    } else {

                        currentMouseOverObj.dispatchEvent(event);

                    }

                } else {

                    currentMouseOverObj = hitObj;

                    currentMouseOverObj.dispatchEvent(event);

                }

            }.bind(this)
            ;

        this.renderer = new THREE.WebGLRenderer({canvas:dom});

        this.dom = this.renderer.domElement;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, this.dom.width / this.dom.height, 1, 100000);

        this.controls = blankControls;

        this.scene.add(this.camera);


        this.start = function () {

            var render = function () {

                if (!shouldBeRendering) {

                    isRendering = false;

                    return;

                }

                this.renderer.render(this.scene, this.camera);

                this.controls.update();

                requestAnimationFrame(render);

            }.bind(this);

            shouldBeRendering = true;

            if (!isRendering) {

                render();

            }

        };


        this.stop = function(){

            shouldBeRendering = false;

        };

        this.add = function (obj) {

            this.scene.add(obj);

            return this;

        };


        this.remove = function (obj) {

            this.scene.remove(obj);

            return this;

        };


        this.makeInteractable = function (obj) {

            if (obj._interactableIdx === null) {

                obj._interactableIdx = interactableIdx++;

                interactors[obj._interactableIdx] = obj;

            }

            return this;

        };


        this.makeUninteractable = function (obj) {

            if (obj._interactableIdx !== null) {

                delete interactors[obj._interactableIdx];
                
                delete obj._interactableIdx;

            }

            return this;

        };


        this.resizeDelay = 200;

        this.resize = function () {

            if (resizeTimer !== null) {
                clearTimeout(this._resizeTimer);
            }

            this._resizeTimer = setTimeout(

                resizeNow

                , this.resizeDelay

            );

        };


        this.mouseMoveDelay = 200;

        this.mouseMove = function (event) {

            var now = Date.now()
                ;

            if (now - lastTimeMouseMoved > this.mouseMoveDelay) {

                lastTimeMouseMoved = now;

                event.type = 'mousemove';

                userInteraction(event);

            }

        };



        this.dom.addEventListener('mousedown', this.mouseDown, false);

        this.dom.addEventListener('mouseup', this.mouseUp, false);

        this.dom.addEventListener('click', this.click, false);

        this.dom.addEventListener('dblclick', this.dblClick, false);

        this.dom.addEventListener('mousemove', this.mouseMove, false);

        window.addEventListener('resize', this.resize, false);

    };


    function mouseDown(event) {
        mouse.call(this, 'mouseDown', event);
    }


    function mouseUp(event) {
        mouse.call(this, 'mouseUp', event);
    }


    function click(event) {
        mouse.call(this, 'click', event);
    }


    function dblClick(event) {
        mouse.call(this, 'dblClick', event);
    }


    function mouseMove(event) {
        mouse.call(this, 'mouseMove', event);
    }


})();
