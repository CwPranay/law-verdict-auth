
# **Law & Verdict – Multi-Device Login Control (N = 3)**

This project is a small Next.js app with Auth0 login and a custom **three-device login limit**.
The idea is straightforward: a single user account shouldn’t be logged in from unlimited devices at the same time.
So the app keeps track of active devices and blocks new ones once the limit is reached.

**Live Demo**
-> [https://law-and-verdict.vercel.app/](https://law-and-verdict.vercel.app/)

---

### **What the app includes**

* Public home page
* Private dashboard (after login)
* Auth0 authentication
* MongoDB-backed session tracking
* Hard limit of **3 active devices per user**
* A “session overflow” page when device #4 tries to log in
* A “forced logout” screen for removed devices
* TailwindCSS + shadcn UI for styling

---

## **How N-Device Limiting Works (Quick Breakdown)**

Here’s the actual flow behind the 3-device limit.

### **1. Login -> Auth0 callback**

When Auth0 sends the user back to the app, I check how many active sessions they already have:

```js
const activeCount = await sessions.countDocuments({ userId, isActive: true });
```

Nothing gets created before this check.
This is where the login is allowed or blocked.

---

### **2. If they’re under the limit**

When a user has fewer than 3 devices logged in:

* A unique `deviceId` (UUID) is generated
* A session entry is added in MongoDB
* The same `deviceId` goes into an HttpOnly cookie

This cookie identifies the *actual device* during validation.

---

### **3. If they already hit the limit**

No new session is created.

Instead, they’re redirected to **/session-overflow**, where they can:

* View existing logged-in devices
* Remove one
* Or cancel the login attempt

This avoids any silent logouts or unexpected behavior.

---

### **4. When a session gets removed**

Deleting a session on the server doesn’t remove the cookie from that device.
So that device believes it’s still logged in until it makes another authenticated request.

---

### **5. Forced logout for removed/invalid devices**

Every protected page calls:

```
/api/validate-device
```

This endpoint checks:

* Does the browser still have a `deviceId` cookie?
* Does that `deviceId` still exist in MongoDB?

If not, the user is logged out immediately and sent to the **forced-logout** page with a clear message.

---

### **What this achieves**

* No surprises: the user controls which device to kick out
* The system never silently exceeds the device limit
* Removed devices are logged out gracefully
* Database + cookies always stay consistent

---

## **Tech stack**

* **Next.js 14 (App Router)**
* **Auth0** for authentication
* **MongoDB Atlas** (free tier)
* **TailwindCSS** + **shadcn/ui**
* **Vercel** for hosting

---

## **Project structure (essential parts)**

```
/app
  /dashboard
  /forced-logout
  /session-overflow
  /api
    /sessions
      list
      force-logout
    validate-device
    users
/middleware.js
/pages/api/auth/[...auth0].js
```

Key components:

1. Auth0 callback → creates or blocks sessions
2. `/api/validate-device` → validates each request
3. Session APIs → listing and force-removing devices

---

## **Environment variables**

```
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

MONGODB_URI=
MAX_DEVICES=3
```

---

## **Running locally**

```
npm install
npm run dev
```

---

## **Why this structure**

I separated responsibilities intentionally:

* Auth0 handles authentication
* MongoDB keeps track of device sessions
* Middleware guards private routes
* API routes control device validation and cleanup
* UI pages just respond to the data returned

This keeps the logic predictable and makes debugging simple.

---

## **Why Auth0 v3.3 and Next.js 14.2**

### **Auth0 v3.3**

I chose `@auth0/nextjs-auth0@3.3.x` because:

* It fully supports the **App Router**
* It allows extending the login flow using the documented `afterCallback` hook
* Older builds rely heavily on the Pages Router or don’t expose enough control

### **Next.js 14.2**

I used this version because it’s stable and handles:

* App Router routing
* Middleware with cookie access
* Dynamic server API routes (important for device validation)
* `export const dynamic = "force-dynamic"` for endpoints that need runtime execution

Older Next.js versions had unreliable server behavior with cookies, which made N-device logic inconsistent.

---

