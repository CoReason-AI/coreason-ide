import * as vscode from 'vscode';
import { SandboxReceipt } from '../../shared/types';

let outputChannel: vscode.OutputChannel | undefined;

export async function fetchTopologySchema(): Promise<string | null> {
    try {
        const response = await fetch('http://localhost:8000/api/v1/schema/topology/swarm');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
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
    try {
        const payload = {
            intent: intent.intent,
            state: intent.state
        };

        const response = await fetch('http://localhost:8000/api/v1/sandbox/execute', {
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
