const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

// Register helpers
Handlebars.registerHelper('currentYear', () => new Date().getFullYear());

const pages = [
    {
        name: 'index',
        title: 'Home | Veron Evanwormer',
        isHome: true
    },
    {
        name: 'photography',
        title: 'Photography | Veron Evanwormer',
        isPhotography: true
    },
    {
        name: 'lithophanes',
        title: 'Lithophanes | Veron Evanwormer',
        isLithophanes: true
    },
    {
        name: 'radio',
        title: 'Amateur Radio | Veron Evanwormer',
        isRadio: true
    }
];

async function build() {
    // Create dist directory
    await fs.mkdir('dist', { recursive: true });
    
    // Copy static assets
    await fs.cp('public', 'dist', { recursive: true });
    
    // Register partials
    const partialsDir = 'views/partials';
    const partialFiles = await fs.readdir(partialsDir);
    for (const file of partialFiles) {
        const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
        const partialName = path.parse(file).name;
        Handlebars.registerPartial(partialName, content);
    }
    
    // Read main layout
    const layoutContent = await fs.readFile('views/layouts/main.hbs', 'utf-8');
    const layoutTemplate = Handlebars.compile(layoutContent);
    
    // Function to get images from a directory
    async function getImagesFromDir(dir) {
        try {
            const files = await fs.readdir(`public/images/${dir}`);
            return files.filter(file => 
                file.toLowerCase().endsWith('.jpg') || 
                file.toLowerCase().endsWith('.jpeg') || 
                file.toLowerCase().endsWith('.png') ||
                file.toLowerCase().endsWith('.gif')
            );
        } catch (error) {
            console.warn(`No images found in ${dir}:`, error);
            return [];
        }
    }

    // Build each page
    for (const page of pages) {
        const pageContent = await fs.readFile(`views/${page.name}.hbs`, 'utf-8');
        const pageTemplate = Handlebars.compile(pageContent);
        
        // Get images for the current section
        let images = [];
        if (page.name === 'photography') {
            images = await getImagesFromDir('photography');
        } else if (page.name === 'lithophanes') {
            images = await getImagesFromDir('lithophanes');
        } else if (page.name === 'radio') {
            images = await getImagesFromDir('amateur-radio');
        }
        
        const fullPage = layoutTemplate({
            ...page,
            images,
            body: pageTemplate({ ...page, images })
        
        await fs.writeFile(`dist/${page.name}.html`, fullPage);
    }
    
    // Create 404 page
    const notFoundContent = await fs.readFile('views/404.hbs', 'utf-8');
    const notFoundTemplate = Handlebars.compile(notFoundContent);
    const notFoundPage = layoutTemplate({
        title: '404 - Page Not Found',
        body: notFoundTemplate()
    });
    await fs.writeFile('dist/404.html', notFoundPage);
    
    console.log('Build completed successfully!');
}

build().catch(console.error);