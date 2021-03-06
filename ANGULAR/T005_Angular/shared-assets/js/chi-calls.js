class AuthHandler {
    constructor(app, name) {
        this.mApp = app;
        this.mName = name;
    }


    getToken(callback) {
        const url = `${this.mApp.mConfig.callsServer}/call`;
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({sessionId: this.mApp.mRoomId}),
            headers: {'Content-Type': 'application/json'}
        })
            .then((response) => response.text())
            .then((token) => {
                token = token.replace(/"/g, '');
                this.onTokenReceived(token, callback);
            })
            .catch((e) => {
                console.log("Can’t access " + url + " response. Blocked by browser?", e);
                callback(e, null, null);
            });
    }

    onTokenReceived(token, callback) {
        // console.log("Token = ", token);
        const parts = token.split('?');
        const parts2 = parts[1].split('&');

        const queryParams = parts[1].split('&')
            .map(param => param.split('='))
            .reduce((values, [key, value]) => {
                values[key] = value;
                return values;
            }, {});

        const coturnIp = queryParams['coturnIp'];
        const turnUsername = queryParams['turnUsername'];
        const turnCredential = queryParams['turnCredential'];
        if (!!turnUsername && !!turnCredential) {
            const stunUrl = 'stun:' + coturnIp + ':3478';
            const turnUrl1 = 'turn:' + coturnIp + ':3478';
            const turnUrl2 = turnUrl1 + '?transport=tcp';

            const turnUrl3 = 'turn:turn01.cognitivehealthintl.com:3478';
            const turnUrl4 = turnUrl3 + '?transport=tcp';

            this.mApp.mConfig.pcConfig.iceServers = [
                {urls: [stunUrl]},
                {urls: [turnUrl1, turnUrl2], username: turnUsername, credential: turnCredential},
                {urls: [turnUrl3, turnUrl4], username: 'chi', credential: 'chi123'}
            ];
        }

        callback(null, token, `${parts[0]}/openvidu`);
        // this.mApp.onAuthSuccess(token, `${parts[0]}/openvidu`)
    }

}

class CObject
{
    constructor(name)
    {
        this.mName = name;
        this.started = false;
    }

    print()
    {
        console.log(`${this.constructor.name}: ${this.mName}`);
    }

    start()
    {
        this.started = true;
    }

    stop()
    {
        this.started = false;
    }
}

class MultiStateButton extends CObject
{
    constructor(app, name, buttonConfig)
    {
        super(name)
        this.mMainApp = app;
        var top = 0;
        var left = 0;
        // console.log("Creating Button", name, buttonConfig);
        if (name == undefined)
            throw "abc";

        this.mName = name;
        this.element = this.createDiv(buttonConfig);
        this.element.id = buttonConfig.id;
        this.element.comp = this;
        
        this.states = buttonConfig.states;
        this.callback = this.clickFunc;
        if ("top" in buttonConfig)
            this.element.style.top = buttonConfig.top + "px";

        if ("bottom" in buttonConfig)
            this.element.style.bottom = buttonConfig.bottom + "px";

        if ("left" in buttonConfig)
            this.element.style.left = buttonConfig.left + "px";

        if ("right" in buttonConfig)
            this.element.style.right = buttonConfig.right + "px";

        this.states = buttonConfig.states;
        this.numStates = this.states.length;
        this.currentStateNum = 0;

        this.nextState();
    }

    clickFunc(state)
    {
        console.log("Click Func", this.name, state.name);
    }

    createDiv(config)
    {
        var h = config.height / 2;
        this.backDiv = document.createElement('div');
        this.backDiv.classList.add("call-button");

        this.backDiv.style.boxShadow = "inset 0  0 0px " + h / 10 + "px #353A48";
  
        // this.backDiv.classList.add("centerx_on");
        // this.backDiv.style.position = "absolute";
        this.backDiv.style.width = config.width + "px";
        this.backDiv.style.height = config.height + "px";

        this.divi = document.createElement('i');
        
        this.divi.classList.add("material-icons");
        this.divi.style.fontSize = h + "px";
        this.backDiv.appendChild(this.divi);

        this.coverDiv = document.createElement('div');
        this.coverDiv.classList.add("call-button");
        this.coverDiv.classList.add("call-button-glass");
        this.coverDiv.style.width = config.width + "px";
        this.coverDiv.style.height = config.height + "px";

        this.coverDiv.onclick = this.buttonFunc;
        this.coverDiv.onmousedown = this.mouseDown;
        this.backDiv.appendChild(this.coverDiv);
        this.coverDiv.comp = this;

        return this.backDiv;
    }

    mouseDown(e)
    {
        e.stopPropagation();
    }

    printState()
    {
        console.log("ButtonState", this.states[this.currentStateNum].name);
        // return this.states[this.currentStateNum].name;
    }

    buttonFunc(e)
    {
        var comp = e.srcElement.comp;
        // console.log(comp.currentStateNum);
        comp.nextState()
        comp.callback(comp.states[comp.currentStateNum]);
        e.stopPropagation();
    }

    updateState()
    {
        var state = this.states[this.currentStateNum];
        this.divi.innerHTML = state.name;     
        // this.printState();
        this.backDiv.style.backgroundColor = state.color;
    }

    setState(stateName)
    {
        // console.log("state ==== ", stateName);
            
        for (var i in this.states)
        {
            if (this.states[i].name == stateName)
            {
                if (i != this.currentStateNum)
                {
                    this.currentStateNum = i;
                    this.updateState();
                }

                return;
            }
        }

        console.log("not changing state");
    }

    nextState()
    {
        this.currentStateNum =  (this.currentStateNum + 1) % this.numStates;
        this.updateState();
    }
}
class CallEnd extends MultiStateButton {
    constructor(app, caller, name, left, id) {
        var config = {
            id: id,
            name: "CallEndButton",
            left: left,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "call",
                color: "#F00"
            }]
        };
        super(app, name, config);
        this.caller = caller
    }
    clickFunc(state) {
        console.log("End Call", this.mMainApp);
        this.mMainApp.stop();
        this.caller.onHangUp();
        // this.caller.onEndAndroidCall();
    }
}
class CameraSource extends MultiStateButton {
    constructor(app, name, left) {
        var config = {
            name: "CameraSource",
            left: left,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "camera_alt",
                device: "default",
                color: "red"
            }]
        };
        super(app, name, config);
        this.mColors = ["red", "green", "yellow", "blue", "orange"]
    }
    addStates(data) {
        var deviceIDs = Object.keys(data);
        for (var key of deviceIDs) {
            if (key === "default") continue;
            const length = this.states.length;
            this.states.push({
                name: "camera_alt",
                device: key,
                color: this.mColors[length]
            })
        }
        if (!("default" in data)) this.states.splice(0, 1);
        this.numStates = this.states.length
    }
    clickFunc(state) {
        this.mMainApp.app.mCamera.changeSource(state.device)
    }
}
class CameraToggle extends MultiStateButton {
    constructor(app, name, left, id) {
        var config = {
            id: id,
            name: "CameraButton",
            left: left,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "videocam_off",
                color: "#353A48"
            }, {
                name: "videocam",
                color: "#353A48"
            }]
        };
        super(app, name, config)
    }
    clickFunc(state) {
        if (state.name === "videocam") {
            this.mMainApp.mPeerHandler.cameraUnMute()
        } else {
            this.mMainApp.mPeerHandler.cameraMute()
        }
    }
}
class MicSource extends MultiStateButton {
    constructor(app, name, left) {
        var config = {
            name: "MicSource",
            left: left,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "mic",
                device: "default",
                color: "red"
            }]
        };
        super(app, name, config);
        this.mColors = ["red", "green", "yellow", "blue", "orange"]
    }
    addStates(data) {
        for (var key of Object.keys(data)) {
            if (key === "default") continue;
            let length = this.states.length;
            this.states.push({
                name: "mic",
                device: key,
                color: this.mColors[length]
            })
        }
        if (!("default" in data)) this.states.splice(0, 1);
        this.numStates = this.states.length
    }
    clickFunc(state) {
        this.mMainApp.app.mMic.changeSource(state.device)
    }
}
class MicToggle extends MultiStateButton {
    constructor(app, name, left, id) {
        var config = {
            id: id,
            name: "MicButton",
            left: left,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "mic_off",
                color: "#353A48"
            }, {
                name: "mic",
                color: "#353A48"
            }]
        };
        super(app, name, config)
    }
    clickFunc(state) {
        if (state.name === "mic") {
            this.mMainApp.mPeerHandler.micUnMute()
        } else {
            this.mMainApp.mPeerHandler.micMute()
        }
        console.log("Click Func2", this.mName, state.name)
    }
}
class MoreActions extends MultiStateButton {
    constructor(app, caller, name, left, id) {
        var config = {
            id: id,
            name: "MoreButton",
            left: left,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "more_horiz",
                color: "#353A48"
            }]
        };
        super(app, name, config);
        this.caller = caller
    }
    clickFunc(state) {
        this.caller.toggleSidebar('more_options');
        // $("#optDialog").modal("show");
        // console.log("More Button")
    }
}
class PersonAdd extends MultiStateButton {
    constructor(app, caller, name, left, id) {
        var config = {
            id: id,
            name: "AddPerson",
            left: 100,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "person_add",
                color: "#353A48"
            }]
        };
        super(app, name, config);
        this.caller = caller;
    }
    clickFunc(state) {
        // console.log("Call Android To Open Online User List")

        this.caller.toggleSidebar('participants');

    }
}
class ScreenToggle extends MultiStateButton {
    constructor(app, name, left, id) {
        var config = {
            id: id,
            name: "ScreenButton",
            left: left,
            top: 10,
            width: 50,
            height: 50,
            states: [{
                name: "screen_share",
                color: "#353A48"
            }, {
                name: "stop_screen_share",
                color: "#353A48"
            }]
        };
        super(app, name, config)
    }
    clickFunc(state) {
        if (state.name === "screen_share") {
            this.mMainApp.mPeerHandler.screenUnMute()
        } else {
            this.mMainApp.mPeerHandler.screenMute()
        }
    }
}
class BaseCanvas {
    constructor(app, id, parent, pixelX = 1920, pixelY = 1080, width = "100%", height = "100%") {
        this.mId = id
        this.mWidth = width
        this.mHeight = height
        this.mPixelX = pixelX
        this.mPixelY = pixelY
        this.mParent = parent
        this.mApp = app;
        this.mStarted = false;
    }

    init() {
        this.mCanvas = null;
        this.mContext = null;
        this.mStream = null;
        this.mFunHandleMouseDown = null;
        this.mFunHandleMouseMove = null;
        this.mFunHandleMouseUp = null;
        this.mFunHandleMouseOut = null;

        this.mStyle = {
            'position': 'absolute',
            'border': '2px solid green',
            'backgroundColor': null,
            'opacity': 1.0,
            'top': '0px',
            'left': '0px',
            'width': this.mPixelX,
            'height': this.mPixelY
        }
    }

    makeCanvas() {
        this.mDiv = document.createElement("div")
        this.mCanvas = document.createElement("canvas");
        this.mContext = this.mCanvas.getContext("2d")
        this.mCanvas.id = this.mId;
        this.mParent.appendChild(this.mDiv)
        this.mDiv.appendChild(this.mCanvas);
        return this.mCanvas
    }

    styleCanvas() {
        this.mCanvas.style.position = this.mStyle.position;
        this.mCanvas.style.top = this.mStyle.top + "px";
        this.mCanvas.style.left = this.mStyle.left + "px";
        this.mCanvas.style.width = this.mStyle.width + "px";
        this.mCanvas.style.height = this.mStyle.height + "px";
        // this.mCanvas.width = this.mStyle.width;
        // this.mCanvas.height = this.mStyle.height
        this.mCanvas.style.border = this.mStyle.border;
        this.mCanvas.style.opacity = this.mStyle.opacity;
        this.mCanvas.style.backgroundColor = this.mStyle.backgroundColor;
    }

