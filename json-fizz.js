'strict'

/**
 * @author: Pankaj Saini (pank3992@gmail.com)
 * @module:
 * Provides basic functionality to serialize and deserialize JSON
 * with choice of separators and brackets
 *
 * @syntax: ES6
 * It can be easily converted to ES5 syntax depending on the requirement
 *
 */


/**
 * JSONFizz - Able to serialize and deserialize JSON data
 *    1. Separators and Delimiters used here are different from the that of Native JSON Library
 *    2. However they can be easily modified by simply updating separator and brackets properties
 *
 * Idea behind the choice of syntax used:
 *      I tried to write code in a very generic manner, where the things can be tweaked very easily,
 *      so this helped me try out different combinations of separators and brackets.
 *
 *      Below mentioned are the ones which I found to least confusing after getting habitual with
 *      native JSON format, also the character like %, &, =, + etc. which are used in query string
 *      parameter are ignored
 *
 *      Separators:
 *            Keys {underscore} '_',  Values {Semicolon} ';'
 *              Preferred _ or - since it can be confusing if it is followed by a position number
 *      Brackets:
 *            String: open {back-tick} '`', close: {back-tick} '`'
 *            Array: open {Less-than} '<', close: {Greater-than} '>'
 *            Object: open {open round bracket} '(', close: {close round bracket} ')'
 *
 *
 * Guide to use JSONFizz:
 *      json = new JSONFizz()
 *      json.
 *         stringify - It takes JS obj as a parameter and return the serialized data
 *         parse - It takes serialized string as a parameter and returns JS object
 *
 *         encoder/decoder.
 *            addHook - 1. It takes function as a parameter
 *                      2. Function receives key and value and returns updated value
 *                      3. Multiple hooks can be added by calling it again
 *                         (Each function will be in the same order in which they have been added)
 *            removeHook - It takes function a parameter and removes that particular function from hooks
 *            resetHooks - Removes all the hooks
 *
 */
class JSONFizz {
  constructor () {

    let separators = {
      value: ';',
      key: '_'
    };

    let brackets = {
      string: {open: '`',close: '`'},
      array: {open: '<', close: '>'},
      object: {open: '(', close: ')'}
    };

    this.encoder = new JSONEncoder(separators, brackets);
    this.decoder = new JSONDecoder(separators, brackets);
  }

  stringify (obj) {
    return this.encoder.encode(obj);
  }

  parse (str) {
    return this.decoder.decode(str);
  }
}


/**
 * JsonFizzException- Exception builder Class
 * 
 * @params {String} message - Error Message
 * @params {  any } detail  - Error Details
 */
class JsonFizzException {
  constructor (message, details) {
    this.message = message;
    if (details) {
      this.details = details;
    }
  }
}

/**
 * JSONEncoder- Serializes the JSON data
 * 
 * @params {Object} separator - serializer separator options:
 *      {String} value - Separator for Array values of Object Values (Default ','),
 *      {String} keys  - Separator for Object keys (Default ':')
 *
 * @params {Object} brackets - Brackets to be used for object distinction:
 *      {Object} string - opening and closing brackets for String
 *              {String} open  - open bracket for String (Default '"'),
 *              {String} close - close bracket for String (Default '"')
 *      {Object} array  - open and close brackets for String
 *              {String} open  - open bracket for String (Default '[')
 *              {String} close - close bracket for String (Default ']')
 *      {Object} object - open and close brackets for String
 *              {String} open  - open bracket for String (Default '{')
 *              {String} close - close bracket for String (Default '}')
 */
class JSONEncoder {
  constructor (separators, brackets) {

    if (!separators) {
      // Default default separators
      this.separators = { value: ',', key: ':' };
    } else {
      // Declare custom separators
      this.separators = separators;
    }

    if (!brackets) {
      // Default default brackets
      this.brackets = {
        string: { open: '"', close: '"' },
        array: { open: '[', close: ']' },
        object: { open: '{', close: '}' }
      }
    } else {
      // Declare custom brackets
      this.brackets = brackets;
    }

    this._hooks = [];  // list of hooks added
  }


  /** 
   * Serializes JSON object
   * 
   * @params {any} obj- JSON object to be serialized
   * @return {String}- Serialized JSON data
   *
  */
  encode (obj) {
    return this._encode(undefined, obj);
  }

