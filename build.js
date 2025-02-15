const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

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
    
    // Build each page
    for (const page of pages) {
        const pageContent = await fs.readFile(`views/${page.name}.hbs`, 'utf-8');
        const pageTemplate = Handlebars.compile(pageContent);
        
        const fullPage = layoutTemplate({
            ...page,
            body: pageTemplate(page)
        });
        
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