import { Transform } from "stream";
/**
 * This class creates a transform that flushes the streamed data only
 * after the passed promise is resolved.
 * If the promise rejects an error is thrown and stream destroyed and
 * the last chunk of data is not passed downstream.
 * it is used to prevent streaming the very last chunk of data downstream if the
 * antivirus promise rejects detecting infected data stream.
 */
class PromiseTransform<T> extends Transform {
  private promise: Promise<T>;
  private lastChunk: Buffer | undefined;

  constructor(promise: Promise<T>, options = {}) {
    super(options);
    this.promise = promise;
  }

  _transform(chunk: Buffer, encoding: string, callback: () => void) {
    if (this.lastChunk) {
      this.push(this.lastChunk);
    }
    this.lastChunk = chunk;
    callback();
  }

  _flush(callback: (err?: Error) => void) {
    this.promise
      .then(() => {
        this.push(this.lastChunk);
        callback();
      })
      .catch(callback);
  }
}

export default PromiseTransform;
