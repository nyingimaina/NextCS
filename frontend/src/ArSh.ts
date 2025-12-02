export default class ArSh {
  /**
   * Retrieves a single matching item from an array, throwing an error if the array is empty or no match is found.
   *
   * @template T - The type of elements in the array.
   * @param {T[]} arr - The array to search within.
   * @param {(a: T) => boolean} matcher - A function that determines if an item matches the desired criteria.
   * @param {() => void} [onNotFound] - Optional. A callback function that is invoked if no match is found.
   * @returns {T} The matching item.
   * @throws {Error} If the array is empty or no match is found.
   * @throws {Error} If there are multiple matches.
   */
  static getSingle<T>(
    arr: T[],
    matcher: (a: T) => boolean,
    onNotFound?: () => void
  ): T {
    if (this.isEmpty(arr)) {
      throw new Error("Array is empty");
    }
    const matches = arr.filter(matcher);

    if (matches.length === 0) {
      if (onNotFound) {
        onNotFound();
      } else {
        throw new Error("Item not found");
      }
    } else if (matches.length > 1) {
      throw new Error("Multiple matching items found");
    }

    return matches[0];
  }

  /**
   * Retrieves the first matching item from an array, optionally sorting the array first.
   *
   * @template T - The type of elements in the array.
   * @param {Object} args - The arguments object.
   * @param {T[]} args.arr - The array to search within.
   * @param {(a: T, b: T) => number} [args.sorter] - Optional. A comparator function to sort the array before searching.
   * @param {(a: T) => boolean} args.matcher - A function that determines if an item matches the desired criteria.
   * @param {() => T} [args.onNotFound] - Optional. A callback function that returns a fallback value if no match is found.
   * @returns {T} The first matching item from the (optionally sorted) array.
   * @throws {Error} If no match is found and no `onNotFound` function is provided.
   */
  static getFirst<T>(args: {
    arr: T[];
    sorter?: (a: T, b: T) => number; // Optional sorter
    matcher: (a: T) => boolean;
    onNotFound?: () => T;
  }): T {
    const { arr, sorter, matcher, onNotFound } = args;

    // Sort only if a sorter function is provided
    const sortedArr = sorter ? [...arr].sort(sorter) : arr;

    // Find the first matching item in the (possibly sorted) array
    const found = sortedArr.find(matcher);
    if (found) return found;

    // Handle case where no match is found
    if (onNotFound) return onNotFound();
    throw new Error("Item not found");
  }

  /**
   * Retrieves all unique items from an array based on a custom matcher function.
   *
   * @template T - The type of elements in the array.
   * @param {T[]} arr - The array to retrieve unique items from.
   * @param {(a: T, b: T) => boolean} matcher - A function to compare two items for uniqueness.
   * @returns {T[]} An array of unique items.
   */
  static getUnique<T>(arr: T[], matcher: (a: T, b: T) => boolean): T[] {
    const result: T[] = [];

    // Function to check if an item is in the result array based on the matcher
    function isInResult(item: T): boolean {
      return result.some((resultItem) => matcher(item, resultItem));
    }

    // Add unique items from the array
    arr.forEach((item) => {
      if (!isInResult(item)) {
        result.push(item);
      }
    });

    return result;
  }

  /**
   * Retrieves items from one array that are not present in another array based on a custom matcher function.
   *
   * @template T - The type of elements in the arrays.
   * @param {T[]} arr1 - The first array to compare.
   * @param {T[]} arr2 - The second array to compare.
   * @param {(a: T, b: T) => boolean} matcher - A function to compare two items for equality.
   * @returns {T[]} An array of items from `arr1` that are not in `arr2`.
   */
  static getAllExcept<T>(
    arr1: T[],
    arr2: T[],
    matcher: (a: T, b: T) => boolean
  ): T[] {
    if (this.isEmpty(arr1)) return arr2;
    if (this.isEmpty(arr2)) return arr1;
    const result = arr1.filter((x) => !arr2.some((y) => matcher(x, y)));
    return result;
  }

  /**
   * Checks if an array is empty (either null, undefined, or an empty array).
   *
   * @param {any} obj - The object to check.
   * @returns {boolean} True if the array is empty or not an array, false otherwise.
   */
  static isEmpty(obj: any): boolean {
    return !obj || !Array.isArray(obj) || obj.length === 0;
  }

  /**
   * Checks if an array is not empty.
   *
   * @param {any} obj - The object to check.
   * @returns {boolean} True if the array is not empty, false otherwise.
   */
  static isNotEmpty(obj: any): boolean {
    return !this.isEmpty(obj);
  }

  /**
   * Retrieves unique items from the second array that are not present in the first array, based on a custom matcher function.
   *
   * @template T - The type of elements in the arrays.
   * @param {T[]} arr1 - The first array to compare.
   * @param {T[]} arr2 - The second array to compare.
   * @param {(a: T, b: T) => boolean} matcher - A function to compare two items for equality.
   * @returns {T[]} An array of unique items from `arr2` that are not in `arr1`.
   */
  static unique<T>(
    arr1: T[],
    arr2: T[],
    matcher: (a: T, b: T) => boolean
  ): T[] {
    if (this.isEmpty(arr1)) return arr2;
    if (this.isEmpty(arr2)) return arr1;
    const result = arr2.filter((x) => !arr1.some((y) => matcher(x, y)));
    return result;
  }

  /**
   * Upserts (adds or updates) an item in an array based on a custom matcher function.
   *
   * @template T - The type of elements in the array.
   * @param {Object} args - The arguments object.
   * @param {T[]} args.arr - The array to modify.
   * @param {T} args.item - The items to add or update in the array.
   * @param {(a: T, b: T) => boolean} args.matcher - A function to compare items for equality.
   * @param {() => void} [args.onCompletion] - Optional. A callback function to invoke after the operation is complete.
   */
  static upsertMany<T>(args: {
    arr: T[];
    items: T[];
    matcher: (a: T, b: T) => boolean;
    onCompletion?: () => void;
  }) {
    if (this.isEmpty(args.items)) return;
    for (const item of args.items) {
      this.upsertItem({
        arr: args.arr,
        item,
        matcher: args.matcher,
        onCompletion: args.onCompletion,
      });
    }
  }

  /**
   * Upserts (adds or updates) an item in an array based on a custom matcher function.
   *
   * @template T - The type of elements in the array.
   * @param {Object} args - The arguments object.
   * @param {T[]} args.arr - The array to modify.
   * @param {T} args.item - The item to add or update in the array.
   * @param {(a: T, b: T) => boolean} args.matcher - A function to compare items for equality.
   * @param {() => void} [args.onCompletion] - Optional. A callback function to invoke after the operation is complete.
   */
  static upsertItem<T>(args: {
    arr: T[];
    item: T;
    matcher: (a: T, b: T) => boolean;
    onCompletion?: () => void;
  }) {
    try {
      if (!Array.isArray(args.arr)) {
        return;
      } else {
        const target = args.arr.find((a) => args.matcher(a, args.item));
        if (target) {
          const indexOfTarget = args.arr.indexOf(target);
          args.arr[indexOfTarget] = args.item;
        } else {
          args.arr.unshift(args.item); // Added `unshift` for adding at the start
        }
      }
    } finally {
      if (args.onCompletion) {
        args.onCompletion();
      }
    }
  }

  /**
   * Removes an item from an array based on a custom matcher function.
   *
   * @template T - The type of elements in the array.
   * @param {Object} args - The arguments object.
   * @param {T[]} args.arr - The array to modify.
   * @param {T} args.item - The item to remove from the array.
   * @param {(a: T, b: T) => boolean} args.matcher - A function to compare items for equality.
   * @param {() => void} [args.onCompletion] - Optional. A callback function to invoke after the operation is complete.
   */
  static removeItem<T>(args: {
    arr: T[];
    item: T;
    matcher: (a: T, b: T) => boolean;
    onCompletion?: () => void;
  }) {
    try {
      if (!Array.isArray(args.arr)) {
        return;
      } else {
        const index = args.arr.findIndex((a) => args.matcher(a, args.item));
        if (index !== -1) {
          args.arr.splice(index, 1);
        }
      }
    } finally {
      if (args.onCompletion) {
        args.onCompletion();
      }
    }
  }
}