    start() {
        if (this.mStarted)
            return
        this.mStarted = true;
        this.init()
        this.makeCanvas()
        this.styleCanvas()
    }

    stop() {
        if (this.mStarted === false)
            return
        this.removeEvents()
        this.init()
        this.mStarted = false;
        this.mParent.removeChild(this.mDiv)
    }

    clear() {
        if (this.mContext === null)
            return
        this.mContext.clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);
    }

    getStream(fps=10) {
        this.mStream = this.mCanvas.captureStream(fps);
        return this.mStream
    }

    adjustCanvas(iW, iH) { // 500
        if (this.mCanvas === null)
            return
        let cW = this.mParent.offsetWidth;   // 500
        let cH = this.mParent.offsetHeight;  // 500
        let rW = cW / iW;  // 5
        let rH = cH / iH;  // 2

        let r = Math.min(rW, rH)  // 2
        this.mStyle.width = iW * r // 200
        this.mStyle.height = iH * r // 500

        this.mStyle.top = (cH - this.mStyle.height) / 2 // 0
        this.mStyle.left = (cW - this.mStyle.width) / 2 // 150

        this.styleCanvas()
    }

    handleMouseDown(e) {
        console.log(this.mId, "handleMouseDown ---------------- ")
    }

    handleMouseMove(e) {
        console.log(this.mId, "handleMouseMove ---------------- ")
    }

    handleMouseUp(e) {
        console.log(this.mId, "handleMouseUp ---------------- ")
    }

    handleMouseOut(e) {
        console.log(this.mId, "handleMouseOut ---------------- ")
    }

    addEvents() {
        this.mFunHandleMouseDown = (e) => {
            this.handleMouseDown(e)
        }
        this.mFunHandleMouseMove = (e) => {
            this.handleMouseMove(e)
        }
        this.mFunHandleMouseUp = (e) => {
            this.handleMouseUp(e)
        }
        this.mFunHandleMouseOut = (e) => {
            this.handleMouseOut(e)
        }

        this.mCanvas.addEventListener("mousedown", this.mFunHandleMouseDown);
        this.mCanvas.addEventListener("mousemove", this.mFunHandleMouseMove);
        this.mCanvas.addEventListener("mouseup", this.mFunHandleMouseUp);
        this.mCanvas.addEventListener("mouseout", this.mFunHandleMouseOut);
    }

    removeEvents() {
        if (this.mFunHandleMouseDown !== null)
            this.mCanvas.removeEventListener("mousedown", this.mFunHandleMouseDown);
        if (this.mFunHandleMouseMove !== null)
            this.mCanvas.removeEventListener("mousemove", this.mFunHandleMouseMove);
        if (this.mFunHandleMouseUp !== null)
            this.mCanvas.removeEventListener("mouseup", this.mFunHandleMouseUp);
        if (this.mFunHandleMouseOut !== null)
            this.mCanvas.removeEventListener("mouseout", this.mFunHandleMouseOut);
    }
}
class DiscussionCanvas extends BaseCanvas {
    constructor(app, id, parent, pixelX = 1920, pixelY = 1080, width = "100%", height = "100%") {
        super(app, id, parent, pixelX, pixelY, width, height)
        this.mToolType = 'draw';
    }

    init() {
        super.init()
        this.mBackImageCanvas = null;
        this.mHistory = []
        this.mSelectionCanvas = null;
        this.mSelection = {x: 0, y: 0, w: 0, h: 0}
        this.mIsAreaSelected = false
        this.mFuncOnResize = null
        this.mData = {
            isDrawing: false,
            x: 0,
            y: 0,
            currentColor: "red",
            penWidth: 2,
        };
        this.mRedrawTimer = null;
        this.mResizeObserver = null;
    }

    start() {
        if (this.mStarted)
            return
        super.start()
        this.addEvents()
        this.mApp.mUI.mDrawingUI.startDrawingTools()
        this.mResizeObserver = new ResizeObserver(entries => {
          console.log('Resize Observer Working')
        })
        this.mFuncOnResize = () => {
            if (this.mBackImageCanvas === null)
                return
            this.adjustCanvas(this.mPixelX, this.mPixelY)
        }
        let mResizelement = this.mApp.mUI.getResizeAbleElement();
        mResizelement.addEventListener('resize', this.mFuncOnResize)
        this.mResizeObserver.observe(this.mParent)
    }

    Resize() {
        if (this.mFuncOnResize !== null)
            this.mFuncOnResize()
    }

    startSelection() {
        if (this.mStarted === false && this.mSelectionCanvas !== null)
            return
        this.mApp.mUI.mDrawingUI.OnStartSelection()
        CPrint('===== Starting Selection From Discussion Canvas ======', 'black', 'yellow')
        this.mIsAreaSelected = false
        this.mSelectionCanvas = new SelectionCanvas(this, 'selection_canvas', this.mDiv, this.mPixelX, this.mPixelY)
        this.mSelectionCanvas.startSelection()
        this.adjustCanvas(this.mBackImageCanvas.width, this.mBackImageCanvas.height)
        this.clear()
    }

    onSelection(selection) {
        CPrint('===== Completed Selection From Discussion Canvas ======', 'black', 'orange')
        this.mSelection = selection;
        this.mIsAreaSelected = true
        this.cropImage()
        this.mSelectionCanvas = null
    }

    setResolution(pixelsX, pixelsY) {
        // CPrint(`Setting Resolution: ${[pixelsX, pixelsY]}`, 'white', 'green', true)
        this.mPixelX = pixelsX;
        this.mPixelY = pixelsY;
    }

    stop() {
        if (this.mStarted === false)
            return
        super.stop()
        if (this.mSelectionCanvas !== null)
            this.mSelectionCanvas.stop()

        this.mApp.mUI.mDrawingUI.stopDrawingTools()
        let mResizelement = this.mApp.mUI.getResizeAbleElement();
        mResizelement.removeEventListener('resize', this.mFuncOnResize)
        if (this.mResizeObserver !== null){
            this.mResizeObserver.unobserve(mResizelement)
            this.mResizeObserver.disconnect()
            this.mResizeObserver = null;
        }
        this.mFuncOnResize = null
    }

    makeCanvas() {
        super.makeCanvas()
        this.mBackImageCanvas = document.createElement('canvas');
        this.mBackImageContext = this.mBackImageCanvas.getContext('2d')
        this.mBackImageCanvas.style.position = 'absolute';
        this.mDiv.insertBefore(this.mBackImageCanvas, this.mCanvas);
        return this.mCanvas
    }

    adjustCanvas(iW, iH) {
        // CPrint(`Resizing Image: ${this.mBackImageCanvas.width}, ${this.mBackImageCanvas.height} `)
        super.adjustCanvas(iW, iH)
        // this.adjustImage()

        this.mBackImageCanvas.style.top = this.mStyle.top + 'px'
        this.mBackImageCanvas.style.left = this.mStyle.left + 'px'
        this.mBackImageCanvas.style.width = this.mStyle.width + 'px'
        this.mBackImageCanvas.style.height = this.mStyle.height + 'px'


        if (this.mSelectionCanvas !== null) {
            CPrint(`Resizing Image: ${iW}, ${iH} `)
            this.mSelectionCanvas.mCanvas.style.top = this.mStyle.top + 'px'
            this.mSelectionCanvas.mCanvas.style.left = this.mStyle.left + 'px'
            this.mSelectionCanvas.mCanvas.style.width = this.mStyle.width + 'px'
            this.mSelectionCanvas.mCanvas.style.height = this.mStyle.height + 'px'
            this.mSelectionCanvas.mCanvas.width = this.mStyle.width
            this.mSelectionCanvas.mCanvas.height = this.mStyle.height
        }

    }

    handleMouseDown(e) {
        var sx = this.mCanvas.offsetWidth / this.mCanvas.width;
        var sy = this.mCanvas.offsetHeight / this.mCanvas.height;
        this.mData.x = e.offsetX / sx;
        this.mData.y = e.offsetY / sy;
        this.mIsDrawing = true;
    }

    handleMouseUp(e) {
        this.mIsDrawing = false;
    }

    handleMouseMove(e) {
        var sx = this.mCanvas.offsetWidth / this.mCanvas.width;
        var sy = this.mCanvas.offsetHeight / this.mCanvas.height;
        var eoffsetX = e.offsetX / sx;
        var eoffsetY = e.offsetY / sy;
        if (this.mIsDrawing === true) {
            var message = {
                cmd: this.mToolType,
                color: this.mData.currentColor,
                penWidth: this.mData.penWidth,
                x1: this.mData.x / this.mCanvas.width,
                y1: this.mData.y / this.mCanvas.height,
                x2: eoffsetX / this.mCanvas.width,
                y2: eoffsetY / this.mCanvas.height
            };
            this.mHistory.push(message);
            this.mApp.mPeerHandler.mConnection.mDataSocket.relayMessage('drawing', message)
            this.drawLine(
                this.mToolType,
                this.mData.currentColor,
                this.mData.x,
                this.mData.y,
                eoffsetX,
                eoffsetY,
                this.mData.penWidth
            );

            this.mData.x = eoffsetX;
            this.mData.y = eoffsetY;
        }
    }

    clear() {
        super.clear();
        this.mHistory = []
    }

    redraw() {
        for (var msg of this.mHistory) {
            this.handleData(msg, true)
        }
    }

    handleData(message, redraw=false) {
        if (redraw === false)
            this.mHistory.push(message)

        if (['draw', 'erase', 'highlight'].includes(message.cmd)) {
            this.drawLine(message.cmd, message.color, message.x1 * this.mCanvas.width, message.y1 * this.mCanvas.height,
                message.x2 * this.mCanvas.width, message.y2 * this.mCanvas.height, message.penWidth);
        } else if (message.cmd === 'clear') {
            this.clear();
        } else {
            CPrint(`Handle New CMD ${message.cmd} in DiscussionCanvas`, 'white', 'red')
        }
    }

    drawLine(cmd, color, x1, y1, x2, y2, penWidth) {

        this.mContext.globalAlpha = 1.0;
        if (cmd === 'draw') {
            this.mContext.globalCompositeOperation = 'source-over';
        } else if (cmd === 'highlight') {
            this.mContext.globalAlpha = 0.4;
            this.mContext.globalCompositeOperation = 'xor';
        } else
            this.mContext.globalCompositeOperation = 'destination-out'

        this.mContext.lineJoin = this.mContext.lineCap = 'round';
        this.mContext.strokeStyle = color;
        this.mContext.beginPath();
        this.mContext.lineWidth = penWidth;
        this.mContext.moveTo(x1, y1);
        this.mContext.lineTo(x2, y2);
        this.mContext.closePath();
        this.mContext.stroke();
    }

    stopDiscussion() {
        this.mApp.stopDiscussion()
        CPrint("Stopping Discussion Mode ========", 'black', 'orange')
    }

    setPenColor(value) {
        this.mCanvas.style.cursor = 'default';
        this.mData.currentColor = value;
    }

    setPenWidth(value) {
        this.mData.penWidth = value;
    }

    setToolType(value) {
        this.mToolType = value;
        if (this.mToolType === 'erase')
            this.mCanvas.style.cursor = 'url("assets/images/pen.cur"), auto';
    }

    onClear() {
        this.mApp.mPeerHandler.mConnection.mDataSocket.relayMessage('drawing', {cmd: 'clear'})
        this.clear();
    }

    getBackground() {
        let video = this.mParent.getElementsByTagName('video')[0]
        this.adjustCanvas(video.videoWidth, video.videoHeight)
        this.mBackImageCanvas.width = video.videoWidth;
        this.mBackImageCanvas.height = video.videoHeight;
        this.mCanvas.width = video.videoWidth;
        this.mCanvas.height = video.videoHeight;
        this.setResolution(video.videoWidth, video.videoHeight)
        this.mBackImageContext.drawImage(video, 0, 0, this.mPixelX, this.mPixelY);
    }

