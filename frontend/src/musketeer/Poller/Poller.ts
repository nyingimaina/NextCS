type DeltaCheckArgs<T> = {
  previousResult?: T | null;
  currentResult: T;
};

export default class Poller<T> {
  private readonly baseIntervalMs: number;
  private readonly maxIntervalMs: number;
  private readonly backoffStepMs: number;
  private readonly func: () => Promise<T>;
  private readonly hasDelta: (args: DeltaCheckArgs<T>) => boolean;
  private readonly onResult?: (result: T) => void | Promise<void>;
  private readonly onError?: (error: unknown) => void;

  private currentInterval: number;
  private noDeltaCount = 0;
  private isRunning = false;
  private isCancelled = false;
  private timeoutId: number | null = null;

  private lastPollTime: Date | null = null;
  private nextPollTime: Date | null = null;
  private previousResult: T | null = null;

  constructor(args: {
    pollIntervalMilliseconds?: number;
    maxIntervalMilliseconds?: number;
    func: () => Promise<T>;
    hasDelta?: (args: DeltaCheckArgs<T>) => boolean;
    onResult?: (result: T) => void | Promise<void>;
    onError?: (error: unknown) => void;
  }) {
    this.baseIntervalMs = args.pollIntervalMilliseconds ?? 5000;
    this.maxIntervalMs = args.maxIntervalMilliseconds ?? 60000;

    const backoffTargetMs = 60 * 60 * 1000; // 60 minutes
    const averageInterval = (this.baseIntervalMs + this.maxIntervalMs) / 2;
    const estimatedSteps = Math.ceil(backoffTargetMs / averageInterval);
    this.backoffStepMs =
      (this.maxIntervalMs - this.baseIntervalMs) / estimatedSteps;

    this.currentInterval = this.baseIntervalMs;
    this.func = args.func;
    this.hasDelta = args.hasDelta ?? Poller.defaultHasDelta;
    this.onResult = args.onResult;
    this.onError = args.onError;
  }

  private static defaultHasDelta<U>({
    previousResult,
    currentResult,
  }: DeltaCheckArgs<U>): boolean {
    return JSON.stringify(previousResult) !== JSON.stringify(currentResult);
  }

  public start(): void {
    if (this.timeoutId !== null || this.isRunning) return;
    this.isCancelled = false;
    this.pollLoop();
  }

  public stop(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isCancelled = true;
  }

  public resume(): void {
    if (this.isRunning || this.timeoutId !== null) return;
    this.isCancelled = false;
    this.start();
  }

  public reset(): void {
    this.noDeltaCount = 0;
    this.currentInterval = this.baseIntervalMs;
  }

  public get state(): {
    isRunning: boolean;
    isCancelled: boolean;
    currentInterval: number;
    baseInterval: number;
    maxInterval: number;
    lastPollTime: Date | null;
    nextPollTime: Date | null;
    noDeltaCount: number;
    previousResult: T | null;
  } {
    return {
      isRunning: this.isRunning,
      isCancelled: this.isCancelled,
      currentInterval: this.currentInterval,
      baseInterval: this.baseIntervalMs,
      maxInterval: this.maxIntervalMs,
      lastPollTime: this.lastPollTime,
      nextPollTime: this.nextPollTime,
      noDeltaCount: this.noDeltaCount,
      previousResult: this.previousResult,
    };
  }

  private async pollLoop(): Promise<void> {
    if (this.isCancelled) return;

    if (this.isRunning) {
      this.scheduleNext();
      return;
    }

    this.isRunning = true;
    this.lastPollTime = new Date();

    try {
      const result: T = await this.func();
      const deltaDetected: boolean = this.hasDelta({
        previousResult: this.previousResult,
        currentResult: result,
      });

      this.previousResult = result;

      if (deltaDetected) {
        this.reset();
      } else {
        this.noDeltaCount++;
        this.currentInterval = Math.min(
          this.baseIntervalMs + this.backoffStepMs * this.noDeltaCount,
          this.maxIntervalMs
        );
      }

      await this.onResult?.(result);
    } catch (err: unknown) {
      if (this.onError) {
        this.onError(err);
      } else {
        console.error("Polling error:", err);
      }
    } finally {
      this.isRunning = false;
      this.scheduleNext();
    }
  }

  private scheduleNext(): void {
    if (this.isCancelled) return;

    this.nextPollTime = new Date(Date.now() + this.currentInterval);
    this.timeoutId = window.setTimeout(
      () => this.pollLoop(),
      this.currentInterval
    );
  }
}
