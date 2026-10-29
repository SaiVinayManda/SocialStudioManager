import { requireThat, verifyIngressEnvelope } from './contracts.mjs';

/** No listener or Telegram client: a proposed deterministic Hermes IPC boundary. */
export class HermesBridge {
  #key;
  constructor({ supervisor, key, clock = () => Date.now() }) {
    requireThat(Buffer.isBuffer(key) && key.length >= 32, 'BRIDGE_KEY');
    this.#key = Buffer.from(key); this.supervisor = supervisor; this.clock = clock;
  }
  async receive(envelope) {
    try {
      const originalUpdate = verifyIngressEnvelope(envelope, this.#key, this.clock());
      return await this.supervisor.handleTelegram(originalUpdate);
    } catch (error) {
      if (['BAD_SIGNATURE', 'STALE_ENVELOPE', 'INVALID_FIELDS', 'INVALID_TEXT', 'INVALID_INTEGER'].includes(error.code)) return { accepted: false, code: error.code };
      if (error instanceof SyntaxError) return { accepted: false, code: 'INVALID_UPDATE_JSON' };
      throw error;
    }
  }
}
