# Card PIN Style Server

## Overview 

This repository contains a Node.js server for developing and customizing the "PIN management" form provided by Bridge. 

For additional details, please see https://apidocs.bridge.xyz/docs/cards-pins

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

By default, the server will start at http://localhost:8000. 

## Development

⚠️ You may only edit the CSS/SCSS files in this directory. 
The HTML Files are static and cannot be customized. ⚠️

Changes should be applied to the included `.scss` files and will be automatically compiled to CSS.


During development, you should not need to restart the server, as changes will automatically propogate (as long as they are valid).

### Using Different Style Files

By default, the server uses `styles/default.scss`. To use a different style file, use one of the following methods:

#### Method 1: Using npm scripts

```bash
# Use the default style
npm run dev

# Use the default partner style
npm run dev:partner-default
```

#### Method 2: Using environment variables

You can specify any style file using the `STYLE` environment variable:

```bash
# Use the default-partner style
STYLE=default-partner npm run dev

# Use any other style file in the styles directory
STYLE=your-custom-style npm run dev
```

Make sure the specified style file exists in the `styles` directory with the `.scss` extension.

## SCSS Structure

The SCSS files are organized as follows:

- `styles/default.scss` - Main stylesheet with variables and styles
- `styles/default-partner.scss` - Reference file which should be used by partners to customize the form

# Adding new styles

In order to add a new stylesheet, you should do the following: 

1. Copy the `partner-default.scss` file to a new file in the `styles` directory.
1. Edit the new file to your liking.
1. Run and validate your style by running:

```bash 
STYLE=your-style-name npm run dev
```

After you are satisfied with your stylesheet, please ping the Bridge team so that we can get it added to your configuration.
