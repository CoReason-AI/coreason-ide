import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, Node, Edge, Panel, applyNodeChanges, applyEdgeChanges, addEdge, Connection, EdgeChange, NodeChange } from '@xyflow/react';
// @ts-ignore
import '@xyflow/react/dist/style.css';
import { AgentNode } from './AgentNode';
import YAML from 'yaml';
// @ts-ignore
import ELK from 'elkjs/lib/elk.bundled.js';

import { vscodeApi } from '../vscodeApi';

export const TDACanvas = () => {
    const [rawDoc, setRawDoc] = useState<string>('');
    const [nodes, setNodes] = useState<Node[]>([{
        id: 'debug-init',
        position: { x: 50, y: 50 },
        data: { label: 'Awaiting Extension Telemetry...' },
        type: 'agent'
    }]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const elk = useMemo(() => new ELK(), []);
    const nodeTypes = useMemo(() => ({ agent: AgentNode }), []);

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    
    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge({ ...connection, id: `e-${Date.now()}` }, eds));
        
        try {
            const yamlData = YAML.parse(rawDoc);
            if (!yamlData.edges) yamlData.edges = [];
            
            yamlData.edges.push([connection.source, connection.target]);
            
            const isJson = rawDoc.trim().startsWith('{');
            const newDoc = isJson ? JSON.stringify(yamlData, null, 2) : YAML.stringify(yamlData);
            
            setRawDoc(newDoc);
            vscodeApi.postMessage({ type: 'WRITE_DOCUMENT', payload: newDoc });
        } catch (e: any) {
            console.error("Failed to serialize edge creation:", e);
        }
    }, [rawDoc]);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'YAML_UPDATE') {
                try {
                    const yamlString = message.payload;
                    if (!yamlString) return;
                    setRawDoc(yamlString);

                    const yamlData = YAML.parse(yamlString);
                    if (!yamlData || !yamlData.nodes) return;

                    const elkNodes: any[] = [];
                    const elkEdges: any[] = [];

                    if (typeof yamlData.nodes === 'object') {
                        for (const key of Object.keys(yamlData.nodes)) {
                            elkNodes.push({ id: key, width: 250, height: 100 });
                        }
                    }

                    if (Array.isArray(yamlData.edges)) {
                        yamlData.edges.forEach((edge: any, index: number) => {
                            if (Array.isArray(edge) && edge.length >= 2) {
                                elkEdges.push({ id: `e-${index}`, sources: [edge[0]], targets: [edge[1]] });
                            } else if (edge.source && edge.target) {
                                elkEdges.push({ id: edge.id || `e-${index}`, sources: [edge.source], targets: [edge.target] });
                            }
                        });
                    }

                    const graph = {
                        id: 'root',
                        layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT' },
                        children: elkNodes,
                        edges: elkEdges,
                    };

                    const layoutedGraph = await elk.layout(graph);

                    const reactFlowNodes = (layoutedGraph.children || []).map((node: any) => ({
                        id: node.id,
                        position: { x: node.x || 0, y: node.y || 0 },
                        data: { label: node.id },
                        type: 'agent',
                    }));

                    const reactFlowEdges = (layoutedGraph.edges || []).map((edge: any) => ({
                        id: edge.id,
                        source: edge.sources[0],
                        target: edge.targets[0],
                    }));

                    setNodes(reactFlowNodes);
                    setEdges(reactFlowEdges);
                } catch (e: any) {
                    console.error("Main Thread ELK Error:", e);
                    setNodes([{ id: 'error', position: {x:50, y:50}, data: {label: `ELK Error: ${e.message}`}, type: 'agent' }]);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [elk]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                nodeTypes={nodeTypes} 
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView 
                colorMode="dark"
            >
                <Panel position="top-right">
                    <button
                        onClick={() => vscodeApi.postMessage({ type: 'REQUEST_SYNTHESIS' })}
                        style={{
                            background: 'var(--vscode-button-background)',
                            color: 'var(--vscode-button-foreground)',
                            border: 'none',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            borderRadius: '2px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        ✨ Synthesize Next Agent
                    </button>
                </Panel>
                <Panel position="top-left">
                    <button
                        onClick={() => vscodeApi.postMessage({ type: 'READY' })}
                        style={{
                            background: 'var(--vscode-button-secondaryBackground)',
                            color: 'var(--vscode-button-secondaryForeground)',
                            border: '1px solid var(--vscode-button-border, transparent)',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderRadius: '2px'
                        }}
                    >
                        🔄 Force Refresh Topology
                    </button>
                </Panel>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};