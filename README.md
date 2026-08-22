# Route Posts

**Abdelrahmanahmeed** · [GitHub](https://github.com/Abdelrahmanahmeed) · [Repository](https://github.com/Abdelrahmanahmeed/Social_App)

Route Posts is a social networking SPA built with React and Vite. It connects to the Route Posts REST API to deliver a Facebook-style feed experience — posts, comments, profiles, notifications, and user interactions — inside a responsive, portfolio-ready frontend application.

---

## Features

### Authentication

- Login and registration with client-side validation
- Protected routes for authenticated pages
- JWT session persistence via `localStorage`
- Change password with Zod schema validation

### Posts & Feed

- Create posts with text and optional image upload
- Edit, delete, like, bookmark, and share posts
- Dedicated post details page
- Multiple feed views: **Feed**, **My Posts**, **Community**, **Saved**
- Likes modal and shared post preview

### Comments

- View, create, edit, and delete comments
- Like and unlike comments
- Nested replies on comments

### Profile

- View profile data and follower/following counts
- Upload and update profile photo
- Tabs for personal posts and saved posts

### Social

- Suggested friends sidebar with search filtering
- Follow users from suggestions

### Notifications

- View all notifications with All / Unread filters
- Unread count from API
- Mark single or all notifications as read
- Types: likes, comments, shares, and follows

### UI / UX

- Responsive 3-column home layout on desktop
- Shared auth layout for login and register
- Loading, empty, and error states across pages
- Toast feedback for post actions
- Offline page with automatic redirect when connection is restored
- Sticky navbar and sidebar sections
- Dropdown menus, modals, and animated transitions

---

## Tech Stack

#### Core

React 19 · Vite 8 · React Router DOM 7 · Tailwind CSS 4

#### State & Data

TanStack React Query · Axios · React Hook Form · Zod · Hookform Resolvers

#### UI

HeroUI (Avatar) · React Icons · React Spinners · Cairo font

#### Architecture

React SPA · Auth Context · Protected Routes · Custom Hooks · Feature-based Components · Vercel SPA Routing

---

## Architecture

```text
UI Components (Pages / Cards / Modals)
        ↓
React Query Hooks + Auth Context
        ↓
Axios API Calls (Bearer Token)
        ↓
Route Posts REST API
        ↓
localStorage (token + user session)
```

Components fetch data through TanStack Query hooks and mutations. Authentication state lives in `AuthContext` and is restored from `localStorage` on app load. Protected routes guard authenticated pages and redirect unauthenticated users to login. After mutations, query caches are invalidated to keep the UI in sync with the API.

---

## Project Structure

```text
src/
├── Components/
│   ├── Auth/              # Shared login/register layout
│   ├── Home/              # Feed page (3-column layout)
│   ├── PostCard/          # Post display & interactions
│   ├── PostCreation/      # Create post form
│   ├── Comments/          # Comments section
│   ├── Profile/           # Profile page
│   ├── Notification/      # Notifications page
│   ├── Navbar/            # App navigation
│   ├── Offline/           # Offline detection & page
│   └── ...
├── Context/               # AuthContext provider
├── hooks/                 # useOnlineStatus
├── utils/                 # showToast helper
├── App.jsx                # Routes & providers
└── main.jsx               # Entry point
```

---

## Getting Started

```bash
git clone https://github.com/Abdelrahmanahmeed/Social_App.git
cd Social_App
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

No environment variables are required. The app uses the public API at `https://route-posts.routemisr.com`.

### Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## API

| Area | Endpoints |
|------|-----------|
| Auth | `POST /users/signin`, `POST /users/signup` |
| Profile | `GET /users/profile-data`, `PUT /users/upload-photo` |
| Account | `PATCH /users/change-password` |
| Social | `GET /users/suggestions`, `PUT /users/:id/follow` |
| Posts | `GET/POST /posts`, `PUT/DELETE /posts/:id`, like, bookmark, share |
| Comments | `GET/POST /posts/:id/comments`, edit, delete, like, replies |
| Notifications | `GET /notifications`, unread count, mark as read |

All authenticated requests use `Authorization: Bearer <token>`.

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile | Single-column feed, icon-only nav with screen-reader labels |
| Tablet (`md`) | Multi-column grid, reordered sections |
| Desktop (`lg`) | 3-column home (sidebar · feed · suggestions), sticky panels |

---

## Accessibility

- Semantic HTML (`article`, form labels)
- `aria-label` on icon-only controls
- `sr-only` text for mobile navigation
- Keyboard-accessible buttons and form inputs

---

## Deployment

Configured for **Vercel** with SPA fallback routing via `vercel.json`.

```text
Build Command:    npm run build
Output Directory: dist
```

**Live Demo:** _Add URL after deployment_

---

## Samples

| Page | Preview |
|------|---------|
| Home Feed | _Coming soon_ |
| Login / Register | _Coming soon_ |
| Profile | _Coming soon_ |
| Post Details | _Coming soon_ |
| Notifications | _Coming soon_ |

---

## Project Status

Completed educational portfolio project for Route Academy. Core social features are implemented and ready for demonstration.

---

**Abdelrahman Ahmed** · [@Abdelrahmanahmeed](https://github.com/Abdelrahmanahmeed)
