import React from 'react';
import { Handle, Position } from '@xyflow/react';

export interface AgentNodeData {
    label: string;
    status: string;
    tokens: string;
}

export interface AgentNodeProps {
    data: AgentNodeData;
}

export const AgentNode: React.FC<AgentNodeProps> = ({ data }) => {
    return (
        <div style={{ background: '#252526', border: '1px solid #3c3c3c', borderRadius: '4px', padding: '10px', color: '#d4d4d4', minWidth: '150px', textAlign: 'center' }}>
            <Handle type="target" position={Position.Top} />
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.label}</div>
            {data.status === 'running' && (
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#9cdcfe' }}>{data.tokens}</div>
            )}
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};