    getImageFromVideo(video) {
        let canv = document.createElement('canvas');
        let ctx = canv.getContext('2d')
        canv.width = video.videoWidth;
        canv.height = video.videoHeight;
        canv.style.width = video.videoWidth;
        canv.style.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return canv.toDataURL('image/jpeg');
    }

    cropImage() {
        let dims = this.mSelection
        if (dims.x === dims.y === dims.w === dims.h)
            return

        let imgUrl = this.mBackImageCanvas.toDataURL('image/jpeg');
        this.adjustCanvas(dims.w, dims.h)
        this.setResolution(this.mStyle.width, this.mStyle.height)
        this.mBackImageCanvas.width = this.mPixelX;
        this.mBackImageCanvas.height = this.mPixelY;
        this.mCanvas.width = this.mStyle.width;
        this.mCanvas.height = this.mStyle.height;

        let img = new Image()
        img.onload = () => {
            this.mBackImageContext.drawImage(img, dims.x, dims.y, dims.w, dims.h, 0, 0, this.mBackImageCanvas.width, this.mBackImageCanvas.height);
            this.mApp.mPeerHandler.mConnection.mDataSocket.relayMessage('drawing', {cmd: 'clear'})
            this.mApp.mPeerHandler.mConnection.mDataSocket.relayMessage('discussion', this.getCanvasContext())
        }
        img.src = imgUrl;

    }

    setBackground(ctx, imgData, backCanvas = false) {
        var img = new Image();
        self = this;
        img.onload = () => {
            ctx.canvas.width = imgData.width;
            ctx.canvas.height = imgData.height;
            this.adjustCanvas(imgData.width, imgData.height)
            // ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, ctx.canvas.width, ctx.canvas.height); // Or at whatever offset you like
            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height); // Or at whatever offset you like
            this.setResolution(this.mStyle.width, this.mStyle.height)
        };
        img.src = imgData.data_url
    }

    setCanvasContext(data) {
        // this.testCanvas(data.background)
        this.setBackground(this.mBackImageContext, data.background, true)
        this.setBackground(this.mContext, data.canvas)
    }

    getCanvasContext() {
        return {
            background: {
                width: this.mPixelX,
                height: this.mPixelY,
                data_url: this.mBackImageCanvas.toDataURL('image/jpeg')
            },
            canvas: {
                width: this.mPixelX,
                height: this.mPixelY,
                data_url: this.mCanvas.toDataURL('image/png')
            }
        }
    }

    testCanvas(imgData) {
        let canv = document.getElementById('testCanvas')
        let ctx = canv.getContext('2d')
        let img = new Image()
        img.onload = () => {
            canv.width = img.width;
            canv.height = img.height;
            canv.style.width = img.width;
            canv.style.height = img.height;
            ctx.drawImage(img, 0, 0, this.mPixelX, this.mPixelY);
        }
        img.src = imgData.data_url;
    }
}
class DisplayCanvas extends BaseCanvas {
    constructor(app, id, parent, pixelX = 1920, pixelY = 1080, width = "100%", height = "100%") {
        super(app, id, parent, pixelX, pixelY, width, height)
        this.mVideoElement = null;
        this.mFPS = 10;
    }

    init() {
        super.init()

        this.mIsAreaSelected = false
        this.mSelectionCanvas = null;
        this.mSelection = {x: 0, y: 0, w: this.mPixelX, h: this.mPixelY}

        this.mApp.mUI.onStartSelection(() => {
            if (this.mStarted === false)
                return
            this.mApp.startDiscussion()
        })
    }

    start() {
        if (this.mStarted)
            return
        super.start()
    }

    stop() {
        if (this.mStarted === false)
            return

        super.stop()
        this.mSourceStream.getTracks().forEach(track=> track.stop())
        this.mApp.mUI.onStopSelection()
        this.mVideoElement.srcObject = null
        this.mVideoElement = null
    }

    pause() {
        this.mApp.mUI.hideSelectionButton()
        this.mDiv.style.display = 'none';
        this.mStarted = false;
    }

    resume() {
        this.mApp.mUI.showSelectionButton()
        this.mDiv.style.display = 'block';
        this.mStarted = true;
        this.getFramesFromVideo(this.mSourceStream)
    }

    getFramesFromVideo(stream) {
        this.mSourceStream = stream;
        this.mVideoElement = null
        let video = document.createElement('video')
        video.srcObject = stream;
        video.play()
        video.style.width = "100%";
        video.style.height = "100%";
        // this.mDiv.appendChild(video)
        // this.mCanvas.style.opacity = 0.2;
        this.mVideoElement = video;
        let self = this;
        video.addEventListener('play', () => {
            function step() {
                if (self.mStarted === false)
                    return
                self.adjustCanvas(video.videoWidth, video.videoHeight)
                self.mContext.drawImage(video, 0, 0, self.mCanvas.width, self.mCanvas.height)
                setTimeout(() => {
                    requestAnimationFrame(step)
                }, 1000 / self.mFPS)
            }

            requestAnimationFrame(step);
        })
    }
}
class DummyCanvas extends BaseCanvas {
    constructor(app, id, parent, pixelX = 1920, pixelY = 1080, width = "100%", height = "100%") {
        super(app, id, parent, pixelX, pixelY, width, height)
        this.init()
    }

    start() {
        if (this.mStarted)
            return
        this.mStarted = true;
        this.init()
        this.makeCanvas()
        this.styleCanvas()
    }

    styleCanvas() {
        this.mCanvas.style.position = this.mStyle.position;
        this.mCanvas.style.top = this.mStyle.top + "px";
        this.mCanvas.style.left = this.mStyle.left + "px";
        this.mCanvas.style.width = this.mWidth
        this.mCanvas.style.height = this.mHeight;
        this.mCanvas.style.border = this.mStyle.border;
        this.mCanvas.style.opacity = this.mStyle.opacity;
        this.mCanvas.style.backgroundColor = this.mStyle.backgroundColor;
        this.mCanvas.style.display = 'none'
    }

    stop() {
        if (this.mStarted === false)
            return
        this.removeEvents()
        this.init()
        this.mStarted = false;
        this.mParent.removeChild(this.mDiv)
        clearInterval(this.mAnimator)
        clearInterval(this.mClearTimer)
    }

    draw() {
        let color = "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16)
        this.mContext.strokeStyle = color;
        this.mContext.beginPath();
        this.mContext.arc(Math.floor(Math.random() * (100) + 1), Math.floor(Math.random() * (80) + 1), Math.floor(Math.random() * (20) + 1), 0, 2 * Math.PI);
        this.mContext.fillStyle = color
        this.mContext.stroke();
    }

    drawLoop() {
        // this.mAnimator = setInterval(() => {
        //     // let color = "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16)
        //     let color = "black"
        //     this.mContext.strokeStyle = color;
        //     this.mContext.beginPath();
        //     this.mContext.arc(Math.floor(Math.random() * (100) + 1), Math.floor(Math.random() * (80) + 1), Math.floor(Math.random() * (20) + 1), 0, 2 * Math.PI);
        //     this.mContext.fillStyle = color
        //     this.mContext.stroke();
        // }, 1000)
        this.mClearTimer = setInterval(() => {
            this.clear()
        }, 500)

    }
}
class SelectionCanvas extends BaseCanvas {
    constructor(pCanvas, id, parent, pixelX = 1920, pixelY = 1080, width = "100%", height = "100%") {
        super(pCanvas, id, parent, pixelX, pixelY, width, height)
        this.mPCanvas = pCanvas;
        this.mApp = pCanvas.mApp;
    }

    init() {
        super.init()
        this.mStyle.backgroundColor = "lightblue";
        this.mStyle.opacity = 0.4;
        this.mIsDown = false;
        this.mSelection = {x: 0, y: 0, w: 0, h: 0}
        this.mIsAreaSelected = false
    }

    startSelection() {
        if (this.mStarted)
            return
        super.start()
        this.addEvents()
        this.mContext.strokeStyle = "red";
        this.mContext.lineWidth = 2;
    }

    handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        var sx = this.mCanvas.offsetWidth / this.mCanvas.width;
        var sy = this.mCanvas.offsetHeight / this.mCanvas.height;

        this.mSelection.x = e.offsetX / sx;
        this.mSelection.y = e.offsetY / sy;

        this.mIsDown = true;
    }

    handleMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();

        this.mIsDown = false;
        this.endSelection()
    }

    handleMouseOut(e) {
        e.preventDefault();
        e.stopPropagation();

        this.mIsDown = false;
    }

    handleMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.mIsDown) {
            return;
        }

        var sx = this.mCanvas.offsetWidth / this.mCanvas.width;
        var sy = this.mCanvas.offsetHeight / this.mCanvas.height;

        var mouseX = e.offsetX / sx;
        var mouseY = e.offsetY / sy;

        // var mouseX = parseInt(e.clientX - offsetX);
        // var mouseY = parseInt(e.clientY - offsetY);

        this.mContext.clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);

        this.mSelection.w = mouseX - this.mSelection.x;
        this.mSelection.h = mouseY - this.mSelection.y;

        this.mContext.strokeRect(this.mSelection.x, this.mSelection.y,
            this.mSelection.w, this.mSelection.h);
    }

    endSelection() {
        this.mIsAreaSelected = true
        this.mSelection.x = (this.mSelection.x/this.mCanvas.width)*this.mPCanvas.mBackImageCanvas.width
        this.mSelection.y = (this.mSelection.y/this.mCanvas.height)*this.mPCanvas.mBackImageCanvas.height
        this.mSelection.w = (this.mSelection.w/this.mCanvas.width)*this.mPCanvas.mBackImageCanvas.width
        this.mSelection.h = (this.mSelection.h/this.mCanvas.height)*this.mPCanvas.mBackImageCanvas.height
        CPrint(`Selection Canvas: Pixels ${[this.mPixelX, this.mPixelY]} | CanvRes ${[this.mCanvas.width, this.mCanvas.height]}`)
        CPrint(`ImageCanvas Canvas: Pixels ${[this.mPCanvas.mPixelX, this.mPCanvas.mPixelY]} | CanvRes ${[this.mPCanvas.mBackImageCanvas.width, this.mPCanvas.mBackImageCanvas.height]}`)
        CPrint(`ParentCanvas Canvas: Pixels ${[this.mPCanvas.mPixelX, this.mPCanvas.mPixelY]} | CanvRes ${[this.mPCanvas.mCanvas.width, this.mPCanvas.mCanvas.height]}`)
        this.mPCanvas.onSelection(this.mSelection)
        super.stop()
        CPrint(".................. Selection Completed ..........", 'black', 'lightyellow')
    }
}
class UIDrawing {
    constructor(uiLayer) {
        this.mUiLayer = uiLayer;
        this.mDrawingTools = document.getElementById('drawing_tools');
        this.mBtnClear = document.getElementById('btnClear');
        this.mBtnErase = document.getElementById('btnErase');
        this.mBtnColorPicker = document.getElementById('btnColorPicker');
        this.mBtnResetSelection = document.getElementById('btnResetSelection');
        this.mBtnHighlighter = document.getElementById('btnHighlighter');
        this.mBtnPenWidth = document.getElementById('btnPenWidth')
    }

    getColorPickerValue() {
        return this.mBtnColorPicker.value;
    }

    getColorHighligterValue() {
        return this.mBtnHighlighter.value;
    }

    setPenWidthValue(value) {
        for (var i = 0; i < this.mBtnPenWidth.options.length; i++) {
            if (this.mBtnPenWidth.options[i].text === value) {
                this.mBtnPenWidth.options[i].selected = true;
                return;
            }
        }
    }

    getPenWidthValue() {
        return this.mBtnPenWidth[this.mBtnPenWidth.selectedIndex].value
    }

    showDrawingTools() {
        this.mDrawingTools.style.display = 'block';
    }

