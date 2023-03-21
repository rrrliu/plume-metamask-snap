import {
  BIP44CoinTypeNode,
  getBIP44AddressKeyDeriver,
} from '@metamask/key-tree';
import {
  Json,
  JsonRpcRequest,
  OnRpcRequestHandler,
} from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { computeAllInputs } from 'plume-sig';
import SHA3 from 'sha3';
import { abbreviateEthereumAddress } from './utils';

const sha256 = (msg: string) => {
  const hash = new SHA3(256);
  hash.update(msg);
  return hash.digest();
};

const getMessageFromRequest = (
  request: JsonRpcRequest<Json[] | Record<string, Json>>,
) => {
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
};

// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
const ETHEREUM_BIP44_COINTYPE = 60;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
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

  const message = getMessageFromRequest(request);
  const { plume, s, c, gPowR, hashMPKPowR } = await computeAllInputs(
    message,
    secretKeyHex,
  );

  switch (request.method) {
    case 'hello':
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
    default:
      throw new Error('Method not found.');
  }
};
