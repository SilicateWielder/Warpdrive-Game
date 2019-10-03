/*
 * Candle Lib - worldspace.js
 * Written by Michael Warner
 * Version 0.1.8
 *
 * Used to manage polygons
 */
 
import { Thread } from 'sphere-runtime';

import FastColors from './colors.js';

import Smath from './smath.js';

import PointCloud from './pointcloud.js';
import Vector3 from './vect3.js';
import Model from './model.js';

import ScalingTex from './scalingtex.js';
import Camera from './camera.js';

export default
class Scene
{
	constructor(defaultTexture)
	{
        // "Math accelerator" and "color caching".
        this.fmath = new Smath();
        this.fcolors = new FastColors();

        // Used to track model positions.
        this.cloud = new PointCloud();
        
        // Object cloud.
        this.objects = [];

        // World's camera.
        this.camera = new Camera(GetScreenWidth(), GetScreenHeight(), 0, 0, 0, 0, 0, 0);

        // Cache for building geometry.
        this.modelCache = new Model(this.camera);
    }
    
    addPoint(x, y, z, offset = {'x': 0, 'y': 0, 'z':0})
    {

        this.modelCache.addPoint(x + offset.x, y + offset.y, z + offset.z);
    }

    definePoly(points, texture, flipped)
    {
        this.modelCache.definePoly(points, texture,flipped);
    }

    calcModelColider()
    {
        this.modelCache.findCollisionBounds();
    }

    generateEntry(x = 0, y = 0, z = 0)
    {
        let entry = {};
        entry.model = this.modelCache;
        entry.pos = new Vector3(x, y, z)
        entry.vel = new Vector3(0, 0, 0)
        entry.rot = {"x": 0, "y": 0, "z": 0};
        return(entry);
    }

    finalizeModel(x, y, z)
    {
        // generate an entry object.
        let entry = this.generateEntry(x, y, z);
        
        // Generate an ID.
        let id = (this.objects.length - 1);

        this.objects.push(entry);
        
        return this.objects.slice(-1)[0];
    }
    
    clearCache()
    {
        this.modelCache = new Model(this.camera);
    }

    rotateModel(id, x = 0, y = 0, z = 0)
    {
        this.objects[id].rot = {"x": x, "y": y, "z": z};
    }

    spinModel(id, x = 0, y = 0, z = 0)
    {
        let current = this.objects[id].rot

        // How did I NOT do this sooner?!
        // Basically, this lets us limit values within a range of 0 to 360 without extra logic.
        current.x = (current.x + x);
        current.y = (current.y + y);
        current.z = (current.z + z);

        this.objects[id].rot = current;
    }

    getModel(id)
    {
        return this.objects[id].model;
    }

    blit(reorderModels = false)
    {
        for (let id = 0; id < this.objects.length; id++)
        {
            // Grab the model we need to work with.
            let object = this.objects[id];

            // Get it's new orientation and rotate it.
            let orientation = object.rot;

            let newRx = (orientation.x + this.camera.rot.x) % 360;
            let newRy = (orientation.y + this.camera.rot.y) % 360;
            let newRz = (orientation.z + this.camera.rot.z) % 360;

            object.model.rotate(newRx, newRy, newRz);

            // render it at it's proper position.
            object.pos.rotate(this.camera.rot.x, this.camera.rot.y, this.camera.rot.z);
            let pos = object.pos.pub;
            object.model.blit(pos.x + this.camera.pos.x, pos.y + this.camera.pos.y, pos.z + this.camera.pos.z, reorderModels);
        }
    }
}