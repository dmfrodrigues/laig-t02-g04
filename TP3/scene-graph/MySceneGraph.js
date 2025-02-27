const DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var ANIMATIONS_INDEX = 1;
var BINDINGS_INDEX = 2;
var VIEWS_INDEX = 3;
var ILLUMINATION_INDEX = 4;
var LIGHTS_INDEX = 5;
var TEXTURES_INDEX = 6;
var SPRITESHEETS_INDEX = 7;
var MATERIALS_INDEX = 8;
var NODES_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * Constructor for MySceneGraph class.
     * Initializes necessary variables and starts the XML file reading process.
     * @param {string} filename - File that defines the 3D scene
     * @param {XMLScene} scene
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.cameraHandler = new CameraAnimation(scene, this);
        this.scene.graph.piecesBoxAnimation = null;

        this.nodes = [];

        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // Create user data object
        this.userdata = {};

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lsf")
            return "root tag <lsf> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <initials>
        var index;
        if ((index = nodeNames.indexOf("initials")) == -1)
            return "tag <initials> missing";
        else {
            if (index != INITIALS_INDEX)
                this.onXMLMinorError("tag <initials> out of order " + index);

            //Parse initials block
            if ((error = this.parseInitials(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            this.onXMLMinorError("tag <animations> missing");
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");

            //Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <bindings>
        if ((index = nodeNames.indexOf("bindings")) == -1)
            return "tag <bindings> missing";
        else {
            if (index != BINDINGS_INDEX)
                this.onXMLMinorError("tag <bindings> out of order");

            //Parse bindings block
            if ((error = this.parseBindings(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }

        // <illumination>
        if ((index = nodeNames.indexOf("illumination")) == -1)
            return "tag <illumination> missing";
        else {
            if (index != ILLUMINATION_INDEX)
                this.onXMLMinorError("tag <illumination> out of order");

            //Parse illumination block
            if ((error = this.parseIllumination(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <spritesheets>
        if ((index = nodeNames.indexOf("spritesheets")) == -1)
                return "tag <spritesheets> missing";
        else {
            if (index != SPRITESHEETS_INDEX)
                this.onXMLMinorError("tag <spritesheets> out of order");
            //Parse spritesheets block
            if ((error = this.parseSpriteSheets(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <nodes>
        if ((index = nodeNames.indexOf("nodes")) == -1)
            return "tag <nodes> missing";
        else {
            if (index != NODES_INDEX && index != NODES_INDEX-1)
                this.onXMLMinorError("tag <nodes> out of order");

            //Parse nodes block
            if ((error = this.parseNodes(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <initials> block. 
     * @param {initials block element} initialsNode
     */
    parseInitials(initialsNode) {
        var children = initialsNode.children;
        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var dataIndex = nodeNames.indexOf("data");
        var rootIndex = nodeNames.indexOf("root");
        var referenceIndex = nodeNames.indexOf("reference");
        var gameboardIndex = nodeNames.indexOf("gameboard");
        var piecesIndex = nodeNames.indexOf("piece");
        var piecesViewIndex = nodeNames.indexOf("pieceview");
        var piecesBoxAnimIndex = nodeNames.indexOf("piecesboxanim");
        var newPieceIndex = nodeNames.indexOf("newpiecepos");
        var uisIndex = nodeNames.indexOf("uis");
        var audiosIndex = nodeNames.indexOf("audios");
        var p1TransitionIndex = nodeNames.indexOf("p1transition");
        var p2TransitionIndex = nodeNames.indexOf("p2transition");

        // Get data
        if(dataIndex != -1){
            let dataNode = children[dataIndex];
            for(let i = 0; i < dataNode.children.length; ++i){
                let child = dataNode.children[i];
                if(child.nodeName === 'var'){
                    let id = child.id;
                    if(typeof child.attributes.value === 'undefined'){
                        this.onXMLMinorError(`Data var '${id}' does not have value; ignored`);
                        continue;
                    }
                    let value = eval(child.attributes.value.value);
                    this.userdata[id] = value;
                } else {
                    this.onXMLMinorError(`Unknown data tag '${child.nodeName}'`)
                }
            }
        }

        // Get root of the scene.
        if(rootIndex == -1)
            return "No root id defined for scene.";

        var rootNode = children[rootIndex];
        var id = this.reader.getString(rootNode, 'id');
        if (id == null)
            return "No root id defined for scene.";

        this.idRoot = id;

        // Get axis length        
        if(referenceIndex == -1)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        var refNode = children[referenceIndex];
        var axis_length = this.parseFloat(refNode, 'length', "<initials>");
        if (typeof axis_length === "string"){
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");
            axis_length = 1;
        }
        this.referenceLength = axis_length;

        // Get gameboard
        if(gameboardIndex == -1){
            this.onXMLMinorError("No gameboard defined for scene.");
        } else {
            let gameboardNode = children[gameboardIndex];
            let ret = this.parseGameboard(gameboardNode);
            if(typeof ret === 'string') return ret;
        }
        
        // Get pieces
        if(piecesIndex == -1){
            this.onXMLMinorError("No pieces defined for scene.");
        } else {
            let piecesNode = children[piecesIndex];
            let pieces = new PiecesSetup();
            pieces.idObj = this.parseString(piecesNode, "id", "pieces");
            let height = this.parseFloat(piecesNode, "height", "pieces"); if(typeof height === 'string') return height;
            pieces.height = height;

            let piecesViewNode = children[piecesViewIndex];
            let piecesView = this.parseString(piecesViewNode, "classname", "piecesView");
            pieces.view = eval("new " + piecesView + "(this.scene)");
            pieces.view.setGameboardSetup(this.gameboard);
            pieces.view.setPieceSetup(pieces);

            this._pieces = pieces;
        }

        // Get pieces box
        if(piecesBoxAnimIndex == -1){
            this.onXMLMinorError("No piece box defined for scene.");
        } else {
            let piecesBoxAnimNode = children[piecesBoxAnimIndex];
            this._piecesBox = this.parseString(piecesBoxAnimNode, "id", "piecesbox");
            this._piecesBoxAnimID = this.parseString(piecesBoxAnimNode, "animationref", "piecesboxanimid");
        }

        // Get  new piece pos
        if(newPieceIndex == -1){
                this.onXMLMinorError("No new piece pos defined for scene.");
        } else {
            let newPieceNode = children[newPieceIndex];
            let x = this.parseFloat(newPieceNode, 'x', 'newpiecepos'); if(typeof x === 'string') return x;
            let y = this.parseFloat(newPieceNode, 'y', 'newpiecepos'); if(typeof y === 'string') return y;
            let z = this.parseFloat(newPieceNode, 'z', 'newpiecepos'); if(typeof z === 'string') return z;
            this._newPiecePos = vec3.fromValues(x, y, z);
        }
        
        // Get UIs

        if(uisIndex == -1){
            this.onXMLMinorError("No uis defined for scene.");
        } else {
            let uisNode = children[uisIndex];
            let ret = this.parseUIs(uisNode);
            if(typeof ret === 'string') return ret;
        }

        // Get audios
        this.audios = [];
        if(audiosIndex !== -1){
            let audiosNode = children[audiosIndex];
            for(let i = 0; i < audiosNode.children.length; ++i){
                let audioNode = audiosNode.children[i];
                if(audioNode.nodeName === 'audio'){
                    if(typeof audioNode.attributes.url === 'undefined'){
                        this.onXMLMinorError("Audio does not have URL, ignoring");
                        continue;
                    }

                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const audio = audioContext.createBufferSource();
                    
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', audioNode.attributes.url.value);
                    xhr.responseType = 'arraybuffer';
                    xhr.addEventListener('load', () => {
                        audioContext.decodeAudioData(xhr.response).then((audioBuffer) => {
                            audio.buffer = audioBuffer;
                            audio.loop = true;
                            if(typeof audioNode.attributes.volume !== 'undefined'){
                                const gainNode = audioContext.createGain();
                                gainNode.gain.value = this.parseFloat(audioNode, 'volume', '<audio>');
                                gainNode.connect(audioContext.destination);
                                audio.connect(gainNode);
                                gainNode.connect(audioContext.destination);
                            } else {
                                audio.connect(audioContext.destination);
                            }
                        });
                    });
                    xhr.send();
                    
                    this.audios.push(audio);
                } else {
                    this.onXMLMinorError(`Unknown node name '${audioNode.nodeName}' in <audios>`);
                }
            }
        } else this.onXMLMinorError("No audios defined for scene");
        
        // Get Player 1 camera transition

        if(p1TransitionIndex == -1){
            this.onXMLMinorError("No player 1 transition defined for scene.");
        } else {
            let p1TransitionNode = children[p1TransitionIndex];
            
            this.cameraHandler.lastinstant1 = this.parseFloat(p1TransitionNode, "lastinstant");

            for(let i = 0; i < p1TransitionNode.children.length; ++i){
                let keyframe = p1TransitionNode.children[i];
                let instant = this.parseFloat(keyframe, "instant");
                
                let fx = this.parseFloat(keyframe, "fx");
                let fy = this.parseFloat(keyframe, "fy");
                let fz = this.parseFloat(keyframe, "fz");

                let tx = this.parseFloat(keyframe, "tx");
                let ty = this.parseFloat(keyframe, "ty");
                let tz = this.parseFloat(keyframe, "tz");

                this.cameraHandler.transitions1[instant] =
                new CameraKeyframe(vec3.fromValues(fx, fy, fz), vec3.fromValues(tx, ty, tz));
            }
        }

        // Get Player 2 camera transition

        if(p2TransitionIndex == -1){
            this.onXMLMinorError("No player 2 transition defined for scene.");
        } else {
            let p2TransitionNode = children[p2TransitionIndex];
            
            this.cameraHandler.lastinstant2 = this.parseFloat(p2TransitionNode, "lastinstant");
            
            for(let i = 0; i < p2TransitionNode.children.length; ++i){
                let keyframe = p2TransitionNode.children[i];
                let instant = this.parseFloat(keyframe, "instant");
                
                let fx = this.parseFloat(keyframe, "fx");
                let fy = this.parseFloat(keyframe, "fy");
                let fz = this.parseFloat(keyframe, "fz");

                let tx = this.parseFloat(keyframe, "tx");
                let ty = this.parseFloat(keyframe, "ty");
                let tz = this.parseFloat(keyframe, "tz");

                this.cameraHandler.transitions2[instant] =
                new CameraKeyframe(vec4.fromValues(fx, fy, fz, 0), vec4.fromValues(tx, ty, tz, 0));
            }
        }

        this.log("Parsed initials");

        return null;
    }

    /**
     * Parses the <gameboard> block.
     * @param {gameboard block element} node 
     */
    parseGameboard(node){
        let gameboard = new GameboardSetup();

        let idGameboard = this.reader.getString(node, 'id');
        if(idGameboard == null)
            return "No gameboard ID defined for scene.";
        gameboard.idObj = idGameboard;

        let gameboardChildren = [...node.children];
        let transformations = gameboardChildren.find(function (u){ return (u.nodeName === 'transformations'); });
        let M = this.parseTransformations(transformations, "gameboard"); if(typeof M === "string") return M;
        gameboard.transformation = M;

        let cells = gameboardChildren.find(function (u){ return (u.nodeName === 'cells'); });
        gameboard.idObjCell = this.parseString(cells, 'id');
        let cellsChildren = cells.children;
        for(let u of cellsChildren){
            if(u.nodeName !== 'cell') continue;
            let i = this.parseInt  (u, 'i', 'gameboard'); if(typeof i === 'string') return i;
            let j = this.parseInt  (u, 'j', 'gameboard'); if(typeof j === 'string') return j;
            let x = this.parseFloat(u, 'x', 'gameboard'); if(typeof x === 'string') return x;
            let y = this.parseFloat(u, 'y', 'gameboard'); if(typeof y === 'string') return y;
            let z = this.parseFloat(u, 'z', 'gameboard'); if(typeof z === 'string') return z;
            gameboard.setCellPosition(i, j, vec3.fromValues(x, y, z));
        }

        this._gameboard = gameboard;

        return null;
    }

    /**
     * Parses the <uis> block.
     * @param {uis block element} node 
     */
    parseUIs(node){

        this.uis = {};

        for(let i = 0; i < node.children.length; ++i){
            let uiNode = node.children[i];
        let ui = new UserInterface(this.scene);

        let idUI = this.reader.getString(uiNode, 'id');
        if(idUI == null)
            return "No UI ID defined for scene.";
        ui.idObj = idUI;

        let uiChildren = [...uiNode.children];
        let transformations = uiChildren.find(function (u){ return (u.nodeName === 'transformations'); });
        let M = this.parseTransformations(transformations, "ui"); if(typeof M === "string") return M;
        ui.transformation = M;

        let panelID = uiChildren.find(function (u){ return (u.nodeName === 'panel'); });
        ui.panelID = this.parseString(panelID, 'id');

        let valueID = uiChildren.find(function (u){ return (u.nodeName === 'value') });
        ui.valueID = this.parseString(valueID, 'id');

        let buttons = uiChildren.find(function (u){ return (u.nodeName === 'buttons'); });
        
        let buttonsChildren = buttons.children;
        for(let u of buttonsChildren){
            if(u.nodeName !== 'button') continue;
            let button_id = this.parseString  (u, 'id', 'ui');
            ui.addButtonID(button_id);
        }

        this.uis[idUI] = ui;
        }
        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseViews(viewsNode) {
        
        this.views = {};
        this.views.list = {};
        this.views.default = viewsNode.attributes.default.value;

        for(let i = 0; i < viewsNode.children.length; ++i){
            let camera = viewsNode.children[i];
            
            // Checks for repeated IDs.
            if (this.views.list[camera.id] != null)
                return "ID must be unique for each view (conflict: ID = " + camera.id + ")";

            let camera_obj;
            if(camera.nodeName == "perspective"){
                camera_obj = this.parsePerspectiveCamera(camera, camera.id);
            } 
            else if(camera.nodeName == "ortho"){
                camera_obj = this.parseOrthoCamera(camera, camera.id);
            } 
            else if(camera.nodeName == "player1"){
                camera_obj = this.parsePerspectiveCamera(camera, camera.id);
                this.views.p1_camera = camera.id;
            }
            else if(camera.nodeName == "player2"){
                camera_obj = this.parsePerspectiveCamera(camera, camera.id);
                this.views.p2_camera = camera.id;
            }
            else if(camera.nodeName == "movecamera"){
                camera_obj = this.parsePerspectiveCamera(camera, camera.id);
                this.views.move_camera= camera.id;
            }
            else {
                this.onXMLMinorError(`no such camera type "${camera.nodeName}"; ignored`);
                continue;
            }
            if(typeof camera_obj === "string") return camera_obj;
            this.views.list[camera.id] = camera_obj;
        }

        if(Object.keys(this.views.list).length == 0){
            this.views.list["default"] = new CGFcamera(
                45.0*DEGREE_TO_RAD,
                0.1,
                500,
                vec3.fromValues(1, 1, 1),
                vec3.fromValues(0, 0, 0)
            );
            this.onXMLError(`no views were read; default view being used`);
        }

        if(this.views.list[this.views.default] == null){
            this.views.default = Object.keys(this.views.list)[0];
            this.onXMLError(`no such view "${this.views.default}" to use as default; using "${this.views.default}"`);
        }

        this.views.current = this.views.default;

        if(this.views.p1_camera == undefined
        || this.views.p2_camera == undefined
        || this.views.move_camera == undefined)
        {
            this.onXMLMinorError(`Players cameras not defined properly`);
        }
        else{
            if(this.scene.cameraPosition == 1){
                this.views.current = this.views.p1_camera;
                this.cameraHandler.setCameraPos(this.views.list[this.views.move_camera], this.views.list[this.views.p1_camera]);
            }
            else{
                this.views.current = this.views.p2_camera;
                this.cameraHandler.setCameraPos(this.views.list[this.views.move_camera], this.views.list[this.views.p2_camera]);
            }
        }

        this.log("Parsed views");
        
        return null;
    }

    /**
     * Parses the <illumination> node.
     * @param {illumination block element} illuminationsNode
     */
    parseIllumination(illuminationsNode) {

        var children = illuminationsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        if(ambientIndex >= 0) var color = this.parseColor(children[ambientIndex], "ambient");
        else{
            var color = [1, 1, 1, 1];
            this.onXMLMinorError(`no ambient color; using default ${color}`);
        }
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        if(backgroundIndex >= 0) color = this.parseColor(children[backgroundIndex], "background");
        else{
            color = [1, 1, 1, 1];
            this.onXMLMinorError(`no background color; using default ${color}`);
        }
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed illumination");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebCGF on default shaders.

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "light") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["enable", "position", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["boolean","position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "boolean")
                        var aux = this.parseBoolean(grandChildren[attributeIndex], "value", "enabled attribute for light of ID" + lightId, true);
                    else if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (typeof aux === 'string')
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // build light
            let light = this.scene.lights[i];
            this.lights[lightId] = light;
            light.setPosition(...global[1]);
            light.setAmbient (...global[2]);
            light.setDiffuse (...global[3]);
            light.setSpecular(...global[4]);
            light.setVisible(false);
            if(global[0]) light.enable();
            else          light.disable();
            light.update();

            let enableNode = [...children[i].children].find((node) => (node.nodeName === 'enable'));
            if(typeof enableNode.attributes.bind !== 'undefined'){
                let bindingref = enableNode.attributes.bind.value;
                if(this.bindings[bindingref] !== null){
                    let binding = this.bindings[bindingref];
                    Object.defineProperty(binding, 'value',
                        {
                            set: function (value){ light.enabled = value; binding.changed_value(); },
                            get: function (     ){ return light.enabled;                           }
                        }
                    );
                    binding.changed_value();
                } else {
                    this.onXMLMinorError(`Unknown binding '${bindingref}'`);
                }
            }

            let positionNode = [...children[i].children].find((node) => (node.nodeName === 'position'));
            if(typeof positionNode.attributes.bind !== 'undefined'){
                let bindingref = positionNode.attributes.bind.value;
                if(this.bindings[bindingref] !== null){
                    let binding = this.bindings[bindingref];
                    let self = this;
                    Object.defineProperty(binding, 'value',
                        {
                            set: function (value){
                                if(self.scene.sceneInited){
                                    light.setPosition(
                                        value[0],
                                        value[1],
                                        value[2],
                                        light.position[3]
                                    );
                                    light.update();
                                }
                            },
                            get: function (){
                                return light.position;
                            }
                        }
                    );
                    binding.value = binding.value;
                } else {
                    this.onXMLMinorError(`Unknown binding '${bindingref}'`);
                }
            }

            numLights++;
        }

        if (numLights == 0){
            this.lights["default"] = [
                true,
                [0, 1, 0, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1]
            ];
            this.onXMLMinorError("at least one light must be defined; using default light");
        } else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <bindings> node.
     * @param {bindings block element} bindingsNode
     */
    parseBindings(bindingsNode) {
        this.bindings = {};
        for(let i = 0; i < bindingsNode.children.length; ++i){
            let binding = bindingsNode.children[i];
            let id = binding.id;
            let representation = [...binding.children].find((node) => (node.nodeName === 'representation'));
            if(typeof representation !== 'undefined'){
            let animationref = this.parseString(representation, "animationref", id);
            let animation = this.animations[animationref];
            let t = this.parseFloat(representation, "t", id);
            
            this.bindings[binding.id] = {
                representation: {
                    animation: animation,
                    t: t
                },
                changed_value: function(){
                    animation.update(this.value);
                }
            };
            } else {
                this.bindings[binding.id] = {};
            }
        }


        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.textures = {};
        for(let i = 0; i < texturesNode.children.length; ++i){
            let texture = texturesNode.children[i];

            // Checks for repeated IDs.
            if (this.textures[texture.id] != null)
                return "ID must be unique for each texture (conflict: ID = " + texture.id + ")";

            this.textures[texture.id] = new CGFtexture(
                this.scene,
                texture.attributes.path.value
            );
        }

        this.log("Parsed textures");

        return null;
    }


    /**
     * Parses the <spritesheets> block. 
     * @param {spritesheets block element} spriteSheetNode
     */
    parseSpriteSheets(spriteSheetNode){
        this.spriteSheets = {};
        for(let i = 0; i < spriteSheetNode.children.length; ++i){
            let spriteSheet = spriteSheetNode.children[i];
            // Checks for repeated IDs.
            if (this.spriteSheets[spriteSheet.id] != null)
                return "ID must be unique for each sprite sheet (conflict: ID = " + spriteSheet.id + ")";
            this.spriteSheets[spriteSheet.id] = new MySpriteSheet(
                this.scene,
                spriteSheet.attributes.path.value,
                spriteSheet.attributes.sizeM.value, 
                spriteSheet.attributes.sizeN.value
            );
        }

        this.log("Parsed sprite sheets");

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            grandChildren = children[i].children;
            
            nodeNames = [];

            var mat = new CGFappearance(this.scene);
            
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            let ambientIndex   = nodeNames.indexOf("ambient"  ); 
            let diffuseIndex   = nodeNames.indexOf("diffuse"  ); 
            let emissionIndex  = nodeNames.indexOf("emissive" ); 
            let specularIndex  = nodeNames.indexOf("specular" ); 
            let shininessIndex = nodeNames.indexOf("shininess");

            if(ambientIndex  >= 0){ mat.ambient  = this.parseColor(grandChildren[ambientIndex ], "ambient" ); if(typeof mat.ambient  === "string") return mat.ambient ; }
            else { this.onXMLMinorError("missing "+"ambient" +" component, using default value"); mat.ambient  = [0, 0, 0, 1]; }
            if(diffuseIndex  >= 0){ mat.diffuse  = this.parseColor(grandChildren[diffuseIndex ], "diffuse" ); if(typeof mat.diffuse  === "string") return mat.diffuse ; }
            else { this.onXMLMinorError("missing "+"diffuse" +" component, using default value"); mat.diffuse  = [1, 1, 1, 1]; }
            if(emissionIndex >= 0){ mat.emission = this.parseColor(grandChildren[emissionIndex], "emissive"); if(typeof mat.emission === "string") return mat.emission; }
            else { this.onXMLMinorError("missing "+"emissive"+" component, using default value"); mat.emission = [0, 0, 0, 1]; }
            if(specularIndex >= 0){ mat.specular = this.parseColor(grandChildren[specularIndex], "specular"); if(typeof mat.specular === "string") return mat.specular; }
            else { this.onXMLMinorError("missing "+"specular"+" component, using default value"); mat.specular =           1 ; }
            
            mat.shininess = this.parseFloat(grandChildren[shininessIndex], "value");
            if(typeof mat.shininess === "string") return mat.shininess;

            mat.setTextureWrap('REPEAT', 'REPEAT');

            this.materials[materialID] = mat;
        }

        this.scene.materials = this.materials;

        this.log("Parsed materials");

        return null;
    }

    parseAnimations(animationsNode) {
        this.animations = {};
        for(let i = 0; i < animationsNode.children.length; ++i){
            let animation = animationsNode.children[i];

            // Checks for repeated IDs.
            if (this.animations[animation.id] != null)
                return "ID must be unique for each animation (conflict: ID = " + animation.id + ")";
            
            let loop = (animation.attributes.loop == null ? false : Number(animation.attributes.loop.value));

            let anim = new KeyframeAnimation(this.scene, loop);

            if(animation.attributes.easing != null)
                anim.setEasing(animation.attributes.easing.value);

            for(let i = 0; i < animation.children.length; ++i){
                let keyframe = animation.children[i];
                let instant = this.parseFloat(keyframe, "instant");

                let x, y, z, rx, ry, rz, sx, sy, sz;

                for(let j = 0; j < keyframe.children.length; ++j){
                    let trans = keyframe.children[j];

                    switch(trans.nodeName){
                        case "translation":
                            if(x != undefined || y != undefined || z != undefined) return `translation already defined for this keyframe`;
                            x = this.parseFloat(trans, "x"); if(typeof x === "string") return x;
                            y = this.parseFloat(trans, "y"); if(typeof y === "string") return y;
                            z = this.parseFloat(trans, "z"); if(typeof z === "string") return z;
                            break;
                        case "rotation":
                            let axis = trans.attributes.axis.value; if(axis === undefined) return `undefined axis in keyframe rotation`;
                            let angle = this.parseFloat(trans, "angle"); if(typeof angle === "string") return angle;
                            angle *= DEGREE_TO_RAD;
                            switch(axis){
                                case "x": if(rx != undefined) return `rotation in axis ${axis} already defined for this keyframe`; rx = angle; break;
                                case "y": if(ry != undefined) return `rotation in axis ${axis} already defined for this keyframe`; ry = angle; break;
                                case "z": if(rz != undefined) return `rotation in axis ${axis} already defined for this keyframe`; rz = angle; break;
                                default: return `no such axis "${axis}"`;
                            }
                            break;
                        case "scale":
                            if(sx != undefined || sy != undefined || sz != undefined) return `translation already defined for this keyframe`;
                            sx = this.parseFloat(trans, "sx"); if(typeof sx === "string") return sx;
                            sy = this.parseFloat(trans, "sy"); if(typeof sy === "string") return sy;
                            sz = this.parseFloat(trans, "sz"); if(typeof sz === "string") return sz;
                            break;
                        default: return `no such transformation type "${trans.nodeName}"`;
                    }
                }

                if( x === undefined)  x = 0;
                if( y === undefined)  y = 0;
                if( z === undefined)  z = 0;
                if(rx === undefined) rx = 0;
                if(ry === undefined) ry = 0;
                if(rz === undefined) rz = 0;
                if(sx === undefined) sx = 1;
                if(sy === undefined) sy = 1;
                if(sz === undefined) sz = 1;

                let kf = new Keyframe(x, y, z, rx, ry, rz, sx, sy, sz);
                anim.addKeyframe(instant, kf);
            }

            if(typeof animation.attributes.timeupdate !== 'undefined'){
                let timeupdate = this.parseBoolean(animation, "timeupdate", animation.id, true);
                if(!timeupdate) anim.timeupdate = false;
            }

            if(typeof animation.attributes.onupdate !== 'undefined'){
                let onupdate = animation.attributes.onupdate.value;
                let onupdate_func = new Function(onupdate);
                anim.onupdate = onupdate_func.bind(this);
            }

            this.animations[animation.id] = anim;
        }

        this.log("Parsed animations");

        return null;
    }

    /**
     * Parses transformations.
     * @param {transformations array} transformations
     * @param {string} nodeID
     */
    parseTransformations(transformations, nodeID){
        let M = mat4.create();
        if(transformations != null){
            for(let i = 0; i < transformations.children.length; ++i){
                let trans = transformations.children[i];
                switch(trans.nodeName){
                    case "translation":
                        let T = this.parseCoordinates3D(trans); if(typeof T === "string") return T;
                        mat4.translate(M, M, vec3.fromValues(...T));
                        break;
                    case "rotation":
                        let angle = this.parseFloat(trans, 'angle', `<transformations>, node ${nodeID}`); if(typeof angle === "string") return angle;
                        angle *= DEGREE_TO_RAD;
                        if(trans.attributes.axis  == null) return `rotation of node ${nodeID} is missing axis`;
                        switch(trans.attributes.axis.value){
                            case "x": mat4.rotateX(M, M, angle); break;
                            case "y": mat4.rotateY(M, M, angle); break;
                            case "z": mat4.rotateZ(M, M, angle); break;
                            default: return `no such rotation axis "${trans.attributes.axis.value}"`;
                        }
                        break;
                    case "scale":
                        let sx = this.parseFloat(trans, 'sx', `<transformations>, node ${nodeID}`); if(typeof sx === "string") return sx;
                        let sy = this.parseFloat(trans, 'sy', `<transformations>, node ${nodeID}`); if(typeof sy === "string") return sy;
                        let sz = this.parseFloat(trans, 'sz', `<transformations>, node ${nodeID}`); if(typeof sz === "string") return sz;
                        mat4.scale(M, M, vec3.fromValues(sx, sy, sz));
                        break;
                    default:
                        return `no such transformation "${trans.nodeName}"`;
                }
            }
        }
        return M;
    }

    /**
     * Parses the <nodes> block.
     * @param {nodes block element} nodesNode
     */
    parseNodes(nodesNode) {
        this.spriteAnimations = [];
        this.spriteTexts = [];

        var children = nodesNode.children;

        this.nodes = [];

        var grandChildren = [];
        var nodeNames = [];

        let nodeDescendants = {};

        // Any number of nodes.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "node") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current node.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null)
                return "no ID defined for nodeID";

            // Dropbox
            let dropbox = null;
            if(typeof children[i].attributes.dropbox !== 'undefined'){
                dropbox = this.reader.getString(children[i], 'dropbox');
            }

            // Checks for repeated IDs.
            if (this.nodes[nodeID] != null)
                return "ID must be unique for each node (conflict: ID = " + nodeID + ")";

            // On click
            let onclick = null;
            if (typeof children[i].attributes.onclick !== 'undefined'){
                onclick = this.reader.getString(children[i], 'onclick');
            }

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationsIndex = nodeNames.indexOf("transformations");
            var materialIndex = nodeNames.indexOf("material");
            var textureIndex = nodeNames.indexOf("texture");
            var descendantsIndex = nodeNames.indexOf("descendants");
            var animationRefIndex = nodeNames.indexOf("animationref");

            let node = new Node(this.scene, nodeID);
            node.setDropbox(dropbox);
            if(onclick !== null){
                let onclick_func = new Function(onclick);
                node.onclick = onclick_func.bind(this);
            }
            // Transformations
            let transformations = grandChildren[transformationsIndex];
            let M = this.parseTransformations(transformations, nodeID); if(typeof M === "string") return M;
            node.setTransformation(M);
            // Material
            let material = grandChildren[materialIndex];
            if(material == null) return `<material> block is mandatory (node "${nodeID}")`;
            let mat = (material.id == "null" ? "same" : this.materials[material.id]);
            if(mat == null) return `no such material "${material.id}"`;
            node.setMaterial(mat);

            let selectedid = material.attributes.selectedid;
            if(selectedid != undefined){
                selectedid = selectedid.value;
                let selectedmat = (selectedid == "null" ? "same" : this.materials[selectedid]);
                node.setSelectedMaterial(selectedmat);
            }
            // Texture
            let texture = grandChildren[textureIndex];
            if(texture  == null) return `<texture> block is mandatory (node "${nodeID}")`;
            let tex;
            switch(texture.id){
                case "null" : tex = "same"; break;
                case "clear": tex = null; break;
                default: tex = this.textures[texture.id]; break;
            }
            if(typeof tex == "undefined") return `no such texture "${texture.id}"`;
            node.setTexture (tex);
            let afs = undefined, aft = undefined;
            for(let i = 0; i < texture.children.length; ++i){
                let child = texture.children[i];
                switch(child.nodeName){
                    case "amplification":
                        afs = this.parseFloat(child, 'afs', `<texture>, node ${nodeID}`); if(typeof afs === "string") return afs;
                        aft = this.parseFloat(child, 'aft', `<texture>, node ${nodeID}`); if(typeof aft === "string") return aft;
                        break;
                    default: return `block with tag "${child.nodeName}" not allowed inside <texture> block`;
                }
            }
            if(afs == null || aft == null){
                if(texture.id != "clear") console.warn(`node "${nodeID}": Undefined amplification, using defaults`);
                afs = 1; aft = 1;
            } else {
                if(texture.id == "clear") console.warn(`node "${nodeID}": Texture "clear" does not require amplification`);
            }

            // AnimationRef
            let animationref = grandChildren[animationRefIndex];
            if(animationref != null){
                let animation = this.animations[animationref.id];
                if(animation == null) return `no such animation "${animationref.id}"`;
                node.setAnimation(animation);
            }

            // Descendants
            let descendants = grandChildren[descendantsIndex].children;
            nodeDescendants[nodeID] = [];
            for(let j = 0; j < descendants.length; ++j){
                let descendant = descendants[j];
                if(descendant.nodeName == 'noderef'){
                    node.addChild(descendant.id);
                } else if(descendant.nodeName == 'leaf'){
                    let leaf = {};
                    switch(descendant.attributes.type.value){
                        case "rectangle" : leaf = this.parseRectangle      (descendant, afs, aft, descendant.id); break;
                        case "triangle"  : leaf = this.parseTriangle       (descendant, afs, aft, descendant.id); break;
                        case "cylinder"  : leaf = this.parseCylinder       (descendant,           descendant.id); break;
                        case "sphere"    : leaf = this.parseSphere         (descendant,           descendant.id); break;
                        case "torus"     : leaf = this.parseTorus          (descendant,           descendant.id); break;
                        case "plane"     : leaf = this.parsePlane          (descendant,           descendant.id); break;
                        case "patch"     : leaf = this.parsePatch          (descendant, afs, aft, descendant.id); break;
                        case "defbarrel" : leaf = this.parseBarrel         (descendant,           descendant.id); break;
                        case "spritetext": leaf = this.parseSpriteText     (descendant,           descendant.id); break;
                        case "spriteanim": leaf = this.parseSpriteAnimation(descendant,           descendant.id); break;
                        case "vertex"    : leaf = this.parseVertex         (descendant,           descendant.id); break;
                        case "obj"       : leaf = this.parseObj            (descendant,           descendant.id); break;
                        default:
                            return `no such leaf type "${descendant.attributes.type}"`;
                    }
                    if(typeof leaf === "string") return leaf;
                    if(descendant.attributes.type.value === "spriteanim") this.spriteAnimations.push(leaf);
                    if(descendant.attributes.type.value === "spritetext") this.spriteTexts.push(leaf);
                    node.addChild(leaf);
                } else return `no such descendant type "${descendant.nodeName}"`;
            }

            if(this.nodes[nodeID] != null) return "node with same id already exists";
            this.nodes[nodeID] = node;
        }

        for(let nodeID in this.nodes){
            this.nodes[nodeID].resolveChildren((ID) => this.nodes[ID]);
        }

        if(this.nodes[this.idRoot] == null)
            return `No such root node "${this.idRoot}"`;

        if(this._gameboard){
            if(this.nodes[this._gameboard.idObj] == null)
                return `No such gameboard node "${this._gameboard.idObj}"`;
            else
                this._gameboard.obj = this.nodes[this._gameboard.idObj];

            if(this.nodes[this._gameboard.idObjCell] == null)
                return `No such cell node "${this._gameboard.idObjCell}"`;
            else
                this._gameboard.objCell = this.nodes[this._gameboard.idObjCell];
        }

        if(this._pieces){
            if(this.nodes[this._pieces.idObj] == null)
                return `No such piece node "${this._pieces.idObj}"`;
            else
                this._pieces.obj = this.nodes[this._pieces.idObj];
        }

        for(let i in this.uis)
        {
            if(this.nodes[this.uis[i].panelID] == null)
                return `No such panel node "${this.uis[i].panelID}"`;
            else
                this.uis[i].panel = this.nodes[this.uis[i].panelID];

            if(this.nodes[this.uis[i].valueID] == null)
                return `No such value node "${this.uis[i].valueID}"`;
            else
                this.uis[i].valueNode =
                    this.nodes[this.uis[i].valueID].children
                    .find(function (u){ return (u instanceof MySpriteText); });

            for(let k=0; k<this.uis[i].buttonsIDs.length;k++){
                if(this.nodes[this.uis[i].buttonsIDs[k]] == null)
                    return `No such button node "${this.uis[i].buttonsIDs[k]}"`;
                else{
                    let button = new Button(this.scene);
                    button.obj = this.nodes[this.uis[i].buttonsIDs[k]];
                    button.idObj = this.uis[i].buttonsIDs[k];
                    this.uis[i].buttons.push(button);
                }
            }
        }

        if(this._piecesBox){
            if(this.nodes[this._piecesBox] == null)
                return `No such pieces box node "${this._piecesBox}"`;
            else
                this._piecesBox = this.nodes[this._piecesBox];
        }
        
        this.log("Parsed nodes");
    }

    /**
     * Parses a boolean
     * @param {XMLnode} node XML node
     * @param {string} name Name
     * @param {string} messageError String to print in case of error
     */
    parseBoolean(node, name, messageError, default_val){
        var boolVal;
        boolVal = this.reader.getBoolean(node, name);
        if (!(boolVal != null &&
              !isNaN(boolVal) &&
              (boolVal == true || boolVal == false))){
            if(default_val != null) return default_val;
            return `unable to parse value component "${messageError}"`;
        }
        return boolVal;
    }

    /**
     * Parses a float
     * @param {XMLnode} node XML node
     * @param {string} name Name
     * @param {string} messageError String to print in case of error
     */
    parseFloat(node, name, messageError){
        let ret = this.reader.getFloat(node, name);
        if(ret == null || isNaN(ret)) return `unable to parse ${name}: ${messageError}`;
        return ret;
    }

    /**
     * 
     * @param {XMLnode} node XML node
     * @param {string} name Name
     * @param {string} messageError String to print in case of error
     */
    parseInt(node, name, messageError){
        let ret = this.reader.getInteger(node, name);
        if(ret == null || isNaN(ret)) return `unable to parse ${name}: ${messageError}`;
        return ret;
    }

    /**
     * 
     * @param {XMLnode} node XML node
     * @param {string} name Name
     * @param {string} messageError String to print in case of error
     */
    parseString(node, name, messageError){
        let ret = this.reader.getString(node, name);
        if(ret == null) return `unable to parse ${name}: ${messageError}`;
        return ret;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        let x = this.parseFloat(node, 'x', messageError); if (typeof x === "string") return x;
        let y = this.parseFloat(node, 'y', messageError); if (typeof y === "string") return y;
        let z = this.parseFloat(node, 'z', messageError); if (typeof z === "string") return z;

        return [x,y,z];
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        let position = this.parseCoordinates3D(node, messageError);
        if (!Array.isArray(position))
            return position;

        let w = this.parseFloat(node, 'w', messageError); if(typeof w === "string") return w;
        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        let r = this.parseFloat(node, 'r', messageError); if(typeof r === "string") return r; if(!(0 <= r && r <= 1)) return `r component outside range: ${messageError}`;
        let g = this.parseFloat(node, 'g', messageError); if(typeof g === "string") return g; if(!(0 <= g && g <= 1)) return `g component outside range: ${messageError}`;
        let b = this.parseFloat(node, 'b', messageError); if(typeof b === "string") return b; if(!(0 <= b && b <= 1)) return `b component outside range: ${messageError}`;
        let a = this.parseFloat(node, 'a', messageError); if(typeof a === "string") return a; if(!(0 <= a && a <= 1)) return `a component outside range: ${messageError}`;

        return [r,g,b,a];
    }

    /**
     * Parse the perspective camera from a node
     * @param {block element} camera
     * @param {message to be displayed in case of error} messageError
     */
    parsePerspectiveCamera(camera, messageError){
        let fromAttr = null;
        let toAttr   = null;
        for(let j = 0; j < camera.children.length; ++j){
            if(camera.children[j].nodeName == "from") fromAttr = camera.children[j];
            if(camera.children[j].nodeName == "to"  ) toAttr   = camera.children[j];
        }
        if(fromAttr === null) return `does not have fromAttr: ${messageError}`;
        if(toAttr   === null) return `does not have toAttr  : ${messageError}`;

        let angle  = this.parseFloat(camera, 'angle' , camera.id); if(typeof angle  === "string") return angle ;
        let near   = this.parseFloat(camera, 'near'  , camera.id); if(typeof near   === "string") return near  ;
        let far    = this.parseFloat(camera, 'far'   , camera.id); if(typeof far    === "string") return far   ;
        let from   = this.parseCoordinates3D(fromAttr, camera.id); if(typeof from   === "string") return from  ;
        let to     = this.parseCoordinates3D(toAttr  , camera.id); if(typeof to     === "string") return to    ;

        return new CGFcamera(angle*DEGREE_TO_RAD, near, far, vec3.fromValues(...from), vec3.fromValues(...to));
    }

    /**
     * Parse the orthographic camera from a node
     * @param {block element} camera
     * @param {message to be displayed in case of error} messageError
     */
    parseOrthoCamera(camera, messageError){
        let fromAttr = null;
        let toAttr   = null;
        let upAttr   = null;
        for(let j = 0; j < camera.children.length; ++j){
            if(camera.children[j].nodeName == "from") fromAttr = camera.children[j];
            if(camera.children[j].nodeName == "to"  ) toAttr   = camera.children[j];
            if(camera.children[j].nodeName == "up"  ) upAttr   = camera.children[j];
        }
        if(fromAttr === null) return `does not have fromAttr: ${messageError}`;
        if(toAttr   === null) return `does not have toAttr  : ${messageError}`;
        if(upAttr   === null) return `does not have upAttr  : ${messageError}`;

        let left   = this.parseFloat(camera, 'left'  , camera.id); if(typeof left   === "string") return left  ;
        let right  = this.parseFloat(camera, 'right' , camera.id); if(typeof right  === "string") return right ;
        let bottom = this.parseFloat(camera, 'bottom', camera.id); if(typeof bottom === "string") return bottom;
        let top    = this.parseFloat(camera, 'top'   , camera.id); if(typeof top    === "string") return top   ;
        let near   = this.parseFloat(camera, 'near'  , camera.id); if(typeof near   === "string") return near  ;
        let far    = this.parseFloat(camera, 'far'   , camera.id); if(typeof far    === "string") return far   ;
        let from   = this.parseCoordinates3D(fromAttr, camera.id); if(typeof from   === "string") return from  ;
        let to     = this.parseCoordinates3D(toAttr  , camera.id); if(typeof to     === "string") return to    ;
        let up     = this.parseCoordinates3D(upAttr  , camera.id); if(typeof up     === "string") return up    ;

        return new CGFcameraOrtho(
            left, right, bottom, top, near, far,
            vec3.fromValues(...from), vec3.fromValues(...to), vec3.fromValues(...up)
        );
    }

    /**
     * Parses a rectangle
     * @param {XMLnode} node XML node
     * @param {float} afs Texture amplification factor in s-axis
     * @param {float} aft Texture amplification factor in t-axis
     * @param {string} messageError String to print in case of error
     */
    parseRectangle(node, afs, aft, messageError){
        let x1 = this.parseFloat(node, 'x1', messageError); if(typeof x1 === "string") return x1;
        let y1 = this.parseFloat(node, 'y1', messageError); if(typeof y1 === "string") return y1;
        let x2 = this.parseFloat(node, 'x2', messageError); if(typeof x2 === "string") return x2;
        let y2 = this.parseFloat(node, 'y2', messageError); if(typeof y2 === "string") return y2;
        return new MyRectangle(this.scene, x1, y1, x2, y2, afs, aft);
    }

    /**
     * Parses a triangle
     * @param {XMLnode} node XML node
     * @param {float} afs Texture amplification factor in s-axis
     * @param {float} aft Texture amplification factor in t-axis
     * @param {string} messageError String to print in case of error
     */
    parseTriangle(node, afs, aft, messageError){
        let x1 = this.parseFloat(node, 'x1', messageError); if(typeof x1 === "string") return x1;
        let y1 = this.parseFloat(node, 'y1', messageError); if(typeof y1 === "string") return y1;
        let x2 = this.parseFloat(node, 'x2', messageError); if(typeof x2 === "string") return x2;
        let y2 = this.parseFloat(node, 'y2', messageError); if(typeof y2 === "string") return y2;
        let x3 = this.parseFloat(node, 'x3', messageError); if(typeof x3 === "string") return x3;
        let y3 = this.parseFloat(node, 'y3', messageError); if(typeof y3 === "string") return y3;
        return new MyTriangle(this.scene, x1, y1, x2, y2, x3, y3, afs, aft);
    }

    /**
     * Parses a cylinder
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseCylinder(node, messageError){
        let bottomRadius = this.parseFloat(node, 'bottomRadius', messageError); if(typeof bottomRadius === "string") return bottomRadius;
        let topRadius    = this.parseFloat(node, 'topRadius'   , messageError); if(typeof topRadius    === "string") return topRadius   ;
        let height       = this.parseFloat(node, 'height'      , messageError); if(typeof height       === "string") return height      ;
        let slices       = this.parseFloat(node, 'slices'      , messageError); if(typeof slices       === "string") return slices      ;
        let stacks       = this.parseFloat(node, 'stacks'      , messageError); if(typeof stacks       === "string") return stacks      ;
        return new MyCylinder(this.scene, bottomRadius, topRadius, height, slices, stacks);
    }

    /**
     * Parses a sphere
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseSphere(node, messageError){
        let radius = this.parseFloat(node, 'radius', messageError); if(typeof radius === "string") return radius;
        let slices = this.parseInt  (node, 'slices', messageError); if(typeof slices === "string") return slices;
        let stacks = this.parseInt  (node, 'stacks', messageError); if(typeof stacks === "string") return stacks;
        return new MySphere(this.scene, radius, slices, stacks);
    }

    /**
     * Parses a torus
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseTorus(node, messageError){
        let inner  = this.parseFloat(node, 'inner' , messageError); if(typeof inner  === "string") return inner ;
        let outer  = this.parseFloat(node, 'outer' , messageError); if(typeof outer  === "string") return outer ;
        let slices = this.parseFloat(node, 'slices', messageError); if(typeof slices === "string") return slices;
        let loops  = this.parseFloat(node, 'loops' , messageError); if(typeof loops  === "string") return loops ;
        return new MyTorus(this.scene, inner, outer, slices, loops);
    }

    /**
     * Parses a plane
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parsePlane(node, messageError){
        let npartsU = this.parseInt(node, 'npartsU', messageError); if(typeof npartsU === "string") return npartsU;
        let npartsV = this.parseInt(node, 'npartsV', messageError); if(typeof npartsV === "string") return npartsV;
        return new Plane(this.scene, npartsU, npartsV);
    }

    /**
     * Parses a patch
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parsePatch(node, afs, aft, messageError){
        let npartsU = this.parseInt(node, 'npartsU', messageError); if(typeof npartsU === "string") return npartsU;
        let npartsV = this.parseInt(node, 'npartsV', messageError); if(typeof npartsV === "string") return npartsV;
        
        let npointsU = this.parseInt(node, 'npointsU', messageError); if(typeof npointsU === "string") return npointsU;
        let npointsV = this.parseInt(node, 'npointsV', messageError); if(typeof npointsV === "string") return npointsV;
        if(node.children.length != npointsU*npointsV) return "Invalid length";
        let controlPoints = [];
        for(let u = 0; u < npointsU; ++u){
            controlPoints[u] = [];
            for(let v = 0; v < npointsV; ++v){
                let i = u*npointsV + v;
                let controlPoint = this.parseControlPoint(node.children[i], messageError);
                if(typeof controlPoint === "string") return controlPoint;
                controlPoints[u][v] = controlPoint;
            }
        }
        
        return new Patch(this.scene, npartsU, npartsV, npointsU, npointsV, controlPoints, afs, aft);
    }

    /**
     * Parses a control point
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseControlPoint(node, messageError){
        let x = this.parseFloat(node, 'x', messageError); if(typeof x === "string") return x;
        let y = this.parseFloat(node, 'y', messageError); if(typeof y === "string") return y;
        let z = this.parseFloat(node, 'z', messageError); if(typeof z === "string") return z;
        
        return [x, y, z];
    }

    /**
     * Parses a barrel
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseBarrel(node, messageError){
        let base   = this.parseFloat(node, 'base'  , messageError); if(typeof base   === "string") return base  ;
        let middle = this.parseFloat(node, 'middle', messageError); if(typeof middle === "string") return middle;
        let height = this.parseFloat(node, 'height', messageError); if(typeof height === "string") return height;
        let slices = this.parseInt  (node, 'slices', messageError); if(typeof slices === "string") return slices;
        let stacks = this.parseInt  (node, 'stacks', messageError); if(typeof stacks === "string") return stacks;
        if(typeof node.attributes.angle !== 'undefined'){
            let angle  = this.parseFloat(node, 'angle' , messageError);
            return new Barrel(this.scene, base, middle, height, slices, stacks, angle);
        } else {
            return new Barrel(this.scene, base, middle, height, slices, stacks       );
        }                           
    }

    /**
     * Parses a sprite text
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseSpriteText(node, messageError){
        let font = this.parseString(node, 'font', messageError);
        let text = this.parseString(node, 'text', messageError);
        let exp = null;
        let format = null;
        if(node.attributes.eval != null)
            exp = this.parseString(node, 'eval', messageError);
        if(node.attributes.format != null)
            format = this.parseString(node, 'format', messageError);
        return new MySpriteText(this.scene, this.spriteSheets[font],  text, exp, format);
    }

    /**
     * Parses a sprite animation
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error 
    */
    parseSpriteAnimation(node, messageError){
        let spritesheet = this.parseString(node, 'ssid'     , messageError);
        let duration    = this.parseFloat (node, 'duration' , messageError); if(typeof duration  === "string") return duration;
        let startCell   = this.parseInt   (node, 'startCell', messageError); if(typeof startCell === "string") return startCell;
        let endCell     = this.parseInt   (node, 'endCell'  , messageError); if(typeof endCell   === "string") return endCell ;
        return new MySpriteAnimation(this.scene, spritesheet, startCell, endCell, duration);
    }

    /**
     * Parses a vertex
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseVertex(node, messageError){
        let id = this.parseString(node, 'id', messageError);
        let x = this.parseFloat(node, 'x', messageError); if(typeof x === "string") return x;
        let y = this.parseFloat(node, 'y', messageError); if(typeof y === "string") return y;
        let z = this.parseFloat(node, 'z', messageError); if(typeof z === "string") return z;
        return new Vertex(this.scene, id, x, y, z);
    }

    /**
     * Parses an OBJ object
     * @param {XMLnode} node XML node
     * @param {string} messageError String to print in case of error
     */
    parseObj(node, messageError){
        let url = this.parseString(node, 'url', messageError);
        let ret = new CGFOBJModel(this.scene, "scenes/"+url);
        return ret;
    }

    get gameboard(){
        return this._gameboard;
    }

    get pieces(){
        return this._pieces;
    }

    get piecesBox(){
        return this._piecesBox;
    }

    get piecesBoxAnim(){
        return this._piecesBoxAnimID;
    }

    get newPiecePos(){
        return this._newPiecePos;
    }

    playAudio(){
        console.log(this.audios.length);
        for(let i = 0; i < this.audios.length; ++i){
            let audio = this.audios[i];
            audio.start();
        }
    }

    pauseAudio(){
        console.log(this.audios.length);
        for(let i = 0; i < this.audios.length; ++i){
            let audio = this.audios[i];
            audio.stop();
            console.log("Stopped");
            console.log(audio);
        }
    }

    update(t){
        for (var key in this.animations){
            let animation = this.animations[key];
            if(animation.timeupdate)
                animation.update(t);
        }
        for (let anim in this.spriteAnimations){
            this.spriteAnimations[anim].update(t);
        }
        for (let text in this.spriteTexts){
            this.spriteTexts[text].update();
        }

        this.cameraHandler.handleCameraAnimation(t);

        if(this.scene.graph.piecesBoxAnimation != null){
            this.scene.graph.piecesBoxAnimation.update(t);
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    display() {
        if(typeof this.display.numFrames === 'undefined'){
            this.display.numFrames = 0;
            this.display.startTime = new Date().getTime();
        }

        this.nodes[this.idRoot].display();

        this.display.numFrames++;
        let now = new Date().getTime();
        let seconds_per_frame = ((now-this.display.startTime)/1000)/this.display.numFrames;
        if(this.display.numFrames % 100 === 0) console.log(1/seconds_per_frame);
    }
}
