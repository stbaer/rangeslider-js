docute.init({
  repo: 'stbaer/rangeslider-js',
  landing: true,
  debug: true,
  plugins: [
    docuteIframe({
      prepend: '' +
      '<style> >div{margin-bottom: 3rem} </style>' +
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rangeslider-js@latest/dist/styles.min.css">' +
      '<script src="https://cdn.jsdelivr.net/npm/rangeslider-js@latest/dist/rangeslider-js.min.js"></script>'
    })
  ],
  nav: [
    {title: 'Home', path: '/'},
    {title: 'Docs', path: '/docs', source: 'https://raw.githubusercontent.com/stbaer/rangeslider-js/master/README.md'},
    {title: 'Examples', path: '/examples'},
    {title: 'API', path: '/api'},
    {title: 'History', path: '/history', source: 'https://raw.githubusercontent.com/stbaer/rangeslider-js/master/History.md'}
  ]
})
