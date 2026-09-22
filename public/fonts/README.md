# Self-Hosted Fonts

## Montserrat Font Files

Download from: https://gwfh.mranftl.com/fonts/montserrat?subsets=latin

### Required Files (place in `montserrat/` folder):

1. **montserrat-v31-latin-regular.woff2** (400 weight)
2. **montserrat-v31-latin-600.woff2** (600 weight - Semi-Bold)
3. **montserrat-v31-latin-700.woff2** (700 weight - Bold)

### Download Instructions:

1. Visit https://gwfh.mranftl.com/fonts/montserrat?subsets=latin
2. Select the following font styles:
   - latin / 400 / normal
   - latin / 600 / normal
   - latin / 700 / normal
3. Click "Download" button
4. Extract the .woff2 files from the zip
5. Copy them to this directory: `public/fonts/montserrat/`
6. Verify filenames match exactly (or update paths in theme.css)

### Why Self-Host?

- **Performance**: Eliminates external DNS lookup (~200ms savings)
- **Privacy**: No Google tracking
- **Reliability**: Works offline, no third-party dependency
- **Caching**: Fonts cached locally with your assets
- **GDPR**: No data sent to Google

### File Sizes (approximate):

- montserrat-v31-latin-regular.woff2: ~19KB
- montserrat-v31-latin-600.woff2: ~19KB
- montserrat-v31-latin-700.woff2: ~19KB

**Total**: ~56KB vs 120-150KB from Google Fonts
