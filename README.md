# CoReason VS Code Projection Manifold

![GitHub Actions CI](https://img.shields.io/badge/CI-Passing-brightgreen)
![Codecov](https://img.shields.io/badge/Codecov-95%25-brightgreen)
![VS Code Marketplace Version](https://img.shields.io/badge/VS_Code_Marketplace-v1.0.0-blue)

*A Cybernetic Control Surface and Topological Canvas for the coreason-runtime Active Inference mesh.*

## The Feature Grid

- **Topological Manifold:** A zero-intrinsic-state React Flow canvas rendering Directed Cyclic Graphs (DCG) via an ELK WebAssembly layout math engine.
  [➔ Read the Operational Handbook](./docs/features/TDA_CANVAS.md)

- **Zero-Trust Sandbox:** A deterministic Capability Forge executing Model Context Protocol (MCP) intents within strict WebAssembly linear memory boundaries.
  [➔ Read the Operational Handbook](./docs/features/CAPABILITY_FORGE.md)

- **Human-AI Boundary Escalation:** An Epistemic Oracle handling Active Inference Markov Blanket piercing via strict state hydration routing.
  [➔ Read the Operational Handbook](./docs/features/ORACLE_INBOX.md)

- **Tensor-Driven Topology:** A Zero-Waste predictive synthesis render loop powered by local SGLang Tensor engines.
  [➔ Read the Operational Handbook](./docs/features/PREDICTIVE_SYNTHESIS.md)

## Zero-Waste Quickstart

```bash
git clone https://github.com/coreason/coreason-vscode.git
cd coreason-vscode
npm ci
npm run watch
# Press F5 in VS Code to launch the Extension Development Host
```

## Installation & Deployment (Side-Loading)

### 1. Packaging the VSIX

To compile the extension into a standalone binary, run the following commands:
```bash
npm ci
npm run build
npx @vscode/vsce package
```

### 2. Installing on Native VS Code

The resulting `.vsix` file can be installed via the Extensions pane. Click on the `...` menu and select **Install from VSIX...**.

### 3. Installing on AI Forks (Antigravity, Cursor, Windsurf)

The extension is fully compatible with modern forks running Engine `^1.90.0`. To install on these IDEs, follow the same "Install from VSIX" step described above.

### 4. The Open VSX Dependency

**Crucial Note:** This extension relies on the `redhat.vscode-yaml` dependency. Because the extension uses this language server, forks that do not connect to the Microsoft Marketplace must resolve this dependency via the Open VSX Registry.