  /** 
   * Serializes JSON object, depending on the Object value type
   * In case the return value is undefined, it will be ignored if the parent is Object,
   * else it will return as null (Same is the behaviour of native JSON)
   *
   * @params {String} key - Object key
   * @params {any} value - Object value
   * @return {String, Undefined}- Serialized JSON data
   *
    */
  _encode (key, value) {

    let type;

    value = this._replaceUsingHooks(key, value);
    type = this._getType(value);

    if (
      value['toJSON'] !== undefined &&
      this._getType(value['toJSON']) === 'Function'
    ) {
      // In case the object has toJSON method
      return this._encode(key, value.toJSON());
    } else if (type === 'Function') {
      // If the value if function
      return undefined;
    } else {
      // calls object type corresponding encoder
      return this['encode' + type](value);
    }
  }


  /** 
   * Encodes Number
   * In case the the number is of invalid type (NaN, Infinity), it return 'null',
   * same as the behaviour of JSON.stringify
   * 
   * @params {Number} number - number to encode
   * @return {String} - String representation of number
  */
  encodeNumber (number) {
    // Everything other than real number changed to null (Same behaviour is of JSON.stringify)
    return isFinite(number) ? String(number) : 'null';
  }

  /** 
   * Encodes null type object
   * 
   * @params {null} obj - null
   * @return {String} - String representation of null
  */
  encodeNull (obj) {
    return 'null';
  }