    hideDrawingTools() {
        this.mDrawingTools.style.display = 'none';
    }

    showResetButton() {
        this.mBtnResetSelection.style.display = 'block'
    }

    hideResetButton() {
        this.mBtnResetSelection.style.display = 'none'
    }

    startDrawingTools() {
        if (this.mUiLayer.mApp === null)
            return

        let canv = this.mUiLayer.mApp.mActiveCanvas;
        this.showDrawingTools();
        canv.setPenWidth(this.getPenWidthValue())

        this.mFuncResetSelection = () => {
            this.hideResetButton()
            canv.stopDiscussion()
        }
        this.mFuncClear = () => {
            canv.onClear()
            canv.setPenColor(this.getColorPickerValue())
            canv.setToolType('draw')
            this.setPenWidthValue('2')
            canv.setPenWidth(this.getPenWidthValue())
        }
        this.mBtnEraseFunc = () => {
            canv.setToolType('erase')
            this.setPenWidthValue('46')
            canv.setPenWidth(this.getPenWidthValue())
        }
        this.mFuncColorChange = () => {
            canv.setPenColor(this.getColorPickerValue())
            canv.setToolType('draw')
            this.setPenWidthValue('2')
            canv.setPenWidth(this.getPenWidthValue())
        }
        this.mFuncHighlighterColorChange = () => {
            canv.setToolType('highlight')
            canv.setPenColor(this.getColorHighligterValue())
            this.setPenWidthValue('16')
            canv.setPenWidth(this.getPenWidthValue())
        }

        this.mFunPenWidth = () => {
            canv.setPenWidth(this.getPenWidthValue())
        }

        this.mBtnResetSelection.addEventListener('click', this.mFuncResetSelection)
        this.mBtnColorPicker.addEventListener('change', this.mFuncColorChange)
        this.mBtnPenWidth.addEventListener('change', this.mFunPenWidth)
        this.mBtnHighlighter.addEventListener('change', this.mFuncHighlighterColorChange)
        this.mBtnClear.addEventListener('click', this.mFuncClear)
        this.mBtnErase.addEventListener("click", this.mBtnEraseFunc)
    }

    stopDrawingTools() {
        this.hideDrawingTools()

        this.mBtnResetSelection.removeEventListener('click', this.mFuncResetSelection)
        this.mBtnColorPicker.removeEventListener('change', this.mFuncColorChange)
        this.mBtnHighlighter.removeEventListener('change', this.mFuncHighlighterColorChange)
        this.mBtnClear.removeEventListener('click', this.mFuncClear)
        this.mBtnErase.removeEventListener("click", this.mFuncErase);

        this.mFuncResetSelection = null;
        this.mFuncHighlighterColorChange = null;
        this.mFuncColorChange = null;
        this.mFuncClear = null;
        this.mFuncErase = null;
    }

    OnStartSelection() {
        this.showResetButton()
    }
}
class UILayer {
    constructor() {
        this.mConfig = null;
        this.mApp = null;
        this.mClientName = document.getElementById('client_name')
        this.mBtnMic = document.getElementById("btnToggleMic");
        this.mBtnCamera = document.getElementById("btnToggleCamera");
        this.mBtnScreen = document.getElementById("btnToggleScreen");
        this.mMicSource = document.getElementById('mic_options');
        this.mCamSource = document.getElementById('camera_options');
        this.mSpkSource = document.getElementById('speaker_options');
        this.mBtnSelection = document.getElementById('btnSelection');
        this.mWebSocketIndicator = document.getElementById('wSocketStatus')
        this.mDataSocketIndicator = document.getElementById('dataSocketStatus')

        this.mResizeElement = window;
        this.mIODevices = {"Mic": {}, "Speaker": {}, "Camera": {}, "Other": {}};
        this.mDrawingUI = new UIDrawing(this);
        this.getIODevices()
        navigator.mediaDevices.ondevicechange = (e) => {
            this.getIODevices()
            this.replaceTrack("mic")
            this.replaceTrack("speaker")
            this.replaceTrack("camera")
        }
    }

    getResizeAbleElement(){
        return this.mResizeElement;
    }

    setMicState(state) {
        this.mBtnMic.checked = !state;
    }

    setDataSocketIndication(running=false){
        if (this.mDataSocketIndicator === null)
            return
        if (running)
            this.mDataSocketIndicator.style.backgroundColor = 'green';
        else
            this.mDataSocketIndicator.style.backgroundColor = 'red';
    }

    setWebSocketIndication(running=false){
        if (this.mWebSocketIndicator === null)
            return
        if (running)
            this.mWebSocketIndicator.style.backgroundColor = 'green';
        else
            this.mWebSocketIndicator.style.backgroundColor = 'red';
    }

    setCameraState(state) {
        this.mBtnCamera.checked = !state;
    }

    setScreenState(state) {
        this.mBtnScreen.checked = !state;
    }

    isMicMuted() {
        return this.mBtnMic.checked;
    }

    isCameraMuted() {
        return this.mBtnCamera.checked;
    }

    isScreenMuted() {
        return this.mBtnScreen.checked;
    }

    getClientName() {
        return this.mClientName.value;
    }

    getIODevices() {
        navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
            this.resetDeviceSources();
            for (let i = 0; i !== deviceInfos.length; ++i) {
                const deviceInfo = deviceInfos[i];
                this.addDeviceSource(deviceInfo)
                if (deviceInfo.kind === 'audioinput') {
                    this.mIODevices.Mic[deviceInfo.deviceId] = deviceInfo.label
                } else if (deviceInfo.kind === 'audiooutput') {
                    this.mIODevices.Speaker[deviceInfo.deviceId] = deviceInfo.label
                } else if (deviceInfo.kind === 'videoinput') {
                    this.mIODevices.Camera[deviceInfo.deviceId] = deviceInfo.label
                } else {
                    console.log('Some other kind of source/device: ', deviceInfo);
                    this.mIODevices.Other[deviceInfo.deviceId] = deviceInfo.label
                }
            }
            // console.log(this.mIODevices)
        });
    }

    replaceTrack(device) {
        if (this.mApp === null || this.mApp.mStarted === false)
            return
        if (device === 'mic') {
            let elem = document.getElementById("mic_options")
            let source = elem[elem.selectedIndex].id
            this.mApp.mPeerHandler.mConnection.replaceMicTrack(source)

        } else if (device === 'camera') {
            let elem = document.getElementById("camera_options")
            let source = elem[elem.selectedIndex].id
            this.mApp.mPeerHandler.mConnection.replaceCameraTrack(source)
        } else if (device === 'speaker') {
            let elem = document.getElementById("speaker_options")
            let source = elem[elem.selectedIndex].id
            this.mApp.mPeerHandler.replaceSpeakerTrack(source)
        } else {
            console.log("ReplaceTrack Not Implemented for ", device)
        }
    }


    resetDeviceSources() {
        this.mMicSource.innerHTML = '';
        this.mCamSource.innerHTML = '';
        this.mSpkSource.innerHTML = '';
    }

    addDeviceSource(deviceInfo) {
        let option = document.createElement('option');
        option.id = deviceInfo.deviceId
        option.text = deviceInfo.label
        if (deviceInfo.kind === 'audioinput') {
            this.mMicSource.add(option)
        } else if (deviceInfo.kind === 'audiooutput') {
            this.mSpkSource.add(option)
        } else if (deviceInfo.kind === 'videoinput') {
            this.mCamSource.add(option)
        } else {
            console.log('Some other kind of source/device: ', deviceInfo);
        }
    }

    resetStates() {
        if (this.mConfig.callType === 'Audio') {
            this.setMicState(true)
            this.setCameraState(false)
            this.setScreenState(false)
        } else if (this.mConfig.callType === 'Video') {
            this.setMicState(true)
            this.setCameraState(true)
            this.setScreenState(false)
        } else if (this.mConfig.callType === 'Screen') {
            this.setMicState(true)
            this.setCameraState(false)
            this.setScreenState(true)
        }
    }

    attachChatElements() {
        this.mChat = document.getElementById('chat');
        this.mMessage = document.getElementById('message');
    }

    appendMessage(msg) {
        this.mChat.value += `${msg}\n`;
        this.mChat.scrollTop = this.mChat.scrollHeight;
    }

    setMessageText(txt) {
        this.mMessage.value = txt;
    }

    getMessageText() {
        return this.mMessage.value;
    }


    showSelectionButton(){
        this.mBtnSelection.style.display = 'block';
    }

    hideSelectionButton(){
        this.mBtnSelection.style.display = 'none';
    }

    onStartSelection() {
        this.mFuncSelection = () => {
            this.hideSelectionButton()
            if (this.mApp.mActiveCanvas !== null)
                this.mApp.mActiveCanvas.startSelection()
        }
        this.mBtnSelection.addEventListener('click', this.mFuncSelection)
    }

    onStopSelection() {
        this.hideSelectionButton()
        this.mBtnSelection.removeEventListener('click', this.mFuncSelection)
        this.mFuncSelection = null;
    }

    onMessage(message) {

    }

}
class CollectionView {
    constructor(app, collectionViewId) {
        this.boxOid = 0;
        this.mApp = app
        this.dispPerCol = 0;
        this.dispPerRow = 0;

        this.collectionDict = {};

        this.element = document.getElementById(collectionViewId);
        this.maxCid = null;
        this.mCanvas = false;
        this.lastRowFirstChildWidth = -1;

        this.mLocalVideoElem = null;
        // for (let i = 1001; i <= 1005; i++)
        // {
        //     this.addBox(i);
        // }
    }

    designGrid(N) {
        var cw = this.element.clientWidth;
        var ch = this.element.clientHeight;

        var N1 = 0;
        var N2 = 0;
        var eps = .000001;
        var Nx = Math.ceil(Math.sqrt(N - eps));

        if (ch > cw) {
            N2 = Nx;
            N1 = Math.ceil(N / N2);
        } else {
            N1 = Nx;
            N2 = Math.ceil(N / N1);
        }

        this.dispPerCol = N1;
        this.dispPerRow = N2;
    }

    setDims(index, div) {
        var cw = this.element.clientWidth;
        var ch = this.element.clientHeight;

        index -= 1;
        var colNo = index % this.dispPerCol;
        var rowNo = Math.floor(index / this.dispPerCol);

        var w = cw / this.dispPerCol;
        var h = ch / this.dispPerRow;
        var originalWidth = w;

        var totalLength = Object.keys(this.collectionDict).length;
        var totalContainers = this.dispPerCol * this.dispPerRow;

        if (totalContainers > totalLength) {
            if (index >= (totalContainers - this.dispPerCol)) {
                if (this.lastRowFirstChildWidth === -1) {
                    w = w * ((totalContainers - index) / (totalLength - index));
                    this.lastRowFirstChildWidth = w;
                } else {
                    w = this.lastRowFirstChildWidth;
                }
            } else {
                this.lastRowFirstChildWidth = -1;
            }
        } else {
            this.lastRowFirstChildWidth = -1;
        }

        const __wi = (w / cw) * 100 + "%";
        const __he = (h / ch) * 100 + "%";

        div.style.width = div.style.maxWidth = div.style.minWidth = __wi;
        div.style.height = div.style.maxHeight = div.style.minHeight = __he;

        if (this.mLocalVideoElem === div) {
            div.style.zIndex = 9999;
        }
        if (this.lastRowFirstChildWidth === -1) {
            div.style.left = originalWidth * colNo / cw * 100 + "%";
        } else {
            div.style.left = this.lastRowFirstChildWidth * colNo / cw * 100 + "%";
        }
        div.style.top = h * rowNo / ch * 100 + "%";
    }

    updateOne(index, id) {
        var element = document.getElementById(id);

        if (element == null || element === this.mLocalVideoElem) {
            return;
        }

        this.setDims(index, element);
        element.setAttribute("index-no", index);
    }

