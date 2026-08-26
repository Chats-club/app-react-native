# Deploying Casino Chinese to the iOS App Store

This uses **EAS (Expo Application Services)** — Expo's cloud build/submit
pipeline. It needs your own Expo account and Apple Developer account; none
of these steps can be run from a sandboxed environment, so this is exactly
what to type on your own machine.

## 0. Before you start — replace the placeholders

Two files have placeholder values you must change first:

**`app.json`**
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.casinochinese"   ← change this
}
```
Use a reverse-DNS identifier under a domain/team you control, matching
what you'll register in App Store Connect (e.g. `com.acmegaming.casinochinese`).

**`eas.json`** (`submit.production.ios`)
```json
"appleId": "your-apple-id@example.com",        ← your Apple ID email
"ascAppId": "REPLACE_WITH_APP_STORE_CONNECT_APP_ID",  ← see step 2
"appleTeamId": "REPLACE_WITH_YOUR_APPLE_TEAM_ID"      ← see step 1
```

## 1. Install the EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

Find your Apple Team ID at https://developer.apple.com/account → Membership.

## 2. Create the app in App Store Connect

1. Go to https://appstoreconnect.apple.com → **My Apps** → **+** → **New App**
2. Platform: iOS. Name: "Casino Chinese" (or your chosen name — must be
   unique on the App Store). Bundle ID: create/select the one matching
   `app.json`'s `bundleIdentifier`. Fill in SKU (any unique string).
3. Once created, copy the **Apple ID** number shown in App Information
   (a numeric ID, e.g. `1234567890`) — that's your `ascAppId` for `eas.json`.

## 3. Link this project to EAS

```bash
eas init
```
This creates a project on EAS and writes a `projectId` into `app.json`
under `extra.eas` automatically — commit that change.

## 4. Do a real device test first (recommended)

Since Speaking's mic-scoring needs a native module that Expo Go can't
load, build an internal test version and install it on your own iPhone
before shipping to the App Store:

```bash
eas build --platform ios --profile preview
```
This produces an installable `.ipa` you can add to your phone via
TestFlight-style ad-hoc distribution or the Expo Orbit app. Confirm
Speaking's real microphone button appears and works (it only shows the
"Mark as practiced" fallback in Expo Go, by design).

## 5. Production build

```bash
eas build --platform ios --profile production
```
This runs entirely on Expo's cloud build servers — you don't need Xcode
installed locally for this step. It automatically:
- Increments the build number (`autoIncrement: true` in `eas.json`)
- Bundles the icon, splash screen, and the `expo-speech-recognition`
  native module with its Info.plist permission strings
- Signs the build (EAS manages your certificates/provisioning profiles
  unless you choose to supply your own)

Takes roughly 15–25 minutes. You'll get a link to download the `.ipa`
when it's done.

## 6. Submit to App Store Connect

```bash
eas submit --platform ios --profile production
```
Uploads the build from step 5 directly to App Store Connect. After it
finishes processing (~15–60 min, Apple's side), it'll appear under
**TestFlight** first, then you can promote it to a full App Store
submission.

## 7. Fill in App Store Connect metadata

Apple requires these before you can submit for review — none of this is
code, it's all done in the App Store Connect web dashboard:

- **Screenshots** for each required device size (6.7", 6.5", 5.5" iPhone
  at minimum). Take these from the Simulator or your TestFlight build.
- **App description, keywords, support URL**
- **Privacy Policy URL** — **required** because this app requests
  microphone access. Even a simple one-pager stating what the mic is
  used for (speech practice, not recorded/stored/shared) and hosted
  anywhere (GitHub Pages, a simple page on your site) satisfies this.
- **Privacy Nutrition Label** (App Privacy section) — declare that you
  collect no data, or describe what's collected. This app only stores
  progress locally on-device (`AsyncStorage`) — nothing is sent to a
  server, so you can truthfully declare "Data Not Collected."
- **Age rating questionnaire** — flag this honestly: it's a *language
  learning* app about casino terminology (vocabulary, no real gambling,
  no real-money mechanics), but Apple's questionnaire does ask about
  "Simulated Gambling" — answer based on what the app actually does
  (there's no playable gambling simulation here, just vocabulary/phrase
  practice), and expect Apple may still ask clarifying questions in
  review given the subject matter.

## 8. Submit for review

Once metadata + a build are both in place, click **Submit for Review**
in App Store Connect. Typical review time is 1–3 days.

---

## Quick reference: commands in order

```bash
npm install -g eas-cli
eas login
eas init
eas build --platform ios --profile preview     # test on your device first
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## If you'd rather do Android too

Same pipeline, different profile flag:
```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```
You'll need a Google Play Console account ($25 one-time) and a service
account JSON key for `eas submit` — see
https://docs.expo.dev/submit/android/ for that one-time setup.