  /** 
   * Encodes string, it handles the escape character
   * It handles the escape characters like ",\,\n,\t,\r,\b,\t
   * In this version only ASCII characters are handled
   *
   * @params {String} str - String to deserialize
   * @return {String} - Serialized string
  */
  encodeString (str) {
    // Matches the escape characters
    let reg = /(["\\\b\f\n\r\t])/g,
    // Escape Characters Mapping
      escape = {
      '"': '\\"',
      '\\': '\\\\',
      '\b': '\\b',
      '\f': '\\f',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t'
    };

    // Replace all the escape characters with corresponding serialized mapping
    str = str.replace(reg, function (match) {
      return escape[match];
    })

    return this.brackets.string.open + str + this.brackets.string.close;
  }

  /** 
   * Encodes Boolean type object
   * 
   * @params {Boolean} bool - Boolean value
   * @return {String} - String representation of Boolean
  */
  encodeBoolean (bool) {
    return bool === true ? 'true' : 'false';
  }

  /** 
   * Encodes Array, by iterating over each element
   * and serializes them
   * 
   * @params {Array} array - Array to be serialized
   * @return {String} - Serialized Array
  */
  encodeArray (array) {
    let encodedData = this.brackets.array.open;

    let i, value;
    for (i = 0; i < array.length; i++) {
      value = this._encode(i, array[i]);

      if (value === undefined) {
        value = this.encodeNull(); // set null if value is undefined
      }

      // Handling first element separately to not add separator in beginning
      encodedData += (i===0) ? value : this.separators.value + value;
    }

    return encodedData + this.brackets.array.close;  // Appending Closing Bracket
  }


  /** 
   * Encodes Object, by iterating over each element
   * 
   * @params {Object} dict - Object to be serialized
   * @return {String} - Serialized Object
  */
  encodeObject (dict) {
    let dictKeys = Object.keys(dict),
      encodedData = this.brackets.object.open;

    let i, key, value;
    for (i = 0; i < dictKeys.length; i++) {

      key = this.encodeString(dictKeys[i]);  // Key can be of only String Type
      value = this._encode(dictKeys[i], dict[dictKeys[i]]);  // Encode object values

      // Skip if the encoded value is undefined (same behaviour of native JSON)
      if (value !== undefined) {
        // Handling first case separately to not add separator in beginning
        if (i===0) {
          encodedData += key + this.separators.key + value;
        } else {
          encodedData += this.separators.value + key + this.separators.key + value;
        }
      }
    }

    return encodedData + this.brackets.object.close;
  }

  /** 
   * Add replacer function to update value before serialization
   * Each function will be passed key and value, and should return updated value
   *
   * @params {Function} hookFunc - Function receives (key, value)
   * @return {Boolean}
   *
  */
  addHook (hookFunc) {
    if (this._getType(hookFunc) !== 'Function') {
      throw new JsonFizzException(
        'Not a valid hook function',
        {function: hookFunc}
      )
    }

    if (this._hooks.indexOf(hookFunc) === -1) {
      // In case the hook function is already added skip it
      this._hooks.push(hookFunc);
      return true;
    }
    return false;
  }

  /** 
   * Remove replacer
   * 
   * @params {Function} hookFunc - Hook Function to remove
   * @return {Boolean} - True if function is in hooks list else False
  */
  removeHook (hookFunc) {
    let index = this._hooks.indexOf(hookFunc)
    if (index === -1) return false;

    this._hooks.splice(index, 1);
    return true;
  }

  /** 
   * Remove all replacers
   * @return {Boolean} - True
  */
  resetHooks () {
    this._hooks = [];
  }


  /** 
   * Updates the value of object using hooks
   * 
   * @params {String} key- key of the value to be replaced
   * @params {any} value- value to be replaced
   * @return {any}- updated value after using replacers/hooks
  */
  _replaceUsingHooks (key, value) {
    for (let hook of this._hooks) {
      value = hook(key, value)
    }

    return value
  }

  /** 
   * Finds type of the object
   * 
   * @params {Object} obj- object
   * @return {String}- type of the object
  */
  _getType (obj) {
    return (obj === undefined)?'Undefined':obj.constructor.name;
  }

}



/**
 * JSONDecoder- Deserializes the JSON data
 * 
 * @params {Object} separator - deserializer separator options:
 *      {String} value - Separator for Array values of Object Values (Default ','),
 *      {String} keys  - Separator for Object keys (Default ':')
 *
 * @params {Object} brackets - Brackets to be used for object distinction:
 *      {Object} string - opening and closing brackets for String
 *              {String} open  - open bracket for String (Default '"'),
 *              {String} close - close bracket for String (Default '"')
 *      {Object} array  - open and close brackets for String
 *              {String} open  - open bracket for String (Default '[')
 *              {String} close - close bracket for String (Default ']')
 *      {Object} object - open and close brackets for String
 *              {String} open  - open bracket for String (Default '{')
 *              {String} close - close bracket for String (Default '}')
 */
class JSONDecoder {
  constructor (separators, brackets) {
    if (!separators) {
      // Default separators
      this.separators = { value: ',', key: ':' };
    } else {
      // Declare custom separators
      this.separators = separators;
    }

    if (!brackets) {
      // Default default brackets
      this.brackets = {
        string: { open: '"', close: '"' },
        array: { open: '[', close: ']' },
        object: { open: '{', close: '}' }
      }
    } else {
      // Declare custom brackets
      this.brackets = brackets;
    }

    this._hooks = [];  // list of hooks added
  }

  /** 
   * Deserializes serialized string (Unicode characters not supported)
   * 
   * @params {String} str- Any valid serialized string with only ASCII Characters
   * @return {Object}- JSON Object
   *
  */
  decode (str) {
    let ret = this._decode(undefined, str, 0);

    // Validating last index after deserialization should be
    // equal to current Index after deserialization
    if (str.length !== ret[1]) {
      throw new JsonFizzException(
        'Not a valid serialized string, end of string not found')
    }
    return ret[0];  // Deserialized object
  }

  /** 
   * Deserializes serialized string, and updates value using hooks added (reviver)
   * 
   * @params {String} key - Object key
   * @params {String} str - Deserialized String
   * @params {Integer} curIdx - Current cursor position
   * @return {String}- Serialized JSON data
   *
  */
  _decode (key, str, curIdx) {
    let ret = this._iterString(str, curIdx);
    ret[0] = this._reviveUsingHooks(key, ret[0]);
    return ret;
  }

  /** 
   * Iterate over the string and return first valid JS object,
   *
   * Depending on the character and curIdx, it calls different decoders
   * It ignores the white spaces, between valid JS object
   * 
   * @params {String} str - Deserialized String
   * @params {Integer} curIdx - Current cursor position
   * @return {Array}- return first valid JS object and updated current Index
   *      0 - Deserialized first JS object
   *      1 - Updated Current Index
   *
  */
  _iterString (str, curIdx) {

    // Remove white space before value
    curIdx = this._removeWhiteSpace(str, curIdx);

    let curChar = str[curIdx],
      ret;

    if (curChar === this.brackets.string.open) {
      // String
      ret = this.decodeString(str, curIdx)
    } else if ((curChar >= '0' && curChar <= '9') || curChar === '-') {
      // Number
      ret = this.decodeNumber(str, curIdx);
    } else if (curChar === this.brackets.array.open) {
      // Array
      ret = this.decodeArray(str, curIdx)
    } else if (curChar === this.brackets.object.open) {
      // Object
      ret = this.decodeObject(str, curIdx);
    } else if (str.substring(curIdx, curIdx + 4) === 'null') {
      // null
      ret = [null, curIdx + 4];
    } else if (str.substring(curIdx, curIdx + 4) === 'true') {
      // true
      ret = [true, curIdx + 4];
    } else if (str.substring(curIdx, curIdx + 5) === 'false') {
      // false
      ret = [false, curIdx + 5];
    } else {
      // No valid match found
      throw this._invalidCharError(curChar, curIdx);
    }

    // Remove white space after value
    curIdx = this._removeWhiteSpace(str, ret[1]);

    return [ret[0], curIdx];
  }

  /** 
   * Decodes Number
   * 
   * @params {String} str - String
   * @params {Integer} curIdx - Current cursor position
   * @return {Array}- return first valid Number and updated current Index
   *      0 - Deserialized Number
   *      1 - Updated Current Index
  */
  decodeNumber (str, curIdx) {
    /*
        a. group 1 (-)?
            i. In case the number is negative

        b. group 1 (0|[1-9]\d*)
            i. match with 0 (single digit) or any number not starting with zero
           ii. Prevents cases like (001.123, 00213)

        c. group 2 ([\.\d+])?
            i. matches with digits followed by dot
           ii. '?' sign after this ensures it's an optional match (not necessarily a float number)

        d. group 3 ([eE][-+]?\d+)
            i. match in case of exponential representation of number
           ii. [-+]? optional field
          iii. \d'+' ensures there should be atleast one number after exponent
        */
    let numberPattern = /\s*(-)?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?\s*/g;

    // Set starting index of pattern to current index
    numberPattern.lastIndex = curIdx;

    let m = numberPattern.exec(str);
    curIdx = numberPattern.lastIndex;

    if (m === null) {
      // Making sure there is no match after the first match
      // eg. If the number is starting with more than one zero
      throw this._invalidCharError(str[curIdx], curIdx);
    }

    return [parseFloat(m[0]), curIdx];
  }


  /** 
   * Decodes String (Only ASCII String supported, no unicode characters)
   
   * @params {String} str - String to deserialize
   * @params {Integer} curIdx - Current cursor position
   * @return {Array}- return first valid String and updated current Index
   *      0 {String}  - Deserialized String
   *      1 {Number} - Updated Current Index
   *
   */
  decodeString (str, curIdx) {

    let nextChar = '',
      mstr = '';

    curIdx++; // skip first char '"'

    // Search util the end of string
    while (true) {
      nextChar = str[curIdx];

      if (nextChar === this.brackets.string.close) {
        curIdx++;
        break;
      }

      if ( str.substr(curIdx, 2).match(/\\[\"\\\b\f\n\r\t]/g) ) {
        nextChar = str[curIdx + 1];  // Ignores escape characters
        curIdx += 2;
      } else {
        curIdx++;
      }

      mstr += nextChar;
    }

    return [mstr, curIdx];
  }


  /** 
   * Decodes Array, by iterating util it finds the end of the opening bracket
   
   * @params {String} str - String to deserialize
   * @params {Integer} curIdx - Current cursor position
   * @return {Array}- return first valid String and updated current Index
   *      0 {Array}  - Deserialized Array
   *      1 {Number} - Updated Current Index
  */
  decodeArray (str, curIdx) {
    let array = [],
      value;

    curIdx++ // skip opening bracket

    let nextChar = str[curIdx]

    // Empty array
    if (nextChar === this.brackets.array.close) {
      return [array, curIdx + 1]
    }

    // Search util the end of the Array
    while (true) {
      [value, curIdx] = this._decode(array.length, str, curIdx)

      array.push(value)

      nextChar = str[curIdx++]

      if (nextChar === this.brackets.array.close) {
        break
      } else if (nextChar !== this.separators.value) {
        throw this._invalidDelimiter(this.separators.value, curIdx);
      }
    }

    return [array, curIdx]
  }

  /** 
   * Decodes Object, by iterating util it finds the end of the opening bracket
   
   * @params {String} str - String to deserialize
   * @params {Integer} curIdx - Current cursor position
   * @return {Array}- return first valid String and updated current Index
   *      0 {Object} - Deserialized Object
   *      1 {Number} - Updated Current Index
  */
  decodeObject (str, curIdx) {
    let object = {}, key, value;

    curIdx++ // skip opening bracket
    let nextChar = str[curIdx];

    // Empty Object
    if (nextChar === this.brackets.object.close) {
      return [object, curIdx + 1];
    }

    // Search util the end of the object
    while (true) {
      // Get Key
      [key, curIdx] = this._iterString(str, curIdx);

      nextChar = str[curIdx++];

      if (nextChar !== this.separators.key) {
        throw this._invalidDelimiter(this.separators.key, curIdx);
      }

      // Get value
      [value, curIdx] = this._decode(key, str, curIdx);

      object[key] = value;

      nextChar = str[curIdx++];

      if (nextChar === this.brackets.object.close) {
        break;
      } else if (nextChar !== this.separators.value) {
        throw this._invalidDelimiter(this.separators.value, curIdx);
      }
    }

    return [object, curIdx];
  }


/** 
  * Removes white space between uptil the first non white space character found
  * It ignores the white spaces, between valid JS object
  *
  * Depending on the character and curIdx, it calls different decoders
  * 
  * @params {String} str - Deserialized String
  * @params {Integer} curIdx - Current cursor position
  * @return {any}- Valid JS object
  *
  */
  _removeWhiteSpace (str, curIdx) {
    let curChar = str[curIdx++]

    // whitespace character
    while (/\s/.test(curChar)) {
      curChar = str[curIdx++]
    }

    // subtracting 1 to move cursor back to last non space character
    return curIdx - 1;
  }

  /** 
   * Add revivers functions to update value upon deserialization
   * Each function will be key and value, and should return updated value
   *
   * @params {Function} hookFunc - Function receives (key, value)
   * @return {Boolean}
   *
   */
  addHook (hookFunc) {
    if (this._getType(hookFunc) !== 'Function') {
      throw new JsonFizzException(
        'Not a valid hook function',
        {function: hookFunc}
      )
    }

    if (this._hooks.indexOf(hookFunc) === -1) {
      // In case the hook function is already added skip it
      this._hooks.push(hookFunc);
      return true;
    }
    return false;
  }

  /** 
   * Remove reviver
   * 
   * @params {Function} hookFunc - Hook Function to remove
   * @return {Boolean} - True if function is in hooks list else False
  */
  removeHook (hookFunc) {
    let index = this._hooks.indexOf(hookFunc)
    if (index === -1) return false;

    this._hooks.splice(index, 1);
    return true;
  }

  /** 
   * Remove all revivers
   * @return {Boolean} - True
  */
  resetHooks () {
    this._hooks = [];
    return false;
  }

  /** 
   * Updates the value of object after deserialization using hooks
   * 
   * @params {String} key- key of the value to be replaced
   * @params {any} value- value to be replaced
   * @return {any}- updated value after using replacers/hooks
  */
  _reviveUsingHooks (key, value) {
    for (let hook of this._hooks) {
      value = hook(key, value)
    }

    return value
  }

/** 
  * @params {any} obj: Any JS object
  * @return {String}- Returns type of JS object
  */
  _getType (obj) {
    return (obj === undefined)?'Undefined':obj.constructor.name;
  }


  _invalidCharError(char, curIdx) {
    return new JsonFizzException(
        'Invalid character found',
        {position: curIdx, character: char}
      );
  }


  _invalidDelimiter(delimiter, curIdx) {
    return new JsonFizzException("Invalid Delimiter Found",
      {position: curIdx, expecting: delimiter}
    )
  }

}