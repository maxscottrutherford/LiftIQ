# LiftIQ

A modern web application built with Next.js, React, TypeScript, and Mantine UI.

## Features

- ⚡ **Next.js 15** with App Router
- 🔷 **TypeScript** for type safety
- 🎨 **Mantine UI** for beautiful components
- 🌙 **Dark mode** support
- 📱 **Responsive design** with AppShell
- 🎯 **ESLint** configuration
- 🚀 **Ready for customization**

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout with Mantine providers
│   └── page.tsx         # Home page with Mantine components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Customization

The application is ready for your custom color scheme and features. The Mantine theme can be customized in the `MantineProvider` component in `src/app/layout.tsx`.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI Library**: Mantine
- **Icons**: Tabler Icons
- **Styling**: CSS-in-JS with Mantine
- **Linting**: ESLint
