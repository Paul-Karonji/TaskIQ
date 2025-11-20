# DueSync Progressive Web App (PWA) Guide

## Overview

DueSync is now a fully capable Progressive Web App (PWA), offering users an enhanced experience with offline functionality, installability, and native app-like features.

## What is a PWA?

A Progressive Web App is a web application that uses modern web capabilities to deliver an app-like experience to users. PWAs combine the best of web and mobile apps, offering:

- **Installability**: Users can install the app on their devices
- **Offline Support**: Works without an internet connection using cached data
- **Fast Loading**: Assets are cached for quick loading times
- **Native Feel**: Looks and feels like a native app
- **Push Notifications**: Receive real-time updates (already implemented)
- **Background Sync**: Sync data in the background
- **Auto-Updates**: Automatically updates to the latest version

## PWA Features Implemented

### 1. Web App Manifest (`/public/manifest.json`)

The manifest defines how DueSync appears to users and how it can be launched. It includes:

- **App metadata**: Name, description, theme colors
- **Icons**: Multiple sizes (72x72 to 512x512px)
- **Display mode**: Standalone (full-screen, app-like)
- **Shortcuts**: Quick actions (Add Task, Focus Mode, Archive)
- **Screenshots**: For app store listings
- **Categories**: Productivity, business, utilities

**Key Properties:**
```json
{
  "name": "DueSync - Task Management",
  "short_name": "DueSync",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10B981",
  "background_color": "#ffffff"
}
```

### 2. Service Worker (`/public/sw.js`)

The service worker is the heart of the PWA, providing:

#### Caching Strategies

**Cache First** (Static Assets)
- Used for: Images, CSS, JavaScript, fonts, icons
- Benefits: Fastest loading, works offline
- Files cached: `/icons/*`, `*.js`, `*.css`, images

**Network First** (API Calls)
- Used for: API requests, HTML pages
- Benefits: Always fresh data when online, cached fallback offline
- Falls back to cache if network unavailable

**Stale While Revalidate** (Dynamic Content)
- Used for: Frequently changing content
- Benefits: Instant loading with background updates
- Balances speed and freshness

#### Cache Management

Three separate caches:
1. **Static Cache**: Core app assets (app shell)
2. **Runtime Cache**: API responses and HTML pages
3. **Image Cache**: Images and media files

Old caches are automatically cleaned up on service worker activation.

#### Offline Fallback

When offline and a page isn't cached, users see a friendly offline page at `/offline` with:
- Clear offline indicator
- List of features available offline
- Retry and home navigation buttons
- Tips for syncing when back online

### 3. Install Prompt (`/components/pwa/InstallPrompt.tsx`)

Smart install prompt that:
- Shows after 30 seconds on the site
- Only appears if not already installed
- Respects user dismissals (7-day cooldown)
- Displays benefits of installation
- Provides one-click installation
- Hides after installation

**Installation Benefits Shown:**
- Works offline with cached data
- Faster load times and performance
- Native app-like experience

### 4. PWA Meta Tags

Added to `app/layout.tsx`:

```tsx
manifest: '/manifest.json',
appleWebApp: {
  capable: true,
  statusBarStyle: 'default',
  title: 'DueSync',
},
themeColor: [
  { media: '(prefers-color-scheme: light)', color: '#10B981' },
  { media: '(prefers-color-scheme: dark)', color: '#059669' }
],
icons: {
  icon: [/* multiple sizes */],
  apple: [/* iOS icons */],
}
```

### 5. Content Security Policy Updates

Updated `next.config.js` to support PWA:
- `worker-src 'self' blob:` - Allows service workers
- `manifest-src 'self'` - Allows manifest file
- Maintains security while enabling PWA features

## Installation Guide

### Desktop (Chrome/Edge/Brave)

1. Visit DueSync website
2. Look for install prompt in address bar (+ icon or install button)
3. Click "Install" or wait for automatic prompt
4. App installs to applications folder
5. Launch from Start Menu/Applications/Dock

### Mobile (Android)

