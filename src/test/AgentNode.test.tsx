import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { AgentNode, AgentNodeData } from '../webview/components/AgentNode';
import React from 'react';

describe('AgentNode', () => {
    it('renders the label ResearchAgent', () => {
        const mockData: AgentNodeData = {
            label: 'ResearchAgent',
            status: 'idle',
            tokens: 'Thinking...',
        };

        render(
            <ReactFlowProvider>
                <AgentNode data={mockData} />
            </ReactFlowProvider>
        );

        expect(screen.getByText('ResearchAgent')).toBeInTheDocument();
        expect(screen.queryByText('Thinking...')).toBeNull();
    });

    it('renders the tokens when status is running', () => {
        const mockData: AgentNodeData = {
            label: 'ResearchAgent2',
            status: 'running',
            tokens: 'Thinking...',
        };

        render(
            <ReactFlowProvider>
                <AgentNode data={mockData} />
            </ReactFlowProvider>
        );

        expect(screen.getByText('ResearchAgent2')).toBeInTheDocument();
        expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });
});
