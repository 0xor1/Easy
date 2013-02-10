(function () {


    function app() {

        var threePanel = new THREE.WebGLPanel(document.getElementById("threeDView"))

            //Geos
            , bigSphereGeo
            , midSphereGeo
            , tinySphereGeo

            , bigCubeGeo
            , midCubeGeo
            , tinyCubeGeo

            , bigPyraGeo
            , midPyraGeo
            , tinyPyraGeo

            //Mats
            , whiteMat
            , blackMat
            , redMat
            , greenMat
            , blueMat
            , purpleMat
            ;


        initialiseDomControls();
        threePanel.resize();
        threePanel.start();



        function initialiseDomControls(){

            var playTab = document.getElementById('playTab')
                , pauseTab = document.getElementById('pauseTab')
                ;

            playTab.addEventListener(
                'click',
                Utils.AnimationMaster.play,
                false
            );
            pauseTab.addEventListener(
                'click',
                Utils.AnimationMaster.pause,
                false
            );

        }


    }


    window.addEventListener("load", app, false);


})();
