---
layout: post
title: "Yggdrasill"
tagline: "Prolog: In which a crazy plan is hatched and a course is set"
tags: [yggdrasill]
excerpt_separator: <!--more-->
---

As the end of my studies is nigh, I’m looking into possible topics for my master thesis. Alas, I've grown a bit tired of writing game engines and renderers lately -- who’d have thought. 

Luckily, this quest for new ~~shores~~ topics was solved quickly. I've also developed quite an interest in procedural generation and always had a bit of a fascination for fantasy worlds and maps. So, I've decided to work on procedural world generation. 

This is obviously going to be a [fun](https://dwarffortresswiki.org/index.php?title=DF2014:Fun&redirect=no) project with much potential for interesting failures.{% note But as Gordon Moore put it: If everything you try works, you aren't trying hard enough.%} Therefore, I have the best intentions of documenting my plans, progress and interesting problems here. With best intentions I do of course mean "force myself" and with documenting I mean "dumb my thoughts here and try to make sense of it all here".

Without further ado: Welcome to this unwise cocktail of a [forever project](https://heredragonsabound.blogspot.com/2020/02/the-forever-project.html) and a master thesis.

<!--more-->

<video loop muted inline autoplay controls style="width:100%; max-width: 40em; display: block; margin: auto">
	<source src="/assets/images/01/jericho.webm" type="video/webm">
</video>

## Related Work

There already are quite a lot of inspiring projects that procedurally generate worlds and maps with impressive results -- some of which I will briefly mention here. I've also uncovered some scientific papers, that I might use as a basis for my project. Although, unfortunately, most of these are sadly closed source projects.

<div class="image_list" markdown="1">

{% include image.html url="/assets/images/01/dwarf-fortress.png" classes="fixed_height fill_black" description="<b>Dwarf Fortress</b> is arguably the first thing that comes to mind, when people think about the procedural generation of game worlds. Sadly definitive information about the generation algorithms is a bit sparse. What is known and documented is, that the generation starts with layers of noise-based fractal maps for terrain/precipitation/..., that form the initial map and are then refined by simulation steps. The main focus (and most impressive part) is, of course, the history generation and simulation of the actual game world. In contrast, the terrain generation is sadly relatively unimpressive." %}

{% include image.html url="/assets/images/01/red_blob_mapgen4.png" classes="fixed_height crop" description="<a href='https://www.redblobgames.com/maps/mapgen4/'>Amit Patel's <b>Mapgen4</b></a> (as well as its <a href='https://www.redblobgames.com/maps/mapgen2/'>previous iterations</a>) is also quite interesting. Especially, since it's quite <a href='http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/'>thoroughly</a> <a href='https://simblob.blogspot.com/search/label/mapgen4'>documented</a> on his blog. The fundamental data-structure used by Magpen4 are relaxed voronoi diagrams and their dual (delaunay triangulations). This allows it to generate interesting maps without the obvious artifacts often seen with uniform grids. Elevation and generation parameters can be edited quite intuitively in Mapgen4 -- with procedural generation of rivers, precipitation, and biomes. However, the most interesting part for me personally is the rendering. It utilizes a traditional rendering pipeline with an oblique projection and more artistic lighting, to achieve a style that is quite close to a hand-drawn look." %}

{% include image.html url="/assets/images/01/dragons_abound.png" classes="fixed_height fill" description="<a href='https://heredragonsabound.blogspot.com'>Scott Turner's <b>Dragons Abound</b></a> procedurally generates and draws fantasy maps, with quite beautiful and adaptable results that are already often near-indistinguishable from hand drawn maps. Although the main focus seems to be on drawing the maps, which informed some of the design decisions, there are also some simulation-based approaches to determine climates, precipitation and rivers. There are some technical similarities to Amit Patel's approach (insofar as both use delaunay triangulations as their fundamental data-structure). In contrast, Dragons Abound seems to use a much larger number of vertices, which allows it to support smaller features and produce more natural shapes." %}

{% include image.html url="/assets/images/01/azgaar.png" classes="fixed_height crop" description="<a href='https://azgaar.github.io/Fantasy-Map-Generator/'><b>Azgaar's Fantasy Map Generator</b></a> is another fascinating project, as it not only provides a working web application to interactively generate detailed fantasy maps but is also <a href='https://github.com/Azgaar/Fantasy-Map-Generator'>open source</a>. Additionally, there is even a <a href='https://azgaar.wordpress.com'>blog</a> with interesting details about the generator’s design and innerworkings, which -- sadly -- is currently inactive. Similar to the previous two, this generator uses a voronoi diagram, but the focus seems to lie much more on the generation. The most impressive part of this project is probably the insane amount of possible customization and editing options of the generated maps." %}

{% include image.html url="/assets/images/01/undiscoveredworlds.png" classes="fixed_height crop" description="<a href='https://undiscoveredworlds.blogspot.com'>JonathanCR's <b>Undiscovered Worlds</b></a> is a procedural world generation project, inspired by Dragons Abound. But the aim of this project is more to generate complete worlds instead of drawing maps with relatively small/local scale, which is especially interesting as its close to my current plans." %}

{% include image.html url="/assets/images/01/wonderdraft.jpg" classes="fixed_height crop" description="<a href='https://www.wonderdraft.net'><b>Wonderdraft</b></a> is a quite powerful and easy-to-use editor to manually create fantasy maps. It doesn't really provide much in terms of procedural generation, but might be an interesting reference as far as user editing of the generated data is concerned. There might also be an interesting potential in integrating a more powerful procedural generation toolkit with it, but -- in the absence of any API or documented file format -- that seems to be unrealistic for now." %}

{% include image.html url="/assets/images/01/voxel_farm.gif" classes="fixed_height fill_black" description="<a href='https://www.voxelfarm.com/index.html'>Miguel Cepero's <b>Voxel Farm</b></a> is another interesting project. To include a bit of trivia: his <a href='http://procworld.blogspot.com'>blog</a> is one of the reasons I originally became interested in 3D graphics and procedural generation. In contrast to most projects on this list, it generates not just a map of a world but an actual interactive 3D world. This is obviously far outside of any reasonable scope for my project, but some of the more abstract ideas might still be interesting." %}

{% include image.html url="/assets/images/01/Procedural Tectonic Planets.gif" classes="fixed_height fill_white" description="On the academic side of things, <a href='https://hal.archives-ouvertes.fr/hal-02136820/file/2019-Procedural-Tectonic-Planets.pdf'>Cortial et al.'s 2019 paper <b>Procedural Tectonic Planets</b></a> proposes a model to procedurally generate planets using a simplified simulation of plate tectonics. Although the authors sadly didn't provide their source code or an executable to reproduce their results, the provided images and <a href='https://www.youtube.com/watch?v=GJQVl6Xld0w'>video</a> look quite promising." %}

{% include image.html url="/assets/images/01/Large Scale Terrain Generation from Tectonic Uplift and Fluvial Erosion.png" classes="fixed_height crop" description="Another study worth mentioning here is <a href='https://hal.inria.fr/hal-01262376/document'><b>Large Scale Terrain Generation from Tectonic Uplift and Fluvial Erosion</b> by Cordonnier et al. from 2017</a>. It uses tectonic uplift and hydraulic erosion data to generate plausible terrains. Although the scale is more local than my current plans, this might be an interesting approach to simulate erosion and river formation at a relatively high level, too." %}

</div>

## Project Aims

The attentive reader might wonder: what exactly is it that I'm trying to achieve here?

The main focus of my project is pretty similar to that of  Undiscovered Worlds. I'm interested in generating plausible worlds, that can be explored, used and processed further by others. Of course, I'll also have to visualize my results in the form of maps and provide some form of user input, but that probably won't be anything to fancy. 

Apart from that, I have three main aims for this project guiding my design decisions.

### Simulation Instead of Noise
As I'm mostly interested in the world generation aspect, I want to try to reduce the amount of random input and noise to a minimum and rely on simulations instead. A model based on a large amount of complexly layered noise might generate interesting worlds, but that is entirely thanks to how that noise is modulated instead of any real meaningful capabilities of the system. And as an effect of this, the generational space of such models is inherently limited to the small subset for which the parameters have been hand-tuned. As John von Neumann famously said:
> With four parameters I can fit an elephant, and with five I can make him wiggle his trunk.

My goal is to create a more generalized system that can generate a wide variety of interesting worlds. 

""Interesting" of course is subjective and means many different things to different people. Personally, I think one intriguing way to try to measure "interesting" in this context is in terms of the entropy of the generated world, i.e. its information density, uncertainty or "surprisingness"{% note "The world is made up of four elements: Earth, Air, Fire and Water.  This is a fact well known even to Corporal Nobbs. It’s also wrong.  There’s a fifth element, and generally it’s called Surprise." -- Sir Terry Pratchett %}. On one end of the spectrum, with an entropy near zero, we have an entirely flat featureless plane. Even if beige is your favorite color and your favorite ice cream flavor is "cold", we can probably agree that this world wouldn’t be terribly "interesting". On the other end, with a large entropy, we end up with a comprehensively incomprehensible world -- where everything appears to be random noise because nothing is correlated.

Noise-based terrain (while often beautiful) would probably lie mostly on the low-entropy-end -- think rolling hills, uniform mountains and general predictability -- while our real world would be more on the high-end. The sweat spot I'm aiming for lies somewhere between these two -- less predictable than perlin noise, but also not as opaque and complex as the real world. 

In other words, what I want to achieve here is a *comprehensible* amount of *meaningful* information in the generated worlds. Meaning every visible feature should have a *cause* that can be discovered by the user, e.g. matching coasts where continents split apart, canyons where rivers used to flow, settlements where they actually make sense with names based on their surroundings and history. Aside from the general technical difficulty, striking the right balance will also be a problem here: An unbroken chain of cause and effect is utterly meaningless if it's too complex to be easily comprehensible. The generated world becomes no more interesting than one based purely on random noise.

### Realistic Scale

My second central aim for this project is the scale at which I want to generate worlds. To support physically meaningful parameters and allow for an easier comparison with the real world, I'm planning to generate spherical worlds on roughly the same scale as the earth, i.e. a radius of about 6'000 km.

To support such a large scale with any amount of local details, I'm going to use a triangle mesh to store the elevation and other information. This should allow for a wide variety of resolutions based on local requirements (i.e., fewer vertices in the ocean and more near coasts and mountains). This should also solve most of the problems and artifacts, usually encountered when one tries to use uniform rectangular grids like bitmaps on a spherical surface.

I'm currently planning to develop my generator in a top-down fashion: starting with the largest terrain features (like tectonic plates and mountains) and moving on to smaller scale details like rivers, caves and settlements from there. Although the dynamic resolution of a triangle mesh should lend itself well to such a generation approach, I might come to a point in the future where I need to split the system into multiple generators for different scales (e.g., erosion at the scale of a continent or mountain range vs. the scale of a local river). However, that should also mesh quite well with the triangle mesh approach, as the small-scale-generator could use the vertices from the high-level generator, refine them further and generate new information matching the constraints determined by the existing vertices. There will also be many interesting problems there, like the usual problem with discontinuities at the border between cells, of course. But that is far enough in the future that I probably shouldn't concern myself with it, just now. That is clearly future-me’s problem, who is much more experienced than me, anyway.

### Reusability

My final aim for this project stems from an inkling that I might have bitten off more than I can chew here. Because of that, I want to build the project in a fashion that even in its incomplete state, parts of it should still be useful or at least interesting to others. To achieve this, I've not just <a href='https://gitlab.com/proc_world_gen'>open sourced (most) of the project</a> but also plan to structure it as modular as possible. 

I already laid the foundation for this with a basic C-API for the world-model and generation passes. While I'll initially just work on a C++API-Wrapper to use in my code, the C-API core should also allow for future interoperability with other languages like Python or C#.

Based on this I plan to develop a simple graphical editor as a debugging tool and construct all the actual procedural generation passes as self-contained reusable modules, that can be loaded as plugins (.dll/.so) at runtime. So, others should (at least in theory) be able to modify (or salvage) any interesting parts, extend the system with new functionality or use it as a starting point for their own projects.


## Outlook

With the goal in mind and the course set: what’s next?

While I would really like to dive directly into exploring ideas for procgen algorithms and interesting simulation approaches, I think I should document and discuss some of the groundwork, first. To do so, the next couple of posts will mostly focus on how the world is modeled, stored, and modified in the code{% note In other words, the next three posts can be skipped by anyone who isn't deeply fascinated by data structures, gets bored easily (despite some colorful pictures!) or suffers from a pathological fear of graph theory.%}.

Having that down, there are some (hopefully a bit lighter) topics, I would like to explore:
- Simulating plate tectonics to generate realistic high-level features (probably based on <a href='https://hal.archives-ouvertes.fr/hal-02136820/file/2019-Procedural-Tectonic-Planets.pdf'>Procedural Tectonic Planets by Cortial et al.</a>)
- Extending and refining the current API
- Creating a renderer to display the generated information in a compact way that is easy to decipher
- Creating easy to use tools to modify the generated worlds, both for debugging and artistic inputs
- Simulating large scale weather patterns to determine precipitation, average temperatures, and biomes
- Model drainage basins and high-level water flow to generate river systems
- Generate detail-maps for smaller areas, based on the high-level features from the coarser large-scale map
- Simulate coarse erosion based on this (maybe similar to <a href='https://hal.inria.fr/hal-01262376/document'>Large Scale Terrain Generation from Tectonic Uplift and Fluvial Erosion by Cordonnier et al.</a>)
- Simulate large scale changes in world climate (i.e., ice ages and glaciation) to reproduce some of the more interesting terrain features we have on earth: fjords, [sunken landmasses](https://en.wikipedia.org/wiki/Doggerland), interesting features on continental shelves, ...
- ...

