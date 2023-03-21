/**
 * Returns the abbreviated representation of the Ethereum keccak address, e.g. 0xabc...123.
 *
 * @param address - The full-length Ethereum address.
 * @returns Abbreviated string.
 */
export function abbreviateEthereumAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(address.length - 3)}`;
}
