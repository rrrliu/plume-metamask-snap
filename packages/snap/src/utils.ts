import SHA3 from 'sha3';
import { Json, JsonRpcRequest } from '@metamask/snaps-types';

/**
 * Returns the abbreviated representation of the Ethereum keccak address, e.g. 0xabc...123.
 *
 * @param address - The full-length Ethereum address.
 * @returns Abbreviated string.
 */
export function abbreviateEthereumAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(address.length - 3)}`;
}

/**
 * Returns the SHA-256 hash on the given input.
 *
 * @param msg - The input message.
 * @returns The SHA-256 digest of the message.
 */
export function sha256(msg: string) {
  const hash = new SHA3(256);
  hash.update(msg);
  return hash.digest();
}

/**
 * Given a JSON-RPC Plume request, get the message param.
 *
 * @param request - A 'plume' request.
 * @returns The message param.
 */
export function getPlumeMessageFromRequest(
  request: JsonRpcRequest<Json[] | Record<string, Json>>,
) {
  if (!request.params) {
    throw new Error('Plume: missing request.params');
  }

  if (request.params instanceof Array) {
    throw new Error('Plume: request.params must be an object');
  }

  const { message } = request.params;
  if (typeof message !== 'string') {
    throw new Error(
      'Plume: request.params.message must be defined and a string',
    );
  }

  return message;
}

// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
export const ETHEREUM_BIP44_COINTYPE = 60;
