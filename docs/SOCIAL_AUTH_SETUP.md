# Social Authentication Setup

## Overview

KidsGourmet Mobile supports Google Sign-In and Apple Sign-In. Both flows exchange a provider-issued identity token for a KidsGourmet JWT via the backend API.

### Token Flow

```
Mobile App
  │
  ├── Google Sign-In (expo-auth-session/providers/google)
  │     └── Google returns id_token
  │           └── POST /kg/v1/auth/google { id_token }
  │                 └── kg-core verifies token → returns { token, user }
  │                       └── Mobile stores KG JWT in SecureStore
  │
  └── Apple Sign-In (expo-apple-authentication)
        └── Apple returns identityToken
              └── POST /kg/v1/auth/apple { identity_token, name? }
                    └── kg-core verifies token → returns { token, user }
                          └── Mobile stores KG JWT in SecureStore
```

## Production Setup (Already Completed)

### Apple Developer Console
- Bundle ID `com.kidsgourmet.mobile` has **Sign in with Apple** capability enabled.
- Services ID configured with `kidsgourmet.com.tr` domain.
- Return URL: `https://api.kidsgourmet.com.tr/wp-json/kg/v1/auth/apple/callback`

### Google Cloud Console
- **iOS OAuth Client ID:** `944387456679-nuv4qnlq1lvrdpl1llp31sf30n8mm1j3.apps.googleusercontent.com`
- **Web OAuth Client ID (Expo Go fallback):** `944387456679-mis73fvvfhh7p715mm50j45v61l01ljh.apps.googleusercontent.com`
- iOS bundle ID registered as `com.kidsgourmet.mobile`

### WordPress Admin (kg-core plugin)
- Google Sign-In: enabled with Client ID + Client Secret
- Apple Sign-In: enabled with Team ID `43VFS69JZG`, Bundle ID `com.kidsgourmet.mobile`, Key ID, and `.p8` private key

## Local Development Notes

### Google Sign-In
- Works in **Expo Go** via the `webClientId` (browser-based OAuth flow).
- Native iOS flow (faster, no browser redirect) requires a **dev build**.

### Apple Sign-In
- **Does NOT work in Expo Go.** Requires a native dev build or production build.
- Requires a real iOS device **or** an iOS Simulator with an Apple ID signed in (Simulator support added in iOS 13.5+).
- The `expo-apple-authentication` plugin adds the `com.apple.developer.applesignin` entitlement, which is only active in a real build.

### Creating a Dev Build
```bash
eas build --profile development --platform ios
```

### After Pulling This Branch
Run the following to install the new dependencies:
```bash
npm install
# or, to use Expo's recommended versions:
npx expo install --check
```

## App Configuration

`app.json` additions made by this PR:
- `ios.usesAppleSignIn: true` — adds the Apple Sign-In entitlement.
- `ios.infoPlist.CFBundleURLTypes` — registers the Google reversed client ID as a URL scheme for OAuth redirect handling.
- `plugins: ["expo-apple-authentication"]` — Expo config plugin that wires the entitlement automatically.
- `extra.googleIosClientId` / `extra.googleWebClientId` — public OAuth Client IDs embedded as runtime config (safe to commit; these are not secrets).

## Endpoint Contracts

### POST /kg/v1/auth/google
```json
// Request
{ "id_token": "<Google JWT>" }

// Response (200)
{ "success": true, "token": "<KG JWT>", "user": { ... }, "message": "..." }

// Response (401)
{ "code": "invalid_token", "message": "..." }
```

### POST /kg/v1/auth/apple
```json
// Request
{
  "identity_token": "<Apple JWT>",
  "name": { "given_name": "Ada", "family_name": "Lovelace" }  // optional, first login only
}

// Response (200)
{ "success": true, "token": "<KG JWT>", "user": { ... }, "message": "..." }

// Response (401)
{ "code": "invalid_token", "message": "..." }
```

## Troubleshooting

### 401 from `/kg/v1/auth/apple`
1. Check that the WordPress admin **Bundle ID** matches `com.kidsgourmet.mobile`.
2. Check that the `.p8` key content is saved correctly (no extra whitespace, correct `-----BEGIN PRIVATE KEY-----` header).
3. Confirm Key ID in admin matches the Apple Developer Console key.
4. If the Apple JWKS cache is stale, deactivate and reactivate the plugin to clear it.

### Google Sign-In doesn't open a browser
1. Verify `CFBundleURLTypes` in `app.json` contains the reversed client ID: `com.googleusercontent.apps.944387456679-nuv4qnlq1lvrdpl1llp31sf30n8mm1j3`.
2. Rebuild the app — URL scheme changes require a new native build.
3. Confirm `expo-web-browser` is installed and `WebBrowser.maybeCompleteAuthSession()` is not needed (handled by `expo-auth-session` internally).

### Apple button not visible
- Apple Sign-In is only shown on iOS when `AppleAuthentication.isAvailableAsync()` returns `true`.
- If testing in Expo Go, the button will not appear (expected — native module unavailable).
- On simulator, ensure you are signed in with an Apple ID under Settings → Apple ID.