    addOne(index, _id, isLocalVideo) {
        // console.log('The Id = ', _id);
        var container = document.createElement("div");
        container.id = _id;
        container.style.position = "absolute";
        container.setAttribute("index-no", index);
        container.style.boxShadow = "inset 0  0 0px " + 3 + "px #333";
        container.style.transition = ".5s";
        container.classList.add("user-win");

        container.innerHTML = "<video playsinline autoplay ></video>"
        let video = container.firstChild
        // var video = document.createElement("video");
//        video.id = _id;
//         video.playsinline = true;
//         video.autoplay = true;
       video.style.objectFit = 'cover';
//        video.style.zIndex = -1;
        video.style.width = "100%";
        video.style.height = "100%";
//        video.style.border = "1px solid " + this.getRandomColor();

        if (isLocalVideo)
        {
            container.style.width = '100px';
            container.style.height = '80px';
            container.style.bottom = '0px';
            container.style.right = '0px';

            video.style.zIndex = 9999;
            // video.style.objectFit = 'cover';

            this.mLocalVideoElem = container;
        // } else {
        //     container.style.width = '100%';
        //     container.style.height = '100%';
        }

        container.append(video);

        this.element.append(container);

        this.setDims(index, container);
        return video;
    }

    updateAll() {
        var ind = 0;
        var self = this;

        Object.keys(this.collectionDict).forEach(function (key) {
            // var k = parseInt(key, 10);   // Cant run with star Architecture
            var k = key;

            if (self.collectionDict[k]['tagId']) {
                ind += 1;

                self.collectionDict[k]['winIndex'] = ind;
                self.updateOne(ind, self.collectionDict[k]['tagId']);
            }
        });
    }

    addBox(cId, isLocalVideo = false) {
        if (!isLocalVideo && this.collectionDict[cId] === void 0) {
            this.collectionDict[cId] = {};
        }

        var len = Object.keys(this.collectionDict).length;
        this.designGrid(len);
        var mId = 'callview-' + cId;
        this.updateAll();

        const div = this.addOne(len, mId, isLocalVideo);
        div.muted = isLocalVideo;

        if (!isLocalVideo) {
            this.collectionDict[cId]['tagId'] = mId;
            this.collectionDict[cId]['winIndex'] = len;
        }

        if (this.maxCid !== null) {
            this.requestFullScreen(this.maxCid);
        }

        return div;
    }

    removeBox(cID) {
        const mID = `callview-${cID}`;
        if (cID === this.maxCid) {
            this.maxCid = null;
        }

        if (mID === this.mLocalVideoElem.id) {
            this.mLocalVideoElem.remove();
//            console.log('Local Elem = ', this.mLocalVideoElem);

            this.mLocalVideoElem = null;
        } else {
            var tagId = this.collectionDict[cID]['tagId'];
            var tag = document.getElementById(tagId);

            delete this.collectionDict[cID];

            tag.remove();
        }

        var len = Object.keys(this.collectionDict).length;

        this.designGrid(len);
        this.updateAll();

        if (this.maxCid !==null)
            this.requestFullScreen(this.maxCid)
    }

    requestFullScreen(cID) {
        if (this.maxCid != null && this.maxCid !== cID)
            this.requestExitFullScreen(this.maxCid)
        // CPrint("Request For FullScreen "+cID, "white", "Green", true)

        this.maxCid = cID;

        var div = this.mLocalVideoElem;
        const mID = `callview-${cID}`;
        if (div.id !== mID)
        {
            var tagId = this.collectionDict[cID]['tagId'];
            div = document.getElementById(tagId);
        }

        div.style.width = 100 + "%";
        div.style.height = 100 + "%";
        div.style.left = 0 + "%";
        div.style.top = 0 + "%";
        div.style.maxWidth = 100 + "%"
        div.style.maxHeight = 100 + "%"
        div.firstChild.style.objectFit = 'contain';

        // if(!this.mCanvas){
        //     let canvas = this.createCanvas(div.parentNode)
        //     this.mApp.mWhiteboard.setCanvas(canvas)
        // }
        if((this.mApp.mDiscussionMode) && (cID === this.mApp.mPeerHandler.mConnection.mConnectionId))
            div.getElementsByTagName('video')[0].style.display = "none";

        for (var otherCl of Object.keys(this.collectionDict)) {
            if (otherCl !== cID) {
                tagId = this.collectionDict[otherCl]['tagId'];
                div = document.getElementById(tagId);
                div.style.display = 'none';
            }
        }

        if (this.mLocalVideoElem.id !== `callview-${this.maxCid}`)
        {
            this.mLocalVideoElem.style.display = 'none';
        }

//        if (div.id !== this.maxCid)
//        {
//            this.mLocalVideoElem
//        }
    }

    requestExitFullScreen(cID) {
        if (this.maxCid !== cID)
            return;
        // CPrint("Request For ExitFullScreen "+cID, "white", "red", true)

        // this.removeCanvas(div.parentNode)

        let div = this.mLocalVideoElem;
        const mID = `callview-${cID}`;
        if (div.id !== mID)
        {
            var clientDict = this.collectionDict[cID];
            var tagId = clientDict['tagId'];
            div = document.getElementById(tagId);

            this.updateOne(clientDict['winIndex'], clientDict['tagId']);
        } else {
            div.getElementsByTagName('video')[0].style.display = "block";
            div.style.width = '100px';
            div.style.height = '80px';
            div.style.bottom = '0%';
            div.style.right = '0%';
            div.style.left = 'unset';
            div.style.top = 'unset';
        }

        div.firstChild.style.objectFit = 'cover';

        // var div = document.getElementById(tagId);
        // this.removeCanvas(div.parentNode)

        // if ((cID === this.mApp.mPeerHandler.mConnection.mConnectionId) && (this.mApp.mDiscussionMode)){
        //     div.getElementsByTagName('video')[0].style.display = "block";
        // }

        for (var otherCl of Object.keys(this.collectionDict)) {
            if (otherCl !== cID) {
                tagId = this.collectionDict[otherCl]['tagId'];
                div = document.getElementById(tagId);
                div.style.display = 'block';
            }
        }
        if (this.mLocalVideoElem.id !== `callview-${this.maxCid}`)
        {
            this.mLocalVideoElem.style.display = 'block';
        }

        this.maxCid = null;
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    }

}

class DataSocket {
    constructor(connection) {
        this.mConnection = connection;
        this.mApp = connection.mApp;
        // this.mWsUrl = 'ws://localhost:8080/ws/signals/';
        this.mWsUrl = 'wss://webrtc-test.cognitivehealthintl.com/ws/signals/'; // Running on ssh -p5122 root@94.204.120.53 -> ssh 10.10.10.30 in docker with name 'webrtc-test'
        this.mRoomID = this.mApp.mRoomId;
        this.mClosing = false;
        this.mClientID = this.mConnection.mConnectionId;
        this.mFullName = this.mConnection.mClientData.clientData;
        this.mSocket = null
        this.mDebug = false;
        this.mPingTimer = null;
        this.mPingMSGTimer = null;
        this.open()
    }

    open() {
        var SIGNALING_SERVER_URL = this.mWsUrl + this.mRoomID + '/' + this.mClientID;
        this.mSocket = new WebSocket(SIGNALING_SERVER_URL);
        this.mSocket.onmessage = (evt) => this.onMessage(evt);
        this.mSocket.onopen = () => this.onOpen();
        this.mSocket.onerror = () => this.onError();
    }

    reopen() {
        if (this.mClosing)
            return

        CPrint("Reconnecting DataSocket ...", 'black', 'yellow');
        this.open()
    }

    stop() {
        if (this.mClosing) {
            console.log('Already Data Socket is closing in progress');
            return;
        }

        clearTimeout(this.mPingMSGTimer)
        clearTimeout(this.mPingTimer)

        CPrint("Closing DataSocket", 'black', 'yellow');
        this.mClosing = true;

        if ((this.mApp.mCollectionView.maxCid === this.mConnection.mConnectionId) &&
            (this.mApp.mCollectionView.maxCid !== null)) {
            this.relayMessage('exit-fullscreen')
        }
        this.mSocket.onclose = null;
        this.mSocket.close()
        this.mApp.mUI.setDataSocketIndication(false)
    }

    onOpen() {
        this.mApp.mUI.setDataSocketIndication(true)
        this.relayMessage('add-user')

        this.mClosing = false;

        this.mSocket.onerror = null
        this.mSocket.onclose = () => this.onClose();
        this.relayMessage('ping', {}, this.mConnection.mConnectionId)
    }

    handlePingTimer() {
        if (this.mPingTimer !== null){
            clearTimeout(this.mPingTimer)
            this.mPingTimer = null;
        }
        this.mPingMSGTimer = setTimeout(()=>{
            this.relayMessage('ping', {}, this.mConnection.mConnectionId)
        }, 2000)
        this.mPingTimer = setTimeout(()=>{this.mSocket.close()}, 3000)
    }

    onClose() {
        this.mApp.mUI.setDataSocketIndication(false)
        CPrint("Handle On Close Connection")
        this.mSocket.onclose = () => {
        };
        this.mSocket.onerror = () => this.onError();
        this.reopen()
    }

    onError() {
        this.mApp.mUI.setDataSocketIndication(false)
        if (this.mClosing)
            return
        CPrint("Handle On Error Connection")
        this.reopen()
    }


    onMessage(evt) {
        const message = JSON.parse(evt.data);
        this.mApp.mUI.onMessage(message);

        if (this.mDebug) console.log(`<-- ${message.type.toUpperCase()} ::: ${message.client_id} >>>>> ${message.to_client}`)
        if (message.type === 'add-user') {
            if ((this.mApp.mCollectionView.maxCid === this.mConnection.mConnectionId) &&
                (this.mApp.mCollectionView.maxCid !== null)) {
                this.mConnection.mDataSocket.relayMessage('fullscreen')
                if (this.mApp.mDiscussionMode) {
                    this.mConnection.mDataSocket.relayMessage('discussion', this.mApp.mActiveCanvas.getCanvasContext())
                }
            }
        } else if (message.type === 'message') {
            this.mApp.mUI.appendMessage(`${message.full_name}: ${message.data.message}`)
        } else if (message.type === 'discussion') {
            CPrint(`Received Request for  Discussion in DataSocket`, 'red', 'yellow')
            let client = this.mApp.mPeerHandler.mRemoteConnections[message.client_id];
            this.mApp.mActiveCanvas = client.mDiscussionCanvas;
            client.mVideoElement.style.display = "none";
            this.mApp.mActiveCanvas.start()
            this.mApp.mActiveCanvas.setCanvasContext(message.data)
            this.mApp.mActiveCanvas.mCanvas.style.opacity = 1.0;
            this.mApp.mCollectionView.requestFullScreen(message.client_id)
        } else if (message.type === 'exit-discussion') {
            let client = this.mApp.mPeerHandler.mRemoteConnections[message.client_id];
            client.mVideoElement.style.display = "block";
            client.mDiscussionCanvas.stop()
        } else if (message.type === 'drawing') {
            this.mApp.mActiveCanvas.handleData(message.data)
        } else if (message.type === 'fullscreen') {
            CPrint(`Received Request for  FullScreen in DataSocket ${this.mApp.mUI.isScreenMuted()}`, 'red', 'yellow')
            if (this.mApp.mActiveCanvas !== null)
                CPrint("--------- Already In Discussion Mode Handle IT ---------", 'white', 'red')
            if (this.mApp.mUI.isScreenMuted() === false) {
                this.mApp.mUI.setScreenState(false)
                this.mApp.mPeerHandler.screenMute()
            }

            this.mApp.mCollectionView.requestFullScreen(message.client_id)
        } else if (message.type === 'exit-fullscreen') {
            this.mApp.mCollectionView.requestExitFullScreen(message.client_id)
        } else if (message.type === 'ping') {
            console.log(message.type)
            // this.relayMessage('ping', {}, this.mConnection.mConnectionId)
            this.handlePingTimer()
        } else {
            CPrint(`Handle Message Type of ${message.type} in DataSocket`, 'red', 'yellow')
        }
    }

