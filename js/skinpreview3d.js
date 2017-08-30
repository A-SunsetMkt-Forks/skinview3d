/*
	A 3D Minecraft skin renderer
	Project link: https://github.com/yushijinhun/skinpreview3d.js
*/

'use strict';

(function($) {
	$.fn.skinPreview3D = function (options) {
		var skinCanvas = document.createElement('canvas');
		var capeCanvas = document.createElement('canvas');
		var sp = new SkinPreview3D(this, skinCanvas, capeCanvas, options.width, options.height, options.isSlim === true);
		sp.setSkin(options.skinUrl);
		if(options.capeUrl != null){
			sp.setCape(options.capeUrl);
		}
	};

} (window.jQuery));

function SkinPreview3D(model, skinCanvas, capeCanvas, canvasW, canvasH, isSlim){ // TODO: isSlim
	var radius = 32;
	var isPaused = false;
	var originMouseX = 0;
	var rotating = false;
	var modelRot = 0;
	var angleRot = 0;
	var mouseDown = false;

	var camera = new THREE.PerspectiveCamera(75, canvasW / canvasH, 1, 10000);
	camera.position.y = -12;

	var scene = new THREE.Scene();

	skinCanvas.width = 64;
	skinCanvas.height = 64;
	var skinContext = skinCanvas.getContext("2d");

	//Cape Part
	capeCanvas.width = 32;
	capeCanvas.height = 32;
	var capeContext = capeCanvas.getContext("2d");
	var capeTexture = new THREE.Texture(capeCanvas);
	capeTexture.magFilter = THREE.NearestFilter;
	capeTexture.minFilter = THREE.NearestMipMapNearestFilter;

	var skinTexture = new THREE.Texture(skinCanvas);
	skinTexture.magFilter = THREE.NearestFilter;
	skinTexture.minFilter = THREE.NearestMipMapNearestFilter;

	var layer1Material = new THREE.MeshBasicMaterial({map: skinTexture, side: THREE.FrontSide});
	var layer2Material = new THREE.MeshBasicMaterial({map: skinTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
	var capeMaterial = new THREE.MeshBasicMaterial({map: capeTexture});

	var skinImg = new Image();
	skinImg.crossOrigin = '';
	var hasAnimate = false;
	skinImg.onload = () => {
		skinContext.clearRect(0, 0, 64, 64);
		skinContext.drawImage(skinImg, 0, 0);

		skinTexture.needsUpdate = true;
		layer1Material.needsUpdate = true;
		layer2Material.needsUpdate = true;

		if(!hasAnimate) {
			initializeSkin();
			hasAnimate = true;
			drawSkin();
		}
	};

	skinImg.onerror = () => console.log("Failed loading " + skinImg.src);

	var capeImg = new Image();
	capeImg.crossOrigin = '';
	capeImg.onload = () => {
		capePivot.add(capeMesh);

		// Erase what was on the canvas before
		capeContext.clearRect(0, 0, capeCanvas.width, capeCanvas.height);

		// Draw the image to the canvas
		capeContext.drawImage(capeImg, 0, 0, capeCanvas.width, capeCanvas.height);

		capeTexture.needsUpdate = true;
		capeMaterial.needsUpdate = true;
	};
	capeImg.onerror = () => console.log("Failed loading " + capeImg.src);

	this.setSkin = url => skinImg.src = url;
	this.setCape = url => capeImg.src = url;

	var renderer;
	var capePivot;
	var headBox, headMesh, bodyBox, bodyMesh, rightArmBox, rightArmMesh, leftArmBox, leftArmMesh, rightLegBox, rightLegMesh, leftLegBox, leftLegMesh, head2Box, head2Mesh, body2Box, body2Mesh, rightArm2Box, rightArm2Mesh, leftArm2Box, leftArm2Mesh, rightLeg2Box, rightLeg2Mesh, leftLeg2Box, leftLeg2Mesh, capeBox, capeMesh;

	function initializeSkin() {
		// Head Parts
		var headTop = [
			new THREE.Vector2(0.125, 0.875),
			new THREE.Vector2(0.25, 0.875),
			new THREE.Vector2(0.25, 1),
			new THREE.Vector2(0.125, 1)
		];
		var headBottom = [
			new THREE.Vector2(0.25, 0.875),
			new THREE.Vector2(0.375, 0.875),
			new THREE.Vector2(0.375, 1),
			new THREE.Vector2(0.25, 1)
		];
		var headLeft = [
			new THREE.Vector2(0, 0.75),
			new THREE.Vector2(0.125, 0.75),
			new THREE.Vector2(0.125, 0.875),
			new THREE.Vector2(0, 0.875)
		];
		var headFront = [
			new THREE.Vector2(0.125, 0.75),
			new THREE.Vector2(0.25, 0.75),
			new THREE.Vector2(0.25 , 0.875),
			new THREE.Vector2(0.125 , 0.875)
		];
		var headRight = [
			new THREE.Vector2(0.25, 0.75),
			new THREE.Vector2(0.375, 0.75),
			new THREE.Vector2(0.375, 0.875),
			new THREE.Vector2(0.25, 0.875)
		];
		var headBack = [
			new THREE.Vector2(0.375, 0.75),
			new THREE.Vector2(0.5, 0.75),
			new THREE.Vector2(0.5, 0.875),
			new THREE.Vector2(0.375, 0.875)
		];

		headBox = new THREE.BoxGeometry(8, 8, 8, 0, 0, 0);
		headBox.faceVertexUvs[0] = [];
		headBox.faceVertexUvs[0][0] = [headRight[3], headRight[0], headRight[2]];
		headBox.faceVertexUvs[0][1] = [headRight[0], headRight[1], headRight[2]];
		headBox.faceVertexUvs[0][2] = [headLeft[3], headLeft[0], headLeft[2]];
		headBox.faceVertexUvs[0][3] = [headLeft[0], headLeft[1], headLeft[2]];
		headBox.faceVertexUvs[0][4] = [headTop[3], headTop[0], headTop[2]];
		headBox.faceVertexUvs[0][5] = [headTop[0], headTop[1], headTop[2]];
		headBox.faceVertexUvs[0][6] = [headBottom[0], headBottom[3], headBottom[1]];
		headBox.faceVertexUvs[0][7] = [headBottom[3], headBottom[2], headBottom[1]];
		headBox.faceVertexUvs[0][8] = [headFront[3], headFront[0], headFront[2]];
		headBox.faceVertexUvs[0][9] = [headFront[0], headFront[1], headFront[2]];
		headBox.faceVertexUvs[0][10] = [headBack[3], headBack[0], headBack[2]];
		headBox.faceVertexUvs[0][11] = [headBack[0], headBack[1], headBack[2]];
		headMesh = new THREE.Mesh(headBox, layer1Material);
		headMesh.name = "head";
		scene.add(headMesh);

		// Body Parts
		var bodyTop = [
			new THREE.Vector2(0.3125, 0.6875),
			new THREE.Vector2(0.4375, 0.6875),
			new THREE.Vector2(0.4375, 0.75),
			new THREE.Vector2(0.3125, 0.75)
		];
		var bodyBottom = [
			new THREE.Vector2(0.4375, 0.6875),
			new THREE.Vector2(0.5625, 0.6875),
			new THREE.Vector2(0.5625, 0.75),
			new THREE.Vector2(0.4375, 0.75)
		];
		var bodyLeft = [
			new THREE.Vector2(0.25, 0.5),
			new THREE.Vector2(0.3125, 0.5),
			new THREE.Vector2(0.3125, 0.6875),
			new THREE.Vector2(0.25, 0.6875)
		];
		var bodyFront = [
			new THREE.Vector2(0.3125, 0.5),
			new THREE.Vector2(0.4375, 0.5),
			new THREE.Vector2(0.4375, 0.6875),
			new THREE.Vector2(0.3125, 0.6875)
		];
		var bodyRight = [
			new THREE.Vector2(0.4375, 0.5),
			new THREE.Vector2(0.5, 0.5),
			new THREE.Vector2(0.5, 0.6875),
			new THREE.Vector2(0.4375, 0.6875)
		];
		var bodyBack = [
			new THREE.Vector2(0.5, 0.5),
			new THREE.Vector2(0.625, 0.5),
			new THREE.Vector2(0.625, 0.6875),
			new THREE.Vector2(0.5, 0.6875)
		];

		bodyBox = new THREE.BoxGeometry(8, 12, 4, 0, 0, 0);
		bodyBox.faceVertexUvs[0] = [];
		bodyBox.faceVertexUvs[0][0] = [bodyRight[3], bodyRight[0], bodyRight[2]];
		bodyBox.faceVertexUvs[0][1] = [bodyRight[0], bodyRight[1], bodyRight[2]];
		bodyBox.faceVertexUvs[0][2] = [bodyLeft[3], bodyLeft[0], bodyLeft[2]];
		bodyBox.faceVertexUvs[0][3] = [bodyLeft[0], bodyLeft[1], bodyLeft[2]];
		bodyBox.faceVertexUvs[0][4] = [bodyTop[3], bodyTop[0], bodyTop[2]];
		bodyBox.faceVertexUvs[0][5] = [bodyTop[0], bodyTop[1], bodyTop[2]];
		bodyBox.faceVertexUvs[0][6] = [bodyBottom[0], bodyBottom[3], bodyBottom[1]];
		bodyBox.faceVertexUvs[0][7] = [bodyBottom[3], bodyBottom[2], bodyBottom[1]];
		bodyBox.faceVertexUvs[0][8] = [bodyFront[3], bodyFront[0], bodyFront[2]];
		bodyBox.faceVertexUvs[0][9] = [bodyFront[0], bodyFront[1], bodyFront[2]];
		bodyBox.faceVertexUvs[0][10] = [bodyBack[3], bodyBack[0], bodyBack[2]];
		bodyBox.faceVertexUvs[0][11] = [bodyBack[0], bodyBack[1], bodyBack[2]];
		bodyMesh = new THREE.Mesh(bodyBox, layer1Material);
		bodyMesh.name = "body";
		bodyMesh.position.y = -10;
		scene.add(bodyMesh);

		// Right Arm Parts
		var rightArmTop = [
			new THREE.Vector2(0.6875, 0.6875),
			new THREE.Vector2(0.75, 0.6875),
			new THREE.Vector2(0.75, 0.75),
			new THREE.Vector2(0.6875, 0.75),
		];
		var rightArmBottom = [
			new THREE.Vector2(0.75, 0.6875),
			new THREE.Vector2(0.8125, 0.6875),
			new THREE.Vector2(0.8125, 0.75),
			new THREE.Vector2(0.75, 0.75)
		];
		var rightArmLeft = [
			new THREE.Vector2(0.625, 0.5),
			new THREE.Vector2(0.6875, 0.5),
			new THREE.Vector2(0.6875, 0.6875),
			new THREE.Vector2(0.625, 0.6875)
		];
		var rightArmFront = [
			new THREE.Vector2(0.6875, 0.5),
			new THREE.Vector2(0.75, 0.5),
			new THREE.Vector2(0.75, 0.6875),
			new THREE.Vector2(0.6875, 0.6875)
		];
		var rightArmRight = [
			new THREE.Vector2(0.75, 0.5),
			new THREE.Vector2(0.8125, 0.5),
			new THREE.Vector2(0.8125, 0.6875),
			new THREE.Vector2(0.75, 0.6875)
		];
		var rightArmBack = [
			new THREE.Vector2(0.8125, 0.5),
			new THREE.Vector2(0.875, 0.5),
			new THREE.Vector2(0.875, 0.6875),
			new THREE.Vector2(0.8125, 0.6875)
		];

		rightArmBox = new THREE.BoxGeometry(4, 12, 4, 0, 0, 0);
		rightArmBox.faceVertexUvs[0] = [];
		rightArmBox.faceVertexUvs[0][0] = [rightArmRight[3], rightArmRight[0], rightArmRight[2]];
		rightArmBox.faceVertexUvs[0][1] = [rightArmRight[0], rightArmRight[1], rightArmRight[2]];
		rightArmBox.faceVertexUvs[0][2] = [rightArmLeft[3], rightArmLeft[0], rightArmLeft[2]];
		rightArmBox.faceVertexUvs[0][3] = [rightArmLeft[0], rightArmLeft[1], rightArmLeft[2]];
		rightArmBox.faceVertexUvs[0][4] = [rightArmTop[3], rightArmTop[0], rightArmTop[2]];
		rightArmBox.faceVertexUvs[0][5] = [rightArmTop[0], rightArmTop[1], rightArmTop[2]];
		rightArmBox.faceVertexUvs[0][6] = [rightArmBottom[0], rightArmBottom[3], rightArmBottom[1]];
		rightArmBox.faceVertexUvs[0][7] = [rightArmBottom[3], rightArmBottom[2], rightArmBottom[1]];
		rightArmBox.faceVertexUvs[0][8] = [rightArmFront[3], rightArmFront[0], rightArmFront[2]];
		rightArmBox.faceVertexUvs[0][9] = [rightArmFront[0], rightArmFront[1], rightArmFront[2]];
		rightArmBox.faceVertexUvs[0][10] = [rightArmBack[3], rightArmBack[0], rightArmBack[2]];
		rightArmBox.faceVertexUvs[0][11] = [rightArmBack[0], rightArmBack[1], rightArmBack[2]];
		rightArmMesh = new THREE.Mesh(rightArmBox, layer1Material);
		rightArmMesh.name = "rightArm";
		rightArmMesh.position.y = -10;
		rightArmMesh.position.x = -6;
		scene.add(rightArmMesh);

		// Left Arm Parts
		var leftArmTop = [
			new THREE.Vector2(0.5625, 0.1875),
			new THREE.Vector2(0.625, 0.1875),
			new THREE.Vector2(0.625, 0.25),
			new THREE.Vector2(0.5625, 0.25),
		];
		var leftArmBottom = [
			new THREE.Vector2(0.625, 0.1875),
			new THREE.Vector2(0.6875, 0.1875),
			new THREE.Vector2(0.6875, 0.25),
			new THREE.Vector2(0.625, 0.25)
		];
		var leftArmLeft = [
			new THREE.Vector2(0.5, 0),
			new THREE.Vector2(0.5625, 0),
			new THREE.Vector2(0.5625, 0.1875),
			new THREE.Vector2(0.5, 0.1875)
		];
		var leftArmFront = [
			new THREE.Vector2(0.5625, 0),
			new THREE.Vector2(0.625, 0),
			new THREE.Vector2(0.625, 0.1875),
			new THREE.Vector2(0.5625, 0.1875)
		];
		var leftArmRight = [
			new THREE.Vector2(0.625, 0),
			new THREE.Vector2(0.6875, 0),
			new THREE.Vector2(0.6875, 0.1875),
			new THREE.Vector2(0.625, 0.1875)
		];
		var leftArmBack = [
			new THREE.Vector2(0.6875, 0),
			new THREE.Vector2(0.75, 0),
			new THREE.Vector2(0.75, 0.1875),
			new THREE.Vector2(0.6875, 0.1875)
		];

		leftArmBox = new THREE.BoxGeometry(4, 12, 4, 0, 0, 0);
		leftArmBox.faceVertexUvs[0] = [];
		leftArmBox.faceVertexUvs[0][0] = [leftArmRight[3], leftArmRight[0], leftArmRight[2]];
		leftArmBox.faceVertexUvs[0][1] = [leftArmRight[0], leftArmRight[1], leftArmRight[2]];
		leftArmBox.faceVertexUvs[0][2] = [leftArmLeft[3], leftArmLeft[0], leftArmLeft[2]];
		leftArmBox.faceVertexUvs[0][3] = [leftArmLeft[0], leftArmLeft[1], leftArmLeft[2]];
		leftArmBox.faceVertexUvs[0][4] = [leftArmTop[3], leftArmTop[0], leftArmTop[2]];
		leftArmBox.faceVertexUvs[0][5] = [leftArmTop[0], leftArmTop[1], leftArmTop[2]];
		leftArmBox.faceVertexUvs[0][6] = [leftArmBottom[0], leftArmBottom[3], leftArmBottom[1]];
		leftArmBox.faceVertexUvs[0][7] = [leftArmBottom[3], leftArmBottom[2], leftArmBottom[1]];
		leftArmBox.faceVertexUvs[0][8] = [leftArmFront[3], leftArmFront[0], leftArmFront[2]];
		leftArmBox.faceVertexUvs[0][9] = [leftArmFront[0], leftArmFront[1], leftArmFront[2]];
		leftArmBox.faceVertexUvs[0][10] = [leftArmBack[3], leftArmBack[0], leftArmBack[2]];
		leftArmBox.faceVertexUvs[0][11] = [leftArmBack[0], leftArmBack[1], leftArmBack[2]];
		leftArmMesh = new THREE.Mesh(leftArmBox, layer1Material);
		leftArmMesh.name = "leftArm";
		leftArmMesh.position.y = -10;
		leftArmMesh.position.x = 6;
		scene.add(leftArmMesh);

		// Right Leg Parts
		var rightLegTop = [
			new THREE.Vector2(0.0625, 0.6875),
			new THREE.Vector2(0.125, 0.6875),
			new THREE.Vector2(0.125, 0.75),
			new THREE.Vector2(0.0625, 0.75),
		];
		var rightLegBottom = [
			new THREE.Vector2(0.125, 0.6875),
			new THREE.Vector2(0.1875, 0.6875),
			new THREE.Vector2(0.1875, 0.75),
			new THREE.Vector2(0.125, 0.75)
		];
		var rightLegLeft = [
			new THREE.Vector2(0, 0.5),
			new THREE.Vector2(0.0625, 0.5),
			new THREE.Vector2(0.0625, 0.6875),
			new THREE.Vector2(0, 0.6875)
		];
		var rightLegFront = [
			new THREE.Vector2(0.0625, 0.5),
			new THREE.Vector2(0.125, 0.5),
			new THREE.Vector2(0.125, 0.6875),
			new THREE.Vector2(0.0625, 0.6875)
		];
		var rightLegRight = [
			new THREE.Vector2(0.125, 0.5),
			new THREE.Vector2(0.1875, 0.5),
			new THREE.Vector2(0.1875, 0.6875),
			new THREE.Vector2(0.125, 0.6875)
		];
		var rightLegBack = [
			new THREE.Vector2(0.1875, 0.5),
			new THREE.Vector2(0.25, 0.5),
			new THREE.Vector2(0.25, 0.6875),
			new THREE.Vector2(0.1875, 0.6875)
		];

		rightLegBox = new THREE.BoxGeometry(4, 12, 4, 0, 0, 0);
		rightLegBox.faceVertexUvs[0] = [];
		rightLegBox.faceVertexUvs[0][0] = [rightLegRight[3], rightLegRight[0], rightLegRight[2]];
		rightLegBox.faceVertexUvs[0][1] = [rightLegRight[0], rightLegRight[1], rightLegRight[2]];
		rightLegBox.faceVertexUvs[0][2] = [rightLegLeft[3], rightLegLeft[0], rightLegLeft[2]];
		rightLegBox.faceVertexUvs[0][3] = [rightLegLeft[0], rightLegLeft[1], rightLegLeft[2]];
		rightLegBox.faceVertexUvs[0][4] = [rightLegTop[3], rightLegTop[0], rightLegTop[2]];
		rightLegBox.faceVertexUvs[0][5] = [rightLegTop[0], rightLegTop[1], rightLegTop[2]];
		rightLegBox.faceVertexUvs[0][6] = [rightLegBottom[0], rightLegBottom[3], rightLegBottom[1]];
		rightLegBox.faceVertexUvs[0][7] = [rightLegBottom[3], rightLegBottom[2], rightLegBottom[1]];
		rightLegBox.faceVertexUvs[0][8] = [rightLegFront[3], rightLegFront[0], rightLegFront[2]];
		rightLegBox.faceVertexUvs[0][9] = [rightLegFront[0], rightLegFront[1], rightLegFront[2]];
		rightLegBox.faceVertexUvs[0][10] = [rightLegBack[3], rightLegBack[0], rightLegBack[2]];
		rightLegBox.faceVertexUvs[0][11] = [rightLegBack[0], rightLegBack[1], rightLegBack[2]];
		rightLegMesh = new THREE.Mesh(rightLegBox, layer1Material);
		rightLegMesh.name = "rightLeg"
		rightLegMesh.position.y = -22;
		rightLegMesh.position.x = -2;
		scene.add(rightLegMesh);

		// Left Leg Parts
		var leftLegTop = [
			new THREE.Vector2(0.3125, 0.1875),
			new THREE.Vector2(0.375, 0.1875),
			new THREE.Vector2(0.375, 0.25),
			new THREE.Vector2(0.3125, 0.25),
		];
		var leftLegBottom = [
			new THREE.Vector2(0.375, 0.1875),
			new THREE.Vector2(0.4375, 0.1875),
			new THREE.Vector2(0.4375, 0.25),
			new THREE.Vector2(0.375, 0.25)
		];
		var leftLegLeft = [
			new THREE.Vector2(0.25, 0),
			new THREE.Vector2(0.3125, 0),
			new THREE.Vector2(0.3125, 0.1875),
			new THREE.Vector2(0.25, 0.1875)
		];
		var leftLegFront = [
			new THREE.Vector2(0.3125, 0),
			new THREE.Vector2(0.375, 0),
			new THREE.Vector2(0.375, 0.1875),
			new THREE.Vector2(0.3125, 0.1875)
		];
		var leftLegRight = [
			new THREE.Vector2(0.375, 0),
			new THREE.Vector2(0.4375, 0),
			new THREE.Vector2(0.4375, 0.1875),
			new THREE.Vector2(0.375, 0.1875)
		];
		var leftLegBack = [
			new THREE.Vector2(0.4375, 0),
			new THREE.Vector2(0.5, 0),
			new THREE.Vector2(0.5, 0.1875),
			new THREE.Vector2(0.4375, 0.1875)
		];
		leftLegBox = new THREE.BoxGeometry(4, 12, 4, 0, 0, 0);
		leftLegBox.faceVertexUvs[0] = [];
		leftLegBox.faceVertexUvs[0][0] = [leftLegRight[3], leftLegRight[0], leftLegRight[2]];
		leftLegBox.faceVertexUvs[0][1] = [leftLegRight[0], leftLegRight[1], leftLegRight[2]];
		leftLegBox.faceVertexUvs[0][2] = [leftLegLeft[3], leftLegLeft[0], leftLegLeft[2]];
		leftLegBox.faceVertexUvs[0][3] = [leftLegLeft[0], leftLegLeft[1], leftLegLeft[2]];
		leftLegBox.faceVertexUvs[0][4] = [leftLegTop[3], leftLegTop[0], leftLegTop[2]];
		leftLegBox.faceVertexUvs[0][5] = [leftLegTop[0], leftLegTop[1], leftLegTop[2]];
		leftLegBox.faceVertexUvs[0][6] = [leftLegBottom[0], leftLegBottom[3], leftLegBottom[1]];
		leftLegBox.faceVertexUvs[0][7] = [leftLegBottom[3], leftLegBottom[2], leftLegBottom[1]];
		leftLegBox.faceVertexUvs[0][8] = [leftLegFront[3], leftLegFront[0], leftLegFront[2]];
		leftLegBox.faceVertexUvs[0][9] = [leftLegFront[0], leftLegFront[1], leftLegFront[2]];
		leftLegBox.faceVertexUvs[0][10] = [leftLegBack[3], leftLegBack[0], leftLegBack[2]];
		leftLegBox.faceVertexUvs[0][11] = [leftLegBack[0], leftLegBack[1], leftLegBack[2]];
		leftLegMesh = new THREE.Mesh(leftLegBox, layer1Material);
		leftLegMesh.name = "leftLeg";
		leftLegMesh.position.y = -22;
		leftLegMesh.position.x = 2;
		scene.add(leftLegMesh);

		// Head Overlay Parts
		var head2Top = [
			new THREE.Vector2(0.625, 0.875),
			new THREE.Vector2(0.75, 0.875),
			new THREE.Vector2(0.75, 1),
			new THREE.Vector2(0.625, 1)
		];
		var head2Bottom = [
			new THREE.Vector2(0.75, 0.875),
			new THREE.Vector2(0.875, 0.875),
			new THREE.Vector2(0.875, 1),
			new THREE.Vector2(0.75, 1)
		];
		var head2Left = [
			new THREE.Vector2(0.5, 0.75),
			new THREE.Vector2(0.625, 0.75),
			new THREE.Vector2(0.625, 0.875),
			new THREE.Vector2(0.5, 0.875)
		];
		var head2Front = [
			new THREE.Vector2(0.625, 0.75),
			new THREE.Vector2(0.75, 0.75),
			new THREE.Vector2(0.75, 0.875),
			new THREE.Vector2(0.625, 0.875)
		];
		var head2Right = [
			new THREE.Vector2(0.75, 0.75),
			new THREE.Vector2(0.875, 0.75),
			new THREE.Vector2(0.875, 0.875),
			new THREE.Vector2(0.75, 0.875)
		];
		var head2Back = [
			new THREE.Vector2(0.875, 0.75),
			new THREE.Vector2(1, 0.75),
			new THREE.Vector2(1, 0.875),
			new THREE.Vector2(0.875, 0.875)
		];
		head2Box = new THREE.BoxGeometry(9, 9, 9, 0, 0, 0);
		head2Box.faceVertexUvs[0] = [];
		head2Box.faceVertexUvs[0][0] = [head2Right[3], head2Right[0], head2Right[2]];
		head2Box.faceVertexUvs[0][1] = [head2Right[0], head2Right[1], head2Right[2]];
		head2Box.faceVertexUvs[0][2] = [head2Left[3], head2Left[0], head2Left[2]];
		head2Box.faceVertexUvs[0][3] = [head2Left[0], head2Left[1], head2Left[2]];
		head2Box.faceVertexUvs[0][4] = [head2Top[3], head2Top[0], head2Top[2]];
		head2Box.faceVertexUvs[0][5] = [head2Top[0], head2Top[1], head2Top[2]];
		head2Box.faceVertexUvs[0][6] = [head2Bottom[0], head2Bottom[3], head2Bottom[1]];
		head2Box.faceVertexUvs[0][7] = [head2Bottom[3], head2Bottom[2], head2Bottom[1]];
		head2Box.faceVertexUvs[0][8] = [head2Front[3], head2Front[0], head2Front[2]];
		head2Box.faceVertexUvs[0][9] = [head2Front[0], head2Front[1], head2Front[2]];
		head2Box.faceVertexUvs[0][10] = [head2Back[3], head2Back[0], head2Back[2]];
		head2Box.faceVertexUvs[0][11] = [head2Back[0], head2Back[1], head2Back[2]];
		head2Mesh = new THREE.Mesh(head2Box, layer2Material);
		head2Mesh.name = "head2"
		scene.add(head2Mesh);

		// Body Overlay Parts
		var body2Top = [
			new THREE.Vector2(0.3125, 0.4375),
			new THREE.Vector2(0.4375, 0.4375),
			new THREE.Vector2(0.4375, 0.5),
			new THREE.Vector2(0.3125, 0.5)
		];
		var body2Bottom = [
			new THREE.Vector2(0.4375, 0.4375),
			new THREE.Vector2(0.5625, 0.4375),
			new THREE.Vector2(0.5625, 0.5),
			new THREE.Vector2(0.4375, 0.5)
		];
		var body2Left = [
			new THREE.Vector2(0.25, 0.25),
			new THREE.Vector2(0.3125, 0.25),
			new THREE.Vector2(0.3125, 0.4375),
			new THREE.Vector2(0.25, 0.4375)
		];
		var body2Front = [
			new THREE.Vector2(0.3125, 0.25),
			new THREE.Vector2(0.4375, 0.25),
			new THREE.Vector2(0.4375, 0.4375),
			new THREE.Vector2(0.3125, 0.4375)
		];
		var body2Right = [
			new THREE.Vector2(0.4375, 0.25),
			new THREE.Vector2(0.5, 0.25),
			new THREE.Vector2(0.5, 0.4375),
			new THREE.Vector2(0.4375, 0.4375)
		];
		var body2Back = [
			new THREE.Vector2(0.5, 0.25),
			new THREE.Vector2(0.625, 0.25),
			new THREE.Vector2(0.625, 0.4375),
			new THREE.Vector2(0.5, 0.4375)
		];
		body2Box = new THREE.BoxGeometry(9, 13.5, 4.5, 0, 0, 0);
		body2Box.faceVertexUvs[0] = [];
		body2Box.faceVertexUvs[0][0] = [body2Right[3], body2Right[0], body2Right[2]];
		body2Box.faceVertexUvs[0][1] = [body2Right[0], body2Right[1], body2Right[2]];
		body2Box.faceVertexUvs[0][2] = [body2Left[3], body2Left[0], body2Left[2]];
		body2Box.faceVertexUvs[0][3] = [body2Left[0], body2Left[1], body2Left[2]];
		body2Box.faceVertexUvs[0][4] = [body2Top[3], body2Top[0], body2Top[2]];
		body2Box.faceVertexUvs[0][5] = [body2Top[0], body2Top[1], body2Top[2]];
		body2Box.faceVertexUvs[0][6] = [body2Bottom[0], body2Bottom[3], body2Bottom[1]];
		body2Box.faceVertexUvs[0][7] = [body2Bottom[3], body2Bottom[2], body2Bottom[1]];
		body2Box.faceVertexUvs[0][8] = [body2Front[3], body2Front[0], body2Front[2]];
		body2Box.faceVertexUvs[0][9] = [body2Front[0], body2Front[1], body2Front[2]];
		body2Box.faceVertexUvs[0][10] = [body2Back[3], body2Back[0], body2Back[2]];
		body2Box.faceVertexUvs[0][11] = [body2Back[0], body2Back[1], body2Back[2]];
		body2Mesh = new THREE.Mesh(body2Box, layer2Material);
		body2Mesh.name = "body2";
		body2Mesh.position.y = -10;
		scene.add(body2Mesh);

		// Right Arm Overlay Parts
		var rightArm2Top = [
			new THREE.Vector2(0.6875, 0.4375),
			new THREE.Vector2(0.75, 0.4375),
			new THREE.Vector2(0.75, 0.5),
			new THREE.Vector2(0.6875, 0.5),
		];
		var rightArm2Bottom = [
			new THREE.Vector2(0.75, 0.4375),
			new THREE.Vector2(0.8125, 0.4375),
			new THREE.Vector2(0.8125, 0.5),
			new THREE.Vector2(0.75, 0.5)
		];
		var rightArm2Left = [
			new THREE.Vector2(0.625, 0.25),
			new THREE.Vector2(0.6875, 0.25),
			new THREE.Vector2(0.6875, 0.4375),
			new THREE.Vector2(0.625, 0.4375)
		];
		var rightArm2Front = [
			new THREE.Vector2(0.6875, 0.25),
			new THREE.Vector2(0.75, 0.25),
			new THREE.Vector2(0.75, 0.4375),
			new THREE.Vector2(0.6875, 0.4375)
		];
		var rightArm2Right = [
			new THREE.Vector2(0.75, 0.25),
			new THREE.Vector2(0.8125, 0.25),
			new THREE.Vector2(0.8125, 0.4375),
			new THREE.Vector2(0.75, 0.4375)
		];
		var rightArm2Back = [
			new THREE.Vector2(0.8125, 0.25),
			new THREE.Vector2(0.875, 0.25),
			new THREE.Vector2(0.875, 0.4375),
			new THREE.Vector2(0.8125, 0.4375)
		];
		rightArm2Box = new THREE.BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		rightArm2Box.faceVertexUvs[0] = [];
		rightArm2Box.faceVertexUvs[0][0] = [rightArm2Right[3], rightArm2Right[0], rightArm2Right[2]];
		rightArm2Box.faceVertexUvs[0][1] = [rightArm2Right[0], rightArm2Right[1], rightArm2Right[2]];
		rightArm2Box.faceVertexUvs[0][2] = [rightArm2Left[3], rightArm2Left[0], rightArm2Left[2]];
		rightArm2Box.faceVertexUvs[0][3] = [rightArm2Left[0], rightArm2Left[1], rightArm2Left[2]];
		rightArm2Box.faceVertexUvs[0][4] = [rightArm2Top[3], rightArm2Top[0], rightArm2Top[2]];
		rightArm2Box.faceVertexUvs[0][5] = [rightArm2Top[0], rightArm2Top[1], rightArm2Top[2]];
		rightArm2Box.faceVertexUvs[0][6] = [rightArm2Bottom[0], rightArm2Bottom[3], rightArm2Bottom[1]];
		rightArm2Box.faceVertexUvs[0][7] = [rightArm2Bottom[3], rightArm2Bottom[2], rightArm2Bottom[1]];
		rightArm2Box.faceVertexUvs[0][8] = [rightArm2Front[3], rightArm2Front[0], rightArm2Front[2]];
		rightArm2Box.faceVertexUvs[0][9] = [rightArm2Front[0], rightArm2Front[1], rightArm2Front[2]];
		rightArm2Box.faceVertexUvs[0][10] = [rightArm2Back[3], rightArm2Back[0], rightArm2Back[2]];
		rightArm2Box.faceVertexUvs[0][11] = [rightArm2Back[0], rightArm2Back[1], rightArm2Back[2]];
		rightArm2Mesh = new THREE.Mesh(rightArm2Box, layer2Material);
		rightArm2Mesh.name = "rightArm2";
		rightArm2Mesh.position.y = -10;
		rightArm2Mesh.position.x = -6;
		scene.add(rightArm2Mesh);

		// Left Arm Overlay Parts
		var leftArm2Top = [
			new THREE.Vector2(0.8125, 0.1875),
			new THREE.Vector2(0.875, 0.1875),
			new THREE.Vector2(0.875, 0.25),
			new THREE.Vector2(0.8125, 0.25),
		];
		var leftArm2Bottom = [
			new THREE.Vector2(0.875, 0.1875),
			new THREE.Vector2(0.9375, 0.1875),
			new THREE.Vector2(0.9375, 0.25),
			new THREE.Vector2(0.875, 0.25)
		];
		var leftArm2Left = [
			new THREE.Vector2(0.75, 0),
			new THREE.Vector2(0.8125, 0),
			new THREE.Vector2(0.8125, 0.1875),
			new THREE.Vector2(0.75, 0.1875)
		];
		var leftArm2Front = [
			new THREE.Vector2(0.8125, 0),
			new THREE.Vector2(0.875, 0),
			new THREE.Vector2(0.875, 0.1875),
			new THREE.Vector2(0.8125, 0.1875)
		];
		var leftArm2Right = [
			new THREE.Vector2(0.875, 0),
			new THREE.Vector2(0.9375, 0),
			new THREE.Vector2(0.9375, 0.1875),
			new THREE.Vector2(0.875, 0.1875)
		];
		var leftArm2Back = [
			new THREE.Vector2(0.9375, 0),
			new THREE.Vector2(1, 0),
			new THREE.Vector2(1, 0.1875),
			new THREE.Vector2(0.9375, 0.1875)
		];

		leftArm2Box = new THREE.BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		leftArm2Box.faceVertexUvs[0] = [];
		leftArm2Box.faceVertexUvs[0][0] = [leftArm2Right[3], leftArm2Right[0], leftArm2Right[2]];
		leftArm2Box.faceVertexUvs[0][1] = [leftArm2Right[0], leftArm2Right[1], leftArm2Right[2]];
		leftArm2Box.faceVertexUvs[0][2] = [leftArm2Left[3], leftArm2Left[0], leftArm2Left[2]];
		leftArm2Box.faceVertexUvs[0][3] = [leftArm2Left[0], leftArm2Left[1], leftArm2Left[2]];
		leftArm2Box.faceVertexUvs[0][4] = [leftArm2Top[3], leftArm2Top[0], leftArm2Top[2]];
		leftArm2Box.faceVertexUvs[0][5] = [leftArm2Top[0], leftArm2Top[1], leftArm2Top[2]];
		leftArm2Box.faceVertexUvs[0][6] = [leftArm2Bottom[0], leftArm2Bottom[3], leftArm2Bottom[1]];
		leftArm2Box.faceVertexUvs[0][7] = [leftArm2Bottom[3], leftArm2Bottom[2], leftArm2Bottom[1]];
		leftArm2Box.faceVertexUvs[0][8] = [leftArm2Front[3], leftArm2Front[0], leftArm2Front[2]];
		leftArm2Box.faceVertexUvs[0][9] = [leftArm2Front[0], leftArm2Front[1], leftArm2Front[2]];
		leftArm2Box.faceVertexUvs[0][10] = [leftArm2Back[3], leftArm2Back[0], leftArm2Back[2]];
		leftArm2Box.faceVertexUvs[0][11] = [leftArm2Back[0], leftArm2Back[1], leftArm2Back[2]];
		leftArm2Mesh = new THREE.Mesh(leftArm2Box, layer2Material);
		leftArm2Mesh.name = "leftArm2";
		leftArm2Mesh.position.y = -10;
		leftArm2Mesh.position.x = 6;
		// leftArm2Mesh.visible = true;
		scene.add(leftArm2Mesh);

		// Right Leg Overlay Parts
		var rightLeg2Top = [
			new THREE.Vector2(0.0625, 0.4375),
			new THREE.Vector2(0.125, 0.4375),
			new THREE.Vector2(0.125, 0.5),
			new THREE.Vector2(0.0625, 0.5),
		];
		var rightLeg2Bottom = [
			new THREE.Vector2(0.125, 0.4375),
			new THREE.Vector2(0.1875, 0.4375),
			new THREE.Vector2(0.1875, 0.5),
			new THREE.Vector2(0.125, 0.5)
		];
		var rightLeg2Left = [
			new THREE.Vector2(0, 0.25),
			new THREE.Vector2(0.0625, 0.25),
			new THREE.Vector2(0.0625, 0.4375),
			new THREE.Vector2(0, 0.4375)
		];
		var rightLeg2Front = [
			new THREE.Vector2(0.0625, 0.25),
			new THREE.Vector2(0.125, 0.25),
			new THREE.Vector2(0.125, 0.4375),
			new THREE.Vector2(0.0625, 0.4375)
		];
		var rightLeg2Right = [
			new THREE.Vector2(0.125, 0.25),
			new THREE.Vector2(0.1875, 0.25),
			new THREE.Vector2(0.1875, 0.4375),
			new THREE.Vector2(0.125, 0.4375)
		];
		var rightLeg2Back = [
			new THREE.Vector2(0.1875, 0.25),
			new THREE.Vector2(0.25, 0.25),
			new THREE.Vector2(0.25, 0.4375),
			new THREE.Vector2(0.1875, 0.4375)
		];

		rightLeg2Box = new THREE.BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		rightLeg2Box.faceVertexUvs[0] = [];
		rightLeg2Box.faceVertexUvs[0][0] = [rightLeg2Right[3], rightLeg2Right[0], rightLeg2Right[2]];
		rightLeg2Box.faceVertexUvs[0][1] = [rightLeg2Right[0], rightLeg2Right[1], rightLeg2Right[2]];
		rightLeg2Box.faceVertexUvs[0][2] = [rightLeg2Left[3], rightLeg2Left[0], rightLeg2Left[2]];
		rightLeg2Box.faceVertexUvs[0][3] = [rightLeg2Left[0], rightLeg2Left[1], rightLeg2Left[2]];
		rightLeg2Box.faceVertexUvs[0][4] = [rightLeg2Top[3], rightLeg2Top[0], rightLeg2Top[2]];
		rightLeg2Box.faceVertexUvs[0][5] = [rightLeg2Top[0], rightLeg2Top[1], rightLeg2Top[2]];
		rightLeg2Box.faceVertexUvs[0][6] = [rightLeg2Bottom[0], rightLeg2Bottom[3], rightLeg2Bottom[1]];
		rightLeg2Box.faceVertexUvs[0][7] = [rightLeg2Bottom[3], rightLeg2Bottom[2], rightLeg2Bottom[1]];
		rightLeg2Box.faceVertexUvs[0][8] = [rightLeg2Front[3], rightLeg2Front[0], rightLeg2Front[2]];
		rightLeg2Box.faceVertexUvs[0][9] = [rightLeg2Front[0], rightLeg2Front[1], rightLeg2Front[2]];
		rightLeg2Box.faceVertexUvs[0][10] = [rightLeg2Back[3], rightLeg2Back[0], rightLeg2Back[2]];
		rightLeg2Box.faceVertexUvs[0][11] = [rightLeg2Back[0], rightLeg2Back[1], rightLeg2Back[2]];
		rightLeg2Mesh = new THREE.Mesh(rightLeg2Box, layer2Material);
		rightLeg2Mesh.name = "rightLeg2"
		rightLeg2Mesh.position.y = -22;
		rightLeg2Mesh.position.x = -2;
		scene.add(rightLeg2Mesh);

		// Left Leg Overlay Parts
		var leftLeg2Top = [
			new THREE.Vector2(0.0625, 0.1875),
			new THREE.Vector2(0.125, 0.1875),
			new THREE.Vector2(0.125, 0.25),
			new THREE.Vector2(0.0625, 0.25),
		];
		var leftLeg2Bottom = [
			new THREE.Vector2(0.125, 0.1875),
			new THREE.Vector2(0.1875, 0.1875),
			new THREE.Vector2(0.1875, 0.25),
			new THREE.Vector2(0.125, 0.25)
		];
		var leftLeg2Left = [
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0.0625, 0),
			new THREE.Vector2(0.0625, 0.1875),
			new THREE.Vector2(0, 0.1875)
		];
		var leftLeg2Front = [
			new THREE.Vector2(0.0625, 0),
			new THREE.Vector2(0.125, 0),
			new THREE.Vector2(0.125, 0.1875),
			new THREE.Vector2(0.0625, 0.1875)
		];
		var leftLeg2Right = [
			new THREE.Vector2(0.125, 0),
			new THREE.Vector2(0.1875, 0),
			new THREE.Vector2(0.1875, 0.1875),
			new THREE.Vector2(0.125, 0.1875)
		];
		var leftLeg2Back = [
			new THREE.Vector2(0.1875, 0),
			new THREE.Vector2(0.25, 0),
			new THREE.Vector2(0.25, 0.1875),
			new THREE.Vector2(0.1875, 0.1875)
		];
		leftLeg2Box = new THREE.BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		leftLeg2Box.faceVertexUvs[0] = [];
		leftLeg2Box.faceVertexUvs[0][0] = [leftLeg2Right[3], leftLeg2Right[0], leftLeg2Right[2]];
		leftLeg2Box.faceVertexUvs[0][1] = [leftLeg2Right[0], leftLeg2Right[1], leftLeg2Right[2]];
		leftLeg2Box.faceVertexUvs[0][2] = [leftLeg2Left[3], leftLeg2Left[0], leftLeg2Left[2]];
		leftLeg2Box.faceVertexUvs[0][3] = [leftLeg2Left[0], leftLeg2Left[1], leftLeg2Left[2]];
		leftLeg2Box.faceVertexUvs[0][4] = [leftLeg2Top[3], leftLeg2Top[0], leftLeg2Top[2]];
		leftLeg2Box.faceVertexUvs[0][5] = [leftLeg2Top[0], leftLeg2Top[1], leftLeg2Top[2]];
		leftLeg2Box.faceVertexUvs[0][6] = [leftLeg2Bottom[0], leftLeg2Bottom[3], leftLeg2Bottom[1]];
		leftLeg2Box.faceVertexUvs[0][7] = [leftLeg2Bottom[3], leftLeg2Bottom[2], leftLeg2Bottom[1]];
		leftLeg2Box.faceVertexUvs[0][8] = [leftLeg2Front[3], leftLeg2Front[0], leftLeg2Front[2]];
		leftLeg2Box.faceVertexUvs[0][9] = [leftLeg2Front[0], leftLeg2Front[1], leftLeg2Front[2]];
		leftLeg2Box.faceVertexUvs[0][10] = [leftLeg2Back[3], leftLeg2Back[0], leftLeg2Back[2]];
		leftLeg2Box.faceVertexUvs[0][11] = [leftLeg2Back[0], leftLeg2Back[1], leftLeg2Back[2]];
		leftLeg2Mesh = new THREE.Mesh(leftLeg2Box, layer2Material);
		leftLeg2Mesh.name = "leftLeg2";
		leftLeg2Mesh.position.y = -22;
		leftLeg2Mesh.position.x = 2;
		scene.add(leftLeg2Mesh);

		// Cape Parts
		var capeTop = [
			new THREE.Vector2(1/22, 21/17),
			new THREE.Vector2(11/22, 21/17),
			new THREE.Vector2(11/22, 22/17),
			new THREE.Vector2(1/22, 22/17),
		];
		var capeBottom = [
			new THREE.Vector2(11/22, 16/17),
			new THREE.Vector2(21/22, 16/17),
			new THREE.Vector2(21/22, 16/17),
			new THREE.Vector2(11/22, 16/17)
		];
		var capeLeft = [
			new THREE.Vector2(11/22, 0/17),
			new THREE.Vector2(12/22, 0/17),
			new THREE.Vector2(12/22, 16/17),
			new THREE.Vector2(11/22, 16/17)
		];
		var capeFront = [
			new THREE.Vector2(12/22, 0/17),
			new THREE.Vector2(1, 0/17),
			new THREE.Vector2(1, 16/17),
			new THREE.Vector2(12/22, 16/17)
		];
		var capeRight = [
			new THREE.Vector2(0, 0/17),
			new THREE.Vector2(1/22, 0/17),
			new THREE.Vector2(1/22, 16/17),
			new THREE.Vector2(0, 16/17)
		];
		var capeBack = [
			new THREE.Vector2(1/22, 0/17),
			new THREE.Vector2(11/22, 0/17),
			new THREE.Vector2(11/22, 16/17),
			new THREE.Vector2(1/22, 16/17)
		];
		capeBox = new THREE.BoxGeometry(10, 16, 1, 0, 0, 0);
		capeBox.faceVertexUvs[0] = [];
		capeBox.faceVertexUvs[0][0] = [capeRight[3], capeRight[0], capeRight[2]];
		capeBox.faceVertexUvs[0][1] = [capeRight[0], capeRight[1], capeRight[2]];
		capeBox.faceVertexUvs[0][2] = [capeLeft[3], capeLeft[0], capeLeft[2]];
		capeBox.faceVertexUvs[0][3] = [capeLeft[0], capeLeft[1], capeLeft[2]];
		capeBox.faceVertexUvs[0][4] = [capeTop[3], capeTop[0], capeTop[2]];
		capeBox.faceVertexUvs[0][5] = [capeTop[0], capeTop[1], capeTop[2]];
		capeBox.faceVertexUvs[0][6] = [capeBottom[0], capeBottom[3], capeBottom[1]];
		capeBox.faceVertexUvs[0][7] = [capeBottom[3], capeBottom[2], capeBottom[1]];
		capeBox.faceVertexUvs[0][8] = [capeFront[3], capeFront[0], capeFront[2]];
		capeBox.faceVertexUvs[0][9] = [capeFront[0], capeFront[1], capeFront[2]];
		capeBox.faceVertexUvs[0][10] = [capeBack[3], capeBack[0], capeBack[2]];
		capeBox.faceVertexUvs[0][11] = [capeBack[0], capeBack[1], capeBack[2]];
		capeMesh = new THREE.Mesh(capeBox, capeMaterial);
		capeMesh.name = "cape";

		capePivot = new THREE.Group();
		scene.add(capePivot);

		capeMesh.position.y = -12.75;
		capeMesh.position.z = -0.55;

		capePivot.rotation.x = 25 * (Math.PI/180);

		renderer = new THREE.WebGLRenderer({angleRot: true, alpha: true, antialias: false});
		renderer.setSize(canvasW, canvasH);
		renderer.context.getShaderInfoLog = () => ''; // shut firefox up

		model.append(renderer.domElement);
	}

	var startTime = Date.now();
	function drawSkin() {
		requestAnimationFrame(drawSkin);
		var time = (Date.now() - startTime)/1000;
		if(!mouseDown && !isPaused){
			modelRot += 0.5;
			angleRot += 0.01;
		}

		var ang = -(modelRot * Math.PI / 180);

		camera.rotation.y = ang;
		camera.position.z = radius*Math.cos(ang);
		camera.position.x = radius*Math.sin(ang);

		var speed = 3;
		//Leg Swing
		leftLeg2Mesh.rotation.x = leftLegMesh.rotation.x = Math.cos(angleRot*speed);
		leftLeg2Mesh.position.z = leftLegMesh.position.z = 0 - 6*Math.sin(leftLegMesh.rotation.x);
		leftLeg2Mesh.position.y = leftLegMesh.position.y = -16 - 6*Math.abs(Math.cos(leftLegMesh.rotation.x));
		rightLeg2Mesh.rotation.x = rightLegMesh.rotation.x = Math.cos(angleRot*speed + (Math.PI));
		rightLeg2Mesh.position.z = rightLegMesh.position.z = 0 - 6*Math.sin(rightLegMesh.rotation.x);
		rightLeg2Mesh.position.y = rightLegMesh.position.y = -16 - 6*Math.abs(Math.cos(rightLegMesh.rotation.x));

		//Arm Swing
		leftArm2Mesh.rotation.x = leftArmMesh.rotation.x = Math.cos(angleRot*speed + (Math.PI));
		leftArm2Mesh.position.z = leftArmMesh.position.z = 0 - 6*Math.sin(leftArmMesh.rotation.x);
		leftArm2Mesh.position.y = leftArmMesh.position.y = -4 - 6*Math.abs(Math.cos(leftArmMesh.rotation.x));
		rightArm2Mesh.rotation.x = rightArmMesh.rotation.x = Math.cos(angleRot*speed);
		rightArm2Mesh.position.z = rightArmMesh.position.z = 0 - 6*Math.sin(rightArmMesh.rotation.x);
		rightArm2Mesh.position.y = rightArmMesh.position.y = -4 - 6*Math.abs(Math.cos(rightArmMesh.rotation.x));

		renderer.render(scene, camera);

		if(angleRot > 360)
			angleRot = 0;
	}

	model.mousedown(function(e){
		originMouseX = (e.pageX - this.offsetLeft) - modelRot;
		mouseDown = true;
	});

	window.jQuery(document).mouseup(() => mouseDown = false);

	model.bind("contextmenu", e => {
		e.preventDefault();
		isPaused = !isPaused;
	});

	model.mousemove(function(e){
		if(!mouseDown) return;
		var x = (e.pageX - this.offsetLeft) - originMouseX;
		modelRot = x;
	});
}