1. Visit DueSync in Chrome/Samsung Internet
2. Tap "Add to Home Screen" prompt
3. Or: Menu → "Install app" / "Add to Home screen"
4. Icon appears on home screen
5. Launch like a native app

### Mobile (iOS/Safari)

1. Visit DueSync in Safari
2. Tap Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Edit name if desired, tap "Add"
5. Icon appears on home screen
6. Launch like a native app

**Note**: iOS has limitations with PWA features (no install prompt, limited background sync).

## Developer Testing

### Testing Locally

1. **Build the app:**
   ```bash
   npm run build
   npm start
   ```

2. **Open Chrome DevTools:**
   - Navigate to http://localhost:3000
   - Open DevTools (F12)
   - Go to "Application" tab

3. **Check PWA Status:**
   - Manifest: Verify all fields load correctly
   - Service Workers: Check registration status
   - Storage → Cache Storage: View cached files
   - Lighthouse: Run PWA audit

### Lighthouse PWA Audit

1. Open Chrome DevTools → Lighthouse
2. Select "Progressive Web App" category
3. Run audit
4. Should score 90+ in all categories

**Key Metrics:**
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Configures a custom splash screen
- ✅ Sets a theme color
- ✅ Content sized correctly for viewport
- ✅ Fast and reliable loading

### Testing Offline Mode

1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Navigate around the app
4. Verify cached pages load
5. Verify offline page shows for uncached routes
6. Check console for service worker logs

### Testing Install Flow

1. Open in incognito/private window
2. Wait for install prompt (30 seconds)
3. Click "Install App"
4. Verify app installs successfully
5. Check app works in standalone mode

## Debugging

### Service Worker Not Registering

**Symptoms:**
- No service worker in DevTools
- Install prompt doesn't appear
- Offline mode doesn't work

**Solutions:**
1. Check HTTPS (required in production, localhost works)
2. Clear browser cache and hard reload
3. Check console for errors
4. Unregister old service workers: DevTools → Application → Service Workers → Unregister
5. Verify `/sw.js` is accessible at root

### Caching Issues

**Symptoms:**
- Old content loading
- Changes not appearing
- Cache not updating

**Solutions:**
1. Increment cache version in `/public/sw.js`:
   ```js
   const CACHE_VERSION = 'v1.0.1'; // Change this
   ```
2. Force update: DevTools → Application → Service Workers → Update
3. Clear cache: DevTools → Application → Clear storage
4. Skip waiting: DevTools → Application → Service Workers → Check "Update on reload"

### Install Prompt Not Showing

**Symptoms:**
- No install prompt appears
- Can't install app

**Reasons:**
1. Already installed (check standalone mode)
2. User dismissed recently (7-day cooldown)
3. Not meeting PWA criteria (run Lighthouse audit)
4. Browser doesn't support (iOS Safari needs manual install)
5. Not enough engagement (prompt delayed 30 seconds)

**Solutions:**
1. Clear localStorage: `localStorage.removeItem('pwa-install-dismissed')`
2. Uninstall app if already installed
3. Wait full 30 seconds on page
4. Fix any Lighthouse PWA audit failures

### Manifest Not Loading

**Symptoms:**
- Manifest errors in console
- Icons not showing
- Wrong theme color

**Solutions:**
1. Verify `/manifest.json` is accessible
2. Check JSON syntax (no trailing commas)
3. Verify icon paths exist
4. Check CSP headers allow manifest
5. Hard reload (Ctrl+Shift+R / Cmd+Shift+R)

## Browser Support

### Fully Supported
- ✅ Chrome 67+ (Desktop & Android)
- ✅ Edge 79+ (Chromium-based)
- ✅ Samsung Internet 8.2+
- ✅ Opera 54+
- ✅ Brave (Latest)

### Partial Support
- ⚠️ Safari 11.1+ (iOS & macOS)
  - No install prompt (manual add to home screen)
  - Limited background sync
  - Service worker restrictions
  - Full offline support

### Not Supported
- ❌ Internet Explorer (all versions)
- ❌ Old Chrome versions (<67)
- ❌ Firefox (limited PWA support)

