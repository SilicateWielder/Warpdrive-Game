/*
 *  AlpenEngine v0.0.1
 *  (c) 2019 Michael Warner
 * 
 *  A 3d rasterizer using alpenEngine on Minisphere
 */

import { Thread } from 'sphere-runtime';

import FastColors from './colors.js';
import Smath from './smath.js';
import Vector3 from './vect3.js';

import ScalingTex from './scalingtex.js';

import Scene from './worldspace.js';

// A function for populating a space with planets/stars.
function createPlanets(world, dX, dY, sTextures, count)
{
	let divisionsX = dX;
	let divisionsY = dY;
	let xDiv = 360 / divisionsX;
	let yDiv = 180 / divisionsY;
	let vector = new Vector3(0, 0, 4000);
	let pointCount = 0;

	// Select a texture
	let type = Math.floor(Math.random() * (sTextures.length - 1));
	if (type % (sTextures.length - 1) != 0)
	{
		type = 0;
	}
	for(let h = 0; h < divisionsY * 2; h++)
	{
		for(let i = 0; i < divisionsX; i++)
		{
			vector.rotate(xDiv * i, yDiv * h, 0);
			world.addPoint(vector.pub.x, vector.pub.y, vector.pub.z);
			pointCount ++;
		}
	}

	let h = divisionsX;
	while (h < pointCount - divisionsX)
	{
		let i = 0;
		while (i < divisionsX - 1)
		{
			world.definePoly([h + i + divisionsX, h + i + divisionsX + 1, h + i + 1, h + i], sTextures[type], false);
			i++;
		}
		world.definePoly([h + i + divisionsX, h + i + 1, h + i - (divisionsX - 1), h + i], sTextures[type], false);

		h+= divisionsX;
	}
	//planet.definePoly([0, 1, 11, 10], tBlu, false);
	let planeRange = 1000000
	for(let m = 0; m < count; m++)
	{
		let posX = ((Math.random() * planeRange) - (planeRange / 2));
		let posY = ((Math.random() * planeRange) - (planeRange / 2));
		let posZ = ((Math.random() * planeRange) - (planeRange / 2));

		space.finalizeModel(posX, posY, posZ);
	}
	//planet.mode.mixed = true;
}

export default
class MyGame extends Thread
{
	constructor()
	{
		super();  // call the superclass constructor

		//Required for Vector3 objects to work.
		global.smath = new Smath();

		global.testvect = new Vector3(0, 100, 0);

		// Create a new space for the rendering engine.
		// It is possible to render without this, but you'll have to implement your own collision detection systems and whatnot.
		// as well as any other systems that the Scene object provides. 
		global.space = new Scene();

		// Load up pong textures.
		global.tRed = new ScalingTex('textures/red.png');
		global.tBlu = new ScalingTex('textures/blue.png');
		global.tWht = new ScalingTex('textures/white.png');
		
		global.font = Font.Default;

		global.fcolors = new FastColors();

		// build models - Spaceship.
		space.addPoint(-50, 100, -100); //rear left - 0
		space.addPoint(50, 100, -100); // rear right - 1
		space.addPoint(0, 100, 100); // front right - 2
		space.addPoint(0, 100, 100); // front left - 3

		space.addPoint(0, 50, -100) // rear top - 4;
		space.addPoint(0, 100, -100) // rear Bottom - 5;

		space.addPoint(-120, 90, -120); // Wingtip Left - 6
		space.addPoint(120, 90, -120); // Wingtip Right - 7

		space.definePoly([0, 1, 2, 2], tBlu, false); // Bottom
		space.definePoly([1, 2, 3, 4], tBlu, false); // Right Body
		space.definePoly([4, 3, 2, 0], tBlu, false); // Left Body
		space.definePoly([0, 1, 4, 0], tWht, false); // Back
		space.definePoly([0, 3, 6, 0], tRed, true); // Left Wing
		space.definePoly([1, 2, 7, 1], tRed, true); // Right Wing

		global.player = space.finalizeModel(9, 0, 0); // This pushes the model into the world as something usable.
		space.rotateModel(0, 0, 180, 0);

		space.clearCache() // This clears the model building cache so we can work on our next model.

		// Build models - Enemy fighter.
		space.addPoint(-50, 100, -100); //rear left - 0
		space.addPoint(50, 100, -100); // rear right - 1
		space.addPoint(0, 100, 100); // front right - 2
		space.addPoint(0, 100, 100); // front left - 3

		space.addPoint(0, 50, -100) // rear top - 4;
		space.addPoint(0, 100, -100) // rear Bottom - 5;

		space.addPoint(-120, 90, -120); // Wingtip Left - 6
		space.addPoint(120, 90, -120); // Wingtip Right - 7
		space.addPoint(0, 25, -100) // Wingtip top - 8

		space.addPoint(100, 110, -100) // Fin tip Left - 9
		space.addPoint(-100, 110, -100); // Fin tip Right - 10

		space.definePoly([0, 1, 2, 2], tBlu, false); // Bottom
		space.definePoly([1, 2, 3, 4], tBlu, false); // Right Body
		space.definePoly([4, 3, 2, 0], tBlu, false); // Left Body
		space.definePoly([0, 1, 4, 0], tWht, false); // Back

		space.definePoly([0, 3, 6, 0], tRed, true); // Left Wing
		space.definePoly([1, 2, 7, 1], tRed, true); // Right Wing
		space.definePoly([2, 4, 8, 2], tBlu, true); // Top wing.

		space.definePoly([2, 5, 9, 2], tBlu, false); // Fin Left
		space.definePoly([3, 5, 10, 3], tBlu, true); // Fin right

		global.rooket = space.finalizeModel(400, 0, 0); // This pushes the model into the world as something usable.

		space.clearCache();

		createPlanets(space, 5, 2, [tWht, tBlu], 33);

		global.travelDist = 50; // Distance between the ship and the camera.
		global.travel = new Vector3(0, 0, travelDist); // Vector being used to anchor the ship to the camera.
	}

