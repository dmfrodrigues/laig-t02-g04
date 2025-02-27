SECONDS_TO_MILLIS = 1000;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;
        this.cameraPosition = 1;
        this.update.t0 = undefined;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(20);
        this.setPickEnabled(true);
        this.selectEnabled = false;

        this.loadingProgressObject=new MyRectangle(this, -1, -.1, 1, .1);
        this.loadingProgress=0;

        this.defaultAppearance=new CGFappearance(this);

        this.appearance_stack = new Stack();
        this.texture_stack = new Stack();
        this.appearance = this.defaultAppearance;
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        if(this.interface){  
            var folder = this.interface.gui.__folders["Lights"];
            if (folder) {
                folder.close();
                this.interface.gui.__ul.removeChild(folder.domElement.parentNode);
                delete this.interface.gui.__folders["Lights"];
                this.interface.gui.onResize();
            }
            var folder_lights = this.interface.gui.addFolder("Lights");
        }

        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebCGF on default shaders.

            if (this.graph.lights.hasOwnProperty(key)) {
                if(folder_lights) folder_lights.add(this.lights[i], 'enabled').name(key);

                i++;
            }
        }
    }

    createCameraControls(){
        if(this.interface)
            this.interface.gui.add(this.graph.views, 'current', Object.keys(this.graph.views.list)).name('View').onChange(this.updateViews.bind(this));
    
        this.updateViews();
    }

    updateCamera(){
        this.camera = this.graph.views.list[this.graph.views.current];
    }

    updateViews() {
        this.updateCamera();
        if(this.interface) this.interface.setActiveCamera(this.camera);
    }

    /**
     * Update scene stuff that is time-dependent (e.g. animations)
     * 
     * @param {int} time Time since epoch, in milliseconds
     */
    update(time){
        if (typeof this.update.t0 === 'undefined'){
            this.update.t0 = time;
        }
        this.time = (time-this.update.t0)/SECONDS_TO_MILLIS;
        this.orchestrator.update(this.time);
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = null;
        if(this.graph.referenceLength > 0)
            this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(...this.graph.background);

        this.setGlobalAmbientLight(...this.graph.ambient);
        
        if(this.interface)
            for(let i of this.interface.gui.__controllers)
                this.interface.gui.remove(i);

        this.createCameraControls();

        this.initLights();
        
        this.orchestrator.initialize();

        if(!this.sceneInited)
            this.time = 0;

        this.sceneInited = true;
        this.orchestrator.themeInited=true;

        this.graph.playAudio();
    }

    pushAppearance(){
        this.appearance_stack.push(this.appearance);
        this.texture_stack.push(this.texture);
    }
    popAppearance(){
        this.appearance = this.appearance_stack.pop();
        this.texture = this.texture_stack.pop();
        this.appearance.setTexture(this.texture);
        this.appearance.apply();
    }
    setAppearance(material, tex){
        if(material == "same") material = this.appearance_stack.top();
        if(tex      == "same") tex      = this.texture_stack   .top();
        if(!Object.is(this.appearance, material) || !Object.is(this.texture, tex)){
            this.appearance = material;
            this.texture    = tex;
            this.appearance.setTexture(this.texture);
            // finally
            this.appearance.apply();
        }
    }

    selectEnable   (){ this.selectEnabled = true ; }
    selectDisable  (){ this.selectEnabled = false; }
    isSelectEnabled(){ return this.selectEnabled ; }

    /**
     * Displays the scene.
     */
    display() {
        this.orchestrator.managePick(this.pickMode, this.pickResults);
        this.clearPickRegistration();
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            if(this.axis != null) this.axis.display();
 
            this.defaultAppearance.apply();

            // Displays everything
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.orchestrator.display();
            this.gl.disable(this.gl.BLEND); 
        }
        else
        {
            // Show some "loading" visuals
            this.defaultAppearance.apply();

            this.rotate(-this.loadingProgress/10.0,0,0,1);
            
            this.loadingProgressObject.display();
            this.loadingProgress++;
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}