let time;
let frameCountBuffer = 0;
let fps = 0;

const CANVAS_W = 960;
const CANVAS_H = 1280;

const BUTTON_OFFSET = 8;
const BUTTON_W = CANVAS_W/4;
const BUTTON_H = BUTTON_W/2;
const BUTTON_Y = CANVAS_H*2/3;
const BUTTON_M = 24;

const GRID_SIZE = 64;
const GRID_W = 64;

const CAP_W = 480;
const CAP_H = 640;
let capture;
let captureImage;
let captureFlag = false;

const JOYSTICK_X = GRID_SIZE*12;
const JOYSTICK_Y = GRID_SIZE*15;
const JOYSTICK_SIZE = GRID_SIZE*3;
const JOYSTICK_RANGE = GRID_SIZE*2;
let joystick;
const EYES_Y = CAP_H*1/3;
const TEETH_Y = CAP_H*1/2;

const MODE_VIDEO = 0;
const MODE_VIEW = 1;
let mode = MODE_VIDEO;
let targetY = CAP_H*3/4;

let timeCount;
const TEXT_VIEW_SIZE = 32;

const DEBUG = true;
const DEBUG_VIEW_X = 40;
const DEBUG_VIEW_Y = 20;
const DEBUG_VIEW_H = 20;

function preload() {
}
function getFn() {
	captureFlag = true;
}
function startFn() {
}
function setup() {
	createCanvas(CANVAS_W, CANVAS_H);
	time = millis();
	rectMode(CENTER);
	capture = createCapture({
		audio: false,
		video: {
			facingMode: "user"
		}
	}, {flipped:true}
	);
	capture.size(CAP_W, CAP_H);
	capture.hide();

	getButton = buttonInit('cap', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, BUTTON_Y+BUTTON_H+BUTTON_M);
	getButton.mousePressed(getFn);
	joystickInit();
	textAlign(CENTER,CENTER);
}
function buttonInit(text, w, h, x, y) {
	let button = createButton(text);
	button.size(w,h);
	button.position(x+BUTTON_OFFSET,y+BUTTON_OFFSET);
	button.style('font-size', '48px');
	return button;
}
function joystickInit() {
	joystick = {};
	joystick.pos = {};
	joystick.pos.x = JOYSTICK_X;
	joystick.pos.y = JOYSTICK_Y;
	joystick.offset = {};
	joystick.offset.x = 0;
	joystick.offset.y = 0;
	joystick.control = false;
}
function draw() {
	background(48);
	let current = millis();
	if ( (current-time)>=1000 ){
		time += 1000;
		fps = frameCount - frameCountBuffer;
		frameCountBuffer = frameCount;
	}
	if (DEBUG){
		stroke(128);
		strokeWeight(1);
		for (let i=0; i<CANVAS_H/GRID_SIZE; i++){
			line(0, i*GRID_SIZE, CANVAS_W, i*GRID_SIZE);
		}
		for (let i=0; i<CANVAS_W/GRID_SIZE; i++){
			line(i*GRID_SIZE, 0, i*GRID_SIZE, CANVAS_H);
		}
	}
	if (joystick.control){
		if (joystick.pos.x>=JOYSTICK_X+JOYSTICK_RANGE){
			joystick.pos.x = JOYSTICK_X+JOYSTICK_RANGE;
		}else if(joystick.pos.x<=JOYSTICK_X-JOYSTICK_RANGE){
			joystick.pos.x = JOYSTICK_X-JOYSTICK_RANGE;
		}	
		if (joystick.pos.y>=JOYSTICK_Y+JOYSTICK_RANGE){
			joystick.pos.y = JOYSTICK_Y+JOYSTICK_RANGE;
		}else if(joystick.pos.y<=JOYSTICK_Y-JOYSTICK_RANGE){
			joystick.pos.y = JOYSTICK_Y-JOYSTICK_RANGE;
		}
	}else{
		joystick.pos.x = JOYSTICK_X;
		joystick.pos.y = JOYSTICK_Y;
	}
	joystick.x = (joystick.pos.x-JOYSTICK_X)/JOYSTICK_RANGE;
	joystick.y = -(joystick.pos.y-JOYSTICK_Y)/JOYSTICK_RANGE;
	if (mode==MODE_VIDEO){
		image(capture, 0, 0, CANVAS_W);
		if (captureFlag){
			captureFlag = false;
			captureImage = capture.get();
			mode = MODE_VIEW;
		}
	}else if (mode==MODE_VIEW){
		image(captureImage, 0, 0, CANVAS_W);
		targetY += joystick.y;
		if (captureFlag){
			captureFlag = false;
			mode = MODE_VIDEO;
		}
	}
	stroke('blue');
	strokeWeight(2);
	line(0, EYES_Y, CANVAS_W, EYES_Y);
	line(0, TEETH_Y, CANVAS_W, TEETH_Y);
	line(0, targetY, CANVAS_W, targetY);
	fill(200);
	noStroke();
	circle(joystick.pos.x, joystick.pos.y, JOYSTICK_SIZE);

	fill(255);
	stroke(255);
	textSize(16);
	strokeWeight(1);
	let debugY = DEBUG_VIEW_Y;
	text('fps:'+fps, DEBUG_VIEW_X, debugY);
	debugY += DEBUG_VIEW_H;
}
function mousePressed() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	const d = dist(tx, ty, joystick.pos.x, joystick.pos.y);
	if (d<=JOYSTICK_SIZE/2){
		joystick.control = true;
		joystick.offset.x = joystick.pos.x - tx;
		joystick.offset.y = joystick.pos.y - ty;
	}
}
function mouseReleased() {
	joystick.control = false;
}
function mouseDragged() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	if (joystick.control){
		joystick.pos.x = tx + joystick.offset.x;
		joystick.pos.y = ty + joystick.offset.y;
	}
	return false;
}