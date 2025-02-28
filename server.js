const express = require('express');
const path = require('path');
const fs = require('fs');
const sass = require('sass');
const chokidar = require('chokidar');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

// Configuration
const PORT = process.env.PORT || 8000;
const LIVERELOAD_PORT = process.env.LIVERELOAD_PORT || 35729;
const STYLE = process.env.STYLE || 'default';

// Create Express app
const app = express();

// Ensure dist/css directory exists
const distCssDir = path.join(__dirname, 'dist', 'css');
if (!fs.existsSync(distCssDir)) {
  fs.mkdirSync(distCssDir, { recursive: true });
}

// Helper function to compile a single SCSS file
function compileSassFile(filename) {
  const scssPath = path.join(__dirname, 'styles', `${filename}.scss`);
  const cssPath = path.join(distCssDir, `${filename}.css`);

  if (!fs.existsSync(scssPath)) {
    console.error(`Error: SCSS file not found: ${scssPath}`);
    return false;
  }

  try {
    const result = sass.compile(scssPath);
    fs.writeFileSync(cssPath, result.css);
    console.log(`✓ Compiled ${filename}.scss to dist/css/${filename}.css`);
    return true;
  } catch (error) {
    console.error(`✗ Error compiling ${filename}.scss: ${error.message}`);
    return false;
  }
}

// Pre-compile all SCSS files on startup
function compileAllStyles() {
  const stylesDir = path.join(__dirname, 'styles');
  const scssFiles = fs.readdirSync(stylesDir)
    .filter(file => file.endsWith('.scss'))
    .map(file => file.replace('.scss', ''));

  console.log('Pre-compiling all SCSS files...');
  const results = scssFiles.map(compileSassFile);

  if (results.every(Boolean)) {
    console.log('✓ All styles compiled successfully');
  } else {
    console.warn('⚠ Some styles failed to compile');
  }

  // Ensure the active style is compiled
  if (!results.includes(STYLE) && !compileSassFile(STYLE)) {
    console.error(`✗ Failed to compile the active style: ${STYLE}`);
    console.error('Please check that the style file exists and is valid');
  }
}

// Run pre-compilation
compileAllStyles();

// Set up live reload server with configurable port
const liveReloadServer = livereload.createServer({
  exts: ['css', 'scss', 'js'],
  debug: false, // Set to true for more verbose output
  port: LIVERELOAD_PORT
});
liveReloadServer.watch([
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'dist', 'css'),
]);

// Configure connect-livereload middleware with the same port
app.use(connectLivereload({
  port: LIVERELOAD_PORT
}));

// Middleware to handle SCSS compilation on-demand
app.use('/dist/css/:filename.css', (req, res, next) => {
  const cssFilename = req.params.filename;
  const scssPath = path.join(__dirname, 'styles', `${cssFilename}.scss`);
  const cssPath = path.join(distCssDir, `${cssFilename}.css`);

  // If SCSS file exists, compile it
  if (fs.existsSync(scssPath)) {
    try {
      const result = sass.compile(scssPath);
      fs.writeFileSync(cssPath, result.css);
      res.type('css');
      res.send(result.css);
    } catch (error) {
      console.error(`SASS Compilation Error: ${error.message}`);
      res.status(500).send(`SASS Compilation Error: ${error.message}`);
    }
  } else if (fs.existsSync(cssPath)) {
    // If no SCSS file but CSS exists, serve the CSS file
    next();
  } else {
    res.status(404).send('Style not found');
  }
});

