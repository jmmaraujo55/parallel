import { setTimeout } from "timers/promises";

interface IOptions {
  parallelExecutions?: number;
  uniqueKeyPath?: string;
  filterDuplicates?: boolean;
  interval?: number;
  force?: boolean;
}

function validateArguments(array, options, callback) {
  if (!array || !Array.isArray(array)) {
    throw new Error("Error trying to execute parallel: First argument must be an array");
  }

  if (!callback || typeof callback !== "function") {
    throw new Error(
      "Error trying to execute parallel: Second argument must be an callback function",
    );
  }

  if (!options || typeof options !== "object") {
    throw new Error("Error trying to execute parallel: Third argument must be an object");
  }
}

function validateOptions(options, array: any[]) {
  if (options.parallelExecutions && options.parallelExecutions > 1000) {
    if (!options.force)
      throw new Error(
        "Error trying to execute parallel: The maximum value for parallel runs is 1000. If you want to force it, set the force option to true.",
      );
  }

  if (
    options.uniqueKeyPath &&
    !array.every((element: Array<any>) => !!element.find((item) => item === options.uniqueKeyPath))
  ) {
    throw new Error(
      "Error trying to execute parallel: The sent array has elements without the unique key.",
    );
  }

  if (options.filterDuplicates && !options.uniqueKeyPath) {
    throw new Error(
      "Error trying to execute parallel: It is not possible to filter duplicate elements without the uniqueKeyPath option",
    );
  }
}

async function execParallel(array: Array<unknown>, options, callback) {
  do {
    const promises = [];
    for (const chunk of array.splice(0, options.parallelExecutions))
      promises.push(callback(chunk, options.uniqueKey));
    await Promise.allSettled(promises);
    if (array.length) await setTimeout(options.interval);
  } while (array.length);
}

/**
 *
 * @param {Array<any>} _array
 * @param {Function} callback
 * @param {IOptions} options
 * @returns
 */
export default function parallelController(
  _array: any[],
  // eslint-disable-next-line no-unused-vars
  callback: (...args: any[]) => void,
  options: IOptions,
) {
  let array = JSON.parse(JSON.stringify(_array));

  validateArguments(array, options, callback);
  validateOptions(options, array);

  if (options.filterDuplicates) {
    array = [...new Set(array)];
  }

  return execParallel(array, options, callback);
}
