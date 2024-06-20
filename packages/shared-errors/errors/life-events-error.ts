export class LifeEventsError extends Error {
  // Used to identify the error using a numeric way
  // Mainly useful for managing http errors
  readonly errorCode: number = 500;

  // used to explain which is the process from which this error
  // has been raised. We are importing a file and the file size
  // exceeds the maximum one. We will raise
  // new LifeEventsError("IMPORT_FILE", "File size exceeded")
  errorProcess: string;

  constructor(errorProcess: string, message: string) {
    super(message);
    this.errorProcess = errorProcess;
    this.name = "LIFE_EVENTS_ERROR";
  }
}

export const isLifeEventsError = (error: unknown): error is LifeEventsError => {
  return (
    typeof error === "object" &&
    (error as LifeEventsError).errorProcess !== undefined
  );
};