// HTML file handler - injects the correct stylesheet
app.get('*.html', (req, res, next) => {
  const htmlPath = path.join(__dirname, req.path);

  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    let content = fs.readFileSync(htmlPath, 'utf8');
    const cssVersion = Date.now(); // Cache busting

    // Replace the stylesheet reference
    content = content.replace(
      /href="styles\/[^"]+\.css"/,
      `href="dist/css/${STYLE}.css?v=${cssVersion}"`
    );

    // Handle site.css loading order if needed
    if (content.includes('href="Set%20Your%20Pin_files/site.css"')) {
      content = content.replace(
        '<link href="Set%20Your%20Pin_files/site.css" media="screen" rel="stylesheet" type="text/css">',
        ''
      );

      content = content.replace(
        `<link href="dist/css/${STYLE}.css?v=${cssVersion}" media="screen" rel="stylesheet" type="text/css">`,
        `<link href="Set%20Your%20Pin_files/site.css?v=${cssVersion}" media="screen" rel="stylesheet" type="text/css">
    <link href="dist/css/${STYLE}.css?v=${cssVersion}" media="screen" rel="stylesheet" type="text/css">`
      );
    }

    // Add navigation script
    const navScript = `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Set body padding for navbar
        document.body.style.paddingTop = '52px';
        
        // Create navigation bar with inline styles
        const navBar = document.createElement('div');
        navBar.style.position = 'fixed';
        navBar.style.top = '0';
        navBar.style.left = '0';
        navBar.style.width = '100%';
        navBar.style.backgroundColor = '#000';
        navBar.style.padding = '12px 0';
        navBar.style.zIndex = '1000';
        navBar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        
        // Create navigation container
        const navDiv = document.createElement('div');
        navDiv.style.display = 'flex';
        navDiv.style.justifyContent = 'center';
        navDiv.style.gap = '24px';
        navDiv.style.maxWidth = '800px';
        navDiv.style.margin = '0 auto';
        navDiv.style.padding = '0 20px';
        
        // Add navigation links
        const pages = [
          { path: '/', label: 'Set PIN' },
          { path: '/success.html', label: 'Success' },
          { path: '/error.html', label: 'Error' },
          { path: '/form_errors.html', label: 'Form Errors' }
        ];
        
        const currentPath = window.location.pathname;
        
        pages.forEach(page => {
          const link = document.createElement('a');
          link.href = page.path;
          link.textContent = page.label;
          link.style.color = 'white';
          link.style.textDecoration = 'none';
          link.style.fontSize = '15px';
          link.style.fontWeight = '500';
          link.style.padding = '6px 12px';
          link.style.borderRadius = '4px';
          link.style.transition = 'all 0.2s ease';
          link.style.position = 'relative';
          
          // Highlight current page
          const isActive = (currentPath === '/' && page.path === '/') || 
                          (currentPath !== '/' && page.path !== '/' && 
                           currentPath.endsWith(page.path.substring(1)));
          
          if (isActive) {
            link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            
            // Add underline for active link
            const underline = document.createElement('div');
            underline.style.position = 'absolute';
            underline.style.bottom = '-6px';
            underline.style.left = '0';
            underline.style.width = '100%';
            underline.style.height = '2px';
            underline.style.backgroundColor = '#40cfff';
            link.appendChild(underline);
          }
          
          // Hover effect
          link.onmouseover = function() {
            if (!isActive) {
              this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          };
          
          link.onmouseout = function() {
            if (!isActive) {
              this.style.backgroundColor = '';
            }
          };
          
          navDiv.appendChild(link);
        });
        
        navBar.appendChild(navDiv);
        document.body.insertBefore(navBar, document.body.firstChild);
      });
    </script>
    `;

    content = content.replace('</body>', navScript + '</body>');
    res.type('html');
    res.send(content);
  } else {
    next();
  }
});

// Root path redirects to index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Serve static files
app.use(express.static(__dirname));

// Set up SCSS file watcher for hot reloading
const watcher = chokidar.watch('styles/**/*.scss', {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher.on('change', (path) => {
  // Extract the filename without extension
  const filename = path.split('/').pop().replace('.scss', '');
  console.log(`SCSS file changed: ${filename}.scss`);

  // Compile the changed file
  if (compileSassFile(filename)) {
    // Refresh the browser if this is the active style
    if (filename === STYLE) {
      console.log(`Refreshing browser for active style: ${STYLE}`);
      liveReloadServer.refresh(`dist/css/${filename}.css`);
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  Card PIN Style Server                                 ║
║                                                        ║
║  Server running at: http://localhost:${PORT}              ║
║  LiveReload port: ${LIVERELOAD_PORT.toString().padEnd(38)}║
║  Active style: ${STYLE.padEnd(39)}║
║                                                        ║
║  Available pages:                                      ║
║    • http://localhost:${PORT}/                             ║
║    • http://localhost:${PORT}/success.html                 ║
║    • http://localhost:${PORT}/error.html                   ║
║    • http://localhost:${PORT}/form_errors.html             ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
}); 
