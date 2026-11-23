# Eye Drops Reminder

The schedule comes from Dr. Manel Pasquel's sheet. The course starts on 22 Nov 2026, and you can change the start date in Settings.

| Drop | Schedule | Times |
|---|---|---|
| Megamox (Optimox) | Every 6 h, 2 weeks | 6 AM · 12 PM · 6 PM · 12 AM |
| Nevan | Every 8 h, 4 weeks | 6 AM · 2 PM · 10 PM |
| Prednisolone (Optipred) wk 1 | Every 4 h | 6 · 10 AM · 2 · 6 · 10 PM |
| wk 2 | Every 6 h | 6 AM · 12 PM · 6 PM · 12 AM |
| wk 3 | Every 8 h | 6 AM · 2 PM · 10 PM |
| wk 4 | Every 12 h | 6 AM · 6 PM |
| wk 5 | Once a day | 6 AM |

When several drops fall at the same time, the app spaces them 5 minutes apart. You can change this gap in Settings.

## Option A: Web app (PWA), quickest

1. Host the `www/` folder over **HTTPS**. Service workers and notifications only work over HTTPS. Any of these will do:
   - Nginx on an existing server: `root /var/www/eyedrops;`
   - Cloudflare Pages or GitHub Pages: drag and drop the folder.
2. On the phone, open the URL in Chrome, then choose **⋮ → Add to Home screen / Install app**.
   On an iPhone, use Safari → Share → **Add to Home Screen**. iOS 16.4 or later is needed for notifications.
3. Open the app, go to **Settings → Turn on notifications**, then tap **Test reminder**.
4. Recommended: tap **Download calendar (.ics)** and import the file into the phone calendar. Calendar alarms ring even when the browser is closed. If you use Google Calendar, import the file into its own calendar and set that calendar's default notification to "at time of event".

> Limitation: a web app can only alert you while it is open or recently used. Mobile browsers don't allow web pages to schedule alarms for later. That is why you should also import the calendar file, or use Option B.

## Option B: Android APK, most reliable

The same `index.html` detects Capacitor. Inside the APK it schedules every dose as a native Android alarm, so reminders work even when the app is closed or the phone is locked.

```bash
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/local-notifications
npx cap init "Eye Drops" lk.eyedrops.reminder --web-dir www
npx cap add android
npx cap sync android
npx cap open android      # Android Studio → Build → Build APK(s)
```

In `android/app/src/main/AndroidManifest.xml`, add these lines for exact alarms on Android 12 and later:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

On the phone, turn off battery optimisation for the app (Settings → Apps → Eye Drops → Battery → Unrestricted).

## Notes
- Tap a drop to mark it done. The app keeps reminding you every 10 minutes, up to 3 times, until you mark it done. You can change the interval in Settings.
- A dose set to "12:00 AM" counts as midnight at the end of that day.
- Data is saved only on the phone (localStorage).
- This app is only a reminder aid. Follow the doctor's instructions.
