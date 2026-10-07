# Landing page 3D journey

## Scope

The landing journey uses Three.js and React Three Fiber v9 to show a discovery desk and a connected architecture in one world. Scroll moves a perspective camera between the scenes. Scene buttons reach the same positions. Hovering over architecture blocks or using their HTML buttons highlights a component and explains its role.

The hero exercise and all learning routes keep their existing behavior. Blitzy publication remains paused.

## Loading and rendering

- The renderer is a dynamic client import. An intersection observer mounts it within 200 pixels of the journey on desktop screens at least 960 pixels wide.
- The existing SVG provides the loading view. Mobile, reduced motion, print, and the static-view toggle show both SVG scenes with their direct links.
- The canvas uses demand rendering. Scroll updates a mutable camera progress value and requests a frame only when that value changes. There is no continuous idle animation.
- Pixel density is capped at 1.5. The world uses local geometry, local canvas labels, and one 1024-pixel directional shadow map. No models, fonts, textures, or scripts are fetched from external hosts.
- Leaving the observer area, changing to static view, or changing to an ineligible viewport unmounts the canvas. React Three Fiber owns renderer and geometry disposal; generated label textures dispose on replacement and unmount.
- A failed renderer import, unavailable WebGL, or a lost graphics context switches to the static journey. Its links remain usable.

## Performance gate

`scripts/check-bundle.mjs` enforces a 45 KB gzip homepage budget beyond the shared Next.js framework baseline. The local build measured about 31.4 KB for that initial page JavaScript. The separate 3D chunk measured about 236.8 KB gzip. It is requested near the journey rather than included in the initial HTML scripts.

These are build-size measurements, not a guarantee of frame rate on every device. Desktop Chrome was visually reviewed in light and dark themes. Mobile was reviewed using a 375-pixel viewport with static scenes.

## Validation

Run the repository validation sequence, then `npm run check:bundle`. Landing tests cover a rendered WebGL2 context, camera movement, keyboard component explanations, deferred mounting, static alternatives, reduced motion, unavailable WebGL, and a lost context. Axe checks cover the component controls in both themes. Existing tests cover the practice exercise, path flow, and 320/640-pixel reflow.

No paid asset generation or rendering service is used.
