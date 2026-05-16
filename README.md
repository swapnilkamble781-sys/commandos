# CommandOS

CommandOS is a Mac voice-command AI operator prototype. It is designed to become a one-click desktop app that can understand Hinglish/English commands and route work to Chrome, Figma, email, and automation workflows.

## Current App

This repository builds an Electron macOS app from the existing CommandOS UI.

The app currently supports:

- Voice command UI
- Hinglish/English command planning
- Chrome, Figma, Email, and Automation intent detection
- Confirmation gates for risky actions like send, delete, pay, submit, and account changes
- GitHub Actions based macOS packaging

## Build on GitHub

You do not need Xcode on your Mac. GitHub will build the app.

1. Open the repo's `Actions` tab.
2. Run `Build CommandOS for macOS`.
3. Download the `CommandOS-mac` artifact.
4. Open the `.dmg` or unzip the `.zip` and open `CommandOS.app`.

macOS may warn that the app is unsigned. Right-click `CommandOS.app`, choose `Open`, then approve it once.

## Local Development

If Node and npm are installed later:

```bash
npm install
npm run dev
```

To build locally:

```bash
npm run dist:mac
```

## Next Real-Automation Steps

- Chrome DevTools Protocol bridge
- Gmail OAuth for reading and drafting replies
- Figma API/plugin bridge
- OpenAI API command planner
- macOS Accessibility permission for reliable clicking and typing
- Audit log for every external action
