import { describe, it, expect, vi } from 'vitest';
import { fetchTopologySchema } from '../extension/network/edgeClient';

describe('edgeClient', () => {
    it('returns schema string on successful HTTP 200 response', async () => {
        const expectedSchema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "CoReason Topology Manifest",
            "$defs": {},
            "anyOf": [
                { "$ref": "swarm" },
                { "$ref": "dag" }
            ]
        };
        const mockFetch = vi.fn().mockImplementation(async (url: string) => {
            if (url.endsWith('/swarm')) {
                return { ok: true, json: async () => ({ $defs: {}, $ref: "swarm" }) };
            }
            if (url.endsWith('/dag')) {
                return { ok: true, json: async () => ({ $defs: {}, $ref: "dag" }) };
            }
            return { ok: true, json: async () => ({}) };
        });
        vi.stubGlobal('fetch', mockFetch);

        const result = await fetchTopologySchema();
        expect(result).toBe(JSON.stringify(expectedSchema));

        vi.unstubAllGlobals();
    });

    it('returns null on ECONNREFUSED or other errors', async () => {
        const fakeError = new Error('ECONNREFUSED');
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(fakeError));

        const result = await fetchTopologySchema();
        expect(result).toBeNull();

        vi.unstubAllGlobals();
    });
});
