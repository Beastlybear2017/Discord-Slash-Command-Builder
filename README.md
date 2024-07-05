# dc-app-command-builder
 
## Originally Created by [bsati](https://github.com/bsati/dc-app-command-builder)

This fork is a major overhaul that improves both the visual feedback as well as a bunch of changes to improve the overall user experience.

UI Tool to create Application Commands (also known as Slash Commands) for Discord Applications. The tool serves the purpose of building a command via a GUI to generate the corresponding JSON which can be used as the body for Discord API calls. Supports general parameter building, commands, options, option nesting, choices, permissions and localization options.

## Note for Development
If you would like to contribute to this, you need to:
- Clone this repository
- run `npm install`
- In `node_modules/svelte-toasts/src/FlatToast.svelte` add `on:keydown={()=>{}}` on a new line 40
- In `node_modules/svelte-toasts/src/BootstrapToast.svelte` add `on:keydown={()=>{}}` on a new line 29

To build the site, run `npm run build`.
To test the site, run `npm run dev`