## Performance Considerations

### Cache Size Management

The service worker automatically manages cache size by:
- Separating caches by type (static, runtime, images)
- Cleaning up old cache versions
- Only caching successful responses (200 OK)
- Using appropriate strategies per content type

### Network Optimization

- **Static assets**: Served from cache first (fastest)
- **API calls**: Network first with cache fallback
- **Images**: Cached after first load
- **HTML**: Network first for fresh content

### Storage Limits

- Chrome/Edge: ~60% of free disk space
- Safari: 50MB initial, prompt for more
- Firefox: 10% of free disk space (up to 2GB)

**Recommendations:**
- Monitor cache size in DevTools
- Implement cache expiration if needed
- Clear old caches on version updates

## Update Strategy

### Automatic Updates

Service worker updates automatically when:
1. User navigates to app (checks every 24 hours)
2. New service worker file detected
3. Push notification received

**Update Flow:**
1. New service worker downloads
2. Waits for old tabs to close
3. Activates on next page load
4. Cleans up old caches

### Force Update

For critical updates, increment cache version:

```js
// In /public/sw.js
const CACHE_VERSION = 'v1.0.1'; // Increment this
```

Users get the update within 24 hours or on next visit.

## PWA Features Roadmap

### Implemented ✅
- ✅ Service worker with caching
- ✅ Offline support
- ✅ Install prompt
- ✅ Web app manifest
- ✅ Push notifications
- ✅ App shortcuts
- ✅ Theme customization
- ✅ Splash screen

### Future Enhancements
- 🔄 Background sync for offline task creation
- 🔄 Periodic background sync for updates
- 🔄 Badge API for unread task count
- 🔄 Share API integration
- 🔄 Web app store listings (Play Store via TWA)

## Security Considerations

### Service Worker Security

- ✅ Served over HTTPS (required)
- ✅ Same-origin policy enforced
- ✅ CSP headers configured
- ✅ No eval() in service worker
- ✅ Secure cache management

### Data Privacy

- Cached data stored locally only
- No sensitive data in service worker
- Tokens stored in secure httpOnly cookies
- Cache cleared on sign out
- No cross-origin caching

## Best Practices

### For Users
1. Install the app for best experience
2. Allow notifications for task reminders
3. Update app regularly (automatic)
4. Clear cache if experiencing issues

### For Developers
1. Test on multiple devices and browsers
2. Monitor service worker errors
3. Version caches appropriately
4. Test offline functionality
5. Audit with Lighthouse regularly
6. Keep service worker simple and focused

## Troubleshooting Common Issues

### App Won't Install
- Check Lighthouse PWA audit for failures
- Verify manifest.json is valid
- Ensure all icons exist and load
- Check browser console for errors

### Offline Mode Not Working
- Verify service worker is registered
- Check cache contents in DevTools
- Ensure network strategies are correct
- Test with DevTools offline mode

### Updates Not Applying
- Increment CACHE_VERSION
- Clear service worker cache
- Unregister and re-register service worker
- Hard reload the page

### Icons Not Showing
- Verify icon files exist at paths specified
- Check manifest.json icon paths
- Ensure icons are correct sizes
- Regenerate icons with script if needed

## Resources

### Documentation
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web App Manifest Spec](https://w3c.github.io/manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit
- [PWA Builder](https://www.pwabuilder.com/) - Generate PWA assets
- [Workbox](https://developers.google.com/web/tools/workbox) - Service worker library (future consideration)

### Testing
- Chrome DevTools - Application tab
- [WebPageTest](https://www.webpagetest.org/) - Performance testing
- Browser compatibility: [caniuse.com/serviceworkers](https://caniuse.com/serviceworkers)

## Support

For PWA-related issues:
1. Check this guide first
2. Run Lighthouse audit
3. Check browser console
4. Test in incognito mode
5. Review service worker logs
6. Contact support with details

---

**Version:** 1.0.0
**Last Updated:** November 20, 2025
**Status:** Production Ready 🚀

**© 2025 WIK Technologies - DueSync PWA Implementation**