    relayMessage(type, data = null, to_client = null) {
        let msg = {
            type: type,
            room_id: this.mRoomID,
            client_id: this.mClientID,
            full_name: this.mFullName,
            to_client: to_client,
            data: data
        }
        this.send(msg)
    }

    send(data) {
        if (this.mDebug) console.log(`--> ${data.type.toUpperCase()} ::: ${this.mClientID} >>>>> ${data.to_client}`)
        this.mSocket.send(JSON.stringify(data));
    }

}
class BasePeer {
    constructor(app, participant) {
        this.mApp = app;
        this.mConnectionId = participant.id;

        this.mStreamId = null;
        this.mHasAudio = null;
        this.mHasVideo = null;
        this.mAudioActive = null;
        this.mVideoActive = null;
        this.mVideoDimensions = null;

        this.mClientData = JSON.parse(participant.metadata);
        this.mDiscussionCanvas = null;
        this.mWebRtcPeer = null;
        this.mPeerHandler = this.mApp.mPeerHandler
        this.mStream = null;
        this.mVideoElement = null;
        this.mDebug = false;
    }

    createPeerConnection() {
        // console.log('PC->ICE Servers = ', this.mApp.mConfig.pcConfig);

        this.mWebRtcPeer = new RTCPeerConnection(this.mApp.mConfig.pcConfig);

        this.mWebRtcPeer.oniceconnectionstatechange = (e) => this.onIceConnectionStateChanged(e);
        this.mWebRtcPeer.ontrack = (e) => this.onTrackEvent(e);
        this.mWebRtcPeer.onicecandidate = (e) => this.onIceCandidateEvent(e);
    }

    onIceCandidateEvent(e) {
        if (e.candidate == null)
            return;

        this.mApp.mWSocket.sendIceCandidate(e.candidate, this.mConnectionId, (resp) => {
            // console.warn('Response of ICE-Cand', resp);
        });
    }

    processAnswer(response) {
        // console.log('Received Answer', response);
        const answer = {
            type: 'answer',
            sdp: response.sdpAnswer
        };

        this.mWebRtcPeer.setRemoteDescription(answer).then(() => {
            // console.log('Remote Description Set');
        }).catch(error => {
            if(this.mDebug) console.log(`Failed to set Remote Description:`, error);
        });
    }

    onTrackEvent(e) {
        const track = e.track;
        const stream = e.streams ? e.streams[0] : null;

        if (stream == null) {
            return;
        }

        if (this.mStream == null) {
            this.mStream = stream; // new MediaStream();
        }

        HtmlDebug(`onTrackEvent Called ----------- ${this.mConnectionId}`)
        if (this.mVideoElement == null) {
            if(this.mDebug) console.log(`Adding Video Elements for Connection: ${this.mConnectionId}`);
            HtmlDebug(`Adding Video Elements for Connection: ${this.mConnectionId}`);
            this.mVideoElement = this.mApp.mCollectionView.addBox(this.mConnectionId);
            this.mDiscussionCanvas = new DiscussionCanvas(this.mApp, `drawingCanv_${this.mConnectionId}`, this.mVideoElement.parentNode);
        }

        this.mVideoElement.srcObject = null;
        this.mVideoElement.srcObject = this.mStream;

        if (!stream.onaddtrack) {
            stream.onaddtrack = (e) => this.onTrackAddedEvent(e);
        }
        if (stream.onremovetrack) {
            stream.onremovetrack = (e) => this.onTrackRemovedEvent(e);
        }

        if (!track.onmute) {
            track.onmute = (e) => this.onTrackMuted(track, e);
        }

        if (!track.onunmute) {
            track.onunmute = (e) => this.onTrackUnMuted(track, e);
        }

    }

    onTrackMuted(track, e) {
        if(this.mDebug) console.log('onTrackMuted=>', e, track);
    }

    onTrackUnMuted(track, e) {
        if(this.mDebug) console.log('onTrackUnMuted=>', e, track);
    }

    onTrackAddedEvent(e) {
        if(this.mDebug) console.log('onTrackAddedEvent=>', e);
    }

    onTrackRemovedEvent(e) {
        if(this.mDebug) console.log('onTrackRemovedEvent=>', e);
    }

    onIceConnectionStateChanged(e) {
        if(this.mDebug) CPrint(`IceConnectionStateChanged==> ${this.mWebRtcPeer.iceConnectionState}`);
    }

    stop() {
        // console.debug('Disposing WebRtcPeer');
        if(this.mDebug) CPrint("Closing WebRtcPeer", 'black', 'yellow')
        if (this.mWebRtcPeer) {
            if (this.mWebRtcPeer.signalingState === 'closed') {
                return;
            }
            if (this.mVideoElement !== null)
                this.mApp.mCollectionView.removeBox(this.mConnectionId)

            this.mWebRtcPeer.close();

            if(this.mStream !== null)
                this.mStream.getTracks().forEach((track) => track.stop())

            if (this.mDiscussionCanvas !== null)
                this.mDiscussionCanvas.stop()

            this.mStream = null
        }

    }
}
class PeerHandler {
    constructor(app, name) {
        this.mApp = app
        this.mName = name

        this.mOfferOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }

        this.mConnection = null;
        this.mRemoteConnections = {};
        this.mFunScreenVideo = null;
    }

    onRoomJoined(result) {
        this.mSessionId = result.sessionId;

        this.mConnection = new LocalPeer(this.mApp, result);

        const existingParticipants = result.value;
        existingParticipants.forEach(participant => {
            const connection = new RemotePeer(this.mApp, participant);
            this.mRemoteConnections[participant.id] = connection;

            if (participant.streams && participant.streams.length > 0) {
                connection.addRemoteStream(participant);
            }

        });
    }

    recvIceCandidate(msg) {
        // console.log('Received ICE', msg);
        const candidate = {
            candidate: msg.candidate,
            component: msg.component,
            foundation: msg.foundation,
            port: msg.port,
            priority: msg.priority,
            protocol: msg.protocol,
            relatedAddress: msg.relatedAddress,
            relatedPort: msg.relatedPort,
            sdpMid: msg.sdpMid,
            sdpMLineIndex: msg.sdpMLineIndex,
            tcpType: msg.tcpType,
            usernameFragment: msg.usernameFragment,
            type: msg.type,
            toJSON: () => {
                return {candidate: msg.candidate};
            }
        };

        const connection = this.getConnection(msg.senderConnectionId);
        if (!!connection) {
            connection.mWebRtcPeer.addIceCandidate(candidate).then(() => {
                // console.log('Received ICE-Can Added');
            }).catch((error) => {
                console.log(`Error adding candidate for ${msg.senderConnectionId}`, error);
            });
        }
    }

    onParticipantJoined(msg) {
        let connection = this.getRemoteConnection(msg.id);
        if (!!connection) {
            console.log(`Connection ${msg.id} already exists in connections list`)
            HtmlDebug(`Connection ${msg.id} already exists in connections list`)
        } else {
            connection = new RemotePeer(this.mApp, msg);
            this.mRemoteConnections[msg.id] = connection;
        }
    }

    onParticipantLeft(msg) {
        const connection = this.getRemoteConnection(msg.connectionId);
        if (!!connection) {
            connection.stop();

            delete this.mRemoteConnections[msg.connectionId];

        } else {
            console.log(`Connection ${msg.id} not found in connection list`);
        }
    }

    onParticipantPublished(msg) {
        const connection = this.getRemoteConnection(msg.id);
        if (!!connection) {
            if (msg.streams.length === 0){
                HtmlDebug('No streams offered')
                throw 'No streams offered';
            }

            connection.addRemoteStream(msg);
        } else {
            HtmlDebug(`Connection ${msg.id} not found in connection list`);
            console.log(`Connection ${msg.id} not found in connection list`);
        }
    }

    onStreamPropertyChanged(msg) {
        // connectionId: "con_BAGxePIKgD"
        // newValue: "true"
        // property: "audioActive"
        // reason: "publishAudio"
        // streamId: "str_CAM_E3aw_con_BAGxePIKgD"

        const connection = this.getConnection(msg.connectionId);
        if (!!connection && connection.streamId === msg.streamId) {
            switch (msg.property) {
                case 'audioActive':
                    break;
                case 'videoActive':
                    break;
                case 'videoDimensions':
                    break;

            }

        } else {
            console.log(`Connection ${msg.id} not found in connection list`);
        }
    }

    getConnection(connectionId) {
        const connection = this.mRemoteConnections[connectionId];
        if (!!connection) {
            return connection;
        } else if (this.mConnection.mConnectionId === connectionId) {
            return this.mConnection;
        } else {
            console.error(`A connection not found for id=${connectionId}`);
            return null;
        }
    }

    getRemoteConnection(connectionId) {
        const connection = this.mRemoteConnections[connectionId];
        if (!!connection) {
            return connection;
        } else {
            console.warn(`Remote connection not found for id=${connectionId}`);
            return null;
        }
    }


    micMute() {
        if (this.mConnection.mStream === null)
            return
        this.mConnection.mStream.getAudioTracks().forEach(track => track.enabled = false);
    }

    micUnMute() {
        if (this.mConnection.mStream === null)
            return
        this.mConnection.mStream.getAudioTracks().forEach(track => track.enabled = true);
    }

    cameraMute() {
        if (this.mConnection.mStream === null)
            return
        this.mConnection.mVideoElement.srcObject = null;
        this.mConnection.mStream.getVideoTracks().forEach(track => track.enabled = false);
    }

    cameraUnMute() {
        if (this.mConnection.mStream === null)
            return

        this.mApp.mUI.setScreenState(false)
        if (this.mConnection.mStream.getVideoTracks().length === 0) {
            this.mApp.mConfig.callType = 'Video';
            this.mApp.mConfig.constraints.video = true;
            this.mApp.reStart()
            return;
        }
        this.mConnection.mDummyCanvas.stop()
        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
            this.mConnection.replaceTrack(stream.getVideoTracks()[0])
        })
        this.mConnection.mVideoElement.srcObject = this.mConnection.mStream;
        // this.mConnection.mStream.getVideoTracks().forEach(track => track.enabled = true);
    }

    screenUnMute() {
        if (this.mConnection.mStream === null)
            return

        this.mApp.mUI.setCameraState(false)
        if (this.mConnection.mStream.getVideoTracks().length === 0) {
            this.mApp.mHistory = DeepClone(this.mApp.mConfig)
            this.mApp.mConfig.callType = 'Screen';
            this.mApp.mConfig.constraints.video = true;
            this.mApp.reStart()
            return;
        }

        navigator.mediaDevices.getDisplayMedia({video: true}).then((stream) => {
            this.mConnection.replaceTrack(stream.getVideoTracks()[0])
            this.mApp.mCollectionView.requestFullScreen(this.mConnection.mConnectionId)
            this.mConnection.mDataSocket.relayMessage('fullscreen') //exit-fullscreen
            this.mFunScreenVideo = () => {
                CPrint("Video Click is Working")
                this.mApp.mUI.onStartSelection()
                this.mApp.startDiscussion()
            }
            this.mConnection.mVideoElement.addEventListener('click', this.mFunScreenVideo)
            stream.getVideoTracks()[0].onended = () => {
                this.screenMute()
            };
        }).catch((e) => {
            this.screenMute()
        })
    }

    screenMute() {
        this.mApp.mUI.setScreenState(false)
        if (this.mConnection.mStream === null)
            return

        if (this.mFunScreenVideo !== null)
            this.mConnection.mVideoElement.removeEventListener('click', this.mFunScreenVideo)


        if (this.mApp.mDiscussionMode) {
            if (this.mApp.mUI.mDrawingUI.mFuncResetSelection !== null) {
                this.mApp.mUI.mDrawingUI.mFuncResetSelection()
            }
        }

        this.mConnection.mDataSocket.relayMessage('exit-fullscreen') //exit-fullscreen
        this.mApp.mCollectionView.requestExitFullScreen(this.mConnection.mConnectionId)

        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
            this.mConnection.replaceTrack(stream.getVideoTracks()[0])
            this.mApp.mCollectionView.requestExitFullScreen(this.mConnection.mConnectionId)
            this.mConnection.mDataSocket.relayMessage('exit-fullscreen')
            this.mApp.mUI.setCameraState(true)
        }).catch((e) => {
            this.mConnection.mStream.getVideoTracks().forEach(track => track.enabled = false);
            this.mConnection.mVideoElement.srcObject = null;
        })
    }

    replaceSpeakerTrack(source) {
        let constraints = {audio: {deviceId: {exact: source}}}
        for (let key of Object.keys(this.mRemoteConnections)) {
            let pC = this.mRemoteConnections[key]
            pC.mVideoElement.setSinkId(source)
        }
    }

    stop() {
        CPrint("Closing PeerHandler", 'black', 'yellow')

        for (let key of Object.keys(this.mRemoteConnections)) {
            this.mRemoteConnections[key].stop()
            delete this.mRemoteConnections[key]
        }
        this.mConnection.mDataSocket.stop();
        this.mConnection.stop()
    }


    // mute(kind) {
    //     let tracks = this.mConnection.mStream.getTracks();
    //     for (const track of tracks) {
    //         if (track.kind === kind) {
    //             track.stop()
    //             this.mConnection.mStream.removeTrack(track)
    //         }
    //     }
    //     CPrint(`${kind} Track Muted`, 'white', 'green')
    //     return tracks;
    // }
    //
    // muteTrack(kind) {
    //     this.mute(kind);
    //     this.mConnection.removeTrack(kind)
    // }
    //
    // unMuteTrack(kind) {
    //     let constraints = {}
    //     constraints[kind] = true
    //     navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    //         let tracks = stream.getTracks();
    //         if (this.mConnection.mStream === null)
    //             this.mConnection.mStream = stream;
    //         else{
    //             tracks.forEach(track => this.mConnection.mStream.addTrack(track))
    //             this.mConnection.addTrack(tracks)
    //         }
    //
    //         this.mConnection.mVideoElement.srcObject = null;
    //         this.mConnection.mVideoElement.srcObject = this.mConnection.mStream;
    //     })
    //
    // }
}
class LocalPeer extends BasePeer {
    constructor(app, participant) {
        super(app, participant);

        this.mClientData = this.mApp.mConfig.client_data;

        this.mOfferConstraints = {
            offerToReceiveAudio: false,
            offerToReceiveVideo: false
        };

        this.mVideoElement = this.mApp.mCollectionView.addBox(this.mConnectionId, true);
        HtmlDebug(`Adding LocalVideo Element for ${this.mConnectionId}`);
        this.mDummyCanvas = new DummyCanvas(this.mApp, `dummyCanv_${this.mConnectionId}`, this.mVideoElement.parentNode)
        this.mDiscussionCanvas = new DiscussionCanvas(this.mApp, `drawingCanv_${this.mConnectionId}`, this.mVideoElement.parentNode);

        this.mDataSocket = new DataSocket(this)
        this.mHasAudio = true;
        this.mAudioActive = true;
        this.mHasVideo = false;
        this.mVideoActive = false;
        if (this.mApp.mConfig.callType === 'Video') {
            this.mHasVideo = true;
            this.mVideoActive = true;
            this.startLocalVideo()
        }
        else if (this.mApp.mConfig.callType === 'Screen') {
            this.mHasVideo = true;
            this.mVideoActive = true;
            this.startLocalScreen();
        } else {
            this.mHasVideo = true;
            this.mVideoActive = true;
            this.startLocalAudio();
        }
    }

