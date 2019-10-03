/*
 * AlpenEngine - camera.js
 * Written by Michael Warner
 * Version 0.1.8
 *
 * Used to control rendering of 3d Space
 */
 
import { Thread } from 'sphere-runtime';

import Culler from './culler.js';
import ScalingTex from './scalingtex.js';
import Lighting from './lighting.js';

function oobcull(points, rangeX, rangeY)
{
	let p1 = points[0];
	let p2 = points[1];
	let p3 = points[2];
	let p4 = points[3];

	let p1check = true;
	let p2check = true;
	let p3check = true;
	let p4check = true;

	let minX = -200;
	let minY = -200;
	let maxX = rangeX + 100;
	let maxY = rangeY + 100;
	if(p1.x < minX || p1.x > maxX || p1.y < minY || p1.y > maxY)
	{
		p1check = false;
	}
	if(p2.x < minX || p2.x > maxX || p2.y < minY || p2.y > maxY)
	{
		p2check = false;
	}
	if(p3.x < minX || p3.x > maxX || p3.y < minY || p3.y > maxY)
	{
		p3check = false;
	}
	if(p4.x < minX || p4.x > maxX || p4.y < minY || p4.y > maxY)
	{
		p4check = false;
	}

	if (p1check && p2check && p3check && p4check)
	{
		return false;
	} else {
		return true;
	}
};

export default
class Camera
{
	constructor(width = GetScreenWidth(), height = GetScreenHeight(), x, y, z, rx, ry, rz)
	{	
		// Field of view parameter, adjustable.
		this.fov = 900
		
		// Define the position and rotation of the camera
		this.pos = {"x":x, "y":y, "z":z};
		this.rot = {"x":rx, "y":ry, "z":rz};
		
		// Find the origin on the camera.
		this.mid = {};
		this.mid.x = width / 2;
		this.mid.y = height / 2;

		this.w = width;
		this.h = height;
		
		this.texData = [];
		this.pntData = [];
		this.linData = [];
	}
	
	move(x, y, z)
	{
		this.pos = {"x":x, "y":y, "z":z};
	}
	
	roll(x, y, z)
	{
		if (x > 0);
		{
			if(this.rot.x + x <= 360)
			{
				this.rot.x += x;
			} else {
				this.rot.x = 361 - (this.rot.x + x);
			}
		}
		
		if (y > 0);
		{
			if(this.rot.y + y <= 360)
			{
				this.rot.y += y;
			} else {
				this.rot.y = 361 - (this.rot.y + y);
			}
		}
		
		if (z > 0);
		{
			if(this.rot.z + z <= 360)
			{
				this.rot.z += z;
			} else {
				this.rot.z = 361 - (this.rot.z + z);
			}
		}
	}
	
	getDist(x, y, z)
	{
		let distance = this.fov / (this.fov + z);
	
		// Ensure that the distance isn't zero, if it is we wake up the I N S E C T S.
		if (distance < 0)
		{
			distance = 0.00001;
		};
		
		return distance;
	}
	
	// Projects 3d coordinates onto a 2d plane.
	project(x, y, z, scale = 0)
	{
		let scaleFactor = scale;
		
		if(scale == 0)
		{
			scaleFactor = this.getDist(x, y, z);
		}
		
		let outputX = (x * scaleFactor) + this.mid.x;
		let outputY = (y * scaleFactor) + this.mid.y;
		
		return({"x":outputX, "y":outputY});
	}
	
	// Draws a dot in 3d space.
	drawPoint(x, y, z)
	{
		let pos = this.project(x, y, z);
		
		Rectangle(pos.x, pos.y, 1, 1, fcolors.create(255, 255, 255));
	}
	
	// Draws a polygon, points are contains in an array listing x y z values in each entry, polydata lists .texture and .flipped information
	// Mode contains mode information such as backcull or zsort in the form of booleans
	drawPoly(points, polydata, mode)
	{
		// Check if renderable.
		let render = true;
		if(mode.backcull)
		{
			render = Culler.backface(points, polydata.flipped);
		}
		
		// If the polygon is flipped, invert the render status.
		if(polydata.flipped)
		{
			render = !render;
		}
		
		// If renderable, render it!
		if(render || !mode.backcull)
		{
			if(!oobcull(points, this.w, this.h))
			{
				polydata.texture.transformBlit(points[0], points[1], points[2], points[3]);
			}
		}
	}
}