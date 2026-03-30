import * as vscode from 'vscode';
import { SandboxReceipt } from '../../shared/types';

let outputChannel: vscode.OutputChannel | undefined;

export async function fetchTopologySchema(): Promise<string | null> {
    const port = vscode.workspace.getConfiguration('coreason.telemetry').get('meshPort') || 8000;
    try {
        const [swarmRes, dagRes] = await Promise.all([
            fetch(`http://localhost:${port}/api/v1/schema/topology/swarm`),
            fetch(`http://localhost:${port}/api/v1/schema/topology/dag`)
        ]);
        
        if (!swarmRes.ok || !dagRes.ok) {
            throw new Error(`HTTP error! statuses: swarm=${swarmRes.status}, dag=${dagRes.status}`);
        }
        
        const swarmSchema = await swarmRes.json();
        const dagSchema = await dagRes.json();

        // Merge $defs (or definitions) from both schemas into the root so $refs can resolve
        const defs = {
            ...(swarmSchema.$defs || {}),
            ...(dagSchema.$defs || {})
        };

        const combined = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "CoReason Topology Manifest",
            "$defs": defs,
            "anyOf": [
                { "$ref": swarmSchema.$ref },
                { "$ref": dagSchema.$ref }
            ]
        };
        
        return JSON.stringify(combined);
    } catch (error) {
        // Create or reuse an output channel
        if (!outputChannel) {
            outputChannel = vscode.window.createOutputChannel('CoReason');
        }
        outputChannel.appendLine(`[Warning] Failed to fetch topology schema from Epistemic Edge: ${error}`);
        return null;
    }
}

export async function executeSandbox(toolName: string, intent: any): Promise<SandboxReceipt> {
    const port = vscode.workspace.getConfiguration('coreason.telemetry').get('meshPort') || 8000;
    try {
        const payload = {
            jsonrpc: "2.0",
            method: "mcp.ui.emit_intent",
            params: {
                intent: intent.intent,
                state: intent.state
            },
            id: `forge-${Date.now()}`
        };

        const response = await fetch(`http://localhost:${port}/api/v1/sandbox/execute?tool_name=${encodeURIComponent(toolName)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as SandboxReceipt;
    } catch (error: any) {
        if (!outputChannel) {
            outputChannel = vscode.window.createOutputChannel('CoReason');
        }
        outputChannel.appendLine(`[Error] Failed to execute capability ${toolName} on Epistemic Edge: ${error}`);
        return {
            intent_hash: 'error_hash',
            success: false,
            error: error.message || String(error)
        };
    }
}

export async function resumeOracleWorkflow(workflowId: string, correctedIntent: string): Promise<boolean> {
    const port = vscode.workspace.getConfiguration('coreason.telemetry').get('meshPort') || 8000;
    try {
        const payload = {
            corrected_intent: JSON.parse(correctedIntent)
        };

        const response = await fetch(`http://localhost:${port}/api/v1/oracle/resume/${workflowId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error: any) {
        if (!outputChannel) {
            outputChannel = vscode.window.createOutputChannel('CoReason');
        }
        outputChannel.appendLine(`[Error] Failed to resume oracle workflow ${workflowId} on Epistemic Edge: ${error}`);
        return false;
    }
}
