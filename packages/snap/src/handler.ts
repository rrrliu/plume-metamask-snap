import {
  BIP44CoinTypeNode,
  getBIP44AddressKeyDeriver,
} from '@metamask/key-tree';
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { computeAllInputs } from 'plume-sig';
import {
  abbreviateEthereumAddress,
  ETHEREUM_BIP44_COINTYPE,
  getPlumeMessageFromRequest,
  sha256,
} from './utils';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  if (request.method !== 'plume') {
    throw new Error('Method not found.');
  }

  const entropy = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: ETHEREUM_BIP44_COINTYPE,
    },
  });
  const deriveEthAddress = await getBIP44AddressKeyDeriver(
    entropy as BIP44CoinTypeNode,
  );
  const addressKey0 = await deriveEthAddress(0);
  const secretKey = sha256(addressKey0.toString());
  const secretKeyHex = secretKey.toString('hex');

  const message = getPlumeMessageFromRequest(request);
  const { plume, s, c, gPowR, hashMPKPowR } = await computeAllInputs(
    message,
    secretKeyHex,
  );

  return snap.request({
    method: 'snap_dialog',
    params: {
      type: 'Alert',
      content: panel([
        heading('Results'),
        text(
          `Plume ${
            message ? `for "${message}", ` : ''
          }signed by ${abbreviateEthereumAddress(addressKey0.address)}:`,
        ),
        copyable(plume.toHex()),
        divider(),
        text('Other inputs for proof:'),
        copyable(
          JSON.stringify({
            s,
            c,
            g__pow_r: gPowR.toHex(),
            hash_m_pk__pow_r: hashMPKPowR.toHex(),
          }),
        ),
      ]),
    },
  });
};
