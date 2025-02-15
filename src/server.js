const express = require('express');
const { engine } = require('express-handlebars');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:"],
        },
    },
}));

// Compression middleware
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Handlebars setup
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    partialsDir: path.join(__dirname, '../views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home | Veron Evanwormer',
        isHome: true
    });
});

app.get('/photography', (req, res) => {
    res.render('photography', {
        title: 'Photography | Veron Evanwormer',
        isPhotography: true
    });
});

app.get('/lithophanes', (req, res) => {
    res.render('lithophanes', {
        title: 'Lithophanes | Veron Evanwormer',
        isLithophanes: true
    });
});

app.get('/radio', (req, res) => {
    res.render('radio', {
        title: 'Amateur Radio | Veron Evanwormer',
        isRadio: true
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found'
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});