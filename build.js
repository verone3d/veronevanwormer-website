const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

const pages = [
    {
        name: 'index',
        title: 'Home | Verone VanWormer',
        isHome: true
    },
    {
        name: 'photography',
        title: 'Photography | Verone VanWormer',
        isPhotography: true
    },
    {
        name: 'lithophanes',
        title: 'Lithophanes | Verone VanWormer',
        isLithophanes: true
    },
    {
        name: 'radio',
        title: 'Amateur Radio | Verone VanWormer',
        isRadio: true,
        heading: 'Amateur Radio'
    }
];

// Function to get images from a directory
function getImagesFromDir(dir) {
    return fs.readdir(`public/images/${dir}`)
        .then(files => {
            return files.filter(file => 
                file.toLowerCase().endsWith('.jpg') || 
                file.toLowerCase().endsWith('.jpeg') || 
                file.toLowerCase().endsWith('.png') ||
                file.toLowerCase().endsWith('.gif')
            );
        })
        .catch(error => {
            console.warn(`No images found in ${dir}:`, error);
            return [];
        });
}

// Register helpers
Handlebars.registerHelper('currentYear', () => new Date().getFullYear());
Handlebars.registerHelper('baseName', (str) => {
    return str.replace(/\.[^/.]+$/, '');
});

// Create dist directory
fs.mkdir('dist', { recursive: true })
    .then(() => fs.cp('public', 'dist', { recursive: true }))
    .then(() => {
        // Register partials
        return fs.readdir('views/partials')
            .then(files => {
                return Promise.all(files.map(file => {
                    return fs.readFile(path.join('views/partials', file), 'utf-8')
                        .then(content => {
                            const partialName = path.parse(file).name;
                            Handlebars.registerPartial(partialName, content);
                        });
                }));
            });
    })
    .then(() => {
        // Read main layout
        return fs.readFile('views/layouts/main.hbs', 'utf-8');
    })
    .then(layoutContent => {
        const layoutTemplate = Handlebars.compile(layoutContent);

        // Build each page
        return Promise.all(pages.map(page => {
            return fs.readFile(`views/${page.name}.hbs`, 'utf-8')
                .then(pageContent => {
                    const pageTemplate = Handlebars.compile(pageContent);

                    // Get images for the current section
                    let imagesPromise;
                    if (page.name === 'photography') {
                        imagesPromise = getImagesFromDir('photography');
                    } else if (page.name === 'lithophanes') {
                        imagesPromise = getImagesFromDir('lithophanes');
                    } else if (page.name === 'radio') {
                        imagesPromise = getImagesFromDir('amateur-radio');
                    } else {
                        imagesPromise = Promise.resolve([]);
                    }

                    return imagesPromise.then(images => {
                        const fullPage = layoutTemplate({
                            ...page,
                            images,
                            body: pageTemplate({ ...page, images })
                        });
                        return fs.writeFile(`dist/${page.name}.html`, fullPage);
                    });
                });
        }));
    })
    .then(() => {
        console.log('Build completed successfully!');
    })
    .catch(error => {
        console.error('Build failed:', error);
        process.exit(1);
    });