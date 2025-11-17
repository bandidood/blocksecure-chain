import { scanContract, getContractSafety, getContractVulnerabilities } from '../services/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scanContract', () => {
    it('should scan contract successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          vulnerabilities: [],
          summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0, informational: 0 }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await scanContract('path/to/contract.sol', '0xABC123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audits/scan'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractPath: 'path/to/contract.sol',
            contractAddress: '0xABC123'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle scan errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(scanContract('path/to/contract.sol')).rejects.toThrow(
        'Failed to scan contract: Internal Server Error'
      );
    });
  });

  describe('getContractSafety', () => {
    it('should check contract safety', async () => {
      const mockResponse = {
        success: true,
        data: { isSafe: true }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getContractSafety('0xABC123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contracts/0xABC123/safe')
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getContractVulnerabilities', () => {
    it('should get contract vulnerabilities', async () => {
      const mockResponse = {
        success: true,
        data: {
          vulnerabilities: [
            { type: 'REENTRANCY', severity: 'CRITICAL', description: 'Test vulnerability' }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getContractVulnerabilities('0xABC123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contracts/0xABC123/vulnerabilities')
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
