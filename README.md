# Git Visualizer

A desktop app (Electron + React + TypeScript) that renders the commit history of a local git repository as an interactive graph.

Pick a folder that has git initialized and the app reads its commits, branches and HEAD via the system `git` CLI, then draws a branch-colored commit tree with adjustable lane ordering. A set of built-in example histories is included for exploring the visualizer without opening a real repo.

## Requirements

- `git` must be installed and available on your `PATH` (the app shells out to it to read repositories).

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Usage

1. Launch the app.
2. Choose one of the built-in examples from the dropdown, or click **Open repo** and select a folder containing a git repository.
3. Use the lane-order controls to rearrange branch columns for a clearer view.