    createPeerConnection() {
        this.mWebRtcPeer = new RTCPeerConnection(this.mApp.mConfig.pcConfig);
        this.mWebRtcPeer.oniceconnectionstatechange = (e) => this.onIceConnectionStateChanged(e);
        this.mWebRtcPeer.onicecandidate = (e) => this.onIceCandidateEvent(e);
    }

    startLocalAudio() {
        let constraints = this.mApp.mConfig.constraints;
        this.mDummyCanvas.start()
        let canvStream = this.mDummyCanvas.getStream()
        this.mDummyCanvas.drawLoop()
        navigator.mediaDevices.getUserMedia(constraints).then((audioStream) => {
            audioStream.addTrack(canvStream.getVideoTracks()[0])
            this.onMediaStreamReady(audioStream)
        }).catch(e => {
            HtmlDebug('Error: getUserMedia startLocalVideo');
            console.log('getUserMedia() error: ', e)
        });
    }

    startLocalVideo() {
        let constraints = this.mApp.mConfig.constraints;
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.onMediaStreamReady(stream)
            this.mVideoElement.srcObject = stream;
        }).catch(e => {
            HtmlDebug('Error: getUserMedia startLocalVideo');
            console.log('getUserMedia() error: ', e)
        });
    }


    startLocalScreen() {
        navigator.mediaDevices.getDisplayMedia({video: true}).then((stream) => {
            navigator.mediaDevices.getUserMedia({audio: true}).then((audioStream) => {
                if (stream.getAudioTracks().length === 0) {
                    let AudioTracks = audioStream.getAudioTracks()
                    if (AudioTracks.length > 0) {
                        stream.addTrack(AudioTracks[0])
                    }
                }
                this.onMediaStreamReady(stream);
                this.mVideoElement.srcObject = stream;
                this.mApp.mCollectionView.requestFullScreen(this.mConnectionId)
                this.mDataSocket.relayMessage('fullscreen') //exit-fullscreen
                this.mPeerHandler.mFunScreenVideo = () => {
                    CPrint("Video Click is Working")
                    this.mApp.mUI.onStartSelection()
                    this.mApp.startDiscussion()
                }
                this.mVideoElement.addEventListener('click', this.mPeerHandler.mFunScreenVideo)
            })
            stream.getVideoTracks()[0].onended = () => {
                this.mPeerHandler.screenMute()
            };
        }).catch((e) => {
            this.mPeerHandler.screenMute()
        })
    }

    onMediaStreamReady(stream) {
        this.mStream = stream;
        this.createPeerConnection();
        this.mStream.getTracks().forEach(track => this.mWebRtcPeer.addTrack(track, this.mStream));
        this.sendOffer(this.mOfferConstraints);
    }

    sendOffer(options) {
        this.mWebRtcPeer.createOffer(options).then((offerSDP) => {
            return this.mWebRtcPeer.setLocalDescription(offerSDP);
        }).then(() => {
            const localDescription = this.mWebRtcPeer.localDescription;
            if (!!localDescription) {
                console.debug('Local description set');
                HtmlDebug('Local description set');
                const params = {
                    doLoopback: false,
                    hasAudio: this.mHasAudio,
                    audioActive: this.mAudioActive,
                    hasVideo: this.mHasVideo,
                    videoActive: this.mVideoActive,
                    typeOfVideo: "",
                    frameRate: -1,
                    sdpOffer: localDescription.sdp
                };

                this.mApp.mWSocket.sendRequest('publishVideo', params, (answer) => {
                    this.processAnswer(answer);
                });
            } else {
                HtmlDebug('Error: Local description is not defined');
                console.error('Local description is not defined');
            }

        }).catch(error => {
            HtmlDebug('Error: Failed to create session description');
            console.log(`Failed to create session description:`, error);
        });
    }

    addTracks(tracks) {
        for (const track of tracks) {
            this.mWebRtcPeer.addTrack(track, this.mStream)
        }
        this.sendOffer(this.mPeerHandler.mOfferOptions)
    }

    replaceTrack(newTrack, stopTrack = true) {
        let oldTrack = this.mStream.getTracks().find((t) => {
            return t.kind === newTrack.kind;
        })
        var sender = this.mWebRtcPeer.getSenders().find((s) => {
            return s.track.kind === newTrack.kind;
        });
        HtmlDebug(`Replacing ${newTrack.kind} Track ${sender}`);
        // CPrint(`Replacing ${newTrack.kind} Track ${sender}`, 'blue', 'white');
        if (sender !== undefined) {
            CPrint(`Replacing ${newTrack.kind} Track`, 'blue', 'white');
            sender.replaceTrack(newTrack);
            this.mStream.removeTrack(oldTrack)
            this.mStream.addTrack(newTrack)
            if (newTrack.kind === 'video') {
                this.mVideoElement.srcObject = null
                this.mVideoElement.srcObject = this.mStream
            }
            if (stopTrack)
                oldTrack.stop()
            else {
                oldTrack.enabled = false;
                return oldTrack;
            }
        }
        return null
    }

    replaceMicTrack(source) {
        let constraints = {audio: {deviceId: {exact: source}}}

        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            let audioTracks = stream.getAudioTracks();
            this.replaceTrack(audioTracks[0])
        })
    }

    replaceCameraTrack(source) {
        let constraints = {video: {deviceId: {exact: source}}}

        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            let videoTracks = stream.getVideoTracks();
            this.replaceTrack(videoTracks[0])
        })
    }

    removeTrack(kind) {
        var senders = this.mWebRtcPeer.getSenders();
        var i = senders.length
        while (i--) {
            if (senders[i].track === null) {
                CPrint("Handle Mic Sender Track Why Null: Should use Null Sender instead of making new", "white", "yellow")
                continue
            }

            if (senders[i].track.kind === kind) {
                this.mWebRtcPeer.removeTrack(senders[i])
                senders.splice(i, 1);
            }
        }
        let options = {offerToReceiveAudio: 1, offerToReceiveVideo: 1, iceRestart: true}
        this.sendOffer(options);
    }
}
class RemotePeer extends BasePeer {
    constructor(app, participant) {
        super(app, participant);

        this.mLocalStream = null;
        this.mOfferConstraints = null;
        this.mDiscussionCanvas
        this.createPeerConnection();
    }

    sendOffer(options) {
        const stream = options.streams[0];
        this.mOfferConstraints = {
            offerToReceiveAudio: stream.hasAudio,
            offerToReceiveVideo: stream.hasVideo
        };

        this.mWebRtcPeer.createOffer(this.mOfferConstraints).then((desc) => {
            return this.mWebRtcPeer.setLocalDescription(desc);
        }).then(() => {
            const localDescription = this.mWebRtcPeer.localDescription;
            if (!!localDescription) {
                console.log(`Local description set for ${this.mConnectionId}`);

                const params = {
                    sender: stream.id,
                    sdpOffer: localDescription.sdp
                };

                this.mApp.mWSocket.sendRequest('receiveVideoFrom', params, (answer) => {
                    this.processAnswer(answer);
                });
            } else {
                console.error('Local description is not defined');
            }
        });
    }

    addRemoteStream(options) {
        const stream = options.streams[0];

        this.mStreamId = stream.id;
        this.mHasAudio = stream.hasAudio;
        this.mHasVideo = stream.hasVideo;
        this.mAudioActive = stream.audioActive;
        this.mVideoActive = stream.videoActive;

        if (!!stream.videoDimensions) {
            this.mVideoDimensions = JSON.parse(stream.videoDimensions);
        }

        this.sendOffer(options);
    }
}
class MyApp {
    constructor(config) {
        this.mConfig = config;
        this.mConfig.pcConfig = {};
        this.mUI = null;
        // this.config = config;
        this.mRoomId = config.roomId;

        this.mCollectionView = new CollectionView(this, 'main-app');
        this.mPeerHandler = new PeerHandler(this, 'Peer-Handler');
        this.mAuthHandler = new AuthHandler(this, 'Auth_Handler');
        this.mDiscussionMode = false;
        this.init();
        this.mStarted = false
    }

    init() {
        this.mWSocket = null;
        this.mToken = null;
        this.mWsUrl = null;
        this.mActiveCanvas = null;
        this.mSessionId = null;
        this.mHistory = {};
    }

