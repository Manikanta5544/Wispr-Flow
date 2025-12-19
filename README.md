# Wispr Flow Clone — Voice-to-Text Desktop App

A cross-platform voice-to-text desktop application built with **Tauri**, **React**, **TypeScript**, and **Deepgram**.  
This project focuses on the **core Wispr Flow workflow**: push-to-talk voice input, real-time transcription, and immediate text usability — prioritizing correctness, reliability, and clean architecture over visual polish.

---

## Overview

This repository contains a **functional clone of Wispr Flow**, built as part of a technical assignment to evaluate practical desktop application development skills using modern tools.

The primary goal of this implementation is to demonstrate:

- Real-time audio capture and streaming
- Low-latency speech-to-text integration
- Clear separation of concerns across the stack
- Robust handling of real-world failure cases

UI is intentionally minimal. The emphasis is on **user workflow**, **system behavior**, and **engineering decisions**, as outlined in the assignment.

---

## Implemented Features

### Voice Input & Recording
- Push-to-talk recording via UI button
- Keyboard shortcut support (`Ctrl + Shift + V`)
- Clear visual feedback across the recording lifecycle
- Recording disabled during unsafe transitions

### Microphone Access & Audio Capture
- Explicit permission handling
- Continuous audio capture while recording
- Guaranteed cleanup of audio streams and contexts
- Defensive handling of permission denial and device errors

### Real-Time Transcription (Deepgram)
- Live audio streamed over WebSocket
- Interim and final transcripts handled separately
- Final transcript buffering prevents duplication
- Low-latency updates suitable for real-time usage

### Transcription Output
- Live transcript preview while speaking
- Copy-to-clipboard support
- Native text insertion at cursor position in Tauri desktop builds
  (clipboard fallback when native insertion is unavailable)

### Error Handling
- Microphone permission errors
- Network and WebSocket failures
- Audio capture failures
- Safe recovery paths without app restart

---

## Architecture & Design

The application follows a **clear layered architecture** with explicit responsibilities:

UI Layer (React Components)
│
├─ Hooks
│ ├─ useVoiceToText
│ └─ useKeyboardShortcut
│
├─ Services
│ ├─ TranscriptionManager (FSM orchestrator)
│ ├─ AudioCapture (microphone & audio processing)
│ └─ DeepgramClient (WebSocket communication)
│
└─ Tauri Backend
└─ Native system integration (text insertion, tray)

The FSM ensures deterministic behavior during rapid user actions (quick start/stop, permission delays, network latency)


### Finite State Machine (FSM)

Recording behavior is governed by an explicit FSM to prevent race conditions and invalid transitions:

Idle → RequestingPermission → Recording → Processing → Idle
                  ↘─────────────── Error


Public actions (`start`, `stop`) are guarded by state checks.  
Invalid transitions are intentionally blocked.

---

## Engineering Decisions

### Functionality First
This project intentionally prioritizes:
- Correct behavior under real usage
- Defensive resource management
- Clear state transitions
- Predictable user workflow

Advanced UI styling and visual parity with Wispr Flow were intentionally deprioritized to focus on correctness, latency, and reliability of the voice-to-text workflow.


### Separation of Concerns
Each module has a single, well-defined responsibility:
- Audio capture does not manage state
- WebSocket logic does not touch UI
- Orchestration is centralized and testable

### Resource Safety
All critical resources are explicitly cleaned up:
- Audio contexts
- Media streams
- WebSocket connections

This avoids memory leaks and zombie connections during repeated recordings.

---

## Known Limitations & Assumptions

The following are **intentional scope decisions**, made to prioritize correctness, stability, and real-time reliability:

- Recording begins only after microphone permission and WebSocket readiness, causing a small startup delay to avoid dropped audio.
- Optimized for single-speaker dictation; broadcast or multi-speaker audio is out of scope.
- Transcription quality depends on microphone and environment; audio processing is intentionally tuned for dictation clarity and real-time stability rather than broadcast-grade enhancement
- Audio capture uses `ScriptProcessorNode` for stability in Tauri WebViews; `AudioWorklet` is a planned upgrade.
- Offline transcription is not supported due to Deepgram’s real-time WebSocket dependency.
- Transcripts are session-scoped and not persisted.
- Native text insertion is available in desktop builds; clipboard fallback is used where unsupported.
- UI styling is intentionally minimal to keep focus on workflow correctness over visual polish.

Each limitation has a clear upgrade path if extended beyond the assignment scope.

---

## Tech Stack

- **Tauri** — cross-platform desktop runtime (Windows, macOS, Linux)
- **React 18** — UI layer
- **TypeScript** — type safety and maintainability
- **Vite** — fast development tooling
- **Deepgram WebSocket API** — real-time speech-to-text
- **Vitest** — unit testing for core logic

---

## Getting Started

### Prerequisites
- Node.js 18+
- Rust toolchain (for Tauri)
- Deepgram API key

### Setup

```bash
git clone https://github.com/Manikanta5544/Wispr-Flow
cd wispr-flow
npm install 
```
### Create a .env file:
```bash
VITE_DEEPGRAM_API_KEY=your_deepgram_api_key
```
### Run in Development
```bash
npm run tauri:dev
```
### Build Desktop App
```bash
npm run tauri:build
```
### Usage
1. Click Record or press Ctrl + Shift + V
2. Speak naturally into the microphone
3. Watch live transcription appear
4. Stop recording
5. Copy or insert the resulting text where needed

## Testing
Core logic is covered by unit tests:

- FSM state transitions
- Transcript buffering behavior
- Audio utilities
- Error handling paths

```bash
npm run test
```
or
```bash
npx vitest
```
Tests focus on behavioral correctness, not UI snapshots

This implementation is intentionally scoped to demonstrate real-time audio handling, API integration, and system correctness, as emphasized in the assignment criteria.
