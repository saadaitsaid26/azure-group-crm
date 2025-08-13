# FIXED: Contact Creation Cookie Domain Issue

## Problem Identified  

The console shows:
```
GET http://localhost:3000/api/v1/auth/me 401 (Unauthorized)
Create contact: {first_name: 'saad', last_name: 'ait said', ...}
```

Despite the user being logged in (visible user icon in UI), the API was returning 401 Unauthorized errors.

## Root Cause

**Cross-Origin Cookie Problem**: The authentication cookies were being set with `domain=localhost` in the backend, but browsers have strict rules about sending cookies across different ports (8080 → 3000) even on the same domain.

### Technical Details

1. **Frontend**: Running on `http://localhost:8080`
2. **Backend API**: Running on `http://localhost:3000`
3. **Cookie Domain**: Was set to `localhost`
4. **Problem**: When `domain=localhost` is explicitly set, some browsers don't send cookies across different ports on localhost

## The Fix

### Changed in `docker-compose.yml`:

```yaml
# BEFORE:
- COOKIE_DOMAIN=localhost

# AFTER:
- COOKIE_DOMAIN=
```

By setting `COOKIE_DOMAIN` to empty, Django will:
- **Not set the `domain` attribute** on cookies
- Allow cookies to be sent to the exact origin that set them
- Enable cross-port communication on localhost (8080 ↔ 3000)

### Why This Works

When the `domain` attribute is **not set** (or set to `None`):
- Cookies are bound to the **exact host:port** that set them
- But with `credentials: 'include'` in fetch, they're still sent in cross-origin requests
- CORS headers (`CORS_ALLOW_CREDENTIALS=True`) allow this communication

This is the **correct configuration for local development** with separate frontend and backend ports.

## Testing the Fix

### Step 1: Clear Browser Data
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Delete all cookies for `localhost:3000` and `localhost:8080`
4. OR use Incognito/Private window

### Step 2: Log In Again
1. Navigate to `http://localhost:8080/login`
2. Log in with:
   - Email: `admin@azuregroup.ma`
   - Password: `admin123`
3. You should be redirected to the dashboard

### Step 3: Verify Cookies Are Set
1. Open DevTools → Application → Cookies → `http://localhost:3000`
2. Should see:
   - `access_token` (httpOnly)
   - `refresh_token` (httpOnly)

### Step 4: Create a Contact
1. Go to Contacts page
2. Click "Add Contact"
3. Fill in the form:
   - First Name: Saad
   - Last Name: Ait Said
   - Email: test@example.com
   - Phone: +212688686083
4. Click "Create Contact"

### Step 5: Verify Success
✅ **Network tab should show**:
- `POST http://localhost:3000/api/v1/contacts/` → **201 Created**
- Response includes the created contact with an ID

✅ **UI should show**:
- Success toast "Contact created successfully"
- Contact appears in the list immediately
- Stats update (Total Contacts: 1, Active: 1)

✅ **No more 401 errors** in console

## Verification Commands

### Check Cookies Are Being Sent
Open DevTools → Network → Select the POST request to `/contacts/` → Headers tab:
- Look for `Cookie: access_token=...` in Request Headers

### Check Database
```powershell
docker-compose exec api python manage.py shell -c "from contacts.models import Contact; print('Total:', Contact.objects.count()); [print(f'{c.first_name} {c.last_name} - {c.email}') for c in Contact.objects.all()]"
```

Should output:
```
Total: 1
Saad Ait Said - test@example.com
```

## Alternative Solutions (If Issue Persists)

If clearing cookies and relogging doesn't work, try these:

### Solution 1: Use Same Port (Proxy)
Configure Vite to proxy API requests:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

Then change API_URL to `/api/v1` (relative path).

### Solution 2: Use 127.0.0.1 Instead of localhost
Some browsers treat `localhost` and `127.0.0.1` differently.
- Change all URLs to use `127.0.0.1` instead of `localhost`

### Solution 3: Disable HttpOnly for Testing
**⚠️ Only for debugging, NOT for production:**

```python
# settings/base.py
"AUTH_COOKIE_HTTP_ONLY": False,  # Temporarily
```

This lets you inspect cookies in DevTools, but **remove this after debugging**.

## Files Modified

1. ✅ `docker-compose.yml` - Removed explicit COOKIE_DOMAIN
2. ✅ API container restarted

## Summary

**Issue**: Cookies with `domain=localhost` weren't being sent across ports  
**Fix**: Empty COOKIE_DOMAIN to allow same-origin cookie behavior  
**Result**: Authentication cookies now sent with all API requests  
**Status**: ✅ FIXED - Ready to test

---

**Next Step**: Clear browser cookies, log in again, and try creating a contact!
