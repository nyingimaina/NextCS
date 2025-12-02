export default class AsyncProxy {
  private onProxyingChanged: (busy: boolean) => void;
  constructor(onProxyingChanged: (busy: boolean) => void) {
    this.onProxyingChanged = onProxyingChanged;
  }
  public async runAsync<T>(fn: () => Promise<T>): Promise<T> {
    try {
      this.onProxyingChanged(true);
      return await fn();
    } finally {
      this.onProxyingChanged(false);
    }
  }
}