    start() {
        console.log(this)
        this.mAuthHandler.getToken((error, token, wsUrl) => {
            if (error) {
                console.log('Error: While Getting Token');
                HtmlDebug('Error: While Getting Token');
            } else {
                HtmlDebug('Success: Received Token');
                this.mStarted = true;
                this.onAuthSuccess(token, wsUrl);
                this.mUI.attachChatElements()
                this.mUI.mConfig = this.mConfig;
                this.mUI.resetStates();
            }
        });
    }

    reStart() {
        if (this.mWSocket !== null)
            this.mWSocket.reopen()

        HtmlDebug('App is Restarting');
        this.mUI.resetStates()
    }

    stop() {
        CPrint("Closing Main App", 'black', 'yellow')
        HtmlDebug('Success: Closing Main App');

        if (this.mWSocket !== null)
            this.mWSocket.stop();
        this.mStarted = false;
        this.mPeerHandler.stop();
        this.init()
    }

    sendMessage() {
        let msg = `Me:- ${this.mUI.getMessageText()}`
        this.mPeerHandler.mConnection.mDataSocket.relayMessage("message", {message: msg})
        this.mUI.appendMessage(msg)
        this.mUI.setMessageText('');
    }

    onAuthSuccess(token, wsUrl) {
        this.mToken = token;
        this.mWsUrl = wsUrl;
        this.mWSocket = new WSocket(this, this.mWsUrl);
    }

    onSocketOpened() {
        this.mWSocket.joinRoom(this.mRoomId, this.mToken, (result) => {

            this.mToken = null;
            this.mPeerHandler.onRoomJoined(result)
        });
    }

    startDiscussion() {
        this.mDiscussionMode = true
        this.mActiveCanvas = this.mPeerHandler.mConnection.mDiscussionCanvas;
        this.mActiveCanvas.start()
        this.mUI.showSelectionButton()
        this.mActiveCanvas.getBackground()
        this.mPeerHandler.mConnection.mVideoElement.style.display = 'none';

        this.mPeerHandler.mConnection.mDataSocket.relayMessage('discussion', this.mActiveCanvas.getCanvasContext())
        this.mActiveCanvas.mCanvas.style.opacity = 1.0;
        this.mPeerHandler.mConnection.mStream.getVideoTracks()[0].enabled = false;

    }

    stopDiscussion() {
        this.mPeerHandler.mConnection.mDataSocket.relayMessage('exit-discussion')
        this.mActiveCanvas.stop()
        this.mUI.onStopSelection()
        this.mDiscussionMode = false
        this.mActiveCanvas = null;
        this.mPeerHandler.mConnection.mStream.getVideoTracks()[0].enabled = true
        this.mPeerHandler.mConnection.mVideoElement.style.display = 'block';
    }
}
function showToast(txt, background = "black", fontColor = "white") {
    var x = document.getElementById("snackbar");
    if (x === null) return;
    x.style.backgroundColor = background;
    x.style.color = fontColor;
    x.innerHTML = txt;
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "")
    }, 3e3)
}

function CPrint(text, color = "white", background = "black", traceback = false) {
    str = `%c ${text}`;
    style = `background: ${background}; color: ${color}`;
    if (traceback) {
        console.trace(str, style)
    } else console.log(str, style)
}

function DeepClone(item) {
    if (!item) {
        return item
    }
    var types = [Number, String, Boolean],
        result;
    types.forEach(function (type) {
        if (item instanceof type) {
            result = type(item)
        }
    });
    if (typeof result == "undefined") {
        if (Object.prototype.toString.call(item) === "[object Array]") {
            result = [];
            item.forEach(function (child, index, array) {
                result[index] = DeepClone(child)
            })
        } else if (typeof item == "object") {
            if (item.nodeType && typeof item.cloneNode == "function") {
                result = item.cloneNode(true)
            } else if (!item.prototype) {
                if (item instanceof Date) {
                    result = new Date(item)
                } else {
                    result = {};
                    for (var i in item) {
                        result[i] = DeepClone(item[i])
                    }
                }
            } else {
                if (false && item.constructor) {
                    result = new item.constructor
                } else {
                    result = item
                }
            }
        } else {
            result = item
        }
    }
    return result
}
var debugArea = document.getElementById("debugArea");

function HtmlDebug(msg) {
    if (debugArea === null) return;
    debugArea.value += `- ${msg}\n`;
    debugArea.scrollTop = debugArea.scrollHeight
}

function ClearTextArea() {
    if (debugArea === null) return;
    debugArea.value = "";
    debugArea.scrollTop = debugArea.scrollHeight
}
const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;
const MAX_RETRIES = 2e3;
const RETRY_TIME_MS = 3e3;
class WSocket {
    constructor(app, wsURL) {
        this.mApp = app;
        this.mPeerHandler = this.mApp.mPeerHandler;
        this.mClosing = false;
        this.mReconnecting = false;
        this.mWsUrl = wsURL;
        this.mMaxRetries = MAX_RETRIES;
        this.mNumRetries = 1;

        this.mPingTimeoutTimer = null;
        this.mReconnectTimer = null;

        this.start(wsURL);
    }

    init() {
        this.mWebSocket = null;
        this.mCmdId = 0;
        this.mPingTimer = null;
        this.messages = {};
    }

    start(wsURL) {
        this.init();
        this.mWebSocket = new WebSocket(wsURL);
        this.mWebSocket.onopen = () => this.onSocketOpened();
        this.mWebSocket.onmessage = (e) => this.onSocketMessage(e);
        this.mWebSocket.onerror = (e) => this.onSocketError(e);
    }

    stop() {
        this.mApp.mUI.setWebSocketIndication(false)
        if (this.mClosing) {
            console.log('Already closing in progress');
            return;
        }

        CPrint("Closing WebSocket", 'black', 'yellow');
        this.mClosing = true;

        this.sendRequest('leaveRoom', {}, (result) => {
            console.log('LeaveRoom Result = ', result);
            this._doClose();
        });
    }

    _doClose() {
        if (this.mPingTimer != null)
            clearTimeout(this.mPingTimer);
        if (this.mReconnectTimer != null) {
            clearTimeout(this.mReconnectTimer);
            this.mReconnectTimer = null;
        }
        if (this.mPingTimeoutTimer != null) {
            clearTimeout(this.mPingTimeoutTimer);
            this.mPingTimeoutTimer = null;
        }

        this.mWebSocket.close();
    }

    reopen() {

        this.sendRequest('leaveRoom', {}, (result) => {
            console.log('LeaveRoom Result = ', result);
            this._doClose();
        });

        this.mWebSocket.close();
    }

    onSocketOpened() {
        this.mApp.mUI.setWebSocketIndication(true)
        console.debug('WebSocket Opened');

        this.mWebSocket.onclose = () => this.onSocketClosed();
        this.mWebSocket.onerror = () => {};

        this.mClosing = false;
        this.mReconnecting = false;

        this.sendPing();
        this.mApp.onSocketOpened();
    }

    onSocketError(error) {
        this.mApp.mUI.setWebSocketIndication(false)
        console.debug('WebSocket Error: ', error);
        if (this.mNumRetries === this.mMaxRetries) {
            console.warn('Error Reconnecting WS');
        } else if (!this.mClosing) {
            this.mReconnectTimer = setTimeout(() => {
                this.mNumRetries += 1;
                this.reconnect();
            }, RETRY_TIME_MS);
        }
    }

    onSocketClosed() {
        this.mApp.mUI.setWebSocketIndication(false)
        this.mWebSocket.onclose = () => {};
        this.mWebSocket.onerror = () => this.onSocketError();

        if (this.mWebSocket.readyState === CLOSED) {
            if (this.mClosing) {
                console.debug("Connection closed by user");
            } else {
                this.mNumRetries = 1;
                this.mApp.mPeerHandler.stop();
                this.reconnect();
            }

        } else {
            console.log('WS not yet closed!!, State = ', this.mWebSocket.readyState);
        }
    }

    reconnect() {
        if (this.mNumRetries === 1) {
            if (this.mReconnecting) {
                console.warn('Trying to reconnect when already reconnecting... Ignoring this reconnection.');
                return;
            } else {
                CPrint('Reconnecting WS', 'white', 'blue');
                this.mReconnecting = true;
            }
        }

        if (this.mApp.mToken == null) {
            this.mApp.mAuthHandler.getToken((error, token, wsUrl) => {

                if (error != null) {
                    this.mReconnectTimer = setTimeout(() => {
                        this.mNumRetries += 1;
                        this.reconnect();
                    }, RETRY_TIME_MS);

                } else {
                    this.mApp.mToken = token;
                    this.mWsUrl = wsUrl;

                    this.start(this.mWsUrl);
                }
            });
        } else {
            this.start(this.mWsUrl);
        }

    }

    onSocketMessage(event) {

        const message = JSON.parse(event.data);
        // console.debug('WS Event Data = ', message);
        // console.log('WS Event Request = ', this.messages[message.id]);

        const request = this.messages[message.id];
        const method = message.method;
        if (['ping', 'iceCandidate', 'onIceCandidate', undefined].includes(message.method) === false)
            HtmlDebug(`<---- Received Message of Type ${message.method}`);

        if ('error' in message) {
            HtmlDebug(`<---- Received Error From Server ${message.method}`);
            CPrint(`Received Error From Server`, 'white', 'red', true);
            console.debug('WS Event Data = ', message);
        }
        if (request) {
            delete this.messages[message.id];

            if (request.callback) {
                request.callback(message.result);
            } else {
                console.error('Request used without callback!!', request, message);
            }

        } else if (method) {
            switch (method) {
                case 'iceCandidate':
                    this.mPeerHandler.recvIceCandidate(message.params);
                    break;
                case 'sendMessage':
                    break;
                case 'participantJoined':
                    this.mPeerHandler.onParticipantJoined(message.params);
                    break;
                case 'participantPublished':
                    this.mPeerHandler.onParticipantPublished(message.params);
                    break;
                case 'participantLeft':
                    this.mPeerHandler.onParticipantLeft(message.params);
                    break;
                case 'streamPropertyChanged':
                    this.mPeerHandler.onStreamPropertyChanged(message.params);
                    break;
            }
        }
    }

    sendMessage(message, callback) {
        message.id = this.mCmdId++;
        if (['ping', 'onIceCandidate', undefined].includes(message.method) === false)
            HtmlDebug(`-----> Sending Message of Type ${message.method}`);
        // console.debug('WS Send =>', message);
        this.mWebSocket.send(JSON.stringify(message));

        this.messages[message.id] = {
            message: message,
            callback: callback
        };

        return message.id;
    }

    sendRequest(method, params, callback) {
        const req = {
            jsonrpc: "2.0",
            method: method,
            params: params
        };

        return this.sendMessage(req, callback);
    }

    sendPing() {
        const params = {
            interval: 5000
        };

        this.sendRequest('ping', params, (r) => {
            this.mPingTimer = setTimeout(() => {

                if (this.mPingTimeoutTimer != null) {
                    clearTimeout(this.mPingTimeoutTimer);
                    this.mPingTimeoutTimer = null;
                }

                this.sendPing();
            }, 2000);

        });

        // this.mPingTimeoutTimer = setTimeout(() => {  // TODO FiX iT: Calls recursivly
        //     CPrint('Pong Wait Timed Out!!', 'white', 'red');
        //     this.reopen();
        // }, 10000);
    }

    joinRoom(room_id, token, callback) {
        const params = {
            token: token,
            session: room_id,
            platform: navigator.userAgent,
            metadata: JSON.stringify(this.mApp.mConfig.client_data),
            secret: "",
            recorder: false
        };

        return this.sendRequest('joinRoom', params, callback);
    }

    sendIceCandidate(candidate, connectionId, callback) {
        const params = {
            endpointName: connectionId,
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex
        };

        return this.sendRequest('onIceCandidate', params, callback);
    }
}