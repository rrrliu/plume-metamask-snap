import {
  BIP44CoinTypeNode,
  getBIP44AddressKeyDeriver,
} from '@metamask/key-tree';
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { computeAllInputs } from 'plume-sig';
import SHA3 from 'sha3';
import { Buffer } from 'buffer';

const sha256 = (msg: string) => {
  const hash = new SHA3(256);
  hash.update(msg);
  return hash.digest();
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const entropy = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 3,
    },
  });
  const deriveEthAddress = await getBIP44AddressKeyDeriver(
    entropy as BIP44CoinTypeNode,
  );
  const addressKey0 = await deriveEthAddress(0);
  const secretKey = sha256(addressKey0.toString());
  const secretKeyHex = secretKey.toString('hex');

  const inputs = await computeAllInputs('this is a message', secretKeyHex);

  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('Here is the Plume below, in hex.'),
            text(inputs.plume.toHex()),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
