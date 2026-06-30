# Shadcn & TypeScript Setup Instructions

To fully support the shadcn structure and TypeScript in this project, follow these steps:

## 1. Initialize shadcn
Run the following command in the `client` directory to set up the shadcn configuration:
```bash
npx shadcn-ui@latest init
```
**Recommended choices during init:**
- Style: New York
- Base color: Slate
- CSS variables: Yes

## 2. Setting up Path Aliases
The components use `@/lib/utils`. I have already created a `tsconfig.json` that supports this, but ensure your `vite.config.js` is also updated if you encounter resolution issues:
```javascript
// vite.config.js
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## 3. Why `/components/ui`?
In shadcn, the `ui` folder is reserved for reusable, atomic components (buttons, cards, inputs) that are managed by the CLI. Keeping them separate from your feature-specific components (`/components/Navbar.jsx`, etc.) ensures a clean architecture and easy updates.

## 4. Installed Dependencies
I have already installed the following for you:
- `framer-motion`: For the 3D tilt animations.
- `lucide-react`: For icons.
- `clsx` & `tailwind-merge`: For the `cn` utility.