	on_update()
	{
		//Rotate the vector we're using to position the player in fron of the camera.
		let translationRatio = 2;
		
		// We're gonna reset our ship's positional vector with a new value so we can update it to match the position of the camera.
		let shipAnchorX = -space.camera.pos.x * translationRatio;
		let shipAnchorY = -space.camera.pos.y * translationRatio;
		let shipAnchorZ = -space.camera.pos.y * translationRatio + travelDist;
		travel.adjust(shipAnchorX, shipAnchorY, shipAnchorZ);

		// Now that we know where the ship is compared to the camera, we must apply a rotational transformation to the camera.
		global.travel.rotate(360 - space.camera.rot.x, 360 - space.camera.rot.y, 360 - space.camera.rot.z);
	
		// We know where the ship should be, so lets actually move it to the correct positon.
		player.pos.adjust(travel.pub.x, travel.pub.y, travel.pub.z)

		// The player vehicle is rotated with inverted values to lock it's rotation relative to the camera.
		player.rot = {x: 360 -space.camera.rot.x, y: 360 -space.camera.rot.y, z: 360-space.camera.rot.z};

		//Temporary movement controls.
		if(Keyboard.Default.isPressed(Key.Left))
		{
			space.camera.pos.x--;
		}
		
		if(Keyboard.Default.isPressed(Key.Right))
		{
			space.camera.pos.x++;
		}
		
		if(Keyboard.Default.isPressed(Key.Up))
		{
			space.camera.pos.z++;
		}
		
		if(Keyboard.Default.isPressed(Key.Down))
		{
			space.camera.pos.z--;
		}
		
		if(Keyboard.Default.isPressed(Key.D))
		{
			space.camera.rot.z = (space.camera.rot.z -1);
			if(space.camera.rot.z < 0)
			{
				space.camera.rot.z = 360 - space.camera.rot.z
			}
		}
		
		if(Keyboard.Default.isPressed(Key.A))
		{
			space.camera.rot.z = (space.camera.rot.z +1)%360;
		}
		
		if(Keyboard.Default.isPressed(Key.W))
		{
			space.camera.rot.y = (space.camera.rot.y -1);
			if(space.camera.rot.y < 0)
			{
				space.camera.rot.y = 360 - space.camera.rot.y
			}
		}
		
		if(Keyboard.Default.isPressed(Key.S))
		{
			space.camera.rot.y = (space.camera.rot.y +1)%360;
		}
	}

	on_render()
	{
		// Render scene.
		space.blit();
	}
}
