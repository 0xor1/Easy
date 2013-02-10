(function () {

    THREE.WebGLPanel = function (dom) {

        this._isRendering = false;
        this._stopping = false;
        this._interactors = [];
        this._resizeTimer = null;
        this.resize = resize.bind(this);

        this.renderer = new THREE.WebGLRenderer({canvas:dom});
        this.dom = this.renderer.domElement;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.dom.width / this.dom.height, 1, 100000);
        this.controls = new THREE.TrackballControls(this.camera, this.dom);

        this.scene.add(this.camera);

        this.addEventListener('resize', canvasResized.bind(this));

        this.dom.addEventListener('mousedown', mouseDown.bind(this), false);

        this.dom.addEventListener('mouseup', mouseUp.bind(this), false);

        this.dom.addEventListener('click', click.bind(this), false);

        this.dom.addEventListener('dblclick', dblClick.bind(this), false);

        //commented out for performance
        //this.addUIEventListener(this.dom, 'mousemove', mouseMove.bind(this), false);

        window.addEventListener('resize', canvasResized.bind(this), false);

    };


    THREE.WebGLPanel.prototype.add = function (obj) {

        this.scene.add(obj);

        addInteractor.call(this, obj);

        return this;

    };


    THREE.WebGLPanel.prototype.remove = function (obj) {

        this.scene.remove(obj);

        removeInteractor.call(this, obj);

        return this;

    };


    THREE.WebGLPanel.prototype.start = function () {

        var renderer = this.renderer,
            scene = this.scene,
            camera = this.camera,
            controls = this.controls,

            stopping = function () {
                return this._stopping
            }.bind(this),

            stop = function () {
                this._isRendering = false;
                this._stopping = false;
            }.bind(this);


        if (!this._isRendering) {

            this._stopping = false;

            render();

        }

        function render() {
            if (stopping()) {
                stop();
                return;
            }
            renderer.render(scene, camera);
            controls.update();
            requestAnimationFrame(render);
        }

    };


    THREE.WebGLPanel.prototype.stop = function () {

        this._stopping = true

    };


    function canvasResized() {

        if (this._resizeTimer !== null) {
            clearTimeout(this._resizeTimer);
        }

        this._resizeTimer = setTimeout(

            this.resize

            , 200

        );


    };

    function resize() {
        var rect = this.dom.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.camera.aspect = rect.width / rect.height;
        this.controls.handleResize();
        this.camera.updateProjectionMatrix();
    }


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


    function mouse(type, event) {

        var projector = new THREE.Projector(), rect = this.dom.getBoundingClientRect(), vector = new THREE.Vector3(((event.clientX - rect.left) / rect.width ) * 2 - 1, -((event.clientY - rect.top) / rect.height ) * 2 + 1, 0.5);
        projector.unprojectVector(vector, this.camera);

        var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

        var intersects = raycaster.intersectObjects(this._interactors);

        if (intersects.length > 0) {
            if (typeof intersects[0].object[type] === 'function') {
                intersects[0].object[type](event);
            }
        }
    };

    function addInteractor(obj) {

        if (obj instanceof THREE.ClickableMesh) {

            if (typeof obj._clickableIdx === 'undefined') {
                this._interactors.push(obj);
                obj._clickableIdx = this._interactors.length - 1;
            }

        }

        for (var i = 0, l = obj.children.length; i < l; i++) {
            addInteractor.call(this, obj.children[i]);
        }

        return this;

    }


    function removeInteractor(obj) {

        var idx = obj._clickableIdx;

        if (typeof idx !== 'undefined') {
            this._interactors.splice(idx, 1);
            delete obj._clickableIdx;
            for(var i = idx, l = this._interactors.length; i < l; i++ ){
                this._interactors[i]._clickableIdx = i;
            }
        }

        for (var i = 0, l = obj.children.length; i < l; i++) {
            removeInteractor.call(this, obj.children[i]);
        }

        return this;

    }


})();
