// account for tile thickness
/* globals PIXI, kd, requestAnimFrame */
"use strict";
var PIXI = require('pixi');
var TWEEN = require('tween');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter;
var Map = require('./map');

// avatar is 32x32 + 6px for shadow
var AVATAR_X_OFFSET = 32 / 2;
var AVATAR_Y_OFFSET = 32 / 2;
var MAP_WIDTH = 1024;
var MAP_HEIGHT = 768;
var STAGE_WIDTH = 1024;
var STAGE_HEIGHT = 768;
var TILE_WIDTH = 91;
var TILE_HEIGHT = 101;
var THICKNESS = 8; // 10 pixels of dirt height

var PEOPLE_PER_TRIBE = 20;


// isometric view and anchor at bottom left skews everything,
// basically moves the map so iso (0, 0) is near the middle top
var SKEW_X_OFFSET = STAGE_WIDTH / 2 - TILE_WIDTH + 240 ;
var SKEW_Y_OFFSET = TILE_HEIGHT * 2 + 170;


var gameOpts = {
    avatarXOffset: AVATAR_X_OFFSET,
    avatarYOffset: AVATAR_Y_OFFSET,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    stageWidth: STAGE_WIDTH,
    stageHeight: STAGE_HEIGHT,
    tileWidth: TILE_WIDTH,
    tileHeight: TILE_HEIGHT,
    thickness: THICKNESS,
    skewXOffset: SKEW_X_OFFSET,
    skewYOffset: SKEW_Y_OFFSET,
    peoplePerTribe:PEOPLE_PER_TRIBE
}

var avatar;
var stage = new PIXI.Stage(0xEEFFFF);
var renderer = new PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT);
document.body.appendChild(renderer.view);

var loader = new PIXI.AssetLoader(['assets/walls.json', 'assets/dudes.json']);

// Background
var bg = new PIXI.Sprite.fromImage("assets/terrain.jpg");
bg.anchor.x = 0.5;
bg.anchor.y = 0.5;
bg.position.x = STAGE_WIDTH / 2;
bg.position.y = STAGE_HEIGHT /2;
stage.addChild(bg);


// Wall
var wall = require('./wall')(stage,emitter, gameOpts);
var coords = require('./coords')(gameOpts);


function stageAvatar(x, y) {
    var avatar = PIXI.Sprite.fromImage('assets/redOrb.png');

    // track 2D position
    avatar.location = new PIXI.Point(x, y);

    var pt = coords.ddToAvatar(x, y);

    avatar.position.x = pt.x;
    avatar.position.y = pt.y;
    avatar.anchor.x = 0;
    avatar.anchor.y = 1;

    stage.addChild(avatar);
    return avatar;
}

loader.onComplete = start;
loader.load();

function start() {
    this.gameMap = new Map(stage, emitter, gameOpts);

    var tribeOptsA = {
        gameMap:this.gameMap,
        peoplePerTribe:PEOPLE_PER_TRIBE,
        initX:370,
        initY:100,
        tribeColor:'green',
        firstRowFirstDudePoint:{
            x:370,
            y:100
        },
        isFirstRowFromEnd:true
    };
    var tribeA = require('./tribe').Tribe(stage, wall, emitter, tribeOptsA, gameOpts);

    var tribeOptsB = {
        gameMap:this.gameMap,
        peoplePerTribe:PEOPLE_PER_TRIBE,
        initX:-300,
        initY:70,
        tribeColor:'blue',
        firstRowFirstDudePoint:{
            x:-410,
            y:70
        },
        isFirstRowFromEnd:false
    };
    var tribeB = require('./tribe').Tribe(stage, wall, emitter, tribeOptsB, gameOpts);

    var mountain_overlay = new PIXI.Sprite.fromImage("assets/mountain_overlay.png");
    mountain_overlay.anchor.x = 0.5;
    mountain_overlay.anchor.y = 0.5;
    mountain_overlay.position.x = STAGE_WIDTH / 2;
    mountain_overlay.position.y = STAGE_HEIGHT /2;
    stage.addChild(mountain_overlay);

    wall.place();

    var overlay = new PIXI.Sprite.fromImage("assets/overlay.png");
    overlay.anchor.x = 0.5;
    overlay.anchor.y = 0.5;
    overlay.position.x = STAGE_WIDTH / 2;
    overlay.position.y = STAGE_HEIGHT /2;
    stage.addChild(overlay);

    function animate() {
        // keyboard handler
        // kd.tick();
        requestAnimationFrame(animate);
        TWEEN.update();
        tribeA.update();
        tribeB.update();
        
        renderer.render(stage);
    }
    requestAnimationFrame(animate);
}
