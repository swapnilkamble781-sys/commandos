# CommandOS Voice Agent

CommandOS is a polished prototype for a Mac voice-command AI operator. It accepts typed or spoken Hinglish/English commands, detects whether the job belongs to Chrome, Figma, Email, or general automation, then creates a safe execution plan.

## What this v1 does

- Voice input through the browser SpeechRecognition API
- Hinglish command detection
- Intent routing for Chrome, Figma, Email, and Automation
- Safety checkpoints for actions like sending, deleting, paying, submitting, and downloading
- Operator panels that turn a raw command into task-specific execution briefs

## What the native Mac version should add next

- OpenAI API based command planner
- macOS Accessibility permission for clicking and typing
- Chrome DevTools Protocol or browser extension bridge
- Gmail OAuth / Apple Mail integration
- Figma API and plugin bridge
- Local audit log of every action
- Mandatory confirmation before destructive or external actions
