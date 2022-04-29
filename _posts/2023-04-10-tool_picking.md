---
layout: post
title: "Picking"
tagline: "TODO"
tags: [yggdrasill, studio]
excerpt_separator: <!--more-->
---

TOOD: intro (work on the editor, refactoring, ...) => picking

<!--more-->

TODO: "normal aproach" (ray from camera, maybe with depthbuffer-sampling and intersection on cpu)

TODO: why that doesn't work: many faces/vertices, projections heavily distort geometry and might not be easily reversable

TODO: solution: GPU picking => render pass that writes buffer of Vertex-IDs; each pixel writes the IDs of its three vertices (uniquly identifies the triangle face); also sorted from closest to furthest => first vertex = selected + other two allows us to find the closest edge

TODO: techical stuff
	render pass that only renders the NxN pixels around the cursor
	async retrival to dont starve the gpu
	shaders
	calcuation face/vertex/edge from the vertex-IDs
	
TODO: demo gif = picking.mp4
